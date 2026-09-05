import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  combinePct,
  computeSmaSeries,
  calcMetrics,
  simulate,
  findBestConfig,
} from '../src/stock/TradingSimulator';

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

describe('execution frictions', () => {
  // 단조 상승 + MA2 골든 매수 100%: 신호 bar2(종가 104), 다음봉 시가 105
  const candles = [100, 102, 104, 106, 108, 110, 112, 114, 116, 118, 120].map((c, i) => ({
    date: 'd' + i, open: c - 1, high: c + 1, low: c - 2, close: c, volume: 1000,
  }));
  const mas: any[] = [{
    period: 2, color: '#f00',
    pyramiding: { signals: [{ signal: 'golden', action: 'buy', percent: 100, candleFilter: 'any', volumeFilter: 'any', consecutive: 1, alignment: 'any', condTrade: { type: 'any', operator: 'any', value: 1 }, condCandle: { type: 'any', operator: 'any', value: 1 }, condMa: { type: 'any', operator: 'any', value: 1 } }] },
  }];
  const range = { simFrom: 0, simTo: candles.length - 1 };
  it('baseline executes at signal close 104', () => {
    const r = simulate(candles, mas, [], { ...OPTS, ...range });
    assert.equal(r.trades[0].price, 104);
    assert.equal(r.trades[0].sharesDelta, 9615);
  });
  it('execDelay=1 executes at next open 105', () => {
    const r = simulate(candles, mas, [], { ...OPTS, ...range, execDelay: 1 });
    assert.equal(r.trades[0].price, 105);
    assert.equal(r.trades[0].sharesDelta, Math.floor(1000000 / 105));
  });
  it('slippage 1% inflates buy price', () => {
    const r = simulate(candles, mas, [], { ...OPTS, ...range, slippage: 0.01 });
    assert.ok(Math.abs(r.trades[0].price - 104 * 1.01) < 1e-9);
    assert.equal(r.trades[0].sharesDelta, Math.floor(1000000 / (104 * 1.01)));
  });
  it('fillRatio 0.5 halves shares', () => {
    const r = simulate(candles, mas, [], { ...OPTS, ...range, fillRatio: 0.5 });
    assert.equal(r.trades[0].sharesDelta, Math.floor(9615 * 0.5));
  });
  it('trades carry exec context (wanted/mode/slip/fill)', () => {
    const r = simulate(candles, mas, [], { ...OPTS, ...range, execDelay: 1, slippage: 0.01, fillRatio: 0.5 });
    const t = r.trades[0] as any;
    assert.equal(t.wantedPrice, 104);
    assert.equal(t.execMode, 'nextOpen');
    assert.equal(t.slipPct, 1);
    assert.equal(t.fillPct, 50);
    assert.equal(t.wantedShares, Math.floor(1000000 / 106.05));
    assert.equal(t.sharesDelta, Math.floor(t.wantedShares * 0.5));
    const b = simulate(candles, mas, [], { ...OPTS, ...range });
    assert.equal((b.trades[0] as any).execMode, 'close');
  });
  it('explicit defaults equal omitted', () => {
    const a = simulate(candles, mas, [], { ...OPTS, ...range });
    const b = simulate(candles, mas, [], { ...OPTS, ...range, execDelay: 0, slippage: 0, fillRatio: 1 });
    assert.equal(a.cash, b.cash);
    assert.equal(a.trades.length, b.trades.length);
  });
  it('calcMetrics with frictions stays finite', () => {
    const m = calcMetrics(candles, mas, [], { ...OPTS, ...range, execDelay: 1, slippage: 0.005, fillRatio: 0.8 });
    assert.ok(Number.isFinite(m.profit));
  });
});

describe('findBestConfig smoke', () => {
  it('returns a config on small data (seeded)', () => {
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
