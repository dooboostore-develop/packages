import { Promises } from '@dooboostore/core/promise/Promises';

export namespace ElementUtils {
  export type Attr = {name: string, value: any}

  export type LoadImageCallbackType = { onload: (img: HTMLImageElement) => void, onerror: OnErrorEventHandler };
  export type LoadAudioCallbackType = { onload: (img: HTMLAudioElement) => void, onerror: (e: ErrorEvent) => void };


  export function loadImage(src: string): Promise<HTMLImageElement>;
  export function loadImage(src: string, callback: LoadImageCallbackType): void;
  export function loadImage(src: string, callback?: LoadImageCallbackType): Promise<HTMLImageElement> | void {
    let targetCallback: (img: HTMLImageElement) => void;
    let promise: Promise<HTMLImageElement> | undefined = undefined;
    if (callback) {
      targetCallback = callback.onload;
    } else {
      const r = Promises.withResolvers<HTMLImageElement>();
      promise = r.promise;
      targetCallback = r.resolve;
    }
    const img = new Image();
    // img.crossOrigin = 'Anonymous';
    img.onload = () => {
      targetCallback(img);
    };
    if (callback && callback.onerror) {
      img.onerror = callback.onerror;
    }
    img.src = src;
    return promise;
  }

  export function loadAudio(src: string): Promise<HTMLAudioElement>;
  export function loadAudio(src: string, callback: LoadAudioCallbackType): void;
  export function loadAudio(src: string, callback?: LoadAudioCallbackType): Promise<HTMLAudioElement> | void {
    let targetCallback: (audio: HTMLAudioElement) => void;
    let error: (e: any) => void;
    let promise: Promise<HTMLAudioElement> | undefined = undefined;
    if (callback) {
      targetCallback = callback.onload;
      error = callback.onerror;
    } else {
      const r = Promises.withResolvers<HTMLAudioElement>();
      promise = r.promise;
      error = r.reject;
      targetCallback = r.resolve;
    }
    const audio = new Audio('path/to/audio1.mp3');
    audio.addEventListener('canplay', () => {
      targetCallback?.(audio);
    });
    audio.addEventListener('error', (e) => {
      callback?.onerror(e);
    });
    audio.load();
    return promise;
  }

  export const toInnerHTML = (documentFragment: DocumentFragment | HTMLElement, config: { document: Document }) => {
    // if (documentFragment) {
    const tempDiv = config.document.createElement('div');
    tempDiv.appendChild(documentFragment.cloneNode(true));
    // console.log('DocumentFragment innerHTML:', tempDiv.innerHTML);
    return tempDiv.innerHTML;
    // }
  }
  // export const fragmentToHTML = (fragment: DocumentFragment, config: { document: Document } = { document }): string => {
  //    const tempDiv = config.document.createElement('div');
  //    tempDiv.appendChild(fragment.cloneNode(true));
  //    return tempDiv.innerHTML;
  //  }

  export const htmlToFragment = (html: string, config: { document: Document } = { document }): DocumentFragment => {
      const tempDiv = config.document.createElement('div');
      tempDiv.innerHTML = html;
      const fragment = config.document.createDocumentFragment();
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild);
      }
      return fragment;
    }



/*
   17 // originalDiv 자체와 속성만 복사하고, childSpan은 복사하지 않습니다.
   18 const shallowCopy = originalDiv.cloneNode(false);
   19 shallowCopy.id = 'shallowCopyDiv'; // ID 변경 (중복 방지)
   20 console.log('\n--- 얕은 복사본 ---');
   21 console.log(shallowCopy.outerHTML);
   22 // 예상 출력: <div id="shallowCopyDiv" data-custom="원본 데이터"></div>
   23
   24 // 2. 깊은 복사 (deep: true)
   25 // originalDiv와 그 자식인 childSpan까지 모두 복사합니다.
   26 const deepCopy = originalDiv.cloneNode(true);
   27 deepCopy.id = 'deepCopyDiv'; // ID 변경 (중복 방지)
   28 console.log('\n--- 깊은 복사본 ---');
   29 console.log(deepCopy.outerHTML);
 */

  export const replaceWith = (targetElement: Element, replaceElement: Element) => {
    targetElement.replaceWith(replaceElement);

  }
  export const nodeList = (documentFragment: DocumentFragment) => {
    return Array.from(documentFragment.childNodes)
  }

  export const cloneNodeList = (documentFragment: DocumentFragment) => {
    return Array.from(documentFragment.childNodes).map(node => node.cloneNode(true));
  }

  export const querySelector  = (e: Element | {start: Element, end: Element}, selector: string) => {
    const elements = ElementUtils.querySelectorAll(e,selector);
    if (elements.length > 0 ) {
      return elements[0];
    } else {
      return null;
    }
  }

  export const querySelectorAll = (e: Element | {start: Node, end: Node}, selector: string) => {
    if (e instanceof Element) {
      return Array.from(e.querySelectorAll(selector));
    } else {
      const startNode = e.start;
      const endNode = e.end;
      if (startNode && endNode && startNode.parentNode === endNode.parentNode) {
        const elements: Element[] = [];
        let currentNode: Node | null = startNode.nextSibling;
        while (currentNode && currentNode !== endNode) {
          if (currentNode.nodeType === Node.ELEMENT_NODE) {
            const currentElement = currentNode as Element;
            if (currentElement.matches(selector)) {
              elements.push(currentElement);
            }
            elements.push(...Array.from(currentElement.querySelectorAll(selector)));
          }
          currentNode = currentNode.nextSibling;
        }
        return elements;
      }
    }
    return [];
  }


export const selectorElements = (selector: string, element: Element|Document = document): Element[] => {
    return Array.prototype.slice.call(element.querySelectorAll(selector));
  }

export const selectorNodes = (selector: string, element: Element|Document = document) => {
    return element.querySelectorAll(selector);
  }

export const removeAttribute = (result: Element, attrs: string[]) => {
    attrs.forEach(it => {
      result.removeAttribute(it)
    });
  }

export const setAttribute = (result: Element, attrs: string[]) => {
    attrs.forEach(it => {
      result.setAttribute(it, '')
    });
  }

export const setAttributeAttr = (result: Element, attrs: Attr[]) => {
    attrs.forEach(it => {
      result.setAttribute(it.name, it.value)
    });
  }

export const getAttributeToObject = (input: Element): any => {
    const attribute = {} as any;
    input.getAttributeNames().forEach(ait => {
      attribute[ait] = input.getAttribute(ait);
    });
    return attribute;
  }

export const getStyleToObject = (input: HTMLElement): any => {
    const style = {} as any;
    for (let i = 0; i < input.style.length; i++) {
      const key = input.style[i];
      style[key] = (input.style as any)[key];
    }
    return style;
  }
}