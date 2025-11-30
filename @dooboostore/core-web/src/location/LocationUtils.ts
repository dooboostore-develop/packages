export namespace LocationUtils {
    export const hash = (window: Window): string => {
        return window.location.hash.replace('#', '')
    }

    export const hashPath = (window: Window): string => {
        return window.location.hash.replace('#', '').split('?')[0]
    }

    // search는 앞에 ? 붙어있다 브라우저에서도 location.search
    export const hashSearch = (window: Window): string => {
      const string = window.location.hash.replace('#', '').split('?')[1];
      return string ? `?${string}` : '';
    }

    export const hashQueryParams = (window: Window): Map<string, string> => {
        const s = window.location.hash.replace('#', '').split('?')[1] || '';
        return LocationUtils.queryStringToMap(s);
    }

    export const path = (window: Window): string => {
        return window.location.pathname;
    }

    export const search = (window: Window): string => {
        return window.location.search || '';
    }


    export const pathQueryParamsObject = (window: Window): { [key:string]: string } => {
        return LocationUtils.queryStringToObject(window.location.search.substring(1));
    }

    export const hashQueryParamsObject = (window: Window): { [key:string]: string } => {
        const s = window.location.hash.split('?').pop() ?? '';
        if (s.startsWith('#')) {
            return {};
        } else {
            return LocationUtils.queryStringToObject(s);
        }
    }

    export const pathQueryParams = (window: Window): Map<string, string> => {
        return LocationUtils.queryStringToMap(window.location.search.substring(1));
    }

    export const queryStringToMap = (s: string) => {
        const params = new Map<string, string>();
        const vars = s.split('&') || [];
        vars.forEach(it => {
            const kv = it.split('=') || [];
            if (kv[0] && kv[0].length > 0) {
                params.set(kv[0], kv[1]);
            }
        })
        return params;
    }

    export const queryStringToObject = (s: string): { [key:string]: string } => {
        const params = {} as { [key:string]: string };
        const vars = s.split('&') || [];
        vars.forEach(it => {
            const kv = it.split('=') || [];
            if (kv[0] && kv[0].length > 0) {
                params[kv[0]] = kv[1];
            }
        })
        return params;
    }
}
