import { ConstructorType, isDefined } from '../types';
import { ValidUtils } from '../valid/ValidUtils';

export namespace ObjectUtils {

  export const constructorName = (target: any): string | undefined => {
    if (target && target.constructor && target.constructor.name) {
      return target.constructor.name;
    } else if (target && target.name) {
      return target.name;
    }

  }
  export const deepCopy = <T = any>(obj: T): T => {
    if (obj instanceof Map) {
      return new Map<any, any>(JSON.parse(JSON.stringify(Array.from(obj.entries())))) as T;
    } else if (obj instanceof Set) {
      return new Set<any>(JSON.parse(JSON.stringify(Array.from(obj.values())))) as T;
    } else if (ValidUtils.isNullOrUndefined(obj)) {
      return obj;
    }

    return JSON.parse(JSON.stringify(obj));
  };
  export const allProtoTypeName = (target?: any, filter?: (pathString: string, pathValue: any) => boolean): string[] => {
    let data: string[] = [];
    if (target) {
      const proto = Object.getPrototypeOf(target);
      if (proto && (data = Object.keys(proto) || []).length > 0) {
        data = data.concat(ObjectUtils.allProtoTypeName(proto, filter));
      }
    }
    let result = data.filter(it => it !== 'constructor');

    if (filter && target) {
      const proto = Object.getPrototypeOf(target);
      result = result.filter(key => filter(key, proto?.[key]));
    }

    return result;
  };

  export const uniqueKeys = (obj: (object[]) | object) => {
    const allKeys = Array.from(new Set((Array.isArray(obj) ? obj : [obj]).flatMap(item => Object.keys(item))));
    return allKeys;
  };

  export const ownPropertyNames = (target?: any): string[] => {
    const data: string[] = [];
    if (target) {
      if (!target.prototype) {
        const a = Object.getPrototypeOf(target);
        data.push(...Object.getOwnPropertyNames(a));
      } else {
        data.push(...Object.getOwnPropertyNames(Object.getPrototypeOf(target)));
      }
    }
    return data.filter(it => it !== 'constructor');
  };

  export const protoTypeName = (target?: any): string[] => {
    let data: string[] = [];
    if (target) {
      const proto = Object.getPrototypeOf(target);
      data = Object.keys(proto) || [];
    }
    return data.filter(it => it !== 'constructor');
  };

  export const protoTypes = (target?: any): Function[] => {
    const data: Function[] = [];
    if (target) {
      const proto = Object.getPrototypeOf(target);
      (Object.keys(proto) || []).filter(it => it !== 'constructor').forEach(it => {
        data.push(proto[it]);
      });
    }
    return data;
  };

  export const seal = <T>(target: T): T => {
    return Object.seal(target);
  };

  /*
  Object.prototype.isPrototypeOf()
  isPrototypeOf() 메소드는 해당 객체가 다른 객체의 프로토타입 체인에 속한 객체인지 확인하기 위해 사용됩니다.
   */
  export const isPrototypeOfTarget = (start: ConstructorType<any> | Function | null | undefined, target: any | null | undefined): boolean => {
    if (start && target) {
      return Object.prototype.isPrototypeOf.call(start.prototype, target);
    } else {
      return false;
    }
  };

  export const prototypeOfDepth = (target: any, dest: ConstructorType<any> | Function | null | undefined): object[] => {
    let object: any = target;
    const r: any[] = [];
    if (dest) {
      do {
        object = Object.getPrototypeOf(object);
        if (object?.constructor === dest) {
          break;
        }
        r.push(object);
      } while (object);
    }
    return r;
  };

  export const allProtoType = (start: ConstructorType<any> | Function): (ConstructorType<any> | Function)[] => {
    const depth = (target: ConstructorType<any> | Function, bowl: (ConstructorType<any> | Function)[] = []) => {
      if (target.prototype) {
        bowl.push(target);
        depth(Object.getPrototypeOf(target), bowl);
      }
      return bowl;
    };
    const d = depth(start);
    return d;
    // const protos: (ConstructorType<any> | Function)[] = []
    // while (start) {
    //     protos.push(start);
    //     start = Object.getPrototypeOf(start)
    // }
    // return protos;
  };

  export const prototypeOf = (start: any) => {
    return Object.getPrototypeOf(start);
  };

  export const prototypeKeyMap = (target: any): Map<Function, string> => {
    const data = new Map<Function, string>();
    if (target) {
      const proto = Object.getPrototypeOf(target);
      (Object.keys(proto) || []).filter(it => it !== 'constructor').forEach(it => {
        data.set(proto[it], it);
      });
    }
    return data;
  };

  export const prototypeName = (target: any, fnc: Function): string | undefined => {
    return ObjectUtils.prototypeKeyMap(target).get(fnc);
  };


  export const pickRandomKey = <T>(target: T): keyof T => {

    const keys = Object.keys(target as any) as Array<keyof T>;
    return keys[Math.floor(Math.random() * keys.length)];
  };

  export const pickRandomValue = <T>(target: T): T[keyof T] => {
    const keys = Object.keys(target as any) as Array<keyof T>;
    return target[keys[Math.floor(Math.random() * keys.length)]];
  };

  export const pickRandomKeyValue = <T>(target: T): { key: keyof T, value: T[keyof T] } => {
    const keys = Object.keys(target as any) as Array<keyof T>;
    const key = keys[Math.floor(Math.random() * keys.length)];
    return { key, value: target[key] };
  };

  export const keyValues = <T>(target: T): { key: keyof T, value: T[keyof T] }[] => {
    const keys = Object.keys(target as any) as Array<keyof T>;
    return keys.map(key => ({ key, value: target[key] }));
  };

  export const entries = <T>(target: T): [keyof T, T[keyof T]][] => {
    return Object.entries(target as any) as [keyof T, T[keyof T]][];
  }

  export const values = <T>(target: T): (T[keyof T])[] => {
    return Object.values(target as any);
  }

  export const keys = <T>(target: T): (keyof T)[] => {
    return Object.keys(target as any) as (keyof T)[];
  }

  export const keyLength = <T>(target: T): number => {
    return ObjectUtils.keys(target).length;
  };


  export const toDeleteUndefinedAndNull = <T>(target: T, config?: { deep?: boolean }): T => {
    const cleanValue = (value: any): any => {
      if (Array.isArray(value)) {
        return value.filter(item => item !== undefined && item !== null).map(cleanValue);
      } else if (value && typeof value === 'object') {
        if (config?.deep) {
          return Object.fromEntries(Object.entries(value).filter(([_, v]) => v !== undefined && v !== null).map(([k, v]) => [k, cleanValue(v)])
          );
        } else {
          return Object.fromEntries(
            Object.entries(value).filter(([_, v]) => v !== undefined && v !== null)
          );
        }
      }
      return value;
    };

    return cleanValue(target) as T;
  };


  export namespace Path {
    export const isFunctionScript = (script: string): boolean => {
      return script.trim().startsWith('function');
    }

    export const isArrowFunctionScript = (script: string): boolean => {
      return /^\s*\([^)]*\)\s*=>/.test(script);
    }

    export const toOptionalChainPath = (path: string): string => {
      if (!path) {
        return '';
      }
      if (isFunctionScript(path) || isArrowFunctionScript(path)) {
        return path;
      }
      // Tokenize the path by '.', '[', ']', and '?' to handle property access and existing optional chaining.
      const tokens = path.match(/[^?.[\]]+|\[[^\]]*\]/g);
      if (!tokens) {
        return path; // Return original path if no tokens are found (e.g., path is just '.')
      }
      // Join tokens with '?.', effectively creating the optional chain path.
      return tokens.join('?.');
    };

    export const removeOptionalChainOperator = (path: string): string => {
      if (!path) {
        return '';
      }
      // Replace all optional chaining operators with standard ones.
      return path.replace(/\?\./g, '.').replace(/\.\[/g, '[');
    };

    const parsePath = (path: string): (string | number)[] => {
      const result: (string | number)[] = [];
      const regex = /\.([^.\[]+)|\[(\d+)\]|\[(['"])(.*?)\3\]/g;
      let match;
      let lastIndex = 0;

      const firstMatch = path.match(regex);
      if (firstMatch && (firstMatch?.index??0) > 0) {
        result.push(path.substring(0, firstMatch.index));
        lastIndex = firstMatch.index as number;
      } else if (!firstMatch && path.length > 0) {
        result.push(path);
        return result;
      }

      while ((match = regex.exec(path)) !== null) {
        if (match.index > lastIndex) {
          const segment = path.substring(lastIndex, match.index);
          if (segment.startsWith('.')) {
            result.push(segment.substring(1));
          } else {
            result.push(segment);
          }
        }

        if (match[1]) {
          result.push(match[1]);
        } else if (match[2]) {
          result.push(parseInt(match[2], 10));
        } else if (match[4]) {
          result.push(match[4]);
        }
        lastIndex = regex.lastIndex;
      }

      if (lastIndex < path.length) {
        const remaining = path.substring(lastIndex);
        if (remaining.startsWith('.')) {
          result.push(remaining.substring(1));
        } else {
          result.push(remaining);
        }
      }

      return result;
    };

    export const to = <T = any>(obj: any) => {
      const destination: T = {} as any;
      Object.entries(obj).forEach(([path, value]) => {
        Path.set(destination, path, value);
      });
      return destination;
    };

    export const set = (obj: any, path: string, value: any) => {
      const pathParts = parsePath(path);
      let current = obj;

      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        const isLastPart = i === pathParts.length - 1;

        if (isLastPart) {
          current[part] = value;
        } else {
          // Ensure current[part] is of the correct type for the next part
          const nextPart = pathParts[i + 1];

          if (typeof nextPart === 'number') { // Next part is an array index
            if (!Array.isArray(current[part])) {
              current[part] = [];
            }
            // Fill holes if current[part] is an array and nextPart is a skipped index
            if (Array.isArray(current[part])) {
              while (current[part].length <= nextPart) {
                current[part].push({}); // Fill with empty objects
              }
            }
          } else { // Next part is a string (object property)
            if (typeof current[part] !== 'object' || current[part] === null) {
              current[part] = {};
            }
          }
          current = current[part];
        }
      }
    };

    export const get = (obj: any, path: string, defaultValue?: any): any => {
      const pathParts = parsePath(path);
      let current = obj;

      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];

        if (current === null || current === undefined) {
          return defaultValue;
        }

        // Check if the current object has the property/index
        if (typeof current === 'object' && current !== null && part in current) {
          current = current[part];
        } else {
          // Property/index not found
          return defaultValue;
        }
      }

      return current;
    };

    export const deletePath = (obj: any, path: string): boolean => {
      const pathParts = parsePath(path);
      if (pathParts.length === 0) {
        return false;
      }

      let current = obj;

      // Navigate to the parent of the target property
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];

        if (current === null || current === undefined) {
          return false;
        }

        if (typeof current === 'object' && current !== null && part in current) {
          current = current[part];
        } else {
          return false;
        }
      }

      // Delete the final property
      const finalPart = pathParts[pathParts.length - 1];
      if (current !== null && typeof current === 'object' && finalPart in current) {
        if (Array.isArray(current) && typeof finalPart === 'number') {
          current.splice(finalPart, 1);
        } else {
          delete current[finalPart];
        }
        return true;
      }

      return false;
    };

    export const availablePath = (obj: any, filter?: (pathString: string, pathValue: any) => boolean): string[] => {
      const paths: string[] = [];

      const formatKey = (key: string | number): string => {
        if (typeof key === 'number') {
          return '[' + key + ']'; // Array index
        }
        // Check if the key is a valid JavaScript identifier.
        // If not, it needs to be quoted.
        // A valid identifier starts with a letter, _, or $, followed by letters, digits, _, or $.
        // This regex checks for characters that are NOT valid in an identifier.
        if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) {
          // If it's not a valid identifier, quote it.
          // Use single quotes without escaping for test compatibility
          return "['" + key + "']";
        }
        return key;
      };

      const traverse = (current: any, currentPath: string, visited: Set<any>) => {
        if (current === null || typeof current !== 'object') {
          return;
        }

        // Detect circular references
        if (visited.has(current)) {
          return;
        }
        visited.add(current);

        if (Array.isArray(current)) {
          current.forEach((item: any, index: number) => {
            const formattedIndex = formatKey(index); // This will be [index]
            const newPath = currentPath ? `${currentPath}${formattedIndex}` : formattedIndex;
            
            // Apply filter if provided
            if (!filter || filter(newPath, item)) {
              paths.push(newPath);
            }
            
            traverse(item, newPath, visited);
          });
        } else {
          Object.keys(current).forEach(key => {
            const formattedKey = formatKey(key);
            let newPath: string;

            // If the key needs brackets (special characters), don't add a dot before brackets
            if (formattedKey.startsWith('[')) {
              newPath = currentPath ? `${currentPath}${formattedKey}` : formattedKey;
            } else {
              newPath = currentPath ? `${currentPath}.${formattedKey}` : formattedKey;
            }

            // Apply filter if provided
            if (!filter || filter(newPath, current[key])) {
              paths.push(newPath);
            }
            
            traverse(current[key], newPath, visited);
          });
        }
      };

      traverse(obj, '', new Set());
      return paths;
    };
  }

  export const toDeleteKey = (obj: any, keys: (null | string)[]) => {
    const target = { ...obj };
    ObjectUtils.deleteKey(target, keys);
    return target;
  }
  export const deleteKey = (obj: any, keys: (null | string)[]) => {
    keys.filter(it => isDefined(it)).forEach(it => {
      delete obj[it];
    })
  }

}