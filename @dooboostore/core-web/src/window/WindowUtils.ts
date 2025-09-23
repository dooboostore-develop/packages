import { Observable } from '@dooboostore/core/message/Observable';
import { Subscription } from '@dooboostore/core/message/Subscription';

export namespace WindowUtils {

  export const eventObservable = <K extends keyof WindowEventMap>(window: Window, type: K, options?: boolean | AddEventListenerOptions): Observable<WindowEventMap[K]> => {
    return new Observable<WindowEventMap[K]>((subscriber) => {
      const handler = (event: WindowEventMap[K]) => subscriber.next(event);
      window.addEventListener(type, handler, options);
      return () => {
        window.removeEventListener(type, handler, options);
      };
    });
  }
}

