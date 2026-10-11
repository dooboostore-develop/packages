// 스모크 테스트: 빌드 산출물(dist/esm)이 Node에서 로드되고 공개 API가 노출되는지 확인한다.
// reflect-metadata는 패키지 진입점이 import하지 않으므로(bundle-entry 에서만 import) 여기서 먼저 로드한다.
import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const mod = await import('../dist/esm/index.js');

const expectedExports = ['ComponentBase', 'Choose', 'If', 'PromiseSwitch', 'Channel', 'EventManager'];

test('dom-render: dist/esm loads and exposes public API', () => {
  for (const name of expectedExports) {
    assert.notEqual(mod[name], undefined, `${name} should be exported`);
  }
});
