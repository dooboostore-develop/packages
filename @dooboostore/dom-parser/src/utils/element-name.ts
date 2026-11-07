/**
 * Element-name validation for `document.createElement()`.
 *
 * Measured against Chromium (36-probe matrix):
 * - rejected: empty name; any name containing U+0000, space, TAB, LF, CR,
 *   FF, `/` or `>`; and any name whose FIRST character is not ASCII alpha,
 *   `_`, `:` or non-ASCII (≥ U+0080).
 * - accepted: `<`, `=`, `"`, `'`, other punctuation in non-leading position,
 *   NBSP, other controls, non-ASCII (`한a`, `Äa`).
 *
 * Note this is a different rule from `setAttribute()`/`createAttribute()`
 * (see utils/attribute-name): `createElement('a=b')` is fine while
 * `setAttribute('a=b')` throws, and `createElement('<a')` throws while
 * `setAttribute('<a')` is fine.
 */
const INVALID_ELEMENT_NAME_CHARS = /[\u0000\t\n\f\r />]/;

export function isValidElementName(name: string): boolean {
  if (!name) return false;
  if (INVALID_ELEMENT_NAME_CHARS.test(name)) return false;
  const first = name.charCodeAt(0);
  const isAsciiAlpha = (first >= 0x41 && first <= 0x5a) || (first >= 0x61 && first <= 0x7a);
  return isAsciiAlpha || first === 0x5f /* _ */ || first === 0x3a /* : */ || first >= 0x80;
}

class InvalidCharacterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidCharacterError';
  }
}

export function assertValidElementName(name: string): void {
  if (!isValidElementName(name)) {
    throw new InvalidCharacterError(`The tag name provided ('${name}') is not a valid name.`);
  }
}
