import { Compiler as BaseCompiler } from './compiler';

interface Node {
  type: string;
  position?: any;
  stylesheet?: {
    rules: Node[];
  };
  comment?: string;
  import?: string;
  media?: string;
  vendor?: string;
  document?: string;
  charset?: string;
  namespace?: string;
  supports?: string;
  name?: string;
  keyframes?: Node[];
  values?: string[];
  declarations?: Node[];
  selectors?: string[];
  rules?: Node[];
  property?: string;
  value?: string;
}

interface CompilerOptions {
  indent?: string;
}

/**
 * Initialize a new `Compiler`.
 */
export class IdentityCompiler extends BaseCompiler {
  private indentation: string;
  private level: number;

  constructor(options: CompilerOptions = {}) {
    super(options);
    this.indentation = typeof options.indent === 'string' ? options.indent : '  ';
    this.level = 1;
  }

  /**
   * Compile `node`.
   */
  compile(node: Node): string {
    return this.stylesheet(node);
  }

  /**
   * Visit stylesheet node.
   */
  stylesheet(node: Node): string {
    return this.mapVisit(node.stylesheet!.rules, '\n\n');
  }

  /**
   * Visit comment node.
   */
  comment(node: Node): string {
    return this.emit(this.indent() + '/*' + node.comment + '*/');
  }

  /**
   * Visit import node.
   */
  import(node: Node): string {
    return this.emit('@import ' + node.import + ';');
  }

  /**
   * Visit media node.
   */
  media(node: Node): string {
    return this.emit('@media ' + node.media)
      + this.emit(
        ' {\n'
        + this.indent(1))
      + this.mapVisit(node.rules!, '\n\n')
      + this.emit(
        this.indent(-1)
        + '\n}');
  }

  /**
   * Visit document node.
   */
  document(node: Node): string {
    const doc = '@' + (node.vendor || '') + 'document ' + node.document;

    return this.emit(doc)
      + this.emit(
        ' '
        + ' {\n'
        + this.indent(1))
      + this.mapVisit(node.rules!, '\n\n')
      + this.emit(
        this.indent(-1)
        + '\n}');
  }

  /**
   * Visit charset node.
   */
  charset(node: Node): string {
    return this.emit('@charset ' + node.charset + ';');
  }

  /**
   * Visit namespace node.
   */
  namespace(node: Node): string {
    return this.emit('@namespace ' + node.namespace + ';');
  }

  /**
   * Visit supports node.
   */
  supports(node: Node): string {
    return this.emit('@supports ' + node.supports)
      + this.emit(
        ' {\n'
        + this.indent(1))
      + this.mapVisit(node.rules!, '\n\n')
      + this.emit(
        this.indent(-1)
        + '\n}');
  }

  /**
   * Visit keyframes node.
   */
  keyframes(node: Node): string {
    return this.emit('@' + (node.vendor || '') + 'keyframes ' + node.name)
      + this.emit(
        ' {\n'
        + this.indent(1))
      + this.mapVisit(node.keyframes!, '\n')
      + this.emit(
        this.indent(-1)
        + '}');
  }

  /**
   * Visit keyframe node.
   */
  keyframe(node: Node): string {
    const decls = node.declarations!;

    return this.emit(this.indent())
      + this.emit(node.values!.join(', '))
      + this.emit(
        ' {\n'
        + this.indent(1))
      + this.mapVisit(decls, '\n')
      + this.emit(
        this.indent(-1)
        + '\n'
        + this.indent() + '}\n');
  }

  /**
   * Visit page node.
   */
  page(node: Node): string {
    const sel = node.selectors!.length
      ? node.selectors!.join(', ') + ' '
      : '';

    return this.emit('@page ' + sel)
      + this.emit('{\n')
      + this.emit(this.indent(1))
      + this.mapVisit(node.declarations!, '\n')
      + this.emit(this.indent(-1))
      + this.emit('\n}');
  }

  /**
   * Visit font-face node.
   */
  'font-face'(node: Node): string {
    return this.emit('@font-face ')
      + this.emit('{\n')
      + this.emit(this.indent(1))
      + this.mapVisit(node.declarations!, '\n')
      + this.emit(this.indent(-1))
      + this.emit('\n}');
  }

  /**
   * Visit host node.
   */
  host(node: Node): string {
    return this.emit('@host')
      + this.emit(
        ' {\n'
        + this.indent(1))
      + this.mapVisit(node.rules!, '\n\n')
      + this.emit(
        this.indent(-1)
        + '\n}');
  }

  /**
   * Visit custom-media node.
   */
  'custom-media'(node: Node): string {
    return this.emit('@custom-media ' + node.name + ' ' + node.media + ';');
  }

  /**
   * Visit rule node.
   */
  rule(node: Node): string {
    const indent = this.indent();
    const decls = node.declarations!;
    if (!decls.length) return '';

    return this.emit(node.selectors!.map(s => indent + s).join(',\n'))
      + this.emit(' {\n')
      + this.emit(this.indent(1))
      + this.mapVisit(decls, '\n')
      + this.emit(this.indent(-1))
      + this.emit('\n' + this.indent() + '}');
  }

  /**
   * Visit declaration node.
   */
  declaration(node: Node): string {
    return this.emit(this.indent())
      + this.emit(node.property + ': ' + node.value)
      + this.emit(';');
  }

  /**
   * Increase, decrease or return current indentation.
   */
  indent(level?: number): string {
    if (level != null) {
      this.level += level;
      return '';
    }

    return Array(this.level).join(this.indentation);
  }
} 