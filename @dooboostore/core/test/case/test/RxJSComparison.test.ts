import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

// Our implementation
import { Subject as OurSubject } from '../../../src/message/Subject';
import { Observable as OurObservable } from '../../../src/message/Observable';
import { throttle as ourThrottle } from '../../../src/message/operators/throttle';
import { interval as ourInterval } from '../../../src/message/operators/interval';
import { mergeMap as ourMergeMap } from '../../../src/message/operators/mergeMap';
import { share as ourShare } from '../../../src/message/operators/share';
import { first as ourFirst } from '../../../src/message/operators/first';

// RxJS implementation
import { Subject as RxSubject, Observable as RxObservable, interval as rxInterval } from 'rxjs';
import { throttle as rxThrottle, mergeMap as rxMergeMap, share as rxShare, first as rxFirst } from 'rxjs/operators';

describe('RxJS Comparison', () => {
  test('should behave the same as RxJS with throttle + mergeMap + share', (t, done) => {
    type Config = { id: number; value: string };
    
    // Our implementation
    const ourSubject = new OurSubject<Config>();
    const ourResults: string[] = [];
    
    const ourPipeline = ourSubject.pipe(
      ourThrottle(() => ourInterval(100)),
      ourMergeMap(config => {
        return new OurObservable<string>(subscriber => {
          setTimeout(() => {
            subscriber.next(`processed-${config.value}`);
            subscriber.complete();
          }, 50);
        });
      }),
      ourShare()
    );
    
    ourPipeline.subscribe((value) => ourResults.push(value));
    
    // RxJS implementation
    const rxSubject = new RxSubject<Config>();
    const rxResults: string[] = [];
    
    const rxPipeline = rxSubject.pipe(
      rxThrottle(() => rxInterval(100)),
      rxMergeMap(config => {
        return new RxObservable<string>(subscriber => {
          setTimeout(() => {
            subscriber.next(`processed-${config.value}`);
            subscriber.complete();
          }, 50);
        });
      }),
      rxShare()
    );
    
    rxPipeline.subscribe((value) => rxResults.push(value));
    
    // Emit same values to both
    const configs = [
      { id: 1, value: 'first' },
      { id: 2, value: 'second' },
      { id: 3, value: 'third' }
    ];
    
    configs.forEach(config => {
      ourSubject.next(config);
      rxSubject.next(config);
    });
    
    setTimeout(() => {
      const fourthConfig = { id: 4, value: 'fourth' };
      ourSubject.next(fourthConfig);
      rxSubject.next(fourthConfig);
    }, 150);
    
    setTimeout(() => {
      console.log('Our results:', ourResults);
      console.log('RxJS results:', rxResults);
      
      // Both should have the same results
      assert.deepStrictEqual(ourResults, rxResults);
      assert.deepStrictEqual(ourResults, ['processed-first', 'processed-fourth']);
      
      done();
    }, 300);
  });

  test('should behave the same as RxJS with multiple subscribers', (t, done) => {
    type Config = { id: number; value: string };
    
    // Our implementation
    const ourSubject = new OurSubject<Config>();
    const ourResults1: string[] = [];
    const ourResults2: string[] = [];
    
    const ourPipeline = ourSubject.pipe(
      ourThrottle(() => ourInterval(100)),
      ourMergeMap(config => {
        return new OurObservable<string>(subscriber => {
          setTimeout(() => {
            subscriber.next(`processed-${config.value}`);
            subscriber.complete();
          }, 50);
        });
      }),
      ourShare()
    );
    
    ourPipeline.subscribe((value) => ourResults1.push(value));
    ourPipeline.subscribe((value) => ourResults2.push(value));
    
    // RxJS implementation
    const rxSubject = new RxSubject<Config>();
    const rxResults1: string[] = [];
    const rxResults2: string[] = [];
    
    const rxPipeline = rxSubject.pipe(
      rxThrottle(() => rxInterval(100)),
      rxMergeMap(config => {
        return new RxObservable<string>(subscriber => {
          setTimeout(() => {
            subscriber.next(`processed-${config.value}`);
            subscriber.complete();
          }, 50);
        });
      }),
      rxShare()
    );
    
    rxPipeline.subscribe((value) => rxResults1.push(value));
    rxPipeline.subscribe((value) => rxResults2.push(value));
    
    // Emit same values to both
    const configs = [
      { id: 1, value: 'first' },
      { id: 2, value: 'second' },
      { id: 3, value: 'third' }
    ];
    
    configs.forEach(config => {
      ourSubject.next(config);
      rxSubject.next(config);
    });
    
    setTimeout(() => {
      const fourthConfig = { id: 4, value: 'fourth' };
      ourSubject.next(fourthConfig);
      rxSubject.next(fourthConfig);
    }, 150);
    
    setTimeout(() => {
      console.log('Our results (subscriber 1):', ourResults1);
      console.log('Our results (subscriber 2):', ourResults2);
      console.log('RxJS results (subscriber 1):', rxResults1);
      console.log('RxJS results (subscriber 2):', rxResults2);
      
      // Both implementations should have the same results
      assert.deepStrictEqual(ourResults1, rxResults1);
      assert.deepStrictEqual(ourResults2, rxResults2);
      assert.deepStrictEqual(ourResults1, ['processed-first', 'processed-fourth']);
      assert.deepStrictEqual(ourResults2, ['processed-first', 'processed-fourth']);
      
      done();
    }, 300);
  });

  test('should behave the same as RxJS with Promise in mergeMap', (t, done) => {
    // Our implementation
    const ourSubject = new OurSubject<number>();
    const ourResults: number[] = [];
    
    ourSubject.pipe(
      ourMergeMap(value => Promise.resolve(value * 2))
    ).subscribe((value) => ourResults.push(value));
    
    // RxJS implementation
    const rxSubject = new RxSubject<number>();
    const rxResults: number[] = [];
    
    rxSubject.pipe(
      rxMergeMap(value => Promise.resolve(value * 2))
    ).subscribe((value) => rxResults.push(value));
    
    // Emit same values
    [1, 2, 3].forEach(value => {
      ourSubject.next(value);
      rxSubject.next(value);
    });
    
    setTimeout(() => {
      console.log('Our results:', ourResults);
      console.log('RxJS results:', rxResults);
      
      assert.deepStrictEqual(ourResults, rxResults);
      assert.deepStrictEqual(ourResults, [2, 4, 6]);
      
      done();
    }, 100);
  });

  test('should behave the same as RxJS with UnAuthorized Interceptor pattern', (t, done) => {
    type FetchConfig = { url: string; status: number };
    
    // Track API call count
    let ourApiCallCount = 0;
    let rxApiCallCount = 0;
    
    // Simulate API service
    const ourMockApiGet = () => {
      ourApiCallCount++;
      console.log(`Our: API called (count: ${ourApiCallCount})`);
      return Promise.resolve({ success: true, token: 'new-token' });
    };
    
    const rxMockApiGet = () => {
      rxApiCallCount++;
      console.log(`RxJS: API called (count: ${rxApiCallCount})`);
      return Promise.resolve({ success: true, token: 'new-token' });
    };
    
    // Our implementation
    const ourSyncSignalSubject = new OurSubject<FetchConfig>();
    const ourSyncSignalThrottleShareObservable = ourSyncSignalSubject.pipe(
      ourThrottle(() => ourInterval(2000)),
      ourMergeMap(config => {
        console.log('Our: Processing config for', config.url);
        return new OurObservable(subscriber => {
          ourMockApiGet().then(result => {
            subscriber.next(result);
            subscriber.complete();
          });
        });
      }),
      ourShare()
    );
    
    // RxJS implementation
    const rxSyncSignalSubject = new RxSubject<FetchConfig>();
    const rxSyncSignalThrottleShareObservable = rxSyncSignalSubject.pipe(
      rxThrottle(() => rxInterval(2000)),
      rxMergeMap(config => {
        console.log('RxJS: Processing config for', config.url);
        return new RxObservable(subscriber => {
          rxMockApiGet().then(result => {
            subscriber.next(result);
            subscriber.complete();
          });
        });
      }),
      rxShare()
    );
    
    const ourResults: any[] = [];
    const rxResults: any[] = [];
    
    // Simulate multiple unauthorized requests happening at the same time
    const requests = [
      { url: '/api/users', status: 401 },
      { url: '/api/posts', status: 401 },
      { url: '/api/comments', status: 401 }
    ];
    
    // Our implementation - simulate interceptor behavior
    const ourPromises = requests.map(req => {
      return new Promise((resolve) => {
        ourSyncSignalThrottleShareObservable.pipe(ourFirst()).subscribe({
          next: (result) => {
            console.log('Our: Request', req.url, 'got token');
            ourResults.push({ url: req.url, result });
            resolve(result);
          }
        });
        ourSyncSignalSubject.next(req);
      });
    });
    
    // RxJS implementation - simulate interceptor behavior
    const rxPromises = requests.map(req => {
      return new Promise((resolve) => {
        rxSyncSignalThrottleShareObservable.pipe(rxFirst()).subscribe({
          next: (result) => {
            console.log('RxJS: Request', req.url, 'got token');
            rxResults.push({ url: req.url, result });
            resolve(result);
          }
        });
        rxSyncSignalSubject.next(req);
      });
    });
    
    Promise.all([...ourPromises, ...rxPromises]).then(() => {
      console.log('=== Final Results ===');
      console.log('Our API call count:', ourApiCallCount);
      console.log('RxJS API call count:', rxApiCallCount);
      console.log('Our results count:', ourResults.length);
      console.log('RxJS results count:', rxResults.length);
      
      // API should be called only ONCE for each implementation
      assert.strictEqual(ourApiCallCount, 1, 'Our implementation should call API only once');
      assert.strictEqual(rxApiCallCount, 1, 'RxJS should call API only once');
      
      // Both should have processed all 3 requests
      assert.strictEqual(ourResults.length, 3);
      assert.strictEqual(rxResults.length, 3);
      
      // All should have received the same token
      ourResults.forEach(r => {
        assert.deepStrictEqual(r.result, { success: true, token: 'new-token' });
      });
      rxResults.forEach(r => {
        assert.deepStrictEqual(r.result, { success: true, token: 'new-token' });
      });
      
      done();
    });
  });

  test('should handle simultaneous 401 errors exactly like RxJS (real scenario)', (t, done) => {
    type FetchConfig = { url: string; status: number };
    
    // Track API call count
    let ourApiCallCount = 0;
    let rxApiCallCount = 0;
    
    // Simulate API service with delay
    const ourMockApiGet = () => {
      ourApiCallCount++;
      console.log(`Our: refreshAccessToken called (count: ${ourApiCallCount})`);
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ success: true, token: `token-${ourApiCallCount}` });
        }, 100); // Simulate network delay
      });
    };
    
    const rxMockApiGet = () => {
      rxApiCallCount++;
      console.log(`RxJS: refreshAccessToken called (count: ${rxApiCallCount})`);
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ success: true, token: `token-${rxApiCallCount}` });
        }, 100); // Simulate network delay
      });
    };
    
    // Our implementation - exactly like ApiServiceAfterProxyFetchUnAuthorizedInterceptor
    const ourSyncSignalSubject = new OurSubject<FetchConfig>();
    const ourSyncSignalThrottleShareObservable = ourSyncSignalSubject.pipe(
      ourThrottle(() => ourInterval(2000)),
      ourMergeMap(config => {
        return new OurObservable(subscriber => {
          ourMockApiGet().then(result => {
            subscriber.next(result);
            subscriber.complete();
          });
        });
      }),
      ourShare()
    );
    
    // RxJS implementation - exactly like ApiServiceAfterProxyFetchUnAuthorizedInterceptor
    const rxSyncSignalSubject = new RxSubject<FetchConfig>();
    const rxSyncSignalThrottleShareObservable = rxSyncSignalSubject.pipe(
      rxThrottle(() => rxInterval(2000)),
      rxMergeMap(config => {
        return new RxObservable(subscriber => {
          rxMockApiGet().then(result => {
            subscriber.next(result);
            subscriber.complete();
          });
        });
      }),
      rxShare()
    );
    
    // Simulate afterProxyFetch being called for multiple 401 responses
    const ourAfterProxyFetch = async (config: FetchConfig) => {
      if (config.status === 401) {
        return new Promise((resolve) => {
          ourSyncSignalThrottleShareObservable.pipe(ourFirst()).subscribe({
            next: (result) => {
              console.log(`Our: ${config.url} - Token refreshed, retrying request`);
              resolve(result);
            },
            error: () => {
              console.log(`Our: ${config.url} - Token refresh failed`);
              resolve({ error: true });
            }
          });
          ourSyncSignalSubject.next(config);
        });
      }
      return config;
    };
    
    const rxAfterProxyFetch = async (config: FetchConfig) => {
      if (config.status === 401) {
        return new Promise((resolve) => {
          rxSyncSignalThrottleShareObservable.pipe(rxFirst()).subscribe({
            next: (result) => {
              console.log(`RxJS: ${config.url} - Token refreshed, retrying request`);
              resolve(result);
            },
            error: () => {
              console.log(`RxJS: ${config.url} - Token refresh failed`);
              resolve({ error: true });
            }
          });
          rxSyncSignalSubject.next(config);
        });
      }
      return config;
    };
    
    // Simulate 5 simultaneous 401 errors
    const requests = [
      { url: '/api/users', status: 401 },
      { url: '/api/posts', status: 401 },
      { url: '/api/comments', status: 401 },
      { url: '/api/likes', status: 401 },
      { url: '/api/follows', status: 401 }
    ];
    
    console.log('=== Starting simultaneous 401 requests ===');
    
    const ourPromises = requests.map(req => ourAfterProxyFetch(req));
    const rxPromises = requests.map(req => rxAfterProxyFetch(req));
    
    Promise.all([...ourPromises, ...rxPromises]).then(() => {
      console.log('\n=== Final Results ===');
      console.log('Our API call count:', ourApiCallCount);
      console.log('RxJS API call count:', rxApiCallCount);
      
      // CRITICAL: API should be called only ONCE for each implementation
      // This is the whole point of throttle + share
      assert.strictEqual(ourApiCallCount, 1, 'Our implementation should call refreshAccessToken only ONCE');
      assert.strictEqual(rxApiCallCount, 1, 'RxJS should call refreshAccessToken only ONCE');
      
      done();
    });
  });

  test('should handle mixed 200/401 responses with delays (stress test)', (t, done) => {
    type FetchConfig = { url: string; status: number };
    
    // Track API call count
    let ourApiCallCount = 0;
    let rxApiCallCount = 0;
    
    // Simulate API service with delay
    const ourMockApiGet = () => {
      ourApiCallCount++;
      console.log(`Our: refreshAccessToken called (count: ${ourApiCallCount})`);
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ success: true, token: `token-${Date.now()}` });
        }, 150); // Simulate network delay
      });
    };
    
    const rxMockApiGet = () => {
      rxApiCallCount++;
      console.log(`RxJS: refreshAccessToken called (count: ${rxApiCallCount})`);
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ success: true, token: `token-${Date.now()}` });
        }, 150); // Simulate network delay
      });
    };
    
    // Our implementation
    const ourSyncSignalSubject = new OurSubject<FetchConfig>();
    const ourSyncSignalThrottleShareObservable = ourSyncSignalSubject.pipe(
      ourThrottle(() => ourInterval(2000)),
      ourMergeMap(config => {
        return new OurObservable(subscriber => {
          ourMockApiGet().then(result => {
            subscriber.next(result);
            subscriber.complete();
          });
        });
      }),
      ourShare()
    );
    
    // RxJS implementation
    const rxSyncSignalSubject = new RxSubject<FetchConfig>();
    const rxSyncSignalThrottleShareObservable = rxSyncSignalSubject.pipe(
      rxThrottle(() => rxInterval(2000)),
      rxMergeMap(config => {
        return new RxObservable(subscriber => {
          rxMockApiGet().then(result => {
            subscriber.next(result);
            subscriber.complete();
          });
        });
      }),
      rxShare()
    );
    
    // Simulate afterProxyFetch
    const ourAfterProxyFetch = async (config: FetchConfig) => {
      if (config.status === 401) {
        return new Promise((resolve) => {
          ourSyncSignalThrottleShareObservable.pipe(ourFirst()).subscribe({
            next: (result) => {
              console.log(`Our: ${config.url} (401) - Token refreshed`);
              resolve(result);
            },
            error: () => {
              resolve({ error: true });
            }
          });
          ourSyncSignalSubject.next(config);
        });
      }
      console.log(`Our: ${config.url} (200) - No refresh needed`);
      return config;
    };
    
    const rxAfterProxyFetch = async (config: FetchConfig) => {
      if (config.status === 401) {
        return new Promise((resolve) => {
          rxSyncSignalThrottleShareObservable.pipe(rxFirst()).subscribe({
            next: (result) => {
              console.log(`RxJS: ${config.url} (401) - Token refreshed`);
              resolve(result);
            },
            error: () => {
              resolve({ error: true });
            }
          });
          rxSyncSignalSubject.next(config);
        });
      }
      console.log(`RxJS: ${config.url} (200) - No refresh needed`);
      return config;
    };
    
    // Simulate realistic scenario: mix of 200 and 401 responses with delays
    const requests = [
      { url: '/api/users', status: 401 },
      { url: '/api/posts', status: 200 },
      { url: '/api/feed', status: 200 },
      { url: '/api/comments', status: 401 },
      { url: '/api/likes', status: 200 },
      { url: '/api/profile', status: 200 },
      { url: '/api/follows', status: 401 },
      { url: '/api/trending', status: 200 },
      { url: '/api/notifications', status: 401 },
      { url: '/api/settings', status: 200 },
      { url: '/api/messages', status: 401 },
      { url: '/api/search', status: 200 },
      { url: '/api/friends', status: 401 },
      { url: '/api/stats', status: 200 },
      { url: '/api/activity', status: 200 }
    ];
    
    console.log('\n=== Starting mixed 200/401 requests with delays ===');
    
    const ourResults: any[] = [];
    const rxResults: any[] = [];
    let ourCompletedCount = 0;
    let rxCompletedCount = 0;
    
    // Send requests with random delays to simulate real-world timing
    requests.forEach((req, index) => {
      // Random delay between 0-100ms for each request
      const randomDelay = Math.floor(Math.random() * 100) + (index * 30);
      
      setTimeout(() => {
        // Our implementation - direct subscribe
        if (req.status === 401) {
          ourSyncSignalThrottleShareObservable.pipe(ourFirst()).subscribe({
            next: (result) => {
              console.log(`Our: ${req.url} (401) - Token refreshed`);
              ourResults.push({ url: req.url, result });
              ourCompletedCount++;
            }
          });
          ourSyncSignalSubject.next(req);
        } else {
          console.log(`Our: ${req.url} (200) - No refresh needed`);
          ourResults.push({ url: req.url, status: 200 });
          ourCompletedCount++;
        }
        
        // RxJS implementation - direct subscribe
        if (req.status === 401) {
          rxSyncSignalThrottleShareObservable.pipe(rxFirst()).subscribe({
            next: (result) => {
              console.log(`RxJS: ${req.url} (401) - Token refreshed`);
              rxResults.push({ url: req.url, result });
              rxCompletedCount++;
            }
          });
          rxSyncSignalSubject.next(req);
        } else {
          console.log(`RxJS: ${req.url} (200) - No refresh needed`);
          rxResults.push({ url: req.url, status: 200 });
          rxCompletedCount++;
        }
      }, randomDelay);
    });
    
    // Wait for all requests to complete
    setTimeout(() => {
      console.log('\n=== Final Results (Stress Test) ===');
      console.log('Our API call count:', ourApiCallCount);
      console.log('RxJS API call count:', rxApiCallCount);
      console.log('Our completed requests:', ourCompletedCount);
      console.log('RxJS completed requests:', rxCompletedCount);
      console.log('Total 401 requests:', requests.filter(r => r.status === 401).length);
      console.log('Total 200 requests:', requests.filter(r => r.status === 200).length);
      
      // CRITICAL: Our implementation should behave EXACTLY like RxJS
      assert.strictEqual(ourApiCallCount, rxApiCallCount, 'Both should have EXACTLY the same API call count');
      assert.strictEqual(ourCompletedCount, requests.length, 'All our requests should complete');
      assert.strictEqual(rxCompletedCount, requests.length, 'All RxJS requests should complete');
      
      console.log('✅ Both implementations called API the same number of times:', ourApiCallCount);
      
      done();
    }, 3000); // Wait 3 seconds for all requests + throttle period
  });
});
