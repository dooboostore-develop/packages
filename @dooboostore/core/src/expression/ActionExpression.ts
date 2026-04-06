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
// export type ExpressionMarker = { start: string | RegExp; end: string | RegExp }; ///asdasdasd
export type ExpressionMarker = { start: string | RegExp; end: string | RegExp }; ///asdasdasd

export type ExpressionConfig = {
  replace?: ExpressionMarker;
  callReturn?: ExpressionMarker;
  call?: ExpressionMarker;
};

export type ExpressionType = keyof ExpressionConfig;

export type ExpressionResult = {
  id: string;
  type: ExpressionType;
  original: string;
  script: string;
  expressionStart: string;
  expressionEnd: string;
  index?: number;
};

export type GetExpressionConfig = {
  expression?: ExpressionConfig;
};

export type ExpressionFilterOptions = {
  type?: ExpressionType;
};

export const DEFAULT_EXPRESSION_CONFIG: Required<ExpressionConfig> = {
  'callReturn': { start: '{{=', end: '}}' },
  'call': { start: '{{@', end: '}}' },
  'replace': { start: '{{', end: '}}' }
};

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

    const exprConfig = {
      'callReturn': config?.expression?.['callReturn'] || DEFAULT_EXPRESSION_CONFIG['callReturn'],
      'call': config?.expression?.call || DEFAULT_EXPRESSION_CONFIG.call,
      'replace': config?.expression?.replace || DEFAULT_EXPRESSION_CONFIG.replace,
    };

    const types: ExpressionType[] = ['callReturn', 'call', 'replace'];
    types.sort((a, b) => {
      const startFirst = exprConfig[b].start;
      const startLast = exprConfig[a].start;
      const fLength = typeof startFirst ==='string' ? startFirst.length : startFirst.source.length;
      const lLength = typeof startLast ==='string' ? startLast.length : startLast.source.length;
      return fLength - lLength;
    });

    for (const type of types) {
      const marker = exprConfig[type];
      if (marker) {
        this.processExpressionType(type, marker.start, marker.end);
      }
    }

    this.sortExpressionsByPosition();
    this.maskingTemplate = this.currentTemplate;
  }

  private sortExpressionsByPosition(): void {
    this.expressions.forEach(expr => {
      const index = this.originalTemplate.indexOf(expr.original);
      expr.index = index >= 0 ? index : 0;
    });

    this.expressions.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  }

  private processExpressionType(type: ExpressionType, start: string | RegExp, end: string | RegExp): void {
    // const escapedStart = start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // const escapedEnd = end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const getPattern = (v: string | RegExp) => {
      if (v instanceof RegExp) {
        return v.source; // 👈 핵심
      }
      return v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape
    };
    const escapedStart = getPattern(start);
    const escapedEnd = getPattern(end);

    const regex = new RegExp(`${escapedStart}\\s*([\\s\\S]+?)\\s*${escapedEnd}`, 'g');
    let match;

    const valueToMatch = this.currentTemplate;

    while ((match = regex.exec(valueToMatch)) !== null) {
      this.addExpression(match, type);
    }
  }

  private addExpression(match: RegExpExecArray, type: ExpressionType): void {
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
      expressionEnd
    });
  }

  replace(id: string, value: string): string;
  replace(expr: ExpressionResult, value: string): string;
  replace(id: string, callback: (expr: ExpressionResult) => string): string;
  replace(expr: ExpressionResult, callback: (expr: ExpressionResult) => string): string;
  replace(idOrExpr: string | ExpressionResult, valueOrCallback: string | ((expr: ExpressionResult) => string)): string {
    const id = typeof idOrExpr === 'string' ? idOrExpr : idOrExpr.id;

    let expr: ExpressionResult | undefined;
    if (typeof valueOrCallback === 'function') {
      expr = this.expressions.find(e => e.id === id);
      if (!expr) return this.getUnprocessedTemplate();
    }

    const value = typeof valueOrCallback === 'function' ? valueOrCallback(expr!) : valueOrCallback;

    const marker = this.idToMarker.get(id);
    if (marker) {
      this.processedIds.add(id);
      this.currentTemplate = this.currentTemplate.replace(marker, value);
    }

    return this.getUnprocessedTemplate();
  }

  getExpressions(): ExpressionResult[];
  getExpressions(type: ExpressionType): ExpressionResult[];
  getExpressions(options: ExpressionFilterOptions): ExpressionResult[];
  getExpressions(typeOrOptions?: ExpressionType | ExpressionFilterOptions): ExpressionResult[] {
    if (!typeOrOptions) {
      return this.expressions;
    }
    if (typeof typeOrOptions === 'string') {
      return this.expressions.filter(expr => expr.type === typeOrOptions);
    }
    const options = typeOrOptions as ExpressionFilterOptions;
    return this.expressions.filter(expr => {
      if (options.type && expr.type !== options.type) return false;
      return true;
    });
  }

  getFirstExpression(): ExpressionResult | undefined;
  getFirstExpression(type: ExpressionType): ExpressionResult | undefined;
  getFirstExpression(options: ExpressionFilterOptions): ExpressionResult | undefined;
  getFirstExpression(typeOrOptions?: ExpressionType | ExpressionFilterOptions): ExpressionResult | undefined {
    if (!typeOrOptions) {
      return this.getExpressions()[0];
    }
    if (typeof typeOrOptions === 'string') {
      return this.getExpressions(typeOrOptions)[0];
    }
    return this.getExpressions(typeOrOptions as ExpressionFilterOptions)[0];
  }

  getOriginalTemplate(): string { return this.originalTemplate; }
  getMaskingTemplate(): string { return this.maskingTemplate; }
  getCurrentTemplate(): string { return this.currentTemplate; }

  toResult(): string {
    return this.getUnprocessedTemplate();
  }
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
