import { Compiler as BaseCompiler } from './compiler';

interface Node {
  type: string;
  position?: any;
  stylesheet?: {
    rules: Node[];
  };
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

interface Declaration extends Node {
  type: 'declaration';
  property: string;
  value: string;
  position?: any;
}

/**
 * Compressed CSS compiler
 */
export class CompressCompiler extends BaseCompiler {
  /**
   * Override emit to handle position
   */
  emit(str: string, pos?: any): string {
    return super.emit(str);
  }

  /**
   * Compile `node`.
   */
  compile(node: Node): string {
    return node.stylesheet!.rules.map(rule => this.visit(rule)).join('');
  }

  /**
   * Visit comment node.
   */
  comment(node: Node): string {
    return this.emit('', node.position);
  }

  /**
   * Visit import node.
   */
  import(node: Node): string {
    return this.emit('@import ' + node.import + ';', node.position);
  }

  /**
   * Visit media node.
   */
  media(node: Node): string {
    return this.emit('@media ' + node.media, node.position)
      + this.emit('{')
      + this.mapVisit(node.rules!)
      + this.emit('}');
  }

  /**
   * Visit document node.
   */
  document(node: Node): string {
    const doc = '@' + (node.vendor || '') + 'document ' + node.document;

    return this.emit(doc, node.position)
      + this.emit('{')
      + this.mapVisit(node.rules!)
      + this.emit('}');
  }

  /**
   * Visit charset node.
   */
  charset(node: Node): string {
    return this.emit('@charset ' + node.charset + ';', node.position);
  }

  /**
   * Visit namespace node.
   */
  namespace(node: Node): string {
    return this.emit('@namespace ' + node.namespace + ';', node.position);
  }

  /**
   * Visit supports node.
   */
  supports(node: Node): string {
    return this.emit('@supports ' + node.supports, node.position)
      + this.emit('{')
      + this.mapVisit(node.rules!)
      + this.emit('}');
  }

  /**
   * Visit keyframes node.
   */
  keyframes(node: Node): string {
    return this.emit('@'
      + (node.vendor || '')
      + 'keyframes '
      + node.name, node.position)
      + this.emit('{')
      + this.mapVisit(node.keyframes!)
      + this.emit('}');
  }

  /**
   * Visit keyframe node.
   */
  keyframe(node: Node): string {
    const decls = node.declarations!;

    return this.emit(node.values!.join(','), node.position)
      + this.emit('{')
      + this.mapVisit(decls)
      + this.emit('}');
  }

  /**
   * Visit page node.
   */
  page(node: Node): string {
    const sel = node.selectors!.length
      ? node.selectors!.join(', ')
      : '';

    return this.emit('@page ' + sel, node.position)
      + this.emit('{')
      + this.mapVisit(node.declarations!)
      + this.emit('}');
  }

  /**
   * Visit font-face node.
   */
  'font-face'(node: Node): string {
    return this.emit('@font-face', node.position)
      + this.emit('{')
      + this.mapVisit(node.declarations!)
      + this.emit('}');
  }

  /**
   * Visit host node.
   */
  host(node: Node): string {
    return this.emit('@host', node.position)
      + this.emit('{')
      + this.mapVisit(node.rules!)
      + this.emit('}');
  }

  /**
   * Visit custom-media node.
   */
  'custom-media'(node: Node): string {
    return this.emit('@custom-media ' + node.name + ' ' + node.media + ';', node.position);
  }

  /**
   * Visit rule node.
   */
  rule(node: Node): string {
    const decls = node.declarations!;
    if (!decls.length) return '';

    return this.emit(node.selectors!.join(','), node.position)
      + this.emit('{')
      + this.mapVisit(decls)
      + this.emit('}');
  }

  /**
   * Visit declaration node.
   */
  declaration(node: Declaration): string {
    return this.emit(node.property + ':' + node.value, node.position) + this.emit(';');
  }
} 