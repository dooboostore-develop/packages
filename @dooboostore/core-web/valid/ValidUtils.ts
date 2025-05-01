export namespace ValidUtils {
  export const isBrowser = (callBack?: (win: Window) => void): boolean => {
    const boolean = (typeof window !== 'undefined') && (typeof Window !== 'undefined');
    if (boolean && callBack) {
      callBack(window);
    }
    return boolean;
  };

  export const hasParentWindow = (win: Window) => ValidUtils.isBrowser() && win.parent && win !== win.parent;

  //////////////
  /**
   *  SNS Inapp Browser Check
   *  카카오톡 / 네이버 / 페이스북 / 인스타그램 지원
   */
  export const isSocialNetworkServiceInappBrowser = (): boolean => {
    const userAgent = ValidUtils.isBrowser() ? window.navigator.userAgent.toLowerCase() : 'none';
    return /kakaotalk|naver|facebook|insta|FBAN|FBAV/.test(userAgent);
  };

  /**
   *  IOS Webview 접속인지 체크
   */
  export const isWkWebview = (): boolean =>
    ValidUtils.isBrowser() &&
    (window as any)['webkit'] != null &&
    (window as any)['webkit'].messageHandlers != null &&
    (window as any)['webkit'].messageHandlers['System'] != null;
  export function isiPhone(): boolean {
    return ValidUtils.isBrowser() && /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase());
  }
  /**
   *  Android Webview 접속인지 체크
   */
  export const isAndroidWebview = (): boolean => {
    return ValidUtils.isBrowser() && (window as any)['System'] != null;
  };
}
