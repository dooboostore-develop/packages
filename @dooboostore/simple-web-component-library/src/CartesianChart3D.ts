import {
  elementDefine,
  eventShadow,
  eventWindow,
  mutationObserverLight,
  onConnectedAfter,
  onConnectedBodyShadow,
  queryShadow,
  resizeObserverLight,
} from '@dooboostore/simple-web-component';

const tagName = 'cartesian-chart-3d';

/** child <vector3d> — 3D 화살표 */
export interface CartesianVector3D {
  x1: number; y1: number; z1: number;
  x2: number; y2: number; z2: number;
  color?: string;
  width?: number;
  label?: string;
  labelColor?: string;
}

/** child <point3d> — 3D 점 */
export interface CartesianPoint3D {
  x: number; y: number; z: number;
  color?: string;
  size?: number;
  label?: string;
  labelColor?: string;
}

/** child <polygon3d> — 3D 다각형 면 (points는 "x,y,z" 나열) */
export interface CartesianPolygon3D {
  points: { x: number; y: number; z: number }[];
  color?: string;
  width?: number;
  fill?: string;
  label?: string;
  labelColor?: string;
}

export interface CartesianChart3D extends HTMLElement {
  reset(): void;
}

export interface CartesianChart3DCtor {
  new (): CartesianChart3D;
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

export default (w: Window): CartesianChart3DCtor => {
  const existing = w.customElements.get(tagName);
  if (existing) return existing as unknown as CartesianChart3DCtor;

  @elementDefine(tagName, { window: w })
  class CartesianChart3DImpl extends w.HTMLElement implements CartesianChart3D {
    private vectors: CartesianVector3D[] = [];
    private points: CartesianPoint3D[] = [];
    private polygons: CartesianPolygon3D[] = [];

    private yaw = 35;
    private pitch = 25;
    private zoom = 1;
    private dragging = false;
    private dragLastX = 0;
    private dragLastY = 0;
    private resizeRaf = 0;

    public reset(): void {
      this.yaw = num(this.getAttribute('yaw'), 35);
      this.pitch = num(this.getAttribute('pitch'), 25);
      this.zoom = 1;
      if (this.canvas) this.draw();
    }

    private collect(): void {
      const vectors: CartesianVector3D[] = [];
      this.querySelectorAll(':scope > vector3d').forEach(el => {
        const v = ['x1', 'y1', 'z1', 'x2', 'y2', 'z2'].map(k => Number(el.getAttribute(k)));
        if (!v.every(Number.isFinite)) return;
        vectors.push({
          x1: v[0], y1: v[1], z1: v[2], x2: v[3], y2: v[4], z2: v[5],
          color: str(el.getAttribute('color')) || '#6366f1',
          width: num(el.getAttribute('width'), 2),
          label: str(el.getAttribute('label')),
          labelColor: str(el.getAttribute('label-color')),
        });
      });
      this.vectors = vectors;

      const points: CartesianPoint3D[] = [];
      this.querySelectorAll(':scope > point3d').forEach(el => {
        const x = Number(el.getAttribute('x')), y = Number(el.getAttribute('y')), z = Number(el.getAttribute('z'));
        if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return;
        points.push({
          x, y, z,
          color: str(el.getAttribute('color')) || '#10b981',
          size: num(el.getAttribute('size'), 4),
          label: str(el.getAttribute('label')),
          labelColor: str(el.getAttribute('label-color')),
        });
      });
      this.points = points;

      const polygons: CartesianPolygon3D[] = [];
      this.querySelectorAll(':scope > polygon3d').forEach(el => {
        const raw = (el.getAttribute('points') || '').trim();
        if (!raw) return;
        const points: { x: number; y: number; z: number }[] = [];
        raw.split(/[\s;|]+/).forEach(triple => {
          const [sx, sy, sz] = triple.split(',');
          const x = Number(sx), y = Number(sy), z = Number(sz);
          if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)) points.push({ x, y, z });
        });
        if (points.length < 3) return;
        polygons.push({
          points,
          color: str(el.getAttribute('color')) || '#6366f1',
          width: num(el.getAttribute('width'), 1.5),
          fill: str(el.getAttribute('fill') || el.getAttribute('fill-style')),
          label: str(el.getAttribute('label')),
          labelColor: str(el.getAttribute('label-color')),
        });
      });
      this.polygons = polygons;
    }

    @onConnectedAfter
    onConnected() {
      this.yaw = num(this.getAttribute('yaw'), 35);
      this.pitch = num(this.getAttribute('pitch'), 25);
      this.collect();
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
          #cc3d-canvas {
            display:block; width:100%; height:100%;
            touch-action:none; cursor:grab;
            background:#fff;
          }
          :host([disabled-drag]) #cc3d-canvas { cursor:default; }
          #cc3d-reset {
            position:absolute; top:6px; right:6px; z-index:2;
            width:26px; height:26px; border-radius:6px;
            border:1px solid #e2e8f0; background:rgba(255,255,255,0.92);
            color:#64748b; font-size:13px; cursor:pointer; line-height:1; padding:0;
          }
          #cc3d-reset:hover { background:#f1f5f9; }
        </style>
        <canvas id="cc3d-canvas"></canvas>
        <button id="cc3d-reset" title="자세 초기화">⟲</button>
      `;
    }

    @queryShadow('#cc3d-canvas')
    private canvas!: HTMLCanvasElement;

    private getExtent(): number {
      const r = this.getAttribute('range');
      if (r != null && r.trim() !== '' && Number.isFinite(Number(r)) && Number(r) > 0) {
        return Number(r);
      }
      let m = 1;
      this.vectors.forEach(v => {
        m = Math.max(m, Math.abs(v.x1), Math.abs(v.y1), Math.abs(v.z1), Math.abs(v.x2), Math.abs(v.y2), Math.abs(v.z2));
      });
      this.points.forEach(p => {
        m = Math.max(m, Math.abs(p.x), Math.abs(p.y), Math.abs(p.z));
      });
      this.polygons.forEach(s => s.points.forEach(p => {
        m = Math.max(m, Math.abs(p.x), Math.abs(p.y), Math.abs(p.z));
      }));
      return m * 1.25;
    }

    private project(x: number, y: number, z: number, view: { cx: number; cy: number; scale: number }) {
      const yawR = (this.yaw * Math.PI) / 180;
      const pitchR = (this.pitch * Math.PI) / 180;
      const cosY = Math.cos(yawR), sinY = Math.sin(yawR);
      const cosP = Math.cos(pitchR), sinP = Math.sin(pitchR);
      const x1 = x * cosY - y * sinY;
      const y1 = x * sinY + y * cosY;
      const y2 = y1 * cosP - z * sinP;
      const z2 = y1 * sinP + z * cosP;
      return { sx: view.cx + x1 * view.scale, sy: view.cy - y2 * view.scale, depth: z2 };
    }

    private haloText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 3;
      ctx.strokeText(text, x, y);
      ctx.fillText(text, x, y);
      ctx.restore();
    }

    private draw(): void {
      const canvas = this.canvas;
      if (!canvas) return;
      const dpr = w.devicePixelRatio || 1;
      const cssW = canvas.clientWidth || 400;
      const cssH = canvas.clientHeight || 300;
      if (cssW < 40 || cssH < 40) return;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const pad = 14;
      const plotW = Math.max(10, cssW - pad * 2);
      const plotH = Math.max(10, cssH - pad * 2);
      const extent = this.getExtent();
      const scale = (Math.min(plotW, plotH) / 2 / extent) * this.zoom;
      const view = { cx: pad + plotW / 2, cy: pad + plotH / 2, scale };

      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, cssW, cssH);

      ctx.save();
      ctx.beginPath();
      ctx.rect(pad, pad, plotW, plotH);
      ctx.clip();

      // 격자 박스 (기본 표시, hide-grid로 숨김)
      if (!this.hasAttribute('hide-grid')) {
        // 판 배경 6면 (matplotlib panes)
        const E0 = extent;
        const faces: [number, number, number][][] = [
          [[-E0, -E0, -E0], [E0, -E0, -E0], [E0, E0, -E0], [-E0, E0, -E0]],
          [[-E0, -E0, E0], [E0, -E0, E0], [E0, E0, E0], [-E0, E0, E0]],
          [[-E0, -E0, -E0], [E0, -E0, -E0], [E0, -E0, E0], [-E0, -E0, E0]],
          [[-E0, E0, -E0], [E0, E0, -E0], [E0, E0, E0], [-E0, E0, E0]],
          [[-E0, -E0, -E0], [-E0, E0, -E0], [-E0, E0, E0], [-E0, -E0, E0]],
          [[E0, -E0, -E0], [E0, E0, -E0], [E0, E0, E0], [E0, -E0, E0]],
        ];
        ctx.fillStyle = '#f4f5f7';
        for (const f of faces) {
          ctx.beginPath();
          f.forEach((p, k) => {
            const s = this.project(p[0], p[1], p[2], view);
            if (k === 0) ctx.moveTo(s.sx, s.sy); else ctx.lineTo(s.sx, s.sy);
          });
          ctx.closePath(); ctx.fill();
        }
        const raw = (2 * extent) / 6;
        const gmag = Math.pow(10, Math.floor(Math.log10(raw)));
        const gnorm = raw / gmag;
        const step = (gnorm >= 5 ? 5 : gnorm >= 2 ? 2 : 1) * gmag;
        const ticks: number[] = [];
        for (let k = Math.ceil(-extent / step); k <= Math.floor(extent / step); k++) {
          ticks.push(Math.round(k * step * 1e9) / 1e9);
        }
        const E = extent;
        const seg = (a: [number, number, number], b: [number, number, number], color: string, width: number) => {
          const s1 = this.project(a[0], a[1], a[2], view);
          const s2 = this.project(b[0], b[1], b[2], view);
          ctx.strokeStyle = color; ctx.lineWidth = width;
          ctx.beginPath(); ctx.moveTo(s1.sx, s1.sy); ctx.lineTo(s2.sx, s2.sy); ctx.stroke();
        };
        // 6면 격자
        for (const v of ticks) {
          if (Math.abs(Math.abs(v) - E) < 1e-9) continue;
          seg([v, -E, -E], [v, E, -E], '#e5e7eb', 1);
          seg([v, -E, E], [v, E, E], '#e5e7eb', 1);
          seg([-E, v, -E], [E, v, -E], '#e5e7eb', 1);
          seg([-E, v, E], [E, v, E], '#e5e7eb', 1);
          seg([-E, -E, v], [E, -E, v], '#e5e7eb', 1);
          seg([-E, E, v], [E, E, v], '#e5e7eb', 1);
          seg([v, -E, -E], [v, -E, E], '#e5e7eb', 1);
          seg([v, E, -E], [v, E, E], '#e5e7eb', 1);
          seg([-E, v, -E], [-E, v, E], '#e5e7eb', 1);
          seg([E, v, -E], [E, v, E], '#e5e7eb', 1);
          seg([-E, -E, v], [-E, E, v], '#e5e7eb', 1);
          seg([E, -E, v], [E, E, v], '#e5e7eb', 1);
        }
        // 박스 테두리 12개
        const C: [number, number, number][] = [
          [-E, -E, -E], [E, -E, -E], [E, E, -E], [-E, E, -E],
          [-E, -E, E], [E, -E, E], [E, E, E], [-E, E, E],
        ];
        const EDGES: [number, number][] = [
          [0, 1], [1, 2], [2, 3], [3, 0],
          [4, 5], [5, 6], [6, 7], [7, 4],
          [0, 4], [1, 5], [2, 6], [3, 7],
        ];
        for (const [i, j] of EDGES) seg(C[i], C[j], '#4b5563', 1);
        // 눈금 (X 앞아래, Y 오른쪽아래, Z 오른쪽)
        ctx.font = '9px -apple-system,sans-serif';
        ctx.fillStyle = '#6b7280';
        const fmtT = (n: number) => String(parseFloat(n.toFixed(2)));
        const tickMark = (p: [number, number, number], text: string, align: CanvasTextAlign, dx: number, dy: number) => {
          const s = this.project(p[0], p[1], p[2], view);
          ctx.fillStyle = '#6b7280';
          ctx.beginPath(); ctx.arc(s.sx, s.sy, 1.5, 0, Math.PI * 2); ctx.fill();
          ctx.textAlign = align;
          ctx.fillText(text, s.sx + dx, s.sy + dy);
        };
        // 6개 모서리에 눈금 (축별 양쪽)
        type EdgeDef = { axis: 0 | 1 | 2; fixed: [number, number]; align: CanvasTextAlign; dx: number; dy: number };
        const tickEdges: EdgeDef[] = [
          { axis: 0, fixed: [-E, -E], align: 'center', dx: 0, dy: 12 },
          { axis: 0, fixed: [E, E], align: 'center', dx: 0, dy: -8 },
          { axis: 1, fixed: [E, -E], align: 'center', dx: 0, dy: 12 },
          { axis: 1, fixed: [-E, E], align: 'center', dx: 0, dy: -8 },
          { axis: 2, fixed: [E, E], align: 'left', dx: 6, dy: 3 },
          { axis: 2, fixed: [-E, -E], align: 'right', dx: -6, dy: 3 },
        ];
        for (const e of tickEdges) {
          for (const v of ticks) {
            const p: [number, number, number] = e.axis === 0 ? [v, e.fixed[0], e.fixed[1]]
              : e.axis === 1 ? [e.fixed[0], v, e.fixed[1]]
              : [e.fixed[0], e.fixed[1], v];
            tickMark(p, fmtT(v), e.align, e.dx, e.dy);
          }
        }
      }

      // 축 (X 빨강, Y 초록, Z 파랑)
      const axes: { p1: [number, number, number]; p2: [number, number, number]; color: string; label: string }[] = [
        { p1: [-extent, 0, 0], p2: [extent, 0, 0], color: '#e5484d', label: 'X' },
        { p1: [0, -extent, 0], p2: [0, extent, 0], color: '#10b981', label: 'Y' },
        { p1: [0, 0, -extent], p2: [0, 0, extent], color: '#3e63dd', label: 'Z' },
      ];
      ctx.lineWidth = 1;
      for (const a of axes) {
        const s1 = this.project(a.p1[0], a.p1[1], a.p1[2], view);
        const s2 = this.project(a.p2[0], a.p2[1], a.p2[2], view);
        ctx.strokeStyle = a.color;
        ctx.beginPath(); ctx.moveTo(s1.sx, s1.sy); ctx.lineTo(s2.sx, s2.sy); ctx.stroke();
        ctx.fillStyle = a.color;
        ctx.font = 'bold 11px -apple-system,sans-serif'; ctx.textAlign = 'left';
        this.haloText(ctx, a.label, s2.sx + 4, s2.sy - 4);
      }

      // polygon3d (면 채우기, 라벨은 무게중심)
      for (const poly of this.polygons) {
        ctx.save();
        ctx.beginPath();
        poly.points.forEach((pt, k) => {
          const s = this.project(pt.x, pt.y, pt.z, view);
          if (k === 0) ctx.moveTo(s.sx, s.sy); else ctx.lineTo(s.sx, s.sy);
        });
        ctx.closePath();
        if (poly.fill) { ctx.fillStyle = poly.fill; ctx.fill(); }
        ctx.strokeStyle = poly.color || '#6366f1';
        ctx.lineWidth = poly.width ?? 1.5;
        ctx.stroke();
        ctx.restore();
        if (poly.label) {
          const cx = poly.points.reduce((s, p) => s + p.x, 0) / poly.points.length;
          const cy = poly.points.reduce((s, p) => s + p.y, 0) / poly.points.length;
          const cz = poly.points.reduce((s, p) => s + p.z, 0) / poly.points.length;
          const s = this.project(cx, cy, cz, view);
          ctx.fillStyle = poly.labelColor || poly.color || '#6366f1';
          ctx.font = 'bold 11px -apple-system,sans-serif'; ctx.textAlign = 'center';
          this.haloText(ctx, poly.label, s.sx, s.sy);
        }
      }

      // 원근 정렬 (먼 것부터)
      type Item =
        | { kind: 'v'; depth: number; v: CartesianVector3D }
        | { kind: 'p'; depth: number; p: CartesianPoint3D };
      const items: Item[] = [
        ...this.vectors.map(v => ({
          kind: 'v' as const,
          depth: (this.project(v.x1, v.y1, v.z1, view).depth + this.project(v.x2, v.y2, v.z2, view).depth) / 2,
          v,
        })),
        ...this.points.map(p => ({
          kind: 'p' as const,
          depth: this.project(p.x, p.y, p.z, view).depth,
          p,
        })),
      ];
      items.sort((m, n) => m.depth - n.depth);

      for (const it of items) {
        if (it.kind === 'v') {
          const v = it.v;
          const s1 = this.project(v.x1, v.y1, v.z1, view);
          const s2 = this.project(v.x2, v.y2, v.z2, view);
          if (Math.hypot(s2.sx - s1.sx, s2.sy - s1.sy) < 2) continue;
          ctx.save();
          ctx.strokeStyle = v.color || '#6366f1';
          ctx.fillStyle = v.color || '#6366f1';
          ctx.lineWidth = v.width ?? 2;
          ctx.beginPath(); ctx.moveTo(s1.sx, s1.sy); ctx.lineTo(s2.sx, s2.sy); ctx.stroke();
          const ang = Math.atan2(s2.sy - s1.sy, s2.sx - s1.sx);
          const h = 8;
          ctx.beginPath();
          ctx.moveTo(s2.sx, s2.sy);
          ctx.lineTo(s2.sx - h * Math.cos(ang - 0.4), s2.sy - h * Math.sin(ang - 0.4));
          ctx.lineTo(s2.sx - h * Math.cos(ang + 0.4), s2.sy - h * Math.sin(ang + 0.4));
          ctx.closePath(); ctx.fill();
          ctx.restore();
          if (v.label) {
            ctx.fillStyle = v.labelColor || v.color || '#6366f1';
            ctx.font = 'bold 11px -apple-system,sans-serif'; ctx.textAlign = 'left';
            this.haloText(ctx, v.label, s2.sx + 6, s2.sy - 6);
          }
        } else {
          const p = it.p;
          const s = this.project(p.x, p.y, p.z, view);
          ctx.save();
          ctx.fillStyle = p.color || '#10b981';
          ctx.beginPath(); ctx.arc(s.sx, s.sy, p.size ?? 4, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
          if (p.label) {
            ctx.fillStyle = p.labelColor || p.color || '#10b981';
            ctx.font = 'bold 11px -apple-system,sans-serif'; ctx.textAlign = 'left';
            this.haloText(ctx, p.label, s.sx + 7, s.sy - 6);
          }
        }
      }

      ctx.restore();
    }

    @eventShadow('#cc3d-canvas', 'mousedown')
    private onMouseDown(e: MouseEvent): void {
      if (this.hasAttribute('disabled-drag')) return;
      this.dragging = true;
      this.dragLastX = e.clientX;
      this.dragLastY = e.clientY;
    }

    @eventShadow('#cc3d-canvas', 'mousemove')
    private onMouseMove(e: MouseEvent): void {
      if (!this.dragging || this.hasAttribute('disabled-drag')) return;
      this.yaw += (e.clientX - this.dragLastX) * 0.4;
      this.pitch -= (e.clientY - this.dragLastY) * 0.4;
      this.dragLastX = e.clientX;
      this.dragLastY = e.clientY;
      this.draw();
    }

    @eventWindow('mouseup')
    private onMouseUp(): void {
      this.dragging = false;
    }

    @eventShadow('#cc3d-canvas', 'mouseleave')
    private onMouseLeave(): void {
      this.dragging = false;
    }

    @eventShadow('#cc3d-canvas', 'wheel', { passive: false })
    private onWheel(e: WheelEvent): void {
      if (this.hasAttribute('disabled-drag')) return;
      e.preventDefault();
      const delta = Math.max(-120, Math.min(120, e.deltaY));
      const factor = Math.exp(-delta * 0.00055 * 8);
      this.zoom = Math.max(0.3, Math.min(5, this.zoom * Math.max(0.94, Math.min(1.06, factor))));
      this.draw();
    }

    @eventShadow('#cc3d-canvas', 'touchstart', { passive: false })
    private onTouchStart(e: TouchEvent): void {
      if (this.hasAttribute('disabled-drag') || e.touches.length !== 1) {
        this.dragging = false;
        return;
      }
      e.preventDefault();
      this.dragging = true;
      this.dragLastX = e.touches[0].clientX;
      this.dragLastY = e.touches[0].clientY;
    }

    @eventShadow('#cc3d-canvas', 'touchmove', { passive: false })
    private onTouchMove(e: TouchEvent): void {
      if (!this.dragging || e.touches.length !== 1 || this.hasAttribute('disabled-drag')) return;
      e.preventDefault();
      this.yaw += (e.touches[0].clientX - this.dragLastX) * 0.4;
      this.pitch -= (e.touches[0].clientY - this.dragLastY) * 0.4;
      this.dragLastX = e.touches[0].clientX;
      this.dragLastY = e.touches[0].clientY;
      this.draw();
    }

    @eventShadow('#cc3d-canvas', 'touchend')
    private onTouchEnd(): void {
      this.dragging = false;
    }

    @eventShadow('#cc3d-reset', 'click')
    private onResetClick(): void {
      this.reset();
    }
  }

  return CartesianChart3DImpl;
};
