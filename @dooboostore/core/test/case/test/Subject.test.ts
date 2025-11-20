import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Subject } from '../../../src/message/Subject';
import { Observable } from '../../../src/message/Observable';
import { filter } from '../../../src/message/operators/filter';
import { throttle } from '../../../src/message/operators/throttle';
import { interval } from '../../../src/message/operators/interval';
import { share } from '../../../src/message/operators/share';
import { mergeMap } from '../../../src/message/operators/mergeMap';

describe('Subject', () => {
  test('should emit values to multiple subscribers', (t, done) => {
    const subject = new Subject<number>();
    const results1: number[] = [];
    const results2: number[] = [];

    subject.subscribe((value) => results1.push(value));
    subject.subscribe((value) => results2.push(value));

    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.complete();

    setTimeout(() => {
      assert.deepStrictEqual(results1, [1, 2, 3]);
      assert.deepStrictEqual(results2, [1, 2, 3]);
      done();
    }, 10);
  });

  test('should work with filter operator', (t, done) => {
    const subject = new Subject<number>();
    const results: number[] = [];

    subject
      .pipe(filter((x) => x % 2 === 0))
      .subscribe((value) => results.push(value));

    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.next(4);
    subject.complete();

    setTimeout(() => {
      assert.deepStrictEqual(results, [2, 4]);
      done();
    }, 10);
  });

  test('should work with throttle operator', (t, done) => {
    const subject = new Subject<number>();
    const results: number[] = [];

    subject
      .pipe(throttle(() => interval(100)))
      .subscribe((value) => results.push(value));

    subject.next(1); // emit immediately (leading)
    subject.next(2); // throttled
    subject.next(3); // throttled

    setTimeout(() => {
      subject.next(4); // emit after throttle period
    }, 150);

    setTimeout(() => {
      assert.deepStrictEqual(results, [1, 4]);
      done();
    }, 200);
  });

  test('should work with share operator', (t, done) => {
    const subject = new Subject<number>();
    const shared = subject.pipe(share());
    
    const results1: number[] = [];
    const results2: number[] = [];

    shared.subscribe((value) => results1.push(value));
    shared.subscribe((value) => results2.push(value));

    subject.next(1);
    subject.next(2);
    subject.next(3);

    setTimeout(() => {
      assert.deepStrictEqual(results1, [1, 2, 3]);
      assert.deepStrictEqual(results2, [1, 2, 3]);
      done();
    }, 10);
  });

  test('should handle error', (t, done) => {
    const subject = new Subject<number>();
    let errorReceived = false;

    subject.subscribe({
      next: () => {},
      error: (err) => {
        errorReceived = true;
        assert.strictEqual(err.message, 'test error');
        done();
      }
    });

    subject.error(new Error('test error'));
    assert.strictEqual(errorReceived, true);
  });

  test('should handle complete', (t, done) => {
    const subject = new Subject<number>();
    let completed = false;

    subject.subscribe({
      next: () => {},
      complete: () => {
        completed = true;
        done();
      }
    });

    subject.complete();
    assert.strictEqual(completed, true);
  });

  test('should not emit after complete', (t, done) => {
    const subject = new Subject<number>();
    const results: number[] = [];

    subject.subscribe((value) => results.push(value));

    subject.next(1);
    subject.complete();
    subject.next(2); // should not emit

    setTimeout(() => {
      assert.deepStrictEqual(results, [1]);
      done();
    }, 10);
  });

  test('should not emit after error', (t, done) => {
    const subject = new Subject<number>();
    const results: number[] = [];

    subject.subscribe({
      next: (value) => results.push(value),
      error: () => {}
    });

    subject.next(1);
    subject.error(new Error('test'));
    subject.next(2); // should not emit

    setTimeout(() => {
      assert.deepStrictEqual(results, [1]);
      done();
    }, 10);
  });

  test('should work with throttle and mergeMap (like syncSignalThrottleShareObservable)', (t, done) => {
    type Config = { id: number; value: string };
    const syncSignalSubject = new Subject<Config>();
    const results: string[] = [];

    const syncSignalThrottleShareObservable = syncSignalSubject.pipe(
      throttle(() => interval(100)),
      mergeMap(config => {
        // Simulate async operation
        return new Observable<string>(subscriber => {
          setTimeout(() => {
            subscriber.next(`processed-${config.value}`);
            subscriber.complete();
          }, 50);
        });
      })
    );

    syncSignalThrottleShareObservable.subscribe((value) => {
      results.push(value);
    });

    // Emit multiple values quickly
    syncSignalSubject.next({ id: 1, value: 'first' });  // Should be processed (leading)
    syncSignalSubject.next({ id: 2, value: 'second' }); // Throttled
    syncSignalSubject.next({ id: 3, value: 'third' });  // Throttled

    setTimeout(() => {
      // After throttle period, emit another
      syncSignalSubject.next({ id: 4, value: 'fourth' }); // Should be processed
    }, 150);

    setTimeout(() => {
      // First and fourth should be processed
      assert.deepStrictEqual(results, ['processed-first', 'processed-fourth']);
      done();
    }, 300);
  });

  test('should work with throttle, mergeMap and share (complete pattern)', (t, done) => {
    type Config = { id: number; value: string };
    const syncSignalSubject = new Subject<Config>();
    const results1: string[] = [];
    const results2: string[] = [];

    const syncSignalThrottleShareObservable = syncSignalSubject.pipe(
      throttle(() => interval(100)),
      mergeMap(config => {
        // Simulate async operation
        return new Observable<string>(subscriber => {
          setTimeout(() => {
            subscriber.next(`processed-${config.value}`);
            subscriber.complete();
          }, 50);
        });
      }),
      share() // Share the result among multiple subscribers
    );

    // Multiple subscribers
    syncSignalThrottleShareObservable.subscribe((value) => {
      results1.push(value);
    });

    syncSignalThrottleShareObservable.subscribe((value) => {
      results2.push(value);
    });

    // Emit multiple values quickly
    syncSignalSubject.next({ id: 1, value: 'first' });  // Should be processed (leading)
    syncSignalSubject.next({ id: 2, value: 'second' }); // Throttled
    syncSignalSubject.next({ id: 3, value: 'third' });  // Throttled

    setTimeout(() => {
      // After throttle period, emit another
      syncSignalSubject.next({ id: 4, value: 'fourth' }); // Should be processed
    }, 150);

    setTimeout(() => {
      // Both subscribers should receive the same values
      assert.deepStrictEqual(results1, ['processed-first', 'processed-fourth']);
      assert.deepStrictEqual(results2, ['processed-first', 'processed-fourth']);
      done();
    }, 300);
  });

  test('should work with mergeMap and Promise', (t, done) => {
    const subject = new Subject<number>();
    const results: number[] = [];

    subject
      .pipe(
        mergeMap(value => {
          // Return a Promise
          return Promise.resolve(value * 2);
        })
      )
      .subscribe((value) => results.push(value));

    subject.next(1);
    subject.next(2);
    subject.next(3);

    setTimeout(() => {
      assert.deepStrictEqual(results, [2, 4, 6]);
      done();
    }, 50);
  });

  test('should work with mergeMap and Observable', (t, done) => {
    const subject = new Subject<number>();
    const results: number[] = [];

    subject
      .pipe(
        mergeMap(value => {
          // Return an Observable
          return new Observable<number>(subscriber => {
            subscriber.next(value * 10);
            subscriber.complete();
          });
        })
      )
      .subscribe((value) => results.push(value));

    subject.next(1);
    subject.next(2);
    subject.next(3);

    setTimeout(() => {
      assert.deepStrictEqual(results, [10, 20, 30]);
      done();
    }, 50);
  });
});
