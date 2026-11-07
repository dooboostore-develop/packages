/**
 * Attribute-name validation for setAttribute()/createAttribute().
 *
 * Measured against Chromium (19-probe matrix; both APIs agree exactly):
 * rejected = empty name, or any of { U+0000, space, TAB, LF, CR, FF, `>`,
 * `/`, `=` }. Accepted = `<`, `"`, `'`, `:`, leading digit, NBSP and other
 * controls — i.e. Chromium validates against the HTML tokenizer's
 * attribute-name character set, NOT the XML Name production (which would
 * also reject `<`, `"`, `'`). We match the browser.
 */
const INVALID_ATTRIBUTE_NAME_CHARS = /[\u0000\t\n\f\r />=]/;

class InvalidCharacterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidCharacterError';
  }
}

export function assertValidAttributeName(name: string): void {
  if (name === '' || INVALID_ATTRIBUTE_NAME_CHARS.test(name)) {
    throw new InvalidCharacterError(`The qualified name provided ('${name}') contains an invalid character.`);
  }
}
