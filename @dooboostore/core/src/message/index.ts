export * from './Store';
export * from './Subject';
export * from './BehaviorSubject';
export * from './ReplaySubject';
export * from './ReplayForwardSubject';
export * from './Observable';
export * from './Subscription';

// Internal utilities
export * as MessageInternal from './internal';
export * as MessageOperator from './operators';

export interface TimerConfig {
  setTimeout?: (callback: () => void, ms: number) => any;
  clearTimeout?: (id: any) => void;
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
