import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import candleFile from '../datas/candle.json';
import { TradingSimulator } from '../src/stock/TradingSimulator';
import { TrendRange } from '../src/stock/TrendRange';
import { computeMacdSeries, computeRsiSeries, computeObvSeries } from '../src/stock/trend';

const { findBestConfig, simulate } = TradingSimulator;

const raw = (candleFile as any).result.candles as any[];
// 원본은 최신순 → 오름차순 정렬
const candles = [...raw]
  .sort((a, b) => String(a.dt).localeCompare(String(b.dt)))
  .map(c => ({ date: String(c.dt).slice(0, 10), open: c.open, high: c.high, low: c.low, close: c.close, volume: c.volume }));

describe('real candles (A005930 x360)', () => {
  it('parses sane and ascending', () => {
    assert.equal(candles.length, 360);
    for (let k = 1; k < candles.length; k++) assert.ok(candles[k].date >= candles[k - 1].date);
    assert.ok(candles.every(c => c.close > 0 && c.high >= c.low));
  });

  it('findBestConfig returns executable config shape', () => {
    const best = findBestConfig(candles as any, { trend: 0.5, riskAversion: 0.5 })!;
    assert.ok(best && best.maConfigs.length > 0);
    const periods = best.maConfigs.map((m: any) => m.period);
    assert.deepEqual(periods, [...periods].sort((a, b) => a - b));
    assert.ok(['minFirst', 'maxFirst', 'all'].includes(best.maResolveMode as string));
    assert.ok(['minFirst', 'maxFirst', 'all'].includes(best.exitResolveMode as string));
  });

  it('simulate(best) stays solvent with ordered bars', () => {
    const best = findBestConfig(candles as any, { trend: 0.5, riskAversion: 0.5 })!;
    const r = simulate(candles as any, best, {
      initialCapital: 100_000_000, feePercent: 0.015,
      initialShares: 100, initialAvgPrice: Math.round(candles[0].close), requireAll: true,
    });
    assert.ok(r.cash >= 0 && r.shares >= 0);
    assert.ok(Number.isFinite(r.rate) && Number.isFinite(r.profit));
    for (const t of r.trades) assert.ok(t.barIdx >= 0 && t.barIdx < candles.length);
    for (let k = 1; k < r.trades.length; k++) assert.ok(r.trades[k].barIdx >= r.trades[k - 1].barIdx);
  });

  it('trendRanges covers full data contiguously (soft cap, may exceed 12)', () => {
    const closes = candles.map(c => c.close);
    const vols = candles.map(c => c.volume);
    const macd = computeMacdSeries(closes, 12, 26, 9);
    const rsi = computeRsiSeries(closes, 14);
    const obv = computeObvSeries(closes, vols);
    const bars: TrendRange.TrendBar[] = closes.map((_, i) => ({ macd: macd.macd[i], rsi: rsi[i], obv: obv[i] }));
    const grp = (r: number): string => r > 0.6 ? 'up' : r < 0.4 ? 'down' : 'side';
    const zs = TrendRange.trendRanges(bars, { groupBy: grp });
    assert.ok(zs.length >= 1);
    assert.equal(zs[0].startIndex, 0);
    assert.equal(zs[zs.length - 1].endIndex, closes.length - 1);
    for (let k = 1; k < zs.length; k++) assert.equal(zs[k].startIndex, zs[k - 1].endIndex + 1);
  });
});
