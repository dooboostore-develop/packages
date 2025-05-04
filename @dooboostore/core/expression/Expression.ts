import { StringUtils } from '../string/StringUtils';

export namespace Expression {
  export namespace Group {
  export const isExpression = (data: string | null) => {
      // const reg = /(?:[$#]\{(?:(([$#]\{)??[^$#]?[^{]*?)\}[$#]))/g;
      const reg = /[$#]\{([\s\S.]*?)\}[$#]/g;
      return reg.test(data ?? '');
    }

  export const expressionGroups = (data: string | null) => {
      // const reg = /(?:[$#]\{(?:(([$#]\{)??[^$#]*?)\}[$#]))/g;
      // const reg = /(?:[$#]\{(?:(([$#]\{)??[^$#]?[^{]*?)\}[$#]))/g;
      const reg = /[$#]\{([\s\S.]*?)\}[$#]/g;
      return StringUtils.regexExec(reg, data ?? '');
    }
  }
  export namespace Path {
    export const pathNameData = (pathName: string, urlExpression: string) => {
      const urls = pathName.split('/');
      const urlExpressions = urlExpression.split('/');
      if (urls.length !== urlExpressions.length) {
        return;
      }
      const data: { [name: string]: string } = {}
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