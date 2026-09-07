import {
  changedAttribute,
  elementDefine,
  eventShadow,
  mutationObserverLight,
  onConnectedAfter,
  onConnectedBodyShadow,
  queryShadow,
  resizeObserverLight,
} from '@dooboostore/simple-web-component';

const tagName = 'cartesian-chart';

/** child <series> — 점열 폴리라인 */
export interface CartesianSeries {
  points: { x: number; y: number }[];
  color?: string;
  width?: number;
  dash?: string;
  label?: string;
  labelColor?: string;
}

/** child <polygon> — 닫힌 다각형 (면적 표시용) */
export interface CartesianPolygon {
  points: { x: number; y: number }[];
  color?: string;
  width?: number;
  dash?: string;
  fill?: string;
  label?: string;
  labelColor?: string;
}

/** child <vector> — 화살표 */
export interface CartesianVector {
  x1: number; y1: number; x2: number; y2: number;
  color?: string;
  width?: number;
  dash?: string;
  label?: string;
  labelColor?: string;
}

/** child <marker> — 점 */
export interface CartesianMarker {
  x: number; y: number;
  color?: string;
  size?: number;
  label?: string;
  labelColor?: string;
}

/** child <circle> — x/y 반지름(ry 미지정 시 화면상 원) */
export interface CartesianCircle {
  x: number; y: number; r: number; ry?: number;
  color?: string;
  width?: number;
  dash?: string;
  fill?: string;
  label?: string;
  labelColor?: string;
}

/** child <arc> — 수학각(rad, y-up) 호, r은 px */
export interface CartesianArc {
  x: number; y: number; r: number;
  startAngle: number; endAngle: number;
  color?: string;
  width?: number;
}

export interface CartesianChartData {
  series?: CartesianSeries[];
  polygons?: CartesianPolygon[];
  vectors?: CartesianVector[];
  markers?: CartesianMarker[];
  circles?: CartesianCircle[];
  arcs?: CartesianArc[];
}

export interface CartesianChart extends HTMLElement {
  setData(data: CartesianChartData): void;
  reset(): void;
}

export interface CartesianChartCtor {
  new (): CartesianChart;
}

function num(v: string | null | undefined, def: number): number {
  if (v == null || v.trim() === '') return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

function str(v: string | null | undefined): string | undefined {
  if (v == null) return undefined;
  const t = v.trim();
  return t === '' ? undefined : t;
}

function fmtNum(v: number): string {
  if (v === 0) return '0';
  const abs = Math.abs(v);
  if (abs >= 100) return v.toFixed(0);
  if (abs >= 1) return String(parseFloat(v.toFixed(2)));
  return String(parseFloat(v.toPrecision(3)));
}

function parseDash(dash?: string): number[] {
  if (!dash) return [];
  return dash.split(/[,\s]+/).map(s => Number(s.trim())).filter(n => Number.isFinite(n) && n > 0);
}

export default (w: Window): CartesianChartCtor => {
  const existing = w.customElements.get(tagName);
  if (existing) return existing as unknown as CartesianChartCtor;

  @elementDefine(tagName, { window: w })
  class CartesianChartImpl extends w.HTMLElement implements CartesianChart {
    private series: CartesianSeries[] = [];
    private polygons: CartesianPolygon[] = [];
    private vectors: CartesianVector[] = [];
    private markers: CartesianMarker[] = [];
    private circles: CartesianCircle[] = [];
    private arcs: CartesianArc[] = [];

    private scaleX = 1;
    private scaleY = 1;
    private offsetX = 0;
    private offsetY = 0;
    private pinchDist0 = 0;
    private pinchScaleX0 = 1;
    private dragging = false;
    private dragLastX = 0;
    private dragLastY = 0;
    private resizeRaf = 0;

    @changedAttribute('x-min') onXMinChanged() { if (this.canvas) this.draw(); }
    @changedAttribute('x-max') onXMaxChanged() { if (this.canvas) this.draw(); }
    @changedAttribute('y-min') onYMinChanged() { if (this.canvas) this.draw(); }
    @changedAttribute('y-max') onYMaxChanged() { if (this.canvas) this.draw(); }
    @changedAttribute('x-label') onXLabelChanged() { if (this.canvas) this.draw(); }
    @changedAttribute('y-label') onYLabelChanged() { if (this.canvas) this.draw(); }
    @changedAttribute('center-x') onCenterXChanged() { if (this.canvas) this.draw(); }
    @changedAttribute('center-y') onCenterYChanged() { if (this.canvas) this.draw(); }

    public setData(data: CartesianChartData): void {
      this.series = data.series || [];
      this.polygons = data.polygons || [];
      this.vectors = data.vectors || [];
      this.markers = data.markers || [];
      this.circles = data.circles || [];
      this.arcs = data.arcs || [];
      this.resetView();
      if (this.isConnected && this.canvas) this.draw();
    }

    public reset(): void {
      this.resetView();
      if (this.canvas) this.draw();
    }

    private resetView() {
      this.scaleX = 1; this.scaleY = 1;
      this.offsetX = 0; this.offsetY = 0;
    }

    // ── 데이터 수집 ──
    private collect(): void {
      const series: CartesianSeries[] = [];
      this.querySelectorAll(':scope > series').forEach(el => {
        const raw = (el.getAttribute('points') || '').trim();
        if (!raw) return;
        const points: { x: number; y: number }[] = [];
        raw.split(/[\s;|]+/).forEach(pair => {
          const [sx, sy] = pair.split(',');
          const x = Number(sx), y = Number(sy);
          if (Number.isFinite(x) && Number.isFinite(y)) points.push({ x, y });
        });
        if (!points.length) return;
        series.push({
          points,
          color: str(el.getAttribute('color')) || '#6366f1',
          width: num(el.getAttribute('width'), 2),
          dash: str(el.getAttribute('dash') || el.getAttribute('line-dash')),
          label: str(el.getAttribute('label')),
          labelColor: str(el.getAttribute('label-color')),
        });
      });
      this.series = series;

      const polygons: CartesianPolygon[] = [];
      this.querySelectorAll(':scope > polygon').forEach(el => {
        const raw = (el.getAttribute('points') || '').trim();
        if (!raw) return;
        const points: { x: number; y: number }[] = [];
        raw.split(/[\s;|]+/).forEach(pair => {
          const [sx, sy] = pair.split(',');
          const x = Number(sx), y = Number(sy);
          if (Number.isFinite(x) && Number.isFinite(y)) points.push({ x, y });
        });
        if (points.length < 3) return;
        polygons.push({
          points,
          color: str(el.getAttribute('color')) || '#6366f1',
          width: num(el.getAttribute('width'), 1.5),
          dash: str(el.getAttribute('dash') || el.getAttribute('line-dash')),
          fill: str(el.getAttribute('fill') || el.getAttribute('fill-style')),
          label: str(el.getAttribute('label')),
          labelColor: str(el.getAttribute('label-color')),
        });
      });
      this.polygons = polygons;

      const vectors: CartesianVector[] = [];
      this.querySelectorAll(':scope > vector').forEach(el => {
        const x1 = Number(el.getAttribute('x1')), y1 = Number(el.getAttribute('y1'));
        const x2 = Number(el.getAttribute('x2')), y2 = Number(el.getAttribute('y2'));
        if (![x1, y1, x2, y2].every(Number.isFinite)) return;
        vectors.push({
          x1, y1, x2, y2,
          color: str(el.getAttribute('color')) || '#6366f1',
          width: num(el.getAttribute('width'), 2),
          dash: str(el.getAttribute('dash') || el.getAttribute('line-dash')),
          label: str(el.getAttribute('label')),
          labelColor: str(el.getAttribute('labelColor') || el.getAttribute('label-color')),
        });
      });
      this.vectors = vectors;

      const markers: CartesianMarker[] = [];
      this.querySelectorAll(':scope > marker').forEach(el => {
        const x = Number(el.getAttribute('x')), y = Number(el.getAttribute('y'));
        if (!Number.isFinite(x) || !Number.isFinite(y)) return;
        markers.push({
          x, y,
          color: str(el.getAttribute('color')) || '#10b981',
          size: num(el.getAttribute('size'), 4),
          label: str(el.getAttribute('label')),
          labelColor: str(el.getAttribute('labelColor') || el.getAttribute('label-color')),
        });
      });
      this.markers = markers;

      const circles: CartesianCircle[] = [];
      this.querySelectorAll(':scope > circle').forEach(el => {
        const x = Number(el.getAttribute('x')), y = Number(el.getAttribute('y')), r = Number(el.getAttribute('r'));
        if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(r) || r <= 0) return;
        const ryRaw = el.getAttribute('ry');
        circles.push({
          x, y, r,
          ry: ryRaw != null && ryRaw.trim() !== '' && Number.isFinite(Number(ryRaw)) ? Number(ryRaw) : undefined,
          color: str(el.getAttribute('color')) || '#6366f1',
          width: num(el.getAttribute('width'), 2),
          dash: str(el.getAttribute('dash') || el.getAttribute('line-dash')),
          fill: str(el.getAttribute('fill') || el.getAttribute('fill-style')),
          label: str(el.getAttribute('label')),
          labelColor: str(el.getAttribute('labelColor') || el.getAttribute('label-color')),
        });
      });
      this.circles = circles;

      const arcs: CartesianArc[] = [];
      this.querySelectorAll(':scope > arc').forEach(el => {
        const x = Number(el.getAttribute('x')), y = Number(el.getAttribute('y')), r = Number(el.getAttribute('r'));
        const s = Number(el.getAttribute('start-angle')), e = Number(el.getAttribute('end-angle'));
        if (![x, y, r, s, e].every(Number.isFinite) || r <= 0) return;
        arcs.push({
          x, y, r, startAngle: s, endAngle: e,
          color: str(el.getAttribute('color')) || '#10b981',
          width: num(el.getAttribute('width'), 1.6),
        });
      });
      this.arcs = arcs;
    }

    @onConnectedAfter
    onConnected() {
      this.collect();
      this.resetView();
      if (this.canvas) this.draw();
    }

    @mutationObserverLight({ childList: true, attributes: true, subtree: true })
    onMutated() {
      this.collect();
      if (this.canvas) this.draw();
    }

    @resizeObserverLight()
    onResize() {
      if (!this.canvas) return;
      if (this.resizeRaf) cancelAnimationFrame(this.resizeRaf);
      this.resizeRaf = requestAnimationFrame(() => {
        this.resizeRaf = 0;
        if (this.canvas) this.draw();
      });
    }

    @onConnectedBodyShadow
    render(): string {
      return `
        <style>
          :host { display:block; position:relative; height:var(--cc-canvas-height, 320px); }
          #cc-canvas {
            display:block; width:100%; height:100%;
            touch-action:pan-y; cursor:crosshair;
            background:#fff;
          }
          :host([disabled-zoom]) #cc-canvas { cursor:default; }
          #cc-reset {
            position:absolute; top:6px; right:6px; z-index:2;
            width:26px; height:26px; border-radius:6px;
            border:1px solid #e2e8f0; background:rgba(255,255,255,0.92);
            color:#64748b; font-size:13px; cursor:pointer; line-height:1; padding:0;
          }
          #cc-reset:hover { background:#f1f5f9; }
        </style>
        <canvas id="cc-canvas"></canvas>
        <button id="cc-reset" title="보기 초기화">⟲</button>
      `;
    }

    @queryShadow('#cc-canvas')
    private canvas!: HTMLCanvasElement;

    // ── 범위 ──
    private getBaseBounds() {
      // 미지정·빈값·"auto"·비숫자는 해당 변만 auto (축별 독립)
      const explicit = (name: string): number | null => {
        const v = this.getAttribute(name);
        if (v == null || v.trim() === '' || v.trim().toLowerCase() === 'auto') return null;
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
      };
      const exL = explicit('x-min'), exR = explicit('x-max');
      const eyB = explicit('y-min'), eyT = explicit('y-max');
      const xs: number[] = [], ys: number[] = [];
      this.series.forEach(s => s.points.forEach(p => { xs.push(p.x); ys.push(p.y); }));
      this.polygons.forEach(s => s.points.forEach(p => { xs.push(p.x); ys.push(p.y); }));
      this.vectors.forEach(v => { xs.push(v.x1, v.x2); ys.push(v.y1, v.y2); });
      this.markers.forEach(m => { xs.push(m.x); ys.push(m.y); });
      this.circles.forEach(c => { xs.push(c.x - c.r, c.x + c.r); ys.push(c.y - (c.ry ?? c.r), c.y + (c.ry ?? c.r)); });
      this.arcs.forEach(a => { xs.push(a.x); ys.push(a.y); });
      let axL: number, axR: number, ayB: number, ayT: number;
      if (!xs.length) { axL = -6; axR = 6; ayB = -4; ayT = 4; }
      else {
        const minX = Math.min(...xs), maxX = Math.max(...xs);
        const minY = Math.min(...ys), maxY = Math.max(...ys);
        const xPad = (maxX - minX) * 0.18 || Math.abs(maxX) * 0.18 || 1;
        const yPad = (maxY - minY) * 0.18 || Math.abs(maxY) * 0.18 || 1;
        axL = minX - xPad; axR = maxX + xPad; ayB = minY - yPad; ayT = maxY + yPad;
      }
      // center-x/y: auto 변은 중심 기준 내용물 포함하도록 대칭 확장, 명시 변은 유지
      const centerNum = (name: string): number | null => {
        const v = this.getAttribute(name);
        if (v == null || v.trim() === '') return null;
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
      };
      const ccx = centerNum('center-x'), ccy = centerNum('center-y');
      let xL = exL, xR = exR, yB = eyB, yT = eyT;
      if (ccx != null) {
        const half = Math.max(Math.abs(axR - ccx), Math.abs(axL - ccx));
        if (xL == null) xL = ccx - half;
        if (xR == null) xR = ccx + half;
      }
      if (xL == null) xL = axL;
      if (xR == null) xR = axR;
      if (ccy != null) {
        const half = Math.max(Math.abs(ayT - ccy), Math.abs(ayB - ccy));
        if (yB == null) yB = ccy - half;
        if (yT == null) yT = ccy + half;
      }
      if (yB == null) yB = ayB;
      if (yT == null) yT = ayT;
      if (!(xR > xL)) { xL = axL; xR = axR; }
      if (!(yT > yB)) { yB = ayB; yT = ayT; }
      return { xL, xR, yB, yT };
    }

    private getPlotRect() {
      const canvas = this.canvas;
      if (!canvas) return null;
      const cssW = canvas.clientWidth || 400;
      const cssH = canvas.clientHeight || 340;
      const padL = 46, padR = 14, padT = 12, padB = 30;
      const plotW = Math.max(10, cssW - padL - padR);
      const plotH = Math.max(10, cssH - padT - padB);
      return { padL, padR, padT, padB, plotW, plotH, cssW, cssH };
    }

    private isInPlot(clientX: number, clientY: number): boolean {
      const rect = this.canvas?.getBoundingClientRect();
      const pr = this.getPlotRect();
      if (!rect || !pr) return false;
      const x = clientX - rect.left, y = clientY - rect.top;
      return x >= pr.padL && x <= pr.padL + pr.plotW && y >= pr.padT && y <= pr.padT + pr.plotH;
    }

    private zoomAt(factor: number, fracX: number, fracY: number) {
      const b = this.getBaseBounds();
      const xRange0 = b.xR - b.xL, yRange0 = b.yT - b.yB;
      const dampFactor = 1 + (factor - 1) * 0.65;
      const newSX = Math.min(50, Math.max(0.2, this.scaleX * dampFactor));
      const newSY = Math.min(50, Math.max(0.2, this.scaleY * dampFactor));
      this.offsetX += xRange0 * fracX * (1 / this.scaleX - 1 / newSX);
      this.offsetY += yRange0 * fracY * (1 / this.scaleY - 1 / newSY);
      this.scaleX = newSX;
      this.scaleY = newSY;
    }

    private haloText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 3;
      ctx.strokeText(text, x, y);
      ctx.fillText(text, x, y);
      ctx.restore();
    }

    // ── 드로잉 ──
    private draw(): void {
      const canvas = this.canvas;
      if (!canvas) return;
      const dpr = w.devicePixelRatio || 1;
      const pr = this.getPlotRect();
      if (!pr) return;
      const { padL, padR, padT, padB, plotW, plotH, cssW, cssH } = pr;
      if (cssW < 40 || cssH < 40) return; // 레이아웃 미확정(0px 등) 시 스킵 — ResizeObserver가 확정 후 다시 호출
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const b = this.getBaseBounds();
      const xRange = (b.xR - b.xL) / this.scaleX;
      const yRange = (b.yT - b.yB) / this.scaleY;
      let xl = b.xL + this.offsetX;
      let xr = xl + xRange;
      let yb = b.yB + this.offsetY;
      let yt = yb + yRange;

      // 기본 equal-aspect: x/y 한 칸의 픽셀 크기를 동일하게 (벡터 길이·원 왜곡 방지)
      // 축 단위가 다르면 disabled-aspect 지정 (plot에 맞춰 늘이기)
      if (!this.hasAttribute('disabled-aspect')) {
        const xPerPx = (xr - xl) / plotW;
        const yPerPx = (yt - yb) / plotH;
        if (xPerPx > yPerPx) {
          const midY = (yb + yt) / 2;
          const newYRange = xPerPx * plotH;
          yb = midY - newYRange / 2;
          yt = midY + newYRange / 2;
        } else if (yPerPx > xPerPx) {
          const midX = (xl + xr) / 2;
          const newXRange = yPerPx * plotW;
          xl = midX - newXRange / 2;
          xr = midX + newXRange / 2;
        }
      }

      const toX = (v: number) => padL + ((v - xl) / (xr - xl)) * plotW;
      const toY = (v: number) => padT + plotH - ((v - yb) / (yt - yb)) * plotH;
      const xDataPerPx = (xr - xl) / plotW;
      const yDataPerPx = (yt - yb) / plotH;

      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, cssW, cssH);

      // 그리드 + 틱 (가로 + 세로 격자, nice-number 눈금에 격자·수치 일치, hide-grid로 숨김)
      const showGrid = !this.hasAttribute('hide-grid');
      const gridColor = '#e2e8f0';
      const niceStep = (range: number): number => {
        const raw = range / 4;
        const mag = Math.pow(10, Math.floor(Math.log10(raw)));
        const norm = raw / mag;
        return (norm >= 5 ? 5 : norm >= 2 ? 2 : 1) * mag;
      };
      ctx.font = '9px -apple-system,sans-serif';
      const yStep = niceStep(yt - yb);
      const yStart = Math.ceil(yb / yStep) * yStep;
      const yCount = Math.floor((yt - yStart) / yStep);
      for (let k = 0; k <= yCount; k++) {
        const yv = Math.round((yStart + k * yStep) * 1e9) / 1e9;
        const gy = toY(yv);
        if (gy < padT - 4 || gy > cssH - padB + 4) continue;
        if (showGrid) {
          ctx.strokeStyle = gridColor; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(cssW - padR, gy); ctx.stroke();
        }
        ctx.fillStyle = '#94a3b8'; ctx.textAlign = 'right';
        ctx.fillText(fmtNum(yv), padL - 4, gy + 3);
      }
      ctx.fillStyle = '#94a3b8'; ctx.textAlign = 'center';
      const xStep = niceStep(xr - xl);
      const xStart = Math.ceil(xl / xStep) * xStep;
      const xCount = Math.floor((xr - xStart) / xStep);
      for (let k = 0; k <= xCount; k++) {
        const xv = Math.round((xStart + k * xStep) * 1e9) / 1e9;
        const gx = toX(xv);
        if (gx < padL || gx > cssW - padR) continue;
        if (showGrid) {
          ctx.strokeStyle = gridColor; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(gx, padT); ctx.lineTo(gx, cssH - padB); ctx.stroke();
        }
        ctx.fillText(fmtNum(xv), gx, cssH - padB + 13);
      }

      // 0축
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.2;
      if (yb <= 0 && yt >= 0) {
        const zy = toY(0);
        ctx.beginPath(); ctx.moveTo(padL, zy); ctx.lineTo(cssW - padR, zy); ctx.stroke();
      }
      if (xl <= 0 && xr >= 0) {
        const zx = toX(0);
        ctx.beginPath(); ctx.moveTo(zx, padT); ctx.lineTo(zx, cssH - padB); ctx.stroke();
      }

      // 축 제목
      const xLabel = this.getAttribute('x-label') || '';
      const yLabel = this.getAttribute('y-label') || '';
      if (xLabel || yLabel) {
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 9px -apple-system,sans-serif';
        ctx.textAlign = 'center';
        if (xLabel) ctx.fillText(xLabel, padL + plotW / 2, cssH - 4);
        if (yLabel) {
          ctx.save();
          ctx.translate(10, padT + plotH / 2);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText(yLabel, 0, 0);
          ctx.restore();
        }
      }

      ctx.save();
      ctx.beginPath();
      ctx.rect(padL, padT, plotW, plotH);
      ctx.clip();

      // series
      for (const s of this.series) {
        ctx.save();
        ctx.strokeStyle = s.color || '#6366f1';
        ctx.lineWidth = s.width ?? 2;
        ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        const dash = parseDash(s.dash);
        if (dash.length) ctx.setLineDash(dash);
        ctx.beginPath();
        let started = false;
        for (const p of s.points) {
          if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) { started = false; continue; }
          const px = toX(p.x), py = toY(p.y);
          if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();
        if (s.label && s.points.length) {
          const last = s.points[s.points.length - 1];
          ctx.fillStyle = s.labelColor || s.color || '#6366f1';
          ctx.font = 'bold 11px -apple-system,sans-serif'; ctx.textAlign = 'left';
          this.haloText(ctx, s.label, toX(last.x) + 6, toY(last.y) - 6);
        }
      }

      // polygon (면적 채우기, 라벨은 무게중심)
      for (const p of this.polygons) {
        ctx.save();
        ctx.beginPath();
        p.points.forEach((pt, k) => {
          const px = toX(pt.x), py = toY(pt.y);
          if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        });
        ctx.closePath();
        if (p.fill) { ctx.fillStyle = p.fill; ctx.fill(); }
        ctx.strokeStyle = p.color || '#6366f1';
        ctx.lineWidth = p.width ?? 1.5;
        const dash = parseDash(p.dash);
        if (dash.length) ctx.setLineDash(dash);
        ctx.stroke();
        ctx.restore();
        if (p.label && p.points.length) {
          const cx = p.points.reduce((s, pt) => s + pt.x, 0) / p.points.length;
          const cy = p.points.reduce((s, pt) => s + pt.y, 0) / p.points.length;
          ctx.fillStyle = p.labelColor || p.color || '#6366f1';
          ctx.font = 'bold 11px -apple-system,sans-serif'; ctx.textAlign = 'center';
          this.haloText(ctx, p.label, toX(cx), toY(cy));
        }
      }

      // circle (ry 미지정 시 화면상 원)
      for (const c of this.circles) {
        const cx = toX(c.x), cy = toY(c.y);
        const rxPx = c.r / xDataPerPx;
        const ryPx = (c.ry ?? c.r * xDataPerPx / yDataPerPx) / yDataPerPx;
        ctx.save();
        if (c.fill) { ctx.fillStyle = c.fill; ctx.beginPath(); ctx.ellipse(cx, cy, rxPx, ryPx, 0, 0, Math.PI * 2); ctx.fill(); }
        ctx.strokeStyle = c.color || '#6366f1';
        ctx.lineWidth = c.width ?? 2;
        const dash = parseDash(c.dash);
        if (dash.length) ctx.setLineDash(dash);
        ctx.beginPath(); ctx.ellipse(cx, cy, rxPx, ryPx, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
        if (c.label) {
          ctx.fillStyle = c.labelColor || c.color || '#6366f1';
          ctx.font = 'bold 11px -apple-system,sans-serif'; ctx.textAlign = 'left';
          this.haloText(ctx, c.label, cx + rxPx + 4, cy - 4);
        }
      }

      // vector (화살표)
      for (const v of this.vectors) {
        const x1 = toX(v.x1), y1 = toY(v.y1), x2 = toX(v.x2), y2 = toY(v.y2);
        ctx.save();
        ctx.strokeStyle = v.color || '#6366f1';
        ctx.fillStyle = v.color || '#6366f1';
        ctx.lineWidth = v.width ?? 2;
        const dash = parseDash(v.dash);
        if (dash.length) ctx.setLineDash(dash);
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.setLineDash([]);
        const ang = Math.atan2(y2 - y1, x2 - x1);
        const h = 8;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - h * Math.cos(ang - 0.4), y2 - h * Math.sin(ang - 0.4));
        ctx.lineTo(x2 - h * Math.cos(ang + 0.4), y2 - h * Math.sin(ang + 0.4));
        ctx.closePath(); ctx.fill();
        ctx.restore();
        if (v.label) {
          ctx.fillStyle = v.labelColor || v.color || '#6366f1';
          ctx.font = 'bold 11px -apple-system,sans-serif'; ctx.textAlign = 'left';
          this.haloText(ctx, v.label, x2 + 6, y2 - 6);
        }
      }

      // marker
      for (const m of this.markers) {
        const px = toX(m.x), py = toY(m.y);
        ctx.save();
        ctx.fillStyle = m.color || '#10b981';
        ctx.beginPath(); ctx.arc(px, py, m.size ?? 4, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        if (m.label) {
          ctx.fillStyle = m.labelColor || m.color || '#10b981';
          ctx.font = 'bold 11px -apple-system,sans-serif'; ctx.textAlign = 'left';
          this.haloText(ctx, m.label, px + 7, py - 6);
        }
      }

      // arc (수학각 rad → canvas 변환)
      for (const a of this.arcs) {
        ctx.save();
        ctx.strokeStyle = a.color || '#10b981';
        ctx.lineWidth = a.width ?? 1.6;
        ctx.beginPath();
        ctx.arc(toX(a.x), toY(a.y), a.r, -a.startAngle, -a.endAngle, a.startAngle < a.endAngle);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    }

    // ── 이벤트: 휠 줌 ──
    @eventShadow('#cc-canvas', 'wheel', { passive: false })
    private onWheel(e: WheelEvent): void {
      if (!!this.hasAttribute('disabled-zoom')) return;
      if (!this.isInPlot(e.clientX, e.clientY)) return;
      e.preventDefault();
      const canvas = this.canvas;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const pr = this.getPlotRect();
      if (!pr) return;
      const fracX = Math.max(0, Math.min(1, (e.clientX - rect.left - pr.padL) / pr.plotW));
      const fracY = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top - pr.padT) / pr.plotH));
      const delta = Math.max(-120, Math.min(120, e.deltaY));
      const factor = Math.exp(-delta * 0.00055 * 8);
      const clampedFactor = Math.max(0.94, Math.min(1.06, factor));
      this.zoomAt(clampedFactor, fracX, fracY);
      this.draw();
    }

    @eventShadow('#cc-canvas', 'mousedown')
    private onMouseDown(e: MouseEvent): void {
      if (!!this.hasAttribute('disabled-zoom') || !this.isInPlot(e.clientX, e.clientY)) {
        this.dragging = false;
        return;
      }
      this.dragging = true;
      this.dragLastX = e.clientX;
      this.dragLastY = e.clientY;
    }

    @eventShadow('#cc-canvas', 'mousemove')
    private onMouseMove(e: MouseEvent): void {
      if (!this.dragging || !!this.hasAttribute('disabled-zoom')) return;
      const pr = this.getPlotRect();
      const b = this.getBaseBounds();
      if (!pr) return;
      const dx = -(e.clientX - this.dragLastX) / pr.plotW * ((b.xR - b.xL) / this.scaleX);
      const dy = (e.clientY - this.dragLastY) / pr.plotH * ((b.yT - b.yB) / this.scaleY);
      this.offsetX += dx;
      this.offsetY += dy;
      this.dragLastX = e.clientX;
      this.dragLastY = e.clientY;
      this.draw();
    }

    @eventShadow('#cc-canvas', 'mouseup')
    private onMouseUp(): void {
      this.dragging = false;
    }

    @eventShadow('#cc-canvas', 'touchstart', { passive: false })
    private onTouchStart(e: TouchEvent): void {
      const touches = e.touches;
      if (touches.length === 2 && !this.hasAttribute('disabled-zoom')) {
        const cx = (touches[0].clientX + touches[1].clientX) / 2;
        const cy = (touches[0].clientY + touches[1].clientY) / 2;
        if (!this.isInPlot(cx, cy)) return;
        e.preventDefault();
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        this.pinchDist0 = Math.hypot(dx, dy);
        this.pinchScaleX0 = this.scaleX;
        this.dragging = false;
      } else if (touches.length === 1) {
        if (!!this.hasAttribute('disabled-zoom') || !this.isInPlot(touches[0].clientX, touches[0].clientY)) {
          this.dragging = false;
          return;
        }
        this.dragging = true;
        this.dragLastX = touches[0].clientX;
        this.dragLastY = touches[0].clientY;
      }
    }

    @eventShadow('#cc-canvas', 'touchmove', { passive: false })
    private onTouchMove(e: TouchEvent): void {
      const touches = e.touches;
      if (touches.length === 2 && this.pinchDist0 > 0 && !this.hasAttribute('disabled-zoom')) {
        e.preventDefault();
        const dist = Math.hypot(
          touches[0].clientX - touches[1].clientX,
          touches[0].clientY - touches[1].clientY,
        );
        if (dist === 0) return;
        const cx = (touches[0].clientX + touches[1].clientX) / 2;
        const cy = (touches[0].clientY + touches[1].clientY) / 2;
        const rect = this.canvas.getBoundingClientRect();
        const pr = this.getPlotRect();
        if (!pr || !this.isInPlot(cx, cy)) return;
        const fracX = Math.max(0, Math.min(1, (cx - rect.left - pr.padL) / pr.plotW));
        const fracY = Math.max(0, Math.min(1, 1 - (cy - rect.top - pr.padT) / pr.plotH));
        const rawFactor = dist / this.pinchDist0;
        const targetSX = Math.min(50, Math.max(0.2, this.pinchScaleX0 * (1 + (rawFactor - 1) * 0.5)));
        this.zoomAt(targetSX / this.scaleX, fracX, fracY);
        this.draw();
      } else if (touches.length === 1 && this.dragging && !this.hasAttribute('disabled-zoom')) {
        if (!this.isInPlot(touches[0].clientX, touches[0].clientY)) return;
        e.preventDefault();
        const pr = this.getPlotRect();
        const b = this.getBaseBounds();
        if (!pr) return;
        const dx = touches[0].clientX - this.dragLastX;
        const dy = touches[0].clientY - this.dragLastY;
        this.offsetX += (-dx / pr.plotW) * ((b.xR - b.xL) / this.scaleX);
        this.offsetY += (dy / pr.plotH) * ((b.yT - b.yB) / this.scaleY);
        this.dragLastX = touches[0].clientX;
        this.dragLastY = touches[0].clientY;
        this.draw();
      }
    }

    @eventShadow('#cc-canvas', 'touchend')
    private onTouchEnd(): void {
      this.pinchDist0 = 0;
      this.dragging = false;
    }

    @eventShadow('#cc-reset', 'click')
    private onResetClick(): void {
      this.reset();
    }
  }

  return CartesianChartImpl;
};
