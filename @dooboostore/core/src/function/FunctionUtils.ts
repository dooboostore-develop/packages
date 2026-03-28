export namespace FunctionUtils {
  export const getParameterNames = (func: Function | any, property?: string | symbol) => {
    if (typeof func === 'object' && property) {
      func = func[property];
    }
    // @ts-ignore https://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamicallyㄱ
    return (
      new RegExp('(?:' + func.name + '\\s*|^)\\s*\\((.*?)\\)')
        .exec(func.toString().replace(/\n/g, ''))?.[1]
        .replace(/\/\*.*?\*\//g, '')
        .replace(/ /g, '')
        .split(',') ?? []
    );
  };

  export const evalScript = <T>(script: string | null, obj?: any): T | null => {
    try {
      if (script && obj) {
        // eslint-disable-next-line no-new-func
        return Function(`"use strict";
                    ${script}
                    `).bind(obj)();
      } else if (script) {
        // eslint-disable-next-line no-new-func
        return new Function('return ' + script)();
      } else {
        return null;
      }
    } catch (e) {
      return null;
    }
  };

  /**
   * Dynamically executes a script string with provided context and arguments.
   */
  export const execute = (params: { script: string; context?: any; args?: Record<string, any> }) => {
    const { script, context, args = {} } = params;
    const argNames = Object.keys(args);
    const argValues = Object.values(args);
    return new Function(...argNames, script).apply(context, argValues);
  };

  /**
   * Dynamically executes a script string wrapped with 'return' with provided context and arguments.
   */
  export const executeReturn = (params: { script: string; context?: any; args?: Record<string, any> }) => {
    const { script, context, args = {} } = params;
    const argNames = Object.keys(args);
    const argValues = Object.values(args);
    return new Function(...argNames, `return ${script}`).apply(context, argValues);
  };
}
