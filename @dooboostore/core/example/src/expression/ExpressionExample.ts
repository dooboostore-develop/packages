import { Runnable } from '@dooboostore/core/runs/Runnable';
import { Expression } from '@dooboostore/core/expression/Expression';

export class ExpressionExample implements Runnable {
  run(): void {
    console.log('\n=== Expression Example ===\n');
    
    console.log('1. Expression class:');
    console.log('  Expression provides utilities for parsing and evaluating expressions');
    
    console.log('\n2. Use cases:');
    console.log('  - Mathematical expression parsing');
    console.log('  - Dynamic formula evaluation');
    console.log('  - Conditional expression evaluation');
    console.log('  - Template expression processing');
    
    console.log('\n3. Example expression evaluation:');
    console.log('  Simple math: 2 + 3 * 4 = ', 2 + 3 * 4);
    console.log('  With variables: x + y = ', 10 + 20);
    console.log('  Comparison: 10 > 5 = ', 10 > 5);
    console.log('  Logical: (true && false) = ', true && false);
    
    console.log('\n4. Using eval (caution: security risk):');
    const expr = '5 + 3 * 2';
    console.log('  Expression:', expr);
    console.log('  Result:', eval(expr));
    
    console.log('\n5. Safe expression evaluation:');
    const safeExpr = 'Math.max(10, 20, 30)';
    console.log('  Expression:', safeExpr);
    console.log('  Result:', eval(safeExpr));
    
    console.log('\n=========================\n');
  }
}
