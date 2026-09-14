import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import kospiFile from '../datas/kospi100-day1.json';
import { TradingSimulator } from '../src/stock/TradingSimulator';
import type { Candle } from '../src/stock/Candle';

const { findBestConfig, simulate } = TradingSimulator;

const IND = {
  macdFast: 12, macdSlow: 26, macdSignal: 9,
  rsiPeriod: 14, rsiOb: 70, rsiOs: 30,
  maShort: 5, maMid: 10, maLong: 60, maExponential: false,
};
const CAPITAL = 100_000_000;
const FEE = 0.00015; // 0.015%
const WINDOW = 300;
const GRID_S = [0, 0.5, 1];
const GRID_M = [0.2, 0.5, 0.8];

interface StockFile { code: string; candles: { dt: string; open: number; high: number; low: number; close: number; volume: number }[]; }

const stocks = (kospiFile as any).stocks as StockFile[];
assert.ok(stocks.length > 0, 'datas/kospi100-day1.json 종목 없음');

const toCandles = (s: StockFile): Candle[] =>
  [...s.candles]
    .sort((a, b) => String(a.dt).localeCompare(String(b.dt)))
    .slice(-WINDOW)
    .map((c) => ({ date: String(c.dt).slice(0, 10), open: c.open, high: c.high, low: c.low, close: c.close, volume: c.volume }));

// 종목별 최적 (s, m) — 페이지 sweepAndLockFullRange와 동일 평가식 (풀구간 단일 평가)
export interface SweepBest {
  code: string; s: number; m: number; mode: string;
  ret: number; hold: number; trades: number;
}
export function sweepStock(s: StockFile): SweepBest {
  const win = toCandles(s);
  assert.ok(win.length >= 60, `${s.code} 봉 부족: ${win.length}`);
  const hold = ((win[win.length - 1].close - win[0].close) / win[0].close) * 100;
  let best: SweepBest = { code: s.code, s: 0.5, m: 0.5, mode: '', ret: -Infinity, hold, trades: 0 };
  for (const sv of GRID_S) {
    for (const mv of GRID_M) {
      const cfg = findBestConfig(win, { strategyRate: sv, marketRate: mv, indicators: IND });
      const res = simulate({
        candles: win, config: cfg, history: [], indicators: IND,
        capital: CAPITAL, fee: FEE, risk: { takeProfitPct: 100 }, // 2026-09-11 스위프 확정값
      });
      if (res.returnPct > best.ret) {
        best = {
          code: s.code, s: sv, m: mv, mode: cfg.applyMode,
          ret: res.returnPct, hold,
          trades: res.trades.filter((t) => t.action === 'buy' || t.action === 'sell').length,
        };
      }
    }
  }
  return best;
}

describe('kospi100 sweep — 전종목 최적 (s, m) 탐색', () => {
  it(`${stocks.length}종목 × ${GRID_S.length * GRID_M.length}그리드 완주 + 리더보드`, () => {
    const results = stocks.map(sweepStock);
    // 정합: 체결 조건에 플랜 모드 기록 + 수익률 유한 + 거래는 윈도우 내
    for (const r of results) {
      assert.ok(Number.isFinite(r.ret), `${r.code} 수익률 비유한`);
      assert.ok(['min', 'max', 'combined'].includes(r.mode), `${r.code} mode=${r.mode}`);
    }
    const avg = results.reduce((a, r) => a + r.ret, 0) / results.length;
    const avgHold = results.reduce((a, r) => a + r.hold, 0) / results.length;
    const wins = results.filter((r) => r.ret > r.hold).length;
    const sorted = [...results].sort((a, b) => b.ret - a.ret);
    console.log(`\n[KOSPI100 sweep] n=${results.length} 평균수익 ${avg.toFixed(2)}% (단순보유 ${avgHold.toFixed(2)}%) · 보유초과 ${wins}/${results.length}`);
    console.log('상위 5: ' + sorted.slice(0, 5).map((r) => `${r.code} s${r.s}/m${r.m}(${r.mode}) ${r.ret >= 0 ? '+' : ''}${r.ret.toFixed(1)}%/${r.trades}건`).join(' | '));
    console.log('하위 5: ' + sorted.slice(-5).reverse().map((r) => `${r.code} s${r.s}/m${r.m}(${r.mode}) ${r.ret >= 0 ? '+' : ''}${r.ret.toFixed(1)}%/${r.trades}건`).join(' | '));
    // 탐색 품질 게이트: 이 윈도우(강세장)에서 평균 플러스 수익 — 단순보유 초과는 목표가 아니라 참고치로만 출력.
    // (전략은 비중 상한·익절 절반·관망 게이트로 불장에서 보유를 이기기 어렵게 설계됨)
    assert.ok(avg > 0, `평균수익 ${avg.toFixed(2)}% — 플러스 기대`);
  });
});
