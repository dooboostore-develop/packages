import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import candleFile from '../datas/candle.json';
import { TradingSimulator } from '../src/stock/TradingSimulator';

const C = TradingSimulator;
const mkCandles = (closes: number[]) =>
  closes.map((close, i) => ({ date: `d${i}`, open: close, high: close, low: close, close, volume: 1000 }));
const cfg = (conditions: C.TradeCondition[], applyMode: C.AutoTradeResult['applyMode'] = 'combined'): C.AutoTradeResult =>
  ({ conditions, applyMode });

describe('TradingSimulator.simulate', () => {
  it('상승장에서 단기MA>중기MA 매수 — 현금의 percent만큼 체결', () => {
    const candles = mkCandles([10, 11, 12, 13, 14, 15, 16, 17]);
    const r = C.simulate({
      candles,
      config: cfg([{ source: 'MA', left: '단기MA', right: '중기MA', operator: '>', action: 'buy', percent: 50 }]),
      history: [],
      capital: 10000,
      indicators: { macdFast: 12, macdSlow: 26, macdSignal: 9, rsiPeriod: 14, rsiOb: 70, rsiOs: 30, maShort: 2, maMid: 3, maLong: 5, maExponential: false },
    });
    assert.ok(r.trades.length > 0);
    assert.ok(r.trades.every(t => t.action === 'buy' && t.shares >= 1));
  });
  it('자본 0이면 buy-failed(잔액부족)', () => {
    const candles = mkCandles([10, 11, 12, 13, 14, 15]);
    const r = C.simulate({
      candles,
      config: cfg([{ source: 'MA', left: '단기MA', right: '중기MA', operator: '>', action: 'buy', percent: 100 }]),
      history: [],
      capital: 0,
      indicators: { macdFast: 12, macdSlow: 26, macdSignal: 9, rsiPeriod: 14, rsiOb: 70, rsiOs: 30, maShort: 2, maMid: 3, maLong: 5, maExponential: false },
    });
    assert.ok(r.trades.length > 0);
    assert.ok(r.trades.every(t => t.action === 'buy-failed' && t.reason === '잔액부족'));
  });
  it('보유 없이 매도 조건이면 sell-failed(보유없음)', () => {
    const candles = mkCandles([15, 14, 13, 12, 11, 10]);
    const r = C.simulate({
      candles,
      config: cfg([{ source: 'MA', left: '단기MA', right: '중기MA', operator: '<', action: 'sell', percent: 100 }]),
      history: [],
      capital: 10000,
      indicators: { macdFast: 12, macdSlow: 26, macdSignal: 9, rsiPeriod: 14, rsiOb: 70, rsiOs: 30, maShort: 2, maMid: 3, maLong: 5, maExponential: false },
    });
    assert.ok(r.trades.length > 0);
    assert.ok(r.trades.every(t => t.action === 'sell-failed' && t.reason === '보유없음'));
  });
  it('applyMode=max — 최대 percent 조건만 집행', () => {
    const candles = mkCandles([10, 11, 12, 13, 14, 15]);
    const ind = { macdFast: 12, macdSlow: 26, macdSignal: 9, rsiPeriod: 14, rsiOb: 70, rsiOs: 30, maShort: 2, maMid: 3, maLong: 5, maExponential: false };
    const conds: C.TradeCondition[] = [
      { source: 'MA', left: '단기MA', right: '중기MA', operator: '>', action: 'buy', percent: 10 },
      { source: 'MA', left: '단기MA', right: '중기MA', operator: '>', action: 'buy', percent: 50 },
    ];
    const r = C.simulate({ candles, config: cfg(conds, 'max'), history: [], capital: 100000, indicators: ind });
    // 첫 체결 수량 = 현금의 50% 기준 (10% 조건은 무시)
    const first = r.trades.find(t => t.action === 'buy')!;
    assert.equal(first.shares, Math.floor(100000 * 0.5 / first.price));
  });
  it('initial history — 초기보유는 현금 이동 없이 보유 가산 + noTradeBars를 막지 않음', () => {
    const candles = mkCandles([10, 11, 12, 13, 14, 15]);
    const ind = { macdFast: 12, macdSlow: 26, macdSignal: 9, rsiPeriod: 14, rsiOb: 70, rsiOs: 30, maShort: 2, maMid: 3, maLong: 5, maExponential: false };
    // 초기보유 100주 + 매도 조건(noTradeBars=5) — 초기보유 때문에 막히면 안 됨
    const r = C.simulate({
      candles,
      config: cfg([{ source: 'MA', left: '단기MA', right: '중기MA', operator: '>', action: 'sell', percent: 50, noTradeBars: 5 }]),
      history: [{ date: 'd0', action: 'buy', price: 10, shares: 100, initial: true }],
      capital: 0, indicators: ind,
    });
    const sells = r.trades.filter(t => t.action === 'sell');
    assert.ok(sells.length > 0, '초기보유가 noTradeBars를 막음');
    assert.ok(sells.reduce((s, t) => s + t.shares, 0) <= 100, '초과 매도');
  });
  it('체결건에 조건 스냅샷 포함 (source/percent 일치)', () => {
    const candles = mkCandles([10, 11, 12, 13, 14, 15]);
    const ind = { macdFast: 12, macdSlow: 26, macdSignal: 9, rsiPeriod: 14, rsiOb: 70, rsiOs: 30, maShort: 2, maMid: 3, maLong: 5, maExponential: false };
    const r = C.simulate({
      candles,
      config: cfg([{ source: 'MA', left: '단기MA', right: '중기MA', operator: '>', action: 'buy', percent: 50 }]),
      history: [], capital: 1e9, indicators: ind,
    });
    const buys = r.trades.filter(t => t.action === 'buy');
    assert.ok(buys.length > 0);
    assert.ok(buys.every(t => t.condition?.source === 'MA' && t.condition?.percent === 50));
  });
  it('체결건에 candidates(발동 시점 전체 조건) 포함', () => {
    const candles = mkCandles([10, 11, 12, 13, 14, 15]);
    const ind = { macdFast: 12, macdSlow: 26, macdSignal: 9, rsiPeriod: 14, rsiOb: 70, rsiOs: 30, maShort: 2, maMid: 3, maLong: 5, maExponential: false };
    const conds: C.TradeCondition[] = [
      { source: 'MA', left: '단기MA', right: '중기MA', operator: '>', action: 'buy', percent: 50 },
      { source: 'MACD', left: 'MACD', right: 'SIGNAL', operator: '>', action: 'buy', percent: 30 },
    ];
    const r = C.simulate({ candles, config: cfg(conds, 'combined'), history: [], capital: 1e9, indicators: ind });
    const buys = r.trades.filter(t => t.action === 'buy');
    assert.ok(buys.length > 0);
    assert.ok(buys.every(t => (t.candidates?.length ?? 0) === 2), '전체 조건 미첨부');
    assert.ok(buys.every(t => t.candidates!.some(c => c.source === t.condition?.source && c.percent === t.condition?.percent)), '처리 조건이 후보에 없음');
  });
  it('전 모드 — 매수+매도 동시 발동해도 봉당 최대 1건', () => {
    const candles = mkCandles([10, 11, 12, 13, 14, 15, 16, 17]);
    const ind = { macdFast: 12, macdSlow: 26, macdSignal: 9, rsiPeriod: 14, rsiOb: 70, rsiOs: 30, maShort: 2, maMid: 3, maLong: 5, maExponential: false };
    const conds: C.TradeCondition[] = [
      { source: 'MA', left: '단기MA', right: '중기MA', operator: '>', action: 'buy', percent: 50 },
      { source: 'MACD', left: 'MACD', right: 'SIGNAL', operator: '>', action: 'buy', percent: 50 },
      { source: 'RSI', left: 'RSI', right: '10', operator: '>', action: 'sell', percent: 50 },
    ];
    for (const mode of ['min', 'max', 'combined'] as const) {
      const r = C.simulate({ candles, config: cfg(conds, mode), history: [], capital: 1e9, indicators: ind });
      const byDate = new Map<string, number>();
      for (const t of r.trades) {
        if (t.action !== 'buy' && t.action !== 'sell') continue;
        byDate.set(t.date, (byDate.get(t.date) ?? 0) + 1);
      }
      assert.ok(r.trades.length > 0, `${mode} 체결 0건`);
      assert.ok([...byDate.values()].every(v => v <= 1), `${mode} 모드에서 복수 체결`);
    }
  });
  it('combined — 우세 측 합산 비중으로 1건 집행', () => {
    const candles = mkCandles([10, 11, 12, 13, 14, 15]);
    const ind = { macdFast: 12, macdSlow: 26, macdSignal: 9, rsiPeriod: 14, rsiOb: 70, rsiOs: 30, maShort: 2, maMid: 3, maLong: 5, maExponential: false };
    const conds: C.TradeCondition[] = [
      { source: 'MA', left: '단기MA', right: '중기MA', operator: '>', action: 'buy', percent: 20 },
      { source: 'MACD', left: 'MACD', right: 'SIGNAL', operator: '>', action: 'buy', percent: 10 },
    ];
    const r = C.simulate({ candles, config: cfg(conds, 'combined'), history: [], capital: 1e9, indicators: ind });
    const buys = r.trades.filter(t => t.action === 'buy');
    assert.ok(buys.length > 0);
    // 집행 비중은 발동 측 합산 (10 단독 또는 20+10 합산 30)
    assert.ok(buys.every(t => [10, 20, 30].includes(t.condition?.percent ?? 0)), `범위 밖 비중: ${buys.map(t => t.condition?.percent)}`);
    assert.ok(buys.some(t => t.condition?.percent === 30), '합산 30% 집행 없음');
  });
  it('cooldownBars — 발동 후 N봉 스킵', () => {
    const candles = mkCandles([10, 11, 12, 13, 14, 15, 16, 17]);
    const ind = { macdFast: 12, macdSlow: 26, macdSignal: 9, rsiPeriod: 14, rsiOb: 70, rsiOs: 30, maShort: 2, maMid: 3, maLong: 5, maExponential: false };
    const noCd = C.simulate({
      candles, config: cfg([{ source: 'MA', left: '단기MA', right: '중기MA', operator: '>', action: 'buy', percent: 100 }]),
      history: [], capital: 1e9, indicators: ind,
    });
    const withCd = C.simulate({
      candles, config: cfg([{ source: 'MA', left: '단기MA', right: '중기MA', operator: '>', action: 'buy', percent: 100, cooldownBars: 100 }]),
      history: [], capital: 1e9, indicators: ind,
    });
    assert.ok(withCd.trades.filter(t => t.action === 'buy').length <= noCd.trades.filter(t => t.action === 'buy').length);
    assert.equal(withCd.trades.filter(t => t.action === 'buy').length, 1);
  });
  it('returnPct — 윈도우 수익률 반환', () => {
    const candles = mkCandles([10, 11, 12, 13, 14, 15]);
    const ind = { macdFast: 12, macdSlow: 26, macdSignal: 9, rsiPeriod: 14, rsiOb: 70, rsiOs: 30, maShort: 2, maMid: 3, maLong: 5, maExponential: false };
    const flat = C.simulate({ candles, config: cfg([]), history: [], capital: 10000, indicators: ind });
    assert.equal(flat.trades.length, 0);
    assert.equal(flat.returnPct, 0);
    const r = C.simulate({
      candles,
      config: cfg([{ source: 'MA', left: '단기MA', right: '중기MA', operator: '>', action: 'buy', percent: 100 }]),
      history: [], capital: 10000, fee: 0, indicators: ind,
    });
    assert.ok(r.trades.some(t => t.action === 'buy'));
    assert.ok(r.returnPct > 0, `returnPct=${r.returnPct}`);
  });
  it('forecast — 등락률 반전 복리 + 댐핑 0.15', () => {
    const candles = mkCandles([10, 11, 12, 13, 14, 15, 16, 17]);
    const f = C.forecast(candles, 3);
    // 기록 8봉(<21) → edge=0 → k=0.15. 미반올림 반전누적 15.9375, 14.875, 13.8125 → base 17 기준
    assert.deepEqual(f, [16.84, 16.68, 16.52]);
  });
  it('forecast — 확신 클 때 진폭 확대, 부호 불변', () => {
    // 21봉 이상 급락 → edge>0 → k>0.15, 방향(상승 예측)은 유지
    const data = mkCandles(Array.from({ length: 30 }, (_, i) => 40 - i));
    const f = C.forecast(data, 5);
    assert.equal(f.length, 5);
    assert.ok(f.every(Number.isFinite));
    assert.ok(f[f.length - 1] > data[data.length - 1].close, '반전 상승 방향 깨짐');
    const k015 = (() => {
      const closes = data.map(c => c.close);
      const base = closes[closes.length - 1];
      let acc = base;
      for (let i = closes.length - 1; i >= closes.length - 5; i--) acc = acc * (1 - (closes[i] - closes[i - 1]) / closes[i - 1]);
      return base + (acc - base) * 0.15;
    })();
    assert.ok(Math.abs(f[f.length - 1] - data[data.length - 1].close) >= Math.abs(k015 - data[data.length - 1].close) - 0.02, '확신 가산 없음');
  });
  it('directionProbability — 급등 후 낮고 급락 후 높음 (평균회귀)', () => {
    const up = C.directionProbability(mkCandles(Array.from({ length: 30 }, (_, i) => 10 + i)));
    const dn = C.directionProbability(mkCandles(Array.from({ length: 30 }, (_, i) => 40 - i)));
    assert.ok(up >= 0 && up <= 1 && dn >= 0 && dn <= 1);
    assert.ok(up < 0.5, `급등 후 p=${up}`);
    assert.ok(dn > 0.5, `급락 후 p=${dn}`);
  });
  it('directionProbability — 30봉 미만이면 0.5', () => {
    assert.equal(C.directionProbability([]), 0.5);
    assert.equal(C.directionProbability(mkCandles([10, 11, 12])), 0.5);
    assert.equal(C.directionProbability(mkCandles(Array.from({ length: 25 }, (_, i) => 10 + i))), 0.5);
  });
  it('forecast — 빈 입력·미형성 시 []', () => {
    assert.deepEqual(C.forecast([], 10), []);
    assert.deepEqual(C.forecast(mkCandles([10]), 10), []);
  });
  it('dust-block — 예산이 총자산 1% 미만이면 소액제외 (매수 없음)', () => {
    // 현금 100원, 100원짜리 1주 보유 → 총자산 200원. 50% 예산 50원 < 1%(2원)? No → 정상매수.
    // 현금 1원 → 예산 0.5원 < 2원 → 소액제외.
    const ind = { macdFast: 12, macdSlow: 26, macdSignal: 9, rsiPeriod: 14, rsiOb: 70, rsiOs: 30, maShort: 2, maMid: 3, maLong: 5, maExponential: false };
    const cond = (p: number): C.TradeCondition => ({ source: 'MA', left: '단기MA', right: '중기MA', operator: '>', action: 'buy', percent: p });
    const candles = mkCandles([100, 101, 102, 103, 104]);
    const r = C.simulate({
      candles, config: { conditions: [cond(50)], applyMode: 'min', conviction: 0.5, upProbability: 0.5 },
      history: [{ date: 'd0', action: 'buy', price: 100, shares: 1, initial: true }],
      capital: 1, fee: 0, indicators: ind,
    });
    assert.ok(r.trades.every(t => t.action !== 'buy'), '먼지매수 발생');
    assert.ok(r.trades.some(t => t.reason === '소액제외'), '소액제외 기록 없음');
  });
  it('spacing — 기본 무거래봉 4 (연타 방지)', () => {
    const ind = { macdFast: 12, macdSlow: 26, macdSignal: 9, rsiPeriod: 14, rsiOb: 70, rsiOs: 30, maShort: 2, maMid: 3, maLong: 5, maExponential: false };
    const data = mkCandles(Array.from({ length: 30 }, (_, i) => 10 + i));
    const r = C.findBestConfig(data, { strategyRate: 0.5, marketRate: 0.5, indicators: ind });
    assert.ok(r.conditions.every(c => (c.noTradeBars ?? 0) >= 4), `nt=${r.conditions.map(c => c.noTradeBars)}`);
  });
  it('risk — 평단 대비 -8%면 전량 스탑로스', () => {
    const candles = mkCandles([100, 100, 100, 100, 100, 90, 80]);
    const ind = { macdFast: 12, macdSlow: 26, macdSignal: 9, rsiPeriod: 14, rsiOb: 70, rsiOs: 30, maShort: 2, maMid: 3, maLong: 5, maExponential: false };
    const r = C.simulate({
      candles, config: cfg([]), history: [{ date: 'd0', action: 'buy', price: 100, shares: 10, initial: true }],
      capital: 0, fee: 0, risk: { stopLossPct: 8 }, indicators: ind,
    });
    const stops = r.trades.filter(t => t.reason === '스탑로스');
    assert.ok(stops.length > 0, '스탑로스 없음');
    assert.ok(stops.every(t => t.action === 'sell'));
  });
  it('risk — 평단 대비 +15%면 절반 익절', () => {
    const candles = mkCandles([100, 100, 100, 100, 100, 110, 120]);
    const ind = { macdFast: 12, macdSlow: 26, macdSignal: 9, rsiPeriod: 14, rsiOb: 70, rsiOs: 30, maShort: 2, maMid: 3, maLong: 5, maExponential: false };
    const r = C.simulate({
      candles, config: cfg([]), history: [{ date: 'd0', action: 'buy', price: 100, shares: 10, initial: true }],
      capital: 0, fee: 0, risk: { takeProfitPct: 15 }, indicators: ind,
    });
    const takes = r.trades.filter(t => t.reason === '익절');
    assert.ok(takes.length > 0, '익절 없음');
    assert.equal(takes[0].shares, 5);
  });
});

describe('TradingSimulator.findBestConfig (strategyRate)', () => {
  const ind: C.IndicatorParams = {
    macdFast: 12, macdSlow: 26, macdSignal: 9,
    rsiPeriod: 14, rsiOb: 70, rsiOs: 30,
    maShort: 2, maMid: 3, maLong: 5, maExponential: false,
  };
  // 가파른 상승 — 마지막 봉 상승 모멘텀 보장 (물리량 유의미한 30봉)
  const rising = mkCandles(Array.from({ length: 30 }, (_, i) => 10 + i * 0.8 + (i * i) * 0.01));
  // 가파른 하락
  const falling = mkCandles(Array.from({ length: 30 }, (_, i) => 34 - i * 0.8 - (i * i) * 0.01));

  it('상승장 매수 비중: 불타기(s=1) > 균형(0.5) > 물타기(s=0)', () => {
    const pct = (s: number) => {
      const c = C.findBestConfig(rising, { strategyRate: s, marketRate: 0.5, indicators: ind });
      const buy = c.conditions.find(x => x.action === 'buy');
      assert.ok(buy, `s=${s} 매수 조건 없음`);
      return buy.percent;
    };
    assert.ok(pct(1) >= pct(0.5) && pct(0.5) >= pct(0), `${pct(0)}, ${pct(0.5)}, ${pct(1)}`);
    assert.ok(pct(1) > pct(0), '양극단 차이 없음');
  });
  it('하락장 방향: 불타기(s=1) 매도 vs 물타기(s=0) 눌림 매수', () => {
    const acts = (s: number) => {
      const c = C.findBestConfig(falling, { strategyRate: s, marketRate: 0.5, indicators: ind });
      return c.conditions.map(x => x.action);
    };
    assert.ok(acts(1).includes('sell'), 's=1 매도 없음');
    assert.ok(acts(0).includes('buy'), 's=0 눌림 매수 없음');
  });
  it('하락장 매도 비중: 온건한 하락에서 고rate 매도 비중 단조 비감소', () => {
    const mild = mkCandles([20, 19.8, 19.6, 19.5, 19.4, 19.3, 19.2, 19.1, 19, 18.9]);
    const pcts: number[] = [];
    for (let k = 0; k <= 10; k++) {
      const s = k / 10;
      const c = C.findBestConfig(mild, { strategyRate: s, marketRate: 0.5, indicators: ind });
      const sell = c.conditions.find(x => x.action === 'sell');
      if (sell) pcts.push(sell.percent);
    }
    assert.ok(pcts.length >= 2, '매도 표본 부족');
    assert.ok(pcts.every((v, i) => i === 0 || v >= pcts[i - 1]), `비단조: ${pcts.join(',')}`);
  });
  it('하락 신호 방향은 rate에 단조 — buy…buy sell…sell 형태 (분기점 없음)', () => {
    const mild = mkCandles([20, 19.8, 19.6, 19.5, 19.4, 19.3, 19.2, 19.1, 19, 18.9]);
    const seq: string[] = [];
    for (let k = 0; k <= 10; k++) {
      const s = k / 10;
      const c = C.findBestConfig(mild, { strategyRate: s, marketRate: 0.5, indicators: ind });
      const down = c.conditions.filter(x => x.left === '단기MA' || x.left === 'MACD');
      assert.ok(down.length > 0, `s=${s} 하락 조건 없음`);
      seq.push(down[0].action);
    }
    assert.ok(/^buy*(sell)*$/.test(seq.join('')), `비단조: ${seq.join(',')}`);
  });
  it('findBestConfig — upProbability 0~1 + conviction 범위', () => {
    const data = mkCandles(Array.from({ length: 30 }, (_, i) => 10 + i * 0.8 + (i * i) * 0.01));
    const r = C.findBestConfig(data, { strategyRate: 0.5, marketRate: 0.5, indicators: ind });
    assert.ok(r.upProbability >= 0 && r.upProbability <= 1, `upP=${r.upProbability}`);
    assert.ok(r.conviction >= 0 && r.conviction <= 1, `conv=${r.conviction}`);
    assert.ok(r.upProbability < 0.5, `급등 후 상승확률 역전: ${r.upProbability}`);
  });
  it('edge 게이트 — minEdge=1이면 관망, 0이면 기존 동작', () => {
    const data = mkCandles(Array.from({ length: 30 }, (_, i) => 10 + i * 0.8 + (i * i) * 0.01));
    const open = C.findBestConfig(data, { strategyRate: 0.5, marketRate: 0.5, indicators: ind, tuning: { minEdge: 0 } });
    const shut = C.findBestConfig(data, { strategyRate: 0.5, marketRate: 0.5, indicators: ind, tuning: { minEdge: 1 } });
    assert.ok(open.conditions.length > 0, 'minEdge=0인데 조건 없음');
    assert.equal(shut.conditions.length, 0, 'minEdge=1인데 조건 있음');
  });
  it('시장상황: 악재(m=0) → 보수적(상한20·min모드·긴쿨다운), 호재(m=1) → 적극적(max모드)', () => {
    const data = mkCandles(Array.from({ length: 30 }, (_, i) => 10 + i * 0.8 + (i * i) * 0.01));
    const bad = C.findBestConfig(data, { strategyRate: 0.5, marketRate: 0, indicators: ind });
    const good = C.findBestConfig(data, { strategyRate: 0.5, marketRate: 1, indicators: ind });
    assert.equal(bad.applyMode, 'min');
    assert.equal(good.applyMode, 'max');
    assert.ok(bad.conditions.every(c => c.percent <= 20), '보수 상한 초과');
    assert.ok(good.conditions.some(c => c.percent > 20), '적극 확대 없음');
    const badCd = Math.min(...bad.conditions.map(c => c.cooldownBars ?? 0));
    const goodCd = Math.min(...good.conditions.map(c => c.cooldownBars ?? 0));
    assert.ok(badCd >= goodCd, `쿨다운 역전: ${badCd} vs ${goodCd}`);
  });
  it('invertActions — 행위만 뒤집고 %는 유지', () => {
    const data = mkCandles(Array.from({ length: 30 }, (_, i) => 10 + i * 0.8 + (i * i) * 0.01));
    const normal = C.findBestConfig(data, { strategyRate: 0.5, marketRate: 0.5, indicators: ind });
    const inverted = C.findBestConfig(data, { strategyRate: 0.5, marketRate: 0.5, indicators: ind, invertActions: true });
    assert.ok(normal.conditions.length > 0 && inverted.conditions.length === normal.conditions.length);
    assert.ok(normal.conditions.every((c, i) => inverted.conditions[i].action !== c.action), '행위 미반전');
    assert.ok(normal.conditions.every((c, i) => inverted.conditions[i].percent === c.percent), '% 변경됨');
  });
});

describe('TradingSimulator.simulate (real candles: candle.json)', () => {
  // 최신→과거 역순이므로 뒤집어서 시간순으로
  const raw = ((candleFile as any).result.candles as any[]).filter(c => c && c.close > 0);
  const candles = [...raw].reverse().map(c => ({
    date: String(c.dt).slice(0, 16),
    open: Number(c.open), high: Number(c.high), low: Number(c.low),
    close: Number(c.close), volume: Number(c.volume),
  }));
  const indicators: C.IndicatorParams = {
    macdFast: 12, macdSlow: 26, macdSignal: 9,
    rsiPeriod: 14, rsiOb: 70, rsiOs: 30,
    maShort: 5, maMid: 10, maLong: 60, maExponential: false,
  };
  const config = C.findBestConfig(candles, { strategyRate: 0.5, marketRate: 0.5, indicators });

  it('실데이터 360봉 완주 — 매매 발생 + 현금/보유 음수 없음', () => {
    assert.ok(candles.length > 300);
    const capital = 10_000_000;
    const fee = 0.00015;
    const r = C.simulate({ candles, config, history: [], capital, fee, indicators });
    const buys = r.trades.filter(t => t.action === 'buy');
    assert.ok(buys.length > 0, '매수 0건');
    // 원장 재생 — 현금·보유 음수 금지, 날짜 순서 보장
    let cash = capital;
    let shares = 0;
    let prevDate = '';
    for (const t of r.trades) {
      assert.ok(t.date >= prevDate, `날짜 역행: ${prevDate} → ${t.date}`);
      prevDate = t.date;
      if (t.action === 'buy') {
        cash -= t.shares * t.price * (1 + fee);
        shares += t.shares;
      } else if (t.action === 'sell') {
        cash += t.shares * t.price * (1 - fee);
        shares -= t.shares;
      }
      assert.ok(cash >= -1e-6, `현금 음수: ${cash}`);
      assert.ok(shares >= 0, `보유 음수: ${shares}`);
    }
  });

  it('하락 반전 데이터(미러) — 매도 조건 생성 + 매도 체결', () => {
    // 종가 미러 = 하락장 — 방향 대칭성 확인 (게이트 정책과 분리: minEdge=0)
    const first = candles[0].close;
    const mirrored = [...candles].reverse().map((c, i) => ({ ...c, date: `m${i}`, close: first - (c.close - first) }));
    const mc = C.findBestConfig(mirrored, { strategyRate: 0.5, marketRate: 0.5, indicators, tuning: { minEdge: 0 } });
    assert.ok(mc.conditions.some(c => c.action === 'sell'), '매도 조건 0건');
    const r = C.simulate({
      candles: mirrored, config: mc, history: [{ date: 'm0', action: 'buy', price: mirrored[0].close, shares: 100 }],
      capital: 10_000_000, fee: 0.00015, indicators,
    });
    assert.ok(r.trades.some(t => t.action === 'sell'), '매도 체결 0건');
  });
});
