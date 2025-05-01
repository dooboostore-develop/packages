// http://www.w3.org/TR/CSS21/grammar.html
// https://github.com/visionmedia/css-parse/pull/49#issuecomment-30088027

interface Position {
  start: { line: number; column: number };
  end: { line: number; column: number };
  source?: string;
  content: string;
}

interface ParseOptions {
  source?: string;
  silent?: boolean;
}

interface StyleSheet {
  type: 'stylesheet';
  stylesheet: {
    source?: string;
    rules: Rule[];
    parsingErrors: Error[];
  };
}

interface Rule {
  type: string;
  selectors?: string[];
  declarations?: Declaration[];
  values?: string[];
  name?: string;
  vendor?: string;
  keyframes?: Rule[];
  media?: string;
  rules?: Rule[];
  supports?: string;
  document?: string;
  comment?: string;
  position?: Position;
  [key: string]: any; // Allow for dynamic properties
}

interface Declaration {
  type: 'declaration';
  property: string;
  value: string;
  position?: Position;
}

const commentre = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g;

export default function parse(css: string, options: ParseOptions = {}): StyleSheet {
  /**
   * Positional.
   */
  let lineno = 1;
  let column = 1;

  /**
   * Update lineno and column based on `str`.
   */
  function updatePosition(str: string): void {
    const lines = str.match(/\n/g);
    if (lines) lineno += lines.length;
    const i = str.lastIndexOf('\n');
    column = ~i ? str.length - i : column + str.length;
  }

  /**
   * Mark position and patch `node.position`.
   */
  function position(): <T extends Rule>(node: T) => T {
    const start = { line: lineno, column: column };
    return function(node) {
      node.position = new Position(start);
      whitespace();
      return node;
    };
  }

  /**
   * Store position information for a node
   */
  class Position implements Position {
    end: { line: number; column: number };
    content: string;
    source?: string;

    constructor(public start: { line: number; column: number }) {
      this.end = { line: lineno, column: column };
      this.source = options.source;
      this.content = css;
    }
  }

  /**
   * Error `msg`.
   */
  const errorsList: Error[] = [];

  function error(msg: string): never {
    const err = new Error(options.source + ':' + lineno + ':' + column + ': ' + msg) as any;
    err['reason'] = msg;
    err['filename'] = options.source;
    err['line'] = lineno;
    err['column'] = column;
    err['source'] = css;

    if (options.silent) {
      errorsList.push(err);
      throw err;
    } else {
      throw err;
    }
  }

  /**
   * Parse stylesheet.
   */
  function stylesheet(): StyleSheet {
    const rulesList = rules();

    return {
      type: 'stylesheet',
      stylesheet: {
        source: options.source,
        rules: rulesList,
        parsingErrors: errorsList
      }
    };
  }

  /**
   * Opening brace.
   */
  function open(): RegExpExecArray | null {
    return match(/^{\s*/);
  }

  /**
   * Closing brace.
   */
  function close(): RegExpExecArray | null {
    return match(/^}/);
  }

  /**
   * Parse ruleset.
   */
  function rules(): Rule[] {
    let node: Rule | null;
    const rules: Rule[] = [];
    whitespace();
    comments(rules);
    while (css.length && css.charAt(0) != '}' && (node = atrule() || rule())) {
      if (node) {
        rules.push(node);
        comments(rules);
      }
    }
    return rules;
  }

  /**
   * Match `re` and return captures.
   */
  function match(re: RegExp): RegExpExecArray | null {
    const m = re.exec(css);
    if (!m) return null;
    const str = m[0];
    updatePosition(str);
    css = css.slice(str.length);
    return m;
  }

  /**
   * Parse whitespace.
   */
  function whitespace(): void {
    match(/^\s*/);
  }

  /**
   * Parse comments;
   */
  function comments(rules: Rule[] = []): Rule[] {
    let c: Rule | null;
    while ((c = comment())) {
      rules.push(c);
    }
    return rules;
  }

  /**
   * Parse comment.
   */
  function comment(): Rule | null {
    const pos = position();
    if ('/' != css.charAt(0) || '*' != css.charAt(1)) return null;

    let i = 2;
    while ("" != css.charAt(i) && ('*' != css.charAt(i) || '/' != css.charAt(i + 1))) ++i;
    i += 2;

    if ("" === css.charAt(i-1)) {
      error('End of comment missing');
    }

    const str = css.slice(2, i - 2);
    column += 2;
    updatePosition(str);
    css = css.slice(i);
    column += 2;

    return pos({ type: 'comment', comment: str } as Rule);
  }

  /**
   * Parse selector.
   */
  function selector(): string[] | undefined {
    const m = match(/^([^{]+)/);
    if (!m) return undefined;
    /* @fix Remove all comments from selectors
     * http://ostermiller.org/findcomment.html */
    return trim(m[0])
      .replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*\/+/g, '')
      .replace(/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'/g, function(m) {
        return m.replace(/,/g, '\u200C');
      })
      .split(/\s*(?![^(]*\]),\s*/)
      .map(function(s) {
        return s.replace(/\u200C/g, ',');
      });
  }

  /**
   * Parse declaration.
   */
  function declaration(): Rule | null {
    const pos = position();

    // prop
    const prop = match(/^(\*?[-#\/\*\\\w]+(\[[0-9a-z_-]+\])?)\s*/);
    if (!prop) return null;
    const propValue = trim(prop[0]);

    // :
    if (!match(/^:\s*/)) error("property missing ':'");

    // val
    const val = match(/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^\)]*?\)|[^};])+)/);

    const ret = pos({
      type: 'declaration',
      property: propValue.replace(commentre, ''),
      value: val ? trim(val[0]).replace(commentre, '') : ''
    } as Rule);

    // ;
    match(/^[;\s]*/);

    return ret;
  }

  /**
   * Parse declarations.
   */
  function declarations(): Declaration[] {
    const decls: Declaration[] = [];

    if (!open()) error("missing '{'");
    comments(decls as Rule[]);

    // declarations
    let decl: Rule | null;
    while ((decl = declaration())) {
      decls.push(decl as Declaration);
      comments(decls as Rule[]);
    }

    if (!close()) error("missing '}'");
    return decls;
  }

  /**
   * Parse keyframe.
   */
  function keyframe(): Rule | null {
    const m = match(/^((\d+\.\d+|\.\d+|\d+)%?|[a-z]+)\s*/);
    if (!m) return null;
    
    const vals: string[] = [];
    const pos = position();

    vals.push(m[1]);
    match(/^,\s*/);
    
    return pos({
      type: 'keyframe',
      values: vals,
      declarations: declarations()
    } as Rule);
  }

  /**
   * Parse keyframes.
   */
  function atkeyframes(): Rule | null {
    const pos = position();
    const m1 = match(/^@([-\w]+)?keyframes\s*/);

    if (!m1) return null;
    const vendor = m1[1];

    // identifier
    const m2 = match(/^([-\w]+)\s*/);
    if (!m2) error("@keyframes missing name");
    const name = m2[1];

    if (!open()) error("@keyframes missing '{'");

    let frame: Rule | null;
    let frames: Rule[] = comments();
    while ((frame = keyframe())) {
      frames.push(frame);
      frames = frames.concat(comments());
    }

    if (!close()) error("@keyframes missing '}'");

    return pos({
      type: 'keyframes',
      name: name,
      vendor: vendor,
      keyframes: frames
    } as Rule);
  }

  /**
   * Parse supports.
   */
  function atsupports(): Rule | null {
    const pos = position();
    const m = match(/^@supports *([^{]+)/);

    if (!m) return null;
    const supports = trim(m[1]);

    if (!open()) error("@supports missing '{'");

    const style = comments().concat(rules());

    if (!close()) error("@supports missing '}'");

    return pos({
      type: 'supports',
      supports: supports,
      rules: style
    } as Rule);
  }

  /**
   * Parse host.
   */
  function athost(): Rule | null {
    const pos = position();
    const m = match(/^@host\s*/);

    if (!m) return null;

    if (!open()) error("@host missing '{'");

    const style = comments().concat(rules());

    if (!close()) error("@host missing '}'");

    return pos({
      type: 'host',
      rules: style
    } as Rule);
  }

  /**
   * Parse media.
   */
  function atmedia(): Rule | null {
    const pos = position();
    const m = match(/^@media *([^{]+)/);

    if (!m) return null;
    const media = trim(m[1]);

    if (!open()) error("@media missing '{'");

    const style = comments().concat(rules());

    if (!close()) error("@media missing '}'");

    return pos({
      type: 'media',
      media: media,
      rules: style
    } as Rule);
  }

  /**
   * Parse custom-media.
   */
  function atcustommedia(): Rule | null {
    const pos = position();
    const m = match(/^@custom-media\s+(--[^\s]+)\s*([^{;]+);/);
    if (!m) return null;

    return pos({
      type: 'custom-media',
      name: trim(m[1]),
      media: trim(m[2])
    } as Rule);
  }

  /**
   * Parse paged media.
   */
  function atpage(): Rule | null {
    const pos = position();
    const m = match(/^@page */);
    if (!m) return null;

    const sel = selector() || [];

    if (!open()) error("@page missing '{'");
    let decls = comments() as Declaration[];

    // declarations
    let decl: Rule | null;
    while ((decl = declaration())) {
      decls.push(decl as Declaration);
      decls = decls.concat(comments() as Declaration[]);
    }

    if (!close()) error("@page missing '}'");

    return pos({
      type: 'page',
      selectors: sel,
      declarations: decls
    } as Rule);
  }

  /**
   * Parse document.
   */
  function atdocument(): Rule | null {
    const pos = position();
    const m = match(/^@([-\w]+)?document *([^{]+)/);
    if (!m) return null;

    const vendor = trim(m[1]);
    const doc = trim(m[2]);

    if (!open()) error("@document missing '{'");

    const style = comments().concat(rules());

    if (!close()) error("@document missing '}'");

    return pos({
      type: 'document',
      document: doc,
      vendor: vendor,
      rules: style
    } as Rule);
  }

  /**
   * Parse font-face.
   */
  function atfontface(): Rule | null {
    const pos = position();
    const m = match(/^@font-face\s*/);
    if (!m) return null;

    if (!open()) error("@font-face missing '{'");
    let decls = comments() as Declaration[];

    // declarations
    let decl: Rule | null;
    while ((decl = declaration())) {
      decls.push(decl as Declaration);
      decls = decls.concat(comments() as Declaration[]);
    }

    if (!close()) error("@font-face missing '}'");

    return pos({
      type: 'font-face',
      declarations: decls
    } as Rule);
  }

  /**
   * Parse import
   */
  const atimport = _compileAtrule('import');

  /**
   * Parse charset
   */
  const atcharset = _compileAtrule('charset');

  /**
   * Parse namespace
   */
  const atnamespace = _compileAtrule('namespace');

  /**
   * Parse non-block at-rules
   */
  function _compileAtrule(name: string): () => Rule | null {
    const re = new RegExp('^@' + name + '\\s*([^;]+);');
    return function(): Rule | null {
      const pos = position();
      const m = match(re);
      if (!m) return null;
      const ret: Rule = { type: name };
      ret[name] = m[1].trim();
      return pos(ret);
    }
  }

  /**
   * Parse at rule.
   */
  function atrule(): Rule | null {
    if (css[0] != '@') return null;

    return atkeyframes()
      || atmedia()
      || atcustommedia()
      || atsupports()
      || atimport()
      || atcharset()
      || atnamespace()
      || atdocument()
      || atpage()
      || athost()
      || atfontface();
  }

  /**
   * Parse rule.
   */
  function rule(): Rule | null {
    const pos = position();
    const sel = selector();

    if (!sel) error('selector missing');
    comments();

    return pos({
      type: 'rule',
      selectors: sel,
      declarations: declarations()
    } as Rule);
  }

  return addParent(stylesheet());
}

/**
 * Trim `str`.
 */
function trim(str: string): string {
  return str ? str.replace(/^\s+|\s+$/g, '') : '';
}

/**
 * Adds non-enumerable parent node reference to each node.
 */
function addParent(obj: any, parent?: any): any {
  const isNode = obj && typeof obj.type === 'string';
  const childParent = isNode ? obj : parent;

  for (const k in obj) {
    const value = obj[k];
    if (Array.isArray(value)) {
      value.forEach(function(v) { addParent(v, childParent); });
    } else if (value && typeof value === 'object') {
      addParent(value, childParent);
    }
  }

  if (isNode) {
    Object.defineProperty(obj, 'parent', {
      configurable: true,
      writable: true,
      enumerable: false,
      value: parent || null
    });
  }

  return obj;
}