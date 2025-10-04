import { StringUtils } from '../string/StringUtils';

export namespace Expression {

  // html = html.replace(/\$\{[\s\S]*?\}\$/g, '');

  export const bindExpression = (expression: string, bind: { [name: string]: ((arg: any) => any) | any }) => {
   // ${data}  wow  ${wow:parameter}
    // expression에서 ${...} 형태를 모두 찾아서 처리
        return (expression ?? '').replace(/\$\{([\s\S.]*?)\}/g, (_, group) => {
          // 파라미터가 있는 경우: name:param
          const [name, param] = group.split(':');
          const binder = bind[name];
          if (!binder) return '';
          if (typeof binder === 'function') {
            return binder(bind[param]);
          }
          return binder;
        });
  }

  /**
   * @deprecated
   */
  // export namespace Group {
  // export const isExpression = (data: string | null) => {
  //     // const reg = /(?:[$#]\{(?:(([$#]\{)??[^$#]?[^{]*?)\}[$#]))/g;
  //     const reg = /[$#]\{([\s\S.]*?)\}[$#]/g;
  //     return reg.test(data ?? '');
  //   }
  //
  // export const expressionGroups = (data: string | null) => {
  //     // const reg = /(?:[$#]\{(?:(([$#]\{)??[^$#]*?)\}[$#]))/g;
  //     // const reg = /(?:[$#]\{(?:(([$#]\{)??[^$#]?[^{]*?)\}[$#]))/g;
  //     const reg = /[$#]\{([\s\S.]*?)\}[$#]/g;
  //     return StringUtils.regexExec(reg, data ?? '');
  //   }
  // }
  export namespace Path {
    export type PathNameData = { [name: string]: string }
    export const pathNameData = (pathName: string, urlExpression: string) => {
      const urls = pathName.split('/');
      const urlExpressions = urlExpression.split('/');
      if (urls.length !== urlExpressions.length) {
        return;
      }
      const data: Path.PathNameData = {}
      for (let i = 0; i < urlExpressions.length; i++) {
        const it = urlExpressions[i];
        const urlit = urls[i];
        // ex) {serialNo:[0-9]+} or {no}  ..
        const execResult = /^\{(.+)\}$/g.exec(it);
        if (!execResult) {
          if (it !== urlit) {
            return;
          }
          continue;
        }
        // regex check
        const [name, regex] = execResult[1].split(':'); // group1
        if (regex && !new RegExp(regex).test(urlit)) {
          return;
        }
        data[name] = urlit;
      }
      return data;
    }
  }
}