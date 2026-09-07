/** 추세 레짐 — MACD+RSI+OBV 합성 점수 기반 (center 페이지에서 이식, 순수 함수) */

/** 종가 배열 → 단순이동평균 (미형성 구간은 null, 전체 구간 기준). */
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

/** 값 배열 → 지수이동평균 (첫 값 시드, 전 구간 정의). */
export function computeEmaSeries(values: number[], period: number): number[] {
  const p = Math.max(2, Math.round(period) || 12);
  const k = 2 / (p + 1);
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
  const ef = computeEmaSeries(closes, f);
  const es = computeEmaSeries(closes, s);
  const macd = closes.map((_, i) => ef[i] - es[i]);
  const signal = computeEmaSeries(macd, g);
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
