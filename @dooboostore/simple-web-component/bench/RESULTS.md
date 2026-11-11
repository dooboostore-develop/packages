# simple-web-component benchmark

- Chrome (channel chrome, headless), Node v24.21.0, Intel(R) Core(TM) Ultra 9 275HX, 24 cores, linux x64
- Versions: simple-web-component 1.0.55, lit 3.3.3
- 2026-11-11 · median of 15 samples per operation, GC before every sample · time = script + style + layout (paint not included)

## Operation time (ms, lower is better; best in **bold**)

| operation | vanilla (DOM calls) | vanilla (innerHTML) | lit | simple-web-component |
|---|---|---|---|---|
| create 1,000 rows | ████████▉ 22.2 | ████████▏ 20.3 | ████████▏ **20.3** | ██████████ 24.9 |
| replace 1,000 rows | ██████████ 27.5 | █████████ 24.6 | ███▉ **10.6** | █████████▍ 25.7 |
| update every 10th row | ██▏ 5.30 | █████████▎ 23.5 | █▉ **4.90** | ██████████ 25.3 |
| select a row | ▏ **0.10** | █████████▏ 22.9 | ▏ 0.10 | ██████████ 25.2 |
| swap two rows | ▌ 1.30 | ████████▌ 21.5 | ▍ **0.90** | ██████████ 25.3 |
| remove a row | ▍ **1.00** | ████████▉ 22.0 | ██▎ 5.50 | ██████████ 24.7 |
| append 1,000 to 1,000 | █████▋ 27.7 | ████████▎ 40.4 | ████▊ **23.2** | ██████████ 49.2 |
| create 10,000 rows | ██████████ 269 | ████████▎ **222** | ████████▋ 232 | █████████▏ 244 |
| clear 1,000 rows | ███████▋ 1.60 | ███████▏ **1.50** | ██████████ 2.10 | ███████▋ 1.60 |

## Size, startup and memory (lower is better)

| | vanilla (DOM calls) | vanilla (innerHTML) | lit | simple-web-component |
|---|---|---|---|---|
| bundle, minified (KB) | ▏ 1.94 | ▏ 1.60 | ▊ 16.7 | ██████████ 208 |
| bundle, minified + gzip (KB) | ▏ 0.96 | ▏ 0.86 | █ 6.39 | ██████████ 60.6 |
| navigation to component ready (ms, median of 5) | ████▏ 8.60 | ████ 8.40 | ████▍ 9.10 | ██████████ 20.7 |
| JS heap, 1,000 rows (KB) | ██▏ 119 | █▍ 73.4 | ██████████ 558 | █▋ 93.5 |
| JS heap, 10,000 rows (KB) | ██▏ 1,020 | █▍ 685 | ██████████ 4,907 | ███▎ 1,569 |


## Charts

Bar length is proportional to the value. Sorted best first; `▲` marks the best of the row.

### Operation time

```text
create 1,000 rows  (lower is better)
  vanilla (innerHTML)   ██████████████████████████        20.3  ▲
  lit                   ██████████████████████████        20.3
  vanilla (DOM calls)   █████████████████████████████     22.2
  simple-web-component  ████████████████████████████████  24.9

replace 1,000 rows  (lower is better)
  lit                   ████████████                      10.6  ▲
  vanilla (innerHTML)   █████████████████████████████     24.6
  simple-web-component  ██████████████████████████████    25.7
  vanilla (DOM calls)   ████████████████████████████████  27.5

update every 10th row  (lower is better)
  lit                   ██████                            4.90  ▲
  vanilla (DOM calls)   ███████                           5.30
  vanilla (innerHTML)   ██████████████████████████████    23.5
  simple-web-component  ████████████████████████████████  25.3

select a row  (lower is better)
  vanilla (DOM calls)   █                                 0.10  ▲
  lit                   █                                 0.10
  vanilla (innerHTML)   █████████████████████████████     22.9
  simple-web-component  ████████████████████████████████  25.2

swap two rows  (lower is better)
  lit                   █                                 0.90  ▲
  vanilla (DOM calls)   ██                                1.30
  vanilla (innerHTML)   ███████████████████████████       21.5
  simple-web-component  ████████████████████████████████  25.3

remove a row  (lower is better)
  vanilla (DOM calls)   █                                 1.00  ▲
  lit                   ███████                           5.50
  vanilla (innerHTML)   █████████████████████████████     22.0
  simple-web-component  ████████████████████████████████  24.7

append 1,000 to 1,000  (lower is better)
  lit                   ███████████████                   23.2  ▲
  vanilla (DOM calls)   ██████████████████                27.7
  vanilla (innerHTML)   ██████████████████████████        40.4
  simple-web-component  ████████████████████████████████  49.2

create 10,000 rows  (lower is better)
  vanilla (innerHTML)   ██████████████████████████        222  ▲
  lit                   ████████████████████████████      232
  simple-web-component  █████████████████████████████     244
  vanilla (DOM calls)   ████████████████████████████████  269
```

### Size, startup and memory

```text
bundle, minified (KB)  (lower is better)
  vanilla (innerHTML)   █                                 1.60  ▲
  vanilla (DOM calls)   █                                 1.94
  lit                   ███                               16.7
  simple-web-component  ████████████████████████████████  208

bundle, minified + gzip (KB)  (lower is better)
  vanilla (innerHTML)   █                                 0.86  ▲
  vanilla (DOM calls)   █                                 0.96
  lit                   ███                               6.39
  simple-web-component  ████████████████████████████████  60.6

navigation to component ready (ms, median of 5)  (lower is better)
  vanilla (innerHTML)   █████████████                     8.40  ▲
  vanilla (DOM calls)   █████████████                     8.60
  lit                   ██████████████                    9.10
  simple-web-component  ████████████████████████████████  20.7

JS heap, 1,000 rows (KB)  (lower is better)
  vanilla (innerHTML)   ████                              73.4  ▲
  simple-web-component  █████                             93.5
  vanilla (DOM calls)   ███████                           119
  lit                   ████████████████████████████████  558

JS heap, 10,000 rows (KB)  (lower is better)
  vanilla (innerHTML)   ████                              685  ▲
  vanilla (DOM calls)   ███████                           1,020
  simple-web-component  ██████████                        1,569
  lit                   ████████████████████████████████  4,907
```

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
