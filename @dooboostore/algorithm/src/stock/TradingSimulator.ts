/** 순수 트레이딩 시뮬레이션 엔진 — DOM·페이지 상태 무의존. 모든 입력은 인자로 받는다. */

export type ResolveMode = 'minFirst' | 'maxFirst' | 'all';
export const RESOLVE_MODES: ResolveMode[] = ['minFirst', 'maxFirst', 'all'];
export const EXIT_RESOLVE_MODES: ResolveMode[] = ['minFirst', 'maxFirst', 'all'];
export const isResolveMode = (v: string | null): v is ResolveMode => v === 'minFirst' || v === 'maxFirst' || v === 'all';

/**
 * 복리 합성: p1% 차감 후 잔량에서 p2% 차감... 순차 누적과 동등한 실효 %를 1건으로 압축.
 * 예: [10, 20] → 28 (단순합 30이 아님)
 */
const LBL_CANDLE: Record<string, string> = { any: '무관', bull: '양봉', bear: '음봉' };
const LBL_VOL: Record<string, string> = { any: '무관', higher: '증가', lower: '감소' };
const LBL_ALIGN: Record<string, string> = { any: '무관', aligned: '정배열', reverse: '역배열', largerAbove: '큰MA 위', largerBelow: '큰MA 아래', smallerAbove: '작은MA 위', smallerBelow: '작은MA 아래' };

/** MA 멤버 조건 1건의 전체 스펙 한 줄 (팝업 구성 섹션용) */
export function maSpecLine(period: number, sig: 'golden' | 'dead', s: any, trioParts: string[]): string {
  const dir = s.action === 'buy' ? '매수' : '매도';
  const pct = Math.max(1, Math.min(100, s.percent));
  const base = `MA${period} ${sig === 'golden' ? '골든' : '데드'} ${dir} ${pct}%`;
  const filt = [`캔들 ${LBL_CANDLE[s.candleFilter] ?? s.candleFilter}`, `거래량 ${LBL_VOL[s.volumeFilter] ?? s.volumeFilter}`, `배열 ${LBL_ALIGN[s.alignment] ?? s.alignment}`, `유지${s.consecutive}봉`];
  return `${base} · ${[...filt, ...trioParts].join(' · ')}`;
}

/** 실현 멤버 조건 1건의 전체 스펙 한 줄 (팝업 구성 섹션용) */
export function exitSpecLine(basisLabel: string, ex: any): string {
  return `청산 ${basisLabel} ${ex.percent}% · 매도 ${ex.sellPercent}% · 캔들 ${LBL_CANDLE[ex.candle] ?? ex.candle} · 거래량 ${LBL_VOL[ex.volume] ?? ex.volume} · 스킵 ${ex.skip}회`;
}

export function combinePct(pcts: number[]): number {
  let remain = 1;
  for (const p of pcts) {
    const c = Math.max(0, Math.min(100, p)) / 100;
    remain *= (1 - c);
  }
  return Math.min(100, Math.round((1 - remain) * 100 * 1e6) / 1e6);
}

/** 종가 배열 → 단순이동평균 (미형성 구간은 null, 전체 구간 기준).
 *  순수 레이어 소유. 차트(StockChart)는 컴포넌트 패키지 분리를 위해 동일 수학식의 자립 복사본을 둔다. */
export function computeSmaSeries(closes: number[], period: number): (number | null)[] {
  const p = Math.max(2, Math.round(period) || 20);
  const n = closes.length;
  const out = new Array<number | null>(n).fill(null);
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += closes[i];
    if (i >= p) sum -= closes[i - p];
    if (i >= p - 1) out[i] = sum / p;
  }
  return out;
}

/** 낙폭 회피 계수 λ 0~1 (기본 0.5). 0=수익만, 1=최대 방어. score = profit − λ·MDD */
export const DEFAULT_RISK_AVERSION = 0.5;

/**
 * 예상 추세 지수 0~1: 0 = 하락 100%, 0.5 = 중립, 1 = 상승 100%.
 * UI 선택은 프리셋 매핑(모름/횡보=0.5, 상승=1, 하락=0), 향후 자동 연산값 주입용.
 */
export const TREND_NEUTRAL = 0.5;
export const clampTrend = (s: number): number =>
  Number.isFinite(s) ? Math.max(0, Math.min(1, s)) : TREND_NEUTRAL;

export interface SimCandle { date: string; open: number; high: number; low: number; close: number; volume: number }

export interface CondGroup { type: string; operator: string; value: number }
export interface MaSignal {
  signal: 'golden' | 'dead'; action: 'buy' | 'sell'; percent: number;
  candleFilter: 'any' | 'bull' | 'bear'; volumeFilter: 'any' | 'higher' | 'lower'; consecutive: number;
  alignment: 'any' | 'aligned' | 'reverse' | 'largerAbove' | 'largerBelow' | 'smallerAbove' | 'smallerBelow';
  condTrade: CondGroup; condCandle: CondGroup; condMa: CondGroup;
}
export interface MaConfig { period: number; color: string; pyramiding: { signals: MaSignal[] } }
export interface ExitConfig {
  basis: 'profitRise' | 'profitFall' | 'peakFall' | 'peakRise';
  percent: number; sellPercent: number; skip: number;
  candle: 'any' | 'bull' | 'bear'; volume: 'any' | 'higher' | 'lower';
}
export interface SimTrade {
  idx: number; date: string; price: number; action: 'buy' | 'sell';
  maPeriod: number; percent: number; sharesDelta: number; amount: number; fee: number;
  cashAfter: number; sharesAfter: number; label?: string; profitRate: number | null;
  avgPrice: number; holdingValue: number; conds: string[]; condDetail: string[];
  /** 체결 맥락 — 신호가/체결방식/적용 슬립·체결률 */
  wantedPrice: number; execMode: 'close' | 'nextOpen'; slipPct: number; fillPct: number;
  /** 주문 수량 (체결률 적용 전) */
  wantedShares: number;
}
export interface SimMetrics {
  profit: number; rate: number; maxDrawdown: number; tradeCount: number;
  avgPeriod: number; volatility: number; conflicts: number;
}
export interface BestConfig {
  maConfigs: any[]; exits: any[]; profit: number; metrics: SimMetrics;
  score: number; riskAversion: number; mres: ResolveMode; xres: ResolveMode; trend?: number; conviction?: number;
}
export interface TradeMarker { action: 'buy' | 'sell'; label: string; color: string; position: string }
export interface CrossMarker { label: string; color: string }
export interface SimResult {
  trades: SimTrade[]; tradeAtIdx: Map<number, TradeMarker[]>; crossAtIdx: Map<number, CrossMarker[]>;
  reasons: { idx: number; reason: string }[]; cash: number; shares: number;
  firstPrice: number; lastPrice: number;
}
export interface EngineOptions {
  initialCapital: number; feePercent: number; maMode: ResolveMode; xMode: ResolveMode;
  simFrom?: number; simTo?: number;
  /** 실전 마찰 — 체결 지연 (0=신호봉 종가, 1=다음봉 시가) */
  execDelay?: 0 | 1;
  /** 실전 마찰 — 슬리피지 지수 0~1 (매수+ / 매도−) */
  slippage?: number;
  /** 실전 마찰 — 체결률 지수 0~1 (주문 대비 체결 비율, 결정적 분할) */
  fillRatio?: number;
}

/** 체결 기준가 (신호봉 종가 or 다음봉 시가). null = 체결 불가 (다음봉 없음) */
export function execBaseAt(candles: SimCandle[], i: number, opts: EngineOptions): number | null {
  if ((opts.execDelay ?? 0) === 1) return i + 1 < candles.length ? candles[i + 1].open : null;
  return candles[i].close;
}

/** 슬리피지율·체결률 정규화 (0~1 지수 그대로, 범위만 보정) */
export function slipFillOf(opts: EngineOptions): { slip: number; fill: number } {
  return {
    slip: Math.max(0, Math.min(1, opts.slippage ?? 0)),
    fill: Math.max(0, Math.min(1, opts.fillRatio ?? 1)),
  };
}
export interface CalcOptions extends EngineOptions { requireAll: boolean }
export type SimOptions = CalcOptions;
export interface FindBestOptions extends EngineOptions { trend?: number; riskAversion?: number }

export function condMet(count: number, operator: string, value: number): boolean {
  if (operator === 'any') return true;
  if (operator === '<') return count < value;
  if (operator === '<=') return count <= value;
  if (operator === '=') return Math.abs(count - value) < 0.0001;
  if (operator === '!=') return Math.abs(count - value) >= 0.0001;
  if (operator === '>=') return count >= value;
  if (operator === '>') return count > value;
  return false;
}

export function alignForSignal(sig: string, hasSmaller = true, hasLarger = true): 'any'|'aligned'|'reverse'|'largerAbove'|'largerBelow'|'smallerAbove'|'smallerBelow' {
  const pool: ('any'|'aligned'|'reverse'|'largerAbove'|'largerBelow'|'smallerAbove'|'smallerBelow')[] = ['any'];
  if (sig === 'golden') {
    pool.push('aligned');
    if (hasSmaller) pool.push('smallerAbove');
    if (hasLarger) pool.push('largerBelow');
  } else {
    pool.push('reverse');
    if (hasSmaller) pool.push('smallerAbove', 'smallerBelow');
    if (hasLarger) pool.push('largerAbove');
  }
  if (Math.random() < 0.45) return 'any';
  return pool[1 + Math.floor(Math.random() * (pool.length - 1))];
}

export function sanitizeAlignments(list: any[]): void {
  if (!Array.isArray(list) || !list.length) return;
  const ps = list.map((m: any) => Number(m?.period) || 0);
  const mn = Math.min(...ps), mx = Math.max(...ps);
  for (const m of list) {
    const sigs = m?.pyramiding?.signals;
    if (!Array.isArray(sigs)) continue;
    for (const s of sigs) {
      const a = s.alignment;
      const needS = a === 'smallerAbove' || a === 'smallerBelow';
      const needL = a === 'largerAbove' || a === 'largerBelow';
      if ((needS && !(m.period > mn)) || (needL && !(m.period < mx))) {
        s.alignment = alignForSignal(s.signal, m.period > mn, m.period < mx);
      }
    }
  }
}

export function findBestConfig(candles: SimCandle[], opts: FindBestOptions): BestConfig | null {
  const { initialCapital, feePercent, maMode, xMode } = opts;
  // 낙폭 회피 계수 λ (명시값 우선, 음수 금지, 기본 0.5)
  const riskAversion = Number.isFinite(opts.riskAversion as number)
    ? Math.max(0, Math.min(1, opts.riskAversion as number))
    : DEFAULT_RISK_AVERSION;
  const trend = clampTrend(opts.trend ?? TREND_NEUTRAL);
  // 융합 확신도 = 방향 × 강도. 방향=(trend−0.5)×2, 강도=1/(1+λ) → 적극형+상승=1, 균형형+상승≈0.667, 중립=0
  const conviction = (trend - 0.5) * 2 * (1 / (1 + riskAversion));
  /** 매수확률 = 0.2 + 0.6×trend (0→20%, 0.5→50%, 1→80%). 반대편 탐색 여지 유지 */
  const pickAction = (): 'buy' | 'sell' =>
    Math.random() < 0.2 + 0.6 * trend ? 'buy' : 'sell';
  /** 추세 포지션 크기 (매수/매도 대칭): 매수는 trend 추종, 매도는 반대.
      매수: 1→[30,60], 0.5→[10,50], 0→[5,25] / 매도: 1→[5,25], 0.5→[10,50], 0→[30,60] */
  const trendPctRange = (isBuy: boolean): [number, number] => {
    const t = isBuy ? trend : 1 - trend;
    const k = (t - 0.5) * 2; // -1..1
    const lo = Math.round(k >= 0 ? 10 + 20 * k : 10 + 5 * k);
    const hi = Math.round(k >= 0 ? 50 + 10 * k : 50 + 25 * k);
    return [lo, hi];
  };
  /** 구조 게이트: 완전 확신(|c|===1, 적극형+상승/하락)일 때만 방향 구조 필수 */
  const passTrendGate = (maCfgs: any[], exitCfgs: any[]): boolean => {
    if (conviction !== 1 && conviction !== -1) return true;
    const sigs = maCfgs.flatMap((m: any) => (m?.pyramiding?.signals ?? []) as any[]);
    const hasBuy = sigs.some((s: any) => s.action === 'buy');
    const hasSell = sigs.some((s: any) => s.action === 'sell');
    if (conviction === 1) return hasBuy;
    return hasSell || (Array.isArray(exitCfgs) && exitCfgs.length > 0);
  };
  // MA는 전체 캔들로 계산하고, 매매/평가는 선택 구간(z0~z1)으로만 — 차트 시뮬과 동일 기준
  const cn = candles.length;
  const s0 = opts.simFrom ?? 0;
  const s1 = opts.simTo ?? cn - 1;
  const z0 = cn ? Math.max(0, Math.min(Math.floor(s0), cn - 1)) : 0;
  const z1 = cn ? Math.max(z0, Math.min(Math.floor(s1), cn - 1)) : -1;
  // 최장기 MA 상한: 전체존재 조건 평가 시 최소 절반의 봉이 매매 구간으로 남도록 절반으로 제한 (300개→최대 149)
  const maxPeriodCap = Math.max(20, Math.min(240, Math.floor((cn - 1) / 2)));
  const rand = (n: number) => Math.floor(Math.random() * n);
  const pick = <T>(arr: T[]) => arr[rand(arr.length)];
  const colors = ['#ef4444','#f59e0b','#10b981','#6366f1','#ec4899','#06b6d4','#8b5cf6','#14b8a6'];
  const candleOpts: ('any'|'bull'|'bear')[] = ['any','bull','bear'];
  const volOpts: ('any'|'higher'|'lower')[] = ['any','higher','lower'];
  const tradeConds = ['consecutiveBuy','consecutiveSell','consecutiveSelected'];
  const candleConds = ['consecutiveBullish','consecutiveBearish'];
  const maConds = ['maDeviation','maSlope'];
  const condOps = ['any','<','<=','=','!=','>=','>'] as const;
  const trials = 500; // 1차 가중 랜덤 + 필요시 2차 완화 (hill-climb 포함 총 약 660회 평가)
  let best: any = null;
  let bestProfit = -Infinity;
  let bestClean: any = null;
  let bestCleanProfit = -Infinity;
  const pool: { score: number; maConfigs: any[]; exits: any[] }[] = [];
  // 단일 점수식: score = profit − λ·MDD (λ≥0, 기본 0.5)
  const scoreOf = (m: { profit: number; maxDrawdown: number; tradeCount: number; avgPeriod: number; volatility: number }) =>
    m.profit - m.maxDrawdown * riskAversion;
  const clampN = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  const mutate = (src: { maConfigs: any[]; exits: any[] }): { maConfigs: any[]; exits: any[] } => {
    const c: { maConfigs: any[]; exits: any[] } = JSON.parse(JSON.stringify(src));
    const maxP = maxPeriodCap;
    const r = Math.random();
    if (r < 0.3 && c.maConfigs.length) {
      const m: any = pick(c.maConfigs);
      const oldPeriod = m.period;
      const others = c.maConfigs.filter((x: any) => x !== m).map((x: any) => x.period);
      let np = oldPeriod;
      for (let a = 0; a < 8; a++) {
        np = clampN(Math.round(oldPeriod + (Math.random() < 0.5 ? -1 : 1) * (1 + rand(10))), 2, maxP);
        if (maGapOk(np, others)) break;
      }
      m.period = maGapOk(np, others) ? np : oldPeriod;
      const seen = new Set<number>();
      c.maConfigs = c.maConfigs.filter((x: any) => { if (seen.has(x.period)) return false; seen.add(x.period); return true; });
      sanitizeAlignments(c.maConfigs);
    } else if (r < 0.55 && c.maConfigs.length) {
      const m: any = pick(c.maConfigs);
      const ss = m.pyramiding?.signals;
      if (ss?.length) {
        const s: any = pick(ss);
        const k = rand(6);
        if (k === 0) { s.percent = clampN(s.percent + [-10, -5, 5, 10][rand(4)], 1, 100); const [mLo, mHi] = trendPctRange(s.action === 'buy'); s.percent = clampN(s.percent, mLo, mHi); }
        else if (k === 1) { s.consecutive = clampN(s.consecutive + (Math.random() < 0.5 ? -1 : 1), 1, 10); if (trend < 0.5 && s.action === 'buy') s.consecutive = Math.max(2, s.consecutive); }
        else if (k === 2) s.action = s.action === 'buy' ? 'sell' : 'buy';
        else if (k === 3) s.candleFilter = pick(candleOpts);
        else if (k === 4) s.volumeFilter = pick(volOpts);
        else s.alignment = alignForSignal(s.signal);
      }
    } else if (r < 0.7 && c.maConfigs.length) {
      const m: any = pick(c.maConfigs);
      const ss = m.pyramiding?.signals;
      if (ss?.length) {
        const s: any = pick(ss);
        const u2 = Math.random();
        const g = u2 < 0.34 ? s.condTrade : u2 < 0.67 ? s.condCandle : s.condMa;
        if (g) {
          const isMa = g === s.condMa;
          const u = Math.random();
          if (u < 0.5 && g.type !== 'any') {
            g.value = isMa ? clampN(Math.round((g.value + (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 2)) * 10) / 10, -50, 50)
                           : clampN(Math.round(g.value + (Math.random() < 0.5 ? -1 : 1) * (1 + rand(2))), 1, 20);
          } else if (u < 0.75) {
            g.operator = pick([...condOps]);
          } else {
            const pool2 = g === s.condTrade ? ['any','consecutiveBuy','consecutiveSell','consecutiveSelected']
                        : g === s.condCandle ? ['any','consecutiveBullish','consecutiveBearish']
                        : ['any','maDeviation','maSlope'];
            g.type = pick(pool2 as any);
            if (g.type === 'any') g.operator = 'any';
            else if (g.operator === 'any') g.operator = pick((['<','<=','=','!=','>=','>']) as any);
          }
        }
      }
    } else if (c.exits.length) {
      const e = pick(c.exits);
      const k = rand(4);
      if (k === 0) e.percent = clampN(e.percent + (Math.random() < 0.5 ? -1 : 1) * (1 + rand(4)), 1, 100);
      else if (k === 1) e.sellPercent = clampN(e.sellPercent + (Math.random() < 0.5 ? -1 : 1) * (5 + rand(10)), 1, 100);
      else if (k === 2) e.skip = clampN(e.skip + (Math.random() < 0.5 ? -1 : 1), 0, 20);
      else {
        // 50% 확률로 다른 청산의 basis를 복사해 계단 유지 (임계값·비중은 독립 변이)
        const others = c.exits.filter((x: any) => x !== e);
        if (others.length && Math.random() < 0.5) {
          const src = pick(others);
          e.basis = src.basis; e.candle = src.candle; e.volume = src.volume;
        } else e.basis = pick(['profitRise','profitFall','peakFall','peakRise'] as const);
      }
    }
    return c;
  };
  const consider = (maCfgs: any[], exitCfgs: any[]) => {
    // 최적화는 UI 체크와 무관하게 항상 전체 이평선 존재 조건으로 평가
    // MA 4모드 × 실현 4모드 전조합 평가해 이긴 쪽을 결과에 태그. 동점은 현재 UI 모드 우선 (무의미한 UI 뒤집기 방지)
    if (!passTrendGate(maCfgs, exitCfgs)) return;
    {
          for (const mm of RESOLVE_MODES) {
            for (const xm of EXIT_RESOLVE_MODES) {
          const m = calcMetrics(candles, maCfgs as any, exitCfgs as any, { requireAll: true, simFrom: z0, simTo: z1, initialCapital, feePercent, maMode: mm, xMode: xm, execDelay: opts.execDelay, slippage: opts.slippage, fillRatio: opts.fillRatio });
          const score = scoreOf(m);
              const uiMode = mm === opts.maMode && xm === opts.xMode;
              if (score > bestProfit || (score === bestProfit && uiMode)) { maCfgs.sort((a:any,b:any)=>a.period-b.period); bestProfit = score; best = { maConfigs: maCfgs, exits: exitCfgs, profit: m.profit, metrics: m, score, riskAversion, mres: mm, xres: xm, trend, conviction }; }
          if (m.conflicts === 0 && (score > bestCleanProfit || (score === bestCleanProfit && uiMode))) { bestCleanProfit = score; bestClean = { maConfigs: maCfgs, exits: exitCfgs, profit: m.profit, metrics: m, score, riskAversion, mres: mm, xres: xm, trend, conviction }; }
          if (pool.length < 20 || score > pool[pool.length - 1].score) {
            pool.push({ score, maConfigs: JSON.parse(JSON.stringify(maCfgs)), exits: JSON.parse(JSON.stringify(exitCfgs)) });
            pool.sort((a, b) => b.score - a.score);
            if (pool.length > 20) pool.length = 20;
          }
        }
      }
    }
  };
  // 베이스라인 2종을 먼저 평가 — 명백한 추세가 있을 때 0거래(관망)가 최적이라고 나오는 것 방지
  // 중립이 아닐 때는 앵커 매수/매도 %도 추세 범위로 클램프 (방어/공격 체제 일관성). 중립은 99/100 그대로.
  const baselineExits: any[] = [{ basis: 'profitRise', percent: 15, sellPercent: 100, skip: 0, candle: 'any', volume: 'any' }];
  const blPct = (p: number, isBuy: boolean) => {
    if (trend === 0.5) return p;
    const [, hi] = trendPctRange(isBuy);
    return Math.min(p, hi);
  };
  const baseline = (periods: number[]) => periods.map((period, i) => ({ period, color: colors[i % colors.length], pyramiding: { signals: (['golden','dead'] as const).map(sig => ({ signal: sig, action: sig === 'golden' ? 'buy' : 'sell', percent: sig === 'golden' ? blPct(99, true) : blPct(100, false), candleFilter: 'any', volumeFilter: 'any', consecutive: (sig === 'golden' && trend < 0.5) ? 2 : 1, alignment: 'any', condTrade: { type: 'any', operator: 'any', value: 1 }, condCandle: { type: 'any', operator: 'any', value: 1 }, condMa: { type: 'any', operator: 'any', value: 1 } })) } }));
  // NOTE: 매수 percent 100은 수수료 여유분이 없어 단 1주도 체결되지 않으므로 99 사용
  consider(baseline([5, 20]), baselineExits);
  consider(baseline([10, 30, 60]), baselineExits);
  // 데이터 기반 기간 가중치: 표준 기간 단순전략(골든 전량매수/데드 전량매도) 점수로 기간 우선순위 산출
  const periodPool = [5,10,20,30,60,90,120,200].filter(v => v <= maxPeriodCap);
  const maxPeriod = maxPeriodCap;
  const noCond = { type: 'any' as const, operator: 'any' as const, value: 1 };
  const simpleExits: any[] = [{ basis: 'profitRise', percent: 15, sellPercent: 100, skip: 0, candle: 'any', volume: 'any' }];
  const periodScore = new Map<number, number>();
  for (const pp of periodPool) {
    const pm = calcMetrics(candles, [{ period: pp, color: '#888888', pyramiding: { signals: [
      { signal: 'golden', action: 'buy', percent: 99, candleFilter: 'any', volumeFilter: 'any', consecutive: 1, alignment: 'any', condTrade: { ...noCond }, condCandle: { ...noCond }, condMa: { ...noCond } },
      { signal: 'dead', action: 'sell', percent: 100, candleFilter: 'any', volumeFilter: 'any', consecutive: 1, alignment: 'any', condTrade: { ...noCond }, condCandle: { ...noCond }, condMa: { ...noCond } },
    ] } }], simpleExits, { requireAll: true, simFrom: z0, simTo: z1, initialCapital, feePercent, maMode, xMode, execDelay: opts.execDelay, slippage: opts.slippage, fillRatio: opts.fillRatio });
    periodScore.set(pp, Number.isFinite(pm.profit) ? pm.profit : -Infinity);
  }
  const weightedPool = [...periodPool].sort((a, b) => (periodScore.get(b) ?? -Infinity) - (periodScore.get(a) ?? -Infinity));
  // 이평선 최소 간격: 근접 period는 사실상 같은 선 → 최소 5봉, 큰 구간은 작은 쪽의 10% 이상
  const MIN_MA_GAP = 5;
  const maGapOk = (p: number, others: Iterable<number>): boolean => {
    for (const q of others) {
      if (Math.abs(p - q) < Math.max(MIN_MA_GAP, Math.round(Math.min(p, q) * 0.1))) return false;
    }
    return true;
  };
  const pickPeriod = (used: Set<number>): number => {
    if (Math.random() < 0.65) {
      const avail = weightedPool.filter(q => maGapOk(q, used));
      if (avail.length) {
        const idx = Math.min(avail.length - 1, Math.floor(Math.pow(Math.random(), 2) * avail.length));
        used.add(avail[idx]);
        return avail[idx];
      }
    }
    for (let a = 0; a < 50; a++) { const q = 3 + rand(maxPeriod - 2); if (maGapOk(q, used)) { used.add(q); return q; } }
    // 극히 드묾(좁은 범위+많은 MA): 간격 무시하고 중복만 피움
    for (let a = 0; a < 50; a++) { const q = 3 + rand(maxPeriod - 2); if (!used.has(q)) { used.add(q); return q; } }
    const fallback = 3 + rand(maxPeriod - 2);
    used.add(fallback);
    return fallback;
  };
  for (let phase = 0; phase < 2; phase++) {
    const relaxed = phase === 1;
    // 1차(1000회)에서 거래 있는 최적값을 찾았으면 2차(조건 완화) 생략
    if (relaxed && (best?.metrics?.tradeCount ?? 0) > 0) break;
  for (let t = 0; t < trials; t++) {
    const maCount = 2 + rand(3);
    const used = new Set<number>();
    const maConfigs = Array.from({ length: maCount }, () => {
      const period = pickPeriod(used);
      const color = colors[rand(colors.length)];
      const mkSide = (sg: 'golden'|'dead') => {
        const action = pickAction();
        // 하락 예상이면 매수는 유지봉 +1 (반등 확인 후 진입, 떨어지는 칼날 방지). 중립은 그대로.
        const consBoost = (trend < 0.5 && action === 'buy') ? 1 : 0;
        const [pctLo, pctHi] = trendPctRange(action === 'buy');
        return {
        action,
        percent: pctLo + rand(pctHi - pctLo + 1),
        candleFilter: relaxed && Math.random() < 0.7 ? 'any' : pick(candleOpts),
        volumeFilter: relaxed && Math.random() < 0.7 ? 'any' : pick(volOpts),
        consecutive: (relaxed ? 1 + rand(2) : 1 + rand(3)) + consBoost,
        alignment: relaxed ? 'any' : alignForSignal(sg),
        condTrade: relaxed ? { type: 'any' as const, operator: 'any' as const, value: 1 } : (Math.random() < 0.5 ? { type: 'any' as const, operator: 'any' as const, value: 1 } : { type: pick(tradeConds) as any, operator: pick([...condOps].filter(o=>o!=='any')) as any, value: 1 + rand(5) }),
        condCandle: relaxed ? { type: 'any' as const, operator: 'any' as const, value: 1 } : (Math.random() < 0.5 ? { type: 'any' as const, operator: 'any' as const, value: 1 } : { type: pick(candleConds) as any, operator: pick([...condOps].filter(o=>o!=='any')) as any, value: 1 + rand(5) }),
        condMa: relaxed ? { type: 'any' as const, operator: 'any' as const, value: 1 } : (Math.random() < 0.5 ? { type: 'any' as const, operator: 'any' as const, value: 1 } : { type: pick(maConds) as any, operator: pick([...condOps].filter(o=>o!=='any')) as any, value: Number((Math.random()*20 -10).toFixed(1)) }),
        };
      };
      const sigCount = 1 + rand(3);
      const sigs = Array.from({ length: sigCount }, () => { const sg = pick(['golden','dead'] as const); return { signal: sg, ...mkSide(sg) }; });
      return { period, color, pyramiding: { signals: sigs } };
    });
    sanitizeAlignments(maConfigs);
    const filtered = maConfigs.filter(m => (m.pyramiding.signals||[]).length>0);
    if (!filtered.length) continue;
    const exitCount = 1 + rand(2);
    const exits: any[] = Array.from({ length: exitCount }, () => {
      const b = pick(['profitRise','profitFall','peakFall','peakRise'] as const);
      return { basis: b, percent: 5 + rand(21), sellPercent: 30 + rand(71), skip: rand(6), candle: pick(candleOpts), volume: pick(volOpts) };
    });
    // 2개일 때 50% 확률로 계단식 청산: 같은 basis + 다른 임계값 → 한쪽 발동 집합이 다른 쪽을 포함해 동시 발동 보장 (모드 간 실질 차이)
    if (exits.length === 2 && Math.random() < 0.5) {
      const first = exits[0], second = exits[1];
      second.basis = first.basis;
      second.percent = first.percent >= 15 ? first.percent - 7 : first.percent + 7;
      second.candle = first.candle;
      second.volume = first.volume;
    }
    consider(filtered, exits);
    } // for t
  } // for phase — 1차에서 거래 있는 최적값을 못 찾으면 조건 완화해 추가 탐색
  // hill-climb: 상위 후보를 변이시키며 점수 수렴 (랜덤 탐색 보완)
  const elites = pool.slice(0, 5);
  for (const e of elites) {
    for (let g = 0; g < 30; g++) {
      const mutated = mutate({ maConfigs: e.maConfigs, exits: e.exits });
      consider(mutated.maConfigs, mutated.exits);
    }
  }
  return bestClean ?? best; // 같은 틱 반대매매 없는 후보 우선 (없을 때만 전체 최적)
}

export function calcMetrics(candles: SimCandle[], maConfigs: any[], exits: any[], opts: CalcOptions): SimMetrics {
  if (!candles.length || !maConfigs.length) return { profit: -Infinity, rate: -Infinity, maxDrawdown: 100, tradeCount: 0, avgPeriod: 0, volatility: 0, conflicts: 0 };
  const { requireAll, initialCapital, feePercent, maMode, xMode } = opts;
  const simFrom = opts.simFrom ?? 0;
  const simTo = opts.simTo ?? candles.length - 1;
  // MA는 전체 캔들로 계산, 매매/평가는 simFrom~simTo 구간으로만
  const mz0 = Math.max(0, Math.min(Math.floor(simFrom), candles.length - 1));
  const mz1 = Math.max(mz0, Math.min(Math.floor(simTo), candles.length - 1));
  const exitList: any[] = Array.isArray(exits) ? exits : [];
  const maMap = new Map<number, (number | null)[]>();
  for (const ma of maConfigs) { maMap.set(ma.period, computeSmaSeries(candles.map(c => c.close), ma.period)); }
  const sortedMas=[...maConfigs].sort((a,b)=>a.period-b.period);
  const reqFrom=sortedMas.length?Math.max(...sortedMas.map((m:any)=>m.period)):0; // 전체 존재 조건 기준봉
  const isAligned=(idx:number)=>{ const f=sortedMas.map(ma=>({period:ma.period,v:maMap.get(ma.period)![idx]})).filter(x=>x.v!=null) as any[]; if(f.length<2) return true; for(let k=0;k<f.length-1;k++) if(!(f[k].v>f[k+1].v)) return false; return true; };
  const isRev=(idx:number)=>{ const f=sortedMas.map(ma=>({period:ma.period,v:maMap.get(ma.period)![idx]})).filter(x=>x.v!=null) as any[]; if(f.length<2) return true; for(let k=0;k<f.length-1;k++) if(!(f[k].v<f[k+1].v)) return false; return true; };
  const checkAlignment=(maPeriod:number,idx:number,mode:string)=>{ const cur=maMap.get(maPeriod)?.[idx]; if(cur==null) return false; if(mode==='any') return true; if(mode==='aligned') return isAligned(idx); if(mode==='reverse') return isRev(idx); const larger=[...maMap.entries()].filter(([p])=>p>maPeriod).map(([,arr])=>arr[idx]).filter(v=>v!=null) as number[]; const smaller=[...maMap.entries()].filter(([p])=>p<maPeriod).map(([,arr])=>arr[idx]).filter(v=>v!=null) as number[]; if(mode==='largerAbove') return larger.length>0&&larger.every(v=>v>cur); if(mode==='largerBelow') return larger.length>0&&larger.every(v=>v<cur); if(mode==='smallerAbove') return smaller.length>0&&smaller.every(v=>v>cur); if(mode==='smallerBelow') return smaller.length>0&&smaller.every(v=>v<cur); return true; };
  let cash=initialCapital; let shares=0; let totalCost=0; const feeRate=feePercent/100; const { slip: slipR, fill: fillR } = slipFillOf(opts); let peakPrice=0; let troughPrice=0; let trades=0; let conflicts=0; let barDir:string|null=null; const tradeActions:string[]=[]; const sigStreak=new Map<any,number>(); let maSkipRemaining=0;
  const equities:number[]=[]; let peakEquity=initialCapital; let maxDD=0;
  for(let i=1;i<candles.length;i++){
    if(i<mz0||i>mz1) continue;
    if(shares>0){ peakPrice=Math.max(peakPrice,candles[i].close); troughPrice=troughPrice?Math.min(troughPrice,candles[i].close):candles[i].close; } else { peakPrice=0; troughPrice=0; }
    if(shares>0&&totalCost>0){
      const avg=totalCost/shares; const currClose=candles[i].close; const profitRate=((currClose-avg)/avg)*100; const peakDrop=peakPrice>0?((peakPrice-currClose)/peakPrice)*100:0; const troughRise=troughPrice>0?((currClose-troughPrice)/troughPrice)*100:0;
      let exitExecuted=false;
      const exitCands:any[]=[];
      for(const ex of exitList){
        let should=false;
        if(ex.basis==='profitRise') should=profitRate>=ex.percent;
        else if(ex.basis==='profitFall') should=profitRate<=-ex.percent;
        else if(ex.basis==='peakFall') should=peakDrop>=ex.percent;
        else if(ex.basis==='peakRise') should=troughRise>=ex.percent;
        if(!should) continue;
        if(ex.candle!=='any'){ const isBull=candles[i].close>candles[i].open; const isBear=candles[i].close<candles[i].open; if(ex.candle==='bull'&&!isBull) should=false; if(ex.candle==='bear'&&!isBear) should=false; }
        if(should&&ex.volume!=='any'&&i>0){ if(ex.volume==='higher'&&!(candles[i].volume>candles[i-1].volume)) should=false; if(ex.volume==='lower'&&!(candles[i].volume<candles[i-1].volume)) should=false; }
        if(!should) continue;
        const sellShares=Math.floor(shares*(ex.sellPercent/100)); if(sellShares<=0) continue;
        exitCands.push(ex);
      }
      if(exitCands.length){
        const xm=xMode;
        let execEx=exitCands[0];
        if(xm==='minFirst'||xm==='maxFirst'){
          const sorted=[...exitCands].sort((a,b)=> xm==='minFirst' ? (Number(a.sellPercent)||0)-(Number(b.sellPercent)||0) : (Number(b.sellPercent)||0)-(Number(a.sellPercent)||0));
          execEx=sorted[0];
        }
        else if(xm==='all') execEx={...exitCands[0], sellPercent: combinePct(exitCands.map(e=>Number(e.sellPercent)||0))};
        const ex=execEx;
        const sellSharesRaw=Math.floor(shares*(ex.sellPercent/100));
        const epX=execBaseAt(candles,i,opts); const sellShares=Math.floor(sellSharesRaw*fillR);
        if(sellShares>0&&epX!=null){
          const sellPx=epX*(1-slipR); const avg2=totalCost/shares; const proceeds=sellShares*sellPx; const fee=Math.round(proceeds*feeRate); shares-=sellShares; cash+=proceeds-fee; totalCost-=sellShares*avg2; if(shares===0) totalCost=0; trades++; maSkipRemaining=ex.skip; exitExecuted=true;
        }
      }
      if(exitExecuted){ const eq=cash+shares*candles[i].close; equities.push(eq); peakEquity=Math.max(peakEquity,eq); maxDD=Math.max(maxDD, peakEquity?((peakEquity-eq)/peakEquity)*100:0); continue; }
    }
    if(maSkipRemaining>0){ const eq=cash+shares*candles[i].close; equities.push(eq); peakEquity=Math.max(peakEquity,eq); maxDD=Math.max(maxDD, peakEquity?((peakEquity-eq)/peakEquity)*100:0); maSkipRemaining--; continue; }
    barDir=null; const cands:{ma:any;sigCfg:any;sig:'golden'|'dead';currClose:number}[]=[]; for(const ma of sortedMas){ if(requireAll&&i<reqFrom) break; // 전체 이평선 존재 조건: 최장기선 미형성 구간 매매 스킵
      const vals=maMap.get(ma.period)!; const prevMA=vals[i-1]; const currMA=vals[i]; if(prevMA==null||currMA==null) continue;
      const currClose=candles[i].close;
      const isAbove=currClose>currMA; const isBelow=currClose<currMA;
      const signals: any[]=(ma.pyramiding as any).signals||[];
      for(let sIdx=0;sIdx<signals.length;sIdx++){
        const sigCfg:any=signals[sIdx]; const sigType=sigCfg.signal as 'golden'|'dead';
        let sig:'golden'|'dead'|null=null;
        if(sigType==='golden'){ if(isAbove) sig='golden'; } else { if(isBelow) sig='dead'; }
        const sigKey=`${ma.period}-${sIdx}`;
        if(!sig){ sigStreak.set(sigKey,0); continue; }
        const align=sigCfg.alignment??'any'; if(align!=='any'&&!checkAlignment(ma.period,i,align)){ sigStreak.set(sigKey,0); continue; }
        const need=Math.max(1,Math.min(10,sigCfg.consecutive??2));
        const holdingNow=sig==='golden'?isAbove:isBelow; const cur=holdingNow?(sigStreak.get(sigKey)??0)+1:1; sigStreak.set(sigKey,cur);
        if(cur<need) continue;
        const ct0=sigCfg.condTrade;
        if(ct0&&ct0.type!=='any'){
          let count=0;
          if(ct0.type==='consecutiveBuy'){ for(let k=tradeActions.length-1;k>=0;k--){ if(tradeActions[k]==='buy') count++; else break; } }
          else if(ct0.type==='consecutiveSell'){ for(let k=tradeActions.length-1;k>=0;k--){ if(tradeActions[k]==='sell') count++; else break; } }
          else if(ct0.type==='consecutiveSelected'){ const target=sigCfg.action; for(let k=tradeActions.length-1;k>=0;k--){ if(tradeActions[k]===target) count++; else break; } }
          if(!condMet(count,ct0.operator,ct0.value)) continue;
        }
        const cc0=sigCfg.condCandle;
        if(cc0&&cc0.type!=='any'){
          let count=0;
          if(cc0.type==='consecutiveBullish'){ for(let k=i;k>=0;k--){ const c=candles[k]; if(c.close>c.open) count++; else break; } }
          else if(cc0.type==='consecutiveBearish'){ for(let k=i;k>=0;k--){ const c=candles[k]; if(c.close<c.open) count++; else break; } }
          if(!condMet(count,cc0.operator,cc0.value)) continue;
        }
        const cm0=sigCfg.condMa;
        if(cm0&&cm0.type!=='any'){
          let count=0;
          if(cm0.type==='maDeviation'){ const maVal=maMap.get(ma.period)?.[i]; if(maVal==null||maVal===0) count=0; else count=((candles[i].close-maVal)/maVal)*100; }
          else if(cm0.type==='maSlope'){ const maVal=maMap.get(ma.period)?.[i]; const prevMaVal=maMap.get(ma.period)?.[i-1]; if(maVal==null||prevMaVal==null||prevMaVal===0) count=0; else count=((maVal-prevMaVal)/prevMaVal)*100; }
          if(!condMet(count,cm0.operator,cm0.value)) continue;
        }
        const cfgPre:any=sigCfg; const pctPre=Math.max(1,Math.min(100,(cfgPre as any).percent));
        const singleMode = maMode === 'minFirst' || maMode === 'maxFirst';
        if((cfgPre as any).action==='buy'){ const candleOk=(cfgPre as any).candleFilter==='any'||((cfgPre as any).candleFilter==='bull'?candles[i].close>candles[i].open:candles[i].close<candles[i].open); const volOk=(cfgPre as any).volumeFilter==='any'||(i>0&&((cfgPre as any).volumeFilter==='higher'?candles[i].volume>candles[i-1].volume:candles[i].volume<candles[i-1].volume)); if(!candleOk||!volOk) continue; if(singleMode){ const epPre=execBaseAt(candles,i,opts); if(epPre==null) continue; const buyPxPre=epPre*(1+slipR); const cost=Math.floor(cash*(pctPre/100)); if(cost<1000||cash<cost) continue; const buyShares=Math.floor(Math.floor(cost/buyPxPre)*fillR); if(buyShares<=0) continue; const actualCost=buyShares*buyPxPre; const fee=Math.round(actualCost*feeRate); if(cash<actualCost+fee) continue; } }
        else { const candleOk=(cfgPre as any).candleFilter==='any'||((cfgPre as any).candleFilter==='bull'?candles[i].close>candles[i].open:candles[i].close<candles[i].open); const volOk=(cfgPre as any).volumeFilter==='any'||(i>0&&((cfgPre as any).volumeFilter==='higher'?candles[i].volume>candles[i-1].volume:candles[i].volume<candles[i-1].volume)); if(!candleOk||!volOk) continue; if(singleMode){ if(shares<=0||totalCost<=0) continue; const sellShares=Math.floor(shares*(pctPre/100)); if(sellShares<=0) continue; } }
        cands.push({ma, sigCfg, sig, currClose});
      }
    }
    const execsM: { cand: { ma: any; sigCfg: any; sig: 'golden'|'dead'; currClose: number }; pct: number }[] = [];
    {
      const mm = maMode;
      const ownPct = (c: { sigCfg: any }) => Math.max(1, Math.min(100, (c.sigCfg as any).percent));
      const isBuy = (c: { sigCfg: any }) => ((c.sigCfg as any).action === 'buy');
      if (mm === 'minFirst' || mm === 'maxFirst') {
        // 방향별 극값 1개씩 뽑아 네팅 후 1건 (매수극값−매도극값, 양수 매수/음수 매도/0 관망)
        const pickExt = (list: typeof cands) => list.length ? [...list].sort((a, b) => mm === 'minFirst' ? ownPct(a) - ownPct(b) : ownPct(b) - ownPct(a))[0] : null;
        const bX = pickExt(cands.filter(isBuy));
        const sX = pickExt(cands.filter(c => !isBuy(c)));
        const netX = (bX ? ownPct(bX) : 0) - (sX ? ownPct(sX) : 0);
        if (netX > 0 && bX) execsM.push({ cand: bX, pct: netX });
        else if (netX < 0 && sX) execsM.push({ cand: sX, pct: -netX });
      }
      else {
        // all: 방향별 복리합산 후 네팅해서 최종 1건 (매수합−매도합, 양수 매수/음수 매도/0 관망)
        const buySum = combinePct(cands.filter(isBuy).map(ownPct));
        const sellSum = combinePct(cands.filter(c => !isBuy(c)).map(ownPct));
        const net = Math.max(-100, Math.min(100, buySum - sellSum));
        if (net > 0) execsM.push({ cand: cands.find(isBuy)!, pct: net });
        else if (net < 0) execsM.push({ cand: cands.find(c => !isBuy(c))!, pct: -net });
      }
    }
    for(const exm of execsM){ const sigCfg:any=exm.cand.sigCfg; const currClose=exm.cand.currClose;
        const cfg=sigCfg; const pct=Math.max(1,Math.min(100, exm.pct));
        const epM=execBaseAt(candles,i,opts); if(epM==null) continue;
        if((cfg as any).action==='buy'){ const candleOk=(cfg as any).candleFilter==='any'||((cfg as any).candleFilter==='bull'?candles[i].close>candles[i].open:candles[i].close<candles[i].open); const volOk=(cfg as any).volumeFilter==='any'||(i>0&&((cfg as any).volumeFilter==='higher'?candles[i].volume>candles[i-1].volume:candles[i].volume<candles[i-1].volume)); if(!candleOk||!volOk) continue; const buyPx=epM*(1+slipR); const cost=Math.floor(cash*(pct/100)); if(cost<1000||cash<cost) continue; const buyShares=Math.floor(Math.floor(cost/buyPx)*fillR); if(buyShares<=0) continue; const actualCost=buyShares*buyPx; const fee=Math.round(actualCost*feeRate); if(cash<actualCost+fee) continue; shares+=buyShares; cash-=actualCost+fee; totalCost+=actualCost+fee; if(barDir&&barDir!=='buy'){conflicts++;} barDir='buy'; trades++; tradeActions.push('buy'); } else { if(shares<=0||totalCost<=0) continue; const candleOk=(cfg as any).candleFilter==='any'||((cfg as any).candleFilter==='bull'?candles[i].close>candles[i].open:candles[i].close<candles[i].open); const volOk=(cfg as any).volumeFilter==='any'||(i>0&&((cfg as any).volumeFilter==='higher'?candles[i].volume>candles[i-1].volume:candles[i].volume<candles[i-1].volume)); if(!candleOk||!volOk) continue; const sellShares=Math.floor(Math.floor(shares*(pct/100))*fillR); if(sellShares<=0) continue; const avg=totalCost/shares; const sellPx=epM*(1-slipR); const proceeds=sellShares*sellPx; const fee=Math.round(proceeds*feeRate); shares-=sellShares; cash+=proceeds-fee; totalCost-=sellShares*avg; if(shares===0) totalCost=0; if(barDir&&barDir!=='sell'){conflicts++;} barDir='sell'; trades++; tradeActions.push('sell'); }
    }
    const eq=cash+shares*candles[i].close; equities.push(eq); peakEquity=Math.max(peakEquity,eq); maxDD=Math.max(maxDD, peakEquity?((peakEquity-eq)/peakEquity)*100:0);
  }
  const lastPrice=candles.length?candles[mz1].close:0; const evalAmt=cash+shares*lastPrice; const profit=evalAmt-initialCapital; const rate=initialCapital?(profit/initialCapital)*100:0;
  let sum=0,sumSq=0; for(let i=1;i<equities.length;i++){ const r=(equities[i]-equities[i-1])/equities[i-1]; sum+=r; sumSq+=r*r; } const mean=equities.length>1?sum/(equities.length-1):0; const variance=equities.length>1?sumSq/(equities.length-1)-mean*mean:0; const volatility=Math.sqrt(Math.max(0,variance))*100;
  const avgPeriod=maConfigs.length?maConfigs.reduce((s:number,m:any)=>s+m.period,0)/maConfigs.length:50;
  return { profit: rate, rate, maxDrawdown: maxDD, tradeCount: trades, avgPeriod, volatility, conflicts };
}

export function simulate(candles: SimCandle[], maConfigs: any[], exits: any[], opts: SimOptions): SimResult {
  const { initialCapital, feePercent, requireAll, maMode, xMode } = opts;
  const simFrom = opts.simFrom ?? 0;
  const simTo = opts.simTo ?? candles.length - 1;
  const reasons: { idx: number; reason: string }[] = [];
  // MA·크로스는 전체 캔들로 계산, 매매는 simFrom~simTo 구간으로만
  const bz0 = candles.length ? Math.max(0, Math.min(Math.floor(simFrom), candles.length - 1)) : 0;
  const bz1 = candles.length ? Math.max(bz0, Math.min(Math.floor(simTo), candles.length - 1)) : -1;
  // 이동평균별 MA 배열 미리 계산
  const maMap = new Map<number, (number | null)[]>();
  const allCloses = candles.map(c => c.close);
  for (const ma of maConfigs) {
    maMap.set(ma.period, computeSmaSeries(allCloses, ma.period));
  }
  const sortedMas = [...maConfigs].sort((a, b) => a.period - b.period);
  const reqFrom = sortedMas.length ? Math.max(...sortedMas.map(m => m.period)) : 0; // 전체 존재 조건 기준봉
  const isAligned = (idx: number): boolean => {
    const formed = sortedMas.map(ma => ({ period: ma.period, v: maMap.get(ma.period)![idx] }))
      .filter(x => x.v != null) as { period: number; v: number }[];
    if (formed.length < 2) return true;
    for (let k = 0; k < formed.length - 1; k++) {
      if (!(formed[k].v > formed[k + 1].v)) return false;
    }
    return true;
  };
  const isReverseAligned = (idx: number): boolean => {
    const formed = sortedMas.map(ma => ({ period: ma.period, v: maMap.get(ma.period)![idx] }))
      .filter(x => x.v != null) as { period: number; v: number }[];
    if (formed.length < 2) return true;
    for (let k = 0; k < formed.length - 1; k++) {
      if (!(formed[k].v < formed[k + 1].v)) return false;
    }
    return true;
  };
  const checkAlignment = (maPeriod: number, idx: number, mode: string): boolean => {
    const cur = maMap.get(maPeriod)?.[idx];
    if (cur == null) return false;
    if (mode === 'any') return true;
    if (mode === 'aligned') return isAligned(idx);
    if (mode === 'reverse') return isReverseAligned(idx);
    // 큰/작은 MA와 비교
    const curPeriod = maPeriod;
    const larger = [...maMap.entries()].filter(([p]) => p > curPeriod).map(([p, arr]) => arr[idx]).filter(v => v != null) as number[];
    const smaller = [...maMap.entries()].filter(([p]) => p < curPeriod).map(([p, arr]) => arr[idx]).filter(v => v != null) as number[];
    if (mode === 'largerAbove') return larger.length > 0 && larger.every(v => v > cur);
    if (mode === 'largerBelow') return larger.length > 0 && larger.every(v => v < cur);
    if (mode === 'smallerAbove') return smaller.length > 0 && smaller.every(v => v > cur);
    if (mode === 'smallerBelow') return smaller.length > 0 && smaller.every(v => v < cur);
    return true;
  };

  // 시뮬레이션: 투자원금/보유주식 기반 피라미딩 + G/D 라인 (연속발생 N회 충족 시 매매) + 익절/손절 (평균단가 기준, 중복 방지)
  let cash = initialCapital;
  let shares = 0;
  let totalCost = 0;
  const feeRate = feePercent / 100;
  const { slip: slipR, fill: fillR } = slipFillOf(opts);
  let peakPrice = 0;
  let troughPrice = 0;
  const trades: SimTrade[] = [];
  const tradeAtIdx: Map<number, { action: 'buy'|'sell'; label: string; color: string; position: string }[]> = new Map();
  const crossAtIdx: Map<number, { label: string; color: string }[]> = new Map();
  const sigStreak = new Map<any, number>();
  let maSkipRemaining = 0;

  for (let i = 1; i < candles.length; i++) {
    if (i < bz0 || i > bz1) continue;
    if (shares > 0) { peakPrice = Math.max(peakPrice, candles[i].close); troughPrice = troughPrice ? Math.min(troughPrice, candles[i].close) : candles[i].close; } else { peakPrice = 0; troughPrice = 0; }
    // 실현(청산 조건) 우선 체크 — exitConfigs 순회, 체결 시 MA 스킵
    if (shares > 0 && totalCost > 0) {
      const avg = totalCost / shares;
      const currClose = candles[i].close;
      const profitRate = ((currClose - avg) / avg) * 100;
      const peakDropRate = peakPrice > 0 ? ((peakPrice - currClose) / peakPrice) * 100 : 0;
      const troughRiseRate = troughPrice > 0 ? ((currClose - troughPrice) / troughPrice) * 100 : 0;
      let exitExecuted = false;
      // 실현 후보 수집 (같은 봉 겹친 실현 조건)
      const exitCands: { ex: any; basisLabel: string; conds: string[] }[] = [];
      for (const ex of exits) {
        let should = false;
        if (ex.basis === 'profitRise') should = profitRate >= ex.percent;
        else if (ex.basis === 'profitFall') should = profitRate <= -ex.percent;
        else if (ex.basis === 'peakFall') should = peakDropRate >= ex.percent;
        else if (ex.basis === 'peakRise') should = troughRiseRate >= ex.percent;
        if (!should) continue;
        if (ex.candle !== 'any') {
          const isBull = candles[i].close > candles[i].open;
          const isBear = candles[i].close < candles[i].open;
          if (ex.candle === 'bull' && !isBull) should = false;
          if (ex.candle === 'bear' && !isBear) should = false;
        }
        if (should && ex.volume !== 'any' && i > 0) {
          if (ex.volume === 'higher' && !(candles[i].volume > candles[i-1].volume)) should = false;
          if (ex.volume === 'lower' && !(candles[i].volume < candles[i-1].volume)) should = false;
        }
        if (!should) continue;
        const sellShares = Math.floor(shares * (ex.sellPercent / 100));
        if (sellShares <= 0) continue;
        const basisLabel = ex.basis === 'profitRise' ? '수익상승' : ex.basis === 'profitFall' ? '수익하락' : ex.basis === 'peakFall' ? '보유고점하락' : ex.basis === 'peakRise' ? '보유저점반등' : ex.basis;
        exitCands.push({ ex, basisLabel, conds: [`청산 ${basisLabel} ${ex.percent}%`] });
      }
      // 실현 확정 (all/sum은 매도끼리라 합산 1건으로 동일)
      if (exitCands.length) {
        const xm = xMode;
        let execEx = exitCands[0].ex;
        let execBasis = exitCands[0].basisLabel;
        let execConds = exitCands[0].conds;
        if (xm === 'minFirst' || xm === 'maxFirst') {
          const sorted = [...exitCands].sort((a, b) => xm === 'minFirst' ? (Number(a.ex.sellPercent) || 0) - (Number(b.ex.sellPercent) || 0) : (Number(b.ex.sellPercent) || 0) - (Number(a.ex.sellPercent) || 0));
          execEx = sorted[0].ex; execBasis = sorted[0].basisLabel; execConds = sorted[0].conds;
        } else if (xm === 'all') {
          const agg = combinePct(exitCands.map(c => Number(c.ex.sellPercent) || 0));
          execEx = { ...exitCands[0].ex, sellPercent: agg };
          // MA와 동일하게 2번째 이후 멤버는 + 표시 (팝업 건별 그룹핑용)
          execConds = exitCands.flatMap((c, xi) => xi === 0 ? c.conds : [`+ ${c.conds[0]}`, ...c.conds.slice(1)]);
          (execEx as any)._aggNote = exitCands.length > 1
            ? ` (복리 합산 ${exitCands.map(c => `${Number(c.ex.sellPercent) || 0}%`).join(' + ')} → ${agg}%)` : '';
          (execEx as any)._detail = exitCands.map(c => exitSpecLine(c.basisLabel, c.ex));
        }
        const ex = execEx;
        const basisLabel = execBasis;
        const sellSharesRaw = Math.floor(shares * (ex.sellPercent / 100));
        const epX = execBaseAt(candles, i, opts);
        const sellShares = Math.floor(sellSharesRaw * fillR);
        if (sellShares > 0 && epX != null) {
          const sellPx = epX * (1 - slipR);
          const proceeds = sellShares * sellPx;
          const fee = Math.round(proceeds * feeRate);
          shares -= sellShares;
          cash += proceeds - fee;
          totalCost -= sellShares * avg;
          if (shares === 0) totalCost = 0;
          const label = '청';
          const color = '#8b5cf6';
          const profitNow = ((currClose - avg) / avg) * 100;
          const avgAfter = shares > 0 ? totalCost / shares : 0;
          const holdingValue = shares * currClose;
          const exitFilters = `${ex.candle !== 'any' ? `, 캔들 ${ex.candle}` : ''}${ex.volume !== 'any' ? `, 거래량 ${ex.volume}` : ''}`;
          const reason = `실현 ${basisLabel} ${ex.percent}%${exitFilters} (수익률 ${profitNow.toFixed(2)}%, avg ${avg.toFixed(0)}→${currClose}) ${ex.sellPercent}% 매도${(ex as any)._aggNote ?? ''}, 수수료 ${fee.toLocaleString()}원, 이후 ${ex.skip}회 스킵`;
          const tIdx = trades.length + 1;
            trades.push({ idx: tIdx, date: candles[i].date, price: sellPx, action: 'sell', maPeriod: 0, percent: ex.sellPercent, sharesDelta: sellShares, amount: proceeds, fee, cashAfter: cash, sharesAfter: shares, label, profitRate: profitNow, avgPrice: avgAfter, holdingValue, conds: execConds, condDetail: (ex as any)._detail ?? [exitSpecLine(execBasis, ex)], wantedPrice: currClose, execMode: (opts.execDelay ?? 0) === 1 ? 'nextOpen' : 'close', slipPct: (opts.slippage ?? 0) * 100, fillPct: (opts.fillRatio ?? 1) * 100, wantedShares: sellSharesRaw });
          reasons.push({ idx: tIdx, reason });
          const arr = tradeAtIdx.get(i) ?? [];
          arr.push({ action: 'sell', label, color, position: 'candle-top' });
          tradeAtIdx.set(i, arr);
          maSkipRemaining = ex.skip;
          exitExecuted = true;
        }
      }
      if (exitExecuted) continue;
    }
    // 익절/손절 이후 MA 스킵 카운트
    if (maSkipRemaining > 0) {
      maSkipRemaining--;
      continue;
    }
    // 봉당 후보 수집 → 확정 모드대로 1건 (min/max 극값네팅, all 복리합산네팅)
    const cands: { ma: any; sigCfg: any; sig: 'golden' | 'dead'; currClose: number; conds: string[] }[] = [];
    for (const ma of sortedMas) {
      if (requireAll && i < reqFrom) break; // 전체 이평선 존재 조건: 최장기선 미형성 구간 매매 스킵
      const vals = maMap.get(ma.period)!;
      const prevMA = vals[i - 1];
      const currMA = vals[i];
      if (prevMA == null || currMA == null) continue;
      const prevClose = candles[i - 1].close;
      const currClose = candles[i].close;
      const isAbove = currClose > currMA;
      const isBelow = currClose < currMA;
      const isCrossGolden = prevClose <= prevMA && currClose > currMA;
      const isCrossDead = prevClose >= prevMA && currClose < currMA;
      // G/D 마커는 실제 크로스 봉에만 표시 (상태 유지봉 제외, 전체존재 조건 시 미형성 구간 제외)
      if ((isCrossGolden || isCrossDead) && !(requireAll && i < reqFrom)) {
        const crossLabel = isCrossGolden ? 'G' : 'D';
        const crossColor = isCrossGolden ? '#fbbf24' : '#f87171';
        const arrC = crossAtIdx.get(i) ?? [];
        if (!arrC.some(x => x.label === crossLabel)) {
          arrC.push({ label: crossLabel, color: crossColor });
          crossAtIdx.set(i, arrC);
        }
      }
      const signals: any[] = (ma.pyramiding as any).signals || [];
      for (let sIdx = 0; sIdx < signals.length; sIdx++) {
        const sigCfg: any = signals[sIdx];
        const sigType = sigCfg.signal as 'golden'|'dead';
        let sig: 'golden' | 'dead' | null = null;
        if (sigType === 'golden') {
          if (isAbove) sig = 'golden';
        } else {
          if (isBelow) sig = 'dead';
        }
        const sigKey = `${ma.period}-${sIdx}`;
        if (!sig) { sigStreak.set(sigKey, 0); continue; }
        const align = sigCfg.alignment ?? 'any';
        if (align !== 'any' && !checkAlignment(ma.period, i, align)) {
          sigStreak.set(sigKey, 0);
          continue;
        }
        const need = Math.max(1, Math.min(10, sigCfg.consecutive ?? 2));
        const holdingNow = sig === 'golden' ? isAbove : isBelow;
        const cur = holdingNow ? (sigStreak.get(sigKey) ?? 0) + 1 : 1;
        sigStreak.set(sigKey, cur);
        if (cur < need) continue;
        const ct0 = sigCfg.condTrade;
        if (ct0 && ct0.type !== 'any') {
          let count = 0;
          if (ct0.type === 'consecutiveBuy') { for (let k = trades.length - 1; k >= 0; k--) { if (trades[k].action === 'buy') count++; else break; } }
          else if (ct0.type === 'consecutiveSell') { for (let k = trades.length - 1; k >= 0; k--) { if (trades[k].action === 'sell') count++; else break; } }
          else if (ct0.type === 'consecutiveSelected') { const target = sigCfg.action; for (let k = trades.length - 1; k >= 0; k--) { if (trades[k].action === target) count++; else break; } }
          if (!condMet(count, ct0.operator, ct0.value)) continue;
        }
        const cc0 = sigCfg.condCandle;
        if (cc0 && cc0.type !== 'any') {
          let count = 0;
          if (cc0.type === 'consecutiveBullish') { for (let k = i; k >= 0; k--) { const c = candles[k]; if (c.close > c.open) count++; else break; } }
          else if (cc0.type === 'consecutiveBearish') { for (let k = i; k >= 0; k--) { const c = candles[k]; if (c.close < c.open) count++; else break; } }
          if (!condMet(count, cc0.operator, cc0.value)) continue;
        }
        const cm0 = sigCfg.condMa;
        if (cm0 && cm0.type !== 'any') {
          let count = 0;
          if (cm0.type === 'maDeviation') { const maVal = maMap.get(ma.period)?.[i]; if (maVal == null || maVal === 0) count = 0; else count = ((candles[i].close - maVal) / maVal) * 100; }
          else if (cm0.type === 'maSlope') { const maVal = maMap.get(ma.period)?.[i]; const prevMaVal = maMap.get(ma.period)?.[i-1]; if (maVal == null || prevMaVal == null || prevMaVal === 0) count = 0; else count = ((maVal - prevMaVal) / prevMaVal) * 100; }
          if (!condMet(count, cm0.operator, cm0.value)) continue;
        }
        const cfg = sigCfg;
        const pct = Math.max(1, Math.min(100, cfg.percent));
        const candleOk = cfg.candleFilter === 'any' || (cfg.candleFilter === 'bull' ? candles[i].close > candles[i].open : candles[i].close < candles[i].open);
        const volOk = cfg.volumeFilter === 'any' || (i > 0 && (cfg.volumeFilter === 'higher' ? candles[i].volume > candles[i-1].volume : candles[i].volume < candles[i-1].volume));
        if (!candleOk || !volOk) continue;
        const parts: string[] = [];
        { const g = cfg.condTrade; if (g && g.type !== 'any') parts.push(`연속매매 ${g.type} ${g.operator} ${g.value}`); }
        { const g = cfg.condCandle; if (g && g.type !== 'any') parts.push(`연속봉 ${g.type} ${g.operator} ${g.value}`); }
        { const g = cfg.condMa; if (g && g.type !== 'any') parts.push(`평균선 ${g.type} ${g.operator} ${g.value}`); }
        const base = `MA${ma.period} ${sig === 'golden' ? '골든' : '데드'} ${cfg.action === 'buy' ? '매수' : '매도'} ${pct}%`;
        // 자금 타당성 (수집 시점, 변이 없음 — 단일 확정 모드에서만 미리 걸러냄)
        // all/sum 모드는 확정 단계의 기존 본문이 순차 평가하므로 여기서는 검사하지 않음
        if (maMode === 'minFirst' || maMode === 'maxFirst') {
          if (cfg.action === 'buy') {
            const cost = Math.floor(cash * (pct / 100));
            if (cost < 1000 || cash < cost) continue;
            const epPre = execBaseAt(candles, i, opts);
            if (epPre == null) continue;
            const buyPxPre = epPre * (1 + slipR);
            const buyShares = Math.floor(Math.floor(cost / buyPxPre) * fillR);
            if (buyShares <= 0) continue;
            if (cash < buyShares * buyPxPre + Math.round(buyShares * buyPxPre * feeRate)) continue;
          } else {
            if (shares <= 0 || totalCost <= 0) continue;
            if (Math.floor(shares * (pct / 100)) <= 0) continue;
          }
        }
        cands.push({ ma, sigCfg: cfg, sig, currClose, conds: [base, ...parts] });
      }
    }
        // 확정: min/max 방향별 극값 네팅 1건 / all 방향별 복리합산 후 네팅 1건
    const execs: { cand: { ma: any; sigCfg: any; sig: 'golden' | 'dead'; currClose: number; conds: string[] }; pct: number; conds: string[]; note?: string; detail: string[] }[] = [];
    {
      const mm = maMode;
      const ownPct = (c: { sigCfg: any }) => Math.max(1, Math.min(100, c.sigCfg.percent));
      const isBuy = (c: { sigCfg: any }) => (c.sigCfg as any).action === 'buy';
          if (mm === 'minFirst' || mm === 'maxFirst') {
            // 방향별 극값 1개씩 뽑아 네팅 후 1건 (매수극값−매도극값, 양수 매수/음수 매도/0 관망)
            const pickExt = (list: typeof cands) => list.length ? [...list].sort((a, b) => mm === 'minFirst' ? ownPct(a) - ownPct(b) : ownPct(b) - ownPct(a))[0] : null;
            const bX = pickExt(cands.filter(isBuy));
            const sX = pickExt(cands.filter(c => !isBuy(c)));
            const netX = (bX ? ownPct(bX) : 0) - (sX ? ownPct(sX) : 0);
            // 상쇄된 쪽은 칩에 − 표시, 사유에 네팅 산식 표기
            const tagAway = (w: typeof cands[number] | null) => w ? [`− ${w.conds[0]}`, ...w.conds.slice(1)] : [];
            const spec = (w: typeof cands[number]) => maSpecLine(w.ma.period, w.sig, w.sigCfg, w.conds.slice(1));
            if (netX > 0 && bX) execs.push({ cand: bX, pct: netX, conds: [...bX.conds, ...tagAway(sX)],
              note: sX ? `극값 네팅(${bX.conds[0]} − ${sX.conds[0]} → 매수 ${netX}%)` : undefined,
              detail: sX ? [spec(bX), spec(sX)] : [spec(bX)] });
            else if (netX < 0 && sX) execs.push({ cand: sX, pct: -netX, conds: [...tagAway(bX), ...sX.conds],
              note: bX ? `극값 네팅(${bX.conds[0]} − ${sX.conds[0]} → 매도 ${-netX}%)` : undefined,
              detail: bX ? [spec(sX), spec(bX)] : [spec(sX)] });
          }
      else {
        // all: 방향별 복리합산 후 네팅해서 최종 1건 (합산 멤버는 + , 상쇄된 쪽은 − 표시)
        const buys = cands.filter(isBuy);
        const sells = cands.filter(c => !isBuy(c));
        const buySum = combinePct(buys.map(ownPct));
        const sellSum = combinePct(sells.map(ownPct));
        const net = Math.max(-100, Math.min(100, buySum - sellSum));
        const tagExtra = (list: typeof cands, rep: (typeof cands)[number]) =>
          list.flatMap(x => x === rep ? x.conds : [`+ ${x.conds[0]}`, ...x.conds.slice(1)]);
        const tagAwayList = (list: typeof cands) =>
          list.flatMap(x => [`− ${x.conds[0]}`, ...x.conds.slice(1)]);
        const spec = (w: typeof cands[number]) => maSpecLine(w.ma.period, w.sig, w.sigCfg, w.conds.slice(1));
        if (net > 0) { const t = buys[0]; execs.push({ cand: t, pct: net,
          conds: [...tagExtra(buys, t), ...tagAwayList(sells)],
          note: `복리 합산(${buys.map(x => x.conds[0]).join(' + ')} → ${buySum}%)${sells.length ? ` − (${sells.map(x => x.conds[0]).join(' + ')} → ${sellSum}%) = 매수 ${net}%` : ''}`,
          detail: [...buys.map(spec), ...sells.map(spec)] }); }
        else if (net < 0) { const t = sells[0]; execs.push({ cand: t, pct: -net,
          conds: [...tagAwayList(buys), ...tagExtra(sells, t)],
          note: `복리 합산(${sells.map(x => x.conds[0]).join(' + ')} → ${sellSum}%)${buys.length ? ` − (${buys.map(x => x.conds[0]).join(' + ')} → ${buySum}%) = 매도 ${-net}%` : ''}`,
          detail: [...sells.map(spec), ...buys.map(spec)] }); }
      }
    }
    for (const ex of execs) {
      {
        const ma = ex.cand.ma;
        const cfg = ex.cand.sigCfg;
        const sig = ex.cand.sig;
        const currClose = ex.cand.currClose;
        const pct = Math.max(1, Math.min(100, ex.pct));
        const condParts = ex.conds.slice(1);
        // 사유문은 대표 후보 자신의 필터 + 합산 산식만 (칩에는 전체 멤버 표시)
        const repParts = ex.cand.conds.slice(1);
        const aggNote = ex.note ? ` ${ex.note}` : '';
        if (cfg.action === 'buy') {
          const epM = execBaseAt(candles, i, opts);
          if (epM == null) continue;
          const buyPx = epM * (1 + slipR);
          const cost = Math.floor(cash * (pct / 100));
          if (cost < 1000 || cash < cost) continue;
          const wantBuy = Math.floor(cost / buyPx);
          const buyShares = Math.floor(wantBuy * fillR);
          if (buyShares <= 0) continue;
          const actualCost = buyShares * buyPx;
          const fee = Math.round(actualCost * feeRate);
          if (cash < actualCost + fee) continue;
          shares += buyShares;
          cash -= actualCost + fee;
          totalCost += actualCost + fee;
          const buyAvgPrice = shares > 0 ? totalCost / shares : 0;
          const buyHoldingValue = shares * currClose;
          const buyReason = `MA${ma.period} ${sig==='golden'?'골든':'데드'}(캔들 ${cfg.candleFilter}, 거래량 ${cfg.volumeFilter}, 정렬 ${cfg.alignment}, 유지${cfg.consecutive}봉${repParts.length ? `, ${repParts.join(' · ')}` : ''})${aggNote} - 매수 ${pct}% (체결가 ${buyPx.toLocaleString()}원), 수수료 ${fee.toLocaleString()}원`;
          const buyIdx = trades.length + 1;
          const buyConds = [`MA${ma.period} ${sig === 'golden' ? '골든' : '데드'} 매수 ${pct}%`, ...condParts];
          trades.push({ idx: buyIdx, date: candles[i].date, price: buyPx, action: 'buy', maPeriod: ma.period, percent: pct, sharesDelta: buyShares, amount: actualCost, fee, cashAfter: cash, sharesAfter: shares, profitRate: null, avgPrice: buyAvgPrice, holdingValue: buyHoldingValue, conds: buyConds, condDetail: ex.detail ?? [], wantedPrice: currClose, execMode: (opts.execDelay ?? 0) === 1 ? 'nextOpen' : 'close', slipPct: (opts.slippage ?? 0) * 100, fillPct: (opts.fillRatio ?? 1) * 100, wantedShares: wantBuy });
          reasons.push({ idx: buyIdx, reason: buyReason });
          const arr = tradeAtIdx.get(i) ?? [];
          arr.push({ action: 'buy', label: 'B', color: '#3b82f6', position: 'candle-top' });
          tradeAtIdx.set(i, arr);
        } else {
          if (shares <= 0 || totalCost <= 0) continue;
          const epM = execBaseAt(candles, i, opts);
          if (epM == null) continue;
          const wantSell = Math.floor(shares * (pct / 100));
          const sellShares = Math.floor(wantSell * fillR);
          if (sellShares <= 0) continue;
          const avg = totalCost / shares;
          const profitRateSell = ((currClose - avg) / avg) * 100;
          const sellPx = epM * (1 - slipR);
          const proceeds = sellShares * sellPx;
          const fee = Math.round(proceeds * feeRate);
          shares -= sellShares;
          cash += proceeds - fee;
          totalCost -= sellShares * avg;
          if (shares === 0) totalCost = 0;
          const avgAfterSell = shares > 0 ? totalCost / shares : 0;
          const holdingAfterSell = shares * currClose;
          const sellReason = `MA${ma.period} ${sig==='golden'?'골든':'데드'}(캔들 ${cfg.candleFilter}, 거래량 ${cfg.volumeFilter}, 정렬 ${cfg.alignment}, 유지${cfg.consecutive}봉${repParts.length ? `, ${repParts.join(' · ')}` : ''})${aggNote} - 매도 ${pct}% (수익률 ${profitRateSell.toFixed(2)}%, 체결가 ${sellPx.toLocaleString()}원, 수수료 ${fee.toLocaleString()}원)`;
          const sellIdx = trades.length + 1;
          const sellConds = [`MA${ma.period} ${sig === 'golden' ? '골든' : '데드'} 매도 ${pct}%`, ...condParts];
          trades.push({ idx: sellIdx, date: candles[i].date, price: sellPx, action: 'sell', maPeriod: ma.period, percent: pct, sharesDelta: sellShares, amount: proceeds, fee, cashAfter: cash, sharesAfter: shares, profitRate: profitRateSell, avgPrice: avgAfterSell, holdingValue: holdingAfterSell, conds: sellConds, condDetail: ex.detail ?? [], wantedPrice: currClose, execMode: (opts.execDelay ?? 0) === 1 ? 'nextOpen' : 'close', slipPct: (opts.slippage ?? 0) * 100, fillPct: (opts.fillRatio ?? 1) * 100, wantedShares: wantSell });
          reasons.push({ idx: sellIdx, reason: sellReason });
          const arr2 = tradeAtIdx.get(i) ?? [];
          arr2.push({ action: 'sell', label: 'S', color: '#ef4444', position: 'candle-bottom' });
          tradeAtIdx.set(i, arr2);
        }
      }
    }
  }
  const firstPrice = candles.length ? candles[bz0].close : 0;
  const lastPrice = candles.length ? candles[bz1].close : 0;
  return { trades, tradeAtIdx, crossAtIdx, reasons, cash, shares, firstPrice, lastPrice };
}
