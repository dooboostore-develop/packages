import { Observable } from '@dooboostore/core/message';

export namespace DocumentUtils {

  export const querySelectorAllByAttributeName = (document: Document, attributeName: string): {element: Element, value: string}[] =>{
    const elements: {element:Element, value: string| null}[] = [];
    document.querySelectorAll(`[${attributeName}]`)?.forEach((element) => {
      elements.push({element: element, value: element.getAttribute(attributeName)});
    });
    return elements;
  }
  export const eventObservable = <K extends keyof WindowEventMap>(document: Document, type: K, options?: boolean | AddEventListenerOptions): Observable<WindowEventMap[K]> => {
    return {
      subscribe: (res) => {
        window.addEventListener(type, res, options);
        return {
          unsubscribe: () => {
            window.removeEventListener(type, res, options);
          }
        }
      }
    }
  }
}