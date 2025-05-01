export namespace CookieUtils {
  export type Option = {
    expireSecond?: number | null;
    maxAge?: number;
    path?: null | string;
    httpOnly?: boolean;
    secure?: boolean;
    domain?: string;
    sameSite?: 'Strict' | 'Lax' | 'None';
  };

  export const names = (doc: Document = document) => {
    const ar = doc.cookie.split('; ');
    const names = [];
    for (let i = 0; i < ar.length; i++) {
      const c = ar[i];
      const nv = c.split('=');
      names.push(nv[0]);
    }
    return names;
  };

  export const get = (name: string, doc: Document = document) => {
    const ar = doc.cookie.split('; ');
    for (let i = 0; i < ar.length; i++) {
      const c = ar[i];
      const nv = c.split('=');
      if (nv[0] == name) return decodeURIComponent(nv[1]);
    }
    return null;
  };

  export const make = (name: string, value: null | string, option?: Option) => {
    const cookieStr =
      name +
      '=' +
      (value ? encodeURIComponent(value) : '') +
      (option?.path ? `; path=${option?.path}` : '') +
      (option?.expireSecond !== undefined
        ? '; expires=' +
          (() => {
            if (option.expireSecond !== null) {
              const expireDate = new Date();
              expireDate.setTime(expireDate.getTime() + option.expireSecond * 1000); // mmsecond -> second
              return expireDate.toUTCString();
            } else {
              return new Date(0).toUTCString();
            }
          })()
        : '') +
      (option?.domain ? `; Domain=${option?.domain}` : '') +
      (option?.maxAge ? `; Max-Age=${option?.maxAge}` : '') +
      (option?.secure ? '; Secure' : '') +
      (option?.httpOnly ? '; HttpOnly' : '') +
      (option?.sameSite ? `; SameSite=${option.sameSite}` : '');
    return cookieStr;
  };

  export const set = (name: string, value: string | null, option: Option, doc: Document = document) => {
    const cookieStr = CookieUtils.make(name, value, option);
    doc.cookie = cookieStr;
  };

  export const remove = (name: string, option: Option, doc: Document = document) => {
    CookieUtils.set(name, null, { ...option, expireSecond: null }, doc);
  };
}
