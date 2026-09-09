import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TrendRange } from '../src/stock/TrendRange';

type Bar = TrendRange.TrendBar;
const grp = (r: number): string => r > 0.6 ? 'up' : r < 0.4 ? 'down' : 'side';
const cfg = { groupBy: grp };
const upBar = (i: number): Bar => ({ macd: 1 + i * 0.05, rsi: 90, obv: 100 + i });
const downBar = (i: number): Bar => ({ macd: -1 - i * 0.05, rsi: 30, obv: 100 - i });
const sideBar = (): Bar => ({ macd: 0, rsi: 50, obv: 100 });
const rep = (n: number, f: (i: number) => Bar): Bar[] =>
  Array.from({ length: n }, (_, i) => f(i));

describe('TrendRange.scoreBars', () => {
  it('empty → []', () => {
    assert.deepEqual(TrendRange.scoreBars([], undefined), []);
  });
  it('all-null bar → null entry', () => {
    const out = TrendRange.scoreBars([{ macd: null, rsi: null, obv: null }]);
    assert.equal(out.length, 1);
    assert.equal(out[0], null);
  });
  it('up bars score high, down bars score low (first-bar warmup excluded)', () => {
    const up = TrendRange.scoreBars(rep(20, upBar)).slice(1);
    const down = TrendRange.scoreBars(rep(20, downBar)).slice(1);
    assert.ok(up.every(v => v != null && v > 0.6));
    assert.ok(down.every(v => v != null && v < 0.4));
  });
});

describe('TrendRange.strengthBars', () => {
  it('empty → []', () => {
    assert.deepEqual(TrendRange.strengthBars([], [], undefined), []);
  });
  it('all-null → null entries', () => {
    const bars: Bar[] = [{ macd: null, rsi: null, obv: null }];
    assert.deepEqual(TrendRange.strengthBars(bars, [null]), [null]);
  });
  it('strong trend without OHLC → high strength', () => {
    const bars = rep(20, upBar);
    const scores = TrendRange.scoreBars(bars);
    const out = TrendRange.strengthBars(bars, scores);
    assert.ok(out.every(v => v != null && v > 0.5));
  });
});

describe('TrendRange.trendRanges', () => {
  it('empty → []', () => {
    assert.deepEqual(TrendRange.trendRanges([], cfg), []);
  });
  it('30 up + 30 down → up/down zones', () => {
    const zs = TrendRange.trendRanges([...rep(30, upBar), ...rep(30, downBar)], cfg);
    assert.equal(zs[0].group, 'up');
    assert.equal(zs[zs.length - 1].group, 'down');
  });
  it('zones are contiguous and cover full range', () => {
    const datas = [...rep(30, upBar), ...rep(30, sideBar), ...rep(30, downBar)];
    const zs = TrendRange.trendRanges(datas, cfg);
    assert.equal(zs[0].startIndex, 0);
    assert.equal(zs[zs.length - 1].endIndex, datas.length - 1);
    for (let k = 1; k < zs.length; k++) assert.equal(zs[k].startIndex, zs[k - 1].endIndex + 1);
  });
  it('short middle run is absorbed forward (default)', () => {
    const zs = TrendRange.trendRanges([...rep(30, upBar), ...rep(3, sideBar), ...rep(30, downBar)], cfg);
    assert.equal(zs.length, 2);
    assert.equal(zs[0].group, 'up');
    assert.equal(zs[1].group, 'down');
  });
  it('no adjacent duplicate labels (short blip freezes instead)', () => {
    const zs = TrendRange.trendRanges([...rep(30, upBar), ...rep(2, sideBar), ...rep(30, upBar)], cfg);
    for (let k = 1; k < zs.length; k++) assert.notEqual(zs[k].group, zs[k - 1].group);
  });
  it('strong short run freezes at close (certain head + provisional tail)', () => {
    // 강한 상승 6봉 + 약한 횡보 2봉: 앞부분 확정, 뒷부분만 잠정 (구 코드면 하나로 합쳐짐)
    const zs = TrendRange.trendRanges([...rep(6, upBar), ...rep(2, sideBar)], cfg);
    assert.equal(zs.length, 2);
    const head = zs[0], tail = zs[1];
    assert.deepEqual([head.startIndex, head.endIndex], [0, 5]);
    assert.equal(head.confirmed, true);
    assert.equal(head.group, 'up');
    assert.equal(tail.confirmed, false);
    // 예상 rate: 인과율(0~1, prior 기반), 실측 scoreRate와 별개 필드
    assert.ok(tail.forecastRate == null || (tail.forecastRate >= 0 && tail.forecastRate <= 1));
    assert.equal(zs[0].forecastRate, null);
  });
  it('forecastRate is prefix-stable on committed zones', () => {
    const a = TrendRange.trendRanges([...rep(30, upBar), ...rep(30, downBar), ...rep(30, upBar)], cfg);
    const b = TrendRange.trendRanges([...rep(30, upBar), ...rep(30, downBar), ...rep(30, upBar), ...rep(30, downBar)], cfg);
    assert.ok(a.length >= 3 && b.length >= 4);
    // v1 추정식: prior 1개면 직전 확정 rate 그대로
    assert.equal(a[1].forecastRate, a[0].scoreRate);
    for (let i = 0; i < a.length - 1; i++) {
      const f = b.find(z => z.startIndex === a[i].startIndex)!;
      assert.ok(f);
      assert.equal(f.forecastRate, a[i].forecastRate);
    }
  });
  it('zone count uncapped (committed zones never merged)', () => {
    const alt = (i: number): Bar => (Math.floor(i / 10) % 2 === 0 ? upBar(i) : downBar(i));
    const zs = TrendRange.trendRanges(rep(200, alt), cfg);
    // 10봉씩 20개 — 개수 제한 없음
    assert.equal(zs.length, 20);
    assert.ok(zs.every((z, k) => z.startIndex === k * 10 && z.endIndex === k * 10 + 9));
    // 앞부분만 계산해도 확정구간 동일 (prefix 안정)
    const pre = TrendRange.trendRanges(rep(120, alt), cfg);
    for (let i = 0; i < pre.length - 1; i++) {
      const f = zs.find(z => z.startIndex === pre[i].startIndex)!;
      assert.equal(f.endIndex, pre[i].endIndex);
      assert.equal(f.group, pre[i].group);
      assert.equal(String(f.uuid), String(pre[i].uuid));
    }
  });
  it('mergeCut 1 disables merging', () => {
    const alt = (i: number): Bar => ({ macd: null, rsi: i % 2 === 0 ? 90 : 10, obv: null });
    const zs = TrendRange.trendRanges(rep(60, alt), { mergeCut: 1, groupBy: grp });
    assert.equal(zs.length, 60);
  });
  it('last zone is unconfirmed, rest confirmed', () => {
    const zs = TrendRange.trendRanges([...rep(30, upBar), ...rep(30, downBar)], cfg);
    assert.ok(zs.length >= 2);
    assert.ok(zs.slice(0, -1).every(z => z.confirmed === true));
    assert.equal(zs[zs.length - 1].confirmed, false);
    const one = TrendRange.trendRanges(rep(5, upBar), cfg);
    assert.equal(one.length, 1);
    assert.equal(one[0].confirmed, false);
  });
  it('same input → same uuid (deterministic)', () => {
    const datas = [...rep(30, upBar), ...rep(30, downBar)];
    const a = TrendRange.trendRanges(datas, cfg);
    const b = TrendRange.trendRanges(datas, cfg);
    assert.deepEqual(a.map(z => z.uuid), b.map(z => z.uuid));
  });
  it('scoreRate/strengthRate stay in 0~1', () => {
    const alt = (i: number): Bar => (Math.floor(i / 10) % 2 === 0 ? upBar(i) : downBar(i));
    for (const z of TrendRange.trendRanges(rep(200, alt), cfg)) {
      assert.ok(z.scoreRate >= 0 && z.scoreRate <= 1);
      assert.ok(z.strengthRate >= 0 && z.strengthRate <= 1);
    }
  });
});
