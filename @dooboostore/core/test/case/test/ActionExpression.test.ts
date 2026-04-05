import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { ActionExpression, getExpression } from '@dooboostore/core/expression/ActionExpression';

describe('ActionExpression', () => {
  describe('Constructor and Basic Setup', () => {
    test('should parse basic replace expression {{ script }}', () => {
      const ae = new ActionExpression('Hello {{ name }}');
      const expr = ae.getFirstExpression();
      assert(expr);
      assert.strictEqual(expr.type, 'replace');
      assert.strictEqual(expr.script, 'name');
      assert.strictEqual(expr.original, '{{ name }}');
    });

    test('should parse call-return expression {{= script }}', () => {
      const ae = new ActionExpression('Count: {{= count }}');
      const expr = ae.getFirstExpression();
      assert(expr);
      assert.strictEqual(expr.type, 'call-return');
      assert.strictEqual(expr.script, 'count');
      assert.strictEqual(expr.original, '{{= count }}');
    });

    test('should parse call expression {{@ script }}', () => {
      const ae = new ActionExpression('Log: {{@ console.log("test") }}');
      const expr = ae.getFirstExpression();
      assert(expr);
      assert.strictEqual(expr.type, 'call');
      assert.strictEqual(expr.script, 'console.log("test")');
    });

    test('should handle empty string', () => {
      const ae = new ActionExpression('');
      const exprs = ae.getExpressions();
      assert.strictEqual(exprs.length, 0);
    });

    test('should handle null/undefined input', () => {
      const ae = new ActionExpression(null as any);
      const exprs = ae.getExpressions();
      assert.strictEqual(exprs.length, 0);
    });
  });

  describe('Multiple Expressions', () => {
    test('should parse multiple expressions of different types', () => {
      const ae = new ActionExpression('Hello {{ name }} and {{= age }} and {{@ log() }}');
      const exprs = ae.getExpressions();
      assert.strictEqual(exprs.length, 3);
      assert.strictEqual(exprs[0].type, 'replace');
      assert.strictEqual(exprs[1].type, 'call-return');
      assert.strictEqual(exprs[2].type, 'call');
    });

    test('should parse duplicate expressions', () => {
      const ae = new ActionExpression('{{ a }} and {{ b }} and {{ a }}');
      const exprs = ae.getExpressions();
      assert.strictEqual(exprs.length, 3);
      // All should have different ids even if same script
      assert.notStrictEqual(exprs[0].id, exprs[2].id);
    });

    test('should maintain expression order', () => {
      const ae = new ActionExpression('A {{ x }} B {{ y }} C {{ z }}');
      const exprs = ae.getExpressions();
      assert.strictEqual(exprs.length, 3);
      assert.strictEqual(exprs[0].script, 'x');
      assert.strictEqual(exprs[1].script, 'y');
      assert.strictEqual(exprs[2].script, 'z');
    });
  });

  describe('Replace Method', () => {
    test('should replace single expression', () => {
      const ae = new ActionExpression('Hello {{ name }}');
      const expr = ae.getFirstExpression();
      assert(expr);
      const result = ae.replace(expr.id, 'John');
      assert.strictEqual(result, 'Hello John');
    });

    test('should replace multiple expressions sequentially', () => {
      const ae = new ActionExpression('{{ a }} and {{ b }}');
      const exprs = ae.getExpressions();
      let result = ae.replace(exprs[0].id, 'Alice');
      assert.strictEqual(result, 'Alice and {{ b }}');
      result = ae.replace(exprs[1].id, 'Bob');
      assert.strictEqual(result, 'Alice and Bob');
    });

    test('should not replace unprocessed expressions', () => {
      const ae = new ActionExpression('{{ a }} and {{ b }} and {{ c }}');
      const exprs = ae.getExpressions();
      const result = ae.replace(exprs[0].id, 'x');
      assert.strictEqual(result, 'x and {{ b }} and {{ c }}');
    });

    test('should handle non-existent id gracefully', () => {
      const ae = new ActionExpression('{{ name }}');
      const result = ae.replace('non-existent-id', 'value');
      assert.strictEqual(result, '{{ name }}');
    });
  });

  describe('Wrap Expression Config', () => {
    test('should parse wrapped replace expression @{{ script }}@', () => {
      const ae = new ActionExpression('Price: @{{ price }}@', { wrapExpression: '@' });
      const expr = ae.getFirstExpression();
      assert(expr);
      assert.strictEqual(expr.type, 'replace');
      assert.strictEqual(expr.script, 'price');
      assert.strictEqual(expr.wrap, '@');
      assert.strictEqual(expr.original, '@{{ price }}@');
    });

    test('should parse wrapped call-return expression @{{= script }}@', () => {
      const ae = new ActionExpression('Value: @{{= getValue() }}@', { wrapExpression: '@' });
      const expr = ae.getFirstExpression();
      assert(expr);
      assert.strictEqual(expr.type, 'call-return');
      assert.strictEqual(expr.wrap, '@');
    });

    test('should parse wrapped call expression @{{@ script }}@', () => {
      const ae = new ActionExpression('Action: @{{@ doAction() }}@', { wrapExpression: '@' });
      const expr = ae.getFirstExpression();
      assert(expr);
      assert.strictEqual(expr.type, 'call');
      assert.strictEqual(expr.wrap, '@');
    });

    test('should handle multiple wrap expressions', () => {
      const ae = new ActionExpression('${{ a }}$ and @{{ b }}@', { wrapExpression: '@' });
      const exprs = ae.getExpressions();
      // Should parse @{{ b }}@ with wrap='@'
      // ${{ a }}$ should not be parsed as it's not the wrap char
      assert.strictEqual(exprs.length, 1);
      const expr = ae.getFirstExpression();
      assert(expr);
      assert.strictEqual(expr.wrap, '@');
    });

    test('should replace wrapped expressions', () => {
      const ae = new ActionExpression('@{{ x }}@ and @{{ y }}@', { wrapExpression: '@' });
      const exprs = ae.getExpressions();
      let result = ae.replace(exprs[0].id, '10');
      assert.strictEqual(result, '10 and @{{ y }}@');
      result = ae.replace(exprs[1].id, '20');
      assert.strictEqual(result, '10 and 20');
    });

    test('should handle special regex characters in wrap expression', () => {
      const ae = new ActionExpression('${{ x }}$ and ${{ y }}$', { wrapExpression: '$' });
      const exprs = ae.getExpressions();
      assert.strictEqual(exprs.length, 2);
      const result = ae.replace(exprs[0].id, 'foo');
      assert.strictEqual(result, 'foo and ${{ y }}$');
    });
  });

  describe('Expression Metadata', () => {
    test('should include expressionStart and expressionEnd', () => {
      const ae = new ActionExpression('{{ name }}');
      const expr = ae.getFirstExpression();
      assert(expr);
      assert.strictEqual(expr.expressionStart, '{{ ');
      assert.strictEqual(expr.expressionEnd, ' }}');
    });

    test('should have unique id for each expression', () => {
      const ae = new ActionExpression('{{ a }} {{ b }} {{ c }}');
      const exprs = ae.getExpressions();
      const ids = exprs.map(e => e.id);
      assert.strictEqual(ids.length, new Set(ids).size); // All unique
    });
  });

  describe('Template Access Methods', () => {
    test('should return original template', () => {
      const template = 'Hello {{ name }}';
      const ae = new ActionExpression(template);
      assert.strictEqual(ae.getOriginalTemplate(), template);
    });

    test('should return masking template with markers', () => {
      const ae = new ActionExpression('{{ a }} and {{ b }}');
      const masking = ae.getMaskingTemplate();
      assert(masking.includes('__EXPR_'));
      assert(!masking.includes('{{ a }}'));
      assert(!masking.includes('{{ b }}'));
    });

    test('should return current template after replacements', () => {
      const ae = new ActionExpression('{{ a }} and {{ b }}');
      const exprs = ae.getExpressions();
      ae.replace(exprs[0].id, 'x');
      const current = ae.getCurrentTemplate();
      assert.strictEqual(current, 'x and __EXPR_' + exprs[1].id + '__');
    });
  });

  describe('Legacy Function API', () => {
    test('getExpression function should work with class', () => {
      const result = getExpression('Hello {{ name }}');
      assert.strictEqual(result.expressions.length, 1);
      assert.strictEqual(result.expressions[0].type, 'replace');
      assert.strictEqual(result.originalTemplate, 'Hello {{ name }}');
    });

    test('getExpression function replace method should work', () => {
      const result = getExpression('{{ a }} and {{ b }}');
      let output = result.replace(result.expressions[0].id, 'Alice');
      assert.strictEqual(output, 'Alice and {{ b }}');
      output = result.replace(result.expressions[1].id, 'Bob');
      assert.strictEqual(output, 'Alice and Bob');
    });

    test('getExpression function with config', () => {
      const result = getExpression('@{{ price }}@', { wrapExpression: '@' });
      assert.strictEqual(result.expressions.length, 1);
      assert.strictEqual(result.expressions[0].wrap, '@');
    });
  });

  describe('Complex Scenarios', () => {
    test('should handle expression with whitespace', () => {
      const ae = new ActionExpression('{{  name  }}');
      const expr = ae.getFirstExpression();
      assert(expr);
      assert.strictEqual(expr.script, 'name');
    });

    test('should handle expression with complex script', () => {
      const ae = new ActionExpression('{{ obj.prop["key"] }}');
      const expr = ae.getFirstExpression();
      assert(expr);
      assert.strictEqual(expr.script, 'obj.prop["key"]');
    });

    test('should parse triple curly braces as separate patterns', () => {
      const ae = new ActionExpression('{{ {{ x }} }}');
      const exprs = ae.getExpressions();
      // Should parse nested {{ x }}
      assert.strictEqual(exprs.length, 1);
    });

    test('should handle mixed wrap and standard expressions', () => {
      const ae = new ActionExpression('Standard: {{ a }} and Wrapped: @{{ b }}@', { wrapExpression: '@' });
      const exprs = ae.getExpressions();
      // Should have exactly 2 expressions: one standard {{ a }} and one wrapped @{{ b }}@
      assert.strictEqual(exprs.length, 2);
      const wrapped = exprs.find(e => e.wrap === '@');
      const standard = exprs.find(e => !e.wrap);
      assert(wrapped, 'Should have wrapped expression with wrap="@"');
      assert(standard, 'Should have standard expression without wrap');
    });

    test('should maintain state across multiple replacements', () => {
      const ae = new ActionExpression('A: {{ a }}, B: {{ b }}, C: {{ c }}');
      const exprs = ae.getExpressions();
      let result = ae.replace(exprs[0].id, '1');
      assert.strictEqual(result, 'A: 1, B: {{ b }}, C: {{ c }}');
      result = ae.replace(exprs[2].id, '3');
      assert.strictEqual(result, 'A: 1, B: {{ b }}, C: 3');
      result = ae.replace(exprs[1].id, '2');
      assert.strictEqual(result, 'A: 1, B: 2, C: 3');
    });
  });

  describe('Convenience Functions', () => {
    test('should filter expressions by type with getExpressions(type)', () => {
      const ae = new ActionExpression('Replace: {{ a }}, CallReturn: {{= b }}, Call: {{@ c }}');
      
      const replaceExprs = ae.getExpressions('replace');
      assert.strictEqual(replaceExprs.length, 1);
      assert.strictEqual(replaceExprs[0].type, 'replace');
      assert.strictEqual(replaceExprs[0].script, 'a');
      
      const callReturnExprs = ae.getExpressions('call-return');
      assert.strictEqual(callReturnExprs.length, 1);
      assert.strictEqual(callReturnExprs[0].type, 'call-return');
      assert.strictEqual(callReturnExprs[0].script, 'b');
      
      const callExprs = ae.getExpressions('call');
      assert.strictEqual(callExprs.length, 1);
      assert.strictEqual(callExprs[0].type, 'call');
      assert.strictEqual(callExprs[0].script, 'c');
    });

    test('should return all expressions when no type specified', () => {
      const ae = new ActionExpression('Replace: {{ a }}, CallReturn: {{= b }}, Call: {{@ c }}');
      
      const allExprs = ae.getExpressions();
      assert.strictEqual(allExprs.length, 3);
    });

    test('should get first expression with getFirstExpression()', () => {
      const ae = new ActionExpression('First: {{ a }}, Second: {{ b }}, Third: {{ c }}');
      
      const first = ae.getFirstExpression();
      assert(first);
      assert.strictEqual(first.type, 'replace');
      assert.strictEqual(first.script, 'a');
    });

    test('should get first expression of specific type with getFirstExpression(type)', () => {
      const ae = new ActionExpression('Replace: {{ a }}, CallReturn: {{= b }}, Call: {{@ c }}');
      
      const firstReplace = ae.getFirstExpression('replace');
      assert(firstReplace);
      assert.strictEqual(firstReplace.type, 'replace');
      assert.strictEqual(firstReplace.script, 'a');
      
      const firstCallReturn = ae.getFirstExpression('call-return');
      assert(firstCallReturn);
      assert.strictEqual(firstCallReturn.type, 'call-return');
      assert.strictEqual(firstCallReturn.script, 'b');
      
      const firstCall = ae.getFirstExpression('call');
      assert(firstCall);
      assert.strictEqual(firstCall.type, 'call');
      assert.strictEqual(firstCall.script, 'c');
    });

    test('should return undefined when no expression of type exists', () => {
      const ae = new ActionExpression('Only: {{ a }}');
      
      const callReturn = ae.getFirstExpression('call-return');
      assert.strictEqual(callReturn, undefined);
      
      const call = ae.getFirstExpression('call');
      assert.strictEqual(call, undefined);
    });

    test('should filter by wrap with getExpressions options', () => {
      const ae = new ActionExpression('Standard: {{ a }} and Wrapped: @{{ b }}@', { wrapExpression: '@' });
      
      // wrap '@'인 표현식만 필터링
      const wrapped = ae.getExpressions({ wrap: '@' });
      assert.strictEqual(wrapped.length, 1);
      assert.strictEqual(wrapped[0].wrap, '@');
      assert.strictEqual(wrapped[0].script, 'b');
      
      // wrap 없는 표현식만 필터링
      const standard = ae.getExpressions({ wrap: undefined });
      assert.strictEqual(standard.length, 1);
      assert.strictEqual(standard[0].wrap, undefined);
      assert.strictEqual(standard[0].script, 'a');
    });

    test('should filter by type and wrap together with getExpressions options', () => {
      const ae = new ActionExpression('Replace: {{ a }}, CallReturn: {{= b }}, Wrapped: @{{= c }}@', { wrapExpression: '@' });
      
      // call-return 타입 중 wrap 없는 것만
      const callReturnStandard = ae.getExpressions({ type: 'call-return', wrap: undefined });
      assert.strictEqual(callReturnStandard.length, 1);
      assert.strictEqual(callReturnStandard[0].script, 'b');
      assert.strictEqual(callReturnStandard[0].wrap, undefined);
      
      // call-return 타입 중 wrap이 '@'인 것만
      const callReturnWrapped = ae.getExpressions({ type: 'call-return', wrap: '@' });
      assert.strictEqual(callReturnWrapped.length, 1);
      assert.strictEqual(callReturnWrapped[0].script, 'c');
      assert.strictEqual(callReturnWrapped[0].wrap, '@');
    });

    test('should get first expression with wrap filter using getFirstExpression options', () => {
      const ae = new ActionExpression('Standard: {{ a }}, Wrapped: @{{ b }}@', { wrapExpression: '@' });
      
      // 첫 번째 wrap='@' 표현식
      const firstWrapped = ae.getFirstExpression({ wrap: '@' });
      assert(firstWrapped);
      assert.strictEqual(firstWrapped.wrap, '@');
      assert.strictEqual(firstWrapped.script, 'b');
      
      // 첫 번째 wrap 없는 표현식
      const firstStandard = ae.getFirstExpression({ wrap: undefined });
      assert(firstStandard);
      assert.strictEqual(firstStandard.wrap, undefined);
      assert.strictEqual(firstStandard.script, 'a');
    });

    test('should get first expression with type and wrap filter combined', () => {
      const ae = new ActionExpression('Replace: {{ a }}, CallReturn: {{= b }}, Wrapped: @{{= c }}@', { wrapExpression: '@' });
      
      // 첫 번째 call-return 타입 중 wrap이 '@'인 것
      const firstCallReturnWrapped = ae.getFirstExpression({ type: 'call-return', wrap: '@' });
      assert(firstCallReturnWrapped);
      assert.strictEqual(firstCallReturnWrapped.type, 'call-return');
      assert.strictEqual(firstCallReturnWrapped.wrap, '@');
      assert.strictEqual(firstCallReturnWrapped.script, 'c');
      
      // 첫 번째 call-return 타입 중 wrap 없는 것
      const firstCallReturnStandard = ae.getFirstExpression({ type: 'call-return', wrap: undefined });
      assert(firstCallReturnStandard);
      assert.strictEqual(firstCallReturnStandard.type, 'call-return');
      assert.strictEqual(firstCallReturnStandard.wrap, undefined);
      assert.strictEqual(firstCallReturnStandard.script, 'b');
    });
  });
});
