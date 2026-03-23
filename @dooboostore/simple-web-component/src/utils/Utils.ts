export class SwcUtils {
  static getValueByPath(obj: any, path: string, rootName: string) {
    if (!obj || !path) return undefined;

    const parts = path.split('.');

    // 1. If the path starts with the rootName (alias), strip it and resolve within obj
    // e.g., getValueByPath({name: 'Kim'}, 'u.name', 'u') -> returns 'Kim'
    if (parts[0] === rootName && parts.length > 1) {
      const subParts = parts.slice(1);
      let subResult = obj;
      for (const part of subParts) {
        if (subResult === null || subResult === undefined) return undefined;
        subResult = subResult[part];
      }
      return subResult;
    }

    // 2. Fallback: resolve directly on obj (standard behavior)
    let result = obj;
    for (const part of parts) {
      if (result === null || result === undefined || !(part in result)) {
        return undefined;
      }
      result = result[part];
    }

    // Safety: don't return the instance itself or a DOM element as a template value
    if (result !== obj && !(result instanceof HTMLElement)) {
      return result;
    }

    return undefined;
  }

  static applyData(
    node: Node,
    data: any,
    options: {
      asKey: string;
      asIndexKey: string;
      index?: number;
    }
  ) {
    const { asKey, asIndexKey, index } = options;
    const context: Record<string, any> = {};
    if (index !== undefined) {
      context[asIndexKey] = index.toString();
    }

    const walk = (n: Node) => {
      if (n.nodeType === Node.TEXT_NODE) {
        if (!(n as any)._original) (n as any)._original = n.textContent;
        let text = (n as any)._original;

        text = text.replace(/{{(.*?)}}/g, (match: string, path: string) => {
          path = path.trim();
          if (context[path] !== undefined) return context[path];
          const val = SwcUtils.getValueByPath(data, path, asKey);
          return val !== undefined ? val : match;
        });
        if (n.textContent !== text) n.textContent = text;
      } else if (n.nodeType === Node.ELEMENT_NODE) {
        const el = n as Element;
        Array.from(el.attributes).forEach(a => {
          if (!(a as any)._original) (a as any)._original = a.value;
          let val = (a as any)._original;

          val = val.replace(/{{(.*?)}}/g, (match: string, path: string) => {
            path = path.trim();
            if (context[path] !== undefined) return context[path];
            const v = SwcUtils.getValueByPath(data, path, asKey);
            return v !== undefined ? v : match;
          });
          if (a.value !== val) a.value = val;
        });
        el.childNodes.forEach(walk);
      }
    };
    walk(node);
  }

  static createReactiveProxy(target: any, onChange: () => void, onIndexChange?: (index: number, val: any) => void) {
    const makeRecursiveProxy = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null || obj instanceof Node) return obj;

      return new Proxy(obj, {
        set: (t, prop, val) => {
          const oldVal = t[prop];
          if (oldVal === val) return true;
          t[prop] = makeRecursiveProxy(val);
          const isIndex = !isNaN(Number(prop)) && Array.isArray(t);
          if (isIndex && onIndexChange) {
            onIndexChange(Number(prop), val);
          } else {
            onChange();
          }
          return true;
        },
        deleteProperty: (t, prop) => {
          delete t[prop];
          onChange();
          return true;
        }
      });
    };

    return makeRecursiveProxy(target);
  }
}
