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
    const usingVars: any[] = [];
    while (varExec) {
      usingVars.push(varExec)
      varExec = regex.exec(varExec.input)
    }
    return usingVars;
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
/*
const str = 'dr-class:set("MycLasS")'; // 또는 'dr-class'
const regex = /^([^\s:]+)(?::(\w+)\("([^"]+)"\))?$/;
const match = str.match(regex);

if (match) {
  const className = match[1]; // dr-class
  const functionName = match[2] || ''; // set 또는 ''
  const argument = match[3] || ''; // MycLasS 또는 ''
  console.log('Class Name:', className);
  console.log('Function Name:', functionName);
  console.log('Argument:', argument);
} else {
  console.log('Invalid format');
}
 */
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

  export interface SequentialReplacement {
    regex: RegExp;
    callback: (matched: string) => string;
  }

  export const replaceSequentially = (
    text: string,
    replacements: SequentialReplacement[]
  ): string => {
    let remainingText = text;
    let result = '';
    // console.log('Executing replaceSequentially with robust fix');

    while (remainingText.length > 0) {
      let bestMatch: {
        index: number;
        match: RegExpExecArray;
        replacement: SequentialReplacement;
      } | null = null;

      // Find the earliest match in the remaining text
      for (const replacement of replacements) {
        const newRegex = new RegExp(replacement.regex);
        const match = newRegex.exec(remainingText);
        if (match) {
          if (bestMatch === null || match.index < bestMatch.index) {
            bestMatch = { index: match.index, match, replacement };
          }
        }
      }

      if (bestMatch) {
        const { index, match, replacement } = bestMatch;
        const matchedString = match[0];

        // Append the text before the match and the replacement
        result += remainingText.substring(0, index);
        result += replacement.callback(matchedString);

        // Update remainingText to be the part after the match
        remainingText = remainingText.substring(index + matchedString.length);
      } else {
        // No more matches, append the rest of the text and finish
        result += remainingText;
        break;
      }
    }

    return result;
  };
}
