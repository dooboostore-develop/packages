# @dooboostore/algorithm

[![NPM version](https://img.shields.io/npm/v/@dooboostore/algorithm.svg?color=cb3837&style=flat-square)](https://www.npmjs.com/package/@dooboostore/algorithm)
[![Build and Test](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

Pure-function stock/candle analysis algorithms — technical indicators (SMA/EMA/MACD/RSI/OBV), trend-regime segmentation, and a rule-based trading strategy generator + backtest simulator. No DOM, no chart, no I/O — every export is a plain function/namespace operating on plain data.

---

## Features

- **Technical indicators** (`trend.ts`): SMA, EMA, MACD (line/signal/histogram), RSI, OBV as standalone series functions.
- **Trend-regime segmentation** (`TrendRange`): turns a MACD+RSI+OBV bar series into contiguous, direction-labeled "zones" (up/down/side, or your own `groupBy` labels), with a prefix-stable, deterministic algorithm — the same input prefix always produces the same committed zones even as more bars are appended.
- **Rule-based trading engine** (`TradingSimulator`): `findBestConfig` derives a small set of buy/sell conditions (MA cross, MACD cross, RSI overbought/oversold) from candle physics-style features (velocity/acceleration/force/gravity relative to a long MA, PCA-projected "regime" score) plus an inlined gradient-boosting direction model; `simulate` replays those conditions bar-by-bar into an actual trade ledger (fees, cooldowns, batching, stop-loss/take-profit, insufficient-funds handling).
- **Zero DOM/runtime dependencies** — only depends on `@dooboostore/core` (for `HashUtils`). Safe to use in Node, browser, or worker contexts.

## Public API

`@dooboostore/algorithm`'s root (`src/index.ts`) re-exports exactly these modules:

- `Candle` — the `interface Candle` OHLCV bar type (`stock/Candle.ts`)
- `trend.ts` — `computeSmaSeries`, `computeEmaSeries`, `computeMacdSeries`, `computeRsiSeries`, `computeObvSeries`
- `TrendRange` — namespace with `scoreBars`, `strengthBars`, `trendRanges` and their types
- `TradingSimulator` — namespace with `estimateMarketRate`, `forecast`, `directionProbability`, `findBestConfig`, `simulate` and their types

`boostModel.ts`/`boostModelMacro.ts` (the inlined gradient-boosting trees used internally by `directionProbability`) are **not** re-exported from the package root — they're auto-generated model weights (see [Internal Model Files](#internal-model-files-not-part-of-the-public-api) below), not a public API surface.

## Installation

```bash
# pnpm
pnpm add @dooboostore/algorithm

# npm
npm install @dooboostore/algorithm

# yarn
yarn add @dooboostore/algorithm
```

## Quick Start

### Technical indicators

```typescript
import { computeSmaSeries, computeRsiSeries, computeMacdSeries } from '@dooboostore/algorithm';

const closes = [10, 10.5, 11, 10.8, 11.2, 11.5, 11.3, 11.8, 12, 12.4];

const sma5 = computeSmaSeries(closes, 5);   // (number | null)[] — null until the window has formed
const rsi14 = computeRsiSeries(closes, 14); // number[] — same length as input, seeded to 50 until enough bars
const { macd, signal, hist } = computeMacdSeries(closes, 12, 26, 9);
```

### Trend-regime zones

```typescript
import { TrendRange } from '@dooboostore/algorithm';

// One bar per candle — macd/rsi/obv usually come from computeMacdSeries/computeRsiSeries/computeObvSeries
const bars: TrendRange.TrendBar[] = closes.map((c, i) => ({
  macd: macd[i], rsi: rsi14[i], obv: 0,
}));

const zones = TrendRange.trendRanges(bars);
// zones: TrendRange.TendRange[] — { startIndex, endIndex, scoreRate, strengthRate, group, uuid, confirmed, forecastRate }
// all zones but the last are `confirmed: true` and are prefix-stable as new bars are appended.
```

### Strategy generation + backtest

```typescript
import { TradingSimulator } from '@dooboostore/algorithm';
import type { Candle } from '@dooboostore/algorithm';

const candles: Candle[] = [
  { date: 'd0', open: 10, high: 10, low: 10, close: 10, volume: 1000 },
  { date: 'd1', open: 11, high: 11, low: 11, close: 11, volume: 1000 },
  // ... at least a few dozen bars for directionProbability to leave its 0.5 (neutral) fallback
];

const indicators: TradingSimulator.IndicatorParams = {
  macdFast: 12, macdSlow: 26, macdSignal: 9,
  rsiPeriod: 14, rsiOb: 70, rsiOs: 30,
  maShort: 5, maMid: 10, maLong: 60,
  maExponential: false,
};

// 1) Derive buy/sell conditions from the candles
const plan = TradingSimulator.findBestConfig(candles, { strategyRate: 0.5, indicators });
// plan: { conditions, applyMode: 'min'|'max'|'combined', conviction, upProbability, execPolicy? }

// 2) Replay the plan against the same (or a later/expanding) candle window
const result = TradingSimulator.simulate({
  candles,
  config: plan,
  history: [],       // prior TradingSimulator.UserTrade[]; [] for a fresh run
  indicators,
  capital: 1_000_000,
  fee: 0.001,
});
// result: { trades: TradingSimulator.UserTrade[], returnPct: number, batchState }
```

## API Reference

### `Candle` (`stock/Candle.ts`)

```typescript
interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
```

The common OHLCV input type accepted by every other function in this package.

### Indicators (`stock/trend.ts`)

All functions are pure and take/return plain arrays — no shared state between calls.

| Function | Signature | Notes |
| --- | --- | --- |
| `computeSmaSeries` | `(closes: number[], period: number) => (number \| null)[]` | Simple moving average; `null` until the window has fully formed. |
| `computeEmaSeries` | `(values: number[], period: number) => number[]` | Exponential moving average; seeded with the first value, defined over the whole input. |
| `computeMacdSeries` | `(closes: number[], fast: number, slow: number, sig: number) => { macd: number[]; signal: number[]; hist: number[] }` | `macd = EMA(fast) - EMA(slow)`, `signal = EMA(macd, sig)`, `hist = macd - signal`. Auto-corrects `slow` to `fast + 1` if `slow <= fast`. |
| `computeRsiSeries` | `(closes: number[], period: number) => number[]` | Wilder's RSI (smoothed average gain/loss). Returns `50` for the warm-up region. |
| `computeObvSeries` | `(closes: number[], volumes: number[]) => number[]` | On-Balance Volume — cumulative signed volume by close-to-close direction. |

### `TrendRange` (`stock/TrendRange.ts`)

Turns per-bar MACD/RSI/OBV (optionally OHLC too) into contiguous, labeled trend zones. Everything is a pure function over arrays — no DOM/chart/engine dependency.

**Types:**

- `TrendRange.TrendBar` — `{ macd, rsi, obv, open?, high?, low?, close? }` (all `number | null`, OHLC optional)
- `TrendRange.TendRange` — one output zone: `{ startIndex, endIndex, scoreRate, strengthRate, group, uuid, confirmed, forecastRate }`
  - `scoreRate` (0~1): direction — 0 = bearish, 0.5 = neutral, 1 = bullish (average of the bar-level scores in the zone)
  - `strengthRate` (0~1): trend strength regardless of direction — 0 = ranging, 1 = strongly trending
  - `confirmed`: `false` only for the last zone (the "live edge") — it can still change shape as new bars arrive; every earlier zone is frozen and prefix-stable
  - `forecastRate`: linear extrapolation of the last up-to-3 confirmed zones' `scoreRate` slope (causal — only ever looks at *prior* confirmed zones), or `null` if there's no prior zone
  - `uuid`: deterministic hash (`HashUtils.hash53`) of the zone's full bar data — identical input always yields the identical id
- `TrendRange.TrendRangeConfig` — tuning knobs, all optional: `obvPeriod` (default 10), `macdSignalMa` (default 9), `strengthPeriod` (default 10), `mergeCut` (default 10 — shorter closed runs get absorbed into the next zone), `decisiveCut` (default 0.15 — a short run this decisive still freezes immediately instead of being absorbed), `groupBy?: (rate, strength) => string` (default: `String(rate)` — your own labeling function is also the sole merge criterion: adjacent runs only fuse when their materialized label is equal)

**Functions:**

- `TrendRange.scoreBars(bars, config?): (number | null)[]` — per-bar direction score (0~1), averaging whichever of {MACD-vs-zero-and-signal, RSI/100, OBV-vs-N-bar-average} are present on that bar.
- `TrendRange.strengthBars(bars, scores, config?): (number | null)[]` — per-bar strength (0~1), averaging distance-from-neutral, candle body ratio, and (if OHLC present) N-bar displacement-over-range efficiency.
- `TrendRange.trendRanges(bars, config?): TendRange[]` — the single entry point: scores + groups bars, merges/freezes runs left-to-right in one pass, and fills in `forecastRate`. See `test/trendrange.test.ts` and `test/trendrange-stability.test.ts` for the exact freeze/merge/prefix-stability contract this function guarantees.

### `TradingSimulator` (`stock/TradingSimulator.ts`)

A two-step "generate a plan, then replay it" trading engine.

**`TradingSimulator.findBestConfig(candles, options?): AutoTradeResult`**

Derives trade conditions from a physics-flavored feature set computed over the candle window — price velocity/acceleration (via Catmull-Rom-smoothed closes), volume as "mass", force = mass × acceleration, "gravity" pull toward the long MA, and a PCA-projected regime score over those — blended with an inlined gradient-boosting `directionProbability` model.

- `options.strategyRate?: number` (0~1, default 0.5) — 0 leans toward averaging down on dips, 1 leans toward adding to winners
- `options.marketRate?: number` (0~1, default 0.5) — overall market condition; shifts `applyMode` (`< 0.35` → `'min'`, `> 0.65` → `'max'`, else `'combined'`) and position-size scaling
- `options.indicators?: IndicatorParams` — `{ macdFast, macdSlow, macdSignal, rsiPeriod, rsiOb, rsiOs, maShort, maMid, maLong, maExponential }`
- `options.macro?: MarketSeries` — optional `{ tnx, wti, spx }` external-factor series (index-aligned with `candles`); when present, `directionProbability` uses a 13-feature model instead of the base 10-feature one
- `options.invertActions?: boolean` — flips every generated condition's `buy`/`sell`
- `options.tuning?: TuningOverrides` — advanced knobs (`quietBarsAdd`, `percentCapScale`, `cooldownScale`, `gateShift`, `maxConsecBars`, `consecRestBars`, `batchBars`, `minBudgetEquityPct`, `minEdge`, `convictionBlend`) — all default to the current production behavior when omitted
- Returns `AutoTradeResult`: `{ conditions: TradeCondition[], applyMode, conviction, upProbability, execPolicy? }`

**`TradingSimulator.simulate(options): SimulateResult`**

Replays `AutoTradeResult.conditions` bar-by-bar against `options.candles`, one order at most per bar.

- `options.candles`, `options.config` (an `AutoTradeResult`), `options.history: UserTrade[]` (prior trades — `initial: true` entries seed a starting position without moving cash), `options.indicators`, `options.capital?`, `options.fee?` (0~1, taken on both buy and sell)
- `options.risk?: { stopLossPct?, takeProfitPct? }` — checked before condition evaluation each bar, against the running average cost basis
- `options.fromBar?` / `options.batchState?` — resume points for incremental/streaming re-simulation of a growing candle window
- Returns `{ trades: UserTrade[], returnPct: number, batchState }` — `trades[].action` is `'buy' | 'sell' | 'buy-failed' | 'sell-failed'`, with `reason` set on failures (`'잔액부족'` insufficient funds, `'보유없음'` nothing to sell, `'소액제외'` order too small relative to equity) and `condition`/`candidates` snapshots of what fired

**Standalone helpers:**

- `TradingSimulator.estimateMarketRate(candles, indicators?): number` — 0~1 market-condition estimate (long-MA slope + volatility penalty + RSI position), meant as a drop-in for the `marketRate` option above.
- `TradingSimulator.forecast(candles, maSize, market?): number[]` — naive near-term close forecast: reverses the last `maSize` bar-over-bar return rates and compounds them forward from the last close, with damping scaled by `directionProbability`'s confidence.
- `TradingSimulator.directionProbability(candles, market?): number` — 0~1 probability of being up 5 bars from now; returns `0.5` (neutral) until at least 30 bars of history exist.

See `test/engine.test.ts` for further worked examples of `simulate` (partial fills, `applyMode` variants, cooldowns, batching) and `test/trendrange.test.ts` / `test/trendrange-stability.test.ts` for `TrendRange`'s exact merge/freeze/prefix-stability guarantees.

### Internal model files (not part of the public API)

`stock/boostModel.ts` and `stock/boostModelMacro.ts` hold auto-generated gradient-boosting tree weights (exported from a Python `sklearn.HistGradientBoostingClassifier`, per their own header comments) plus the small `predictBoostLogOdds`/`predictMacroLogOdds` evaluators. `TradingSimulator.directionProbability` imports and calls these directly; they are **not** re-exported from `src/index.ts`, are not meant to be consumed directly, and their bin/tree arrays are not hand-authored data you should read as documentation.

## Related Packages

- [@dooboostore/core](https://www.npmjs.com/package/@dooboostore/core) — the only runtime dependency (`HashUtils`)
- [@dooboostore/simple-web-component-library](https://www.npmjs.com/package/@dooboostore/simple-web-component-library) — its `StockChart` component imports this package's indicator functions (`computeMacdSeries`, `computeRsiSeries`, `computeObvSeries`, `computeSmaSeries`, `computeEmaSeries`) directly

## License

This package is licensed under the [MIT License](https://opensource.org/licenses/MIT).
