# @dooboostore/simple-web-component-library

[![NPM version](https://img.shields.io/npm/v/@dooboostore/simple-web-component-library.svg?color=cb3837&style=flat-square)](https://www.npmjs.com/package/@dooboostore/simple-web-component-library)
[![Build and Test](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

A canvas-based chart and control component library built on [`@dooboostore/simple-web-component`](https://www.npmjs.com/package/@dooboostore/simple-web-component) (SWC). Every component here is a native Custom Element defined with SWC's `@elementDefine`, configured **declaratively through light-DOM child markup** (e.g. `<candle>`, `<vector>`, `<marker>`, `<thumb>`) rather than a JS-side configuration object, and rendered onto an internal `<canvas>` inside its shadow root.

Components watch their own children with `@mutationObserverLight` and re-collect + redraw automatically whenever that markup changes — you build charts by writing/mutating HTML, not by calling imperative draw APIs (though a `setData(...)` escape hatch exists on most of them for when you'd rather push data from JS).

---

## Public API

`@dooboostore/simple-web-component-library` root currently exposes `componentFactories: ComponentFactory[]` — six factory functions (`(w: Window) => CustomElementCtor`), one per component below. Each factory registers its tag on `w.customElements` the first time it's called (idempotent — returns the existing constructor on subsequent calls) and is meant to be handed to SWC's app bootstrap (`onStartedLazyDefineComponent: [...componentFactories]`) alongside your own page/component factories, the same way `apps/center` wires it up.

```typescript
import { componentFactories } from '@dooboostore/simple-web-component-library';
// componentFactories: [StockChart, RadarChart, BubbleChart, RangeSlider, CartesianChart, CartesianChart3D]
```

Individual named exports (types + the factory) are also available per component, e.g. `import CartesianChart, { CartesianChartData } from '@dooboostore/simple-web-component-library/CartesianChart'` — see each component's source file for its exact export list.

## Installation

```bash
# pnpm
pnpm add @dooboostore/simple-web-component-library

# npm
npm install @dooboostore/simple-web-component-library

# yarn
yarn add @dooboostore/simple-web-component-library
```

Register the components once at app startup:

```typescript
import 'reflect-metadata';
import { defineSwcAppBody } from '@dooboostore/simple-web-component';
import { componentFactories } from '@dooboostore/simple-web-component-library';

await defineSwcAppBody(window);
document.querySelector('#app')!.connect({
  onStartedLazyDefineComponent: [...componentFactories],
  // ...
});
```

---

## Components

### `<cartesian-chart>` (CartesianChart)

A general-purpose 2D coordinate-plane chart: draws series (polylines), polygons, vectors (arrows), markers (dots), circles/ellipses and arcs on a canvas with an auto-scaling grid, axis labels, wheel zoom, drag-to-pan, and pinch-zoom. Redraws whenever its children change (`@mutationObserverLight`) or the element resizes (`@resizeObserverLight`).

Host attributes:

| Attribute | Effect |
|---|---|
| `x-min`, `x-max`, `y-min`, `y-max` | Explicit axis bounds. Omitted / empty / `"auto"` → that bound is computed from the data (with ~18% padding). |
| `x-label`, `y-label` | Axis titles. |
| `center-x`, `center-y` | Force the view to be symmetric around this value on that axis (the auto-computed half-range is kept, but centered here) unless the corresponding `-min`/`-max` is explicit. |
| `disabled-aspect` | By default the chart forces equal pixel-scale on both axes (so vectors/circles aren't visually distorted); set this to plot each axis independently, stretched to fill the box. |
| `disabled-zoom` | Disable wheel/drag/pinch interaction. |
| `hide-grid` | Hide the background grid lines (axis labels/ticks still show). |

Public methods: `setData(data: CartesianChartData)` (push series/polygons/vectors/markers/circles/arcs from JS instead of child markup) and `reset()` (reset pan/zoom).

Child elements (read once on connect and on every mutation):

| Tag | Attributes | Draws |
|---|---|---|
| `<series>` | `points="x,y x,y ..."` (space/`;`/`\|`-separated pairs), `color`, `width` (default `2`), `dash` (e.g. `"5,4"`), `label`, `label-color` | Polyline |
| `<polygon>` | same `points` format (≥3 points), `color`, `width` (default `1.5`), `dash`, `fill`, `label`, `label-color` | Closed filled/stroked polygon, label at centroid |
| `<vector>` | `x1`, `y1`, `x2`, `y2`, `color`, `width` (default `2`), `dash`, `label`, `label-color` | Arrow from `(x1,y1)` to `(x2,y2)` |
| `<marker>` | `x`, `y`, `color` (default `#10b981`), `size` (default `4`), `label`, `label-color` | Filled dot |
| `<circle>` | `x`, `y`, `r`, `ry` (optional — omit for a visually round circle even on non-1:1 axes), `color`, `width` (default `2`), `dash`, `fill`, `label`, `label-color` | Circle/ellipse |
| `<arc>` | `x`, `y`, `r` (px), `start-angle`, `end-angle` (radians, math convention, y-up), `color` (default `#10b981`), `width` (default `1.6`) | Arc segment |

```html
<cartesian-chart x-min="-2" x-max="2" y-min="-2" y-max="2" x-label="x" y-label="y" style="height:280px">
  <vector x1="0" y1="0" x2="1" y2="0.5" color="#0f766e" width="4" label="v"></vector>
  <marker x="1" y="0.5" color="#ef4444" size="6" label="tip"></marker>
  <circle x="0" y="0" r="1.5" color="#e2e8f0" dash="4,4"></circle>
</cartesian-chart>
```

### `<cartesian-chart-3d>` (CartesianChart3D)

A 3D scene rendered with a hand-rolled orthographic-style projection (own 3×3 rotation-matrix math, no external 3D library) — draws a bounding grid box, X/Y/Z axes, 3D vectors/points/polygons, with mouse-drag / touch-drag orbit, two-finger pinch-zoom + twist-to-roll, wheel zoom, and optional on-screen jog rails for yaw/pitch/roll/zoom.

Host attributes: `yaw`, `pitch`, `roll` (initial camera angles in degrees, read once on connect and by `reset()`), `range` (fixes the axis extent; omitted → auto-fit to the largest child coordinate × 1.25), `hide-grid`, `hide-controls` (hides the jog rails), `show-rail-controller`, `disabled-drag`.

Public method: `reset()` — recompute `viewMat` from `yaw`/`pitch`/`roll` and zoom back to 1.

Child elements:

| Tag | Attributes | Draws |
|---|---|---|
| `<vector3d>` | `x1`,`y1`,`z1`,`x2`,`y2`,`z2`, `color`, `width` (default `2`), `label`, `label-color` | 3D arrow |
| `<point3d>` | `x`,`y`,`z`, `color` (default `#10b981`), `size` (default `4`), `label`, `label-color` | 3D point |
| `<polygon3d>` | `points="x,y,z x,y,z ..."` (≥3), `color`, `width` (default `1.5`), `fill`, `label`, `label-color` | 3D filled face |

Vectors and points are depth-sorted (painter's algorithm) before drawing so nearer shapes correctly occlude farther ones.

### `<stock-chart>` (StockChart)

A candlestick chart with volume/MACD/RSI/OBV sub-panels, moving averages, arbitrary line-series overlays, and rectangle/arc shape overlays — plus drag-to-pan, wheel/pinch zoom, and a tap/click readout mode. Indicator math (`SMA`/`EMA`/`MACD`/`RSI`/`OBV`) is computed by `computeSmaSeries`/`computeEmaSeries`/`computeMacdSeries`/`computeRsiSeries`/`computeObvSeries` from **`@dooboostore/algorithm`** (`src/stock/trend.ts`) — this component is the library's concrete UI consumer of that package.

Host attributes: `show-close-line`, `show-min-max`, `show-last-line` (booleans), `enabled-control` (drag-pan/wheel/pinch-zoom), `enabled-readout` (tap a candle to show its `CandleInfo`), `hidden-x-label`, `hidden-y-label`, `disabled-event` (ignore all pointer/touch/wheel input).

Child elements:

| Tag | Attributes | Meaning |
|---|---|---|
| `<candle>` | `date`, `open`, `high`, `low`, `close`, `volume`; nested `<line width color target>` / `<tooltip position label color line-color label-color line-width>` (`position`: `top`\|`bottom`\|`candle-top`\|`candle-bottom`) | One OHLCV bar, with optional per-candle overlay line(s)/tooltip(s) — e.g. marking a buy/sell signal |
| `<ma>` | `period` (or `size`), `color`, `type` (`sma`\|`exponential`, default `sma`) | A moving-average overlay line |
| `<series>` | `values="n n n"`, `color`, `dash`, `width`, `label`, `anchor` (`after-last` default, or `at:INDEX`), `extend` | A domain-agnostic overlay polyline (predictions, targets, comparison lines) drawn over/after the candles, display-only (excluded from indicator math) |
| `<volume>` | *(no attributes — presence alone enables the volume sub-panel)* | Volume bars panel |
| `<macd>` | nested `<fast period color>` `<slow period>` `<signal period color>` (defaults 12/26/9) | MACD sub-panel |
| `<rsi>` | `period` (default 14); nested `<line color>` `<overbought level color>` `<oversold level color>` (defaults 70/30) | RSI sub-panel |
| `<obv>` | nested `<line color>` | On-Balance-Volume sub-panel |
| `<rect>` | `x`/`y`/`width`/`height` or `start-x`/`start-y`/`end-x`/`end-y`, or `date-start`+`date-end` (auto y-range); `fill`, `stroke`, `stroke-width`, `dash` (aliases: `fill-style`/`stroke-style`/`stroke-dasharray`), `target` (`candle`\|`volume`\|`all`), `margin-top`, `margin-bottom`, `label`, `color` | Pixel- or date-anchored rectangle overlay |
| `<arc>` | `x`,`y`,`r` (aliases `radius`), `start`/`start-angle`, `end`/`end-angle`, `fill`, `stroke`, `stroke-width` | Pixel-space arc overlay |

Public API:

```typescript
setData(points: StockChartPoint[]): void;                 // push data from JS instead of <candle> children
setView(start: number, end: number): void;                // programmatic zoom/focus (candle indices, inclusive)
resetView(): void;                                         // show full range
getCandleInfo(key: string | number): CandleInfo | null;    // by date string or index — OHLCV + all active indicator values at that candle
getCandleInfos(keys?: (string | number)[]): CandleInfo[];
getCandleInfoByName(name: string): CandleInfo | null;      // by <candle name="..."> (falls back to date)
getCandleInfoByNames(names?: string[]): CandleInfo[];
```

Also dispatches a `view-edge` `CustomEvent` (`detail: { edge: 'start' | 'end' }`) the first time the visible window reaches either end of the data — useful for triggering lazy-loading of more history.

```html
<stock-chart enabled-control enabled-readout show-min-max style="height:360px">
  <candle date="2024-01-01" open="100" high="105" low="98" close="103" volume="12345"></candle>
  <candle date="2024-01-02" open="103" high="108" low="101" close="106" volume="15230"></candle>
  <ma period="20" color="#6366f1"></ma>
  <volume></volume>
  <rsi period="14"></rsi>
</stock-chart>
```

### `<stock-radar>` (RadarChart)

A radar/spider chart: N axes around a circle (0–100% grid rings), with one or more overlaid score polygons.

Child elements:

| Tag | Attributes |
|---|---|
| `<axis>` | `id` (or `axis`; falls back to `ax0`, `ax1`, ...), `label` (supports `\n` for multi-line), `color` |
| `<score-set>` | `fill-style`, `stroke-style`, `stroke-width` (default `1`); nested `<score axis="AXIS_ID" value="0-100">` per axis (missing axes default to `50`) |

```html
<stock-radar style="height:320px">
  <axis id="speed" label="Speed" color="#6366f1"></axis>
  <axis id="power" label="Power" color="#ef4444"></axis>
  <axis id="control" label="Control" color="#10b981"></axis>
  <score-set fill-style="rgba(99,102,241,0.25)" stroke-style="#6366f1" stroke-width="2">
    <score axis="speed" value="80"></score>
    <score axis="power" value="55"></score>
    <score axis="control" value="70"></score>
  </score-set>
</stock-radar>
```

### `<bubble-chart>` (BubbleChart)

An x/y scatter chart where each point is a circle whose **radius encodes a 0–100 value** (independent of zoom level), with click/tap selection (opens a description tooltip), optional straight-line overlays, wheel zoom, and drag-pan/pinch-zoom (opt-in via `enabled-zoom`).

Host attributes: `x-label`, `y-label`, `show-center-cross` (draw a small crosshair through every bubble's center), `enabled-zoom` (enables wheel/drag/pinch — without it the chart is static/click-only).

Public method: `setData(points: BubbleChartPoint[])`; also `reset()` (pan/zoom + selection reset).

Child elements:

| Tag | Attributes |
|---|---|
| `<bubble>` | `label`, `x`, `y`, `value` (or `r`; 0–100, clamped), `description` (`\n`-separated lines shown in the selection tooltip), `show-center-cross`, `fill-style` (or `fillStyle`), `stroke-style`/`stroke`/`strokeStyle`, `line-width`/`lineWidth`, `label-color`/`labelColor` |
| `<line>` | `start-x`, `start-y`, `end-x`, `end-y` (all required); `line-dash`/`line-style`, `line-width`/`stroke-width`/`strokeWidth` (default `1.5`), `strokeStyle`/`stroke`/`color` (default `#94a3b8`) |

Clicking/tapping a bubble dispatches a `bubble-select` `CustomEvent` with `detail` set to the selected `BubbleChartPoint` (or `null` on deselect).

```html
<bubble-chart x-label="Market cap" y-label="Change %" enabled-zoom style="height:340px">
  <bubble label="AAA" x="1200" y="0.032" value="80" description="Sector: Tech"></bubble>
  <bubble label="BBB" x="800" y="-0.015" value="45"></bubble>
</bubble-chart>
```

### `<range-slider>` (RangeSlider)

A form-associated (`formAssociated = true`) slider supporting three shapes:

1. **Legacy single/range** (no `<thumb>` children) — one or two draggable handles, like a native `<input type="range">` (single) or a min/max range slider.
2. **Declarative multi-thumb** — one or more `<thumb name="...">` children, each independently draggable, with **cross-referencing bounds**: a thumb's `min`/`max` can be either a number or another thumb's `name`, so thumbs can be constrained relative to each other (resolved and clamped in document order, converging over repeated passes so reference cycles are also handled safely).
3. **Grouped multi-thumb** — wrap `<thumb>` elements in a `<thumb-group label="..." color="...">`; the group renders an extra draggable "bracket" bar spanning its members' min↔max, dragging the bracket rigidly translates the whole group (staying within its own combined bounds).

Host attributes: `min`, `max`, `step`, `mode` (`single` | `range`, default `range`), `orientation` (`horizontal` | `vertical`), `min-value`, `max-value`, `value` (single mode: absolute value; range mode: `max - min` difference, matching this element's own `.value` getter).

Thumb child attributes (multi mode): `name` (required), `value`, `min`, `max` (number or another thumb's `name`), `step`, `color`, `size` (10–48px), `fill`.

Public API / properties: `min`/`max`/`step`/`mode`/`orientation` (get/set, reflected to attributes), `minValue`/`maxValue`/`avgValue` (get), `value` (legacy: numeric string; multi-thumb: `{[thumbName]: number}` object), `setValues(values)` (bulk-set thumb values without firing events).

Emits `input` (while dragging) and `change` (on release/commit) `CustomEvent`s; `detail` is `{ values, minValue, maxValue, avgValue, changed, mode: 'multi' }` in thumb mode, or `{ minValue, maxValue, value, mode }` in legacy mode.

```html
<!-- legacy range -->
<range-slider min="0" max="100" min-value="20" max-value="80"></range-slider>

<!-- declarative multi-thumb with cross-referenced bounds -->
<range-slider min="0" max="10" step="0.1">
  <thumb name="p1" value="2" min="0" max="p2" color="#ef4444"></thumb>
  <thumb name="p2" value="6" min="p1" max="10" color="#3b82f6"></thumb>
</range-slider>
```

---

## Related Packages

- [`@dooboostore/core`](https://www.npmjs.com/package/@dooboostore/core) — dependency-free reactive/utility foundation.
- [`@dooboostore/core-web`](https://www.npmjs.com/package/@dooboostore/core-web) — browser DOM/event utilities.
- [`@dooboostore/algorithm`](https://www.npmjs.com/package/@dooboostore/algorithm) — trading/indicator math (`computeSmaSeries`, `computeEmaSeries`, `computeMacdSeries`, `computeRsiSeries`, `computeObvSeries`) consumed by `<stock-chart>`.
- [`@dooboostore/simple-web-component`](https://www.npmjs.com/package/@dooboostore/simple-web-component) — the Custom Element / decorator framework every component here is built on.

## License

This package is licensed under the [MIT License](https://opensource.org/licenses/MIT).
