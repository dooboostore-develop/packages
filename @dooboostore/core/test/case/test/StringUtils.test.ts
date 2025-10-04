import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { StringUtils } from '@dooboostore/core/string/StringUtils';
// import { StringUtils } from '../../../src/string/StringUtils';

console.log('---', StringUtils.replaceSequentially.toString());

describe('StringUtils.replaceSequentially', () => {
  test('should perform a single replacement', () => {
    const text = 'hello world';
    const replacements = [{ regex: /world/, callback: () => 'everybody' }];
    const result = StringUtils.replaceSequentially(text, replacements);
    assert.strictEqual(result, 'hello everybody');
  });

  test('should perform multiple replacements in order of appearance', () => {
    const text = 'first second third';
    const replacements = [
      { regex: /second/, callback: () => '2nd' },
      { regex: /first/, callback: () => '1st' },
    ];
    const result = StringUtils.replaceSequentially(text, replacements);
    assert.strictEqual(result, '1st 2nd third');
  });

  test('should handle multiple matches with a non-global regex', () => {
    const text = 'apple apple apple';
    const replacements = [{ regex: /apple/, callback: () => 'orange' }];
    const result = StringUtils.replaceSequentially(text, replacements);
    assert.strictEqual(result, 'orange orange orange');
  });

  test('should handle overlapping matches by choosing the earliest one', () => {
    const text = 'abcdef';
    const replacements = [
      { regex: /cde/, callback: () => 'CDE' },
      { regex: /abc/, callback: () => 'ABC' },
    ];
    const result = StringUtils.replaceSequentially(text, replacements);
    assert.strictEqual(result, 'ABCdef');
  });

  test('should handle case where one replacement creates a match for another', () => {
    const text = 'ac';
    const replacements = [
      { regex: /a/, callback: () => 'ab' },
      { regex: /b/, callback: () => 'B' },
    ];
    const result = StringUtils.replaceSequentially(text, replacements);
    assert.strictEqual(result, 'abc');
  });

  test('should handle empty input string', () => {
    const text = '';
    const replacements = [{ regex: /a/, callback: () => 'b' }];
    const result = StringUtils.replaceSequentially(text, replacements);
    assert.strictEqual(result, '');
  });

  test('should handle no replacements provided', () => {
    const text = 'some text';
    const result = StringUtils.replaceSequentially(text, []);
    assert.strictEqual(result, 'some text');
  });

  test('should handle no matches found', () => {
    const text = 'some text';
    const replacements = [{ regex: /notfound/, callback: () => 'found' }];
    const result = StringUtils.replaceSequentially(text, replacements);
    assert.strictEqual(result, 'some text');
  });


  test('#Test', () => {
    const text = 'a#timer# aasdasd sa #timer# asdasda';
    const replacements = [{ regex: /#timer#/g, callback: () => 'good' }];
    const result = StringUtils.replaceSequentially(text, replacements);
    assert.strictEqual(result, 'agood aasdasd sa good asdasda', 'Global regex should find all occurrences');
  });



  // This test is designed to fail with the current implementation to expose a bug.
  test('should correctly handle multiple matches with a global regex', () => {
    const text = 'aa';
    const replacements = [{ regex: /a/g, callback: () => 'b' }];
    const result = StringUtils.replaceSequentially(text, replacements);
    assert.strictEqual(result, 'bb', 'Global regex should find all occurrences');
  });

  test('another global regex case', () => {
    const text = 'abab';
    const replacements = [
        { regex: /a/g, callback: () => 'A' },
        { regex: /b/g, callback: () => 'B' }
    ];
    const result = StringUtils.replaceSequentially(text, replacements);
    assert.strictEqual(result, 'ABAB');
  });
});
