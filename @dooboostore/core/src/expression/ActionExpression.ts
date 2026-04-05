/**
 * ActionExpression - Dynamic expression detection and processing system
 * Supports multiple expression syntaxes: {{ }}, {{= }}, {{@ }}
 * Also supports custom wrap expressions via config
 */

/**
 * 표현식의 타입을 정의합니다.
 * - 'replace': {{ script }} - 문자열 치환
 * - 'call-return': {{= script }} - 함수 호출 후 반환값 사용
 * - 'call': {{@ script }} - 함수 호출만 수행 (반환값 무시)
 */
export type ExpressionType = 'replace' | 'call-return' | 'call';

export type ExpressionResult = {
  id: string;
  type: ExpressionType;
  original: string;
  script: string;
  expressionStart: string;
  expressionEnd: string;
  wrap?: string;
  index?: number; // 원본 문자열에서의 위치
};

export type GetExpressionConfig = {
  wrapExpression?: string;
};

/**
 * getExpressions 필터링 옵션
 * type과 wrap을 조합하여 사용 가능
 */
export type ExpressionFilterOptions = {
  type?: ExpressionType;
  wrap?: string;
};

/**
 * ActionExpression Class - Dynamic expression detection and processing
 * 
 * Supported expression types:
 * - {{ script }} - String replacement (type: 'replace')
 * - {{= script }} - Call-return (type: 'call-return')
 * - {{@ script }} - Call/void (type: 'call')
 * 
 * With config.wrapExpression, you can also use custom wrappers:
 * - @{{ script }}@ (wrap: '@', type: 'replace')
 * - @{{= script }}@ (wrap: '@', type: 'call-return')
 * - @{{@ script }}@ (wrap: '@', type: 'call')
 * 
 * @example
 * const ae = new ActionExpression('Hello {{ name }}');
 * const result = ae.replace('id123', 'John');
 * console.log(result); // 'Hello John'
 */
export class ActionExpression {
  private originalTemplate: string;
  private maskingTemplate: string;
  private expressions: ExpressionResult[];
  private idToMarker: Map<string, string>;
  private processedIds: Set<string>;
  private currentTemplate: string;

  constructor(value: string, config?: GetExpressionConfig) {
    this.originalTemplate = value || '';
    this.idToMarker = new Map();
    this.processedIds = new Set();
    this.expressions = [];
    
    if (!value || typeof value !== 'string') {
      this.maskingTemplate = this.originalTemplate;
      this.currentTemplate = this.originalTemplate;
      return;
    }

    this.maskingTemplate = value;
    this.currentTemplate = value;

    // 사용자 정의 wrap expression 처리
    if (config?.wrapExpression) {
      this.processWrapExpressions(this.currentTemplate, config.wrapExpression);
    }

    // 기본 표현식들 처리 (wrap expression과 함께 처리 가능)
    this.processCallReturnExpressions(this.currentTemplate);
    this.processCallExpressions(this.currentTemplate);
    this.processReplaceExpressions(this.currentTemplate);

    // 원본 문자열에서의 위치로 정렬
    this.sortExpressionsByPosition();

    // 초기 마스킹 템플릿 설정
    this.maskingTemplate = this.currentTemplate;
  }

  private sortExpressionsByPosition(): void {
    this.expressions.forEach(expr => {
      const index = this.originalTemplate.indexOf(expr.original);
      expr.index = index >= 0 ? index : 0;
    });
    
    this.expressions.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  }

  private processWrapExpressions(value: string, wrapExpression: string): void {
    const wrapChar = wrapExpression.trim();
    const escapedWrap = wrapChar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // @{{= script }}@ 패턴 - 가장 구체적부터 시작
    const wrappedCallReturnRegex = new RegExp(`${escapedWrap}\\{\\{=\\s*(.+?)\\s*\\}\\}${escapedWrap}`, 'g');
    let match;

    while ((match = wrappedCallReturnRegex.exec(value)) !== null) {
      this.addExpression(match, 'call-return', wrapChar);
    }

    // @{{@ script }}@ 패턴
    const wrappedCallRegex = new RegExp(`${escapedWrap}\\{\\{@\\s*(.+?)\\s*\\}\\}${escapedWrap}`, 'g');
    while ((match = wrappedCallRegex.exec(value)) !== null) {
      this.addExpression(match, 'call', wrapChar);
    }

    // @{{ script }}@ 패턴 - {{ 뒤에 = 또는 @ 없는 경우
    const wrappedReplaceRegex = new RegExp(`${escapedWrap}\\{\\{(?![=@])\\s*(.+?)\\s*\\}\\}${escapedWrap}`, 'g');
    while ((match = wrappedReplaceRegex.exec(value)) !== null) {
      this.addExpression(match, 'replace', wrapChar);
    }
  }

  private processCallReturnExpressions(value: string): void {
    const callReturnRegex = /(?<![a-zA-Z0-9$_@#.])\{\{=\s*(.+?)\s*\}\}(?![a-zA-Z0-9$_@#.])/g;
    let match;

    while ((match = callReturnRegex.exec(value)) !== null) {
      this.addExpression(match, 'call-return');
    }
  }

  private processCallExpressions(value: string): void {
    const callRegex = /(?<![a-zA-Z0-9$_@#.])\{\{@\s*(.+?)\s*\}\}(?![a-zA-Z0-9$_@#.])/g;
    let match;

    while ((match = callRegex.exec(value)) !== null) {
      this.addExpression(match, 'call');
    }
  }

  private processReplaceExpressions(value: string): void {
    // {{ 뒤에 = 또는 @ 없는 경우만 매칭
    // 앞뒤로 특수 문자가 없는 경우만 (다른 wrap expression과 구분)
    const replaceRegex = /(?<![a-zA-Z0-9$_@#.])\{\{(?![=@])\s*(.+?)\s*\}\}(?![a-zA-Z0-9$_@#.])/g;
    let match;

    while ((match = replaceRegex.exec(value)) !== null) {
      this.addExpression(match, 'replace');
    }
  }

  private addExpression(match: RegExpExecArray, type: ExpressionType, wrap?: string): void {
    const id = Math.random().toString(36).substr(2, 9);
    const original = match[0];
    const rawScript = match[1];
    const marker = `__EXPR_${id}__`;

    const expressionStart = original.substring(0, original.indexOf(rawScript));
    const expressionEnd = original.substring(original.indexOf(rawScript) + rawScript.length);

    this.idToMarker.set(id, marker);
    this.currentTemplate = this.currentTemplate.replace(original, marker);

    this.expressions.push({
      id,
      type,
      original,
      script: rawScript.trim(),
      expressionStart,
      expressionEnd,
      ...(wrap && { wrap })
    });
  }

  /**
   * 특정 id의 표현식을 주어진 값으로 치환합니다.
   * 미처리된 표현식들은 원본 형태로 유지됩니다.
   * 
   * @overload
   * @param id - 표현식의 id
   * @param value - 치환할 값
   * @returns 현재 상태의 처리된 템플릿 문자열
   */
  replace(id: string, value: string): string;
  
  /**
   * ExpressionResult 객체로 표현식을 치환합니다.
   * 
   * @overload
   * @param expr - ExpressionResult 객체
   * @param value - 치환할 값
   * @returns 현재 상태의 처리된 템플릿 문자열
   */
  replace(expr: ExpressionResult, value: string): string;
  
  /**
   * 콜백 함수로 동적으로 값을 결정하여 치환합니다.
   * 
   * @overload
   * @param id - 표현식의 id
   * @param callback - 표현식 결과에서 값을 결정하는 함수
   * @returns 현재 상태의 처리된 템플릿 문자열
   */
  replace(id: string, callback: (expr: ExpressionResult) => string): string;
  
  /**
   * ExpressionResult 객체와 콜백 함수로 치환합니다.
   * 
   * @overload
   * @param expr - ExpressionResult 객체
   * @param callback - 표현식 결과에서 값을 결정하는 함수
   * @returns 현재 상태의 처리된 템플릿 문자열
   */
  replace(expr: ExpressionResult, callback: (expr: ExpressionResult) => string): string;
  
  /**
   * 구현 메서드
   */
  replace(
    idOrExpr: string | ExpressionResult,
    valueOrCallback: string | ((expr: ExpressionResult) => string)
  ): string {
    // id 추출
    const id = typeof idOrExpr === 'string' ? idOrExpr : idOrExpr.id;
    
    // ExpressionResult 객체 찾기 (콜백인 경우 필요)
    let expr: ExpressionResult | undefined;
    if (typeof valueOrCallback === 'function') {
      expr = this.expressions.find(e => e.id === id);
      if (!expr) return this.getUnprocessedTemplate();
    }
    
    // 값 결정
    const value = typeof valueOrCallback === 'function' 
      ? valueOrCallback(expr!)
      : valueOrCallback;

    const marker = this.idToMarker.get(id);
    if (marker) {
      this.processedIds.add(id);
      this.currentTemplate = this.currentTemplate.replace(marker, value);
    }

    // 호출할 때마다 미처리된 마커들을 원본으로 복원하여 반환
    return this.getUnprocessedTemplate();
  }

  /**
   * 모든 표현식 목록을 반환합니다.
   * 
   * @overload
   * @returns 모든 표현식 목록
   */
  getExpressions(): ExpressionResult[];
  
  /**
   * 특정 타입의 표현식만 필터링해서 반환합니다.
   * 
   * @overload
   * @param type - 필터링할 표현식 타입
   * @returns 해당 타입의 표현식 목록
   */
  getExpressions(type: ExpressionType): ExpressionResult[];
  
  /**
   * 필터링 옵션으로 표현식을 필터링해서 반환합니다.
   * type과 wrap을 조합하여 사용 가능합니다.
   * 
   * @overload
   * @param options - 필터링 옵션 { type?, wrap? }
   * @returns 필터링된 표현식 목록
   */
  getExpressions(options: ExpressionFilterOptions): ExpressionResult[];
  
  /**
   * 구현 메서드
   */
  getExpressions(typeOrOptions?: ExpressionType | ExpressionFilterOptions): ExpressionResult[] {
    // 파라미터 없음 - 모든 표현식 반환
    if (!typeOrOptions) {
      return this.expressions;
    }

    // ExpressionType (string) - type으로만 필터링
    if (typeof typeOrOptions === 'string') {
      return this.expressions.filter(expr => expr.type === typeOrOptions);
    }

    // ExpressionFilterOptions (object) - type과 wrap으로 필터링
    // 'wrap' in options로 wrap이 명시적으로 지정되었는지 확인
    const options = typeOrOptions as ExpressionFilterOptions;
    return this.expressions.filter(expr => {
      if (options.type && expr.type !== options.type) return false;
      if ('wrap' in options && expr.wrap !== options.wrap) return false;
      return true;
    });
  }

  /**
   * 첫 번째 표현식을 반환합니다.
   * 
   * @overload
   * @returns 첫 번째 표현식, 없으면 undefined
   */
  getFirstExpression(): ExpressionResult | undefined;
  
  /**
   * 특정 타입의 첫 번째 표현식을 반환합니다.
   * 
   * @overload
   * @param type - 필터링할 표현식 타입
   * @returns 첫 번째 표현식, 없으면 undefined
   */
  getFirstExpression(type: ExpressionType): ExpressionResult | undefined;
  
  /**
   * 필터링 옵션으로 첫 번째 표현식을 반환합니다.
   * 
   * @overload
   * @param options - 필터링 옵션 { type?, wrap? }
   * @returns 첫 번째 표현식, 없으면 undefined
   */
  getFirstExpression(options: ExpressionFilterOptions): ExpressionResult | undefined;
  
  /**
   * 구현 메서드
   */
  getFirstExpression(typeOrOptions?: ExpressionType | ExpressionFilterOptions): ExpressionResult | undefined {
    if (!typeOrOptions) {
      return this.getExpressions()[0];
    }
    if (typeof typeOrOptions === 'string') {
      return this.getExpressions(typeOrOptions)[0];
    }
    return this.getExpressions(typeOrOptions as ExpressionFilterOptions)[0];
  }

  /**
   * 원본 템플릿을 반환합니다.
   */
  getOriginalTemplate(): string {
    return this.originalTemplate;
  }

  /**
   * 마스킹 처리된 템플릿을 반환합니다.
   */
  getMaskingTemplate(): string {
    return this.maskingTemplate;
  }

  /**
   * 현재 처리 상태의 템플릿을 반환합니다.
   */
  getCurrentTemplate(): string {
    return this.currentTemplate;
  }

  /**
   * 미처리된 마커들을 원본으로 복원한 템플릿을 반환합니다.
   * replace() 호출 후 처리되지 않은 표현식들을 원본 형태로 되돌립니다.
   */
  getUnprocessedTemplate(): string {
    let result = this.currentTemplate;
    for (const expr of this.expressions) {
      if (!this.processedIds.has(expr.id)) {
        const m = this.idToMarker.get(expr.id);
        if (m) {
          result = result.replace(m, expr.original);
        }
      }
    }
    return result;
  }
}

/**
 * 함수형 API (레거시 호환성)
 * 클래스 기반 사용을 권장합니다.
 */
export type GetExpressionResult = {
  originalTemplate: string;
  maskingTemplate: string;
  expressions: ExpressionResult[];
  replace: (id: string, value: string) => string;
};

export function getExpression(value: string, config?: GetExpressionConfig): GetExpressionResult {
  const ae = new ActionExpression(value, config);

  return {
    originalTemplate: ae.getOriginalTemplate(),
    maskingTemplate: ae.getMaskingTemplate(),
    expressions: ae.getExpressions(),
    replace: (id: string, value: string) => ae.replace(id, value)
  };
}

