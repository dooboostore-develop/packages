export interface CreateElementInfo {
  tagName: string;
  innerHtml?: string;
}

export namespace TemplateUtils {
  /**
   * Tagged template function to create a DocumentFragment from HTML string.
   */
  export const htmlFragment = (strings: TemplateStringsArray, ...values: any[]): DocumentFragment => {
    const raw = strings.reduce((acc, str, i) => acc + str + (values[i] !== undefined ? values[i] : ''), '');
    const template = document.createElement('template');
    template.innerHTML = raw.trim();
    return template.content;
  };

  /**
   * Tagged template function to create a Text node from string.
   */
  export const textNode = (strings: TemplateStringsArray, ...values: any[]): Text => {
    const raw = strings.reduce((acc, str, i) => acc + str + (values[i] !== undefined ? values[i] : ''), '');
    return document.createTextNode(raw);
  };

  /**
   * Generic element creator using a configuration object and attribute map.
   */
  export const createElement = <T extends HTMLElement>(info: CreateElementInfo, attrs: Record<string, any> = {}): T => {
    const el = document.createElement(info.tagName) as T;
    if (info.innerHtml !== undefined) el.innerHTML = info.innerHtml;
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
    return el;
  };

  /**
   * Internal factory to create tagged template functions for specific HTML elements.
   */
  const createTagFunction = <T extends HTMLElement>(tagName: string) => {
    return (strings: TemplateStringsArray, ...values: any[]): T => {
      const el = document.createElement(tagName) as T;
      el.innerHTML = strings.reduce((acc, str, i) => acc + str + (values[i] !== undefined ? values[i] : ''), '');
      return el;
    };
  };

  // Specific Element Factories
  export const htmlDivElement = createTagFunction<HTMLDivElement>('div');
  export const htmlSpanElement = createTagFunction<HTMLSpanElement>('span');
  export const htmlButtonElement = createTagFunction<HTMLButtonElement>('button');
  export const htmlUlElement = createTagFunction<HTMLUListElement>('ul');
  export const htmlLiElement = createTagFunction<HTMLLIElement>('li');
  export const htmlInputElement = createTagFunction<HTMLInputElement>('input');
  export const htmlAElement = createTagFunction<HTMLAnchorElement>('a');
  export const htmlPElement = createTagFunction<HTMLParagraphElement>('p');
  export const htmlH1Element = createTagFunction<HTMLHeadingElement>('h1');
  export const htmlH2Element = createTagFunction<HTMLHeadingElement>('h2');
  export const htmlH3Element = createTagFunction<HTMLHeadingElement>('h3');
  export const htmlH4Element = createTagFunction<HTMLHeadingElement>('h4');
  export const htmlH5Element = createTagFunction<HTMLHeadingElement>('h5');
  export const htmlH6Element = createTagFunction<HTMLHeadingElement>('h6');
  export const htmlSectionElement = createTagFunction<HTMLElement>('section');
  export const htmlArticleElement = createTagFunction<HTMLElement>('article');
}

export const htmlFragment = TemplateUtils.htmlFragment;
export const textNode = TemplateUtils.textNode;
export const createElement = TemplateUtils.createElement;
export const htmlDivElement = TemplateUtils.htmlDivElement;
export const htmlSpanElement = TemplateUtils.htmlSpanElement;
export const htmlButtonElement = TemplateUtils.htmlButtonElement;
export const htmlUlElement = TemplateUtils.htmlUlElement;
export const htmlLiElement = TemplateUtils.htmlLiElement;
export const htmlInputElement = TemplateUtils.htmlInputElement;
export const htmlAElement = TemplateUtils.htmlAElement;
export const htmlPElement = TemplateUtils.htmlPElement;
export const htmlH1Element = TemplateUtils.htmlH1Element;
export const htmlH2Element = TemplateUtils.htmlH2Element;
export const htmlH3Element = TemplateUtils.htmlH3Element;
export const htmlH4Element = TemplateUtils.htmlH4Element;
export const htmlH5Element = TemplateUtils.htmlH5Element;
export const htmlH6Element = TemplateUtils.htmlH6Element;
export const htmlSectionElement = TemplateUtils.htmlSectionElement;
export const htmlArticleElement = TemplateUtils.htmlArticleElement;
