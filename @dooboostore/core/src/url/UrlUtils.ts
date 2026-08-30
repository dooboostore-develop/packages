export namespace UrlUtils {
  // 1 const fullUrl = "http://naver.com/asdwd?a=na";

  // 2
  // 3 try {
  //   4   const url = new URL(fullUrl);
  //   5   const origin = url.origin; // "http://naver.com"
  //   6
  //   7   console.log(origin); // 출력: http://naver.com
  //   8 } catch (error) {
  //   9   console.error("유효하지 않은 URL입니다:", error);
  //   10 }
  export const origin = (fullurl: string) => {
    return new URL(fullurl).origin;
  };

  export const toUrl = (fullUrl: string) => {
    return new URL(fullUrl);
  };

  /**
   * Returns the relative path (pathname + search) from a URL or string.
   */
  export const getUrlPath = (url: URL | string | { pathname: string; search: string }): string => {
    if (typeof url === 'string') {
      try {
        const u = new URL(url, 'http://localhost');
        return u.pathname + u.search;
      } catch (e) {
        return url;
      }
    }
    return (url.pathname ?? '') + (url.search ?? '');
  };

  /**
   * URLSearchParams에서 특정 키를 삭제
   */
  export const deleteSearchParam = (searchParams: URLSearchParams, name: string | string[]): URLSearchParams => {
    const names = Array.isArray(name) ? name : [name];
    names.forEach(n => searchParams.delete(n));
    return searchParams;
  };

  /**
   * URLSearchParams에 키-값 쌍을 추가
   */
  export const appendSearchParam = (searchParams: URLSearchParams, params: [[string, string]]): URLSearchParams => {
    params.forEach(([key, value]) => searchParams.append(key, value));
    return searchParams;
  };

  /**
   * URLSearchParams에서 키를 삭제하고 새로운 값을 추가 (upsert)
   * 기존 값이 있으면 삭제하고, 새로운 값을 추가
   */
  export const upsertSearchParam = (searchParams: URLSearchParams, params: Record<string, string | string[]>): URLSearchParams => {
    Object.entries(params).forEach(([key, value]) => {
      searchParams.delete(key); // 기존 값 삭제
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v));
      } else {
        searchParams.append(key, value);
      }
    });
    return searchParams;
  };

  /**
   * 상대경로를 현재 URL 기준 절대경로(URL)로 변환한다.
   * 이미 절대경로인 경우 그대로 반환한다.
   *
   * @param relative - 변환할 상대경로 또는 절대경로
   * @param base     - 기준이 되는 절대경로 (예: location.href)
   * @returns 절대경로로 변환된 URL 객체
   *
   * @example
   * resolveUrl('./data.json', 'https://example.com/app/page')
   * // → URL { href: 'https://example.com/app/data.json' }
   *
   * resolveUrl('/api/users', 'https://example.com/app/page')
   * // → URL { href: 'https://example.com/api/users' }
   *
   * resolveUrl('https://other.com/foo', 'https://example.com/app/page')
   * // → URL { href: 'https://other.com/foo' }
   */
  /**
   * 상대경로를 base URL 기준 절대경로(URL)로 변환한다.
   * 이미 절대경로인 경우 그대로 반환한다.
   *
   * @param relative - 변환할 상대경로 또는 절대경로
   * @param base     - 기준이 되는 절대경로 (예: location.href)
   * @returns 절대경로로 변환된 URL 객체
   *
   * @example
   * toAbsoluteUrl('./data.json', 'https://example.com/app/page')
   * // → URL { href: 'https://example.com/app/data.json' }
   *
   * toAbsoluteUrl('/api/users', 'https://example.com/app/page')
   * // → URL { href: 'https://example.com/api/users' }
   *
   * toAbsoluteUrl('https://other.com/foo', 'https://example.com/app/page')
   * // → URL { href: 'https://other.com/foo' }
   */
  export const toAbsoluteUrl = (relative: string, base: string): URL => {
    return new URL(relative, base);
  };

  /**
   * fetch의 input(string | URL | Request)을 base 기준 절대경로로 변환한다.
   * - string  → 절대경로 string으로 반환
   * - URL     → 절대경로 URL로 반환
   * - Request → url만 교체한 새 Request로 반환 (headers/body 등 유지)
   *
   * @example
   * toAbsoluteRequest('/api/users', 'https://example.com')
   * // → 'https://example.com/api/users'
   *
   * toAbsoluteRequest(new Request('./data.json'), 'https://example.com/app/')
   * // → Request { url: 'https://example.com/app/data.json' }
   */
  export function toAbsoluteRequest(input: string, base: string): string;
  export function toAbsoluteRequest(input: URL, base: string): URL;
  export function toAbsoluteRequest(input: Request, base: string): Request;
  export function toAbsoluteRequest(input: RequestInfo | URL, base: string): RequestInfo | URL;
  export function toAbsoluteRequest(input: RequestInfo | URL, base: string): RequestInfo | URL {
    if (input instanceof URL) {
      return toAbsoluteUrl(input.href, base);
    }
    if (typeof input === 'string') {
      return toAbsoluteUrl(input, base).href;
    }
    // Request 객체 - url만 교체하고 나머지 옵션(headers, body, method 등)은 유지
    return new Request(toAbsoluteUrl(input.url, base).href, input);
  }

  /**
   * URLSearchParams 조작을 위한 헬퍼
   */
  export const manipulateSearchParams = (searchParams: URLSearchParams, options?: { delete?: string[]; append?: [[string, string]]; upsert?: Record<string, string | string[]> }): URLSearchParams => {
    if (options?.delete) {
      deleteSearchParam(searchParams, options.delete);
    }
    if (options?.append) {
      appendSearchParam(searchParams, options.append);
    }
    if (options?.upsert) {
      upsertSearchParam(searchParams, options.upsert);
    }
    return searchParams;
  };
}
