import { Expression } from '@dooboostore/core/expression/Expression';

const data = Expression.bindExpression(`Hello $\{name} \${date:ffff}`, { name: 'World', date: (param: string) => new Date().toLocaleDateString() + param });
console.log(data);