/** 추세 구간 — MACD+RSI+OBV 합성 점수 기반, 순수 함수 단일 진입.
 *  입력(지표 배열) → 출력(구간 배열)만. DOM·차트·엔진 상태 무의존. */

import { HashUtils } from '@dooboostore/core';
import { computeEmaSeries } from './trend';

export namespace TrendZone {
  export type TrendBar = {
    macd: number | null;
    rsi: number | null;
    obv: number | null;
  }
  export type TendZone = {
    startIndex: number,
    endIndex: number,
    scoreRate: number, // 0~1
    group: string,
    uuid: string
  }
  export type TrendZoneConfig = {
    obvPeriod?: number,
    /** signal선 기간 (macd 배열의 EMA, 미지정 9) */
    macdSignalMa?: number,
    /** 최소 구간 길이 (미만은 이웃에 흡수, 미지정 10) */
    minLen?: number,
    /** 최대 구간 수 (초과 시 짧은 것부터 흡수, 미지정 12) */
    maxSets?: number,
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
  export const scoreBars = (datas: TrendBar[], config?: TrendZoneConfig): (number | null)[] => {
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
  /** 지표 배열 → 추세 구간 배열 (단일 진입점).
   *  봉별 점수에 groupBy를 적용해 연속 동일 그룹을 한 구간으로 묶음.
   *  score=null 봉은 이전 그룹 유지(첫 봉이면 groupBy(0.5)).
   *  uuid = `from-to` + 범위 내 macd·signal·rsi·obv·score 해시. */
  export const trendZones = (datas: TrendBar[], groupBy: (rate: number) => string, config?: TrendZoneConfig): TendZone[] => {
    if (!datas.length) return [];
    const q = (v: number | null): string => v == null ? '_' : v.toFixed(4);
    const scores = scoreBars(datas, config);
    const sigP = Math.max(2, Math.round(config?.macdSignalMa ?? 9));
    const signalArr = buildSignalArr(datas, sigP);
    const groups = scores.map((s, i) => {
      if (s != null) return groupBy(s);
      for (let k = i - 1; k >= 0; k--) if (scores[k] != null) return groupBy(scores[k]!);
      return groupBy(0.5);
    });
    // 연속 동일 그룹 묶음
    const runs: { from: number; to: number }[] = [];
    let s = 0;
    for (let i = 1; i < datas.length; i++) {
      if (groups[i] !== groups[i - 1]) { runs.push({ from: s, to: i - 1 }); s = i; }
    }
    runs.push({ from: s, to: datas.length - 1 });
    // 짧은 구간은 이웃에 흡수 (첫 구간은 다음에, 나머지는 이전에)
    const absorb = (arr: { from: number; to: number }[], idx: number): void => {
      if (arr.length <= 1) return;
      if (idx === 0) { arr[1].from = arr[0].from; arr.shift(); }
      else { arr[idx - 1].to = arr[idx].to; arr.splice(idx, 1); }
    };
    const minLen = Math.max(1, Math.round(config?.minLen ?? 10));
    for (;;) {
      const si = runs.findIndex(g => (g.to - g.from + 1) < minLen);
      if (si < 0 || runs.length <= 1) break;
      absorb(runs, si);
    }
    const maxSets = Math.max(1, Math.round(config?.maxSets ?? 12));
    while (runs.length > maxSets) {
      let mi = 0;
      runs.forEach((g, i) => { if ((g.to - g.from) < (runs[mi].to - runs[mi].from)) mi = i; });
      absorb(runs, mi);
    }
    return runs.map(g => {
      let sum = 0, cnt = 0;
      let raw = `${g.from}-${g.to}|`;
      for (let i = g.from; i <= g.to; i++) {
        const b = datas[i];
        if (scores[i] != null) { sum += scores[i]!; cnt++; }
        raw += `${q(b.macd)},${q(signalArr[i])},${q(b.rsi)},${q(b.obv)},${q(scores[i])};`;
      }
      const rate = cnt > 0 ? sum / cnt : 0.5;
      return { startIndex: g.from, endIndex: g.to, scoreRate: rate, group: groupBy(rate), uuid: HashUtils.hash53(raw) };
    });
  }
}

const OBV_PERIOD = 10;
