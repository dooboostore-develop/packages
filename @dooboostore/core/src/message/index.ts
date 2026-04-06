export * from './Store';
export * from './Subject';
export * from './BehaviorSubject';
export * from './ReplaySubject';
export * from './ReplayForwardSubject';
export * from './Observable';
export * from './Subscription';
export * from './AutoCloseSubscription'

// Internal utilities
export * as MessageInternal from './internal';
export * as MessageOperator from './operators';

export interface TimerConfig {
  setTimeout?: (callback: () => void, ms: number) => any;
  clearTimeout?: (id: any) => void;
}

export interface IntervalConfig {
  setInterval?: (handler:  string | Function, timeout?: number) => number;
  clearInterval?: (id: number | undefined) => void;
}


export type IntervalIdType = any | null | undefined;
/*
   if (this._childrenConnectedDoneInterval) {
          clearInterval(this._childrenConnectedDoneInterval);
        }

        this._childrenConnectedDoneInterval = debounceTimeIntervalLock(
          () => this._connectedInvocations === 0,
          () => {
            this._childrenConnectedDoneInterval = null;
            this.config.onChildrenConnectedDone(this)
          },
          this.config?.childrenConnectedDoneCheckIntervalTime ?? 30
          , {
            setInterval: window.setInterval,
            clearInterval: window.clearInterval
          });

 */
export const debounceTimeIntervalLock = (
    unlockChecker: () => boolean,
    unlocked: () => void,
    intervalTime: number,
    config?: IntervalConfig
) => {
  const clearIntervalFn = config?.clearInterval || clearInterval;
  const setIntervalFn = config?.setInterval || setInterval;
  
  // console.log('[debounceTimeIntervalLock] setIntervalFn type:', typeof setIntervalFn);
  // console.log('[debounceTimeIntervalLock] clearIntervalFn type:', typeof clearIntervalFn);

  const nextIntervalId = setIntervalFn(() => {
    if (unlockChecker()) {
      // console.log('[debounceTimeIntervalLock] Interval unlocked, clearing ID:', nextIntervalId);
      clearIntervalFn(nextIntervalId);
      unlocked();
    }
  }, intervalTime);

  // console.log('[debounceTimeIntervalLock] Interval created with ID:', nextIntervalId);
  return nextIntervalId;
}

export const debounce = <T>(fn: (data: T) => void, delay: number, config?: TimerConfig) => {
  const setTimeoutFn = config?.setTimeout || setTimeout;
  const clearTimeoutFn = config?.clearTimeout || clearTimeout;

  let timer: any = null;
  return (data: T) => {
    if (timer) {
      clearTimeoutFn(timer);
    }
    timer = setTimeoutFn(() => {
      fn(data);
      timer = null;
    }, delay);
  };
};

export const throttleTime = <Args extends [...unknown[]]>(fn: (...args: Args) => void, delay: number, config?: TimerConfig) => {
  const setTimeoutFn = config?.setTimeout || setTimeout;

  let timer: any = null;
  return (...args: Args) => {
    if (!timer) {
      timer = setTimeoutFn(() => {
        fn(...args);
        timer = null;
      }, delay);
    }
  };
};

export const throttle = <Args extends [...unknown[]]>(fn: (...args: Args) => void, delay: number) => {
  let lastTime = 0;
  return (...args: Args) => {
    const now = Date.now();
    if (now - lastTime >= delay) {
      fn(...args);
      lastTime = now;
    }
  };
};
