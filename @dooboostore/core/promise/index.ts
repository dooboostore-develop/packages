import { Subscription } from '../message/Subscription';

export namespace Promises {
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

  export const loopGapDelay = <T>(config: {
    factory: (config: {age:number}) => Promise<T>,
    then?: (data: T, config:{age: number})=> void,
    catch?: (e: any, config:{age: number})=> void,
    delayThen?: (config:{age: number, isCatch: boolean, data?: T}) => void,
    delay?: number, afterDelay?: number}
  ): Subscription => {
    let stop = false;
    let age = 0;
    const loop = async () => {
      age++;
      const executeConfig = {age: age};
      let t: T;
      let isCatch = false;
      try {
         t = await config.factory(executeConfig);
        config.then?.(t, executeConfig);
      } catch(e) {
        isCatch = true;
        config.catch?.(e, executeConfig);
      }
      await sleep(config.afterDelay ?? 0);
      config.delayThen?.({...executeConfig, isCatch: isCatch, data: t});
      if (!stop)
      return loop();
    };

    setTimeout(() => {
      loop();
    }, config.delay ?? 0);
    return {
      unsubscribe: () => {
        stop = true;
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
        config?.then?.(data, { before: before });
      })
      .catch(e => {
        config?.catch?.(e, { before: before, after: after });
        if (!config?.disabledCatchThrow) {
          throw e;
        }
      })
      .finally(() => {
        config?.finally?.({ before: before, after: after, data: promiseData });
      });
  };

  export const withResolvers = <T>() => {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: any) => void;

    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    return { promise, resolve, reject };
  }


  export namespace Result {
    export type FulfilledType<T> = PromiseFulfilledResult<T>;
    export type RejectType<E = unknown> = Omit<PromiseRejectedResult, 'reason'> & { reason: E };
    export type PendingType = { status: 'pending' };
    export type Type<T, E = unknown> = FulfilledType<T> | RejectType<E> | PendingType;

    type FulfilledState<T> = FulfilledType<T> & { isFulfilled: true; isRejected: false; isPending: false };
    type RejectState<E = unknown> = RejectType<E> & { isFulfilled: false; isRejected: true; isPending: false };
    type PendingState = PendingType & { isFulfilled: false; isRejected: false; isPending: true };
    type UndefinedResultState = { status?: undefined; isFulfilled: false; isRejected: false; isPending: false };
    export type State<T, E = unknown> = FulfilledState<T> | RejectState<E> | PendingState;

    export const awaitWrap = async <T, E = unknown>(
      promise: Promise<T>
    ): Promise<Promises.Result.State<T, E> & Promise<T>> => {
      const data = wrap<T, E>(promise);
      const result = await data;
      return data;
    };
    export const wrap = <T, E = unknown>(promise: Promise<T>) => {
      const promiseResult = promise as State<T, E> & Promise<T>;
      if (promiseResult.status === undefined) {
        const p = promiseResult as unknown as PendingState & Promise<T>;
        p.status = 'pending';
        p.isPending = true;
        p.isFulfilled = false;
        p.isRejected = false;
        p.then(
          result => {
            const p = promiseResult as unknown as FulfilledState<T>;
            p.status = 'fulfilled';
            p.isFulfilled = true;
            p.isRejected = false;
            p.isPending = false;
            p.value = result;
          },
          reason => {
            const p = promiseResult as unknown as RejectState<E>;
            p.status = 'rejected';
            p.isFulfilled = false;
            p.isRejected = true;
            p.isPending = false;
            p.reason = reason;
          }
        );
        return promiseResult;
      } else {
        return promiseResult;
      }
    };
  }
}
