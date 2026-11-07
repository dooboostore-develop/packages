import { DocumentType, assertValidDoctypeName } from './DocumentType';

/**
 * The **`DOMImplementation`** interface (document.implementation).
 *
 * `createDocumentType` is validated the way Chromium does (measured): the
 * name may be empty, but whitespace/NUL/'/'/'>' throw InvalidCharacterError.
 * publicId/systemId are NOT validated by browsers — the XML
 * PubidLiteral/SystemLiteral rules belong to XML serializers.
 */
export class DOMImplementationImpl {
  constructor(private readonly getDocument: () => any) {}

  createDocumentType(qualifiedName: string, publicId?: string, systemId?: string): DocumentType {
    assertValidDoctypeName(String(qualifiedName));
    return new DocumentType(String(qualifiedName), String(publicId ?? ''), String(systemId ?? ''), this.getDocument());
  }

  createDocument(namespaceURI: string | null, qualifiedName?: string, doctype?: any): any {
    const owner = this.getDocument();
    const ctor = owner?.constructor;
    if (typeof ctor !== 'function') return owner;

    // Same class as the owner document, with its own (empty) tree.
    const doc: any = new ctor();
    (doc as any)._window = owner?._window ?? owner?.defaultView ?? null;

    if (doctype) {
      (doc as any)._childNodesInternal = [doctype];
      (doctype as any)._parentNodeInternal = doc;
      (doctype as any)._ownerDocument = doc;
    }

    const name = String(qualifiedName ?? '');
    const ns = namespaceURI ?? null;
    if (name) {
      const el = ns && typeof doc.createElementNS === 'function'
        ? doc.createElementNS(ns, name)
        : doc.createElement(name);
      doc.appendChild(el);
      // documentElement is a plain property in this implementation (the
      // parser sets it the same way).
      (doc as any).documentElement = el;
    }
    return doc;
  }

  hasFeature(): boolean {
    // Deprecated; browsers return true unconditionally.
    return true;
  }
}
