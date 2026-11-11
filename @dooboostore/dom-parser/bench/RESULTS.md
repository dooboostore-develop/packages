# dom-parser benchmark

- Node v24.21.0, Intel(R) Core(TM) Ultra 9 275HX, 24 cores, linux x64
- Versions: dom-parser 1.0.29, jsdom 27.4.0, happy-dom 20.14.6, linkedom 0.18.12, cheerio 1.2.0
- 2026-11-11 · 1000 ms per case · fixtures are synthetic (see `fixtures.mjs`)

## Throughput (ops/sec, higher is better; best in **bold**)

| scenario | dom-parser | jsdom | happy-dom | linkedom | cheerio |
|---|---:|---:|---:|---:|---:|
| parse small (1 KB) | 11,143 | 376 | 988 | 9,835 | **21,762** |
| parse medium (147 KB) | 60.9 | 13.4 | 16.0 | 67.6 | **191** |
| parse large (2993 KB) | **2.62** | 0.63 | 0.67 | 1.53 | 2.03 |
| query `section` (medium) | 2,196 | 1,398 | 1,075 | **3,179** | 1,377 |
| query `.item` (medium) | **2,007** | 1,067 | 264 | 993 | 937 |
| query `section.s3 > ul li.item` (medium) | 989 | 513 | 917 | **1,390** | 1,114 |
| query `#sec-120 .cell` (medium) | **1,835** | 865 | 878 | 1,258 | 1,158 |
| query `a[href^="/p/1"]` (medium) | 2,059 | 260 | 1,190 | **3,110** | 1,468 |
| query `tr > td:nth-child(2)` (medium) | 1,230 | 219 | 1,008 | **2,298** | 1,360 |
| mutate: create+append 2000 nodes | **639** | 45.3 | 29.8 | 181 | 208 |
| innerHTML set 1000 <li> | 743 | 66.5 | 181 | 10.7 | **1,707** |
| serialize outerHTML (medium) | 305 | 512 | 464 | 428 | **940** |

## Cold start, memory, size

| | dom-parser | jsdom | happy-dom | linkedom | cheerio |
|---|---:|---:|---:|---:|---:|
| import + first parse (ms, median of 7) | 48.2 | 227 | 127 | 43.3 | 78.0 |
| heap per parsed ~100 KB doc (KB) | 5,026 | 21,947 | 48,979 | 6,963 | 5,719 |
| install size on disk (MB, incl. own files only) | 6.3 | 3.2 | 8.7 | 0.9 | 1.0 |

## Notes

- cheerio is a jQuery-style API, not a DOM implementation; it is the "fast HTML parser" reference, not a like-for-like.
- jsdom additionally implements scripting/layout-adjacent behaviour that the others skip, so parse cost differs by scope, not only by quality.
- Install size counts the package directory only, not its dependencies.
- Throughput says nothing about correctness; see the compat tests.

## How to read this

Every number above comes from the same script on the same machine in the same run, so the ratios between columns are meaningful even though the absolute numbers are not portable. Re-run it yourself with `pnpm bench`; results land in this file.

### Where dom-parser is strongest

| Area | dom-parser vs jsdom | vs happy-dom | vs linkedom | vs cheerio |
|---|---:|---:|---:|---:|
| Parse small page (1 KB) | 30x faster | 11x | 1.1x | 0.5x |
| Parse medium page (147 KB) | 4.5x | 3.8x | 0.9x | 0.3x |
| Parse large page (3 MB) | 4.2x | 3.9x | 1.7x | 1.3x |
| Create + append 2000 nodes | 14x | 21x | 3.5x | 3.1x |
| Query `.item` | 1.9x | 7.6x | 2.0x | 2.1x |
| Heap per parsed ~100 KB doc | 4.4x less | 9.7x less | 1.4x less | 1.1x less |
| Import + first parse | 4.7x faster | 2.6x faster | 0.9x | 1.6x faster |

- **DOM mutation** is the clearest win: building and attaching nodes is 3x to 21x faster than every other implementation tested.
- **Memory**: a parsed ~100 KB document retains about 5 MB of heap, against 22 MB (jsdom) and 49 MB (happy-dom). That matters for SSR servers holding many documents at once.
- **Cold start**: about 48 ms from `import` to first parsed page, versus 227 ms for jsdom. That matters for serverless and short-lived processes.
- **Large documents**: on a 3 MB page it is the fastest of the five.

### Where it is not the fastest (honest list)

- **Small and medium page parsing**: cheerio parses 2x to 3x faster (it builds a lighter, non-DOM tree) and linkedom is slightly ahead on medium pages.
- **Some selectors**: linkedom is faster on `section`, `a[href^=...]`, `section.s3 > ul li.item` and `tr > td:nth-child(2)` (up to ~1.9x).
- **`innerHTML` assignment**: cheerio is ~2.3x faster; dom-parser is still ahead of jsdom, happy-dom and linkedom.
- **Serialization (`outerHTML`)**: slowest of the five (305 ops/s vs 428 to 940). This is the obvious optimisation target.
- **Install size**: 6.3 MB on disk because the package ships `src` and `dist` (linkedom is 0.9 MB, cheerio 1.0 MB, jsdom 3.2 MB excluding its dependency tree). Package-only numbers understate jsdom's real footprint.

### Methodology and caveats

- **Fixtures** are synthetic and deterministic (sections with lists, tables, forms, entities). Real pages differ; drop `.html` files into `bench/fixtures/` and they are picked up automatically.
- **Selector cache busting**: happy-dom caches repeated `querySelectorAll` results per document and reported millions of ops/s on a static DOM. Before every query the benchmark sets an attribute on `<body>` for all libraries so each query does real work. A cache-friendly workload (many identical queries on an unchanged DOM) would favour happy-dom more than shown here.
- **Cleanup**: jsdom and happy-dom windows are closed after each parse iteration; without it the multi-MB case runs out of memory. On large inputs a GC runs between iterations (untimed).
- **Cold start** is the median of 7 fresh processes; **memory** is the heap growth after retaining 20 parsed documents, measured after forced GC in a fresh process.
- **Sanity check**: for the query, mutate and innerHTML cases the script compares the result across libraries and lists any disagreement under a warning heading. None appeared in this run.
- **Scope differs**: jsdom also implements scripting, resource loading and more of the platform; cheerio is not a DOM at all. Speed alone is not a quality comparison; correctness is covered separately by the Chromium-parity tests in `test/`.
- Single machine, single run, 1 s per case: expect a few percent of noise, and tens of percent on the mutation cases (see the `±` figures in the console output).
