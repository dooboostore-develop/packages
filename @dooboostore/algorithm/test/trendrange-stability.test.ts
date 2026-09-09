import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import candleFile from '../datas/candle.json';
import { TrendRange } from '../src/stock/TrendRange';
import { computeMacdSeries, computeRsiSeries, computeObvSeries } from '../src/stock/trend';

const raw = (candleFile as any).result.candles as any[];
const all = [...raw].sort((a, b) => String(a.dt).localeCompare(String(b.dt)));

// 페이지 자동추세 기본 설정과 동일 (0.6/0.4 라벨 + mergeCut 10, 개수 무제한)
const grp = (r: number): string => (r > 0.6 ? '상승' : r < 0.4 ? '하락' : '횡보');
const cfg = { groupBy: grp };

const build = (slice: any[]): TrendRange.TrendBar[] => {
  const closes = slice.map(c => c.close), vols = slice.map(c => c.volume);
  const macd = computeMacdSeries(closes, 12, 26, 9);
  const rsi = computeRsiSeries(closes, 14);
  const obv = computeObvSeries(closes, vols);
  return slice.map((c, i) => ({ macd: macd.macd[i], rsi: rsi[i], obv: obv[i], open: c.open, high: c.high, low: c.low, close: c.close }));
};

const assertCommitted = (tag: string, prev: TrendRange.TendRange[], full: TrendRange.TendRange[]) => {
  for (let i = 0; i < prev.length - 1; i++) {
    const p = prev[i];
    const f = full.find(z => z.startIndex === p.startIndex);
    assert.ok(f, `${tag}: 확정구간 ${p.group}[${p.startIndex}-${p.endIndex}] 사라짐`);
    assert.equal(f!.endIndex, p.endIndex, `${tag}: 확정구간 ${p.group}[${p.startIndex}-${p.endIndex}] 끝 이동`);
    assert.equal(f!.group, p.group, `${tag}: 확정구간 [${p.startIndex}-${p.endIndex}] 라벨 변경`);
    assert.equal(String(f!.uuid), String(p.uuid), `${tag}: 확정구간 [${p.startIndex}-${p.endIndex}] uuid 변경`);
  }
};

describe('TrendRange prefix stability (real candles)', () => {
  it('228-prefix splits certain head from provisional tail', () => {
    const zs = TrendRange.trendRanges(build(all.slice(0, 228)), cfg);
    // 강한 앞부분은 확정, 불확실한 뒷부분만 잠정 (같은 마지막 range에 안 섞임)
    const head = zs.find(z => z.endIndex === 225);
    assert.ok(head, `228b zones: ${zs.map(z => `${z.group}[${z.startIndex}-${z.endIndex}]${z.confirmed ? '' : '(잠정)'}`).join(' | ')}`);
    assert.equal(head!.confirmed, true);
    assert.equal(head!.group, '상승');
    const tail = zs[zs.length - 1];
    assert.equal(tail.confirmed, false);
    assert.ok(tail.startIndex > 225);
    assert.ok(tail.forecastRate == null || (tail.forecastRate >= 0 && tail.forecastRate <= 1));
  });
  it('committed zones survive prefix extension (live edge excluded)', () => {
    const steps = [150, 200, 250, 300, 360];
    const results = steps.map(n => TrendRange.trendRanges(build(all.slice(0, n)), cfg));
    for (let k = 1; k < results.length; k++) {
      assertCommitted(`${steps[k - 1]}b→${steps[k]}b`, results[k - 1], results[k]);
    }
  });
  it('committed zones survive one-by-one candle growth', () => {
    let prev = TrendRange.trendRanges(build(all.slice(0, 200)), cfg);
    for (let n = 201; n <= all.length; n++) {
      const full = TrendRange.trendRanges(build(all.slice(0, n)), cfg);
      assertCommitted(`${n - 1}b→${n}b`, prev, full);
      // 꼬리는 이전 꼬리 시작점보다 왼쪽으로 못 감 (확정구간 침범 불가)
      const oldTail = prev[prev.length - 1];
      const newTail = full[full.length - 1];
      assert.ok(newTail.startIndex >= oldTail.startIndex, `${n - 1}b→${n}b: 꼬리가 확정구간 침범`);
      prev = full;
    }
  });
});
