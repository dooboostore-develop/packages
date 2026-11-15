/**
 * URL 을 담는 속성의 IDL 값 — a.href, img.src, form.action …
 * 브라우저처럼 문서의 base URL(<base href> 반영) 기준으로 절대 주소로 바꾼다. 속성이 없으면 '', 주소로 못 바꾸면 적힌 그대로.
 * 적힌 값 그대로가 필요하면 getAttribute(name).
 * https://html.spec.whatwg.org/multipage/common-dom-interfaces.html#reflecting-content-attributes-in-idl-attributes (USVString, reflects a URL)
 */
export function reflectUrl(element: { getAttribute(name: string): string | null; baseURI: string }, name: string, base = element.baseURI): string {
  const value = element.getAttribute(name);
  if (value === null) return '';
  try {
    return new URL(value.trim(), base || undefined).href;
  } catch {
    return value;
  }
}
