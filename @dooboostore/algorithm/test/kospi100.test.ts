import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { TradingSimulator } from '../src/stock/TradingSimulator';

const C = TradingSimulator;
const datasDir = path.resolve(__dirname, '..', 'datas', 'kospi100');
const index = JSON.parse(fs.readFileSync(path.join(datasDir, '_index.json'), 'utf8')) as { top100: string[] };

const IND: C.IndicatorParams = {
  macdFast: 12, macdSlow: 26, macdSignal: 9,
  rsiPeriod: 14, rsiOb: 70, rsiOs: 30,
  maShort: 5, maMid: 10, maLong: 40, maExponential: false,
};

interface StockResult {
  code: string; name: string; n: number; trades: number;
  ret: number; bhRet: number; mdd: number;
}

function backtest(code: string): StockResult {
  const file = JSON.parse(fs.readFileSync(path.join(datasDir, `${code}.json`), 'utf8')).result;
  const candles = [...file.candles].reverse().map((c: any) => ({
    date: String(c.dt).slice(0, 16), open: c.open, high: c.high, low: c.low, close: c.close, volume: c.volume,
  }));
  const capital = 10_000_000;
  const fee = 0.00015;
  let accepted: C.UserTrade[] = [];
  for (let k = 1; k <= candles.length; k++) {
    const win = candles.slice(0, k);
    const cfg = C.findBestConfig(win, { strategyRate: 0.5, marketRate: 0.5, indicators: IND });
    const r = C.simulate({ candles: win, config: cfg, history: accepted, indicators: IND, capital, fee, risk: { takeProfitPct: 8 }, fromBar: k - 1 });
    accepted.push(...r.trades.filter(t => t.action === 'buy' || t.action === 'sell'));
  }
  let cash = capital, shares = 0;
  const byDate = new Map<string, C.UserTrade[]>();
  for (const t of accepted) {
    if (!byDate.has(t.date)) byDate.set(t.date, []);
    byDate.get(t.date)!.push(t);
  }
  let peak = capital, maxDD = 0;
  for (const c of candles) {
    for (const t of byDate.get(c.date) ?? []) {
      if (t.action === 'buy') {
        const q = Math.min(t.shares, Math.floor(cash / (t.price * (1 + fee))));
        cash -= q * t.price * (1 + fee); shares += q;
      } else {
        const q = Math.min(t.shares, shares);
        cash += q * t.price * (1 - fee); shares -= q;
      }
    }
    assert.ok(cash >= -1e-6 && shares >= 0, `${code} 원장 붕괴`);
    const e = cash + shares * c.close;
    peak = Math.max(peak, e);
    maxDD = Math.min(maxDD, (e - peak) / peak * 100);
  }
  const endEq = cash + shares * candles[candles.length - 1].close;
  const bh = capital * (candles[candles.length - 1].close / candles[0].close);
  return {
    code, name: file.name, n: candles.length, trades: accepted.length,
    ret: (endEq - capital) / capital * 100,
    bhRet: (bh - capital) / capital * 100,
    mdd: maxDD,
  };
}

describe('KOSPI100 backtest (3mo daily)', () => {
  it('전 종목 완주 + 집계 리포트', () => {
    assert.ok(index.top100.length === 100);
    const results = index.top100.map(backtest);
    const traded = results.filter(r => r.trades > 0);
    const avg = (xs: number[]) => xs.reduce((s, v) => s + v, 0) / Math.max(1, xs.length);
    const win = results.filter(r => r.ret > 0).length;
    console.log(`stocks=${results.length} traded=${traded.length} win=${win} ` +
      `avgRet=${avg(results.map(r => r.ret)).toFixed(2)}% avgBh=${avg(results.map(r => r.bhRet)).toFixed(2)}% ` +
      `avgMdd=${avg(results.map(r => r.mdd)).toFixed(2)}% avgTrades=${avg(results.map(r => r.trades)).toFixed(1)}`);
    const worst = [...results].sort((a, b) => a.ret - b.ret).slice(0, 3)
      .map(r => `${r.code}(${r.name}) ${r.ret.toFixed(1)}%`).join(' ');
    const best = [...results].sort((a, b) => b.ret - a.ret).slice(0, 3)
      .map(r => `${r.code}(${r.name}) ${r.ret.toFixed(1)}%`).join(' ');
    console.log(`best: ${best} / worst: ${worst}`);
    assert.ok(traded.length >= 80, `매매 발생 종목 부족: ${traded.length}/100`);
    // 전략 평균이 단순보유 평균을 상회 (하락장 방어 + 상승장 추종)
    assert.ok(avg(results.map(r => r.ret)) > avg(results.map(r => r.bhRet)), '전략이 단순보유 하회');
  });
});
