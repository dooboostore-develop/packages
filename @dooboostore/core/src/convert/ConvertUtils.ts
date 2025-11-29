import { ValidUtils } from '../valid/ValidUtils';
import { FieldType, FilterTuple } from '../types';
import { Point2D } from '../entity/Point2D';
import { Point3D } from '../entity/Point3D';
import { Rect } from '../entity/Rect';
import { ObjectUtils } from '../object/ObjectUtils';
import { IOS3166_1_Code } from '../code/IOS3166_1';

export namespace ConvertUtils {
  export type RGBA = { r?: number, g?: number, b?: number, a?: number };
  export type MinMaxCenterAvgDiff<T> = { min: T, max: T, center: T, avg: T };
  export type ToURLSearchParamsParams = { [key: string]: any } | URLSearchParams | [string, unknown][] | string;
  export const objToGetURL = (obj: any): string => {
    return Object.keys(obj).reduce((prev, key, i) => (
      `${prev}${i !== 0 ? '&' : ''}${key}=${obj[key]}`
    ), '');
  };

  export const mapToJson = (map: Map<string, any>): string => {
    return JSON.stringify(
      Array.from(
        map.entries()
      ).reduce((o: any, [key, value]) => {
        o[key] = value;
        return o;
      }, {}));
  };

  // export const fixed = (num: number, fractionDigits: number): number => {
  //   const factor = Math.pow(10, fractionDigits);
  // }
  export const jsonToMap = (jsonStr: any): Map<string, string> => {
    return new Map(JSON.parse(jsonStr));
  };

  export const toUrl = (data: string) => {
    try {
      return new URL(data);
    }
    catch (e) {
      throw new Error(`Invalid URL string: ${data}`);
    }
  }


  export const decodeURIString = (data: string) => {
    return decodeURIComponent(data);
  }
  
  export const encodeURIString = (data: string) => {
    return encodeURIComponent(data);
  }

  export const objToStrMap = (obj: any): Map<string, string> => {
    const strMap = new Map();
    for (const k of Object.keys(obj)) {
      strMap.set(k, obj[k]);
    }
    return strMap;
  };

  export const jsonToStrMap = (jsonStr: string) => {
    return ConvertUtils.objToStrMap(JSON.parse(jsonStr));
  };

  export const strToObject = (message: string): any => {
    return JSON.parse(message);
  };

  export const objToJson = (obj: any): string => {
    return JSON.stringify(obj);
  };

  export const objToMap = (obj: any): Map<string, any> => {
    const mp = new Map<string, any>();
    Object.keys(obj).forEach((k) => {
      mp.set(k, obj[k]);
    });
    return mp;
  };

  export const mapToObj = (map: Map<string, any>): any => {
    const obj = {} as any;
    map.forEach((v, k) => {
      obj[k] = v;
    });
    return obj;
  };

  export const snakeToCamelCase = (str: string): string => {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }
  export const camelToSnakeCase = (str: string): string => {
    return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
  };

  export function toFormData (obj: any)  {
    const formData = new FormData();
    for (const key in obj)
      formData.append(key, obj[key]);
    return formData;
  }

  export function toObject<T>(obj: URLSearchParams, config: { firstValue: true }): FieldType<T, string>;
  export function toObject(obj: URLSearchParams): { [key: string]: string | string[] };
  export function toObject<T>(obj: FormData): T;
  export function toObject<T>(obj: [string, unknown][]): T;
  export function toObject<T>(obj:  Iterable<any>): T;
  export function toObject(obj: any): any;
  export function toObject(obj: URLSearchParams | FormData |any, config?: { firstValue: boolean }): any {
    if (obj instanceof URLSearchParams) {
      const robj = {} as any;
      obj.forEach((v, k) => {
        if (config?.firstValue && robj[k] === undefined) {
          robj[k] = v;
        } else if (!config?.firstValue) {
          if (robj[k]) {
            if (Array.isArray(robj[k])) {
              robj[k].push(v);
            } else {
              robj[k] = [robj[k], v];
            }
          } else {
            robj[k] = v;
          }
        }
      })
      return robj;
    } else if(obj instanceof FormData) {
      // new Map().entries()
      // Object.entries({})
      // obj = Object.fromEntries(obj.entries());
      const formDataToObject = (formData: any) => {
        const obj: any = {};
        // FormData의 모든 키를 순회
        for (const key of formData.keys()) {
          const values = formData.getAll(key); // 동일 키의 모든 값 가져오기
          // 값이 하나면 단일 값으로, 여러 개면 배열로 저장
          obj[key] = values.length > 1 ? values : values[0];
        }
        return obj;
      }
      return formDataToObject(obj);
    } else if (obj && typeof obj[Symbol.iterator] === 'function') {
      return Object.fromEntries(obj);
    } else if (Array.isArray(obj)) {
      return Object.fromEntries(obj);
    }else {
      // console.log(Object.prototype.toString.call(obj));
      if (ValidUtils.isMap(obj)) {
        const map = obj as Map<string, any>;
        obj = ConvertUtils.mapToObj(map);
      }
      if (ValidUtils.isArray(obj)) {
        const arr = obj as any[];
        for (let i = 0; i < arr.length; i++) {
          arr[i] = ConvertUtils.toObject(arr[i]);
        }
      }

      if (ValidUtils.isObject(obj)) {
        for (const property in obj) {
          obj[property] = ConvertUtils.toObject(obj[property]);
        }
      }

      return obj;
    }
  };

  export const toArray = <T>(data?: T | T[] | Set<T>): T[] => {
    if (data instanceof Set) {
      return Array.from(data.values());
    }

    const datas = (Array.isArray(data) ? data : (data ? [data] : []));
    return datas;
  }
  export const flatArray = <T>(...data: (T | Iterable<T>)[]): T[] => {
    const datas = data.flatMap<T>((item) => (item instanceof Object && Symbol.iterator in item ? Array.from(item) : [item]));
    return datas;
  };

  export const iteratorToArray = <T>(it: any): T[] => {
    return Array.from(it) as T[];
  };

  export const toJson = (obj: any): string => {
    const at = ConvertUtils.toObject(obj);
    return JSON.stringify(at);
  };

  export const concatenateToAttribute = (object_o: any) => {
    return ConvertUtils.concatenateToString(object_o, '=', ' ', '\'');
  };

  export const concatenateToParameter = (object_o: any) => {
    return ConvertUtils.concatenateToString(object_o, '=', '&', '');
  };

  export const concatenateToString = (object_o: any, unionString_s = '=', spilString_s = ' ', pairString_s = '') => {
    const results: any[] = [];
    for (const property in object_o) {
      const value = object_o[property];
      if (value) {
        results.push(property.toString() + unionString_s + pairString_s + value + pairString_s);
      }
    }

    return results.join(spilString_s);
  };

  export const specialCharsToEscape = (data: string): string => {
    return data.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  export const decodeHTMLEscape = (data: string): string => {
    // HTML 엔티티 이스케이프를 디코드합니다.
        return data.replace(/&amp;/g, '&')
                   .replace(/&lt;/g, '<')
                   .replace(/&gt;/g, '>')
                   .replace(/&quot;/g, '"')
                   .replace(/&#39;/g, "'")
                   .replace(/&#x2F;/g, '/');
  }

  export function escapeHTML(htmlString: string, option?: { targets?: string[] }): string {
    if (!htmlString) return '';
    
    // HTML escape map - 순서 중요: & 를 먼저 처리해야 함
    // https://dev-handbook.tistory.com/23
    const escapeMap: Record<string, string> = {
      '&': '&amp;',   // 반드시 먼저 처리
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',   // or &apos; (하지만 HTML4에서는 &#39; 권장)
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;',
      '{': '&#123;',
      '}': '&#125;',
      '#': '&#35;',
      '$': '&#36;',
      '\n': '&#10;',  // newline
      '\r': '&#13;',  // carriage return
      '\t': '&#9;',   // tab
      '\u00A0': '&nbsp;', // non-breaking space
      '¢': '&cent;',
      '£': '&pound;',
      '¥': '&yen;',
      '€': '&euro;',
      '©': '&copy;',
      '®': '&reg;',
      '™': '&trade;',
      '°': '&deg;',
      '±': '&plusmn;',
      '×': '&times;',
      '÷': '&divide;',
      '−': '&minus;',
      '•': '&bull;',
      '…': '&hellip;',
      '←': '&larr;',
      '→': '&rarr;',
      '↑': '&uarr;',
      '↓': '&darr;',
      '↔': '&harr;',
    };

    // targets 옵션이 있으면 해당 문자만 필터링
    const targetsSet = option?.targets ? new Set(option.targets) : null;
    const filteredEscapeMap = targetsSet 
      ? Object.fromEntries(Object.entries(escapeMap).filter(([key]) => targetsSet.has(key)))
      : escapeMap;

    // & 가 targets에 포함되어 있거나 targets가 없으면 & 를 먼저 처리
    const shouldEscapeAmpersand = !targetsSet || targetsSet.has('&');
    
    // 이스케이프할 문자들로 정규식 패턴 생성
    const charsToEscape = Object.keys(filteredEscapeMap).filter(char => char !== '&');
    if (charsToEscape.length === 0 && !shouldEscapeAmpersand) {
      return htmlString; // 이스케이프할 문자가 없으면 원본 반환
    }

    // 정규식 생성 (특수 문자 이스케이프 필요)
    const escapedChars = charsToEscape.map(char => {
      // 정규식에서 특별한 의미를 가진 문자들을 이스케이프
      return char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }).join('');

    let result = htmlString;
    
    // & 를 먼저 처리 (옵션에 포함된 경우)
    if (shouldEscapeAmpersand) {
      result = result.replace(/&/g, '&amp;');
    }
    
    // 나머지 문자 처리
    if (escapedChars.length > 0) {
      const regex = new RegExp(`[${escapedChars}]`, 'g');
      result = result.replace(regex, (match) => {
        return filteredEscapeMap[match] || match;
      });
    }

    return result;
  }

  export const copyObject = <T extends Record<string, any>>(obj: T, update: Partial<T> = {}): T => {
    return {...obj, ...update};
  };

  export const copyArrayWithAddition = <T extends unknown[]>(arr: FilterTuple<T>, update?: T): T => {
    return [...arr, ...(update || [])] as T;
  };

  export const hexToInt = (hex: string): number => {
    if (hex.startsWith('#')) {
      hex = hex.slice(1);
    }
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    return parseInt(hex, 16);
  };


  // export const toHex = (val: number): string => {
  //   const hex = Math.floor(val).toString(16).toUpperCase();
  //   return (hex.length === 1 ? '0' + hex : hex);
  // };

  export const toHex = (num: number): string => {
    if (num < 0) {
      num = 0xFFFFFFFF + num + 1;
    }
    num = Number(num.toFixed(0));
    return num.toString(16).padStart(2, '0').toUpperCase();
  };

  export const toHexColor = (rgba: RGBA): string => {
    const r = ConvertUtils.toHex(rgba.r ?? 0);
    const g = ConvertUtils.toHex(rgba.g ?? 0);
    const b = ConvertUtils.toHex(rgba.b ?? 0);
    const a = ConvertUtils.toHex(rgba.a ?? 255);
    return `#${r}${g}${b}${a}`;
  };

  export const avgColor = (color: RGBA[]): RGBA => {
    const sum = color.reduce((acc: Required<RGBA>, c) => {
      acc.r += c.r ?? 0;
      acc.g += c.g ?? 0;
      acc.b += c.b ?? 0;
      acc.a += c.a ?? 0;
      return acc;
    }, {r: 0, g: 0, b: 0, a: 0}) as Required<RGBA>;
    const avg = {r: Math.floor(sum.r / color.length), g: Math.floor(sum.g / color.length), b: Math.floor(sum.b / color.length), a: Math.floor(sum.a / color.length)};
    return avg;
  };

  export const toRGBA = (hex?: string | null): RGBA => {
    hex ??= '#000000FF';
    const hexColor = hex.replace('#', '');
    const r = parseInt(hexColor.slice(0, 2) || '0', 16);
    const g = parseInt(hexColor.slice(2, 4) || '0', 16);
    const b = parseInt(hexColor.slice(4, 6) || '0', 16);
    const a = hexColor.length > 6 ? parseInt(hexColor.slice(6, 8) || '0', 16) : 255;
    return {r, g, b, a};
  };

  export const minMaxCenterAvg = <T extends { [key: string]: number }>(obj: T[]): { [key in keyof T]?: MinMaxCenterAvgDiff<number> & {diff: number} } => {
    const result: { [key in keyof T]: { min: number, max: number, center: number, diff: number, avg: number } } = {} as any;

    const allKeys = ObjectUtils.uniqueKeys(obj);
    for (const key of allKeys) {
      const values = obj.map(item => item[key]);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const center = (min + max) / 2;
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;

      result[key as keyof T] = {min, max, center, avg, diff: max - min};
    }

    return result;
  }

  export const minMaxCenterRectAvg2D = (point2Ds: (Point2D | { x: number, y: number })[]): MinMaxCenterAvgDiff<Point2D> & { minMaxRect: Rect } => {
    const min = new Point2D(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
    const max = new Point2D(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);
    let sum = new Point2D(0, 0);
    point2Ds.forEach((p) => {
      min.x = Math.min(min.x, p.x);
      min.y = Math.min(min.y, p.y);
      max.x = Math.max(max.x, p.x);
      max.y = Math.max(max.y, p.y);
      sum.x += p.x;
      sum.y += p.y;
    });
    const center = new Point2D((min.x + max.x) / 2, (min.y + max.y) / 2);
    const avg = new Point2D(sum.x / point2Ds.length, sum.y / point2Ds.length);
    const minMaxRect = new Rect(min.x, min.y, max.x - min.x, max.y - min.y);
    return {min, max, center, avg, minMaxRect};
  };


  export const minMaxCenterAvg3D = (point3Ds: (Point3D | { x: number, y: number, z: number })[]): MinMaxCenterAvgDiff<Point3D> => {
    const min = new Point3D(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
    const max = new Point3D(Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);
    let sum = new Point3D(0, 0, 0);
    point3Ds.forEach((p) => {
      min.x = Math.min(min.x, p.x);
      min.y = Math.min(min.y, p.y);
      min.z = Math.max(min.z, p.z);
      max.x = Math.max(max.x, p.x);
      max.y = Math.max(max.y, p.y);
      max.z = Math.max(max.z, p.y);
      sum.x += p.x;
      sum.y += p.y;
      sum.z += p.z;
    });
    const center = new Point3D((min.x + max.x) / 2, (min.y + max.y) / 2, (min.z + max.z) / 2);
    const avg = new Point3D(sum.x / point3Ds.length, sum.y / point3Ds.length, sum.z / point3Ds.length);
    return {min, max, center, avg};
  };

  export const roundRectRadiiToFullRadii = (radii?: [number] | [number, number] | [number, number, number] | [number, number, number, number]) => {
    if (!radii) {
      return [0, 0, 0, 0];
    }
    if (radii.length === 1) {
      return [radii[0] ?? 0, radii[0] ?? 0, radii[0] ?? 0, radii[0] ?? 0];
    } else if (radii.length === 2) {
      return [radii[0] ?? 0, radii[1] ?? 0, radii[0] ?? 0, radii[1] ?? 0];
    } else if (radii.length === 3) {
      return [radii[0] ?? 0, radii[1] ?? 0, radii[2] ?? 0, radii[1] ?? 0];
    } else {
      return radii;
    }
  };


  export const toArrayDirectionChange = <T>(array: T[][]) => {
    // 입력 배열이 비어있거나 첫 번째 행이 비어있으면 빈 배열 반환
    if (!array || array.length === 0 || !array[0] || array[0].length === 0) {
      return [];
    }
    const result: T[][] = [];
    const numCols = array[0].length; // 기준 열 개수 (첫 행 기준)
    const numRows = array.length;   // 행 개수

    for (let i = 0; i < numCols; i++) {
      const newRow: T[] = [];
      for (let j = 0; j < numRows; j++) {
        // 만약 jagged array 가능성을 엄격히 다루려면 여기서 array[j].length > i 인지 확인 필요
        // 하지만 T[][] 타입 시그니처는 보통 rectangular array를 기대함
        newRow.push(array[j][i]);
      }
      result.push(newRow);
    }
    return result;
  }

  // groupBy 함수 구현
  export const groupByMap = <T, K>(array: T[], keySelector: (item: T) => K): Map<K, T[]> => {
    return array.reduce((map, item) => {
      const key = keySelector(item);
      const group = map.get(key) || [];
      group.push(item);
      map.set(key, group);
      return map;
    }, new Map<K, T[]>());
  }
  export const groupByObject = <T, K extends string | number | symbol>(
    array: T[],
    keySelector: (item: T) => K
  ): Record<K, T[]> => {
// groupByMap 호출
    const map = groupByMap(array, keySelector);
    // Map을 Record로 변환
    return Object.fromEntries(map) as Record<K, T[]>;
  }



  export const toURLSearchParams = (data: ToURLSearchParamsParams): URLSearchParams =>{
    const searchParams = new URLSearchParams();
    if (typeof data === 'string') {
      new URLSearchParams(data).forEach((value, key) => {
        searchParams.append(key, value);
      });
    } else if (typeof data === 'object') {
      const forTarget = data instanceof URLSearchParams ? data.entries() : (Array.isArray(data) ? data : Object.entries(data));
      for (const [k, v] of Array.from(forTarget)) {
        if (Array.isArray(v)) {
          v.forEach(it => searchParams.append(k, it));
        } else {
          searchParams.append(k, v as any);
        }
      }
    }
    return searchParams;
  }
  // export const RelativeHumanReadableTimeLabels = {
  //   [IOS3166_1_Code.KOR]: {
  //     justNow: '방금 전',
  //     minutesAgo: '분 전',
  //     hoursAgo: '시간 전',
  //     daysAgo: '일 전',
  //   }
  //
  // }
  // export type RelativeHumanReadableTimeLabel = {
  //   justNow: string,
  //   minutesAgo: string,
  //   hoursAgo: string,
  //   daysAgo: string,
  // };
  // export type RelativeHumanReadableTimeConfig = {
  //   label:  RelativeHumanReadableTimeLabel;
  // }
  // export const formatRelativeHumanReadableTime = (date: Date | string | number, config: RelativeHumanReadableTimeConfig): string => {
  //   if (!(date instanceof Date)) {
  //     date = new Date(date);
  //   }
  //   const now = new Date();
  //   const diffMs = now.getTime() - date.getTime();
  //   const diffMinutes = Math.floor(diffMs / (1000 * 60));
  //   const diffHours = Math.floor(diffMinutes / 60);
  //
  //   if (diffMinutes < 1) return config.label.justNow;
  //   if (diffMinutes < 60) return `${diffMinutes}${config.label.minutesAgo}`;
  //   if (diffHours < 24) return `${diffHours}${}`;
  //   return `${Math.floor(diffHours / 24)}일 전`;
  // }

 /**
  * 문자열 JSON을 키-값 쌍 배열로 변환합니다.
  *
  * @param {string} stringJson - JSON 형식의 문자열 (예: "{value: this.child.obj.name}")
  * @return {Array<{ key: string, value: string }>} 키-값 쌍 배열
  */
  export const stringJsonToKeyPairs = (stringJson: string) => {
   return Array.from(stringJson.matchAll(/(\w+):\s*([^,}]+)/g)).map(match => ({key: match[1], value: match[2]}))
  }

  export const stringToBase64 = (str: string): string => {
    return btoa(str);
  }
  export const uint8ArrayToBase64 = (bytes: Uint8Array): string => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  export const base64ToString = (base64: string): string => {
    return atob(base64);
  }
  export const base64ToUint8Array = (base64: string): Uint8Array => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
  // const formDataToFormDataEntryValueObj = <T = { [key: string]: FormDataEntryValue | FormDataEntryValue[] }>(
  //   data: FormData | HTMLFormElement
  // ): T => {
  //     if (typeof HTMLFormElement !== 'undefined' && data instanceof HTMLFormElement) {
  //         data = new FormData(data);
  //     }
  //     const obj: any = {};
  //     data.forEach((value, key) => {
  //         if (Array.isArray(obj[key])) {
  //             obj[key].push(value);
  //         } else if (obj[key] !== undefined || !isNaN(obj[key])) {
  //             obj[key] = [obj[key], value];
  //         } else {
  //             obj[key] = value;
  //         }
  //     });
  //     return obj;
  // }

}
