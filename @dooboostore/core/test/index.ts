// import { Expression } from '@dooboostore/core/expression/Expression';
//
// const data = Expression.bindExpression(`Hello $\{name} \${date:ffff}`, { ffff: 'aaa', name: 'World', date: (param: string) => new Date().toLocaleDateString() + param });
// console.log(data);

import { polygonTest } from './test/polygon.test';
import { wrapRectsTest } from './test/wrapRects.test';
import { wrapPolygonTest } from './test/wrapPolygon.test';

// polygonTest();
// wrapRectsTest();
wrapPolygonTest();