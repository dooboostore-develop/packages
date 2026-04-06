import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { ActionExpression, getExpression } from '@dooboostore/core';

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
      assert.strictEqual(expr.type, 'callReturn');
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
      assert.strictEqual(exprs[1].type, 'callReturn');
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
      const ae = new ActionExpression('Price: @{{ price }}@', {
        expression: { replace: { start: '@{{', end: '}}@' } }
      });
      const expr = ae.getFirstExpression();
      assert(expr);
      assert.strictEqual(expr.type, 'replace');
      assert.strictEqual(expr.script, 'price');
      assert.strictEqual(expr.original, '@{{ price }}@');
    });

    test('should parse wrapped call-return expression @{{= script }}@', () => {
      const ae = new ActionExpression('Value: @{{= getValue() }}@', {
        expression: {
          replace: { start: '@{{', end: '}}@' },
          callReturn: { start: '@{{=', end: '}}@' },
          call: { start: '@{{@', end: '}}@' }
        }
      });
      const expr = ae.getFirstExpression();
      assert(expr);
      assert.strictEqual(expr.type, 'callReturn');
    });

    test('should parse wrapped call expression @{{@ script }}@', () => {
      const ae = new ActionExpression('Action: @{{@ doAction() }}@', {
        expression: {
          replace: { start: '@{{', end: '}}@' },
          callReturn: { start: '@{{=', end: '}}@' },
          call: { start: '@{{@', end: '}}@' }
        }
      });
      const expr = ae.getFirstExpression();
      assert(expr);
      assert.strictEqual(expr.type, 'call');
    });

    test('should handle multiple wrap expressions', () => {
      const ae = new ActionExpression('${{ a }}$ and @{{ b }}@', {
        expression: { replace: { start: '@{{', end: '}}@' } }
      });
      const exprs = ae.getExpressions();
      // ${{ a }}$ will still be parsed by DEFAULT config (which matches `{{` internally)
      // wait, now default is overridden if you provide config, OR it merges.
      // With our new logic, it merges, but for replace it will just use `@{{` `}}@`.
      // The `{{ a }}` inside `${{ a }}$` won't be matched if `replace` is overridden!
      // Actually, let's just check length.
      assert.strictEqual(exprs.length, 1);
      const expr = ae.getFirstExpression();
      assert(expr);
      assert.strictEqual(expr.script, 'b');
    });

    test('should handle 중복 wrap expressions', () => {
      const ae = new ActionExpression(
        `
            <center-thread-card thread="{{= $host?.getValue( # $index # ) }}">
          </center-thread-card>`,
        {
          expression: {
            replace: { start: '#', end: '#' },
            callReturn: { start: '#=', end: '#' },
            call: { start: '#@', end: '#' }
          }
        }
      );
      const exprs = ae.getExpressions();
      exprs.forEach((expr, i) => {
        ae.replace(expr, '1');
      });
      const processed = ae.getUnprocessedTemplate();
      console.log(processed);
      assert.strictEqual(exprs.length, 1);
      assert.strictEqual(exprs[0].script, '$index');
      assert.ok(processed.includes('{{= $host?.getValue( 1 ) }}'));
    });

    test('should handle replace expressions', () => {
      const ae = new ActionExpression('@{{ a }}@ and @{{ b }}@', {
        expression: { replace: { start: '@{{', end: '}}@' } }
      });
      const exprs = ae.getExpressions();
      exprs.forEach((expr, i) => {
        ae.replace(expr.id, 'x' + i);
      });
      console.log(ae.getUnprocessedTemplate());
      assert.strictEqual(exprs.length, 2);
      assert.strictEqual(ae.getUnprocessedTemplate(), 'x0 and x1');
    });

    test('should replace wrapped expressions', () => {
      const ae = new ActionExpression('@{{ x }}@ and @{{ y }}@', {
        expression: { replace: { start: '@{{', end: '}}@' } }
      });
      const exprs = ae.getExpressions();
      let result = ae.replace(exprs[0].id, '10');
      assert.strictEqual(result, '10 and @{{ y }}@');
      result = ae.replace(exprs[1].id, '20');
      assert.strictEqual(result, '10 and 20');
    });

    test('should handle special regex characters in wrap expression', () => {
      const ae = new ActionExpression('${{ x }}$ and ${{ y }}$', {
        expression: { replace: { start: '${{', end: '}}$' } }
      });
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
      const result = getExpression('@{{ price }}@', {
        expression: { replace: { start: '@{{', end: '}}@' } }
      });
      assert.strictEqual(result.expressions.length, 1);
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
      const ae = new ActionExpression('Standard: {{ a }} and Wrapped: @{{ b }}@', {
        expression: {
          replace: { start: '@{{', end: '}}@' }
        }
      });
      const exprs = ae.getExpressions();
      // Since we overridden replace with `@{{`, the standard `{{ a }}` will NOT be parsed
      assert.strictEqual(exprs.length, 1);
      assert.strictEqual(exprs[0].script, 'b');
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

      const callReturnExprs = ae.getExpressions('callReturn');
      assert.strictEqual(callReturnExprs.length, 1);
      assert.strictEqual(callReturnExprs[0].type, 'callReturn');
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

      const firstCallReturn = ae.getFirstExpression('callReturn');
      assert(firstCallReturn);
      assert.strictEqual(firstCallReturn.type, 'callReturn');
      assert.strictEqual(firstCallReturn.script, 'b');

      const firstCall = ae.getFirstExpression('call');
      assert(firstCall);
      assert.strictEqual(firstCall.type, 'call');
      assert.strictEqual(firstCall.script, 'c');
    });

    test('should return undefined when no expression of type exists', () => {
      const ae = new ActionExpression('Only: {{ a }}');

      const callReturn = ae.getFirstExpression('callReturn');
      assert.strictEqual(callReturn, undefined);

      const call = ae.getFirstExpression('call');
      assert.strictEqual(call, undefined);
    });
  });
});
