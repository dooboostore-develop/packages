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
  }

  export const toUrl = (fullUrl: string) => {
    return new URL(fullUrl);
  }

  /**
   * URLSearchParams에서 특정 키를 삭제
   */
  export const deleteSearchParam = (searchParams: URLSearchParams, name: string | string[]): URLSearchParams => {
    const names = Array.isArray(name) ? name : [name];
    names.forEach(n => searchParams.delete(n));
    return searchParams;
  }

  /**
   * URLSearchParams에 키-값 쌍을 추가
   */
  export const appendSearchParam = (searchParams: URLSearchParams, params: [[string, string]]): URLSearchParams => {
    params.forEach(([key, value]) => searchParams.append(key, value));
    return searchParams;
  }

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
  }

  /**
   * URLSearchParams 조작을 위한 헬퍼
   */
  export const manipulateSearchParams = (
    searchParams: URLSearchParams,
    options?: { delete?: string[], append?: [[string, string]], upsert?: Record<string, string | string[]> }
  ): URLSearchParams => {
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
  }

}