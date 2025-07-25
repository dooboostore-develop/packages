import { Observable } from '../Observable';

/**
 * Creates an Observable that emits events of a specific type from a given event target.
 *
 * @param target The DOM event target (e.g., an HTMLElement, Document, Window).
 * @param eventName The name of the event to listen for (e.g., 'click', 'mousemove').
 * @return An Observable that emits events of the specified type.
 */
export function fromEvent<T extends Event>(
  target: EventTarget,
  eventName: string
): Observable<T> {
  return new Observable<T>(subscriber => {
    const handler = (event: Event) => {
      subscriber.next(event as T);
    };

    target.addEventListener(eventName, handler);

    // Return a teardown function that removes the event listener
    return () => {
      target.removeEventListener(eventName, handler);
    };
  });
}
