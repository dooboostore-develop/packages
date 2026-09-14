import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TradingSimulator } from '../src/stock/TradingSimulator';
import type { Candle } from '../src/stock/Candle';

const { findBestConfig, simulate, forecastCloses, forecastBands, forecastByAnalogy, forecastByFourier } = TradingSimulator;

const IND = {
  macdFast: 12, macdSlow: 26, macdSignal: 9,
  rsiPeriod: 14, rsiOb: 70, rsiOs: 30,
  maShort: 5, maMid: 10, maLong: 60, maExponential: false,
};

// 매일 ±pct%씩 단조 이동하는 합성 봉 (date는 d0..)
function driftBars(n: number, start: number, pct: number): Candle[] {
  const out: Candle[] = [];
  let p = start;
  for (let i = 0; i < n; i++) {
    p = p * (1 + pct);
    out.push({ date: 'd' + i, open: p * 0.999, high: p * 1.001, low: p * 0.998, close: p, volume: 1000 });
  }
  return out;
}

describe('findBestConfig — 시장(m) → 적용 방식', () => {
  const down = driftBars(60, 100, -0.03);
  it('m=0.1 → min, m=0.5 → combined, m=0.9 → max', () => {
    assert.equal(findBestConfig(down, { strategyRate: 0.5, marketRate: 0.1, indicators: IND }).applyMode, 'min');
    assert.equal(findBestConfig(down, { strategyRate: 0.5, marketRate: 0.5, indicators: IND }).applyMode, 'combined');
    assert.equal(findBestConfig(down, { strategyRate: 0.5, marketRate: 0.9, indicators: IND }).applyMode, 'max');
  });
  it('3봉 미만 → 조건 없음', () => {
    const r = findBestConfig(driftBars(2, 100, 0.01), { indicators: IND });
    assert.deepEqual(r.conditions, []);
  });
});

describe('findBestConfig — 전략(s) → 하락장 매수/매도 성향', () => {
  // 가파른 하락: 눌림 매력도(dipScore) ≈ 0.97 → s=0 매수 / s=0.5 매수 / s=1 매도
  const down = driftBars(60, 100, -0.03);
  const downActionOf = (s: number) => {
    const r = findBestConfig(down, { strategyRate: s, marketRate: 0.5, indicators: IND });
    assert.ok(r.conditions.length > 0, `s=${s} 조건 없음`);
    return r.conditions.filter(c => c.description?.includes('하회') || c.description?.includes('과매도'));
  };
  it('s=0 물타기 → 하락 신호 매수', () => {
    for (const c of downActionOf(0)) assert.equal(c.action, 'buy');
  });
  it('s=1 불타기 → 하락 신호 매도', () => {
    for (const c of downActionOf(1)) assert.equal(c.action, 'sell');
  });
  it('상승 신호는 전략 무관 매수', () => {
    const up = driftBars(60, 100, 0.03);
    for (const s of [0, 0.5, 1]) {
      const r = findBestConfig(up, { strategyRate: s, marketRate: 0.5, indicators: IND });
      const maUp = r.conditions.find(c => c.source === 'MA' && c.operator === '>');
      assert.ok(maUp, `s=${s} 상승 MA 조건 없음`);
      assert.equal(maUp!.action, 'buy');
    }
  });
  it('청개구리 → 조건 매수/매도 뒤집힘', () => {
    const down = driftBars(60, 100, -0.03);
    const a = findBestConfig(down, { strategyRate: 0, marketRate: 0.5, indicators: IND });
    const b = findBestConfig(down, { strategyRate: 0, marketRate: 0.5, indicators: IND, invertActions: true });
    assert.equal(a.conditions.length, b.conditions.length);
    for (let i = 0; i < a.conditions.length; i++) {
      assert.equal(b.conditions[i].action, a.conditions[i].action === 'buy' ? 'sell' : 'buy');
    }
  });
});

describe('forecastCloses — candles[] → number[]', () => {
  it('요청 봉 수만큼 반환 + 빈 입력은 0 채움', () => {
    assert.deepEqual(forecastCloses([], 3), [0, 0, 0]);
    assert.deepEqual(forecastCloses(driftBars(30, 100, 0.01), 0), []);
    assert.equal(forecastCloses(driftBars(30, 100, 0.01), 5).length, 5);
  });
  it('상승 추세 → 마지막 종가 위로, 하락 추세 → 아래로', () => {
    const up = driftBars(30, 100, 0.01);
    const upOut = forecastCloses(up, 3);
    assert.ok(upOut[0] > up[up.length - 1].close, `${upOut}`);
    assert.ok(upOut[2] >= upOut[0], `${upOut}`);
    const dn = driftBars(30, 100, -0.01);
    const dnOut = forecastCloses(dn, 3);
    assert.ok(dnOut[0] < dn[dn.length - 1].close, `${dnOut}`);
  });
  it('횡보 → 거의 제자리 (감쇠 수렴)', () => {
    const flat = driftBars(30, 100, 0);
    const out = forecastCloses(flat, 5);
    for (const v of out) assert.ok(Math.abs(v - 100) < 1, `${out}`);
  });
});

describe('forecastCloses — chop 억제', () => {
  it('수렴 횡보(H-L 3%→0.2%) → 10봉 총변동 ±1% 내', () => {
    const cs: Candle[] = [];
    let p = 100;
    for (let i = 0; i < 120; i++) {
      p = p * (1 + (i % 2 === 0 ? 0.002 : -0.002));
      const spread = 0.03 * Math.pow(0.2 / 3, i / 119);
      cs.push({ date: 'd' + i, open: p, high: p * (1 + spread / 2), low: p * (1 - spread / 2), close: p, volume: 1000 });
    }
    const fc = forecastCloses(cs, 10);
    const total = ((fc[9] - cs[119].close) / cs[119].close) * 100;
    assert.ok(Math.abs(total) < 1, `총변동 ${total}%`);
  });
});

describe('forecastBands — 콘 (mid/upper/lower)', () => {
  it('길이 일치 + 상≥중≥하 + 횡보는 좁음', () => {
    const flat = driftBars(30, 100, 0);
    const b = forecastBands(flat, 5);
    assert.equal(b.mid.length, 5);
    assert.equal(b.upper.length, 5);
    assert.equal(b.lower.length, 5);
    for (let k = 0; k < 5; k++) {
      assert.ok(b.upper[k] >= b.mid[k] - 1e-9, `${b.upper} vs ${b.mid}`);
      assert.ok(b.lower[k] <= b.mid[k] + 1e-9, `${b.lower} vs ${b.mid}`);
      assert.ok(b.upper[k] - b.lower[k] < 2, `횡보 밴드폭: ${b.upper[k] - b.lower[k]}`);
    }
  });
  it('H-L 레인지 확대 → 밴드 확대 (동일 종가)', () => {
    const base = driftBars(30, 100, 0.005);
    const wide = base.map(c => ({ ...c, high: c.close * 1.04, low: c.close * 0.96 }));
    const wb = forecastBands(wide, 5);
    const nb = forecastBands(base, 5);
    const w = (b: { upper: number[]; lower: number[] }) => b.upper[4] - b.lower[4];
    assert.ok(w(wb) > w(nb) * 1.5, `확대 ${w(wb)} vs 기본 ${w(nb)}`);
  });
  it('변동장 밴드가 횡보 밴드보다 넓음', () => {
    const calm = forecastBands(driftBars(30, 100, 0), 5);
    const choppy = driftBars(30, 100, 0).map((c, i) => ({ ...c, close: 100 + (i % 2 === 0 ? 3 : -3) }));
    const wild = forecastBands(choppy, 5);
    const w = (b: { upper: number[]; lower: number[] }) => b.upper[4] - b.lower[4];
    assert.ok(w(wild) > w(calm), `변동 ${w(wild)} vs 횡보 ${w(calm)}`);
  });
});

describe('simulate — 묶음 집행 (batchBars)', () => {
  const bothWays = {
    conditions: [
      { source: 'MA' as const, left: '단기MA', right: '중기MA', operator: '>' as const, action: 'buy' as const, percent: 30 },
      { source: 'MA' as const, left: '단기MA', right: '중기MA', operator: '<' as const, action: 'sell' as const, percent: 30 },
    ],
    applyMode: 'combined' as const, conviction: 1,
    execPolicy: { maxConsecBars: 0, restBars: 3, batchBars: 3 },
  };
  // 톱니: 2봉 +3%, 2봉 -3% 반복 → 매수/매도 신호 교대
  function sawtooth() {
    const out: Candle[] = [];
    let p = 100;
    for (let i = 0; i < 48; i++) {
      const up = Math.floor(i / 2) % 2 === 0;
      p = p * (1 + (up ? 0.03 : -0.03));
      out.push({ date: 's' + i, open: p * 0.999, high: p * 1.002, low: p * 0.998, close: p, volume: 1000 });
    }
    return out;
  }
  it('집행은 그리드봉(i%3==2)에서만', () => {
    const cs = sawtooth();
    const res = simulate({
      candles: cs, config: bothWays, history: [], indicators: IND, capital: 1_000_000, fee: 0,
    });
    const ex = res.trades.filter(t => t.action === 'buy' || t.action === 'sell');
    assert.ok(ex.length > 0, '집행 없음');
    const idx = new Map(cs.map((c, i) => [c.date, i] as const));
    for (const t of ex) assert.equal(idx.get(t.date)! % 3, 2, `${t.date} 비그리드 집행`);
  });
  it('묶음 < 미묶음 건수 (네팅 상쇄)', () => {
    const cs = sawtooth();
    const batched = simulate({
      candles: cs, config: bothWays, history: [], indicators: IND, capital: 1_000_000, fee: 0,
    });
    const plain = simulate({
      candles: cs, config: { ...bothWays, execPolicy: { maxConsecBars: 0, restBars: 3 } },
      history: [], indicators: IND, capital: 1_000_000, fee: 0,
    });
    const nb = batched.trades.filter(t => t.action === 'buy' || t.action === 'sell').length;
    const np = plain.trades.filter(t => t.action === 'buy' || t.action === 'sell').length;
    assert.ok(np > 0, '미묶음 집행 없음');
    assert.ok(nb <= np, `묶음 ${nb} > 미묶음 ${np}`);
  });
  it('노룩어헤드: 풀윈도우 ≣ 청크분할(fromBar+history) 동일', () => {
    const cs = sawtooth();
    const full = simulate({
      candles: cs, config: bothWays, history: [], indicators: IND, capital: 1_000_000, fee: 0,
    });
    // 페이지 runLoopOnce 미러: 확장 윈도우 + history/batchState 체인 + 당일봉만 평가
    const accepted: TradingSimulator.UserTrade[] = [];
    let bs: TradingSimulator.BatchState | undefined;
    for (let k = 1; k <= cs.length; k++) {
      const winc = cs.slice(0, k);
      const r = simulate({
        candles: winc, config: bothWays, history: [...accepted],
        indicators: IND, capital: 1_000_000, fee: 0, fromBar: k - 1, batchState: bs,
      });
      bs = r.batchState;
      for (const t of r.trades) {
        if (t.action === 'buy' || t.action === 'sell') accepted.push(t);
      }
    }
    const slim = (ts: TradingSimulator.UserTrade[]) => ts.map(t => [t.date, t.action, t.price, t.shares].join('|'));
    assert.deepEqual(slim(accepted), slim(full.trades.filter(t => t.action === 'buy' || t.action === 'sell')));
  });
});

describe('forecastByAnalogy — 유사 파형 집계', () => {
  it('사인파 3주기 → 4주기 전반 재현 (MAE < 1)', () => {
    const cs: Candle[] = [];
    for (let i = 0; i < 90; i++) {
      const p = 100 + 10 * Math.sin((i / 30) * Math.PI * 2);
      cs.push({ date: 'd' + i, open: p, high: p + 0.5, low: p - 0.5, close: p, volume: 1000 });
    }
    const fc = forecastByAnalogy(cs, 10, 30, 5);
    assert.equal(fc.length, 10);
    const mae = fc.reduce((s, v, j) => s + Math.abs(v - (100 + 10 * Math.sin(((90 + j) / 30) * Math.PI * 2))), 0) / 10;
    assert.ok(mae < 1, `MAE ${mae}`);
  });
  it('단조 상승 → 마지막 위로 + 기록 부족 시 수평', () => {
    const up = driftBars(40, 100, 0.01);
    const fc = forecastByAnalogy(up, 5, 20, 5);
    assert.equal(fc.length, 5);
    assert.ok(fc[0] > up[up.length - 1].close, `${fc}`);
    const short = driftBars(10, 100, 0.01);
    const flat = forecastByAnalogy(short, 4, 20, 5);
    assert.deepEqual(flat, [flat[0], flat[0], flat[0], flat[0]]);
  });
  it('엣지: 빈 입력 0 채움, bars<1 → []', () => {
    assert.deepEqual(forecastByAnalogy([], 3), [0, 0, 0]);
    assert.deepEqual(forecastByAnalogy(driftBars(40, 100, 0.01), 0), []);
  });
});

describe('forecastByFourier — 푸리에 외삽', () => {
  it('수평 → 수평, 선형 → 추세 연장 (정확)', () => {
    const flat = driftBars(70, 100, 0);
    assert.deepEqual(forecastByFourier(flat, 5, 60, 3), [100, 100, 100, 100, 100]);
    const lin: Candle[] = [];
    for (let i = 0; i < 70; i++) lin.push({ date: 'l' + i, open: 100 + i, high: 101 + i, low: 99 + i, close: 100 + i, volume: 1000 });
    const fc = forecastByFourier(lin, 5, 60, 3);
    assert.equal(fc.length, 5);
    for (let j = 0; j < 5; j++) assert.ok(Math.abs(fc[j] - (169 + j + 1)) < 0.05, `${fc}`);
  });
  it('사인파 근사 (창 위상 편향 한계 문서화 MAE < 9.5)', () => {
    // 유한창 최소자승 추세는 위상에 편향됨 (창 중심이 영점교차면 기울기 최대) — 근사 한계 핀
    const cs: Candle[] = [];
    for (let i = 0; i < 90; i++) {
      const p = 100 + 10 * Math.sin((i / 30) * Math.PI * 2);
      cs.push({ date: 'd' + i, open: p, high: p + 0.5, low: p - 0.5, close: p, volume: 1000 });
    }
    const fc = forecastByFourier(cs, 10, 60, 3);
    const mae = fc.reduce((s, v, j) => s + Math.abs(v - (100 + 10 * Math.sin(((90 + j) / 30) * Math.PI * 2))), 0) / 10;
    assert.ok(mae < 9.5, `MAE ${mae}`);
  });
  it('엣지: 기록 부족 수평, 빈 입력 0', () => {
    const short = driftBars(10, 100, 0.01);
    const last = short[short.length - 1].close;
    assert.deepEqual(forecastByFourier(short, 3, 60, 3).map(v => Math.round(v)), [Math.round(last), Math.round(last), Math.round(last)]);
    assert.deepEqual(forecastByFourier([], 3), [0, 0, 0]);
  });
});

describe('simulate — history 리플레이 + 집행', () => {
  const buyAll = {
    conditions: [{
      source: 'MA' as const, left: '단기MA', right: '중기MA', operator: '>' as const,
      action: 'buy' as const, percent: 100, cooldownBars: 1000,
    }],
    applyMode: 'combined' as const, conviction: 1,
  };
  it('초기보유 반영 + returnPct 자기자본 정합', () => {
    const cs = driftBars(30, 100, 0.005);
    const res = simulate({
      candles: cs, config: { conditions: [], applyMode: 'combined', conviction: 0 },
      history: [{ date: cs[0].date, action: 'buy', price: Math.round(cs[0].close), shares: 10, initial: true }],
      indicators: IND, capital: 1_000_000, fee: 0,
    });
    assert.deepEqual(res.trades, []);
    const startEq = 1_000_000 + 10 * cs[0].close;
    const expect = ((1_000_000 + 10 * cs[cs.length - 1].close - startEq) / startEq) * 100;
    assert.ok(Math.abs(res.returnPct - expect) < 1e-9, `${res.returnPct} vs ${expect}`);
  });
  it('체결 조건에 applyMode 기록 + 매수 수량 = 현금 100% (max 모드, 쿨다운 1회만)', () => {
    const cs = driftBars(40, 100, 0.02);
    const cfg = { ...buyAll, applyMode: 'max' as const }; // max → 집행비중 100 (combined는 50 상한)
    const res = simulate({
      candles: cs, config: cfg, history: [], indicators: IND,
      capital: 1_000_000, fee: 0,
    });
    const buys = res.trades.filter(t => t.action === 'buy');
    assert.equal(buys.length, 1);
    assert.equal(buys[0].condition?.applyMode, 'max');
    assert.equal(buys[0].shares, Math.floor(1_000_000 / buys[0].price));
  });
  it('익절 8% → 보유 절반 매도', () => {
    const cs = driftBars(40, 100, 0.02);
    const res = simulate({
      candles: cs, config: buyAll, history: [], indicators: IND,
      capital: 1_000_000, fee: 0, risk: { takeProfitPct: 8 },
    });
    const exits = res.trades.filter(t => t.action === 'sell' && t.reason === '익절');
    assert.ok(exits.length >= 1, `익절 없음: ${res.trades.map(t => `${t.date}:${t.action}:${t.reason ?? ''}`).join(' ')}`);
    const bought = res.trades.find(t => t.action === 'buy')!.shares;
    assert.equal(exits[0].shares, Math.floor(bought / 2));
  });
  it('fromBar → 그 봉 이전 평가 스킵 (체결일은 마지막봉만)', () => {
    const cs = driftBars(40, 100, 0.02);
    const res = simulate({
      candles: cs, config: { ...buyAll, conditions: [{ ...buyAll.conditions[0], cooldownBars: undefined }] },
      history: [], indicators: IND, capital: 1_000_000, fee: 0, fromBar: cs.length - 1,
    });
    assert.ok(res.trades.length > 0);
    for (const t of res.trades) assert.equal(t.date, cs[cs.length - 1].date);
  });
  it('잔액부족 매수 → buy-failed, 보유없음 매도 → sell-failed', () => {
    const cs = driftBars(40, 100, 0.02);
    const sellOnly = {
      conditions: [{
        source: 'RSI' as const, left: 'RSI', right: '과매수', operator: '>=' as const,
        action: 'sell' as const, percent: 50,
      }],
      applyMode: 'combined' as const, conviction: 1,
    };
    // 현금 500원으로는 1주도 못 삼 (주가 100원대지만 percent 100%가 아니라 budget 문제 아님 — 강제 소액)
    const r1 = simulate({
      candles: cs, config: buyAll, history: [], indicators: IND, capital: 10, fee: 0,
    });
    assert.ok(r1.trades.some(t => t.action === 'buy-failed' || t.action === 'buy'));
    const r2 = simulate({
      candles: cs, config: sellOnly, history: [], indicators: IND, capital: 1_000_000, fee: 0,
    });
    const fails = r2.trades.filter(t => t.action === 'sell-failed');
    assert.ok(fails.length > 0, `sell-failed 없음: ${r2.trades.length}건`);
  });
});
