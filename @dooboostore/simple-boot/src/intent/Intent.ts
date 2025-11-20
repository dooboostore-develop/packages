import { Expression } from '@dooboostore/core/expression/Expression';

export enum PublishType {
  DATA_PARAMETERS = 'DATA_PARAMETERS',
  INLINE_DATA_PARAMETERS = 'INLINE_DATA_PARAMETERS',
}

/* uri struct
    scheme uri example: mymodule://asd/asd/b?a=545&aa=33&wow=wow
    global uri example: ://asd/asd/b?a=545&aa=33&wow=wow
    route uri example: Router(/users/aa/ffw)://asd/asd/b?a=545&aa=33&wow=wow
    Symbol.for uri example: Symbol.for(zzz)://asd/asd/b?a=545&aa=33&wow=wow
    <스킴>://<사용자이름>:<비밀번호>@<호스트>:<포트>/<경로>?<질의>#<프레그먼트>
*/
export class Intent<T = any, E = any> {
  public publishType?: PublishType;
  public sessionData = new Map<string, any>();

  constructor(public uri: string | { symbol: Symbol | Symbol[], uri: `/${string}` }, public data?: T, public event?: E) {

    if (typeof uri === 'string') {
      const match = uri.match(/^Symbol\.for\((.+)\):\/(.*)$/);
      if (match) {
        const symbol = Symbol.for(match[1] as string);
        this.uri = {
          symbol: symbol,
          uri: match[2] as `/${string}`,
        };
      }
    }
  }

  get symbols() {
    if (typeof this.uri === 'object') {
        // ensure symbol is always an array
        return Array.isArray(this.uri.symbol) ? this.uri.symbol : [this.uri.symbol];
    }
    return undefined;
  }

  get scheme() {
    if (typeof this.uri === 'string') {
      const parts = this.uri.split('://');
      if (parts.length > 1) {
        return parts[0];
      }
      return undefined;
    } else {
      return undefined;
    }
  }

  get paths() {
    return (this.pathname.split('/') ?? []);
  }

  get fullPath() {
    const uri = typeof this.uri === 'string' ? this.uri : this.uri.uri
    const paths = uri.split('://');
    return paths[paths.length >= 2 ? 1 : 0] ?? '';
  }

  get pathname() {
    const paths = this.fullPath.split('?');
    return paths[0];
  }

  get query() {
    const paths = this.fullPath.split('?');
    // console.log('fullPath', this.fullPath, paths)
    return paths[1] ?? '';
  }


  getQueryParamDecodeURI<T>():T;
  getQueryParamDecodeURI(key: string): string | string[] | undefined;
  getQueryParamDecodeURI<T>(key?: string): string | string[] | undefined | T {
    const p = this.queryParamsDecodeURI;
    if (key) {
      return p[key];
    } else {
      return p as T;
    }
  }
  getQueryParamDecodeURIFirst(key: string): string  | undefined {
    const param = this.getQueryParamDecodeURI(key);
    if (Array.isArray(param)) {
      return param[0];
    } else {
      return param;
    }
  };

  getQueryParam<T>():T;
  getQueryParam(key: string): string | string[] | undefined;
  getQueryParam<T>(key?: string): string | string[] | undefined | T {
    const p = this.queryParams;
    if (key) {
      return p[key];
    } else {
      return p as T;
    }
  }
  getQueryParamFirst(key: string): string  | undefined {
    const param = this.getQueryParam(key);
    if (Array.isArray(param)) {
      return param[0];
    } else {
      return param;
    }
  }

  get queryParams(): { [key: string]: string | string[] } {
    const param = {} as { [key: string]: string | string[] };
    this.query.split('&')?.forEach(it => {
      const a = it.split('=')
      if (param[a[0]]) {
        if (Array.isArray(param[a[0]])) {
          (param[a[0]] as string[]).push(a[1]);
        } else {
          param[a[0]] = [param[a[0]] as string, a[1]];
        }
      } else {
        param[a[0]] = a[1];
      }
    })
    return param;
  }

  get queryParamsDecodeURI(): { [key: string]: string| string[] } {
    const params = this.queryParams;
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        const param = params[key];
        if (Array.isArray(param)) {
          params[key] = param.map(p => decodeURIComponent(p));
        } else {
          params[key] = decodeURIComponent(param);
        }
      }
    }
    return params;
  }

  getPathnameData(urlExpression: string) {
    return Expression.Path.pathNameData(this.pathname, urlExpression);
  }

  

  get isSymbolScheme(): boolean {
    return this.symbols !== undefined;
  }
}
