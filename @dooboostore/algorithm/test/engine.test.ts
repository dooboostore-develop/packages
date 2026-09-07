import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  combinePct,
  calcMetrics,
  simulate,
  findBestConfig,
} from '../src/stock/TradingSimulator';
import {
  computeSmaSeries,
} from '../src/stock/trend';

function mulberry(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const OPTS = {
  initialCapital: 1000000, feePercent: 0, requireAll: false,
  maMode: 'minFirst' as const, xMode: 'minFirst' as const,
  trend: 0.5, riskAversion: 0.5,
};

describe('combinePct', () => {
  it('[10,20] → 28 (not 30)', () => {
    assert.equal(combinePct([10, 20]), 28);
  });
  it('[10,30] → 37, single passthrough, cap 100', () => {
    assert.equal(combinePct([10, 30]), 37);
    assert.equal(combinePct([40]), 40);
    assert.equal(combinePct([60, 60]), 84);
    assert.equal(combinePct([100, 100]), 100);
  });
});

describe('computeSmaSeries (engine)', () => {
  it('matches chart math', () => {
    assert.deepEqual(computeSmaSeries([1, 2, 3, 4, 5], 3), [null, null, 2, 3, 4]);
  });
});

describe('empty inputs', () => {
  it('calcMetrics with no candles/MAs → -Infinity', () => {
    const m = calcMetrics([], [], [], { ...OPTS, simFrom: 0, simTo: 0 });
    assert.equal(m.profit, -Infinity);
    assert.equal(m.tradeCount, 0);
  });
  it('simulate with no configs → cash kept, no trades', () => {
    const candles = [
      { date: 'd0', open: 10, high: 11, low: 9, close: 10, volume: 100 },
      { date: 'd1', open: 10, high: 12, low: 10, close: 12, volume: 200 },
    ];
    const r = simulate(candles, [], [], { ...OPTS, simFrom: 0, simTo: 1 });
    assert.equal(r.cash, 1000000);
    assert.equal(r.trades.length, 0);
  });
});

describe('golden-buy smoke', () => {
  // 단조 상승 + MA2 골든 매수 100% → 체결 발생, 수익 > 0
  const candles = [100, 102, 104, 106, 108, 110, 112, 114, 116, 118, 120].map((c, i) => ({
    date: 'd' + i, open: c - 1, high: c + 1, low: c - 2, close: c, volume: 1000,
  }));
  const mas: any[] = [{
    period: 2, color: '#f00',
    pyramiding: { signals: [{ signal: 'golden', action: 'buy', percent: 100, candleFilter: 'any', volumeFilter: 'any', consecutive: 1, alignment: 'any', condTrade: { type: 'any', operator: 'any', value: 1 }, condCandle: { type: 'any', operator: 'any', value: 1 }, condMa: { type: 'any', operator: 'any', value: 1 } }] },
  }];
  it('calcMetrics fires buys with profit', () => {
    const m = calcMetrics(candles, mas, [], { ...OPTS, simFrom: 0, simTo: candles.length - 1 });
    assert.ok(m.tradeCount > 0);
    assert.ok(Number.isFinite(m.profit) && m.profit > 0);
  });
  it('simulate first trade is buy, cash consistent', () => {
    const r = simulate(candles, mas, [], { ...OPTS, simFrom: 0, simTo: candles.length - 1 });
    assert.ok(r.trades.length > 0);
    assert.equal(r.trades[0].action, 'buy');
    assert.ok(r.cash >= 0 && r.shares >= 0);
  });
});

describe('signal-close execution (deterministic, idempotent)', () => {
  // 단조 상승 + MA2 골든 매수 100%: 신호 bar2(종가 104)에 체결
  const candles = [100, 102, 104, 106, 108, 110, 112, 114, 116, 118, 120].map((c, i) => ({
    date: 'd' + i, open: c - 1, high: c + 1, low: c - 2, close: c, volume: 1000,
  }));
  const mas: any[] = [{
    period: 2, color: '#f00',
    pyramiding: { signals: [{ signal: 'golden', action: 'buy', percent: 100, candleFilter: 'any', volumeFilter: 'any', consecutive: 1, alignment: 'any', condTrade: { type: 'any', operator: 'any', value: 1 }, condCandle: { type: 'any', operator: 'any', value: 1 }, condMa: { type: 'any', operator: 'any', value: 1 } }] },
  }];
  const range = { simFrom: 0, simTo: candles.length - 1 };
  it('executes at signal close 104', () => {
    const r = simulate(candles, mas, [], { ...OPTS, ...range });
    assert.equal(r.trades[0].price, 104);
    assert.equal(r.trades[0].sharesDelta, 9615);
  });
  it('same input → same output (idempotent)', () => {
    const a = simulate(candles, mas, [], { ...OPTS, ...range });
    const b = simulate(candles, mas, [], { ...OPTS, ...range });
    assert.equal(a.cash, b.cash);
    assert.equal(a.trades.length, b.trades.length);
    assert.deepEqual(a.trades.map(t => [t.price, t.sharesDelta]), b.trades.map(t => [t.price, t.sharesDelta]));
  });
  it('trades carry fixed exec context', () => {
    const t = simulate(candles, mas, [], { ...OPTS, ...range }).trades[0] as any;
    assert.equal(t.execMode, 'close');
    assert.equal(t.slipPct, 0);
    assert.equal(t.fillPct, 100);
  });
  it('skipAfter cools the signal down (no back-to-back buys)', () => {
    const cool = [{ period: 2, color: '#f00', pyramiding: { signals: [{ ...mas[0].pyramiding.signals[0], percent: 10, skipAfter: 3 }] } }];
    const r = simulate(candles, cool, [], { ...OPTS, ...range });
    assert.ok(r.trades.length >= 2);
    const idxs = r.trades.map(t => candles.findIndex(c => c.date === t.date));
    for (let k = 1; k < idxs.length; k++) assert.ok(idxs[k] - idxs[k - 1] >= 4);
    const plain = simulate(candles, [{ ...cool[0], pyramiding: { signals: [{ ...cool[0].pyramiding.signals[0], skipAfter: 0 }] } }], [], { ...OPTS, ...range });
    assert.ok(plain.trades.length > r.trades.length);
  });
});

describe('findBestConfig without candles (opts-only inference, deterministic)', () => {
  const base = { ...OPTS, riskAversion: 0.5 } as any;
  delete base.requireAll;
  it('uptrend → buys bigger than sells, specific filters, consecutive 2', () => {
    const a = findBestConfig([], { ...base, trend: 1 });
    const b = findBestConfig([], { ...base, trend: 1 });
    // 약한 랜덤성: 값은 달라도 방향·구조 동일
    for (const r of [a!, b!]) {
      const sigs = r.maConfigs.flatMap(m => m.pyramiding.signals);
      const buys = sigs.filter(s => s.action === 'buy');
      const sells = sigs.filter(s => s.action === 'sell');
      assert.ok(buys.length > 0 && sells.length > 0);
      assert.ok(buys.every(s => s.percent > sells[0].percent));
      assert.ok(sigs.every(s => s.consecutive === 2 && s.candleFilter !== 'any' && s.volumeFilter !== 'any'));
      assert.ok(r.maConfigs.every(m => [5, 10, 20, 30].includes(m.period)));
    }
  });
  it('downtrend mirrors (sells bigger), neutral is symmetric', () => {    const d = findBestConfig([], { ...base, trend: 0 })!;
    const ds = d.maConfigs.flatMap(m => m.pyramiding.signals);
    assert.ok(ds.filter(s => s.action === 'sell').every(s => s.percent > ds.filter(s => s.action === 'buy')[0].percent));
    const n = findBestConfig([], { ...base, trend: 0.5 })!;
    const ns = n.maConfigs.flatMap(m => m.pyramiding.signals);
    const nb = ns.filter(s => s.action === 'buy')[0].percent;
    const nsell = ns.filter(s => s.action === 'sell')[0].percent;
    assert.ok(Math.abs(nb - nsell) <= 10 && nb >= 20 && nb <= 40 && nsell >= 20 && nsell <= 40);
  });
  it('untradable data (2 bars) → prior inference, not all-any garbage', () => {
    const tiny = [100, 99].map((c, i) => ({ date: 'd' + i, open: c, high: c + 1, low: c - 1, close: c, volume: 1000 }));
    const r = findBestConfig(tiny, { ...base, simFrom: 0, simTo: 1, trend: 0 })!;
    assert.ok(r && r.maConfigs.length > 0);
    assert.ok(r.maConfigs.every(m => [5, 10, 20, 30].includes(m.period)));
    const sigs = r.maConfigs.flatMap(m => m.pyramiding.signals);
    assert.ok(sigs.every(s => s.consecutive === 2 && s.candleFilter !== 'any'));
  });
});

describe('findBestConfig smoke', () => {  it('returns a config on small data (seeded)', () => {
    const r = mulberry(7);
    let p = 100;
    const candles = Array.from({ length: 80 }, (_, i) => {
      p = Math.max(10, p + (r() - 0.48) * 3);
      return { date: 'd' + i, open: p, high: p * 1.01, low: p * 0.99, close: p, volume: 1000 };
    });
    const orig = Math.random;
    Math.random = mulberry(99);
    try {
      const { requireAll, ...noReq } = OPTS;
      const best = findBestConfig(candles, { ...noReq, simFrom: 0, simTo: candles.length - 1 });
      assert.ok(best && best.maConfigs.length > 0);
    } finally {
      Math.random = orig;
    }
  });
});
