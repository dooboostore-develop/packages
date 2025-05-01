interface CompilerOptions {
  compress?: boolean;
  sourcemap?: boolean | 'generator';
  indent?: string;
}

interface Node {
  type: string;
  [key: string]: any;
}

/**
 * Base compiler class
 */
export class Compiler {
  protected options: CompilerOptions;
  [key: string]: any;

  /**
   * Initialize a compiler.
   */
  constructor(opts: CompilerOptions = {}) {
    this.options = opts;
  }

  /**
   * Emit `str`
   */
  emit(str: string): string {
    return str;
  }

  /**
   * Visit `node`.
   */
  visit(node: Node): string {
    return this[node.type](node);
  }

  /**
   * Map visit over array of `nodes`, optionally using a `delim`
   */
  mapVisit(nodes: Node[], delim: string = ''): string {
    let buf = '';

    for (let i = 0, length = nodes.length; i < length; i++) {
      buf += this.visit(nodes[i]);
      if (delim && i < length - 1) buf += this.emit(delim);
    }

    return buf;
  }
} 