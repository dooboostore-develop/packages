import { Dictionary } from '../types';
import { ValidUtils } from '../valid/ValidUtils';

export namespace StringUtils {
  export const deleteEnter = (data: string) => {
    return data.replace(/\r?\n/g, '')
  }

  export const pickEmoji = (data: string) => {
    return data.match(/[\p{Emoji}]/gu) ?? [];
  }


  export const regexExec = (regex: RegExp, text: string) => {
    let varExec = regex.exec(text)
    const usingVars = [];
    while (varExec) {
      usingVars.push(varExec)
      varExec = regex.exec(varExec.input)
    }
    return usingVars;
  }

  export const regexExecArrayReplace = (origin: string, regexpExecArrayOrRegex: RegExpExecArray[] | RegExp, replace: string | ((data: RegExpExecArray) => string)) => {
    // console.log('------origin', origin ,regexpExecArrayOrRegex, replace)
    const regexpExecArrays = Array.isArray(regexpExecArrayOrRegex) ? regexpExecArrayOrRegex : StringUtils.regexExec(regexpExecArrayOrRegex, origin);
    regexpExecArrays.reverse().forEach(it => {
      const r = typeof replace === 'string' ? replace : replace(it);
      origin = origin.substr(0, it.index) + origin.substr(it.index).replace(it[0], r);
    })
    // console.log('------origin2', origin)
    return origin;
  }

  export const escapeSpecialCharacterRegExp = (data: string) => {
    return data.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  export const trim =  (data: string) => data.trim();

  export const rsubString =  (data_s: string, blen_n: number): string =>
    data_s.substring(data_s.length - blen_n, data_s.length);

  export const lsubString =  (data_s: string, alen_n: number): string => data_s.substring(0, alen_n);

  export const lpad =  (fill_s: string, len_n: number, full_s: string): string =>  {
    while (len_n > full_s.length) {
      full_s = fill_s + full_s;
    }
    return StringUtils.rsubString(full_s, len_n);
  };
  export const rpad = (fill_s: string, len_n: number, full_s: string): string => {
    while (len_n > full_s.length) {
      full_s += fill_s;
    }
    return StringUtils.lsubString(full_s, len_n);
  };

  export const lappend = (count_n: number, input_s: string): string => {
    let s = '';
    let i = 0;
    while (i++ < count_n) {
      s += input_s;
    }
    return s;
  };


  export const unescape =  (html: string): string => {
    if (!html) return '';

    const htmlEntity: Dictionary<string> = {
      quot: '"',
      amp: '&',
      apos: "'",
      lt: '<',
      gt: '>',
      nbsp: '\u00A0',
      iexcl: '¡',
      cent: '¢',
      pound: '£',
      curren: '¤',
      yen: '¥',
      brvbar: '¦',
      sect: '§',
      uml: '¨',
      copy: '©',
      ordf: 'ª',
      laquo: '«',
      not: '¬',
      shy: '\u00AD',
      reg: '®',
      macr: '¯',
      deg: '°',
      plusmn: '±',
      sup2: '²',
      sup3: '³',
      acute: '´',
      micro: 'µ',
      para: '¶',
      middot: '·',
      cedil: '¸',
      sup1: '¹',
      ordm: 'º',
      raquo: '»',
      frac14: '¼',
      frac12: '½',
      frac34: '¾',
      iquest: '¿',
      '#x27': "'"
    };

    return html.replace(/&((?:(?:[a-z0-9]+|#[0-9]{1,6}|#x[0-9a-fA-F]{1,6});?)+);/gi, (match, entity) => {
      const entities: string[] = entity.toLowerCase().split(';');
      return entities.map(it => (it in htmlEntity ? htmlEntity[it] : match)).join('');
    });
  };

  export const executeExpression = (formatString: string, object: Record<string, string | number>) => {
    return formatString.replace(/\${([^{}]*)}/g, (matched, piece) => String(object[piece] ?? matched));
  };

  export const ellipsis = (text: string, length: number) => {
    if (text.length > length) return `${text.slice(0, length)}...`;
    return text;
  };

  // type Postposition =
  /**
   * Appends a postposition to the given text based on the provided options.
   * @param {string} text - The text to append the postposition to.
   * @param {object} options - The options for postposition.
   * @param {string} options.vowel - The postposition to append if the text ends with a vowel(모음).
   * @param {string} options.consonant - The postposition to append if the text ends with a consonant(자음).
   * @returns {string} - The text with the appropriate postposition appended.
   */
  export const appendPostposition =  (text: string, { vowel, consonant }:  {
      vowel: string;
      consonant: string;
    }): string => {
    return `${text}${ValidUtils.lastConsonantLetter(text) ? consonant : vowel}`;
  };
}
