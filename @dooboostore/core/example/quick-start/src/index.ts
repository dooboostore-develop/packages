import { Rect } from '@dooboostore/core/entity/Rect';
import { HttpFetcher } from '@dooboostore/core/fetch/HttpFetcher';

console.log('aa');

const a = new Rect(0,0,100,100);
const b = new Rect(0,0,50,50);
const c = new Rect(0,0,50,50);
//
a.addLink(b);
a.addLink(c);
//
//
console.log('a:',a.toString());
console.log('b',b.toString());
console.log('c',b.toString());

// a.x = 50;
// a.y = 50;
// a.width = 200;
// a.height = 200;
//
b.x = 50;
b.y = 50;
b.width = 100;
b.height = 100;

console.log('============')
console.log('a',a.toString());
console.log('b', b.toString());
console.log('c', c.toString());

a.unLink(b);
a.x = 0;
a.y = 0;
a.width = 100;
a.height = 100;
console.log('============')
console.log('a',a.toString());
console.log('b', b.toString());
console.log('c', c.toString());
//
