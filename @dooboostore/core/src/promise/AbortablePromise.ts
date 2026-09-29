/**
 * AbortablePromise - AbortSignal 로 끊을 수 있는 Promise.
 * - 그대로 await 가능. executor 는 생성 시 한 번만 실행된다 (체이닝해도 다시 안 돈다)
 * - 시작 전에 이미 abort 면 executor(팩토리)를 부르지 않는다
 * - 진행 중 abort 면 즉시 reject, 체인의 각 단계 전에도 abort 를 확인한다
 * - reject 값은 signal.reason 그대로 (AbortError 이름 유지)
 */
export class AbortablePromise<T> implements PromiseLike<T> {
  private readonly source: Promise<T>;
  private guarded?: Promise<T>;

  constructor(
    executor: (() => Promise<T>) | Promise<T>,
    private readonly signal?: AbortSignal
  ) {
    if (typeof executor !== 'function') {
      // 이미 시작된 promise — abort 여부는 소비될 때(promise getter) 판단
      this.source = Promise.resolve(executor);
    } else if (signal?.aborted) {
      // 이미 abort 면 팩토리를 아예 부르지 않는다
      this.source = Promise.reject(signal.reason);
    } else {
      this.source = Promise.resolve().then(executor);
    }
  }

  /**
   * source 를 abort 와 경쟁시킨 promise. 실제로 소비될 때(then/toPromise) 한 번만 만든다 —
   * await 는 then() 이 돌려준 새 인스턴스를 버리므로, 미리 만들면 아무도 안 받는 reject 가 unhandled 로 남는다.
   */
  private get promise(): Promise<T> {
    if (this.guarded) return this.guarded;
    const signal = this.signal;
    if (!signal) return (this.guarded = this.source);
    if (signal.aborted) {
      // source 가 나중에 reject 돼도 unhandled rejection 이 안 나게 흡수하고, 소비자에겐 abort 로 reject
      this.source.catch(() => {});
      return (this.guarded = Promise.reject(signal.reason));
    }
    return (this.guarded = new Promise<T>((resolve, reject) => {
      // 끝나면 리스너를 먼저 떼고 결과를 넘긴다 (같은 signal 에 리스너가 쌓이지 않게)
      const cleanup = () => signal.removeEventListener('abort', onAbort);
      const onAbort = () => reject(signal.reason);
      signal.addEventListener('abort', onAbort, { once: true });
      this.source.then(
        value => { cleanup(); resolve(value); },
        reason => { cleanup(); reject(reason); }
      );
    }));
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): AbortablePromise<TResult1 | TResult2> {
    const signal = this.signal;
    const next = this.promise.then(
      onfulfilled
        ? (value: T) => {
            // 다음 단계로 넘어가기 전에 abort 확인
            if (signal?.aborted) throw signal.reason;
            return onfulfilled(value);
          }
        : undefined,
      onrejected
    ) as Promise<TResult1 | TResult2>;
    return new AbortablePromise<TResult1 | TResult2>(next, signal);
  }

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
  ): AbortablePromise<T | TResult> {
    return this.then(undefined, onrejected);
  }

  finally(onfinally?: (() => void) | undefined | null): AbortablePromise<T> {
    return new AbortablePromise<T>(this.promise.finally(onfinally), this.signal);
  }

  // 네이티브 Promise 로 변환 (그냥 await 해도 된다)
  toPromise(): Promise<T> {
    return this.promise;
  }
}
