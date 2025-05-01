import { ValidUtils } from '../valid/ValidUtils';
import { FieldType, FilterTuple } from '../types';
import { Point2D } from '../entity/Point2D';
import { Point3D } from '../entity/Point3D';
import { Rect } from '../entity/Rect';
import { ObjectUtils } from '../object/ObjectUtils';

export namespace ConvertUtils {
  export type RGBA = { r?: number, g?: number, b?: number, a?: number };
  export type MinMaxCenterAvg<T> = { min: T, max: T, center: T, avg: T };

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

  export const jsonToMap = (jsonStr: any): Map<string, string> => {
    return new Map(JSON.parse(jsonStr));
  };

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

  export function toObject<T>(obj: URLSearchParams, config: {firstValue: true}) : FieldType<T, string>;
  export function toObject(obj: URLSearchParams): {[key: string]: string | string[]};
  export function toObject(obj: any): any;
  export function toObject(obj: URLSearchParams | any, config?: {firstValue: boolean}): any  {
    if (obj instanceof URLSearchParams){
      const robj = {} as any;
      obj.forEach((v,k) => {
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
    } else {
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

  export const toArray = <T>(data?: T | T[]): T[] => {
    const datas = (Array.isArray(data) ? data : (data ? [data] : []));
    return datas;
  }
  export const flatArray = <T>(data?: T | T[]) => {
    const datas = (Array.isArray(data) ? data : (data ? [data] : []));
    return datas.flat();
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
    const results = [];
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

  export const copyObject = <T extends Record<string, any>>(obj: T, update: Partial<T> = {}): T => {
    return { ...obj, ...update };
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
    }, { r: 0, g: 0, b: 0, a: 0 }) as Required<RGBA>;
    const avg = { r: Math.floor(sum.r / color.length), g: Math.floor(sum.g / color.length), b: Math.floor(sum.b / color.length), a: Math.floor(sum.a / color.length) };
    return avg;
  };

  export const toRGBA = (hex?: string | null): RGBA => {
    hex ??= '#000000FF';
    const hexColor = hex.replace('#', '');
    const r = parseInt(hexColor.slice(0, 2) || '0', 16);
    const g = parseInt(hexColor.slice(2, 4) || '0', 16);
    const b = parseInt(hexColor.slice(4, 6) || '0', 16);
    const a = hexColor.length > 6 ? parseInt(hexColor.slice(6, 8) || '0', 16) : 255;
    return { r, g, b, a };
  };

  export const minMaxCenterAvg = <T extends { [key: string]: number }>(obj: T[]): { [key in keyof T]?: MinMaxCenterAvg<number> } => {
    const result: { [key in keyof T]: { min: number, max: number, center: number, avg: number } } = {} as any;

    const allKeys = ObjectUtils.uniqueKeys(obj);
    for (const key of allKeys) {
      const values = obj.map(item => item[key]);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const center = (min + max) / 2;
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;

      result[key as keyof T] = { min, max, center, avg };
    }

    return result;
  }

  export const minMaxCenterRectAvg2D = (point2Ds: (Point2D | {x: number, y:number})[]): MinMaxCenterAvg<Point2D> & { minMaxRect: Rect } => {
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
    return { min, max, center, avg, minMaxRect };
  };


  export const minMaxCenterAvg3D = (point3Ds: (Point3D | {x:number, y:number, z:number})[]): MinMaxCenterAvg<Point3D> => {
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
    return { min, max, center, avg };
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
