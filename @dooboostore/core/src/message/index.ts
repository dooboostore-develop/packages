export * from './Store';
export * from './Subject';
export * from './BehaviorSubject';
export * from './ReplaySubject';
export * from './ReplayForwardSubject';
export * from './Observable';
export * from './Subscription';

// Internal utilities
export * from './internal';

export const debounce = <T>(fn: (data: T) => void, delay: number) => {
  // @ts-ignore
  let timer: NodeJS.Timeout | null = null;
  return (data: T) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn(data);
      timer = null;
    }, delay);
  };
};

export const throttleTime = <Args extends [...unknown[]]>(fn: (...args: Args) => void, delay: number) => {
  // @ts-ignore
  let timer: NodeJS.Timeout | null = null;
  return (...args: Args) => {
    if (!timer) {
      timer = setTimeout(() => {
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
