/** 추세 레짐 — MACD+RSI+OBV 합성 점수 기반 (center 페이지에서 이식, 순수 함수) */

function ema(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const out = new Array<number>(values.length);
  let prev = values.length ? values[0] : 0;
  for (let i = 0; i < values.length; i++) {
    prev = i === 0 ? values[0] : values[i] * k + prev * (1 - k);
    out[i] = prev;
  }
  return out;
}

/** 종가 배열 → MACD선/시그널선/히스토그램 (차트 패키지와 동일한 수학식의 엔진 소유본) */
export function computeMacdSeries(
  closes: number[],
  fast: number,
  slow: number,
  sig: number,
): { macd: number[]; signal: number[]; hist: number[] } {
  let f = Math.max(2, Math.round(fast) || 12);
  let s = Math.max(2, Math.round(slow) || 26);
  const g = Math.max(2, Math.round(sig) || 9);
  if (s <= f) s = f + 1;
  const ef = ema(closes, f);
  const es = ema(closes, s);
  const macd = closes.map((_, i) => ef[i] - es[i]);
  const signal = ema(macd, g);
  const hist = macd.map((v, i) => v - signal[i]);
  return { macd, signal, hist };
}

export function computeRsiSeries(closes: number[], period: number): number[] {
  const p = Math.max(2, Math.round(period) || 14);
  const n = closes.length;
  const out = new Array<number>(n).fill(50);
  if (n <= p) return out;
  let gain = 0, loss = 0;
  for (let i = 1; i <= p; i++) {
    const d = closes[i] - closes[i - 1];
    if (d > 0) gain += d; else loss -= d;
  }
  let avgG = gain / p, avgL = loss / p;
  const rsiAt = (g: number, l: number): number => {
    if (l === 0) return g === 0 ? 50 : 100;
    const rs = g / l;
    return 100 - 100 / (1 + rs);
  };
  const first = rsiAt(avgG, avgL);
  for (let i = 0; i <= p; i++) out[i] = first;
  for (let i = p + 1; i < n; i++) {
    const d = closes[i] - closes[i - 1];
    avgG = (avgG * (p - 1) + (d > 0 ? d : 0)) / p;
    avgL = (avgL * (p - 1) + (d < 0 ? -d : 0)) / p;
    out[i] = rsiAt(avgG, avgL);
  }
  return out;
}

export function computeObvSeries(closes: number[], volumes: number[]): number[] {
  const n = closes.length;
  const out = new Array<number>(n).fill(0);
  for (let i = 1; i < n; i++) {
    const v = volumes[i] || 0;
    out[i] = out[i - 1] + (closes[i] > closes[i - 1] ? v : closes[i] < closes[i - 1] ? -v : 0);
  }
  return out;
}

/** 추세 구간 1개 (표시·최적화 공통 정체성: 라벨·색상 포함) */
export interface TrendZone {
  from: number;
  to: number;
  trend: number;
  label: string;
  color: string;
}

export function trendRegimeOf(trend: number): { label: string; color: string } {
  if (trend > 0.6) return { label: '상승', color: '#ef4444' };
  if (trend < 0.4) return { label: '하락', color: '#3e63dd' };
  return { label: '횡보', color: '#94a3b8' };
}

/** 추세 판단용 보조지표 1봉분 (화면단 판단, null = 해당 지표 없음) */
export interface TrendBar {
  macd: number | null;
  signal: number | null;
  rsi: number | null;
  obv: number | null;
}

/** MACD+RSI+OBV → 추세 점수 0~1 (0.5=횡보, 1=상승, 0=하락).
 *  MACD 0선/시그널 관계 + RSI/100 + OBV vs N봉 평균을 동일 가중 평균. 없는 지표는 제외. */
export function scoreTrendBars(bars: TrendBar[], obvPeriod = 10): (number | null)[] {
  const n = bars.length;
  const out = new Array<number | null>(n).fill(null);
  if (!n) return out;
  const p = Math.max(2, Math.round(obvPeriod) || 10);
  for (let i = 0; i < n; i++) {
    const b = bars[i];
    const parts: number[] = [];
    if (b.macd != null) {
      const zero = b.macd >= 0 ? 1 : 0;
      parts.push(b.signal != null ? (zero + (b.macd >= b.signal ? 1 : 0)) / 2 : zero);
    }
    if (b.rsi != null) parts.push(Math.max(0, Math.min(1, b.rsi / 100)));
    if (b.obv != null) {
      let sum = 0, cnt = 0;
      for (let k = Math.max(0, i - p + 1); k <= i; k++) {
        const v = bars[k].obv;
        if (v != null) { sum += v; cnt++; }
      }
      if (cnt > 0) {
        const avg = sum / cnt;
        parts.push(b.obv > avg ? 1 : b.obv < avg ? 0 : 0.5);
      }
    }
    if (parts.length) out[i] = parts.reduce((a, c) => a + c, 0) / parts.length;
  }
  return out;
}

/** 추세 점수 → 레짐 분할 (hi 초과=상승, lo 미만=하락, 그 외=횡보).
 *  짧은 구간은 이웃에 병합, 최대 maxSets개. 세트 trend = 구간 평균 점수. */
export function splitScoreSegments(scores: (number | null)[], minLen = 10, maxSets = 6, hi = 0.6, lo = 0.4): { from: number; to: number; trend: number }[] {
  const n = scores.length;
  if (!n) return [];
  const labelOf = (s: number | null, prev: number): number => s == null ? prev : s > hi ? 1 : s < lo ? -1 : 0;
  const segs: { from: number; to: number; regime: number }[] = [];
  let s = 0;
  let cur = labelOf(scores[0], 0);
  for (let i = 1; i < n; i++) {
    const u = labelOf(scores[i], cur);
    if (u !== cur) { segs.push({ from: s, to: i - 1, regime: cur }); s = i; cur = u; }
  }
  segs.push({ from: s, to: n - 1, regime: cur });
  const absorb = (arr: { from: number; to: number; regime: number }[], idx: number): void => {
    if (arr.length <= 1) return;
    if (idx === 0) { arr[1].from = arr[0].from; arr.shift(); }
    else { arr[idx - 1].to = arr[idx].to; arr.splice(idx, 1); }
  };
  for (;;) {
    const si = segs.findIndex(g => (g.to - g.from + 1) < Math.max(1, minLen));
    if (si < 0 || segs.length <= 1) break;
    absorb(segs, si);
  }
  while (segs.length > Math.max(1, maxSets)) {
    let mi = 0;
    segs.forEach((g, i) => { if ((g.to - g.from) < (segs[mi].to - segs[mi].from)) mi = i; });
    absorb(segs, mi);
  }
  return segs.map(g => {
    let sum = 0, cnt = 0;
    for (let i = g.from; i <= g.to; i++) {
      const v = scores[i];
      if (v != null) { sum += v; cnt++; }
    }
    return { from: g.from, to: g.to, trend: cnt > 0 ? sum / cnt : (g.regime > 0 ? 1 : g.regime < 0 ? 0 : 0.5) };
  });
}

/** 종가·거래량 배열 → 현재(마지막 구간) 레짐 라벨 */
export function currentRegimeLabel(closes: number[], volumes: number[]): string {
  if (!closes.length) return '횡보';
  const macd = computeMacdSeries(closes, 12, 26, 9);
  const rsi = computeRsiSeries(closes, 14);
  const obv = computeObvSeries(closes, volumes);
  const bars = closes.map((_, i) => ({ macd: macd.macd[i], signal: macd.signal[i], rsi: rsi[i], obv: obv[i] }));
  const scores = scoreTrendBars(bars, 10);
  const segs = splitScoreSegments(scores, 10, 12, 0.6, 0.4);
  if (!segs.length) return '횡보';
  return trendRegimeOf(segs[segs.length - 1].trend).label;
}
