// 스모크 테스트: 빌드 산출물(dist/esm)이 Node에서 로드되고 공개 API가 노출되는지 확인한다.
// (dom-parser ESM 빌드 누락 같은 "빌드는 됐지만 로드가 안 되는" 회귀를 잡기 위함)
import { test } from 'node:test';
import assert from 'node:assert/strict';

const mod = await import('../dist/esm/index.js');

const expectedFunctions = ['ElementUtils', 'NodeUtils', 'DocumentUtils', 'Router', 'PathRouter', 'HashRouter', 'ElementApply'];

test('core-web: dist/esm loads and exposes public API', () => {
  for (const name of expectedFunctions) {
    assert.notEqual(mod[name], undefined, `${name} should be exported`);
  }
});
