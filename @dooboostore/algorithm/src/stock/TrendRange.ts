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
    uuid: string,
    /** 확정 여부 — 마지막 구간(live edge)만 false. 새 봉이 오면 바뀔 수 있음 */
    confirmed: boolean,
    /** 예상 rate — 앞선 확정구간 rate들의 기울기 외삽 (0~1, prior 없으면 null).
     *  인과율 유지: prior만으로 계산하므로 확정구간의 값은 prefix 안정.
     *  scoreRate(실측)는 그대로 둠. */
    forecastRate: number | null
  }
  export type TrendRangeConfig = {
    obvPeriod?: number,
    /** signal선 기간 (macd 배열의 EMA, 미지정 9) */
    macdSignalMa?: number,
    /** 강도 효율성 윈도우 (미지정 10) */
    strengthPeriod?: number,
    /** 병합 컷 (미지정 10, 1이면 병합 안 함).
     *  닫힌 run이 이보다 짧으면 다음 미확정 run에 흡수.
     *  닫힘 자체는 추세 꺾임(그룹 바뀜) 즉시 — 길이 무관. */
    mergeCut?: number,
    /** 구간 이름 결정이자 유일한 병합 기준 (미지정 시 rate 그대로 문자열화).
     *  인접 run은 실체화된 라벨이 같을 때만 합쳐진다. */
    groupBy?: (rate: number, strength: number) => string,
    /** 강도 확정 컷 (미지정 0.15). 닫히는 run의 평균 |score-0.5|가 이 이상이면
     *  길이에 무관하게 즉시 확정. 측 컷(0.6/0.4 → 중립대 0.1)에 마진 얹은 값.
     *  groupBy 컷이 다르면 함께 조정할 것. */
    decisiveCut?: number,
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
   *  닫히는 run은 길거나 강하면(평균 |score-0.5| ≥ decisiveCut) 즉시 확정 —
   *  강한 짧은 구간이 미래 흡수로 바뀌는 일 없음. 약한 짧은 구간만 다음으로 흡수.
   *  prefix 안정: 같은 입력 앞부분은 데이터가 늘어나도 확정구간(마지막 제외)이
   *  범위·라벨·uuid 그대로 유지된다. 꼬리(live edge)만 바뀔 수 있다.
   *  forecastRate: 앞선 확정구간 rate 기울기 외삽 (인과율 유지, prior 없으면 null).
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
    const mergeCut = Math.max(1, Math.round(config?.mergeCut ?? 10));
    const materializeOne = (from: number, to: number, confirmed: boolean): TendRange => {
      let sum = 0, cnt = 0, sSum = 0, sCnt = 0;
      let raw = `${from}-${to}|`;
      for (let i = from; i <= to; i++) {
        const b = datas[i];
        if (scores[i] != null) { sum += scores[i]!; cnt++; }
        if (strengths[i] != null) { sSum += strengths[i]!; sCnt++; }
        raw += `${q(b.macd)},${q(signalArr[i])},${q(b.rsi)},${q(b.obv)},${q(b.open)},${q(b.high)},${q(b.low)},${q(b.close)},${q(scores[i])},${q(strengths[i])};`;
      }
      const rate = cnt > 0 ? sum / cnt : 0.5;
      const strength = sCnt > 0 ? sSum / sCnt : 0;
      return { startIndex: from, endIndex: to, scoreRate: rate, strengthRate: strength, group: groupBy(rate, strength), uuid: HashUtils.hash53(raw), confirmed, forecastRate: null };
    };
    const compatible = (a: TendRange, b: TendRange): boolean => a.group === b.group;
    // 범위 방향 확신도 — 평균 |score-0.5|. 컷 이상이면 짧아도 즉시 확정
    const decisiveness = (from: number, to: number): number => {
      let sum = 0, cnt = 0;
      for (let i = from; i <= to; i++) {
        const s = scores[i];
        if (s == null) continue;
        sum += Math.abs(s - 0.5); cnt++;
      }
      return cnt > 0 ? sum / cnt : 0;
    };
    const decisiveCut = Math.max(0, config?.decisiveCut ?? 0.15);
    // 앞선 확정구간 rate 기울기 외삽 (인과율: prior만 사용). prior 없으면 null
    const forecastFor = (priors: number[]): number | null => {
      if (!priors.length) return null;
      if (priors.length === 1) return Math.max(0, Math.min(1, priors[0]));
      const last3 = priors.slice(-3);
      const diffs = last3.slice(1).map((v, k) => v - last3[k]);
      const m = diffs.reduce((a, b) => a + b, 0) / diffs.length;
      return Math.max(0, Math.min(1, last3[last3.length - 1] + m));
    };
    // 시계열 확정 워크 — runs를 왼쪽에서 오른쪽으로 한 번만 훑는다.
    // 닫힌 구간은 그 자리에서 얼리고(범위·라벨·uuid 불변), 병합은 미확정 꼬리(cur) 안에서만 일어난다.
    // 같은 입력 prefix는 항상 같은 확정구간을 내놓으므로 prefix 안정.
    // 구간 수 무제한 — 확정구간은 절대 합치지 않음.
    const done: TendRange[] = [];
    let cur: { from: number; to: number; group: string } | null = null;
    for (const r of runs) {
      if (!cur) { cur = { ...r }; continue; }
      if (compatible(materializeOne(cur.from, cur.to, true), materializeOne(r.from, r.to, true))) {
        cur = { from: cur.from, to: r.to, group: r.group }; // fuse: 생존자는 최신 run의 그룹
        continue;
      }
      // cur 닫힘 (뒤에 비호환 run이 옴).
      // 길거나 강하면(방향 확신) 즉시 확정 — 짧은 강한 구간이 미래에 흡수되며 바뀌는 일 없음.
      if ((cur.to - cur.from + 1) >= mergeCut || decisiveness(cur.from, cur.to) >= decisiveCut) {
        done.push(materializeOne(cur.from, cur.to, true));
        cur = { ...r };
      } else {
        // 다음 미확정 run에 흡수 — 단, 합친 라벨이 바로 앞 확정구간과 같아지면
        // 인접 중복이 되므로 짧은 채로 확정 (앞 구간은 절대 안 건드림)
        const last = done[done.length - 1];
        if (last && materializeOne(cur.from, r.to, true).group === last.group) {
          done.push(materializeOne(cur.from, cur.to, true));
          cur = { ...r };
        } else {
          cur = { from: cur.from, to: r.to, group: r.group };
        }
      }
    }
    if (cur) done.push(materializeOne(cur.from, cur.to, false)); // live edge: 짧아도 그대로, 미확정
    // 예상 rate 채우기 — 각 구간은 앞선 확정구간 rate만으로 추정 (인과율 유지)
    for (let i = 0; i < done.length; i++) {
      done[i].forecastRate = forecastFor(done.slice(0, i).map(z => z.scoreRate));
    }
    return done;
  }
}

const OBV_PERIOD = 10;
