import { Observable } from '@dooboostore/core/message/Observable';

export namespace EventUtils {
  export const htmlElementEventObservable = <K extends keyof HTMLElementEventMap>(element: HTMLElement | Document, type: K, options?: boolean | AddEventListenerOptions): Observable<HTMLElementEventMap[K]> => {
    return new Observable<HTMLElementEventMap[K]>((subscriber) => {
      const handler = (event: HTMLElementEventMap[K]) => subscriber.next(event);
      element.addEventListener(type, handler, options);
      return () => {
        element.removeEventListener(type, handler as any, options);
      };
    });
  }
}