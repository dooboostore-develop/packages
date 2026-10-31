/**
 * WebIDL DOMString coercion shared by the IDL setters.
 *
 * Browsers clear on `null` but String()-coerce everything else:
 * `innerHTML = null` -> `''`, `innerHTML = undefined` -> `"undefined"`,
 * `innerText = 5` -> `"5"`. (Verified against Chromium.)
 */
export function coerceNullableString(value: unknown): string {
    return value === null ? '' : String(value);
}
