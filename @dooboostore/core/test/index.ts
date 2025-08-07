// import { Expression } from '@dooboostore/core/expression/Expression';
//
// const data = Expression.bindExpression(`Hello $\{name} \${date:ffff}`, { ffff: 'aaa', name: 'World', date: (param: string) => new Date().toLocaleDateString() + param });
// console.log(data);

import { polygonTest } from './test/polygon.test';
import { wrapRectsTest } from './test/wrapRects.test';
import { wrapPolygonTest } from './test/wrapPolygon.test';
import { observableTest } from './test/Observable.test';
import { subjectTest } from './test/Subject.test';
import { behaviorSubjectTest } from './test/BehaviorSubject.test';
import { replaySubjectTest } from './test/ReplaySubject.test';
import { asyncSubjectTest } from './test/AsyncSubject.test';
import { debounceTimeTest } from './test/debounceTime.test';
import { distinctUntilChangedTest } from './test/distinctUntilChanged.test';
import { pipeTest } from './test/pipe.test';
import { intervalTest } from './test/interval.test';
import { takeTest } from './test/take.test';
import { lastValueFromTest } from './test/lastValueFrom.test';
import { internalIntegrationTest } from './test/internal-integration.test';
import { runAllTests } from './test/run-all-tests';

// polygonTest();
// wrapRectsTest();
// wrapPolygonTest();
// observableTest();

// subjectTest();
// behaviorSubjectTest();
// replaySubjectTest();
// asyncSubjectTest();
// debounceTimeTest();
// pipeTest();
// distinctUntilChangedTest();

// Internal operators tests
// async function runInternalTests() {
//   console.log('=== Running Internal Operators Tests ===');
//
//    intervalTest();
//   takeTest();
//    lastValueFromTest();
//   internalIntegrationTest();
//
//   console.log('=== All Internal Tests Completed ===');
// }
//
// runInternalTests().catch(console.error);
runAllTests()