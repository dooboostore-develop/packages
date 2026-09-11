/** 트레이딩 조건 탐색 — 입력(FindBestOptions) 스펙만 유지, 구현은 갈아엎기 예정 */

import type { Candle } from './Candle';
import { computeEmaSeries, computeMacdSeries, computeRsiSeries, computeSmaSeries } from './trend';

export namespace TradingSimulator {
  /** 사용자 보조지표 설정값 (페이지 SimIndicatorForm 그대로) */
  export interface IndicatorParams {
    macdFast: number; macdSlow: number; macdSignal: number;
    rsiPeriod: number; rsiOb: number; rsiOs: number;
    maShort: number; maMid: number; maLong: number;
    /** 이동평균 지수형 여부 (true면 EMA, false면 SMA) */
    maExponential: boolean;
  }

  /** findBestConfig 입력 — 전략 성향 + 시장 상황 + 보조지표 설정값만 */
  export interface FindBestOptions {
    /** 전략 성향 0~1 — 0 물타기극, 0.5 균형, 1 불타기극 (기본 0.5). 페이지 sim-strategy select 매핑 */
    strategyRate?: number;
    /** 시장 상황 0~1 — 0 매우안좋음, 0.5 중간, 1 매우좋음 (기본 0.5). 별도 알고리즘으로 산출 예정 */
    marketRate?: number;
    /** 청개구리 — true면 생성된 조건의 매수/매도를 뒤집음 */
    invertActions?: boolean;
    /** 사용자 보조지표 설정값 */
    indicators?: IndicatorParams;
    /** 튜닝 오버라이드 — 미지정 시 현행 기본값과 동일 (벤치마크 탐색용) */
    tuning?: TuningOverrides;
  }

  /** findBestConfig 튜닝 노브 — 전부 선택, 기본값이 현행 동작 */
  export interface TuningOverrides {
    /** noTradeBars 가산 (기본 0) — 연타 방지 강화 */
    quietBarsAdd?: number;
    /** percentCap 배율 (기본 1) — 조건 비중 상한 스케일 */
    percentCapScale?: number;
    /** cooldown 배율 (기본 1) — 발동 후 스킵 봉 스케일 */
    cooldownScale?: number;
    /** clarity 게이트 가감 (기본 0) */
    gateShift?: number;
    /** 연속 집행 상한 (봉) — N봉 연속 체결 시 휴식. 미지정 시 기본 2봉, 0 이하 시 무제한 */
    maxConsecBars?: number;
    /** 연속 상한 도달 후 휴식 봉 수 (기본 3) */
    consecRestBars?: number;
    /** 묶음 집행 그리드 N (2 이상) — 미지정 시 매봉 집행 */
    batchBars?: number;
  }

  /** 플랜 내장 집행 정책 — 연속 상한 + 휴식 + 묶음 (simulate가 플랜에서 읽음) */
  export interface ExecPolicy {
    maxConsecBars: number;
    restBars: number;
    /** 묶음 집행 그리드 N (2 이상). 절대봉 i % N === N-1 인 봉에만 집행, 사이는 누적·네팅.
     *  윈도우 잘라도 그리드 동일 → 풀윈도우 ≣ 청크분할 결과 일치 (노룩어헤드). 미지정 시 매봉 집행. */
    batchBars?: number;
  }

  /** findBestConfig 출력 — 전체 캔들 + 사용자 보조지표값으로 도출된 매매 플랜 조건 목록 */
  export interface AutoTradeResult {
    conditions: TradeCondition[];
    /** 조건 적용 방식 — min: 최소 percent 조건만 처리, max: 최대 percent 조건만 처리, combined: 복합 처리 */
    applyMode: 'min' | 'max' | 'combined';
    /** 확신도 0~1 (국면 정렬 + 힘 + 중력 정렬 + 적분) */
    conviction: number;
    /** 집행 정책 — tuning.maxConsecBars 지정 시에만 내장 (미지정 시 simulate 무제한) */
    execPolicy?: ExecPolicy;
  }

  /** 매매 플랜 조건 1건 (예: 단기MA > 중기MA → 매도 20%) */
  export interface TradeCondition {
    /** 근거 지표 */
    source: 'MA' | 'MACD' | 'RSI';
    /** 비교 대상 (예: "단기MA", "중기MA", "SIGNAL", "과매도") */
    left: string;
    right: string;
    /** 비교 연산 */
    operator: '>' | '>=' | '<' | '<=' | '==' | '!=';
    /** 매수/매도 */
    action: 'buy' | 'sell';
    /** 비중 % (예: 20) */
    percent: number;
    /** 집행 방식 — simulate가 체결 조건 스냅샷에만 기록 (min: 최소% 1건, max: 최대% 1건, combined: 합산 비중) */
    applyMode?: 'min' | 'max' | 'combined';
    /** 조건 설명 (예: "단기MA가 중기MA 상향돌파", "MACD SIGNAL 골든크로스", "RSI 과매도") */
    description?: string;
    /** 발동 후 N봉 스킵 (연속매매 방지) */
    cooldownBars?: number;
    /** 최근 N봉 내 매매 없었을 때만 발동 (예: 2 = 2봉전까지 매매없을시) */
    noTradeBars?: number;
  }

  // ------------------------------------------------------------------
  // 물리량 헬퍼 (findBestConfig 내부 사용)
  // - 가격변화율 = 속도, 순간가속도 = 가속도, 거래량 = 질량, 힘 = 질량×가속도
  // - 중력 = 장기MA(평형점)로 당기는 복원력, 적분 = 변위(추세), 미분 = 가속도
  // ------------------------------------------------------------------

  /** 선형보간 — 두 봉 사이 교차점의 소수 봉 인덱스 계산용 */
  const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

  /** A-B 두 시리즈의 마지막 교차 위치 (소수 인덱스, 없으면 null) */
  const lastCrossing = (a: readonly (number | null)[], b: readonly (number | null)[]): number | null => {
    for (let i = a.length - 1; i >= 1; i--) {
      const a0 = a[i - 1]; const a1 = a[i]; const b0 = b[i - 1]; const b1 = b[i];
      if (a0 == null || a1 == null || b0 == null || b1 == null) continue;
      const d0 = a0 - b0; const d1 = a1 - b1;
      if (d0 === 0) return i - 1;
      if (d0 * d1 < 0) return lerp(i - 1, i, Math.abs(d0) / (Math.abs(d0) + Math.abs(d1)));
    }
    return null;
  };

  /** Catmull-Rom 3차 스플라인 — 고밀도(2x) 리샘플링으로 속도/가속도 노이즈 완화 */
  const catmullRomDense = (xs: readonly number[]): number[] => {
    const n = xs.length;
    if (n < 2) return [...xs];
    const out: number[] = [];
    const at = (i: number): number => xs[Math.max(0, Math.min(n - 1, i))];
    for (let i = 0; i < n - 1; i++) {
      const p0 = at(i - 1); const p1 = at(i); const p2 = at(i + 1); const p3 = at(i + 2);
      out.push(p1);
      // t=0.5 중간점
      const t = 0.5;
      const t2 = t * t; const t3 = t2 * t;
      out.push(0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3));
    }
    out.push(xs[n - 1]);
    return out;
  };

  /** 표준화 (평균0 분산1, 분산 0이면 0 벡터) */
  const standardize = (xs: readonly number[]): number[] => {
    const n = xs.length;
    if (!n) return [];
    const mean = xs.reduce((s, v) => s + v, 0) / n;
    const vari = xs.reduce((s, v) => s + (v - mean) * (v - mean), 0) / n;
    const sd = Math.sqrt(vari);
    if (!(sd > 1e-12)) return xs.map(() => 0);
    return xs.map(v => (v - mean) / sd);
  };

  /** 5x5 대칭 공분산의 제1주축 (PCA, 거듭제곱 반복) */
  const firstPrincipalAxis = (features: readonly (readonly number[])[]): number[] => {
    const k = features.length; // 표본 수
    const d = features[0]?.length ?? 0; // 차원 수
    if (!k || !d) return [];
    const cols: number[][] = [];
    for (let j = 0; j < d; j++) cols.push(standardize(features.map(f => f[j] ?? 0)));
    // 공분산 행렬 (표준화済 → 상관계수 행렬)
    const cov: number[][] = [];
    for (let a = 0; a < d; a++) {
      cov.push([]);
      for (let b = 0; b < d; b++) {
        let s = 0;
        for (let i = 0; i < k; i++) s += cols[a][i] * cols[b][i];
        cov[a].push(s / Math.max(1, k - 1));
      }
    }
    let v = new Array(d).fill(1 / Math.sqrt(d));
    for (let it = 0; it < 100; it++) {
      const w = cov.map(row => row.reduce((s, c, j) => s + c * v[j], 0));
      const norm = Math.sqrt(w.reduce((s, x) => s + x * x, 0));
      if (!(norm > 1e-12)) break;
      v = w.map(x => x / norm);
    }
    return v;
  };

  /**
   * 시장 상황 추정 0~1 (0 매우안좋음 ~ 1 매우좋음).
   * 장기MA 기울기(추세) + 변동성 패널티 + RSI 위치 합성. 페이지 고정 0.5 대신 사용.
   */
  export const estimateMarketRate = (
    candles: readonly Candle[],
    indicators?: IndicatorParams,
  ): number => {
    const n = candles.length;
    if (n < 5) return 0.5;
    const closes = candles.map(c => c.close);
    const maL = computeSmaSeries(closes, Math.max(2, Math.round(indicators?.maLong ?? 60)));
    const last = n - 1;
    const span = Math.min(20, n - 1);
    const base = maL[last - span];
    const slope = base != null && base !== 0 && maL[last] != null
      ? (maL[last]! - base) / Math.abs(base) / (span / 20) : 0;
    const rets: number[] = [];
    for (let i = Math.max(1, n - 60); i < n; i++) {
      if (closes[i - 1] > 0) rets.push((closes[i] - closes[i - 1]) / closes[i - 1]);
    }
    const mean = rets.reduce((s, v) => s + v, 0) / Math.max(1, rets.length);
    const vol = Math.sqrt(rets.reduce((s, v) => s + (v - mean) * (v - mean), 0) / Math.max(1, rets.length));
    const rsi = computeRsiSeries(closes, indicators?.rsiPeriod ?? 14)[last] ?? 50;
    const score = 0.5 + Math.max(-0.35, Math.min(0.35, slope * 6)) - Math.min(0.15, vol * 3) + (rsi - 50) / 500;
    return Math.max(0, Math.min(1, score));
  };

  /**
   * 최적 조건 탐색 (물리량 기반).
   * - 속도=가격변화율, 가속도=순간가속도(스플라인 스무딩), 질량=거래량, 힘=질량×가속도
   * - 중력=장기MA 복원력, 적분=변위, 오버슈트=평형 이탈폭, 진동=수익률 표준편차, 정착시간=마지막 교차 후 경과봉
   * - 5개 피처(속도/가속도/힘/중력/질량변화율)의 PCA 제1주축 투영 = 국면 점수
   * - strategyRate: 매수 편향 이동 (저→하락시 분할매수/고→상승시 불타기), marketRate: 전체 비중 스케일 + applyMode
   * @param candles 선택 구간 캔들 (시간순)
   * @param options 탐색 옵션 — strategyRate(0 물타기극 ~ 0.5 균형 ~ 1 불타기극) + marketRate + indicators
   */
  /**
   * 종가 예측 — candles[] → 향후 number[] (요청 봉 수만큼, 재귀 1봉씩).
   * findBestConfig와 동일한 물리량 어휘로 다음봉 변화율을 구해 누적:
   * - 속도(가격변화율, 스플라인 고밀도) + 순간가속도(미분)
   * - 질량(거래량)·질량변화율(거래량변화율) → 힘(질량×가속도, 중앙값 정규화)
   * - 중력(장기MA 복원력) + 적분(변위/추세) + 미분
   * - 흔들림(속도 표준편차) 감쇠 + 정착시간(단기/중기 마지막 교차 후 경과, 선형보간)
   * - 오버슈트(장기MA 이탈) 반전압 + PCA 제1주축 국면 투영 (5피처)
   * - 미래 거래량 미지 → 직전 유지 (명시적 가정)
   */
  export const forecastCloses = (
    candles: readonly Candle[],
    bars = 5,
  ): number[] => {
    const h = Math.floor(bars);
    if (h < 1) return [];
    if (!candles.length) return new Array(h).fill(0);
    const last0 = candles[candles.length - 1]?.close ?? 0;
    if (!(last0 > 0)) return new Array(h).fill(0);
    const cc = candles.map(c => c.close);
    const vv = candles.map(c => Math.max(0, c.volume || 0));
    const hh = candles.map(c => c.high);
    const ll = candles.map(c => c.low);
    const lastVol = vv.length ? vv[vv.length - 1] : 0;
    const lastH = hh.length ? hh[hh.length - 1] : 0;
    const lastL = ll.length ? ll[ll.length - 1] : 0;
    const out: number[] = [];
    for (let k = 0; k < h; k++) {
      // 지평선 감쇠 — 운동량(drive)은 멀수록 소멸, 중력(pull)은 유지 (직선 외삽 방지).
      // 스텝 상한 ±4% (스플라인 오버슈트 폭주 차단)
      const { drive, pull } = nextBarRate(cc, vv, hh, ll);
      const r = Math.max(-0.04, Math.min(0.04, drive * Math.pow(0.9, k) + pull));
      const prev = cc[cc.length - 1];
      const p = Math.max(0, prev * (1 + r));
      out.push(Math.round(p * 100) / 100);
      cc.push(p);
      vv.push(lastVol);
      hh.push(lastH);
      ll.push(lastL);
    }
    return out;
  };

  /** 추세 시나리오 콘 — 중간선(운동량 예측) + 상·하단(흔들림 밴드).
   *  방향 점예측이 아니라 범위 예측: "n봉 후 이 안에 있을 것".
   *  폭 = 최근 속도 표준편차 × 1.5 × √k (k=앞봉수). 횡장→넓음(모름), 추세장→좁음. */
  export const forecastBands = (
    candles: readonly Candle[],
    bars = 5,
    width = 2,
    midOverride?: number[],
  ): { mid: number[]; upper: number[]; lower: number[] } => {
    const empty = { mid: [] as number[], upper: [] as number[], lower: [] as number[] };
    const h = Math.floor(bars);
    if (h < 1) return empty;
    if (!candles.length) {
      const z = new Array(h).fill(0);
      return { mid: z, upper: [...z], lower: [...z] };
    }
    // 중간선: 지정 없으면 물리량. 페이지는 물리량+푸리에 앙상블을 넘김 (5일 58.5% 실측).
    const mid = midOverride?.length === h ? midOverride.map(v => Math.round(v * 100) / 100) : forecastCloses(candles, h);
    if (!mid.length) return empty;
    const closes = candles.map(c => c.close);
    const n = closes.length;
    // 최근 속도 표준편차 (흔들림) — nextBarRate와 동일 어휘
    const dense = catmullRomDense(closes);
    const dv: number[] = [];
    for (let i = 1; i < dense.length; i++) dv.push(dense[i - 1] > 0 ? (dense[i] - dense[i - 1]) / dense[i - 1] : 0);
    const vel: number[] = [0];
    for (let i = 1; i < n; i++) vel.push(((dv[(i - 1) * 2] ?? 0) + (dv[(i - 1) * 2 + 1] ?? 0)) / 2);
    const K = Math.min(n, 10);
    const recent = vel.slice(n - K);
    const meanV = recent.reduce((s, v) => s + v, 0) / Math.max(1, recent.length);
    const velOsc = Math.sqrt(recent.reduce((s, v) => s + (v - meanV) * (v - meanV), 0) / Math.max(1, recent.length));
    // H-L 불안정도와 병합 — Parkinson 변동성(σ≈range/2.35)으로 환산 후 큰 쪽이 밴드폭 결정
    const inst = instabilityOf(candles.map(c => c.high), candles.map(c => c.low), closes);
    const osc = Math.max(velOsc, inst.level / 2.35);
    const base = closes[n - 1] > 0 ? closes[n - 1] : 0;
    const w = Number.isFinite(width) && width > 0 ? width : 1.5;
    const upper = mid.map((m, k) => Math.round((m + base * osc * w * Math.sqrt(k + 1)) * 100) / 100);
    const lower = mid.map((m, k) => Math.round(Math.max(0, m - base * osc * w * Math.sqrt(k + 1)) * 100) / 100);
    return { mid, upper, lower };
  };

  /** 다음봉 변화율 — 풀피직스 1스텝 (forecastCloses 내부용).
   *  drive(운동량계: 감쇠 대상)와 pull(중력: 유지)로 분리 반환. */
  /** EWMA — 전구간 사용·최근 가중 (바로전 1봉이 아니라 전부 반영) */
  const ewmaAll = (xs: number[], alpha = 0.12): number => {
    let m = 0;
    let init = false;
    for (const x of xs) {
      if (!Number.isFinite(x)) continue;
      m = !init ? x : m + alpha * (x - m);
      init = true;
    }
    return init ? m : 0;
  };

  /** 불안정도 (H-L 레인지/종가) + 개선추세 — 안정감=횡보.
   *  fast(최근)/slow(기조) EWMA 비교. improve>0 = 안정화 중(레인지 축소 지속). */
  const instabilityOf = (highs: number[], lows: number[], closes: number[]): { level: number; improve: number } => {
    const n = closes.length;
    const inst: number[] = [];
    for (let i = 0; i < n; i++) {
      const c = closes[i] > 0 ? closes[i] : 0;
      inst.push(c > 0 ? Math.max(0, (highs[i] - lows[i]) / c) : 0);
    }
    const fast = ewmaAll(inst, 0.2);
    const slow = ewmaAll(inst, 0.05);
    return { level: fast, improve: slow > 1e-9 ? (slow - fast) / slow : 0 };
  };

  /** 유사 파형(아날로그) 예측 — candles[] → 향후 number[].
   *  최근 L봉 파형을 정규화(z)해 전구간에서 Euclidean 최단 K개를 찾고,
   *  매칭 이후 실제 경로(수익률)의 중앙값을 집계. 스케일 무관, 모양 기반.
   *  거리 특징 = [정규화 종가, 정규화 속도(스플라인 미분)] — 물리량 어휘 공유.
   *  기록 부족 시 수평 폴백 (모름은 모른다고). */
  export const forecastByAnalogy = (
    candles: readonly Candle[],
    bars = 10,
    lookback = 20,
    topK = 5,
  ): number[] => {
    const h = Math.floor(bars);
    if (h < 1) return [];
    const n = candles.length;
    const L = Math.max(5, Math.floor(lookback));
    const K = Math.max(1, Math.floor(topK));
    const closes = candles.map(c => c.close);
    const last = closes[n - 1] ?? 0;
    if (!(last > 0)) return new Array(h).fill(0);
    // 매칭은 끝에서 h봉 앞까지 (이후 경로 필요) + 쿼리 자기 자신 제외
    const maxStart = Math.min(n - L - h, n - 2 * L);
    if (maxStart < 1) return new Array(h).fill(Math.round(last * 100) / 100);
    const znorm = (xs: number[]): number[] => {
      const m = xs.reduce((s, x) => s + x, 0) / Math.max(1, xs.length);
      const sd = Math.sqrt(xs.reduce((s, x) => s + (x - m) * (x - m), 0) / Math.max(1, xs.length));
      return sd > 0 ? xs.map(x => (x - m) / sd) : xs.map(() => 0);
    };
    const velOf = (xs: number[]): number[] => {
      // 스플라인 고밀도 미분 → 원래 해상도 (findBestConfig와 동일 어휘)
      const dense = catmullRomDense(xs);
      const dv: number[] = [];
      for (let i = 1; i < dense.length; i++) dv.push(dense[i - 1] > 0 ? (dense[i] - dense[i - 1]) / dense[i - 1] : 0);
      const vel: number[] = [0];
      for (let i = 1; i < xs.length; i++) vel.push(((dv[(i - 1) * 2] ?? 0) + (dv[(i - 1) * 2 + 1] ?? 0)) / 2);
      return vel;
    };
    const q = closes.slice(n - L);
    const qz = znorm(q);
    const qv = znorm(velOf(q));
    const scored: { d: number; start: number }[] = [];
    for (let s = 0; s <= maxStart; s++) {
      const w = closes.slice(s, s + L);
      const wz = znorm(w);
      const wv = znorm(velOf(w));
      let d = 0;
      for (let j = 0; j < L; j++) {
        d += (qz[j] - wz[j]) * (qz[j] - wz[j]) + (qv[j] - wv[j]) * (qv[j] - wv[j]);
      }
      scored.push({ d, start: s });
    }
    scored.sort((a, b) => a.d - b.d);
    const picks = scored.slice(0, Math.min(K, scored.length));
    // 이후 경로 단봉 수익률 중앙값 → 현재가 기준 레벨 복원 (복리)
    const levels: number[] = [];
    let acc = last;
    for (let j = 0; j < h; j++) {
      const rs = picks
        .map(p => {
          const a = p.start + L + j;
          const prevC = closes[a - 1];
          const fwd = closes[a];
          return prevC > 0 && fwd != null ? fwd / prevC - 1 : null;
        })
        .filter((x): x is number => x != null)
        .sort((a, b) => a - b);
      if (!rs.length) break;
      const med = rs[Math.floor(rs.length / 2)];
      acc = Math.max(0, acc * (1 + med));
      levels.push(Math.round(acc * 100) / 100);
    }
    while (levels.length < h) levels.push(levels.length ? levels[levels.length - 1] : Math.round(last * 100) / 100);
    return levels;
  };

  /** 푸리에 외삽 예측 — candles[] → 향후 number[].
   *  최근 L봉 추세(최소자승 직선) 분리 → 잔차 DFT 상위 M개 주기성분 → 위상 그대로 연장.
   *  위상은 스펙트럼에 내장이라 파형 간 시차(변위) 자동 정렬. 기록 부족 시 수평 폴백. */
  export const forecastByFourier = (
    candles: readonly Candle[],
    bars = 10,
    lookback = 60,
    topM = 3,
  ): number[] => {
    const h = Math.floor(bars);
    if (h < 1) return [];
    const n = candles.length;
    const closes = candles.map(c => c.close);
    const last = closes[n - 1] ?? 0;
    if (!(last > 0)) return new Array(h).fill(0);
    const L = Math.max(8, Math.floor(lookback));
    if (n < L + 1) return new Array(h).fill(Math.round(last * 100) / 100);
    const win = closes.slice(n - L);
    // 추세 분리 (최소자승 직선, DFT창과 동일 L — 2L 확장은 시장 실측 악화 확인 후 원복)
    let sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (let i = 0; i < L; i++) { sx += i; sy += win[i]; sxx += i * i; sxy += i * win[i]; }
    const denom = L * sxx - sx * sx;
    const slope = denom !== 0 ? (L * sxy - sx * sy) / denom : 0;
    const icept = (sy - slope * sx) / L;
    const resid = win.map((v, i) => v - (slope * i + icept));
    // DFT (naive O(L^2), L≤수백이라 충분)
    const N = L;
    const mag: { k: number; amp: number; phase: number }[] = [];
    for (let k = 1; k <= Math.floor((N - 1) / 2); k++) {
      let re = 0, im = 0;
      for (let t = 0; t < N; t++) {
        const a = (2 * Math.PI * k * t) / N;
        re += resid[t] * Math.cos(a);
        im -= resid[t] * Math.sin(a);
      }
      mag.push({ k, amp: (2 * Math.hypot(re, im)) / N, phase: Math.atan2(im, re) });
    }
    mag.sort((a, b) => b.amp - a.amp);
    const comps = mag.slice(0, Math.max(1, Math.min(Math.floor(topM), mag.length)));
    const out: number[] = [];
    for (let m = 1; m <= h; m++) {
      let v = slope * (L - 1 + m) + icept;
      for (const c of comps) v += c.amp * Math.cos((2 * Math.PI * c.k * (N + m - 1)) / N + c.phase);
      out.push(Math.round(Math.max(0, v) * 100) / 100);
    }
    return out;
  };

  /** 다음봉 변화율 — 검증된 물리량 코어 + 거래량 크기변조 (forecastCloses 내부용).
   *  코어: 속도(스플라인)/가속도/힘/중력/적분/흔들림/정착/오버슈트/PCA (51.7%/55.7% 실측).
   *  변조: 전구간 EWMA 거래량변화율 → 1+tanh (증가 지속 → 증폭, 감소 → 감쇠). 방향 불변.
   *  drive(감쇠 대상)/pull(중력 유지) 분리 반환. */
  const nextBarRate = (closes: number[], volumes: number[], highs: number[], lows: number[]): { drive: number; pull: number } => {
    const n = closes.length;
    const last = n - 1;
    if (n < 2 || !(closes[last] > 0)) return { drive: 0, pull: 0 };
    const maS = computeSmaSeries(closes, Math.max(2, Math.min(5, n)));
    const maM = computeSmaSeries(closes, Math.max(2, Math.min(10, n)));
    const maL = computeSmaSeries(closes, Math.max(2, Math.min(60, n)));
    const dense = catmullRomDense(closes);
    const dv: number[] = [];
    for (let i = 1; i < dense.length; i++) dv.push(dense[i - 1] > 0 ? (dense[i] - dense[i - 1]) / dense[i - 1] : 0);
    const vel: number[] = [0];
    for (let i = 1; i < n; i++) vel.push(((dv[(i - 1) * 2] ?? 0) + (dv[(i - 1) * 2 + 1] ?? 0)) / 2);
    const accArr: number[] = [0];
    for (let i = 1; i < n; i++) accArr.push(vel[i] - vel[i - 1]);
    const velLast = vel[last];
    const accLast = accArr[last];
    const massROC: number[] = [0];
    for (let i = 1; i < n; i++) massROC.push(volumes[i - 1] > 0 ? (volumes[i] - volumes[i - 1]) / volumes[i - 1] : 0);
    const rawForce = volumes.map((m, i) => m * accArr[i]);
    const sortedAbs = rawForce.map(Math.abs).sort((a, b) => a - b);
    const medForce = sortedAbs[Math.floor(sortedAbs.length / 2)] || 1;
    const forceLast = rawForce[last] / medForce;
    const base = maL[last];
    const gravity = base != null && base > 0 ? (base - closes[last]) / closes[last] : 0;
    const K = Math.min(n, 10);
    const recent = vel.slice(n - K);
    const integral = recent.reduce((s, v) => s + v, 0);
    const meanV = recent.reduce((s, v) => s + v, 0) / Math.max(1, recent.length);
    const oscillation = Math.sqrt(recent.reduce((s, v) => s + (v - meanV) * (v - meanV), 0) / Math.max(1, recent.length));
    const crossMM = lastCrossing(maS, maM);
    const settling = crossMM == null ? K : Math.max(0, last - crossMM);
    // chop 판별 — 최근 20봉 단기/중기 교차 횟수. 잦으면 횡보(신생 추세 아님) → drive 차단
    let crossCount = 0;
    const span = Math.min(n - 1, 20);
    for (let i = n - span; i < n; i++) {
      const a = (maS[i] ?? 0) - (maM[i] ?? 0);
      const b = (maS[i - 1] ?? 0) - (maM[i - 1] ?? 0);
      if (a === 0 || b === 0 || Math.sign(a) !== Math.sign(b)) crossCount++;
    }
    const chopFactor = 1 / (1 + Math.max(0, crossCount - 2));
    const crossL = lastCrossing(closes.map(c => c as number | null), maL);
    let overshoot = 0;
    if (crossL != null) {
      for (let i = Math.max(0, Math.floor(crossL)); i < n; i++) {
        if (maL[i] != null && maL[i]! !== 0) overshoot = Math.max(overshoot, Math.abs((closes[i] - maL[i]!) / maL[i]!));
      }
    }
    const feats: number[][] = [];
    for (let i = n - K; i < n; i++) {
      const g = closes[i] > 0 && maL[i] != null ? (maL[i]! - closes[i]) / closes[i] : 0;
      feats.push([vel[i], accArr[i], rawForce[i] / medForce, g, massROC[i]]);
    }
    let regime = 0;
    if (feats.length >= 2) {
      const axis = firstPrincipalAxis(feats);
      const lastStd = axis.map((_, j) => {
        const s = standardize(feats.map(f => f[j]));
        return s[s.length - 1] ?? 0;
      });
      regime = Math.abs(axis.reduce((s, a, j) => s + a * lastStd[j], 0));
    }
    const mom = velLast + 0.5 * accLast;
    const momSign = mom > 0 ? 1 : mom < 0 ? -1 : 0;
    const forceW = Math.tanh(forceLast * 0.5);
    const trend = Math.tanh(integral * 20);
    const dampV = 1 / (1 + oscillation * 30);
    // 안정감 신뢰도 — H-L 불안정도가 축소 지속이면 운동량 신뢰 상향, 확대면 하향
    const inst = instabilityOf(highs, lows, closes);
    const trust = Math.max(0.05, Math.min(1, (0.35 + 0.65 * dampV) * (1 + 0.5 * Math.max(-1, Math.min(1, inst.improve)))));
    const fresh = Math.exp(-settling / 15);
    const revert = -Math.tanh(overshoot * 8);
    const core = (mom * (0.7 + 0.3 * forceW) + regime * momSign * 0.008 + trend * 0.008)
      * trust * (0.4 + 0.6 * fresh) * chopFactor
      + revert * 0.002;
    // 거래량 크기변조 — 전구간 EWMA 거래량변화율 (표준화). 방향은 코어 그대로.
    const mMean = massROC.reduce((s, x) => s + x, 0) / Math.max(1, massROC.length);
    const mStd = Math.sqrt(massROC.reduce((s, x) => s + (x - mMean) * (x - mMean), 0) / Math.max(1, massROC.length));
    const Vz = mStd > 0 ? ewmaAll(massROC.map(x => x / mStd)) : 0;
    return { drive: core * (1 + Math.tanh(Vz * 0.5)), pull: gravity * 0.03 };
  };

  export const findBestConfig = (
    candles: readonly Candle[],
    options?: FindBestOptions,
  ): AutoTradeResult => {
    const n = candles.length;
    const sRate = options?.strategyRate ?? 0.5;
    // marketRate 미지정 시 중립 0.5 (estimateMarketRate는 외부에서 명시 지정용)
    const mRate = options?.marketRate ?? 0.5;
    const ind = options?.indicators;
    const applyMode: AutoTradeResult['applyMode'] = mRate < 0.35 ? 'min' : mRate > 0.65 ? 'max' : 'combined';
    const tn = options?.tuning ?? {};
    // 집행 정책 — 2026-09-11 스위프 확정 (118종목, 분할 검증): 기본 2봉 연속+3봉 휴식 + 묶음 N=2.
    // 미지정 시 기본 적용, 0 이하 지정 시 무제한 (실험용). batchBars 1 이하 지정 시 묶음 해제.
    const execPolicy: AutoTradeResult['execPolicy'] = tn.maxConsecBars != null && tn.maxConsecBars <= 0
      ? undefined
      : {
        maxConsecBars: Math.max(1, Math.floor(tn.maxConsecBars ?? 2)),
        restBars: Math.max(1, Math.floor(tn.consecRestBars ?? 3)),
        ...(tn.batchBars == null
          ? { batchBars: 2 }
          : tn.batchBars >= 2
            ? { batchBars: Math.floor(tn.batchBars) }
            : {}),
      };
    if (n < 3) return { conditions: [], applyMode, conviction: 0, execPolicy };

    const closes = candles.map(c => c.close);
    const volumes = candles.map(c => Math.max(0, c.volume || 0));
    const maFn = ind?.maExponential ? computeEmaSeries : computeSmaSeries;
    const pS = Math.max(2, Math.round(ind?.maShort ?? 5));
    const pM = Math.max(2, Math.round(ind?.maMid ?? 10));
    const pL = Math.max(2, Math.round(ind?.maLong ?? 60));
    const maS = maFn(closes, pS);
    const maM = maFn(closes, pM);
    const maL = maFn(closes, pL);
    const macd = computeMacdSeries(closes, ind?.macdFast ?? 12, ind?.macdSlow ?? 26, ind?.macdSignal ?? 9);
    const rsi = computeRsiSeries(closes, ind?.rsiPeriod ?? 14);
    const rsiOb = ind?.rsiOb ?? 70;
    const rsiOs = ind?.rsiOs ?? 30;

    // 속도/가속도 — 스플라인 고밀도 시리즈에서 계산 후 원래 해상도로 평균 환원
    const dense = catmullRomDense(closes);
    const dv: number[] = [];
    for (let i = 1; i < dense.length; i++) dv.push(dense[i - 1] > 0 ? (dense[i] - dense[i - 1]) / dense[i - 1] : 0);
    const vel: number[] = [0];
    for (let i = 1; i < n; i++) vel.push(((dv[(i - 1) * 2] ?? 0) + (dv[(i - 1) * 2 + 1] ?? 0)) / 2);
    const acc: number[] = [0];
    for (let i = 1; i < n; i++) acc.push(vel[i] - vel[i - 1]);

    // 질량 변화율(거래량변화율) + 힘(질량×가속도, 중앙값 정규화)
    const massROC: number[] = [0];
    for (let i = 1; i < n; i++) massROC.push(volumes[i - 1] > 0 ? (volumes[i] - volumes[i - 1]) / volumes[i - 1] : 0);
    const rawForce = volumes.map((m, i) => m * acc[i]);
    const sortedAbs = rawForce.map(Math.abs).sort((a, b) => a - b);
    const medForce = sortedAbs[Math.floor(sortedAbs.length / 2)] || 1;
    const force = rawForce.map(f => f / medForce);

    // 중력(장기MA 복원력) + 적분(변위)
    const gravity: number[] = closes.map((c, i) => (maL[i] != null && c > 0 ? (maL[i]! - c) / c : 0));
    const K = Math.min(n, Math.max(pM, 5));
    const integral = vel.slice(n - K).reduce((s, v) => s + v, 0);

    // 진동(수익률 표준편차) + 정착시간(단기/중기 마지막 교차 후 경과봉)
    const recent = vel.slice(n - K);
    const meanV = recent.reduce((s, v) => s + v, 0) / Math.max(1, recent.length);
    const oscillation = Math.sqrt(recent.reduce((s, v) => s + (v - meanV) * (v - meanV), 0) / Math.max(1, recent.length));
    const crossMM = lastCrossing(maS, maM);
    const settling = crossMM == null ? K : Math.max(0, (n - 1) - crossMM);

    // 오버슈트 — 종가/장기MA 마지막 교차 이후 최대 이탈률
    const crossL = lastCrossing(closes.map(c => c as number | null), maL);
    let overshoot = 0;
    if (crossL != null) {
      for (let i = Math.max(0, Math.floor(crossL)); i < n; i++) {
        if (maL[i] != null && maL[i]! !== 0) overshoot = Math.max(overshoot, Math.abs((closes[i] - maL[i]!) / maL[i]!));
      }
    }

    // PCA 국면 점수 — 최근 K봉 × 5피처(속도/가속도/힘/중력/질량변화율) 제1주축에 마지막 봉 투영
    const feats: number[][] = [];
    for (let i = n - K; i < n; i++) feats.push([vel[i], acc[i], force[i], gravity[i], massROC[i]]);
    const axis = firstPrincipalAxis(feats);
    const lastStd = axis.map((_, j) => {
      const col = feats.map(f => f[j]);
      const s = standardize(col);
      return s[s.length - 1] ?? 0;
    });
    const regime = axis.reduce((s, a, j) => s + a * lastStd[j], 0);

    // 확신도 — 국면 정렬 + 힘 + 중력 정렬 (tanh 압축, 0~1)
    const last = n - 1;
    const alignG = Math.sign(vel[last]) === Math.sign(gravity[last]) && vel[last] !== 0 ? 1 : -0.5;
    const conviction = 1 / (1 + Math.exp(-(regime * 0.8 + Math.tanh(force[last] * 0.5) * 0.6 + alignG * 0.4 + Math.tanh(integral * 20) * 0.5)));

    // 비중 스케일 — 시장이 좋을수록 크게, 전략은 매수 편향 이동 + 모멘텀 추종
    // - 상승 모멘텀(momUp)이 클수록 매수 확대 (불타기 s=1에서 가장 강하게)
    // - 하락 모멘텀(momDn)이 클수록 매도 확대 + 물타기(s=0)에서 하락시 분할매수 확대
    // - 추세 비대칭: 장 좋을수록 매수↑매도↓, 나쁠수록 반대 (승자 보유)
    const marketScale = 0.5 + mRate; // 0.5 ~ 1.5
    const momUp = Math.tanh(Math.max(0, vel[last]) * 50); // 0~1 상승 모멘텀
    const momDn = Math.tanh(Math.max(0, -vel[last]) * 50); // 0~1 하락 모멘텀
    const buySkew = 0.7 + 0.6 * mRate;
    const sellSkew = 1.3 - 0.6 * mRate;
    // 시장 국면 — 보수적(mRate 낮음): 비중 상한↓ + 쿨다운↑ + 무거래봉↑ + 최소 조건만
    //            적극적(mRate 높음): 비중 상한↑ + 쿨다운↓ + 최대 조건만
    const conservative = mRate < 0.35;
    const aggressive = mRate > 0.65;
    // 2026-09-11 스위프 확정값 (118종목): 보수 26 / 중립 46 / 적극 65
    const percentCap = Math.max(5, Math.round((conservative ? 26 : aggressive ? 65 : 46) * (tn.percentCapScale ?? 1)));
    const sizeOf = (base: number, side: 'up-buy' | 'down-buy' | 'sell'): number => {
      const bias = side === 'up-buy' ? 0.7 + 0.6 * sRate
        : side === 'down-buy' ? 1.3 - 0.6 * sRate
        : 0.9 + 0.2 * sRate;
      const mom = side === 'up-buy' ? 1 + momUp * (0.4 + 0.6 * sRate)
        : side === 'down-buy' ? 1 + momDn * (0.6 - 0.4 * sRate)
        : 1 + momDn * (0.4 + 0.4 * sRate);
      const skew = side === 'sell' ? sellSkew : buySkew;
      return Math.max(5, Math.min(percentCap, Math.round(base * (0.6 + conviction * 0.8) * marketScale * bias * mom * skew)));
    };
    const rawCd = (3 + settling / 2 + oscillation * 200) * (1.6 - 0.6 * mRate);
    // 미지정 시 현행과 bit 동일 (3..14 clamp), 지정 시에만 1..30 허용
    const cooldown = tn.cooldownScale == null
      ? Math.max(3, Math.min(14, Math.round(rawCd)))
      : Math.max(1, Math.min(30, Math.round(rawCd * tn.cooldownScale)));
    // 2026-09-11 스위프 확정값 (118종목): 구(5/4+보수1) 대비 -4
    const quietBars = Math.max(0, (oscillation > 0.02 ? 1 : 0) + (conservative ? 1 : 0) + Math.round(tn.quietBarsAdd ?? 0));

    // 확신도 게이트 — 약한 신호는 조건 자체를 내보내지 않음 (시장 나쁠수록 빗장 높게).
    // 방향-무관 명료도(|regime| = 지배 패턴 부합 강도)로 판단 — 하락 신호도 막지 않음.
    // conviction(방향성)은 비중 산정에만 사용.
    const clarity = 1 / (1 + Math.exp(-Math.abs(regime) * 1.2));
    const gate = 0.5 - mRate * 0.2 + (tn.gateShift ?? 0); // m=0 → 0.5, m=0.5 → 0.4, m=1 → 0.3
    // NOTE 2026-09-11 실험: 0.42-0.24m 완화 시 118종목 스위프 완전 동일 → 게이트 비결합 확인, 원복
    if (clarity < gate) return { conditions: [], applyMode, conviction, execPolicy };

    const conditions: TradeCondition[] = [];
    // 눌림 매력도 0~1 — 과매도 깊이 + 하락 모멘텀 + 장기MA 이탈 합성
    const lastClose = closes[last];
    const oversoldDepth = rsi[last] <= rsiOs ? Math.min(1, (rsiOs - rsi[last]) / 20) : 0;
    const belowLong = maL[last] != null && maL[last]! > 0 && lastClose < maL[last]!
      ? Math.min(1, (maL[last]! - lastClose) / maL[last]! / 0.1) : 0;
    const dipScore = Math.max(0, Math.min(1, 0.35 * oversoldDepth + 0.35 * momDn + 0.3 * belowLong));
    // 하락 신호 방향 — 눌림 매력도가 전략 rate를 넘으면 분할매수, 아니면 손절/매도 (분기점 없음)
    const downAction = dipScore > sRate ? 'buy' : 'sell';
    const sS = maS[last]; const sM = maM[last];
    if (sS != null && sM != null && sS !== sM) {
      const up = sS > sM;
      const action: 'buy' | 'sell' = up ? 'buy' : downAction;
      {
        conditions.push({
          source: 'MA', left: '단기MA', right: '중기MA', operator: up ? '>' : '<',
          action, percent: sizeOf(20, up ? 'up-buy' : (downAction === 'buy' ? 'down-buy' : 'sell')),
          description: up ? '단기MA가 중기MA 상회' : (downAction === 'buy' ? '단기MA가 중기MA 하회 (눌림 매수)' : '단기MA가 중기MA 하회'),
          cooldownBars: cooldown, noTradeBars: quietBars,
        });
      }
    }
    const mV = macd.macd[last]; const gV = macd.signal[last];
    if (Number.isFinite(mV) && Number.isFinite(gV) && mV !== gV) {
      const up = mV > gV;
      const action: 'buy' | 'sell' = up ? 'buy' : downAction;
      {
        conditions.push({
          source: 'MACD', left: 'MACD', right: 'SIGNAL', operator: up ? '>' : '<',
          action, percent: sizeOf(20, up ? 'up-buy' : (downAction === 'buy' ? 'down-buy' : 'sell')),
          description: up ? 'MACD SIGNAL 골든크로스' : (downAction === 'buy' ? 'MACD SIGNAL 데드크로스 (눌림 매수)' : 'MACD SIGNAL 데드크로스'),
          cooldownBars: cooldown, noTradeBars: quietBars,
        });
      }
    }
    const rV = rsi[last];
    if (Number.isFinite(rV)) {
      if (rV >= rsiOb) {
        conditions.push({
          source: 'RSI', left: 'RSI', right: '과매수', operator: '>=',
          action: 'sell', percent: sizeOf(10 + Math.round(overshoot * 500), 'sell'),
          description: 'RSI 과매수', cooldownBars: cooldown + 2, noTradeBars: quietBars,
        });
      } else if (rV <= rsiOs) {
        {
          conditions.push({
            source: 'RSI', left: 'RSI', right: '과매도', operator: '<=',
            action: downAction, percent: sizeOf(10, downAction === 'buy' ? 'down-buy' : 'sell'),
            description: downAction === 'buy' ? 'RSI 과매도 (눌림 매수)' : 'RSI 과매도', cooldownBars: cooldown + 2, noTradeBars: quietBars,
          });
        }
      }
    }

    if (options?.invertActions) {
      for (const c of conditions) c.action = c.action === 'buy' ? 'sell' : 'buy';
    }

    return { conditions, applyMode, conviction, execPolicy };
  };

  /** 사용자 거래내역 1건 (페이지 TradeEntry 대응, 최소형) */
  export interface UserTrade {
    date: string;
    /** 매수/매도 + 실패 (예: 잔액 부족으로 매수 실패) */
    action: 'buy' | 'sell' | 'buy-failed' | 'sell-failed';
    price: number;
    shares: number;
    /** 실패 사유 (예: "잔액부족") */
    reason?: string;
    /** 초기보유 — 현금 이동 없이 보유로 시작, noTradeBars/cooldown 집계 제외 (매매 아님) */
    initial?: boolean;
    /** 체결 근거 조건 (발동 당시 스냅샷 — 몇 %로 매매했는지 포함) */
    condition?: TradeCondition;
    /** 발동 시점에 걸려 있던 전체 조건 (집행된 조건 포함) */
    candidates?: TradeCondition[];
  }

  /** 묶음 집행 전달 상태 — simulate 호출 사이 pending 누적 전달용 (페이지 확장 루프용).
   *  그리드 타이밍은 절대봉 기준이라 상태만 이으면 풀윈도우 ≣ 청크분할 일치. */
  export interface BatchState {
    buy: number;
    sell: number;
    buyCond?: TradeCondition;
    sellCond?: TradeCondition;
  }

  /** simulate 입력 — 대상 캔들 + findBestConfig 결과 + 사용자 거래내역 + 보조지표 설정값 + 투자원금 */
  export interface SimulateOptions {
    candles: readonly Candle[];
    config: AutoTradeResult;
    history: UserTrade[];
    /** 사용자 보조지표 설정값 (조건 평가용 지표 계산에 사용) */
    indicators?: IndicatorParams;
    /** 투자원금 (매수 가능 금액 산정용) */
    capital?: number;
    /** 수수료율 0~1 (매수·매도 체결 시 차감) */
    fee?: number;
    /** 리스크 청산 % — 보유 수익률 기준 (예: { stopLossPct: 8, takeProfitPct: 15 }) */
    risk?: { stopLossPct?: number; takeProfitPct?: number };
    /** 이 인덱스부터 평가 (이전 봉은 지표 계산에만 사용). 누적 루프에서 신규 봉 1개씩 평가용 */
    fromBar?: number;
    /** 묶음 pending 전달 (확장 루프용 — 직전 호출의 결과 batchState를 그대로) */
    batchState?: BatchState;
  }

  /** simulate 출력 — 집행된 거래 + 윈도우 수익률 */
  export interface SimulateResult {
    trades: UserTrade[];
    /** 윈도우 수익률 % — (최종현금+최종평가 - 시작자본) / 시작자본 (initial 보유는 첫봉 종가로 평가) */
    returnPct: number;
    /** 묶음 pending 잔량 (확장 루프면 다음 호출 batchState로 전달) */
    batchState: BatchState;
  }

  /**
   * 매매 시뮬레이션 — 조건 평가 → 주문 집행 → 거래내역 반환.
   * - 지표 시리즈는 indicators config로 전체 캔들 기준 1회 계산 (SMA/EMA 선택 반영).
   * - 매 봉마다 발동 조건 수집 → applyMode(min/max/combined)로 집행 대상 선정.
   * - cooldownBars: 발동 후 N봉 스킵. noTradeBars: 최근 N봉 무거래 시에만 발동.
   * - 매수: 현금의 percent% (수수료 포함) → 1주도 못 사면 buy-failed(잔액부족).
   * - 매도: 보유의 percent% → 1주도 없으면 sell-failed(보유없음).
   * - 시작 주식수는 history에서 도출 (initial=초기보유는 현금 이동 없이 가산, 매매 집계 제외).
   * @param options 대상 캔들 + findBestConfig 조건 + 사용자 거래내역
   */
  export const simulate = (
    options: SimulateOptions,
  ): SimulateResult => {
    const candles = options.candles ?? [];
    const conditions = options.config?.conditions ?? [];
    const applyMode = options.config?.applyMode ?? 'combined';
    const ind = options.indicators;
    const fee = options.fee ?? 0;
    const closes = candles.map(c => c.close);

    // 지표 시리즈 (전체 구간 기준)
    const maFn = ind?.maExponential ? computeEmaSeries : computeSmaSeries;
    const maS = maFn(closes, ind?.maShort ?? 5);
    const maM = maFn(closes, ind?.maMid ?? 10);
    const maL = maFn(closes, ind?.maLong ?? 60);
    const macd = computeMacdSeries(closes, ind?.macdFast ?? 12, ind?.macdSlow ?? 26, ind?.macdSignal ?? 9);
    const rsi = computeRsiSeries(closes, ind?.rsiPeriod ?? 14);
    const rsiOb = ind?.rsiOb ?? 70;
    const rsiOs = ind?.rsiOs ?? 30;

    const operandOf = (name: string, i: number): number | null => {
      switch (name) {
        case '단기MA': return maS[i] ?? null;
        case '중기MA': return maM[i] ?? null;
        case '장기MA': return maL[i] ?? null;
        case 'MACD': return macd.macd[i] ?? null;
        case 'SIGNAL': return macd.signal[i] ?? null;
        case 'RSI': return rsi[i] ?? null;
        case '과매수': return rsiOb;
        case '과매도': return rsiOs;
        default: {
          const n = Number(name);
          return Number.isFinite(n) ? n : null;
        }
      }
    };
    const compare = (l: number, op: TradeCondition['operator'], r: number): boolean => {
      switch (op) {
        case '>': return l > r;
        case '>=': return l >= r;
        case '<': return l < r;
        case '<=': return l <= r;
        case '==': return l === r;
        case '!=': return l !== r;
      }
    };

    // 시작 포지션 — history에서 주식수 도출.
    // - initial(초기보유): 현금 이동 없이 보유만 가산, 매매 집계 제외 → noTradeBars를 막지 않음
    // - 일반 history: 현금 이동 반영 + 마지막 매매 봉을 noTradeBars 기준점으로 사용
    let cash = options.capital ?? 0;
    let shares = 0;
    let avgPrice = 0; // 보유 평단 (수수료 포함 원가 기준)
    const histBars: number[] = [];
    for (const h of options.history ?? []) {
      if (h.initial) {
        const q = Math.max(0, Math.floor(h.shares) || 0);
        if (q > 0) {
          avgPrice = shares + q > 0 ? (avgPrice * shares + h.price * q) / (shares + q) : h.price;
          shares += q;
        }
        continue;
      }
      if (h.action === 'buy') {
        const affordable = Math.min(h.shares, Math.floor(cash / (h.price * (1 + fee))));
        if (affordable > 0) {
          const cost = affordable * h.price * (1 + fee);
          avgPrice = (avgPrice * shares + cost) / (shares + affordable);
          cash -= cost;
          shares += affordable;
          const bi = candles.findIndex(c => c.date === h.date);
          if (bi >= 0) histBars.push(bi);
        }
      } else if (h.action === 'sell') {
        const s = Math.min(h.shares, shares);
        cash += s * h.price * (1 - fee);
        shares -= s;
        if (shares <= 0) avgPrice = 0;
        if (s > 0) {
          const bi = candles.findIndex(c => c.date === h.date);
          if (bi >= 0) histBars.push(bi);
        }
      }
    }

    const trades: UserTrade[] = [];
    // 조건별 쿨다운 만료 봉 (발동 후 barredUntil 봉까지 스킵)
    const barredUntil = new Array(conditions.length).fill(-1);
    // history 실제 매매 중 가장 마지막 봉 — noTradeBars 기준점 (initial 제외)
    let lastTradeBar = histBars.length ? Math.max(...histBars) : -Infinity;
    // 연속 집행 상한 (플랜 execPolicy) — N봉 연속 체결 시 restBars 휴식.
    // cooldown(조건별)·noTradeBars(전역 간격)와 별개로 연타 스트릭 자체를 자름. 리스크 청산은 휴식 중에도 동작.
    const execPolicy = options.config?.execPolicy;
    // 묶음 집행 그리드 (2 이상) — 절대봉 i % N === N-1 에서만 네팅 1건 집행, 사이는 누적.
    // 윈도우 잘라도 그리드 동일 → 풀윈도우 ≣ 청크분할 일치 (미래 참조 없음).
    const batchN = execPolicy?.batchBars != null && execPolicy.batchBars >= 2
      ? Math.floor(execPolicy.batchBars)
      : 0;
    const bs0 = options.batchState;
    let pendBuy = bs0?.buy ?? 0;
    let pendSell = bs0?.sell ?? 0;
    let pendBuyCond: TradeCondition | undefined = bs0?.buyCond ? { ...bs0.buyCond } : undefined;
    let pendSellCond: TradeCondition | undefined = bs0?.sellCond ? { ...bs0.sellCond } : undefined;
    let consecExecBars = 0;
    let restUntil = -1;
    const noteBar = (t0: number, bar: number) => {
      if (!execPolicy) return;
      const n = trades.slice(t0).filter(t => t.action === 'buy' || t.action === 'sell').length;
      if (n === 0) { consecExecBars = 0; return; }
      if (bar > restUntil) {
        consecExecBars += 1;
        if (execPolicy.maxConsecBars >= 1 && consecExecBars >= execPolicy.maxConsecBars) {
          restUntil = bar + execPolicy.restBars;
          consecExecBars = 0;
        }
      }
    };
    // 조건 1건 집행 (봉당 1건. 묶음 플러시와 즉시 집행이 공유)
    const doExecute = (exCond: TradeCondition, exCandidates: TradeCondition[], c: Candle, i: number, price: number) => {
      if (exCond.action === 'buy') {
        const budget = cash * (exCond.percent / 100);
        const qty = Math.floor(budget / (price * (1 + fee)));
        if (qty < 1) {
          trades.push({ date: c.date, action: 'buy-failed', price, shares: 0, reason: '잔액부족', condition: { ...exCond }, candidates: exCandidates });
        } else {
          const cost = qty * price * (1 + fee);
          avgPrice = (avgPrice * shares + cost) / (shares + qty);
          cash -= cost;
          shares += qty;
          trades.push({ date: c.date, action: 'buy', price, shares: qty, condition: { ...exCond }, candidates: exCandidates });
          lastTradeBar = i;
        }
      } else {
        const qty = Math.floor(shares * (exCond.percent / 100));
        if (qty < 1) {
          trades.push({ date: c.date, action: 'sell-failed', price, shares: 0, reason: '보유없음', condition: { ...exCond }, candidates: exCandidates });
        } else {
          cash += qty * price * (1 - fee);
          shares -= qty;
          if (shares <= 0) avgPrice = 0;
          trades.push({ date: c.date, action: 'sell', price, shares: qty, condition: { ...exCond }, candidates: exCandidates });
          lastTradeBar = i;
        }
      }
    };
    // 묶음 플러시 — 누적 매수/매도 네팅 후 우세 측 1건 (combined 상한 50). 상쇄 시 무거래.
    const flushBatch = (c: Candle, i: number, price: number) => {
      const net = pendBuy - pendSell;
      const dom = net > 0 ? pendBuyCond : net < 0 ? pendSellCond : undefined;
      pendBuy = 0; pendSell = 0; pendBuyCond = undefined; pendSellCond = undefined;
      if (net === 0 || !dom) return;
      doExecute({ ...dom, percent: Math.min(50, Math.abs(net)) }, conditions.map(x => ({ ...x })), c, i, price);
    };

    candles.forEach((c, i) => {
      const t0 = trades.length;
      const price = c.close;
      if (!(price > 0)) { noteBar(t0, i); return; }
      if (i < (options.fromBar ?? 0)) return;
      // 리스크 청산 — 조건 평가보다 먼저 (평단 대비 수익률 기준)
      const stopPct = options.risk?.stopLossPct;
      const takePct = options.risk?.takeProfitPct;
      if (shares > 0 && avgPrice > 0 && (stopPct != null || takePct != null)) {
        const ret = ((price - avgPrice) / avgPrice) * 100;
        if (stopPct != null && ret <= -Math.abs(stopPct)) {
          const candidates = conditions.map(x => ({ ...x }));
          cash += shares * price * (1 - fee);
          trades.push({ date: c.date, action: 'sell', price, shares, reason: '스탑로스', candidates });
          shares = 0; avgPrice = 0; lastTradeBar = i;
          // 스탑로스 전량청산 → 묶음 파기 (깨진 국면의 묶인 의도 무효)
          pendBuy = 0; pendSell = 0; pendBuyCond = undefined; pendSellCond = undefined;
          noteBar(t0, i);
          return;
        }
        if (takePct != null && ret >= Math.abs(takePct)) {
          const q = Math.floor(shares / 2);
          if (q > 0) {
            const candidates = conditions.map(x => ({ ...x }));
            cash += q * price * (1 - fee);
            shares -= q;
            if (shares <= 0) avgPrice = 0;
            trades.push({ date: c.date, action: 'sell', price, shares: q, reason: '익절', candidates });
            lastTradeBar = i;
          }
        }
      }
      // 연속 상한 휴식 — 조건 평가 스킵 (리스크 청산은 위에서 이미 처리)
      if (execPolicy && i <= restUntil) { noteBar(t0, i); return; }
      // 발동 조건 수집
      const fired: number[] = [];
      conditions.forEach((cond, ci) => {
        if (i <= barredUntil[ci]) return;
        if (cond.noTradeBars != null && i - lastTradeBar <= cond.noTradeBars) return;
        const l = operandOf(cond.left, i);
        const r = operandOf(cond.right, i);
        if (l == null || r == null) return;
        if (compare(l, cond.operator, r)) fired.push(ci);
      });
      if (!fired.length) { noteBar(t0, i); return; }
      // 집행 대상 선정 — 모든 모드에서 봉당 최대 1건
      // - min/max: 최소/최대 percent 조건 1건 (동점이면 첫 조건)
      // - combined: 매수합 vs 매도합, 우세 측 1건에 합산 비중으로 집행 (50 상한)
      let pick: number | null = null;
      let execPercent = 0;
      if (applyMode === 'max') {
        const m = Math.max(...fired.map(ci => conditions[ci].percent));
        pick = fired.find(ci => conditions[ci].percent === m) ?? null;
        execPercent = m;
      } else if (applyMode === 'min') {
        const m = Math.min(...fired.map(ci => conditions[ci].percent));
        pick = fired.find(ci => conditions[ci].percent === m) ?? null;
        execPercent = m;
      } else {
        const sumOf = (side: 'buy' | 'sell') =>
          fired.filter(ci => conditions[ci].action === side).reduce((s, ci) => s + conditions[ci].percent, 0);
        const side: 'buy' | 'sell' = sumOf('buy') >= sumOf('sell') ? 'buy' : 'sell';
        const cands = fired.filter(ci => conditions[ci].action === side);
        const m = Math.max(...cands.map(ci => conditions[ci].percent));
        pick = cands.find(ci => conditions[ci].percent === m) ?? null;
        execPercent = Math.min(50, side === 'buy' ? sumOf('buy') : sumOf('sell'));
      }
      if (pick == null) { noteBar(t0, i); return; }
      {
        const ci = pick;
        const cond = { ...conditions[ci], percent: execPercent, applyMode };
        // 발동 시점 전체 조건 스냅샷 (어떤 조건들이 걸려 있었는지 추적용)
        const candidates = conditions.map(c => ({ ...c }));
        if (batchN >= 2) {
          // 묶음: 누적만 하고 그리드봉(i % N === N-1)에서 네팅 1건 플러시
          if (cond.action === 'buy') {
            pendBuy += execPercent;
            if (!pendBuyCond || execPercent > pendBuyCond.percent) pendBuyCond = { ...cond };
          } else {
            pendSell += execPercent;
            if (!pendSellCond || execPercent > pendSellCond.percent) pendSellCond = { ...cond };
          }
          if (cond.cooldownBars != null) barredUntil[ci] = i + cond.cooldownBars;
          if (i % batchN === batchN - 1) flushBatch(c, i, price);
        } else {
          doExecute(cond, candidates, c, i, price);
          if (cond.cooldownBars != null) barredUntil[ci] = i + cond.cooldownBars;
        }
      }
      noteBar(t0, i);
    });

    return {
      trades,
      batchState: {
        buy: pendBuy, sell: pendSell,
        ...(pendBuyCond ? { buyCond: { ...pendBuyCond } } : {}),
        ...(pendSellCond ? { sellCond: { ...pendSellCond } } : {}),
      },
      returnPct: (() => {
        if (!candles.length) return 0;
        const first = candles[0].close;
        const lastC = candles[candles.length - 1].close;
        const initValue = (options.history ?? [])
          .filter(h => h.initial)
          .reduce((s, h) => s + Math.max(0, Math.floor(h.shares) || 0) * first, 0);
        const startEq = (options.capital ?? 0) + initValue;
        if (!(startEq > 0)) return 0;
        return ((cash + shares * lastC - startEq) / startEq) * 100;
      })(),
    };
  };

  // NOTE:旧 리플레이 원장 정산(settleTradeToLedger/SimTrade)은 현 로직에서 미사용이라 삭제.
  // 페이지 runAutoTradeLoop → replayFills가 승인 내역 정산을 담당. (2026-09-11 정리)
}
