// 스모크 테스트: 빌드 산출물(dist/esm)이 Node에서 로드되고 공개 API가 노출되는지 확인한다.
import { test } from 'node:test';
import assert from 'node:assert/strict';

const mod = await import('../dist/esm/index.js');

const expectedExports = ['GpsMarkerCanvas', 'ImageCropCanvas', 'ImageEditorCanvas', 'TradeChart', 'OverlayStockChart', 'isPointEvent', 'isRangeEvent'];

test('lib-web: dist/esm loads and exposes public API', () => {
  for (const name of expectedExports) {
    assert.notEqual(mod[name], undefined, `${name} should be exported`);
  }
});
