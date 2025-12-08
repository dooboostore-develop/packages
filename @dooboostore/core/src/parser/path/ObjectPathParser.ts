/**
 * ObjectPathParser - JavaScript 경로 표현식을 파싱하고 Optional Chaining으로 변환하는 파서
 * 
 * 트리 구조의 토큰을 생성하여 계층적 표현식을 지원
 * 
 * 사용법:
 * const parser = new ObjectPathParser('this.obj.func(a.b[0])');
 * const root = parser.getRoot();
 * root.children.forEach(child => console.log(child.type));
 */

// --- Token Types ---
export enum TokenType {
  // Leaf tokens
  IDENTIFIER = 'identifier',
  STRING = 'string',
  NUMBER = 'number',
  TEMPLATE_LITERAL = 'template_literal',
  OPERATOR = 'operator',
  WHITESPACE = 'whitespace',
  
  // Structural tokens (can have children)
  MEMBER_EXPRESSION = 'member_expression',
  PROPERTY_ACCESS = 'property_access',
  BRACKET_ACCESS = 'bracket_access',
  FUNCTION_CALL = 'function_call',
  PARENTHESIZED = 'parenthesized',
  OBJECT_LITERAL = 'object_literal',
  ARRAY_LITERAL = 'array_literal',
  TERNARY = 'ternary',
  BINARY = 'binary',
  
  // Root
  ROOT = 'root',
  EOF = 'eof',
}

// --- Base Token Class ---
export class Token {
  public type: TokenType;
  public value: string;
  public start: number;
  public end: number;
  public parent: Token | null = null;
  public children: Token[] = [];
  public isOptional: boolean = false;
  // 연산자 주변 공백 보존용
  public leftSpace: string = '';
  public rightSpace: string = '';

  constructor(type: TokenType, value: string, start: number, end: number) {
    this.type = type;
    this.value = value;
    this.start = start;
    this.end = end;
  }

  // --- Child management ---
  addChild(child: Token): this {
    child.parent = this;
    this.children.push(child);
    return this;
  }

  getChildren(): Token[] {
    return this.children;
  }

  hasChildren(): boolean {
    return this.children.length > 0;
  }

  getParent(): Token | null {
    return this.parent;
  }

  // --- Type checks ---
  isIdentifier(): boolean { return this.type === TokenType.IDENTIFIER; }
  isString(): boolean { return this.type === TokenType.STRING; }
  isNumber(): boolean { return this.type === TokenType.NUMBER; }
  isTemplateLiteral(): boolean { return this.type === TokenType.TEMPLATE_LITERAL; }
  isOperator(): boolean { return this.type === TokenType.OPERATOR; }
  isWhitespace(): boolean { return this.type === TokenType.WHITESPACE; }
  isMemberExpression(): boolean { return this.type === TokenType.MEMBER_EXPRESSION; }
  isPropertyAccess(): boolean { return this.type === TokenType.PROPERTY_ACCESS; }
  isBracketAccess(): boolean { return this.type === TokenType.BRACKET_ACCESS; }
  isFunctionCall(): boolean { return this.type === TokenType.FUNCTION_CALL; }
  isParenthesized(): boolean { return this.type === TokenType.PARENTHESIZED; }
  isObjectLiteral(): boolean { return this.type === TokenType.OBJECT_LITERAL; }
  isArrayLiteral(): boolean { return this.type === TokenType.ARRAY_LITERAL; }
  isTernary(): boolean { return this.type === TokenType.TERNARY; }
  isBinary(): boolean { return this.type === TokenType.BINARY; }
  isRoot(): boolean { return this.type === TokenType.ROOT; }
  isEOF(): boolean { return this.type === TokenType.EOF; }

  // --- Keyword check for identifiers ---
  isKeyword(): boolean {
    if (this.type !== TokenType.IDENTIFIER) return false;
    return ['true', 'false', 'null', 'undefined', 'this', 'window', 'document'].includes(this.value);
  }

  // --- Operator checks ---
  isLogicalOperator(): boolean {
    return this.type === TokenType.OPERATOR && (this.value === '||' || this.value === '&&');
  }

  isNullishOperator(): boolean {
    return this.type === TokenType.OPERATOR && this.value === '??';
  }

  isComparisonOperator(): boolean {
    return this.type === TokenType.OPERATOR && 
      ['===', '!==', '==', '!=', '<', '>', '<=', '>='].includes(this.value);
  }

  isArithmeticOperator(): boolean {
    return this.type === TokenType.OPERATOR && ['+', '-', '*', '/', '%'].includes(this.value);
  }

  // --- Stringify ---
  stringify(): string {
    if (this.children.length === 0) {
      return this.value;
    }
    return this.children.map(c => c.stringify()).join('');
  }

  // --- Optional chain conversion ---
  toOptionalChain(isFirst: boolean = false): string {
    switch (this.type) {
      case TokenType.PROPERTY_ACCESS:
        return `?.${this.children.map(c => c.toOptionalChain()).join('')}`;
      
      case TokenType.BRACKET_ACCESS:
        // 첫 번째 요소인 경우 ?. 추가하지 않음
        if (isFirst) {
          return `[${this.children.map(c => c.toOptionalChain()).join('')}]`;
        }
        return `?.[${this.children.map(c => c.toOptionalChain()).join('')}]`;
      
      case TokenType.FUNCTION_CALL:
        return `?.(${this.children.map(c => c.toOptionalChain()).join('')})`;
      
      case TokenType.MEMBER_EXPRESSION:
        if (this.children.length === 0) return this.value;
        let result = '';
        for (let i = 0; i < this.children.length; i++) {
          const child = this.children[i];
          // 첫 번째 자식에게 isFirst=true 전달
          result += child.toOptionalChain(i === 0);
        }
        return result;

      case TokenType.PARENTHESIZED:
        // isOptional이 설정되어 있으면 ?. 접근으로 처리
        if (this.isOptional) {
          return `?.(${this.children.map(c => c.toOptionalChain()).join('')})`;
        }
        // 부모가 MEMBER_EXPRESSION이고 첫 번째 자식이 아니면 ?. 추가
        if (this.parent?.type === TokenType.MEMBER_EXPRESSION && !isFirst) {
          return `?.(${this.children.map(c => c.toOptionalChain()).join('')})`;
        }
        return `(${this.children.map(c => c.toOptionalChain()).join('')})`;
      
      case TokenType.TERNARY:
        // children: [condition, trueBranch, falseBranch]
        if (this.children.length >= 3) {
          return `${this.children[0].toOptionalChain()} ? ${this.children[1].toOptionalChain()} : ${this.children[2].toOptionalChain()}`;
        }
        return this.stringify();
      
      case TokenType.BINARY:
        // children: [left, right], value contains operator
        if (this.children.length >= 2) {
          const op = this.value;
          // 원본 공백 보존
          const leftSp = this.leftSpace;
          const rightSp = this.rightSpace;
          return `${this.children[0].toOptionalChain()}${leftSp}${op}${rightSp}${this.children[1].toOptionalChain()}`;
        }
        return this.stringify();
      
      case TokenType.ROOT:
        return this.children.map(c => c.toOptionalChain()).join('');
      
      case TokenType.OBJECT_LITERAL:
      case TokenType.ARRAY_LITERAL:
      case TokenType.STRING:
      case TokenType.NUMBER:
      case TokenType.TEMPLATE_LITERAL:
        return this.value;
      
      case TokenType.OPERATOR:
        // Unary operator with children (e.g., !expr)
        if (this.children.length > 0) {
          return `${this.value}${this.children.map(c => c.toOptionalChain()).join('')}`;
        }
        return this.value;
      
      default:
        return this.value;
    }
  }

  // --- Tree traversal ---
  walk(callback: (token: Token, depth: number) => void, depth: number = 0): void {
    callback(this, depth);
    for (const child of this.children) {
      child.walk(callback, depth + 1);
    }
  }

  find(predicate: (token: Token) => boolean): Token | null {
    if (predicate(this)) return this;
    for (const child of this.children) {
      const found = child.find(predicate);
      if (found) return found;
    }
    return null;
  }

  findAll(predicate: (token: Token) => boolean): Token[] {
    const results: Token[] = [];
    this.walk((token) => {
      if (predicate(token)) results.push(token);
    });
    return results;
  }
}


// --- ObjectPathParser Class ---
export class ObjectPathParser {
  private input: string;
  private pos: number = 0;
  private root: Token;

  constructor(input: string = '') {
    this.input = input;
    this.root = new Token(TokenType.ROOT, '', 0, input.length);
    if (input) {
      this.parse();
    }
  }

  // --- Getters ---
  getInput(): string {
    return this.input;
  }

  getRoot(): Token {
    return this.root;
  }

  getTokens(): Token[] {
    return this.root.children;
  }

  // --- Flat token list (for backward compatibility) ---
  getFlatTokens(): Token[] {
    const tokens: Token[] = [];
    this.root.walk((token) => {
      if (token.type !== TokenType.ROOT) {
        tokens.push(token);
      }
    });
    return tokens;
  }

  // --- Helper methods ---
  isFunctionScript(): boolean {
    return this.input.trim().startsWith('function');
  }

  isArrowFunctionScript(): boolean {
    return /^\s*\([^)]*\)\s*=>/.test(this.input);
  }

  isObjectLiteralInput(): boolean {
    const trimmed = this.input.trim();
    return trimmed.startsWith('{') && trimmed.endsWith('}');
  }


  // --- Tokenizer helpers ---
  private peek(offset: number = 0): string {
    return this.input[this.pos + offset] || '';
  }

  private advance(): string {
    return this.input[this.pos++] || '';
  }

  private isEOF(): boolean {
    return this.pos >= this.input.length;
  }

  private skipWhitespace(): void {
    while (!this.isEOF() && /\s/.test(this.peek())) {
      this.advance();
    }
  }

  // --- Main parse method ---
  private parse(): void {
    this.pos = 0;
    this.root = new Token(TokenType.ROOT, '', 0, this.input.length);
    
    while (!this.isEOF()) {
      this.skipWhitespace();
      if (this.isEOF()) break;
      
      const token = this.parseExpression();
      if (token) {
        this.root.addChild(token);
      }
    }
  }

  private parseExpression(): Token | null {
    this.skipWhitespace();
    if (this.isEOF()) return null;

    // Check for ternary operator at top level
    const ternary = this.tryParseTernary();
    if (ternary) return ternary;

    // Check for binary operators
    const binary = this.tryParseBinary();
    if (binary) return binary;

    // Parse primary expression (member expression, literal, etc.)
    return this.parsePrimaryExpression();
  }


  private parsePrimaryExpression(): Token | null {
    this.skipWhitespace();
    if (this.isEOF()) return null;

    const start = this.pos;
    const char = this.peek();

    // String literal
    if (char === "'" || char === '"') {
      return this.parseString(char);
    }

    // Template literal
    if (char === '`') {
      return this.parseTemplateLiteral();
    }

    // Object literal
    if (char === '{') {
      return this.parseObjectLiteral();
    }

    // Array literal or bracket access at start
    if (char === '[') {
      return this.parseArrayOrBracket();
    }

    // Parenthesized expression
    if (char === '(') {
      return this.parseParenthesized();
    }

    // Number
    if (/\d/.test(char)) {
      return this.parseNumber();
    }

    // Identifier (start of member expression)
    if (/[a-zA-Z_$]/.test(char)) {
      return this.parseMemberExpression();
    }

    // Unary NOT operator (!)
    if (char === '!') {
      return this.parseUnaryNot();
    }

    // Operator
    if (this.isOperatorChar(char)) {
      return this.parseOperator();
    }

    // Unknown - skip
    this.advance();
    return null;
  }

  // Parse unary NOT operator (!expr)
  private parseUnaryNot(): Token {
    const start = this.pos;
    this.advance(); // consume !
    
    this.skipWhitespace();
    
    // Parse the expression after !
    const expr = this.parsePrimaryExpression();
    if (expr) {
      // Create a unary token that wraps the expression
      const unary = new Token(TokenType.OPERATOR, '!', start, this.pos);
      unary.addChild(expr);
      return unary;
    }
    
    return new Token(TokenType.OPERATOR, '!', start, this.pos);
  }


  private parseMemberExpression(): Token {
    const start = this.pos;
    const memberExpr = new Token(TokenType.MEMBER_EXPRESSION, '', start, start);

    // Parse the base identifier
    const identifier = this.parseIdentifier();
    memberExpr.addChild(identifier);

    // Parse chain of accesses
    while (!this.isEOF()) {
      const char = this.peek();

      // Optional chaining: ?.
      if (char === '?' && this.peek(1) === '.') {
        this.advance(); this.advance(); // consume ?.
        
        if (this.peek() === '[') {
          // ?.[
          const bracket = this.parseBracketAccess(true);
          memberExpr.addChild(bracket);
        } else if (this.peek() === '(') {
          // ?.(
          const funcCall = this.parseFunctionCall(true);
          memberExpr.addChild(funcCall);
        } else {
          // ?.property
          const prop = this.parsePropertyAccess(true);
          memberExpr.addChild(prop);
        }
      }
      // Regular dot access
      else if (char === '.') {
        this.advance(); // consume .
        // Check if next is parenthesis (e.g., a.(b).c)
        if (this.peek() === '(') {
          const paren = this.parseParenthesizedAccess(false);
          memberExpr.addChild(paren);
        } else {
          const prop = this.parsePropertyAccess(false);
          memberExpr.addChild(prop);
        }
      }
      // Bracket access
      else if (char === '[') {
        const bracket = this.parseBracketAccess(false);
        memberExpr.addChild(bracket);
      }
      // Function call
      else if (char === '(') {
        const funcCall = this.parseFunctionCall(false);
        memberExpr.addChild(funcCall);
      }
      else {
        break;
      }
    }

    memberExpr.end = this.pos;
    memberExpr.value = this.input.substring(start, this.pos);
    return memberExpr;
  }

  // 괄호로 감싸진 속성 접근 (e.g., a.(b).c)
  private parseParenthesizedAccess(isOptional: boolean): Token {
    const start = this.pos;
    this.advance(); // consume (
    
    const paren = new Token(TokenType.PARENTHESIZED, '', start, start);
    paren.isOptional = isOptional;
    
    let depth = 1;
    let content = '';
    
    while (!this.isEOF() && depth > 0) {
      const char = this.peek();
      if (char === '(') depth++;
      else if (char === ')') {
        depth--;
        if (depth === 0) break;
      }
      content += this.advance();
    }
    
    if (content.trim()) {
      const innerParser = new ObjectPathParser(content);
      for (const child of innerParser.getTokens()) {
        paren.addChild(child);
      }
    }
    
    if (this.peek() === ')') this.advance(); // consume )
    
    paren.end = this.pos;
    paren.value = this.input.substring(start, this.pos);
    return paren;
  }


  private parseIdentifier(): Token {
    const start = this.pos;
    let value = '';
    while (!this.isEOF() && /[a-zA-Z0-9_$]/.test(this.peek())) {
      value += this.advance();
    }
    return new Token(TokenType.IDENTIFIER, value, start, this.pos);
  }

  private parsePropertyAccess(isOptional: boolean): Token {
    const start = this.pos;
    const prop = new Token(TokenType.PROPERTY_ACCESS, '', start, start);
    prop.isOptional = isOptional;
    
    const identifier = this.parseIdentifier();
    prop.addChild(identifier);
    
    prop.end = this.pos;
    prop.value = this.input.substring(start, this.pos);
    return prop;
  }

  private parseBracketAccess(isOptional: boolean): Token {
    const start = this.pos;
    this.advance(); // consume [
    
    const bracket = new Token(TokenType.BRACKET_ACCESS, '', start, start);
    bracket.isOptional = isOptional;
    
    // Parse content inside brackets
    const contentStart = this.pos;
    let depth = 1;
    let content = '';
    
    while (!this.isEOF() && depth > 0) {
      const char = this.peek();
      if (char === '[') depth++;
      else if (char === ']') {
        depth--;
        if (depth === 0) break;
      }
      content += this.advance();
    }
    
    // Parse the content as expression
    if (content.trim()) {
      const innerParser = new ObjectPathParser(content);
      for (const child of innerParser.getTokens()) {
        bracket.addChild(child);
      }
    }
    
    if (this.peek() === ']') this.advance(); // consume ]
    
    bracket.end = this.pos;
    bracket.value = this.input.substring(start, this.pos);
    return bracket;
  }


  private parseFunctionCall(isOptional: boolean): Token {
    const start = this.pos;
    this.advance(); // consume (
    
    const funcCall = new Token(TokenType.FUNCTION_CALL, '', start, start);
    funcCall.isOptional = isOptional;
    
    // Parse arguments
    let depth = 1;
    let content = '';
    
    while (!this.isEOF() && depth > 0) {
      const char = this.peek();
      if (char === '(') depth++;
      else if (char === ')') {
        depth--;
        if (depth === 0) break;
      }
      content += this.advance();
    }
    
    // Parse arguments as expressions
    if (content.trim()) {
      const innerParser = new ObjectPathParser(content);
      for (const child of innerParser.getTokens()) {
        funcCall.addChild(child);
      }
    }
    
    if (this.peek() === ')') this.advance(); // consume )
    
    funcCall.end = this.pos;
    funcCall.value = this.input.substring(start, this.pos);
    return funcCall;
  }

  private parseParenthesized(): Token {
    const start = this.pos;
    this.advance(); // consume (
    
    const paren = new Token(TokenType.PARENTHESIZED, '', start, start);
    
    let depth = 1;
    let content = '';
    
    while (!this.isEOF() && depth > 0) {
      const char = this.peek();
      if (char === '(') depth++;
      else if (char === ')') {
        depth--;
        if (depth === 0) break;
      }
      content += this.advance();
    }
    
    if (content.trim()) {
      const innerParser = new ObjectPathParser(content);
      for (const child of innerParser.getTokens()) {
        paren.addChild(child);
      }
    }
    
    if (this.peek() === ')') this.advance(); // consume )
    
    paren.end = this.pos;
    paren.value = this.input.substring(start, this.pos);
    
    // Check if followed by member access (e.g., (expr).prop or (expr)[0] or (expr)?.prop)
    if (this.peek() === '.' || this.peek() === '[' || (this.peek() === '?' && this.peek(1) === '.')) {
      const memberExpr = new Token(TokenType.MEMBER_EXPRESSION, '', start, start);
      memberExpr.addChild(paren);
      
      while (!this.isEOF()) {
        const char = this.peek();
        // Optional chaining: ?.
        if (char === '?' && this.peek(1) === '.') {
          this.advance(); this.advance(); // consume ?.
          if (this.peek() === '[') {
            const bracket = this.parseBracketAccess(true);
            memberExpr.addChild(bracket);
          } else if (this.peek() === '(') {
            const funcCall = this.parseFunctionCall(true);
            memberExpr.addChild(funcCall);
          } else {
            const prop = this.parsePropertyAccess(true);
            memberExpr.addChild(prop);
          }
        } else if (char === '.') {
          this.advance(); // consume .
          if (this.peek() === '(') {
            const parenAccess = this.parseParenthesizedAccess(false);
            memberExpr.addChild(parenAccess);
          } else {
            const prop = this.parsePropertyAccess(false);
            memberExpr.addChild(prop);
          }
        } else if (char === '[') {
          const bracket = this.parseBracketAccess(false);
          memberExpr.addChild(bracket);
        } else {
          break;
        }
      }
      
      memberExpr.end = this.pos;
      memberExpr.value = this.input.substring(start, this.pos);
      return memberExpr;
    }
    
    return paren;
  }


  private parseString(quote: string): Token {
    const start = this.pos;
    let value = this.advance(); // opening quote
    
    while (!this.isEOF() && this.peek() !== quote) {
      if (this.peek() === '\\') {
        value += this.advance();
        if (!this.isEOF()) value += this.advance();
      } else {
        value += this.advance();
      }
    }
    
    if (!this.isEOF()) value += this.advance(); // closing quote
    
    return new Token(TokenType.STRING, value, start, this.pos);
  }

  private parseTemplateLiteral(): Token {
    const start = this.pos;
    let value = this.advance(); // opening `
    let depth = 0;
    
    while (!this.isEOF()) {
      const char = this.peek();
      
      if (char === '`' && depth === 0) {
        value += this.advance();
        break;
      }
      
      // Handle ${...} expressions - process them for optional chaining
      if (char === '$' && this.peek(1) === '{') {
        value += this.advance(); // $
        value += this.advance(); // {
        depth++;
        
        // Collect the expression inside ${...}
        let exprContent = '';
        let exprDepth = 1;
        while (!this.isEOF() && exprDepth > 0) {
          const c = this.peek();
          if (c === '{') exprDepth++;
          else if (c === '}') {
            exprDepth--;
            if (exprDepth === 0) break;
          }
          exprContent += this.advance();
        }
        
        // Process the expression for optional chaining
        if (exprContent.trim()) {
          const innerParser = new ObjectPathParser(exprContent);
          value += innerParser.toOptionalChainPath();
        }
        
        if (this.peek() === '}') {
          value += this.advance(); // }
          depth--;
        }
        continue;
      }
      
      if (char === '\\') {
        value += this.advance();
        if (!this.isEOF()) value += this.advance();
      } else {
        value += this.advance();
      }
    }
    
    return new Token(TokenType.TEMPLATE_LITERAL, value, start, this.pos);
  }

  private parseNumber(): Token {
    const start = this.pos;
    let value = '';
    while (!this.isEOF() && /[\d.]/.test(this.peek())) {
      value += this.advance();
    }
    return new Token(TokenType.NUMBER, value, start, this.pos);
  }


  private parseObjectLiteral(): Token {
    const start = this.pos;
    this.advance(); // consume {
    
    let depth = 1;
    let content = '{';
    
    while (!this.isEOF() && depth > 0) {
      const char = this.peek();
      if (char === '{') depth++;
      else if (char === '}') depth--;
      content += this.advance();
    }
    
    return new Token(TokenType.OBJECT_LITERAL, content, start, this.pos);
  }

  private parseArrayOrBracket(): Token {
    const start = this.pos;
    this.advance(); // consume [
    
    let depth = 1;
    let content = '';
    
    while (!this.isEOF() && depth > 0) {
      const char = this.peek();
      if (char === '[') depth++;
      else if (char === ']') {
        depth--;
        if (depth === 0) break;
      }
      content += this.advance();
    }
    
    if (this.peek() === ']') this.advance();
    
    // Check if this is followed by member access (then it's bracket access at start)
    if (this.peek() === '.' || this.peek() === '[') {
      const bracket = new Token(TokenType.BRACKET_ACCESS, `[${content}]`, start, this.pos);
      if (content.trim()) {
        const innerParser = new ObjectPathParser(content);
        for (const child of innerParser.getTokens()) {
          bracket.addChild(child);
        }
      }
      
      // Continue parsing as member expression
      const memberExpr = new Token(TokenType.MEMBER_EXPRESSION, '', start, start);
      memberExpr.addChild(bracket);
      
      while (!this.isEOF()) {
        const char = this.peek();
        if (char === '.') {
          this.advance();
          memberExpr.addChild(this.parsePropertyAccess(false));
        } else if (char === '[') {
          memberExpr.addChild(this.parseBracketAccess(false));
        } else {
          break;
        }
      }
      
      memberExpr.end = this.pos;
      memberExpr.value = this.input.substring(start, this.pos);
      return memberExpr;
    }
    
    // Otherwise it's an array literal
    return new Token(TokenType.ARRAY_LITERAL, `[${content}]`, start, this.pos);
  }


  private isOperatorChar(char: string): boolean {
    return ['+', '-', '*', '/', '%', '=', '!', '<', '>', '&', '|', '?'].includes(char);
  }

  private parseOperator(): Token {
    const start = this.pos;
    let value = this.advance();
    
    const next = this.peek();
    // Multi-char operators
    if ((value === '=' || value === '!' || value === '<' || value === '>') && next === '=') {
      value += this.advance();
      if (this.peek() === '=') value += this.advance();
    } else if ((value === '&' && next === '&') || (value === '|' && next === '|')) {
      value += this.advance();
    } else if (value === '?' && next === '?') {
      value += this.advance();
    }
    
    return new Token(TokenType.OPERATOR, value, start, this.pos);
  }

  private tryParseTernary(): Token | null {
    // Look ahead for ternary pattern: expr ? expr : expr
    const savedPos = this.pos;
    const remaining = this.input.substring(this.pos);
    
    // Find ternary operator at depth 0, respecting string literals
    let depth = 0;
    let inString = false;
    let stringChar = '';
    let questionIdx = -1;
    let colonIdx = -1;
    
    for (let i = 0; i < remaining.length; i++) {
      const char = remaining[i];
      const prevChar = i > 0 ? remaining[i - 1] : '';
      
      // Track string state (handle escape characters)
      if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
          stringChar = '';
        }
      }
      
      if (inString) continue;
      
      // Track depth for parentheses, brackets, braces
      if (char === '(' || char === '[' || char === '{') depth++;
      else if (char === ')' || char === ']' || char === '}') depth--;
      
      // Find ternary ? at depth 0
      if (depth === 0 && char === '?') {
        const nextChar = remaining[i + 1] || '';
        // Skip optional chaining (?.) and nullish coalescing (??)
        if (nextChar === '.' || nextChar === '?') continue;
        // Ternary ? should be followed by whitespace or expression
        questionIdx = i;
      }
      
      // Find ternary : at depth 0 (only after finding ?)
      if (depth === 0 && char === ':' && questionIdx >= 0 && colonIdx < 0) {
        colonIdx = i;
        break;
      }
    }
    
    // Not a ternary expression
    if (questionIdx < 0 || colonIdx < 0) return null;
    
    const condStr = remaining.substring(0, questionIdx).trim();
    const trueStr = remaining.substring(questionIdx + 1, colonIdx).trim();
    const falseStr = remaining.substring(colonIdx + 1).trim();
    
    if (!condStr || !trueStr || !falseStr) return null;
    
    const ternary = new Token(TokenType.TERNARY, remaining, savedPos, savedPos + remaining.length);
    
    const condParser = new ObjectPathParser(condStr);
    const trueParser = new ObjectPathParser(trueStr);
    const falseParser = new ObjectPathParser(falseStr);
    
    for (const child of condParser.getTokens()) ternary.addChild(child);
    for (const child of trueParser.getTokens()) ternary.addChild(child);
    for (const child of falseParser.getTokens()) ternary.addChild(child);
    
    this.pos = this.input.length; // consume all
    return ternary;
  }


  private tryParseBinary(): Token | null {
    // Look for binary operators at top level
    const remaining = this.input.substring(this.pos);
    
    // Check operators in order of precedence (lowest to highest)
    // This ensures we parse correctly: a < b - c => a < (b - c), not (a < b) - c
    const operatorGroups = [
      ['||'],           // Logical OR (lowest precedence)
      ['&&'],           // Logical AND
      ['??'],           // Nullish coalescing
      ['<', '>', '<=', '>='],      // Comparison
      ['===', '!==', '==', '!='],  // Equality
      ['+', '-'],       // Addition/Subtraction
      ['*', '/', '%']   // Multiplication/Division (highest precedence)
    ];
    
    // Search from lowest to highest precedence
    for (const operators of operatorGroups) {
      for (const op of operators) {
        let depth = 0;
        let inString = false;
        let stringChar = '';
        let lastMatchIndex = -1;
        
        // Find the LAST occurrence of this operator at depth 0 (right-to-left for left-associative)
        for (let i = 0; i < remaining.length - op.length + 1; i++) {
          const char = remaining[i];
          
          // Track string state
          if ((char === '"' || char === "'" || char === '`') && (i === 0 || remaining[i-1] !== '\\')) {
            if (!inString) {
              inString = true;
              stringChar = char;
            } else if (char === stringChar) {
              inString = false;
            }
          }
          
          if (inString) continue;
          
          // Track depth
          if (char === '(' || char === '[' || char === '{') depth++;
          else if (char === ')' || char === ']' || char === '}') depth--;
          
          // Check for operator at depth 0
          if (depth === 0 && remaining.substring(i, i + op.length) === op) {
            // Make sure it's not part of optional chaining
            if (op === '?' && remaining[i + 1] === '.') continue;
            
            // For - operator, make sure it's not a negative number
            if (op === '-') {
              // Look back to find the last non-whitespace character
              let lastNonSpace = '';
              for (let j = i - 1; j >= 0; j--) {
                if (remaining[j].trim()) {
                  lastNonSpace = remaining[j];
                  break;
                }
              }
              // Skip if it looks like a negative number (after operator, comma, or opening bracket/paren, or at start)
              if (!lastNonSpace || /[+\-*\/%=<>!&|,(\[]/.test(lastNonSpace)) {
                continue;
              }
            }
            
            // For comparison/equality operators, make sure we're not matching part of a longer operator
            if (['<', '>', '=', '!'].includes(op)) {
              const nextChar = remaining[i + op.length] || '';
              if (nextChar === '=') continue; // Skip < if it's part of <=
            }
            
            lastMatchIndex = i;
          }
        }
        
        // If we found a match, split there
        if (lastMatchIndex >= 0) {
          const i = lastMatchIndex;
          const leftRaw = remaining.substring(0, i);
          const rightRaw = remaining.substring(i + op.length);
          const leftStr = leftRaw.trim();
          const rightStr = rightRaw.trim();
          
          if (leftStr && rightStr) {
            const binary = new Token(TokenType.BINARY, op, this.pos, this.pos + remaining.length);
            
            // 연산자 주변 공백 보존
            const leftTrailingSpace = leftRaw.substring(leftStr.length);
            const rightLeadingSpace = rightRaw.substring(0, rightRaw.length - rightRaw.trimStart().length);
            binary.leftSpace = leftTrailingSpace;
            binary.rightSpace = rightLeadingSpace;
            
            const leftParser = new ObjectPathParser(leftStr);
            const rightParser = new ObjectPathParser(rightStr);
            
            // Binary token should have exactly 2 children: left and right
            // Wrap the parsed results in containers that preserve the original structure
            const leftContainer = new Token(TokenType.ROOT, leftStr, 0, leftStr.length);
            for (const child of leftParser.getTokens()) leftContainer.addChild(child);
            binary.addChild(leftContainer);
            
            const rightContainer = new Token(TokenType.ROOT, rightStr, 0, rightStr.length);
            for (const child of rightParser.getTokens()) rightContainer.addChild(child);
            binary.addChild(rightContainer);
            
            this.pos = this.input.length;
            return binary;
          }
        }
      }
    }
    
    return null;
  }


  // --- Main conversion method ---
  toOptionalChainPath(): string {
    if (!this.input) return '';
    
    // 객체 리터럴은 변환하지 않음
    if (this.isObjectLiteralInput()) return this.input;
    
    // 함수 스크립트는 변환하지 않음
    if (this.isFunctionScript() || this.isArrowFunctionScript()) return this.input;
    
    return this.root.toOptionalChain();
  }

  removeOptionalChainOperator(): string {
    if (!this.input) return '';
    return this.input.replace(/\?\./g, '.').replace(/\.\[/g, '[');
  }

  stringify(): string {
    return this.root.stringify();
  }

  // --- Static factory methods ---
  static parse(input: string): ObjectPathParser {
    return new ObjectPathParser(input);
  }

  static isFunctionScript(script: string): boolean {
    return script.trim().startsWith('function');
  }

  static isArrowFunctionScript(script: string): boolean {
    return /^\s*\([^)]*\)\s*=>/.test(script);
  }

  static isObjectLiteral(script: string): boolean {
    const trimmed = script.trim();
    return trimmed.startsWith('{') && trimmed.endsWith('}');
  }
}
