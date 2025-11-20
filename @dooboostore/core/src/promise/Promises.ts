import { Subscription } from '../message/Subscription';
import { ConstructorType } from '../types';
import { ValidUtils } from '../valid/ValidUtils';

export namespace Promises {
  export const filterCatch = async (promise: Promise<any>, has: ConstructorType<any> | ((e: any) => boolean) | ((ConstructorType<any> | ((e: any) => void))[])) => {
    try {
      await promise;
      return undefined;
    } catch (e) {
      const targetHas = Array.isArray(has) ? has : [has]
      for (let ha of targetHas) {
        if (ValidUtils.isConstructor(ha)) {
          if (e instanceof ha) {
            return e;
          }
        } else {
          if ((ha as Function)(e)) {
            return e;
          }
        }
      }
      throw e;
    }
    return undefined;
  }
  export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  export const sleepReject = (ms: number) => new Promise((resolve, reject) => setTimeout(reject, ms));
  export const settle = async <T, E = unknown>(promise: Promise<T>): Promise<Promises.SettledResult<T, E>> => {
    return Promise.allSettled([promise]).then(results => results[0]);
  };
  export const settles = async <T, E = unknown>(...promises: Promise<T>[]): Promise<Promises.SettledResult<T, E>[]> => {
    return Promise.allSettled(promises);
  };
  export type SettledResult<T, E = unknown> =
    | PromiseFulfilledResult<T>
    | (Omit<PromiseRejectedResult, 'reason'> & { reason: E });

  export type LoopConfig = { age: number };
  export type ObservableLoop<T> = {
    subscribe: (callback: {
      then?: (data: T, config: LoopConfig & {duration: number}) => void,
      catch?: (e: any, config: LoopConfig & {duration: number}) => void,
      delayThen?: (config: LoopConfig & { duration: number, isCatch: boolean, data?: T }) => void,
    }) => Subscription;
  }
  export const loop = <T>(config: {
                            factory: (config: LoopConfig) => Promise<T>,
                            delay?: number,
                            loopDelay?: number
                          }
  ): ObservableLoop<T> => {

    return {
      subscribe: (callback) => {

        let stop = false;
        let age = 0;
        const loopExecute = async () => {
          const start = Date.now();
          let end = start;
          age++;
          const executeConfig = {age: age};
          let t: T;
          let isCatch = false;
          try {
            t = await config.factory(executeConfig);
            end = Date.now();
            callback.then?.(t, {...executeConfig, duration: end - start});
          } catch (e) {
            isCatch = true;
            end = Date.now();
            callback.catch?.(e, {...executeConfig, duration: end - start});
          }
          await sleep(config.loopDelay ?? 0);
          // @ts-ignore
          callback.delayThen?.({...executeConfig, duration: end - start, isCatch: isCatch, data: t});
          if (!stop)
            return loopExecute();
        };

        setTimeout(() => {
          loopExecute();
        }, config.delay ?? 0);

        return {
          get closed() {
            return stop;
          },
          unsubscribe: () => {
            stop = true;
          }
        }


      }
    }
  }
  export const delayExecute = <T>(value: (() => T) | (() => Promise<T>), delay = 0): Promise<T> => {
    return new Promise<T>(resolve => {
      setTimeout(async () => {
        const t = await value();
        resolve(t);
      }, delay);
    });
  };

  export const transaction = <T, B = unknown, A = unknown>(
    promise: Promise<T> | (() => Promise<T>),
    config?: {
      delay?: number;
      before?: () => B;
      after?: () => A;
      then?: (it: T, data: { before?: B }) => void;
      catch?: (e: any, data: { before?: B; after?: A }) => void;
      disabledCatchThrow?: boolean;
      finally?: (data: { before?: B; after?: A; data?: T }) => void;
    }
  ) => {
    const p = typeof promise === 'function' ? promise() : promise;
    let after: A | undefined;
    let before: B | undefined;
    let promiseData: T | undefined;
    new Promise<T>((resolve, reject) => {
      const execute = () => {
        before = config?.before?.();
        p.then(data => {
          resolve(data);
        });
        after = config?.after?.();
      };
      setTimeout(() => {
        execute();
      }, config?.delay ?? 0);
      // if (config?.delay) {
      // } else {
      //   setTimeout(() => {
      //     execute();
      //   },1000);
      // }
    })
      .then(data => {
        promiseData = data;
        config?.then?.(data, {before: before});
      })
      .catch(e => {
        config?.catch?.(e, {before: before, after: after});
        if (!config?.disabledCatchThrow) {
          throw e;
        }
      })
      .finally(() => {
        config?.finally?.({before: before, after: after, data: promiseData});
      });
  };

  export const withResolvers = <T>() => {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: any) => void;

    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    return {promise, resolve, reject};
  }

  /**
   * Execute promises in chunks with concurrency limit to prevent network overload
   * @param promiseFactories Array of promise factories (functions that return promises)
   * @param chunkSize Number of promises to execute concurrently
   * @returns Promise that resolves with all results
   */
  export const executeInChunks = async <T>(
    promiseFactories: (() => Promise<T>)[],
    chunkSize: number = 10
  ): Promise<T[]> => {
    const results: T[] = [];
    
    for (let i = 0; i < promiseFactories.length; i += chunkSize) {
      const chunk = promiseFactories.slice(i, i + chunkSize);
      const chunkResults = await Promise.all(chunk.map(factory => factory()));
      results.push(...chunkResults);
      
      // Add small delay between chunks to be extra safe
      if (i + chunkSize < promiseFactories.length) {
        await sleep(100);
      }
    }
    
    return results;
  };

  /**
   * Execute promises with concurrency limit using a pool pattern
   * @param promiseFactories Array of promise factories
   * @param concurrency Maximum number of concurrent executions
   * @returns Promise that resolves with all results
   */
  export const executeWithConcurrency = async <T>(
    promiseFactories: (() => Promise<T>)[],
    concurrency: number = 10
  ): Promise<T[]> => {
    const results: T[] = new Array(promiseFactories.length);
    let currentIndex = 0;

    const executeNext = async (index: number): Promise<void> => {
      while (currentIndex < promiseFactories.length) {
        const factoryIndex = currentIndex++;
        results[factoryIndex] = await promiseFactories[factoryIndex]();
      }
    };

    // Create pool of concurrent workers
    const workers = Array(Math.min(concurrency, promiseFactories.length))
      .fill(0)
      .map((_, i) => executeNext(i));

    await Promise.all(workers);
    return results;
  };

  /**
   * Execute promises with concurrency limit using race pattern (most efficient)
   * Automatically starts a new promise as soon as one completes
   * @param promiseFactories Array of promise factories
   * @param limit Maximum number of concurrent executions (default: 5)
   * @returns Promise that resolves with all results
   */
  export const executeWithLimit = async <T>(
    promiseFactories: (() => Promise<T>)[],
    limit: number = 5
  ): Promise<T[]> => {
    const results: T[] = new Array(promiseFactories.length);
    const executing: Promise<void>[] = [];

    for (const [index, factory] of promiseFactories.entries()) {
      const promise = factory()
        .then(result => {
          results[index] = result;
        })
        .finally(() => {
          executing.splice(executing.indexOf(promise), 1);
        });

      executing.push(promise);

      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }

    await Promise.all(executing);
    return results;
  };

  /**
   * Retry a promise with configurable delays
   * @param factory Function that returns a promise to retry (receives attempt number and previous error as parameters)
   * @param config Retry configuration
   * @param config.retry Number of retries (0 = no retry, 1 = retry once if failed, etc.)
   * @param config.delay.initialDelay Delay before first attempt (default: 0)
   * @param config.delay.retryDelay Delay between retry attempts (default: 0)
   * @param config.onRetry Callback called on each retry with error and attempt number
   * @returns Promise that resolves with the result or rejects after all retries
   * @example
   * // Retry up to 3 times with 1 second delay between attempts
   * await Promises.retry((attempt, error) => {
   *   if (error) console.log('Previous error:', error);
   *   return fetchData(attempt);
   * }, { retry: 3, delay: { retryDelay: 1000 } })
   */
  export const retry = async <T>(
    factory: (attempt: number, error?: any) => Promise<T>,
    config: {
      retry: number;
      delay?: {
        initialDelay?: number;
        retryDelay?: number;
      };
      onRetry?: (error: any, attempt: number) => void;
    }
  ): Promise<T> => {
    const initialDelay = config.delay?.initialDelay ?? 0;
    const retryDelay = config.delay?.retryDelay ?? 0;
    
    // Initial delay before first attempt
    if (initialDelay > 0) {
      await sleep(initialDelay);
    }
    
    let lastError: any;
    
    for (let attempt = 0; attempt <= config.retry; attempt++) {
      try {
        return await factory(attempt, lastError);
      } catch (error) {
        lastError = error;
        
        // Don't retry if this was the last attempt
        if (attempt === config.retry) {
          break;
        }
        
        // Call onRetry callback if provided
        config.onRetry?.(error, attempt + 1);
        
        // Wait before retrying
        if (retryDelay > 0) {
          await sleep(retryDelay);
        }
      }
    }
    
    // All retries failed, throw the last error
    throw lastError;
  };

  export namespace Result {
    export type FulfilledType<T> = PromiseFulfilledResult<T>;
    export type RejectType<E = unknown> = Omit<PromiseRejectedResult, 'reason'> & { reason: E };
    export type PendingType = { status: 'pending' };
    export type Type<T, E = unknown> = FulfilledType<T> | RejectType<E> | PendingType;

    export type FulfilledState<T> = FulfilledType<T> & { isFulfilled: true; isRejected: false; isPending: false };
    export type RejectState<E = unknown> = RejectType<E> & { isFulfilled: false; isRejected: true; isPending: false };
    export type PendingState = PendingType & { isFulfilled: false; isRejected: false; isPending: true };
    export type UndefinedResultState = { status?: undefined; isFulfilled: false; isRejected: false; isPending: false };

    export type State<T, E = unknown> = FulfilledState<T> | RejectState<E> | PendingState;
    export type StateFactory<T, E = unknown> = State<T, E> & { factory: () => StateFactory<T, E> };
    export type PromiseState<T, E = unknown> = State<T, E> & Promise<T>;
    export type PromiseStateFactory<T, E = unknown> = PromiseState<T, E> & { factory: () => PromiseStateFactory<T, E> };


    export async function awaitWrap<T, E = unknown>(promise: Promise<T>): Promise<State<T, E>>;
    export async function awaitWrap<T, E = unknown>(promise: () => Promise<T>): Promise<StateFactory<T, E>>;
    export async function awaitWrap<T, E = unknown>(promise: Promise<T> | (() => Promise<T>)): Promise<State<T, E> | StateFactory<T, E>> {
      const data = typeof promise === 'function' ? wrap<T, E>(promise) : wrap<T, E>(promise);
      // try {

      try {
        await data;
      } catch (e) {
      }

      const rData = {
        status: (data as any).status,
        isFulfilled: (data as any).isFulfilled,
        isRejected: (data as any).isRejected,
        isPending: (data as any).isPending,
        value: (data as any).value,
        reason: (data as any).reason,
      } as any;
      if (typeof promise === 'function') {
        rData.factory = () => {
          return awaitWrap(promise);
        }
        return rData;
      } else {
        return rData;
      }
    }

    export function wrap<T, E = unknown>(promise: Promise<T>): PromiseState<T, E>;
    export function wrap<T, E = unknown>(promise: () => Promise<T>): PromiseStateFactory<T, E>;
    export function wrap<T, E = unknown>(promise: Promise<T> | (() => Promise<T>)): (PromiseState<T, E>) | PromiseStateFactory<T, E> {
      const promiseResult = (typeof promise === 'function' ? promise() : promise) as State<T, E> & Promise<T>;
      if (typeof promise === 'function') {
        const p = promiseResult as unknown as PromiseStateFactory<T, E> & Promise<T>;
        p.factory = () => {
          return wrap(promise);
        }
      }
      if (promiseResult.status === undefined) {
        const p = promiseResult as unknown as PendingState & Promise<T>;
        p.status = 'pending';
        p.isPending = true;
        p.isFulfilled = false;
        p.isRejected = false;
        p.then(
          result => {
            console.log('result??', result)
            const p = promiseResult as unknown as FulfilledState<T>;
            p.status = 'fulfilled';
            p.isFulfilled = true;
            p.isRejected = false;
            p.isPending = false;
            p.value = result;
          },
          reason => {
            console.log('rejet??', reason)
            const p = promiseResult as unknown as RejectState<E>;
            p.status = 'rejected';
            p.isFulfilled = false;
            p.isRejected = true;
            p.isPending = false;
            p.reason = reason;
          }
        );
      }
      return promiseResult;
    }
  }
}
