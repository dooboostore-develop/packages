import { Observable, OperatorFunction } from '../Observable';

export interface BufferTimeConfig {
  bufferCreationInterval?: number | null;
  maxBufferSize?: number;
  skipEmpty?: boolean;
  setInterval?: (callback: () => void, ms: number) => any;
  setTimeout?: (callback: () => void, ms: number) => any;
  clearInterval?: (id: any) => void;
  clearTimeout?: (id: any) => void;
}

/**
 * Buffers the source Observable values for a specific time period.
 *
 * @param bufferTimeSpan The amount of time to fill each buffer for.
 * @param config Configuration object with optional bufferCreationInterval, maxBufferSize, and custom timer functions
 * @return An Observable of arrays of values.
 */
export function bufferTime<T>(
  bufferTimeSpan: number,
  config?: BufferTimeConfig
): OperatorFunction<T, T[]> {
  return (source: Observable<T, any>): Observable<T[], any> => {
    return new Observable<T[]>(subscriber => {
      const bufferCreationInterval = config?.bufferCreationInterval;
      const maxBufferSize = config?.maxBufferSize;
      const skipEmpty = config?.skipEmpty ?? false;
      const setIntervalFn = config?.setInterval || setInterval;
      const setTimeoutFn = config?.setTimeout || setTimeout;
      const clearIntervalFn = config?.clearInterval || clearInterval;
      const clearTimeoutFn = config?.clearTimeout || clearTimeout;

      // If bufferCreationInterval is not provided or null, use simple single buffer mode
      if (bufferCreationInterval === undefined || bufferCreationInterval === null) {
        let buffer: T[] = [];

        const intervalId = setIntervalFn(() => {
          if (!skipEmpty || buffer.length > 0) {
            subscriber.next(buffer);
          }
          buffer = [];
        }, bufferTimeSpan);

        const sourceSubscription = source.subscribe({
          next: (value) => {
            buffer.push(value);
            
            // If maxBufferSize is set and reached, emit immediately
            if (maxBufferSize && buffer.length >= maxBufferSize) {
              subscriber.next(buffer);
              buffer = [];
            }
          },
          error: (err) => {
            subscriber.error(err);
            clearIntervalFn(intervalId);
          },
          complete: () => {
            if (!skipEmpty || buffer.length > 0) {
              subscriber.next(buffer);
            }
            subscriber.complete();
            clearIntervalFn(intervalId);
          }
        });

        return () => {
          sourceSubscription.unsubscribe();
          clearIntervalFn(intervalId);
        };
      }

      // Multiple overlapping/non-overlapping buffers mode
      const buffers: Array<{ buffer: T[]; timeoutId: any }> = [];
      let creationIntervalId: any;

      const createBuffer = () => {
        const newBuffer: T[] = [];
        const timeoutId = setTimeoutFn(() => {
          // Find and remove this buffer
          const index = buffers.findIndex(b => b.timeoutId === timeoutId);
          if (index !== -1) {
            const [removed] = buffers.splice(index, 1);
            if (!skipEmpty || removed.buffer.length > 0) {
              subscriber.next(removed.buffer);
            }
          }
        }, bufferTimeSpan);

        buffers.push({ buffer: newBuffer, timeoutId });
      };

      // Create first buffer immediately
      createBuffer();

      // Create new buffers at specified interval
      creationIntervalId = setIntervalFn(() => {
        createBuffer();
      }, bufferCreationInterval);

      const sourceSubscription = source.subscribe({
        next: (value) => {
          // Add value to all active buffers
          for (const bufferObj of buffers) {
            bufferObj.buffer.push(value);
            
            // If maxBufferSize is set and reached, emit immediately
            if (maxBufferSize && bufferObj.buffer.length >= maxBufferSize) {
              const index = buffers.indexOf(bufferObj);
              if (index !== -1) {
                buffers.splice(index, 1);
                clearTimeoutFn(bufferObj.timeoutId);
                subscriber.next(bufferObj.buffer);
              }
            }
          }
        },
        error: (err) => {
          subscriber.error(err);
          clearIntervalFn(creationIntervalId);
          buffers.forEach(b => clearTimeoutFn(b.timeoutId));
        },
        complete: () => {
          clearIntervalFn(creationIntervalId);
          // Emit all remaining buffers
          buffers.forEach(b => {
            clearTimeoutFn(b.timeoutId);
            if (!skipEmpty || b.buffer.length > 0) {
              subscriber.next(b.buffer);
            }
          });
          subscriber.complete();
        }
      });

      return () => {
        sourceSubscription.unsubscribe();
        clearIntervalFn(creationIntervalId);
        buffers.forEach(b => clearTimeoutFn(b.timeoutId));
      };
    });
  };
}
