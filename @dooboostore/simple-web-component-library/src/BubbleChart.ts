import {
  changedAttribute,
  elementDefine,
  eventShadow,
  eventWindow,
  mutationObserverLight,
  onConnectedAfter,
  onConnectedBodyShadow,
  queryShadow,
  resizeObserverLight,
} from '@dooboostore/simple-web-component';

const tagName = 'bubble-chart';

/** child <bubble> 요소 한 건 — general */
export interface BubbleChartPoint {
  label: string;
  x: number;
  y: number;
  /** 0~100 비율 값 (max 시총 대비 %) — 버블 크기決定 */
  value: number;
  description?: string;
  showCenterCross?: boolean;
  fillStyle?: string;
  strokeStyle?: string;
  lineWidth?: number;
  labelColor?: string;
}

export interface BubbleChart extends HTMLElement {
  setData(points: BubbleChartPoint[]): void;
}

// ── 포맷 유틸 ──────────────────────────────────────────────────────
function fmtAxis(v: number): string {
  if (v === 0) return '0';
  const abs = Math.abs(v);
  if (abs >= 1e12) return (v / 1e12).toFixed(1) + '조';
  if (abs >= 1e8)  return Math.round(v / 1e8).toLocaleString() + '억';
  if (abs >= 1e4)  return Math.round(v / 1e4).toLocaleString() + '만';
  // 소수 → % 표기로 간주 (-0.034 → -3.4%) — 시가총액 0 제외
  if (Math.abs(v) < 1) return (v >= 0 ? '+' : '') + (v * 100).toFixed(1) + '%';
  return v.toLocaleString();
}

/** 회전율 전용 포맷: 소수값을 항상 % 로 표시 (1.2803 → "+128.03%") */
function fmtTurnover(v: number): string {
  const pct = v * 100;
  const sign = pct >= 0 ? '+' : '';
  return sign + pct.toFixed(2) + '%';
}

export interface BubbleChartCtor {
  new (): BubbleChart;
}

export default (w: Window): BubbleChartCtor => {
  const existing = w.customElements.get(tagName);
  if (existing) return existing as unknown as BubbleChartCtor;

  @elementDefine(tagName, { window: w })
  class BubbleChartImpl extends w.HTMLElement implements BubbleChart {
    // ── 상태 ──
    private points: BubbleChartPoint[] = [];
    private selectedIdx = -1;

    // 핀치/휠 줌 상태
    private scaleX = 1;
    private scaleY = 1;
    private offsetX = 0;
    private offsetY = 0;
    private pinchDist0 = 0;
    private pinchScaleX0 = 1;
    private pinchScaleY0 = 1;
    private dragging = false;
    private dragLastX = 0;
    private dragLastY = 0;
    private downX = 0;
    private downY = 0;
    private lines: Array<{ sx: number; sy: number; ex: number; ey: number; dash?: string; width?: number; stroke?: string }> = [];
    private lastTouchEndTime = 0;
    private xLabel = 'x';
    private yLabel = 'y';
    private showCenterCross = false;

    @changedAttribute('x-label')
    onXLabelChanged(v: string) {
      this.xLabel = v ?? 'x';
      if (this.canvas) this.draw();
    }

    @changedAttribute('y-label')
    onYLabelChanged(v: string) {
      this.yLabel = v ?? 'y';
      if (this.canvas) this.draw();
    }

    @changedAttribute('show-center-cross', { type: Boolean })
    onShowCenterCrossChanged(v: boolean) {
      this.showCenterCross = !!v;
      if (this.canvas) this.draw();
    }

    public reset(): void {
      this.resetView();
      this.draw();
    }

    // ── API ──
    setData(points: BubbleChartPoint[]): void {
      this.points = points || [];
      this.resetView();
      if (this.isConnected && this.canvas) this.draw();
    }

    private resetView() {
      this.scaleX = 1; this.scaleY = 1;
      this.offsetX = 0; this.offsetY = 0;
      this.selectedIdx = -1;
    }

    // ── 줌 공통 헬퍼 ──
    private getFitBounds() {
      const pts = this.points;
      if (pts.length === 0) return null;
      const xRaw = pts.map(p => p.x);
      const yRaw = pts.map(p => p.y);
      const xFitMin = Math.min(...xRaw);
      const xFitMax = Math.max(...xRaw);
      const xFitPad = (xFitMax - xFitMin) * 0.06 || xFitMax * 0.04 || 1;
      const xFitL = xFitMin - xFitPad;
      const xFitR = xFitMax + xFitPad;
      const yFitMin = Math.min(...yRaw);
      const yFitMax = Math.max(...yRaw);
      const yFitPad = (yFitMax - yFitMin) * 0.25 || 0.01;
      const yFitB = yFitMin - yFitPad;
      const yFitT = yFitMax + yFitPad;
      return {
        xFitL, xFitR, xFitRange: xFitR - xFitL,
        yFitB, yFitT, yFitRange: yFitT - yFitB,
      };
    }

    private clampView() {
      const b = this.getFitBounds();
      if (!b) return;
      // 확대 배율에 비례해 팬 가능 범위를 넓힘 (더 많이 확대할수록 더 멀리 이동 가능)
      const panMargin = Math.max(this.scaleX, this.scaleY);
      const maxOffsetX = b.xFitRange * panMargin * 0.9;
      const maxOffsetY = b.yFitRange * panMargin * 0.9;
      this.offsetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, this.offsetX));
      this.offsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, this.offsetY));
    }

    /** draw()와 동일한 패딩 로직으로 plot(순수 버블 영역) rect 계산 — 패딩 고정, 가운데 plot만 늘어남 */
    private getPlotRect() {
      const canvas = this.canvas;
      if (!canvas) return null;
      const cssW = canvas.clientWidth  || 400;
      const cssH = canvas.clientHeight || 340;
      const padL  = 62; // Y라벨 고정
      const padR  = 12;
      const padT  = 12;
      const padB2 = 44; // X라벨 고정
      const plotW = Math.max(10, cssW - padL - padR);
      const plotH = Math.max(10, cssH - padT - padB2);
      if (plotW <= 0 || plotH <= 0) return null;
      return { padL, padR, padT, padB: padB2, plotW, plotH, cssW, cssH };
    }

    private isInPlot(clientX: number, clientY: number): boolean {
      const rect = this.canvas?.getBoundingClientRect();
      const pr = this.getPlotRect();
      if (!rect || !pr) return false;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      return x >= pr.padL && x <= pr.padL + pr.plotW && y >= pr.padT && y <= pr.padT + pr.plotH;
    }

    /** fracX/Y(0~1) 앵커를 기준으로 factor 배율만큼 줌. factor>1 확대, <1 축소 */
    private zoomAt(factor: number, fracX: number, fracY: number) {
      const b = this.getFitBounds();
      if (!b) return;
      // 감도: 0.65로 완화 (이전 0.45는 너무 느림)
      const dampFactor = 1 + (factor - 1) * 0.65;
      const newSX = Math.min(50, Math.max(1, this.scaleX * dampFactor));
      const newSY = Math.min(50, Math.max(1, this.scaleY * dampFactor));
      const realFactorX = newSX / this.scaleX;
      const realFactorY = newSY / this.scaleY;
      // 앵커가 화면상 고정되도록 offset 보정
      // xAnchor = xFitL + offsetX + (xFitRange/scaleX)*fracX
      // newOffsetX = xAnchor - (xFitRange/newSX)*fracX - xFitL
      //            = offsetX + xFitRange*fracX*(1/scaleX - 1/newSX)
      this.offsetX += b.xFitRange * fracX * (1 / this.scaleX - 1 / newSX);
      this.offsetY += b.yFitRange * fracY * (1 / this.scaleY - 1 / newSY);
      this.scaleX = newSX;
      this.scaleY = newSY;
      // 리미트 후 보정값이 잘렸을 때 미세 오차 방지용 클램프
      if (realFactorX === 1 && realFactorY === 1) return;
      this.clampView();
    }

    // ── 데이터 수집 (child <bubble> + <line> 요소) ──
    private collect(): void {
      const pts: BubbleChartPoint[] = [];
      this.querySelectorAll(':scope > bubble').forEach(el => {
        const rawFill = (el.getAttribute('fill-style') ?? el.getAttribute('fillStyle') ?? '').trim();
        const rawStroke = (el.getAttribute('stroke-style') ?? el.getAttribute('strokeStyle') ?? el.getAttribute('stroke') ?? '').trim();
        const rawLabelColor = (el.getAttribute('label-color') ?? el.getAttribute('labelColor') ?? '').trim();
        const rawLW = el.getAttribute('line-width') ?? el.getAttribute('lineWidth');
        let lw: number | undefined;
        if (rawLW != null && rawLW.trim() !== '') { const n = Number(rawLW); if (Number.isFinite(n) && n > 0) lw = n; }
        const rawVal = el.getAttribute('value') ?? el.getAttribute('r');
        let v = rawVal != null && rawVal.trim() !== '' ? Number(rawVal) : 0;
        if (!Number.isFinite(v)) v = 0;
        v = Math.max(0, Math.min(100, v));
        pts.push({
          label: el.getAttribute('label') || '',
          x:     Number(el.getAttribute('x'))     || 0,
          y:     Number(el.getAttribute('y'))      || 0,
          value: v,
          description: el.getAttribute('description') || undefined,
          showCenterCross: el.hasAttribute('show-center-cross'),
          fillStyle: rawFill || undefined,
          strokeStyle: rawStroke || undefined,
          lineWidth: lw,
          labelColor: rawLabelColor || undefined,
        });
      });
      this.points = pts;
      // <line> 오버레이 수집 — start-x/y, end-x/y 필수, 나머지는 기본값
      const ls: typeof this.lines = [];
      this.querySelectorAll(':scope > line').forEach(el => {
        const sx = Number(el.getAttribute('start-x'));
        const sy = Number(el.getAttribute('start-y'));
        const ex = Number(el.getAttribute('end-x'));
        const ey = Number(el.getAttribute('end-y'));
        if (!Number.isFinite(sx) || !Number.isFinite(sy) || !Number.isFinite(ex) || !Number.isFinite(ey)) return;
        ls.push({
          sx, sy, ex, ey,
          dash: el.getAttribute('line-dash') || el.getAttribute('line-style') || undefined,
          width: Number(el.getAttribute('line-width') || el.getAttribute('stroke-width') || el.getAttribute('strokeWidth') || 1.5) || 1.5,
          stroke: el.getAttribute('strokeStyle') || el.getAttribute('stroke') || el.getAttribute('color') || '#94a3b8',
        });
      });
      this.lines = ls;
    }

    @onConnectedAfter
    onConnected() {
      this.collect();
      if (this.canvas && this.points.length > 0) this.draw();
    }

    @mutationObserverLight({ childList: true, attributes: true, subtree: true })
    onMutated() {
      this.collect();
      this.resetView();
      if (this.canvas && this.points.length > 0) this.draw();
    }

    private resizeRaf = 0;
    @resizeObserverLight()
    onResize() {
      if (!this.canvas || this.points.length === 0) return;
      if (this.resizeRaf) cancelAnimationFrame(this.resizeRaf);
      this.resizeRaf = requestAnimationFrame(() => {
        this.resizeRaf = 0;
        if (this.canvas && this.points.length > 0) this.draw();
      });
    }

    // ── Shadow DOM — canvas만 유지, 범례/버튼은 사용하는 쪽에서 렌더 ──
    @onConnectedBodyShadow
    render(): string {
      return `
        <style>
          :host { display:block; position:relative; }
          #bc-canvas {
            display:block; width:100%; height:var(--bc-canvas-height, 320px);
            touch-action:pan-y; cursor:crosshair;
            background:#fff;
          }
          :host([enabled-zoom]) #bc-canvas { touch-action:pan-y; }
        </style>
        <canvas id="bc-canvas"></canvas>
      `;
    }

    @queryShadow('#bc-canvas')
    private canvas!: HTMLCanvasElement;

    // ── 드로잉 ──
    private draw(): void {
      const canvas = this.canvas;
      if (!canvas || this.points.length === 0) return;
      const dpr  = w.devicePixelRatio || 1;
      const cssW = canvas.clientWidth  || 400;
      const cssH = canvas.clientHeight || 340;
      canvas.width  = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const pts = this.points;

      const minR = 10;
      const tmpPlot = Math.max(cssW - 80, cssH - 60);
      const maxR = Math.max(minR + 1, tmpPlot * 0.13);

      // 패딩 고정 — 가로가 커져도 라벨 영역은 그대로, 가운데 plot만 확장
      const padL  = 62; // Y라벨 고정
      const padR  = 12;
      const padT  = 12;
      const padB2 = 44; // X라벨 고정
      const plotW = Math.max(10, cssW - padL - padR);
      const plotH = Math.max(10, cssH - padT - padB2);

      // ── 데이터 범위 (기본 fit) ──
      const xRaw = pts.map(p => p.x);
      const yRaw = pts.map(p => p.y);

      const xFitMin = Math.min(...xRaw);
      const xFitMax = Math.max(...xRaw);
      const xFitPad = (xFitMax - xFitMin) * 0.06 || xFitMax * 0.04 || 1;
      const yFitMin = Math.min(...yRaw);
      const yFitMax = Math.max(...yRaw);
      const yFitPad = (yFitMax - yFitMin) * 0.25 || 0.01;
      // 기본 fit 범위
      let xFitL = xFitMin - xFitPad;
      let xFitR = xFitMax + xFitPad;
      let yFitB = yFitMin - yFitPad;
      let yFitT = yFitMax + yFitPad;
      // 버블 반경(maxR)만큼 추가 여유 — 초기 렌더에서 버블 잘림 방지 (절대 크기)
      {
        const xRange0 = xFitR - xFitL;
        const yRange0 = yFitT - yFitB;
        const xDataPerPx = xRange0 / Math.max(1, plotW);
        const yDataPerPx = yRange0 / Math.max(1, plotH);
        const rPx = maxR;
        const padX = rPx * xDataPerPx * 1.05;
        const padY = rPx * yDataPerPx * 1.05;
        xFitL -= padX; xFitR += padX;
        yFitB -= padY; yFitT += padY;
      }
      const xFitRange = xFitR - xFitL;
      const yFitRange = yFitT - yFitB;

      // 줌/이동 적용
      const xRange = xFitRange / this.scaleX;
      const yRange = yFitRange / this.scaleY;
      const xl = xFitL + this.offsetX;
      const xr = xl + xRange;
      const yb = yFitB + this.offsetY;
      const yt = yb + yRange;

      // 버블 반지름: value 0~100 비율로 정규화 (절대 크기, 줌과 무관)
      const toX = (v: number) => padL + ((v - xl) / (xr - xl)) * plotW;
      const toY = (v: number) => padT + plotH - ((v - yb) / (yt - yb)) * plotH;
      const toR = (v: number) => minR + (Math.max(0, Math.min(100, v)) / 100) * (maxR - minR);

      // ── 배경 ──
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, cssW, cssH);

      // ── Y 그리드 ──
      ctx.font = '9px -apple-system,sans-serif';
      for (let g = 0; g <= 4; g++) {
        const yv = yb + yRange * g / 4;
        const gy = toY(yv);
        if (gy < padT - 4 || gy > cssH - padB2 + 4) continue;
        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(cssW - padR, gy); ctx.stroke();
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'right';
        ctx.fillText(fmtAxis(yv), padL - 4, gy + 3);
      }

      // 0% 기준선 제거 — 필요 시 <line>으로 사용자가 직접 추가

      // ── X 축 라벨 ──
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      for (let g = 0; g <= 4; g++) {
        const xv = xl + xRange * g / 4;
        const gx = toX(xv);
        if (gx < padL || gx > cssW - padR) continue;
        ctx.fillText(fmtTurnover(xv), gx, cssH - padB2 + 13);
      }

      // ── 축 제목 — x-label / y-label 속성 기반 ──
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 9px -apple-system,sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.xLabel, padL + plotW / 2, cssH - 4);
      ctx.save();
      ctx.translate(10, padT + plotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(this.yLabel, 0, 0);
      ctx.restore();

      // ── 버블 — plot 내부로 클리핑하여 모든 축 라벨 뒤에서 가려짐 ──
      ctx.save();
      ctx.beginPath();
      ctx.rect(padL, padT, plotW, plotH);
      ctx.clip();
      // ── <line> 오버레이 — 데이터 좌표계로 매핑, plot 내부에만 보임 ──
      for (const l of this.lines) {
        const x1 = toX(l.sx), y1 = toY(l.sy), x2 = toX(l.ex), y2 = toY(l.ey);
        ctx.save();
        ctx.strokeStyle = l.stroke || '#94a3b8';
        ctx.lineWidth = l.width ?? 1.5;
        ctx.lineCap = 'round';
        if (l.dash) {
          const dash = l.dash.split(/[,\s]+/).map(s => Number(s.trim())).filter(n => Number.isFinite(n) && n > 0);
          if (dash.length) ctx.setLineDash(dash);
        }
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.restore();
      }
      for (let i = 0; i < pts.length; i++) {
        if (i === this.selectedIdx) continue;
        this.drawBubble(ctx, pts[i], toX, toY, toR, false);
      }
      // 선택된 버블 맨 위
      if (this.selectedIdx >= 0 && this.selectedIdx < pts.length) {
        this.drawBubble(ctx, pts[this.selectedIdx], toX, toY, toR, true);
      }
      // ── 카테고리명 라벨 — 버블과 함께 클리핑되어 축 넘어가면 같이 사라짐 ──
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const bx = toX(p.x), by = toY(p.y), br = toR(p.value);
        const selected = i === this.selectedIdx;
        if (!selected && br < 9) continue;
        const c = p.labelColor || (selected ? (p.strokeStyle || '#0f172a') : '#1e293b');
        ctx.fillStyle = c;
        ctx.font = selected ? 'bold 10px -apple-system,sans-serif' : '9px -apple-system,sans-serif';
        ctx.textAlign = 'center';
        const name  = p.label.length > 6 ? p.label.slice(0, 6) + '…' : p.label;
        const textY = br >= 14 ? by + 4 : by - br - 6;
        ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 3;
        ctx.strokeText(name, bx, textY);
        ctx.fillText(name, bx, textY);
      }
      ctx.restore();

      // ── 선택 툴팁 — description (\n 구분) — 클리핑 밖에서 그려 항상 보임 ──
      if (this.selectedIdx >= 0 && this.selectedIdx < pts.length) {
        const p = pts[this.selectedIdx];
        const raw = p.description?.trim();
        if (raw) {
          const lines = raw.split('\n').map(s => s.trim()).filter(Boolean);
          const displayLines = [p.label, ...lines];
          const fontTitle = 'bold 11px -apple-system,sans-serif';
          const fontBody = '11px -apple-system,sans-serif';
          // 최대 너비 측정
          let maxW = 0;
          ctx.font = fontTitle; maxW = Math.max(maxW, ctx.measureText(displayLines[0] || '').width);
          ctx.font = fontBody;
          for (let i = 1; i < displayLines.length; i++) maxW = Math.max(maxW, ctx.measureText(displayLines[i]).width);
          const padX = 10, padY = 8, lineH = 15;
          const boxW = Math.ceil(maxW + padX * 2);
          const boxH = Math.ceil(padY * 2 + displayLines.length * lineH);
          const bx = toX(p.x), by = toY(p.y), br = toR(p.value);
          let boxX = Math.round(bx - boxW / 2);
          let boxY = Math.round(by - br - boxH - 10);
          if (boxY < padT) boxY = Math.round(by + br + 10);
          // 캔버스 경계 클램프
          boxX = Math.max(4, Math.min(boxX, cssW - boxW - 4));
          boxY = Math.max(4, Math.min(boxY, cssH - boxH - 4));
          // 말풍선 배경
          ctx.fillStyle = 'rgba(15,23,42,0.92)';
          (ctx as any).beginPath();
          if ((ctx as any).roundRect) (ctx as any).roundRect(boxX, boxY, boxW, boxH, 8);
          else { ctx.rect(boxX, boxY, boxW, boxH); }
          ctx.fill();
          // 텍스트
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          for (let i = 0; i < displayLines.length; i++) {
            ctx.font = i === 0 ? fontTitle : fontBody;
            ctx.fillStyle = i === 0 ? '#fff' : 'rgba(255,255,255,0.92)';
            ctx.fillText(displayLines[i], boxX + padX, boxY + padY + lineH * i + lineH / 2);
          }
          ctx.textBaseline = 'alphabetic';
        }
      }

    }

    private drawBubble(
      ctx: CanvasRenderingContext2D,
      p: BubbleChartPoint,
      toX: (v: number) => number,
      toY: (v: number) => number,
      toR: (v: number) => number,
      selected: boolean,
    ) {
      const br = toR(p.value);
      const DEFAULT_STROKE = '#64748b';
      const DEFAULT_FILL = 'rgba(100,116,139,0.22)';
      const stroke = p.strokeStyle || DEFAULT_STROKE;
      const fill = p.fillStyle || DEFAULT_FILL;
      const bx = toX(p.x), by = toY(p.y);

      if (selected) {
        ctx.beginPath();
        ctx.arc(bx, by, br + 5, 0, Math.PI * 2);
        ctx.fillStyle = stroke + '22'; ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fillStyle = p.fillStyle ? p.fillStyle : (selected ? stroke + '44' : fill);
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = p.lineWidth != null ? p.lineWidth : (selected ? 2.5 : 1.6);
      ctx.stroke();

      if (this.showCenterCross || p.showCenterCross) {
        const crossSize = Math.max(7, Math.min(br * 0.22, 18));
        ctx.save();
        ctx.strokeStyle = stroke;
        ctx.globalAlpha = selected ? 0.35 : 0.22;
        ctx.lineWidth = selected ? 1.4 : 1.0;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(bx - crossSize, by);
        ctx.lineTo(bx + crossSize, by);
        ctx.moveTo(bx, by - crossSize);
        ctx.lineTo(bx, by + crossSize);
        ctx.stroke();
        ctx.restore();
      }
    }

    // ── 좌표 → 가장 가까운 버블 인덱스 ──
    private hitTest(cx: number, cy: number): number {
      const canvas = this.canvas;
      if (!canvas || this.points.length === 0) return -1;
      const b = this.getFitBounds();
      if (!b) return -1;

      const cssW = canvas.clientWidth  || 400;
      const cssH = canvas.clientHeight || 340;
      const tmpPlot = Math.max(cssW - 80, cssH - 60);
      const minR = 10;
      const maxR = Math.max(minR + 1, tmpPlot * 0.13);
      const padL  = 62;
      const padR  = 12;
      const padT  = 12;
      const padB  = 44;
      const plotW = Math.max(10, cssW - padL - padR);
      const plotH = Math.max(10, cssH - padT - padB);

      const pts  = this.points;

      // draw()와 동일한 버블 여백 확장 — 줌/클릭 좌표 일치 (절대 크기)
      let xFitL = b.xFitL, xFitR = b.xFitR, yFitB = b.yFitB, yFitT = b.yFitT;
      {
        const xRange0 = xFitR - xFitL;
        const yRange0 = yFitT - yFitB;
        const xDataPerPx = xRange0 / Math.max(1, plotW);
        const yDataPerPx = yRange0 / Math.max(1, plotH);
        const rPx = maxR;
        const padX = rPx * xDataPerPx * 1.05;
        const padY = rPx * yDataPerPx * 1.05;
        xFitL -= padX; xFitR += padX;
        yFitB -= padY; yFitT += padY;
      }
      const xFitRange = xFitR - xFitL;
      const yFitRange = yFitT - yFitB;
      const xRange = xFitRange / this.scaleX;
      const yRange = yFitRange / this.scaleY;
      const xl = xFitL + this.offsetX;
      const yb = yFitB + this.offsetY;
      const yt = yb + yRange;

      const toX = (v: number) => padL + ((v - xl) / xRange) * plotW;
      const toY = (v: number) => padT + plotH - ((v - yb) / (yt - yb)) * plotH;
      const toR = (v: number) => minR + (Math.max(0, Math.min(100, v)) / 100) * (maxR - minR);

      let hit = -1, minDist = Infinity;
      for (let i = 0; i < pts.length; i++) {
        const bx = toX(pts[i].x), by = toY(pts[i].y), br = toR(pts[i].value);
        const dist = Math.sqrt((cx - bx) ** 2 + (cy - by) ** 2);
        if (dist < br + 10 && dist < minDist) { minDist = dist; hit = i; }
      }
      return hit;
    }

    // ── 이벤트: 휠 줌 ──
    // 라벨/축 영역 제외, 순수 plot(버블 영역) 내부에서만 줌 처리
    @eventShadow('#bc-canvas', 'wheel', { passive: false })
    private onWheel(e: WheelEvent): void {
      if (!this.hasAttribute('enabled-zoom')) return;
      if (!this.isInPlot(e.clientX, e.clientY)) return;
      e.preventDefault();
      const canvas = this.canvas;
      if (!canvas || this.points.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      const pr = this.getPlotRect();
      if (!pr) return;
      const fracX = Math.max(0, Math.min(1, (e.clientX - rect.left - pr.padL) / pr.plotW));
      const fracY = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top - pr.padT) / pr.plotH));
      // deltaY 크기에 비례하되 한 틱당 최대 ±3% 로 제한 → 부드럽고 예측 가능
      const delta = Math.max(-120, Math.min(120, e.deltaY));
      const factor = Math.exp(-delta * 0.00055 * 8); // ≈ 1.05 at delta= -100
      const clampedFactor = Math.max(0.94, Math.min(1.06, factor));
      this.zoomAt(clampedFactor, fracX, fracY);
      this.draw();
    }

    // ── 이벤트: 마우스 ──
    // plot 내부에서만 드래그/팬 시작 (라벨/축 영역 제외) — 클릭 선택은 별도 처리
    @eventShadow('#bc-canvas', 'mousedown')
    private onMouseDown(e: MouseEvent): void {
      this.downX = e.clientX;
      this.downY = e.clientY;
      if (this.hasAttribute('enabled-zoom') && !this.isInPlot(e.clientX, e.clientY)) {
        this.dragging = false;
        return;
      }
      this.dragging  = true;
      this.dragLastX = e.clientX;
      this.dragLastY = e.clientY;
    }

    @eventWindow('mouseup')
    private onMouseUp(e: MouseEvent): void {
      if (!this.dragging) return;
      if (Date.now() - this.lastTouchEndTime < 350) return;
      this.dragging = false;
      const moved = Math.abs(e.clientX - this.downX) + Math.abs(e.clientY - this.downY);
      if (moved < 5) {
        const rect = this.canvas.getBoundingClientRect();
        const hit  = this.hitTest(e.clientX - rect.left, e.clientY - rect.top);
        this.selectedIdx = hit === this.selectedIdx ? -1 : hit;
        this.draw();
        this.dispatchEvent(new CustomEvent('bubble-select', {
          detail: this.selectedIdx >= 0 ? this.points[this.selectedIdx] : null,
          bubbles: true,
        }));
      }
    }

    @eventShadow('#bc-canvas', 'mousemove')
    private onMouseMove(e: MouseEvent): void {
      if (this.dragging && this.hasAttribute('enabled-zoom')) {
        const canvas = this.canvas;
        if (!canvas) return;
        const b = this.getFitBounds();
        if (!b) return;
        const pr = this.getPlotRect();
        if (!pr) return;

        const dx = -(e.clientX - this.dragLastX) / pr.plotW  * (b.xFitRange / this.scaleX);
        const dy =  (e.clientY - this.dragLastY) / pr.plotH  * (b.yFitRange / this.scaleY);
        this.offsetX += dx;
        this.offsetY += dy;
        this.dragLastX = e.clientX;
        this.dragLastY = e.clientY;
        this.clampView();
        this.draw();
      }
    }

    // ── 이벤트: 터치 ──
    @eventShadow('#bc-canvas', 'touchstart', { passive: false })
    private onTouchStart(e: TouchEvent): void {
      const touches = e.touches;
      if (touches.length === 2 && this.hasAttribute('enabled-zoom')) {
        const cx = (touches[0].clientX + touches[1].clientX) / 2;
        const cy = (touches[0].clientY + touches[1].clientY) / 2;
        if (!this.isInPlot(cx, cy)) return;
        e.preventDefault();
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        this.pinchDist0   = Math.hypot(dx, dy);
        this.pinchScaleX0 = this.scaleX;
        this.pinchScaleY0 = this.scaleY;
        this.dragging = false;
      } else if (touches.length === 1) {
        this.downX = touches[0].clientX;
        this.downY = touches[0].clientY;
        if (this.hasAttribute('enabled-zoom') && !this.isInPlot(touches[0].clientX, touches[0].clientY)) {
          this.dragging = false;
          return;
        }
        this.dragging  = true;
        this.dragLastX = touches[0].clientX;
        this.dragLastY = touches[0].clientY;
      }
    }

    @eventShadow('#bc-canvas', 'touchmove', { passive: false })
    private onTouchMove(e: TouchEvent): void {
      const touches = e.touches;
      if (touches.length === 2 && this.pinchDist0 > 0 && this.hasAttribute('enabled-zoom')) {
        e.preventDefault();
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        if (dist === 0) return;
        // 두 손가락 중심을 앵커로 줌 (이전처럼 좌상단 고정 아님)
        const cx = (touches[0].clientX + touches[1].clientX) / 2;
        const cy = (touches[0].clientY + touches[1].clientY) / 2;
        const canvas = this.canvas;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const pr = this.getPlotRect();
        if (!pr) return;
        if (!this.isInPlot(cx, cy)) return;
        const fracX = Math.max(0, Math.min(1, (cx - rect.left - pr.padL) / pr.plotW));
        const fracY = Math.max(0, Math.min(1, 1 - (cy - rect.top - pr.padT) / pr.plotH));
        // 현재 scale 대비 목표 scale 계산 후 zoomAt으로 위임 (앵커 보정 + 클램프 포함)
        const rawFactor = dist / this.pinchDist0;
        const targetSX = Math.min(50, Math.max(1, this.pinchScaleX0 * (1 + (rawFactor - 1) * 0.5)));
        const factor = targetSX / this.scaleX;
        this.zoomAt(factor, fracX, fracY);
        this.draw();
      } else if (touches.length === 1 && this.dragging && this.hasAttribute('enabled-zoom')) {
        // 순수 plot 내부 터치만 팬 처리 — 라벨/축 영역 터치는 페이지 스크롤 허용
        if (!this.isInPlot(touches[0].clientX, touches[0].clientY)) {
          this.dragLastX = touches[0].clientX;
          this.dragLastY = touches[0].clientY;
          return;
        }
        e.preventDefault();
        const b = this.getFitBounds();
        if (!b) return;
        const pr = this.getPlotRect();
        if (!pr) return;
        const dx = touches[0].clientX - this.dragLastX;
        const dy = touches[0].clientY - this.dragLastY;
        this.offsetX += (-dx / pr.plotW) * (b.xFitRange / this.scaleX);
        this.offsetY += ( dy / pr.plotH) * (b.yFitRange / this.scaleY);
        this.dragLastX = touches[0].clientX;
        this.dragLastY = touches[0].clientY;
        this.clampView();
        this.draw();
      }
    }

    @eventShadow('#bc-canvas', 'touchend')
    private onTouchEnd(e: TouchEvent): void {
      const moved = Math.abs(e.changedTouches[0].clientX - this.downX)
                  + Math.abs(e.changedTouches[0].clientY - this.downY);
      const wasPinch = this.pinchDist0 > 0;
      this.pinchDist0 = 0;
      if (this.dragging && !wasPinch && moved < 10) {
        // enabled-zoom 시 plot 밖 탭은 버블 선택으로 처리하지 않음 (라벨 영역 제외)
        if (this.hasAttribute('enabled-zoom') && !this.isInPlot(e.changedTouches[0].clientX, e.changedTouches[0].clientY)) {
          this.dragging = false;
          this.lastTouchEndTime = Date.now();
          return;
        }
        const rect = this.canvas.getBoundingClientRect();
        const hit  = this.hitTest(
          e.changedTouches[0].clientX - rect.left,
          e.changedTouches[0].clientY - rect.top,
        );
        this.selectedIdx = hit === this.selectedIdx ? -1 : hit;
        this.draw();
        this.dispatchEvent(new CustomEvent('bubble-select', {
          detail: this.selectedIdx >= 0 ? this.points[this.selectedIdx] : null,
          bubbles: true,
        }));
      }
      this.dragging = false;
      this.lastTouchEndTime = Date.now();
    }

    // reset()은 public 메서드로 외부에서 호출
  }

  return BubbleChartImpl;
};
