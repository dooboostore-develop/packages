import { Observable } from '@dooboostore/core/message';

export namespace EventUtils {
  export const htmlElementEventObservable = <K extends keyof HTMLElementEventMap>(element: HTMLElement | Document, type: K, options?: boolean | AddEventListenerOptions): Observable<HTMLElementEventMap[K]> => {
    return {
      subscribe: (res) => {
        element.addEventListener(type, res, options);
        return {
          unsubscribe: () => {
            element.removeEventListener(type, res, options);
          }
        }
      }
    }
  }}