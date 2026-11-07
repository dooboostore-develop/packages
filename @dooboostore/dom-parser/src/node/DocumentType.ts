import { NodeBase } from './NodeBase';
import { DOCUMENT_TYPE_NODE } from './Node';

/**
 * Element-name rule used by `createDocumentType` in Chromium (measured):
 * empty name is ALLOWED here (unlike createElement), but whitespace, NUL,
 * `/` and `>` are rejected with InvalidCharacterError.
 */
const INVALID_DOCTYPE_NAME_CHARS = /[\u0000\t\n\f\r />]/;

class InvalidCharacterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidCharacterError';
  }
}

export function assertValidDoctypeName(name: string): void {
  if (INVALID_DOCTYPE_NAME_CHARS.test(name)) {
    throw new InvalidCharacterError(`The qualified name provided ('${name}') contains an invalid character.`);
  }
}

/**
 * The **`DocumentType`** interface represents a doctype (nodeType 10):
 * `<!DOCTYPE name>`, or `<!DOCTYPE name PUBLIC "publicId" "systemId">`, or
 * `<!DOCTYPE name SYSTEM "systemId">`.
 */
export class DocumentType extends NodeBase {
  public readonly name: string;
  public readonly publicId: string;
  public readonly systemId: string;

  constructor(name: string, publicId: string = '', systemId: string = '', ownerDocument?: any) {
    super(DOCUMENT_TYPE_NODE, name);
    this.name = name;
    this.publicId = publicId;
    this.systemId = systemId;
    (this as any)._ownerDocument = ownerDocument ?? null;
  }

  get [Symbol.toStringTag](): string {
    return 'DocumentType';
  }

  get nodeValue(): string | null {
    return null;
  }

  set nodeValue(_value: string | null) {
    // Doctype nodes have no value.
  }

  get textContent(): string | null {
    return null;
  }

  set textContent(_value: string | null) {
    // Doctype nodes have no text content.
  }

  cloneNode(): Node {
    return new DocumentType(this.name, this.publicId, this.systemId, (this as any)._ownerDocument) as unknown as Node;
  }
}

/**
 * Serializes a doctype the way browsers do:
 * `<!DOCTYPE html>`, `<!DOCTYPE n PUBLIC "p" "s">`, `<!DOCTYPE n SYSTEM "s">`.
 * Quotes inside the ids are escaped per the XML serialization rules.
 */
export function serializeDocumentType(node: any): string {
  const name = String(node?.name ?? node?.nodeName ?? '');
  const publicId = String(node?.publicId ?? '');
  const systemId = String(node?.systemId ?? '');
  if (publicId) {
    return `<!DOCTYPE ${name} PUBLIC "${publicId.replace(/"/g, '&quot;')}" "${systemId.replace(/"/g, '&quot;')}">`;
  }
  if (systemId) {
    return `<!DOCTYPE ${name} SYSTEM "${systemId.replace(/"/g, '&quot;')}">`;
  }
  return `<!DOCTYPE ${name}>`;
}
