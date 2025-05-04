import { Observable, Subscription } from '@dooboostore/core/message';

export namespace WindowUtils {

  export const eventObservable = <K extends keyof WindowEventMap>(window: Window, type: K, options?: boolean | AddEventListenerOptions): Observable<WindowEventMap[K]> => {
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

