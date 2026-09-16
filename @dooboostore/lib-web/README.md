# @dooboostore/lib-web

[![NPM version](https://img.shields.io/npm/v/@dooboostore/lib-web.svg?color=cb3837&style=flat-square)](https://www.npmjs.com/package/@dooboostore/lib-web)
[![Build and Test](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml/badge.svg?branch=main)](https://github.com/dooboostore-develop/packages/actions/workflows/main.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)


Canvas-centered UI components for building rich browser editors, map-like visual tools, and candlestick/technical-indicator stock charts.

---

## Features

- **ImageEditorCanvas**: multi-layer canvas editor — image/text/shape layers (rect, circle, triangle, star, heart, speech bubble, pentagon, octagon, semicircle, cross), drag/resize/rotate/flip, z-ordering, crop & erase modes, undo/redo, and final-image export.
- **GpsMarkerCanvas**: GPS point/path visualization canvas with pan, zoom, optional Mercator projection, and image or color markers.
- **ImageCropCanvas**: polygon (freeform, not just rectangular) crop workflow for trimming an image.
- **TradeChart**: candlestick chart engine with volume/OBV/VOSC/RSI/MACD panels, moving averages, Bollinger bands, golden/dead-cross and buy/sell markers, percentage lines, zoom/pan, and an RxJS-like `observable` event stream (from `@dooboostore/core`).
- **OverlayStockChart**: multi-ticker overlay line chart (several tickers on one canvas) with normalization modes, multiple line-smoothing styles, and point/range event markers.
- **Root-first exports**: consume all public APIs from package root.
- **Bundle entry support**: dedicated `./bundle-entry` subpath for bundlers or UMD/ESM interop workflows.

## Public API

`@dooboostore/lib-web` root currently exposes:

- `ImageEditorCanvas`
- `GpsMarkerCanvas`
- `ImageCropCanvas`
- `TradeChart`
- `OverlayStockChart`

(plus their associated types, e.g. `CropCanvasConfig`, `GpsMarkerCanvasConfig`, `ImageCropCanvasConfig`, `ChartConfig`, `ChartDataPoint`, `TickerData`, `EventMarker`, etc. — see each component's section below.)

## Import Guide

### Root import (recommended)

```typescript
import { ImageEditorCanvas, GpsMarkerCanvas, ImageCropCanvas, TradeChart, OverlayStockChart } from '@dooboostore/lib-web';
```

### Bundle entry import

```typescript
import { ImageEditorCanvas } from '@dooboostore/lib-web/bundle-entry';
```

### Namespace access from bundle entry

```typescript
import { LibWebModule } from '@dooboostore/lib-web/bundle-entry';

const editor = new LibWebModule.ImageEditorCanvas(/* ... */);
```

## Installation

```bash
# pnpm
pnpm add @dooboostore/lib-web

# npm
npm install @dooboostore/lib-web

# yarn
yarn add @dooboostore/lib-web
```

## Quick Start

### Image editor

`ImageEditorCanvas` takes the owning `Window` as its first argument and a config with a `canvas` (an `HTMLCanvasElement`, or a CSS selector string resolved via `config.canvas`) as the second. It sizes itself from the canvas element's own `clientWidth`/`clientHeight` — there's no separate `width`/`height` option.

```typescript
import { ImageEditorCanvas } from '@dooboostore/lib-web';

const editor = new ImageEditorCanvas(window, {
    canvas: '#app', // or an HTMLCanvasElement
    onSelectionChange: (layer) => console.log('selected:', layer),
    onCuttingModeChange: (isActive, targetLayer) => console.log('crop/erase mode:', isActive, targetLayer),
    onHistoryChange: (canUndo, canRedo) => console.log('history:', canUndo, canRedo),
});

// Add layers
await editor.addImage(someBlobOrImageBitmap);
await editor.addText('Hello', { font: 'sans-serif', size: 48, fillColor: '#000' });
await editor.addRect({ fillColor: '#fff', strokeColor: '#000', strokeWidth: 2 });
// ...also: addCircle / addTriangle / addStar / addHeart / addSpeechBubble / addPentagon / addOctagon / addSemicircle / addCross

// Manipulate the currently-selected layer
editor.bringSelectedLayerToFront();
editor.sendSelectedLayerToBack();
editor.enterEraseMode();       // crop-out part of the selected layer
await editor.updateSelectedText('New text');

// History
editor.undo();
editor.redo();

// Resize the underlying canvas
editor.resize(1024, 768);

// Export the composited result
const dataUrl = await editor.exportFinalImage();
```

Layers can also be added via `editor.run({ img, handle, cropStroke })` since `ImageEditorCanvas` implements `Runnable<void, CropCanvasRunParameter>` from `@dooboostore/core`.

### GPS marker map

`GpsMarkerCanvas` takes an existing `HTMLCanvasElement` and tracks its size with an internal `ResizeObserver` — give the canvas a size via CSS, not constructor options.

```typescript
import { GpsMarkerCanvas } from '@dooboostore/lib-web';

const canvas = document.getElementById('map') as HTMLCanvasElement;
const map = new GpsMarkerCanvas({
    canvas,
    useMercatorProjection: true, // false = simple equirectangular (lon,lat) projection
    markerColor: 'red',
    markerSize: 32,
});

map.setPaths([{ points: [{ lat: 37.5, lon: 127.0 }, { lat: 37.6, lon: 127.1 }], color: '#2196F3', closePath: false }]);
map.setMarkers([{ lat: 37.5, lon: 127.0, label: 'Start', marker: { type: 'color', color: '#4CAF50' } }]);

map.zoomIn();
map.zoomOut();
map.resetViewAndFitData(); // reset pan/zoom and refit to current data
map.destroy();             // remove listeners + disconnect the ResizeObserver
```

### Image crop (polygon)

`ImageCropCanvas` also takes an existing `HTMLCanvasElement`. The user clicks to add polygon points on the loaded image (at least 3), drags them to adjust, and taps a point's × handle to remove it.

```typescript
import { ImageCropCanvas } from '@dooboostore/lib-web';

const cropper = new ImageCropCanvas({
    canvas: document.getElementById('crop') as HTMLCanvasElement,
    onDone: (result) => {
      // result: { points: {x,y}[], dataUrl: string | null } — image-relative polygon points + cropped PNG data URL
      console.log(result.dataUrl);
    },
});

cropper.loadImage('/path/to/image.png');
// ...user clicks/drags to build a polygon on the canvas...
cropper.done();   // fires onDone with the cropped result
cropper.cancel();  // clear the in-progress polygon
cropper.destroy();
```

### Candlestick chart (TradeChart)

```typescript
import { TradeChart } from '@dooboostore/lib-web';

const data = TradeChart.createData(ohlcvInputs, { transactions, maPeriods: [5, 20, 60] });

const chart = new TradeChart({
  canvas: document.getElementById('chart') as HTMLCanvasElement,
  initialConfig: {
    show: { volume: true, rsi: true, macd: true, movingAverages: true, goldenCross: true, deadCross: true },
    enableZoom: true,
  },
});
chart.setConfig({ show: { bollingerBands: true } });     // merge in more config later, chainable (returns `this`)
chart.observable.subscribe(evt => console.log(evt));      // zoom/pan/click events (@dooboostore/core Observable)
chart.resize();
chart.destroy();
```

`TradeChart.createData(inputs, config)` turns raw OHLCV rows into the `ChartDataPoint[]` the chart consumes, computing moving averages / OBV / VOSC / RSI / MACD and golden/dead-cross state along the way. Most `show*` toggles (e.g. `showVolumePercentageLines`, `showPriceBollingerBands`, `showBuyMarkers`, ...) are fluent (`this`-returning) shortcuts for the equivalent `setConfig({ show: { ... } })` call.

### Multi-ticker overlay chart (OverlayStockChart)

```typescript
import { OverlayStockChart } from '@dooboostore/lib-web';

const dataMap = new Map([
  ['AAPL', { data: { datas: aaplChartData, events: [] }, color: '#2196F3' }],
  ['MSFT', { data: { datas: msftChartData }, lineMode: 'line-smooth' }],
]);

const overlay = new OverlayStockChart(
  document.getElementById('overlay') as HTMLCanvasElement,
  dataMap,
  { initialState: { showCandles: false, showGrid: true, showAverage: [] } }
);
```

`OverlayStockChart` draws several tickers' series on one canvas for comparison, normalizing their scales (`'none' | 'rangeNormalize' | 'normalize'`) and supporting several line-drawing styles (`'line' | 'line-smooth' | 'line-smooth-open/high/low/middle' | 'step-to' | 'step-from' | 'step-center'`) plus point/range event markers (`XPointEvent`/`YPointEvent`/`XYPointEvent`/`XRangeEvent`/`YRangeEvent`/`XYRangeEvent`, distinguished via the exported `isXPointEvent`/`isRangeEvent`/etc. type guards).

## Best Practices

- Keep canvas dimensions explicit for stable rendering quality — size via CSS/attributes on the `<canvas>` element itself; `GpsMarkerCanvas`/`ImageCropCanvas` track size automatically via `ResizeObserver`, while `ImageEditorCanvas` reads `clientWidth`/`clientHeight` once at construction (call `resize()` after layout changes).
- Debounce high-frequency pointer events in host application state updates.
- Export from finalized state (`exportFinalImage()`) rather than per-frame snapshots.
- Call `destroy()` on `GpsMarkerCanvas`/`ImageCropCanvas` when done to disconnect their `ResizeObserver` and event listeners.
- Use root import paths (`@dooboostore/lib-web`) as default; keep deep imports internal.

## Troubleshooting

**Issue:** Blurry canvas output on high-DPI displays  
**Solution:** `GpsMarkerCanvas` already scales by `window.devicePixelRatio` internally; for `ImageEditorCanvas`/`ImageCropCanvas`, align canvas internal size with device pixel ratio yourself if you need the same treatment.

**Issue:** Slow interaction with many objects  
**Solution:** reduce redraw region, batch operations, and disable expensive effects while dragging.

**Issue:** Import path errors in consumers  
**Solution:** use root path or `@dooboostore/lib-web/bundle-entry`, not internal source paths.

## Learn More

The detailed API documentation for each component is available on our documentation website.

## Related Packages

- [@dooboostore/core](https://www.npmjs.com/package/@dooboostore/core)
- [@dooboostore/core-web](https://www.npmjs.com/package/@dooboostore/core-web)
- [@dooboostore/dom-render](https://www.npmjs.com/package/@dooboostore/dom-render)

## License

This package is licensed under the [MIT License](https://opensource.org/licenses/MIT).
