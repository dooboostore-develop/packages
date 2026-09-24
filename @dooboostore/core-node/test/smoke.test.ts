import test from 'node:test';
import assert from 'node:assert';
import { ProcessUtils } from '../src/process/ProcessUtils.ts';

// 파이프라인(esbuild 로더 + node:test) 자체가 살아있는지 확인하는 최소 스모크 테스트.
// 실제 유닛 테스트는 test/ 밑에 *.test.ts로 추가하고 test/index.test.ts에서 import하면 된다.
test('smoke: ts-loader pipeline works and ProcessUtils is importable', () => {
  assert.strictEqual(typeof ProcessUtils.getPid(), 'number');
  assert.strictEqual(typeof ProcessUtils.getPlatform(), 'string');
});
