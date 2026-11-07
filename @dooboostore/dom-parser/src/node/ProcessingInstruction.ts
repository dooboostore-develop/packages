import { NodeBase } from './NodeBase';
import { PROCESSING_INSTRUCTION_NODE } from './Node';

/**
 * XML `Name` production (XML 1.0 5th ed.), used to validate PI targets the
 * way browsers do in `document.createProcessingInstruction()`.
 */
const NAME_START_CHARS =
  'A-Za-z_:\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD';
const NAME_CHARS = NAME_START_CHARS + '\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040';
const XML_NAME_RE = new RegExp(`^[${NAME_START_CHARS}][${NAME_CHARS}]*$`);

class DOMException extends Error {
  constructor(
    message: string,
    public name: string = 'DOMException'
  ) {
    super(message);
    this.name = name;
  }
}

/**
 * Validates `createProcessingInstruction(target, data)` arguments the way
 * Chromium does (verified):
 * - target must match the XML Name production (no empty target, no spaces,
 *   no leading digit/dot); "xml"/"XML" is accepted
 * - data must not contain "?>"  (InvalidCharacterError)
 * Empty data is allowed and serializes as `<?target?>`.
 */
export function assertValidProcessingInstruction(target: string, data: string): void {
  if (!XML_NAME_RE.test(String(target))) {
    throw new DOMException(`The target provided ('${target}') is not a valid name.`, 'InvalidCharacterError');
  }
  if (String(data).includes('?>')) {
    throw new DOMException(`The data provided ('${data}') contains '?>'.`, 'InvalidCharacterError');
  }
}

/** Serializes a PI node: `<?target data?>` (`<?target?>` when data is empty). */
export function serializeProcessingInstruction(node: any): string {
  const target = String(node?.target ?? node?.nodeName ?? '');
  const data = String(node?.data ?? node?.textContent ?? '');
  return data ? `<?${target} ${data}?>` : `<?${target}?>`;
}

/**
 * The **`ProcessingInstruction`** interface represents a processing
 * instruction (nodeType 7): `<?target data?>`.
 */
export class ProcessingInstruction extends NodeBase {
  private _target: string;
  private _data: string;

  constructor(target: string, data: string, ownerDocument?: any) {
    super(PROCESSING_INSTRUCTION_NODE, target);
    this._target = target;
    this._data = data;
    (this as any)._ownerDocument = ownerDocument ?? null;
  }

  get [Symbol.toStringTag](): string {
    return 'ProcessingInstruction';
  }

  get target(): string {
    return this._target;
  }

  get data(): string {
    return this._data;
  }

  set data(value: string) {
    this._data = String(value);
  }

  get nodeValue(): string | null {
    return this._data;
  }

  set nodeValue(value: string | null) {
    this._data = value === null ? '' : String(value);
  }

  get textContent(): string | null {
    return this._data;
  }

  set textContent(value: string | null) {
    this._data = value === null ? '' : String(value);
  }

  cloneNode(): Node {
    return new ProcessingInstruction(this._target, this._data, (this as any)._ownerDocument) as unknown as Node;
  }
}
