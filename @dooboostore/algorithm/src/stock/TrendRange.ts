/** 추세 구간 — MACD+RSI+OBV 합성 점수 기반, 순수 함수 단일 진입.
 *  입력(지표 배열) → 출력(구간 배열)만. DOM·차트·엔진 상태 무의존. */

import { HashUtils } from '@dooboostore/core';
import { computeEmaSeries } from './trend';

export namespace TrendRange {
  export type TrendBar = {
    macd: number | null;
    rsi: number | null;
    obv: number | null;
    open?: number | null;
    high?: number | null;
    low?: number | null;
    close?: number | null;
  }
  export type TendRange = {
    startIndex: number,
    endIndex: number,
    scoreRate: number, // 0~1 방향 (0 하락 ~ 0.5 중립 ~ 1 상승)
    strengthRate: number, // 0~1 강도 (0 횡보 ~ 1 강력 추세)
    group: string,
    uuid: string
  }
  export type TrendRangeConfig = {
    obvPeriod?: number,
    /** signal선 기간 (macd 배열의 EMA, 미지정 9) */
    macdSignalMa?: number,
    /** 강도 효율성 윈도우 (미지정 10) */
    strengthPeriod?: number,
    /** 최소 구간 길이 (미만은 이웃에 흡수, 미지정 10, 1 이하면 병합 안 함) */
    minLen?: number,
    /** 최대 구간 수 (초과 시 짧은 것부터 흡수, 미지정 12, 0 이하면 제한 없음) */
    maxSets?: number,
    /** 구간 이름 결정 (미지정 시 rate 그대로 문자열화 — 그룹 묶음은 호출자 책임) */
    groupBy?: (rate: number, strength: number) => string,
    /** 흡수 방향 (미지정 forward — 짧은 구간은 뒤쪽에 흡수해 앞 구간 불변. backward는 이전 방식) */
    mergeDir?: 'forward' | 'backward',
    /** 병합 상대 호환성 (미지정 시 전부 허용).
     *  groupBy와 같은 조건값 (scoreRate, strengthRate)으로 판단.
     *  짧은 구간 흡수 때 호환되는 이웃을 우선 선택. 둘 다 (비)호환이면 mergeDir 규칙. */
    mergeBy?: (aRate: number, aStrength: number, bRate: number, bStrength: number) => boolean,
  }
  /** macd 배열 → signal선 (null은 직전값 유지) */
  const buildSignalArr = (datas: TrendBar[], sigP: number): number[] => {
    let lastMacd = 0;
    const macdArr = datas.map(b => {
      if (b.macd != null) lastMacd = b.macd;
      return lastMacd;
    });
    return computeEmaSeries(macdArr, sigP);
  };
  /** MACD+RSI+OBV → 봉별 추세 점수 0~1.
   *  MACD 0선/signal선 관계 + RSI/100 + OBV vs N봉 평균을 동일 가중 평균. 없는 지표는 제외.
   *  signal선은 macd 배열 안에서 직접 계산 (null은 직전값 유지). */
  export const scoreBars = (datas: TrendBar[], config?: TrendRangeConfig): (number | null)[] => {
    const n = datas.length;
    const out = new Array<number | null>(n).fill(null);
    if (!n) return out;
    const obvP = Math.max(2, Math.round(config?.obvPeriod ?? OBV_PERIOD));
    const sigP = Math.max(2, Math.round(config?.macdSignalMa ?? 9));
    const signalArr = buildSignalArr(datas, sigP);
    for (let i = 0; i < n; i++) {
      const b = datas[i];
      const parts: number[] = [];
      if (b.macd != null) {
        const zero = b.macd >= 0 ? 1 : 0;
        parts.push((zero + (b.macd >= signalArr[i] ? 1 : 0)) / 2);
      }
      if (b.rsi != null) parts.push(Math.max(0, Math.min(1, b.rsi / 100)));
      if (b.obv != null) {
        let sum = 0, cnt = 0;
        for (let k = Math.max(0, i - obvP + 1); k <= i; k++) {
          const v = datas[k].obv;
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
  };
  /** 봉별 강도 0~1 (방향 무관).
   *  중립에서의 거리 + 효율성(|N봉간 이동|/Σ실체) + 봉 확정도(|종가-시가|/고저폭)를 동일 가중 평균.
   *  OHLC 없으면 거리만으로 계산. */
  export const strengthBars = (datas: TrendBar[], scores: (number | null)[], config?: TrendRangeConfig): (number | null)[] => {
    const n = datas.length;
    const out = new Array<number | null>(n).fill(null);
    if (!n) return out;
    const N = Math.max(2, Math.round(config?.strengthPeriod ?? 10));
    for (let i = 0; i < n; i++) {
      const parts: number[] = [];
      const s = scores[i];
      if (s != null) parts.push(Math.abs(s - 0.5) * 2);
      const b = datas[i];
      if (b.open != null && b.high != null && b.low != null && b.close != null && b.high > b.low) {
        parts.push(Math.max(0, Math.min(1, Math.abs(b.close - b.open) / (b.high - b.low))));
        if (i >= N) {
          let ok = true, trSum = 0;
          for (let k = i - N + 1; k <= i; k++) {
            const h = datas[k].high, l = datas[k].low;
            if (h == null || l == null || h < l) { ok = false; break; }
            trSum += h - l;
          }
          const c0 = datas[i - N].close, c1 = b.close;
          if (ok && trSum > 0 && c0 != null) parts.push(Math.max(0, Math.min(1, Math.abs(c1 - c0) / trSum)));
        }
      }
      if (parts.length) out[i] = parts.reduce((a, c) => a + c, 0) / parts.length;
    }
    return out;
  };
  /** 지표 배열 → 추세 구간 배열 (단일 진입점).
   *  봉별 점수에 groupBy를 적용해 연속 동일 그룹을 한 구간으로 묶음.
   *  score=null 봉은 이전 그룹 유지(첫 봉이면 groupBy(0.5)).
   *  uuid = `from-to` + 범위 내 macd·signal·rsi·obv·ohlc·score·strength 해시. */
  export const trendRanges = (datas: TrendBar[], config?: TrendRangeConfig): TendRange[] => {
    if (!datas.length) return [];
    const groupBy = config?.groupBy ?? ((rate: number) => String(rate));
    const q = (v: number | null): string => v == null ? '_' : v.toFixed(4);
    const scores = scoreBars(datas, config);
    const strengths = strengthBars(datas, scores, config);
    const sigP = Math.max(2, Math.round(config?.macdSignalMa ?? 9));
    const signalArr = buildSignalArr(datas, sigP);
    const groups = scores.map((s, i) => {
      if (s != null) return groupBy(s, strengths[i] ?? 0);
      for (let k = i - 1; k >= 0; k--) if (scores[k] != null) return groupBy(scores[k]!, strengths[k] ?? 0);
      return groupBy(0.5, 0);
    });
    // 연속 동일 그룹 묶음
    const runs: { from: number; to: number; group: string }[] = [];
    let s = 0;
    for (let i = 1; i < datas.length; i++) {
      if (groups[i] !== groups[i - 1]) { runs.push({ from: s, to: i - 1, group: groups[s] }); s = i; }
    }
    runs.push({ from: s, to: datas.length - 1, group: groups[s] });
    // 짧은 구간은 뒤쪽 이웃에 흡수 (앞 구간 불변 — 시간 순서대로 확정).
    // 맨 끝 구간만 앞에 붙음 (가장 최근이라 아직 잠정). mergeDir backward면 이전 방식.
    const backward = config?.mergeDir === 'backward';
    const absorb = (arr: { from: number; to: number; group: string }[], idx: number): void => {
      if (arr.length <= 1) return;
      const toPrev = backward ? idx !== 0 : idx >= arr.length - 1;
      if (toPrev) { arr[idx - 1].to = arr[idx].to; arr.splice(idx, 1); }
      else { arr[idx + 1].from = arr[idx].from; arr.splice(idx, 1); }
    };
    const minLen = Math.max(1, Math.round(config?.minLen ?? 10));
    // 맨 끝 구간은 잠정(live edge)이라 흡수 대상에서 제외 — 새 봉이 붙어도 앞 구간 불변
    for (;;) {
      const si = runs.findIndex((g, idx) => idx < runs.length - 1 && (g.to - g.from + 1) < minLen);
      if (si < 0 || runs.length <= 1) break;
      absorb(runs, si);
    }
    const maxSetsRaw = config?.maxSets ?? 12;
    const maxSets = maxSetsRaw <= 0 ? Number.POSITIVE_INFINITY : Math.max(1, Math.round(maxSetsRaw));
    while (runs.length > maxSets) {
      let mi = 0;
      runs.forEach((g, i) => { if ((g.to - g.from) < (runs[mi].to - runs[mi].from)) mi = i; });
      absorb(runs, mi);
    }
    // 인접 동종 합치기 (폴백 흡수로 생긴 연속 중복 제거 — 최종 라벨 기준, 최대 3회)
    const materialize = (list: { from: number; to: number }[]): TendRange[] => list.map(g => {
      let sum = 0, cnt = 0, sSum = 0, sCnt = 0;
      let raw = `${g.from}-${g.to}|`;
      for (let i = g.from; i <= g.to; i++) {
        const b = datas[i];
        if (scores[i] != null) { sum += scores[i]!; cnt++; }
        if (strengths[i] != null) { sSum += strengths[i]!; sCnt++; }
        raw += `${q(b.macd)},${q(signalArr[i])},${q(b.rsi)},${q(b.obv)},${q(b.open)},${q(b.high)},${q(b.low)},${q(b.close)},${q(scores[i])},${q(strengths[i])};`;
      }
      const rate = cnt > 0 ? sum / cnt : 0.5;
      const strength = sCnt > 0 ? sSum / sCnt : 0;
      return { startIndex: g.from, endIndex: g.to, scoreRate: rate, strengthRate: strength, group: groupBy(rate, strength), uuid: HashUtils.hash53(raw) };
    });
    let zones = materialize(runs);
    const mergeBy = config?.mergeBy;
    for (let guard = 0; guard < datas.length; guard++) {
      const dup = zones.findIndex((z, i) => i > 0 && (mergeBy
        ? mergeBy(zones[i - 1].scoreRate, zones[i - 1].strengthRate, z.scoreRate, z.strengthRate)
        : z.group === zones[i - 1].group));
      if (dup < 0) break;
      runs[dup - 1].to = runs[dup].to;
      runs.splice(dup, 1);
      zones = materialize(runs);
    }
    return zones;
  }
}

const OBV_PERIOD = 10;
