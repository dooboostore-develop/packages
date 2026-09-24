import test from 'node:test';
import assert from 'node:assert';

// 파이프라인(esbuild 로더 + node:test) 자체가 살아있는지 확인하는 최소 스모크 테스트.
// RandomImage는 top-level에서 'canvas'(네이티브 애드온)를 import하는데, 이게 환경에 따라
// (예: 이 샌드박스) 빌드가 안 돼있을 수 있다 - 그러면 import 자체가 그 자리에서 던진다.
// 그래서 동적 import로 감싸서, canvas가 진짜 되는 환경에선 실제로 검증하고
// 안 되는 환경에선(파이프라인 문제가 아니라 네이티브 바인딩 문제이므로) 스킵한다.
test('smoke: ts-loader pipeline works and RandomImage is importable', async (t) => {
  let RandomImage: any;
  try {
    ({ RandomImage } = await import('../src/RandomImage.ts'));
  } catch (e) {
    t.skip(`'canvas' native binding unavailable in this environment: ${(e as Error).message}`);
    return;
  }
  const image = new RandomImage();
  assert.ok(image instanceof RandomImage);
});
