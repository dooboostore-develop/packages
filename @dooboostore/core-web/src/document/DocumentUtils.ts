import { Observable } from '@dooboostore/core/message';

export namespace DocumentUtils {

  export const querySelectorAllByAttributeName = (document: Document | Element, attributeName: string): {element: Element, value: string | null}[] =>{
    const elements: {element:Element, value: (string | null)}[] = [];
    document.querySelectorAll(`[${attributeName}]`)?.forEach((element) => {
      elements.push({element: element, value: element.getAttribute(attributeName)});
    });
    return elements;
  }
  export const eventObservable = <K extends keyof WindowEventMap>(document: Document, type: K, options?: boolean | AddEventListenerOptions): Observable<WindowEventMap[K]> => {
    return new Observable<WindowEventMap[K]>((subscriber) => {
      const handler = (event: WindowEventMap[K]) => subscriber.next(event);
      window.addEventListener(type, handler, options);
      return () => {
        window.removeEventListener(type, handler, options);
      };
    });
  }
}