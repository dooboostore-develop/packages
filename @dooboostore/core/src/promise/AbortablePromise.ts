/**
 * AbortablePromise - Promise-like class that supports AbortSignal
 * Allows chaining with .then() and collects steps for sequential execution
 */
export class AbortablePromise<T> implements PromiseLike<T> {
  private steps: Array<(value: any) => any> = [];
  private signal?: AbortSignal;
  private initialExecutor: (() => Promise<any>) | Promise<any>;
  private errorHandler?: (reason: any) => any;

  constructor(
    executor: (() => Promise<T>) | Promise<T>,
    signal?: AbortSignal
  ) {
    this.initialExecutor = executor;
    this.signal = signal;
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): AbortablePromise<TResult1 | TResult2> {
    // Create new promise instance
    const newPromise = new AbortablePromise<TResult1 | TResult2>(
      this.initialExecutor,
      this.signal
    );

    // Copy existing steps
    newPromise.steps = [...this.steps];

    // Add new step if provided
    if (onfulfilled) {
      newPromise.steps.push(onfulfilled as any);
    }

    // Set error handler if provided
    if (onrejected) {
      newPromise.errorHandler = onrejected as any;
    } else if (this.errorHandler) {
      newPromise.errorHandler = this.errorHandler;
    }

    return newPromise;
  }

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
  ): AbortablePromise<T | TResult> {
    return this.then(undefined, onrejected);
  }

  finally(onfinally?: (() => void) | undefined | null): AbortablePromise<T> {
    return this.then(
      (value) => {
        onfinally?.();
        return value;
      },
      (reason) => {
        onfinally?.();
        throw reason;
      }
    );
  }

  private async execute(): Promise<T> {
    try {
      // Check abort before starting
      if (this.signal?.aborted) {
        throw new Error(this.signal.reason || 'Aborted');
      }

      // Create abort promise
      const abortPromise = new Promise<never>((_, reject) => {
        if (this.signal?.aborted) {
          return reject(new Error(this.signal.reason || 'Aborted'));
        }
        const callback = (e: Event) => {
          const target = e.target as AbortSignal;
          this.signal?.removeEventListener('abort', callback);
          reject(new Error(target.reason || 'Aborted'));
        };
        this.signal?.addEventListener('abort', callback, { once: true });
      });

      // Pipeline runner
      const pipelineRunner = async (): Promise<T> => {
        // Execute initial executor
        let lastResult: any;
        if (typeof this.initialExecutor === 'function') {
          if (this.signal?.aborted) {
            throw new Error(this.signal.reason || 'Aborted');
          }
          lastResult = await (this.initialExecutor as () => Promise<any>)();
        } else {
          lastResult = await this.initialExecutor;
        }

        // Execute each step sequentially
        for (let i = 0; i < this.steps.length; i++) {
          // Check abort before each step
          if (this.signal?.aborted) {
            throw new Error(this.signal.reason || 'Aborted');
          }

          const step = this.steps[i];
          lastResult = await step(lastResult);
        }

        return lastResult;
      };

      return await Promise.race([pipelineRunner(), abortPromise]);
    } catch (error) {
      if (this.errorHandler) {
        return await this.errorHandler(error);
      }
      throw error;
    }
  }

  // Convert to native Promise
  toPromise(): Promise<T> {
    return this.execute();
  }
}