
## How to read this

Four custom elements implement the same table (apps/common.ts) and are driven through the same API in real Chrome. A correctness guard checks the DOM row count after every operation; a result only counts if every implementation produced the same rows. Re-run with `pnpm bench`.

### Honest summary

simple-web-component renders by turning state into an HTML string and replacing the target's children (the documented `@replaceChildren*` path). That has one consequence that dominates this benchmark: **every change costs about as much as a full re-render (~25 ms for 1,000 rows)**, whether you change one row or all of them.

| operation | simple-web-component | lit | vanilla (innerHTML) | vs lit |
|---|---:|---:|---:|---:|
| create 1,000 rows | 24.9 ms | 20.3 ms | 20.3 ms | 1.2x slower |
| create 10,000 rows | 244 ms | 232 ms | 222 ms | on par (1.05x) |
| update every 10th row | 25.3 ms | 4.9 ms | 23.5 ms | 5.2x slower |
| select a row | 25.2 ms | 0.1 ms | 22.9 ms | ~250x slower |
| swap two rows | 25.3 ms | 0.9 ms | 21.5 ms | 28x slower |
| remove a row | 24.7 ms | 5.5 ms | 22.0 ms | 4.5x slower |
| append 1,000 to 1,000 | 49.2 ms | 23.2 ms | 40.4 ms | 2.1x slower |

- **Against its own strategy it is cheap.** simple-web-component is within ~5% to 25% of a hand-written `innerHTML` loop. The library adds little; the cost comes from re-rendering everything.
- **Bulk creation is fine** (on par with Lit at 10,000 rows). Small, frequent updates to large lists are where it loses clearly.
- **Bundle size is the largest by far**: 208 KB minified / 60.6 KB gzip, about 12x Lit (16.7 / 6.4 KB). This bundle includes the dependency-injection runtime and core utilities, not only the rendering code; nothing was tree-shaken beyond what esbuild does automatically.
- **Startup**: about 21 ms to component ready versus ~9 ms for the others.
- **Memory is a strength**: 94 KB of JS heap for 1,000 rows versus 558 KB for Lit (6x less), close to hand-written `innerHTML` (73 KB). Lit keeps template part objects alive per row; a string renderer keeps only the data.

### What this does not measure

- **The fine-grained paths are not exercised.** The README also offers `@state` with `<!--[text ...]-->` directives and position-based `applyNode` decorators (`@insertBeforeEnd` and similar) that touch only part of the DOM. A list written that way (for example appending only the new rows) should avoid most of the re-render cost above; it was not measured here, so this file shows the simplest documented path, not the best case.
- Lit is used with its default `map()`, without keyed `repeat()`.
- Operations are called through the component API, not by dispatching clicks, so event-handling cost is excluded for every implementation.

### Methodology and caveats

- Time per operation is script + style + layout: a forced layout ends each sample. Paint and raster are not included, and requestAnimationFrame is not awaited because it would quantise every result to ~16 ms.
- Median of 15 samples, a garbage collection before each sample, 12 untimed warm-up runs per implementation; each implementation runs in a fresh browser context.
- Single machine, headless Chrome. Differences below a few milliseconds (the 0.1 ms to 1 ms cases) are near the timer resolution and should not be over-read.
- `declare`-style fields are used in the Lit element so TypeScript class fields do not shadow Lit's reactive accessors, and the benchmark API methods have unique names because names such as `update()` or `remove()` would collide with Lit/DOM methods. Both were found because the correctness guard caught Lit rendering zero rows.
