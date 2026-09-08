/** 순수 트레이딩 시뮬레이션 엔진 — DOM·페이지 상태 무의존. 모든 입력은 인자로 받는다. */

import { computeSmaSeries } from './trend';
import type { Candle } from './Candle';
export type { Candle };

export namespace TradingSimulator {
  export interface BestConfig {
    maConfigs: MaConfig[];
    exitConfigs: ExitConfig[];
    /** 탐색에서 이긴 진입 조건중복 모드 */
    maResolveMode: ResolveMode;
    /** 탐색에서 이긴 실현 조건중복 모드 */
    exitResolveMode: ResolveMode;
  }

  /** findBestConfig 입력 — 조건 탐색 설정값만. 출력은 조건(maConfigs/exitConfigs/maResolveMode/exitResolveMode) */
  export interface FindBestOptions {
    trend?: number; riskAversion?: number;
    /** 매수 적용률 0~1 (기본 1) — 반환되는 MA 매수 percent에 곱함 */
    buyPctRate?: number;
    /** 매도 적용률 0~1 (기본 1) — 반환되는 MA 매도 percent·실현 sellPercent에 곱함 */
    sellPctRate?: number;
  }

  interface ScoreCandidateOptions { maMode: ResolveMode; xMode: ResolveMode; riskAversion: number }
  interface ScoreCandidateResult { score: number; roi: number; mdd: number; trades: number; conflicts: number }

  const scoreCandidate = (candles: SimCandle[], maConfigs: MaConfig[], exits: ExitConfig[], opts: ScoreCandidateOptions): ScoreCandidateResult => {
    const { maMode, xMode } = opts;
    const riskAversion = Math.max(0, opts.riskAversion ?? DEFAULT_RISK_AVERSION);
    const empty: ScoreCandidateResult = { score: -Infinity, roi: 0, mdd: 100, trades: 0, conflicts: 0 };
    if (!candles.length || !maConfigs.length) return empty;
    const exitList: any[] = Array.isArray(exits) ? exits : [];
    const maMap = new Map<number, (number | null)[]>();
    for (const ma of maConfigs) { maMap.set(ma.period, computeSmaSeries(candles.map(c => c.close), ma.period)); }
    const sortedMas = [...maConfigs].sort((a, b) => a.period - b.period);
    const reqFrom = sortedMas.length ? Math.max(...sortedMas.map((m: any) => m.period)) : 0;
    const isAligned = (idx: number) => { const f = sortedMas.map(ma => ({ period: ma.period, v: maMap.get(ma.period)![idx] })).filter(x => x.v != null) as any[]; if (f.length < 2) return true; for (let k = 0; k < f.length - 1; k++) if (!(f[k].v > f[k + 1].v)) return false; return true; };
    const isRev = (idx: number) => { const f = sortedMas.map(ma => ({ period: ma.period, v: maMap.get(ma.period)![idx] })).filter(x => x.v != null) as any[]; if (f.length < 2) return true; for (let k = 0; k < f.length - 1; k++) if (!(f[k].v < f[k + 1].v)) return false; return true; };
    const checkAlignment = (maPeriod: number, idx: number, mode: string) => { const cur = maMap.get(maPeriod)?.[idx]; if (cur == null) return false; if (mode === 'any') return true; if (mode === 'aligned') return isAligned(idx); if (mode === 'reverse') return isRev(idx); const larger = [...maMap.entries()].filter(([p]) => p > maPeriod).map(([, arr]) => arr[idx]).filter(v => v != null) as number[]; const smaller = [...maMap.entries()].filter(([p]) => p < maPeriod).map(([, arr]) => arr[idx]).filter(v => v != null) as number[]; if (mode === 'largerAbove') return larger.length > 0 && larger.every(v => v > cur); if (mode === 'largerBelow') return larger.length > 0 && larger.every(v => v < cur); if (mode === 'smallerAbove') return smaller.length > 0 && smaller.every(v => v > cur); if (mode === 'smallerBelow') return smaller.length > 0 && smaller.every(v => v < cur); return true; };
    let shares = 0, totalCost = 0, spent = 0, got = 0, spentMax = 0;
    let peakPrice = 0, troughPrice = 0, trades = 0, conflicts = 0;
    let peakEq = 0, maxDDu = 0, maSkipRemaining = 0;
    let barDir: string | null = null;
    const tradeActions: string[] = [];
    const sigStreak = new Map<any, number>();
    const coolUntil = new Map<any, number>();
    const pushEq = (eq: number) => { peakEq = Math.max(peakEq, eq); maxDDu = Math.max(maxDDu, peakEq - eq); };
    for (let i = 1; i < candles.length; i++) {
      if (shares > 0) { peakPrice = Math.max(peakPrice, candles[i].close); troughPrice = troughPrice ? Math.min(troughPrice, candles[i].close) : candles[i].close; } else { peakPrice = 0; troughPrice = 0; }
      if (shares > 0 && totalCost > 0) {
        const avg = totalCost / shares; const currClose = candles[i].close; const profitRate = ((currClose - avg) / avg) * 100; const peakDrop = peakPrice > 0 ? ((peakPrice - currClose) / peakPrice) * 100 : 0; const troughRise = troughPrice > 0 ? ((currClose - troughPrice) / troughPrice) * 100 : 0;
        let exitExecuted = false;
        const exitCands: any[] = [];
        for (const ex of exitList) {
          let should = false;
          if (ex.basis === 'profitRise') should = profitRate >= ex.percent;
          else if (ex.basis === 'profitFall') should = profitRate <= -ex.percent;
          else if (ex.basis === 'peakFall') should = peakDrop >= ex.percent;
          else if (ex.basis === 'peakRise') should = troughRise >= ex.percent;
          if (!should) continue;
          if (ex.candle !== 'any') { const isBull = candles[i].close > candles[i].open; const isBear = candles[i].close < candles[i].open; if (ex.candle === 'bull' && !isBull) should = false; if (ex.candle === 'bear' && !isBear) should = false; }
          if (should && ex.volume !== 'any' && i > 0) { if (ex.volume === 'higher' && !(candles[i].volume > candles[i - 1].volume)) should = false; if (ex.volume === 'lower' && !(candles[i].volume < candles[i - 1].volume)) should = false; }
          if (!should) continue;
          const sellShares = shares * (ex.sellPercent / 100); if (sellShares <= 1e-12) continue;
          exitCands.push(ex);
        }
        if (exitCands.length) {
          const xm = xMode;
          let execEx = exitCands[0];
          if (xm === 'minFirst' || xm === 'maxFirst') {
            const sorted = [...exitCands].sort((a, b) => xm === 'minFirst' ? (Number(a.sellPercent) || 0) - (Number(b.sellPercent) || 0) : (Number(b.sellPercent) || 0) - (Number(a.sellPercent) || 0));
            execEx = sorted[0];
          }
          else if (xm === 'all') execEx = { ...exitCands[0], sellPercent: combinePct(exitCands.map(e => Number(e.sellPercent) || 0)) };
          const ex = execEx;
          const sellShares = shares * (ex.sellPercent / 100);
          if (sellShares > 1e-12) {
            const avg2 = totalCost / shares; const proceeds = sellShares * candles[i].close;
            shares -= sellShares; got += proceeds; totalCost -= sellShares * avg2;
            if (shares <= 1e-12) { shares = 0; totalCost = 0; }
            trades++; maSkipRemaining = ex.skip; exitExecuted = true;
          }
        }
        if (exitExecuted) { pushEq(got - spent + shares * candles[i].close); continue; }
      }
      if (maSkipRemaining > 0) { pushEq(got - spent + shares * candles[i].close); maSkipRemaining--; continue; }
      barDir = null;
      const cands: { ma: any; sigCfg: any; sig: 'golden' | 'dead'; currClose: number }[] = [];
      for (const ma of sortedMas) {
        if (i < reqFrom) break; // 전체 이평선 존재 조건: 최장기선 미형성 구간 매매 스킵
        const vals = maMap.get(ma.period)!; const prevMA = vals[i - 1]; const currMA = vals[i]; if (prevMA == null || currMA == null) continue;
        const currClose = candles[i].close;
        const isAbove = currClose > currMA; const isBelow = currClose < currMA;
        const signals: any[] = (ma.pyramiding as any).signals || [];
        for (let sIdx = 0; sIdx < signals.length; sIdx++) {
          const sigCfg: any = signals[sIdx]; const sigType = sigCfg.signal as 'golden' | 'dead';
          let sig: 'golden' | 'dead' | null = null;
          if (sigType === 'golden') { if (isAbove) sig = 'golden'; } else { if (isBelow) sig = 'dead'; }
          const sigKey = `${ma.period}-${sIdx}`;
          if (!sig) { sigStreak.set(sigKey, 0); continue; }
          if ((coolUntil.get(sigCfg) ?? -1) >= i) { sigStreak.set(sigKey, 0); continue; } // 매매후 스킵 쿨다운
          const align = sigCfg.alignment ?? 'any'; if (align !== 'any' && !checkAlignment(ma.period, i, align)) { sigStreak.set(sigKey, 0); continue; }
          const need = Math.max(1, Math.min(10, sigCfg.consecutive ?? 2));
          const holdingNow = sig === 'golden' ? isAbove : isBelow; const cur = holdingNow ? (sigStreak.get(sigKey) ?? 0) + 1 : 1; sigStreak.set(sigKey, cur);
          if (cur < need) continue;
          const ct0 = sigCfg.condTrade;
          if (ct0 && ct0.type !== 'any') {
            let count = 0;
            if (ct0.type === 'consecutiveBuy') { for (let k = tradeActions.length - 1; k >= 0; k--) { if (tradeActions[k] === 'buy') count++; else break; } }
            else if (ct0.type === 'consecutiveSell') { for (let k = tradeActions.length - 1; k >= 0; k--) { if (tradeActions[k] === 'sell') count++; else break; } }
            else if (ct0.type === 'consecutiveSelected') { const target = sigCfg.action; for (let k = tradeActions.length - 1; k >= 0; k--) { if (tradeActions[k] === target) count++; else break; } }
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
            else if (cm0.type === 'maSlope') { const maVal = maMap.get(ma.period)?.[i]; const prevMaVal = maMap.get(ma.period)?.[i - 1]; if (maVal == null || prevMaVal == null || prevMaVal === 0) count = 0; else count = ((maVal - prevMaVal) / prevMaVal) * 100; }
            if (!condMet(count, cm0.operator, cm0.value)) continue;
          }
          const cfgPre: any = sigCfg;
          if ((cfgPre as any).action === 'buy') {
            const candleOk = (cfgPre as any).candleFilter === 'any' || ((cfgPre as any).candleFilter === 'bull' ? candles[i].close > candles[i].open : candles[i].close < candles[i].open);
            const volOk = (cfgPre as any).volumeFilter === 'any' || (i > 0 && ((cfgPre as any).volumeFilter === 'higher' ? candles[i].volume > candles[i - 1].volume : candles[i].volume < candles[i - 1].volume));
            if (!candleOk || !volOk) continue;
          } else {
            const candleOk = (cfgPre as any).candleFilter === 'any' || ((cfgPre as any).candleFilter === 'bull' ? candles[i].close > candles[i].open : candles[i].close < candles[i].open);
            const volOk = (cfgPre as any).volumeFilter === 'any' || (i > 0 && ((cfgPre as any).volumeFilter === 'higher' ? candles[i].volume > candles[i - 1].volume : candles[i].volume < candles[i - 1].volume));
            if (!candleOk || !volOk) continue;
            if (shares <= 0 || totalCost <= 0) continue;
          }
          cands.push({ ma, sigCfg, sig, currClose });
        }
      }
      const execsM: { cand: { ma: any; sigCfg: any; sig: 'golden' | 'dead'; currClose: number }; pct: number }[] = [];
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
      for (const exm of execsM) {
        const sigCfg: any = exm.cand.sigCfg;
        const coolMembers = (action: 'buy' | 'sell'): void => { for (const m of cands) { if ((m.sigCfg as any).action !== action) continue; const sa = Math.max(0, Math.min(20, Math.round(Number((m.sigCfg as any).skipAfter) || 0))); if (sa > 0) coolUntil.set(m.sigCfg, i + sa); } };
        const cfg = sigCfg; const pct = Math.max(1, Math.min(100, exm.pct));
        const epM = candles[i].close;
        if ((cfg as any).action === 'buy') {
          const candleOk = (cfg as any).candleFilter === 'any' || ((cfg as any).candleFilter === 'bull' ? candles[i].close > candles[i].open : candles[i].close < candles[i].open);
          const volOk = (cfg as any).volumeFilter === 'any' || (i > 0 && ((cfg as any).volumeFilter === 'higher' ? candles[i].volume > candles[i - 1].volume : candles[i].volume < candles[i - 1].volume));
          if (!candleOk || !volOk) continue;
          const costU = pct / 100; // 1.0 단위 notional의 p% — 항상 전액 체결
          const buyShares = costU / epM;
          shares += buyShares; spent += costU; spentMax = Math.max(spentMax, spent); totalCost += costU;
          if (barDir && barDir !== 'buy') { conflicts++; } barDir = 'buy'; trades++; tradeActions.push('buy'); coolMembers('buy');
        } else {
          if (shares <= 0 || totalCost <= 0) continue;
          const candleOk = (cfg as any).candleFilter === 'any' || ((cfg as any).candleFilter === 'bull' ? candles[i].close > candles[i].open : candles[i].close < candles[i].open);
          const volOk = (cfg as any).volumeFilter === 'any' || (i > 0 && ((cfg as any).volumeFilter === 'higher' ? candles[i].volume > candles[i - 1].volume : candles[i].volume < candles[i - 1].volume));
          if (!candleOk || !volOk) continue;
          const sellShares = shares * (pct / 100);
          if (sellShares <= 1e-12) continue;
          const avg = totalCost / shares; const proceeds = sellShares * epM;
          shares -= sellShares; got += proceeds; totalCost -= sellShares * avg;
          if (shares <= 1e-12) { shares = 0; totalCost = 0; }
          if (barDir && barDir !== 'sell') { conflicts++; } barDir = 'sell'; trades++; tradeActions.push('sell'); coolMembers('sell');
        }
      }
      pushEq(got - spent + shares * candles[i].close);
    }
    if (!trades || spentMax <= 0) return empty;
    const profitU = got - spent + shares * candles[candles.length - 1].close;
    const roi = (profitU / spentMax) * 100;
    const mdd = (maxDDu / spentMax) * 100;
    return { score: roi - mdd * riskAversion, roi, mdd, trades, conflicts };
  };

  export const findBestConfig = (candles: SimCandle[], opts: FindBestOptions): BestConfig | null => {
    console.log('[findBestConfig] params:', JSON.stringify({ candles: candles.length, trend: opts.trend, riskAversion: opts.riskAversion, buyPctRate: opts.buyPctRate, sellPctRate: opts.sellPctRate }));
    const riskAversion = Number.isFinite(opts.riskAversion as number)
      ? Math.max(0, Math.min(1, opts.riskAversion as number))
      : DEFAULT_RISK_AVERSION;
    const trend = clampTrend(opts.trend ?? TREND_NEUTRAL);
    const buyR = Number.isFinite(opts.buyPctRate as number) && (opts.buyPctRate as number) >= 0 ? (opts.buyPctRate as number) : 1;
    const sellR = Number.isFinite(opts.sellPctRate as number) && (opts.sellPctRate as number) >= 0 ? (opts.sellPctRate as number) : 1;
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
    const cn = candles.length;
    // 최장기 MA 상한: 전체존재 조건 평가 시 최소 절반의 봉이 매매 구간으로 남도록 절반으로 제한
    const maxPeriodCap = Math.max(20, Math.min(240, Math.floor((cn - 1) / 2)));
    const rand = (n: number) => Math.floor(Math.random() * n);
    const pick = <T>(arr: T[]) => arr[rand(arr.length)];
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#06b6d4', '#8b5cf6', '#14b8a6'];
    /** 무관 가중 25% 뽑기 */
    const pickCandleF = (): 'any' | 'bull' | 'bear' => { const r = Math.random(); return r < 0.25 ? 'any' : r < 0.625 ? 'bull' : 'bear'; };
    const pickVolumeF = (): 'any' | 'higher' | 'lower' => { const r = Math.random(); return r < 0.25 ? 'any' : r < 0.625 ? 'higher' : 'lower'; };
    /** 조건그룹 무관 확률 30% */
    const ANY_COND_P = 0.3;
    const tradeConds = ['consecutiveBuy', 'consecutiveSell', 'consecutiveSelected'];
    const candleConds = ['consecutiveBullish', 'consecutiveBearish'];
    const maConds = ['maDeviation', 'maSlope'];
    const condOps = ['any', '<', '<=', '=', '!=', '>=', '>'] as const;
    // 탐색 출력 % 상한: 한 방 올인 방지 (MA 랜덤 ≤60, 앵커·실현만 해당)
    const MAX_OUT_PCT = 80;
    // 캔들 없이 opts prior만으로 추론 — 방향·범위 고정 + 중간값 ±5 지터
    const inferFromPrior = (): BestConfig => {
      const [bLo, bHi] = trendPctRange(true);
      const [sLo, sHi] = trendPctRange(false);
      const jit = (lo: number, hi: number) => Math.max(lo, Math.min(hi, Math.round((lo + hi) / 2) + Math.floor(Math.random() * 11) - 5));
      const noCond = { type: 'any' as const, operator: 'any' as const, value: 1 };
      const mkSig = (sig: 'golden' | 'dead', action: 'buy' | 'sell', pct: number): any => ({
        signal: sig, action, percent: scaleOutPct(pct, action === 'sell' ? sellR : buyR),
        candleFilter: action === 'buy' ? 'bull' : 'bear', volumeFilter: 'higher',
        consecutive: 2, alignment: sig === 'golden' ? 'aligned' : 'reverse', skipAfter: 0,
        condTrade: { ...noCond }, condCandle: { ...noCond }, condMa: { ...noCond },
      });
      const pool = [5, 10, 20, 30];
      const p1 = pool[Math.floor(Math.random() * pool.length)];
      let p2 = pool[Math.floor(Math.random() * pool.length)];
      if (p2 === p1) p2 = pool[(pool.indexOf(p1) + 1) % pool.length];
      const periods = [p1, p2].sort((a, b) => a - b);
      const maConfigs = periods.map((period, i) => ({
        period, color: colors[i % colors.length],
        pyramiding: { signals: [mkSig('golden', 'buy', jit(bLo, bHi)), mkSig('dead', 'sell', jit(sLo, sHi))] },
      }));
      const exitConfigs: any[] = [{ basis: 'profitRise', percent: 15, sellPercent: scaleOutPct(80, sellR), skip: 0, candle: 'any', volume: 'any' }];
      return { maConfigs, exitConfigs, maResolveMode: 'minFirst' as ResolveMode, exitResolveMode: 'minFirst' as ResolveMode };
    };
  if (!candles.length) return inferFromPrior();
  // 바깥에서 수익률 보고 추가 라운드를 돌리니 1회 탐색은 100회로 가볍게
  const trials = 100;
    let best: any = null;
    let bestScore = -Infinity;
    let bestClean: any = null;
    let bestCleanScore = -Infinity;
    const pool: { score: number; maConfigs: any[]; exitConfigs: any[] }[] = [];
    const clampN = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
    const evalCandles = (maCfgs: any[], exitCfgs: any[]) => {
      // MA 조건중복 3종 × 실현 조건중복 3종 전조합 평가해 이긴 쪽을 결과에 태그 (무자본)
      let winner: any = null;
      let winnerScore = -Infinity;
      for (const mm of RESOLVE_MODES) {
        for (const xm of EXIT_RESOLVE_MODES) {
          const r = scoreCandidate(candles, maCfgs as any, exitCfgs as any, { maMode: mm, xMode: xm, riskAversion });
          if (r.score > winnerScore) {
            winnerScore = r.score;
            winner = { ...r, maResolveMode: mm, exitResolveMode: xm };
          }
        }
      }
      return winnerScore > -Infinity ? winner : null;
    };
    const consider = (maCfgs: any[], exitCfgs: any[]) => {
      const w = evalCandles(maCfgs, exitCfgs);
      if (!w) return;
      const { score } = w;
      if (score > bestScore) {
        maCfgs.sort((a: any, b: any) => a.period - b.period);
        bestScore = score;
        best = { maConfigs: maCfgs, exitConfigs: exitCfgs, maResolveMode: w.maResolveMode, exitResolveMode: w.exitResolveMode, trades: w.trades, conflicts: w.conflicts, score };
      }
      if (w.conflicts === 0 && score > bestCleanScore) {
        bestCleanScore = score;
        bestClean = { maConfigs: maCfgs, exitConfigs: exitCfgs, maResolveMode: w.maResolveMode, exitResolveMode: w.exitResolveMode, trades: w.trades, conflicts: w.conflicts, score };
      }
      if (pool.length < 20 || score > pool[pool.length - 1].score) {
        pool.push({ score, maConfigs: JSON.parse(JSON.stringify(maCfgs)), exitConfigs: JSON.parse(JSON.stringify(exitCfgs)) });
        pool.sort((a, b) => b.score - a.score);
        if (pool.length > 20) pool.length = 20;
      }
    };
    const mutate = (src: { maConfigs: any[]; exitConfigs: any[] }): { maConfigs: any[]; exitConfigs: any[] } => {
      const c: { maConfigs: any[]; exitConfigs: any[] } = JSON.parse(JSON.stringify(src));
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
          const k = rand(7);
          if (k === 0) { s.percent = clampN(s.percent + [-10, -5, 5, 10][rand(4)], 1, 100); const [mLo, mHi] = trendPctRange(s.action === 'buy'); s.percent = clampN(s.percent, mLo, mHi); }
          else if (k === 1) { s.consecutive = clampN(s.consecutive + (Math.random() < 0.5 ? -1 : 1), 1, 10); if (trend < 0.5 && s.action === 'buy') s.consecutive = Math.max(2, s.consecutive); }
          else if (k === 2) s.action = s.action === 'buy' ? 'sell' : 'buy';
          else if (k === 3) s.candleFilter = pickCandleF();
          else if (k === 4) s.volumeFilter = pickVolumeF();
          else if (k === 5) s.alignment = alignForSignal(s.signal);
          else s.skipAfter = clampN((s.skipAfter ?? 0) + (Math.random() < 0.5 ? -1 : 1) * (1 + rand(2)), 0, 20);
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
              const pool2 = g === s.condTrade ? ['any', 'consecutiveBuy', 'consecutiveSell', 'consecutiveSelected']
                : g === s.condCandle ? ['any', 'consecutiveBullish', 'consecutiveBearish']
                  : ['any', 'maDeviation', 'maSlope'];
              g.type = Math.random() < ANY_COND_P ? 'any' : pick(pool2.slice(1) as any);
              if (g.type === 'any') g.operator = 'any';
              else if (g.operator === 'any') g.operator = pick((['<', '<=', '=', '!=', '>=', '>']) as any);
            }
          }
        }
      } else if (c.exitConfigs.length) {
        const e = pick(c.exitConfigs);
        const k = rand(4);
        if (k === 0) e.percent = clampN(e.percent + (Math.random() < 0.5 ? -1 : 1) * (1 + rand(4)), 1, 100);
        else if (k === 1) e.sellPercent = clampN(e.sellPercent + (Math.random() < 0.5 ? -1 : 1) * (5 + rand(10)), 1, MAX_OUT_PCT);
        else if (k === 2) e.skip = clampN(e.skip + (Math.random() < 0.5 ? -1 : 1), 0, 20);
        else {
          const others = c.exitConfigs.filter((x: any) => x !== e);
          if (others.length && Math.random() < 0.5) {
            const src = pick(others);
            e.basis = src.basis; e.candle = src.candle; e.volume = src.volume;
          } else e.basis = pick(['profitRise', 'profitFall', 'peakFall', 'peakRise'] as const);
        }
      }
      return c;
    };
    // 베이스라인 2종을 먼저 평가 — 명백한 추세가 있을 때 0거래(관망)가 최적이라고 나오는 것 방지
    const baselineExits: any[] = [{ basis: 'profitRise', percent: 15, sellPercent: MAX_OUT_PCT, skip: 0, candle: 'any', volume: 'any' }];
    const blPct = (p: number, isBuy: boolean) => {
      if (trend === 0.5) return Math.min(p, MAX_OUT_PCT);
      const [, hi] = trendPctRange(isBuy);
      return Math.min(p, hi, MAX_OUT_PCT);
    };
    const baseline = (periods: number[]) => periods.map((period, i) => ({ period, color: colors[i % colors.length], pyramiding: { signals: (['golden', 'dead'] as const).map(sig => ({ signal: sig, action: sig === 'golden' ? 'buy' : 'sell', percent: sig === 'golden' ? blPct(99, true) : blPct(100, false), candleFilter: 'any', volumeFilter: 'any', consecutive: 2, alignment: 'any', condTrade: { type: 'any' as const, operator: 'any' as const, value: 1 }, condCandle: { type: 'any' as const, operator: 'any' as const, value: 1 }, condMa: { type: 'any' as const, operator: 'any' as const, value: 1 } })) } }));
    // NOTE: 매수 percent 100은 수수료 여유분이 없어 단 1주도 체결되지 않으므로 99 사용
    consider(baseline([5, 20]), baselineExits);
    consider(baseline([10, 30, 60]), baselineExits);
    // 데이터 기반 기간 가중치: 표준 기간 단순전략(골든 전량매수/데드 전량매도) 점수로 기간 우선순위 산출
    const periodPool = [5, 10, 20, 30, 60, 90, 120, 200].filter(v => v <= maxPeriodCap);
    const noCond = { type: 'any' as const, operator: 'any' as const, value: 1 };
    const simpleExits: any[] = [{ basis: 'profitRise', percent: 15, sellPercent: MAX_OUT_PCT, skip: 0, candle: 'any', volume: 'any' }];
    const periodScore = new Map<number, number>();
    for (const pp of periodPool) {
      const pm = scoreCandidate(candles, [{ period: pp, color: '#888888', pyramiding: { signals: [
        { signal: 'golden', action: 'buy', percent: 99, candleFilter: 'any', volumeFilter: 'any', consecutive: 1, alignment: 'any', condTrade: { ...noCond }, condCandle: { ...noCond }, condMa: { ...noCond } },
        { signal: 'dead', action: 'sell', percent: 100, candleFilter: 'any', volumeFilter: 'any', consecutive: 1, alignment: 'any', condTrade: { ...noCond }, condCandle: { ...noCond }, condMa: { ...noCond } },
      ] } }], simpleExits, { maMode: 'minFirst', xMode: 'minFirst', riskAversion });
      periodScore.set(pp, Number.isFinite(pm.roi) ? pm.roi : -Infinity);
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
      for (let a = 0; a < 50; a++) { const q = 3 + rand(maxPeriodCap - 2); if (maGapOk(q, used)) { used.add(q); return q; } }
      for (let a = 0; a < 50; a++) { const q = 3 + rand(maxPeriodCap - 2); if (!used.has(q)) { used.add(q); return q; } }
      const fallback = 3 + rand(maxPeriodCap - 2);
      used.add(fallback);
      return fallback;
    };
    for (let phase = 0; phase < 2; phase++) {
      const relaxed = phase === 1;
      // 1차에서 거래 있는 최적값을 찾았으면 2차(조건 완화) 생략
      if (relaxed && (best?.trades ?? 0) > 0) break;
      if (relaxed) console.log(`[findBest] phase0 trades=${best?.trades ?? 0} score=${bestScore === -Infinity ? '-Inf' : bestScore.toFixed(2)} → relaxed(무관 70%) 진입`);
      for (let t = 0; t < trials; t++) {
        const maCount = 2 + rand(3);
        const used = new Set<number>();
        const maConfigs = Array.from({ length: maCount }, () => {
          const period = pickPeriod(used);
          const color = colors[rand(colors.length)];
          const mkSide = (sg: 'golden' | 'dead') => {
            const action = pickAction();
            // 하락 예상이면 매수는 유지봉 +1 (반등 확인 후 진입, 떨어지는 칼날 방지). 중립은 그대로.
            const consBoost = (trend < 0.5 && action === 'buy') ? 1 : 0;
            const [pctLo, pctHi] = trendPctRange(action === 'buy');
            return {
              action,
              percent: pctLo + rand(pctHi - pctLo + 1),
              candleFilter: relaxed && Math.random() < 0.7 ? 'any' : pickCandleF(),
              volumeFilter: relaxed && Math.random() < 0.7 ? 'any' : pickVolumeF(),
              consecutive: (relaxed ? 1 + rand(2) : 2 + rand(2)) + consBoost,
              alignment: relaxed ? 'any' : alignForSignal(sg),
              skipAfter: relaxed ? 0 : rand(4),
              condTrade: relaxed ? { type: 'any' as const, operator: 'any' as const, value: 1 } : (Math.random() < ANY_COND_P ? { type: 'any' as const, operator: 'any' as const, value: 1 } : { type: pick(tradeConds) as any, operator: pick([...condOps].filter(o => o !== 'any')) as any, value: 1 + rand(5) }),
              condCandle: relaxed ? { type: 'any' as const, operator: 'any' as const, value: 1 } : (Math.random() < ANY_COND_P ? { type: 'any' as const, operator: 'any' as const, value: 1 } : { type: pick(candleConds) as any, operator: pick([...condOps].filter(o => o !== 'any')) as any, value: 1 + rand(5) }),
              condMa: relaxed ? { type: 'any' as const, operator: 'any' as const, value: 1 } : (Math.random() < ANY_COND_P ? { type: 'any' as const, operator: 'any' as const, value: 1 } : { type: pick(maConds) as any, operator: pick([...condOps].filter(o => o !== 'any')) as any, value: Number((Math.random() * 20 - 10).toFixed(1)) }),
            };
          };
          const sigCount = 1 + rand(3);
          const sigs = Array.from({ length: sigCount }, () => { const sg = pick(['golden', 'dead'] as const); return { signal: sg, ...mkSide(sg) }; });
          return { period, color, pyramiding: { signals: sigs } };
        });
        sanitizeAlignments(maConfigs);
        const filtered = maConfigs.filter(m => (m.pyramiding.signals || []).length > 0);
        if (!filtered.length) continue;
        const exitCount = 1 + rand(2);
        const exitConfigs: any[] = Array.from({ length: exitCount }, () => {
          const b = pick(['profitRise', 'profitFall', 'peakFall', 'peakRise'] as const);
          return { basis: b, percent: 5 + rand(21), sellPercent: 30 + rand(51), skip: rand(6), candle: pickCandleF(), volume: pickVolumeF() };
        });
        // 2개일 때 50% 확률로 계단식 청산: 같은 basis + 다른 임계값
        if (exitConfigs.length === 2 && Math.random() < 0.5) {
          const first = exitConfigs[0], second = exitConfigs[1];
          second.basis = first.basis;
          second.percent = first.percent >= 15 ? first.percent - 7 : first.percent + 7;
          second.candle = first.candle;
          second.volume = first.volume;
        }
        consider(filtered, exitConfigs);
      }
    }
    // hill-climb: 상위 후보를 변이시키며 점수 수렴 (랜덤 탐색 보완)
    const elites = pool.slice(0, 5);
    for (const e of elites) {
      for (let g = 0; g < 30; g++) {
        const mutated = mutate({ maConfigs: e.maConfigs, exitConfigs: e.exitConfigs });
        consider(mutated.maConfigs, mutated.exitConfigs);
      }
    }
    const _best = bestClean ?? best; // 같은 틱 반대매매 없는 후보 우선 (없을 때만 전체 최적)
    if (!_best || (_best?.trades ?? 0) === 0) {
      // 거래 0건 승자는 무관 쓰레기 — prior 추론으로 대체
      console.log(`[findBest] no tradable winner (trades=0) → prior inference (trend=${trend})`);
      return inferFromPrior();
    }
    // pool/후보 공유 참조 오염 방지 — 깊은 복사 후 적용률 스케일해 반환
    const out = JSON.parse(JSON.stringify(_best));
    for (const m of out.maConfigs ?? []) {
      for (const s of (m?.pyramiding?.signals ?? []) as any[]) {
        s.percent = scaleOutPct(s.percent, s.action === 'sell' ? sellR : buyR);
      }
    }
    for (const e of out.exitConfigs ?? []) {
      e.sellPercent = scaleOutPct(Number(e.sellPercent) || 0, sellR);
    }
    const src = _best === bestClean ? 'clean' : 'raw';
    console.log(`[findBest] winner src=${src} periods=[${(out.maConfigs ?? []).map((m: any) => m.period).join(',')}] trades=${_best?.trades ?? 0} score=${Number(_best?.score)?.toFixed?.(2) ?? _best?.score}`);
    return {
      maConfigs: out.maConfigs,
      exitConfigs: out.exitConfigs,
      maResolveMode: out.maResolveMode,
      exitResolveMode: out.exitResolveMode,
    };
  };

  export interface SimulateOptions {
    initialCapital: number; feePercent: number; requireAll: boolean;
    simFrom?: number; simTo?: number;
    initialShares?: number; initialAvgPrice?: number;
  }

  export const simulate = (candles: SimCandle[], config: BestConfig, opts: SimulateOptions): SimResult => {
    const { maConfigs, exitConfigs: exits, maResolveMode: maMode, exitResolveMode: xMode } = config;
    const { initialCapital, feePercent, requireAll } = opts;
    const simFrom = opts.simFrom ?? 0;
    const simTo = opts.simTo ?? candles.length - 1;
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
    let shares = opts.initialShares ?? 0;
    let totalCost = shares > 0 ? (opts.initialAvgPrice ?? 0) * shares : 0;
    const feeRate = feePercent / 100;
    let peakPrice = 0;
    let troughPrice = 0;
    const trades: SimTrade[] = [];
    const sigStreak = new Map<any, number>();
    const coolUntil = new Map<any, number>();
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
          const epX = candles[i].close;
          const sellShares = sellSharesRaw;
          if (sellShares > 0) {
            const sellPx = epX;
            const proceeds = sellShares * sellPx;
            const fee = Math.round(proceeds * feeRate);
            shares -= sellShares;
            cash += proceeds - fee;
            totalCost -= sellShares * avg;
            if (shares === 0) totalCost = 0;
            const label = '청';
            const profitNow = ((currClose - avg) / avg) * 100;
            const avgAfter = shares > 0 ? totalCost / shares : 0;
            const holdingValue = shares * currClose;
            const exitFilters = `${ex.candle !== 'any' ? `, 캔들 ${ex.candle}` : ''}${ex.volume !== 'any' ? `, 거래량 ${ex.volume}` : ''}`;
            const reason = `실현 ${basisLabel} ${ex.percent}%${exitFilters} (수익률 ${profitNow.toFixed(2)}%, avg ${avg.toFixed(0)}→${currClose}) ${ex.sellPercent}% 매도${(ex as any)._aggNote ?? ''}, 수수료 ${fee.toLocaleString()}원, 이후 ${ex.skip}회 스킵`;
            const tIdx = trades.length + 1;
              trades.push({ idx: tIdx, date: candles[i].date, price: sellPx, action: 'exit', barIdx: i, reason, maPeriod: 0, percent: ex.sellPercent, sharesDelta: sellShares, amount: proceeds, fee, cashAfter: cash, sharesAfter: shares, label, profitRate: profitNow, avgPrice: avgAfter, holdingValue, conds: execConds, condDetail: (ex as any)._detail ?? [exitSpecLine(execBasis, ex)] });
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
        const currClose = candles[i].close;
        const isAbove = currClose > currMA;
        const isBelow = currClose < currMA;
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
          if ((coolUntil.get(sigCfg) ?? -1) >= i) { sigStreak.set(sigKey, 0); continue; } // 매매후 스킵 쿨다운
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
          // 탈락분은 buy-fail로 사유 기록 (상태 불변 — 쿨다운·연속기록에 영향 없음)
          if (maMode === 'minFirst' || maMode === 'maxFirst') {
            if (cfg.action === 'buy') {
              const failPush = (why: string) => {
                trades.push({ idx: trades.length + 1, date: candles[i].date, price: candles[i].close, action: 'buy-fail', barIdx: i, reason: `${base} 시도 - 실패: ${why}`, maPeriod: ma.period, percent: pct, sharesDelta: 0, amount: 0, fee: 0, cashAfter: cash, sharesAfter: shares, profitRate: null, avgPrice: shares > 0 ? totalCost / shares : 0, holdingValue: shares * candles[i].close, conds: [base, ...parts], condDetail: [maSpecLine(ma.period, sig, cfg, parts)] });
              };
              const cost = Math.floor(cash * (pct / 100));
              if (cost < 1000 || cash < cost) {
                failPush(cost < 1000 ? `주문금액 ${cost.toLocaleString()}원 (최소 1,000원 미만)` : `현금 부족 (주문 ${cost.toLocaleString()}원, 보유 ${cash.toLocaleString()}원)`);
                continue;
              }
              const epPre = candles[i].close;
              const buyPxPre = epPre;
              const buyShares = Math.floor(cost / buyPxPre);
              if (buyShares <= 0) {
                failPush(`1주 매수 불가 (주가 ${buyPxPre.toLocaleString()}원, 주문금액 ${cost.toLocaleString()}원)`);
                continue;
              }
              if (cash < buyShares * buyPxPre + Math.round(buyShares * buyPxPre * feeRate)) {
                failPush(`수수료 포함 부족 (필요 ${(buyShares * buyPxPre + Math.round(buyShares * buyPxPre * feeRate)).toLocaleString()}원, 보유 ${cash.toLocaleString()}원)`);
                continue;
              }
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
          // 같은 방향 후보 전원에 매매후 스킵 적용 (실제 체결 시)
          const coolMembers = (action: 'buy' | 'sell'): void => { for (const m of cands) { if ((m.sigCfg as any).action !== action) continue; const sa = Math.max(0, Math.min(20, Math.round(Number((m.sigCfg as any).skipAfter) || 0))); if (sa > 0) coolUntil.set(m.sigCfg, i + sa); } };
          const pct = Math.max(1, Math.min(100, ex.pct));
          const condParts = ex.conds.slice(1);
          // 사유문은 대표 후보 자신의 필터 + 합산 산식만 (칩에는 전체 멤버 표시)
          const repParts = ex.cand.conds.slice(1);
          const aggNote = ex.note ? ` ${ex.note}` : '';
          if (cfg.action === 'buy') {
            const epM = candles[i].close;
            const buyPx = epM;
            const failBase = `MA${ma.period} ${sig === 'golden' ? '골든' : '데드'}(캔들 ${cfg.candleFilter}, 거래량 ${cfg.volumeFilter}, 정렬 ${cfg.alignment}, 유지${cfg.consecutive}봉${repParts.length ? `, ${repParts.join(' · ')}` : ''})${aggNote} - 매수 ${pct}% 시도`;
            const failConds = [`MA${ma.period} ${sig === 'golden' ? '골든' : '데드'} 매수 ${pct}%`, ...condParts];
            const pushBuyFail = (why: string) => {
              trades.push({ idx: trades.length + 1, date: candles[i].date, price: buyPx, action: 'buy-fail', barIdx: i, reason: `${failBase} - 실패: ${why}`, maPeriod: ma.period, percent: pct, sharesDelta: 0, amount: 0, fee: 0, cashAfter: cash, sharesAfter: shares, profitRate: null, avgPrice: shares > 0 ? totalCost / shares : 0, holdingValue: shares * currClose, conds: failConds, condDetail: ex.detail ?? [] });
            };
            const cost = Math.floor(cash * (pct / 100));
            if (cost < 1000 || cash < cost) {
              pushBuyFail(cost < 1000 ? `주문금액 ${cost.toLocaleString()}원 (최소 1,000원 미만)` : `현금 부족 (주문 ${cost.toLocaleString()}원, 보유 ${cash.toLocaleString()}원)`);
              continue;
            }
            const wantBuy = Math.floor(cost / buyPx);
            const buyShares = wantBuy;
            if (buyShares <= 0) {
              pushBuyFail(`1주 매수 불가 (주가 ${buyPx.toLocaleString()}원, 주문금액 ${cost.toLocaleString()}원)`);
              continue;
            }
            const actualCost = buyShares * buyPx;
            const fee = Math.round(actualCost * feeRate);
            if (cash < actualCost + fee) {
              pushBuyFail(`수수료 포함 부족 (필요 ${(actualCost + fee).toLocaleString()}원, 보유 ${cash.toLocaleString()}원)`);
              continue;
            }
            shares += buyShares;
            cash -= actualCost + fee;
            totalCost += actualCost + fee;
            const buyAvgPrice = shares > 0 ? totalCost / shares : 0;
            const buyHoldingValue = shares * currClose;
            const buyReason = `MA${ma.period} ${sig==='golden'?'골든':'데드'}(캔들 ${cfg.candleFilter}, 거래량 ${cfg.volumeFilter}, 정렬 ${cfg.alignment}, 유지${cfg.consecutive}봉${repParts.length ? `, ${repParts.join(' · ')}` : ''})${aggNote} - 매수 ${pct}% (체결가 ${buyPx.toLocaleString()}원), 수수료 ${fee.toLocaleString()}원`;
            const buyIdx = trades.length + 1;
            const buyConds = [`MA${ma.period} ${sig === 'golden' ? '골든' : '데드'} 매수 ${pct}%`, ...condParts];
            trades.push({ idx: buyIdx, date: candles[i].date, price: buyPx, action: 'buy', barIdx: i, reason: buyReason, maPeriod: ma.period, percent: pct, sharesDelta: buyShares, amount: actualCost, fee, cashAfter: cash, sharesAfter: shares, profitRate: null, avgPrice: buyAvgPrice, holdingValue: buyHoldingValue, conds: buyConds, condDetail: ex.detail ?? [] });
            coolMembers('buy');
          } else {
            if (shares <= 0 || totalCost <= 0) continue;
            const epM = candles[i].close;
            const wantSell = Math.floor(shares * (pct / 100));
            const sellShares = wantSell;
            if (sellShares <= 0) continue;
            const avg = totalCost / shares;
            const profitRateSell = ((currClose - avg) / avg) * 100;
            const sellPx = epM;
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
            trades.push({ idx: sellIdx, date: candles[i].date, price: sellPx, action: 'sell', barIdx: i, reason: sellReason, maPeriod: ma.period, percent: pct, sharesDelta: sellShares, amount: proceeds, fee, cashAfter: cash, sharesAfter: shares, profitRate: profitRateSell, avgPrice: avgAfterSell, holdingValue: holdingAfterSell, conds: sellConds, condDetail: ex.detail ?? [] });
            coolMembers('sell');
          }
        }
      }
    }
    const lastClose = candles.length ? candles[bz1].close : 0;
    const evalAmt = cash + shares * lastClose;
    const startEquity = initialCapital + (opts.initialShares ?? 0) * (opts.initialAvgPrice ?? 0);
    const profit = evalAmt - startEquity;
    return { trades, cash, shares, profit, rate: startEquity ? (profit / startEquity) * 100 : 0 };
  };
}

export type ResolveMode = 'minFirst' | 'maxFirst' | 'all';
const RESOLVE_MODES: ResolveMode[] = ['minFirst', 'maxFirst', 'all'];
const EXIT_RESOLVE_MODES: ResolveMode[] = ['minFirst', 'maxFirst', 'all'];
export const isResolveMode = (v: string | null): v is ResolveMode => v === 'minFirst' || v === 'maxFirst' || v === 'all';

/**
 * 복리 합성: p1% 차감 후 잔량에서 p2% 차감... 순차 누적과 동등한 실효 %를 1건으로 압축.
 * 예: [10, 20] → 28 (단순합 30이 아님)
 */
const LBL_CANDLE: Record<string, string> = { any: '무관', bull: '양봉', bear: '음봉' };
const LBL_VOL: Record<string, string> = { any: '무관', higher: '증가', lower: '감소' };
const LBL_ALIGN: Record<string, string> = { any: '무관', aligned: '정배열', reverse: '역배열', largerAbove: '큰MA 위', largerBelow: '큰MA 아래', smallerAbove: '작은MA 위', smallerBelow: '작은MA 아래' };

/** MA 멤버 조건 1건의 전체 스펙 한 줄 (팝업 구성 섹션용) */
const maSpecLine = (period: number, sig: 'golden' | 'dead', s: MaSignal, trioParts: string[]): string => {
  const dir = s.action === 'buy' ? '매수' : '매도';
  const pct = Math.max(1, Math.min(100, s.percent));
  const base = `MA${period} ${sig === 'golden' ? '골든' : '데드'} ${dir} ${pct}%`;
  const filt = [`캔들 ${LBL_CANDLE[s.candleFilter] ?? s.candleFilter}`, `거래량 ${LBL_VOL[s.volumeFilter] ?? s.volumeFilter}`, `배열 ${LBL_ALIGN[s.alignment] ?? s.alignment}`, `유지${s.consecutive}봉${(s.skipAfter ?? 0) > 0 ? `·매매후${s.skipAfter}봉쉼` : ''}`];
  return `${base} · ${[...filt, ...trioParts].join(' · ')}`;
};

/** 실현 멤버 조건 1건의 전체 스펙 한 줄 (팝업 구성 섹션용) */
const exitSpecLine = (basisLabel: string, ex: ExitConfig): string => {
  return `청산 ${basisLabel} ${ex.percent}% · 매도 ${ex.sellPercent}% · 캔들 ${LBL_CANDLE[ex.candle] ?? ex.candle} · 거래량 ${LBL_VOL[ex.volume] ?? ex.volume} · 스킵 ${ex.skip}회`;
};

export const combinePct = (pcts: number[]): number => {
  let remain = 1;
  for (const p of pcts) {
    const c = Math.max(0, Math.min(100, p)) / 100;
    remain *= (1 - c);
  }
  return Math.min(100, Math.round((1 - remain) * 100 * 1e6) / 1e6);
};

/** 낙폭 회피 계수 λ 0~1 (기본 0.5). 0=수익만, 1=최대 방어. score = 수익률% − λ·MDD% (capital 무관) */
const DEFAULT_RISK_AVERSION = 0.5;

/**
 * 예상 추세 지수 0~1: 0 = 하락 100%, 0.5 = 중립, 1 = 상승 100%.
 * UI 선택은 프리셋 매핑(모름/횡보=0.5, 상승=1, 하락=0), 향후 자동 연산값 주입용.
 */
const TREND_NEUTRAL = 0.5;
const clampTrend = (s: number): number =>
  Number.isFinite(s) ? Math.max(0, Math.min(1, s)) : TREND_NEUTRAL;

export interface SimCandle extends Candle {}

export interface CondGroup { type: string; operator: string; value: number }
export interface MaSignal {
  signal: 'golden' | 'dead'; action: 'buy' | 'sell'; percent: number;
  candleFilter: 'any' | 'bull' | 'bear'; volumeFilter: 'any' | 'higher' | 'lower'; consecutive: number;
  alignment: 'any' | 'aligned' | 'reverse' | 'largerAbove' | 'largerBelow' | 'smallerAbove' | 'smallerBelow';
  condTrade: CondGroup; condCandle: CondGroup; condMa: CondGroup;
  /** 이 신호로 매매 후 쉬는 봉 수 (0=없음, 쿨다운 — streak 리셋) */
  skipAfter?: number;
}
export interface MaConfig { period: number; color: string; pyramiding: { signals: MaSignal[] } }
export interface ExitConfig {
  basis: 'profitRise' | 'profitFall' | 'peakFall' | 'peakRise';
  percent: number; sellPercent: number; skip: number;
  candle: 'any' | 'bull' | 'bear'; volume: 'any' | 'higher' | 'lower';
}
export interface SimTrade {
  idx: number; date: string; price: number; action: 'buy' | 'sell' | 'exit' | 'buy-fail' | 'sell-fail';
  /** 체결 봉의 캔들 인덱스 */
  barIdx: number;
  /** 체결 사유 한 줄 */
  reason: string;
  maPeriod: number; percent: number; sharesDelta: number; amount: number; fee: number;
  cashAfter: number; sharesAfter: number; label?: string; profitRate: number | null;
  avgPrice: number; holdingValue: number; conds: string[]; condDetail: string[];
}
export interface SimMetrics {
  /** 수익률% (= rate, 레거시명 유지) */
  profit: number; rate: number;
  /** % 단위 (peakEquity 대비) */
  maxDrawdown: number; tradeCount: number;
  avgPeriod: number; volatility: number; conflicts: number;
}
interface TradeMarker { action: 'buy' | 'sell'; label: string; color: string; position: string }
interface CrossMarker { label: string; color: string }
export interface SimResult {
  /** 체결 목록 (시간순) */
  trades: SimTrade[];
  /** 최종 현금 */
  cash: number;
  /** 최종 보유주 */
  shares: number;
  /** 손익 금액 (평가금액 − 시작자기자본) */
  profit: number;
  /** 수익률% */
  rate: number;
}
export interface EngineOptions {
  initialCapital: number; feePercent: number; maMode: ResolveMode; xMode: ResolveMode;
  simFrom?: number; simTo?: number;
  /** 시작 보유량 (미지정 0주) — 매도 수량 기준에 사용 */
  initialShares?: number;
  /** 시작 보유 평단 (미지정 0 — 평단 모르면 청산 손익 계산 스킵) */
  initialAvgPrice?: number;
}

/** 탐색 출력 %에 적용률을 곱해 1~100 조건값으로 자름 */
const scaleOutPct = (pct: number, rate: number): number => Math.max(1, Math.min(100, Math.round(pct * rate)));
export interface CalcOptions extends EngineOptions { requireAll: boolean }
export type SimOptions = CalcOptions;

/** scoreCandidate 입력 — 돈 없음. 지정 이평선 전원 존재 봉부터 평가(requireAll 고정) */

/** 무자본 단위포지션 평가 — 돈 없이 신호·조건의 질만 점수화.
 *  매수는 1.0 단위 notional의 p%로 항상 전액 체결(자금고갈·절삭·수수료 없음).
 *  손익·MDD는 누적 투입(spentMax) 대비 %로 정규화 — 동일 캔들 내 후보 순위용.
 *  트리거(유지봉·쿨다운·필터·배열·3종조건·조건중복·청산)는 엔진과 동일 의미. */

const condMet = (count: number, operator: string, value: number): boolean => {
  if (operator === 'any') return true;
  if (operator === '<') return count < value;
  if (operator === '<=') return count <= value;
  if (operator === '=') return Math.abs(count - value) < 0.0001;
  if (operator === '!=') return Math.abs(count - value) >= 0.0001;
  if (operator === '>=') return count >= value;
  if (operator === '>') return count > value;
  return false;
};

const alignForSignal = (sig: string, hasSmaller = true, hasLarger = true): 'any'|'aligned'|'reverse'|'largerAbove'|'largerBelow'|'smallerAbove'|'smallerBelow' => {
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
  if (Math.random() < 0.25) return 'any';
  return pool[1 + Math.floor(Math.random() * (pool.length - 1))];
};

const sanitizeAlignments = (list: MaConfig[]): void => {
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
};


export const calcMetrics = (candles: SimCandle[], maConfigs: MaConfig[], exits: ExitConfig[], opts: CalcOptions): SimMetrics => {
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
  let cash=initialCapital; let shares=opts.initialShares ?? 0; let totalCost=shares>0?(opts.initialAvgPrice ?? 0)*shares:0; const startEquity=initialCapital+totalCost; const feeRate=feePercent/100; let peakPrice=0; let troughPrice=0; let trades=0; let conflicts=0; let barDir:string|null=null; const tradeActions:string[]=[]; const sigStreak=new Map<any,number>(); const coolUntil=new Map<any,number>(); let maSkipRemaining=0;
  const equities:number[]=[]; let peakEquity=startEquity; let maxDD=0;
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
        const epX=candles[i].close; const sellShares=sellSharesRaw;
        if(sellShares>0){
          const sellPx=epX; const avg2=totalCost/shares; const proceeds=sellShares*sellPx; const fee=Math.round(proceeds*feeRate); shares-=sellShares; cash+=proceeds-fee; totalCost-=sellShares*avg2; if(shares===0) totalCost=0; trades++; maSkipRemaining=ex.skip; exitExecuted=true;
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
        if((coolUntil.get(sigCfg)??-1)>=i){ sigStreak.set(sigKey,0); continue; } // 매매후 스킵 쿨다운
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
        if((cfgPre as any).action==='buy'){ const candleOk=(cfgPre as any).candleFilter==='any'||((cfgPre as any).candleFilter==='bull'?candles[i].close>candles[i].open:candles[i].close<candles[i].open); const volOk=(cfgPre as any).volumeFilter==='any'||(i>0&&((cfgPre as any).volumeFilter==='higher'?candles[i].volume>candles[i-1].volume:candles[i].volume<candles[i-1].volume)); if(!candleOk||!volOk) continue; if(singleMode){ const epPre=candles[i].close; const buyPxPre=epPre; const cost=Math.floor(cash*(pctPre/100)); if(cost<1000||cash<cost) continue; const buyShares=Math.floor(cost/buyPxPre); if(buyShares<=0) continue; const actualCost=buyShares*buyPxPre; const fee=Math.round(actualCost*feeRate); if(cash<actualCost+fee) continue; } }
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
        const coolMembers=(action:'buy'|'sell'):void=>{ for(const m of cands){ if((m.sigCfg as any).action!==action) continue; const sa=Math.max(0,Math.min(20,Math.round(Number((m.sigCfg as any).skipAfter)||0))); if(sa>0) coolUntil.set(m.sigCfg,i+sa); } };
        const cfg=sigCfg; const pct=Math.max(1,Math.min(100, exm.pct));
        const epM=candles[i].close;
        if((cfg as any).action==='buy'){ const candleOk=(cfg as any).candleFilter==='any'||((cfg as any).candleFilter==='bull'?candles[i].close>candles[i].open:candles[i].close<candles[i].open); const volOk=(cfg as any).volumeFilter==='any'||(i>0&&((cfg as any).volumeFilter==='higher'?candles[i].volume>candles[i-1].volume:candles[i].volume<candles[i-1].volume)); if(!candleOk||!volOk) continue; const buyPx=epM; const cost=Math.floor(cash*(pct/100)); if(cost<1000||cash<cost) continue; const buyShares=Math.floor(cost/buyPx); if(buyShares<=0) continue; const actualCost=buyShares*buyPx; const fee=Math.round(actualCost*feeRate); if(cash<actualCost+fee) continue; shares+=buyShares; cash-=actualCost+fee; totalCost+=actualCost+fee; if(barDir&&barDir!=='buy'){conflicts++;} barDir='buy'; trades++; tradeActions.push('buy'); coolMembers('buy'); } else { if(shares<=0||totalCost<=0) continue; const candleOk=(cfg as any).candleFilter==='any'||((cfg as any).candleFilter==='bull'?candles[i].close>candles[i].open:candles[i].close<candles[i].open); const volOk=(cfg as any).volumeFilter==='any'||(i>0&&((cfg as any).volumeFilter==='higher'?candles[i].volume>candles[i-1].volume:candles[i].volume<candles[i-1].volume)); if(!candleOk||!volOk) continue; const sellShares=Math.floor(shares*(pct/100)); if(sellShares<=0) continue; const avg=totalCost/shares; const sellPx=epM; const proceeds=sellShares*sellPx; const fee=Math.round(proceeds*feeRate); shares-=sellShares; cash+=proceeds-fee; totalCost-=sellShares*avg; if(shares===0) totalCost=0; if(barDir&&barDir!=='sell'){conflicts++;} barDir='sell'; trades++; tradeActions.push('sell'); coolMembers('sell'); }
    }
    const eq=cash+shares*candles[i].close; equities.push(eq); peakEquity=Math.max(peakEquity,eq); maxDD=Math.max(maxDD, peakEquity?((peakEquity-eq)/peakEquity)*100:0);
  }
  const lastPrice=candles.length?candles[mz1].close:0; const evalAmt=cash+shares*lastPrice; const profit=evalAmt-startEquity; const rate=startEquity?(profit/startEquity)*100:0;
  let sum=0,sumSq=0; for(let i=1;i<equities.length;i++){ const r=(equities[i]-equities[i-1])/equities[i-1]; sum+=r; sumSq+=r*r; } const mean=equities.length>1?sum/(equities.length-1):0; const variance=equities.length>1?sumSq/(equities.length-1)-mean*mean:0; const volatility=Math.sqrt(Math.max(0,variance))*100;
  const avgPeriod=maConfigs.length?maConfigs.reduce((s:number,m:any)=>s+m.period,0)/maConfigs.length:50;
  return { profit: rate, rate, maxDrawdown: maxDD, tradeCount: trades, avgPeriod, volatility, conflicts };
};
