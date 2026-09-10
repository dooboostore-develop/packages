import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeSmaSeries,
  computeMacdSeries,
  computeRsiSeries,
  computeObvSeries,
} from '@dooboostore/algorithm';
import {
  buildCandleInfo,
  maSeriesKey,
} from '../src/StockChart';

const near = (a: number, b: number, eps = 1e-9) => Math.abs(a - b) < eps;

describe('computeSmaSeries', () => {
  it('hand-check', () => {
    assert.deepEqual(computeSmaSeries([1, 2, 3, 4, 5], 3), [null, null, 2, 3, 4]);
  });
  it('unformed head is null, short data all null', () => {
    assert.deepEqual(computeSmaSeries([1, 2], 5), [null, null]);
  });
});

describe('computeMacdSeries', () => {
  it('hand-check f2/s3/g2', () => {
    // fastEMA(k=2/3)=[10,10.6667,11.5556], slowEMA(k=1/2)=[10,10.5,11.25]
    const r = computeMacdSeries([10, 11, 12], 2, 3, 2);
    assert.ok(near(r.macd[1], 1 / 6) && near(r.macd[2], 0.3055556, 1e-6));
    assert.ok(near(r.signal[1], 1 / 9) && near(r.signal[2], 0.2407407, 1e-6));
    assert.ok(near(r.hist[1], 1 / 18) && near(r.hist[2], 0.0648148, 1e-6));
  });
  it('inverted slow<=fast stays finite', () => {
    const r = computeMacdSeries([10, 11, 12], 26, 12, 9);
    assert.ok(r.macd.every(Number.isFinite));
  });
  it('uptrend late>0, downtrend late<0', () => {
    const up = Array.from({ length: 60 }, (_, i) => 100 + i);
    const dn = Array.from({ length: 60 }, (_, i) => 200 - i);
    assert.ok(computeMacdSeries(up, 12, 26, 9).macd[59] > 0);
    assert.ok(computeMacdSeries(dn, 12, 26, 9).macd[59] < 0);
  });
});

describe('computeRsiSeries', () => {
  it('hand-check p2 (Wilder)', () => {
    // diffs +1,+1,-1,-1 → seed avgG=1,avgL=0 → 100 / 50 / 25
    assert.deepEqual(computeRsiSeries([10, 11, 12, 11, 10], 2), [100, 100, 100, 50, 25]);
  });
  it('flat → 50, short data → 50', () => {
    assert.ok(computeRsiSeries([5, 5, 5, 5, 5], 2).every(v => v === 50));
    assert.ok(computeRsiSeries([1, 2], 14).every(v => v === 50));
  });
  it('bounds 0..100, uptrend>70, downtrend<30', () => {
    let s = 42;
    const rw: number[] = [];
    let p = 100;
    for (let i = 0; i < 200; i++) { s = (s * 1103515245 + 12345) % 2147483648; p = Math.max(1, p + (s / 2147483648 - 0.5) * 4); rw.push(p); }
    assert.ok(computeRsiSeries(rw, 14).every(v => v >= 0 && v <= 100));
    const up = Array.from({ length: 60 }, (_, i) => 100 + i);
    const dn = Array.from({ length: 60 }, (_, i) => 200 - i);
    assert.ok(computeRsiSeries(up, 14)[59] > 70);
    assert.ok(computeRsiSeries(dn, 14)[59] < 30);
  });
});

describe('computeObvSeries', () => {
  it('hand-check', () => {
    assert.deepEqual(computeObvSeries([10, 12, 11, 11], [100, 200, 300, 400]), [0, 200, -100, -100]);
  });
  it('empty', () => {
    assert.deepEqual(computeObvSeries([], []), []);
  });
});

describe('buildCandleInfo', () => {
  const pts = [
    { date: 'd0', open: 10, high: 11, low: 9, close: 10, volume: 100 },
    { date: 'd1', open: 10, high: 12, low: 10, close: 12, volume: 200 },
    { date: 'd2', open: 12, high: 13, low: 11, close: 11, volume: 300 },
    { date: 'd3', open: 11, high: 14, low: 11, close: 14, volume: 400 },
  ];
  const closes = pts.map(p => p.close);
  const vols = pts.map(p => p.volume);
  const sma = new Map([[maSeriesKey({ period: 2, type: 'sma' }), computeSmaSeries(closes, 2)]]);
  const mas = [{ color: '#f00', period: 2, type: 'sma' as const }];
  const macdCfg = { fast: 2, slow: 3, signal: 2, fastColor: '#a', signalColor: '#b' };
  const macd = computeMacdSeries(closes, 2, 3, 2);
  const rsiCfg = { period: 2, lineColor: '#c', overbought: { level: 70, color: '#x' }, oversold: { level: 30, color: '#y' } };
  const rsi = computeRsiSeries(closes, 2);
  const obv = computeObvSeries(closes, vols);

  it('shape + values', () => {
    const info = buildCandleInfo(3, pts, mas, sma, macdCfg, macd, rsiCfg, rsi, { lineColor: '#o' }, obv)!;
    assert.equal(info.index, 3);
    assert.equal(info.candle.close, 14);
    assert.equal(info.ma.length, 1);
    assert.equal(info.ma[0].period, 2);
    assert.ok(typeof info.ma[0].value === 'number');
    assert.ok(info.macd && typeof info.macd.hist === 'number');
    assert.ok(info.rsi && typeof info.rsi.value === 'number');
    assert.equal(info.obv!.value, obv[3]);
  });
  it('ma slope = pct change, histSlope = hist diff', () => {
    const info = buildCandleInfo(3, pts, mas, sma, macdCfg, macd, null, null, null, null)!;
    assert.ok(near(info.ma[0].slope!, (12.5 - 11.5) / 11.5 * 100, 1e-9));
    assert.ok(near(info.macd!.histSlope!, macd.hist[3] - macd.hist[2], 1e-12));
  });
  it('first bar slopes null, unformed ma null', () => {
    const info0 = buildCandleInfo(0, pts, mas, sma, macdCfg, macd, null, null, null, null)!;
    assert.equal(info0.ma[0].value, null);
    assert.equal(info0.ma[0].slope, null);
    assert.equal(info0.macd!.histSlope, null);
  });
  it('no config → null fields, out of range → null', () => {
    const bare = buildCandleInfo(2, pts, [], new Map(), null, null, null, null, null, null)!;
    assert.equal(bare.macd, null);
    assert.equal(bare.rsi, null);
    assert.equal(bare.obv, null);
    assert.deepEqual(bare.ma, []);
    assert.equal(buildCandleInfo(9, pts, mas, sma, macdCfg, macd, null, null, null, null), null);
    assert.equal(buildCandleInfo(-1, pts, mas, sma, macdCfg, macd, null, null, null, null), null);
  });
});
