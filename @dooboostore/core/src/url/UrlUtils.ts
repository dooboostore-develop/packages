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

}