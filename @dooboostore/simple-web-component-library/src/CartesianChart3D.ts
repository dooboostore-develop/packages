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

// ── 3×3 열우선 회전 행렬 유틸 ──────────────────────────────────────────
// mat3 = [m00,m10,m20, m01,m11,m21, m02,m12,m22]  (열-우선)
type Mat3 = [number,number,number, number,number,number, number,number,number];

function mat3Identity(): Mat3 {
  return [1,0,0, 0,1,0, 0,0,1];
}

/** 두 행렬 곱 C = A * B */
function mat3Mul(A: Mat3, B: Mat3): Mat3 {
  const r = mat3Identity();
  for (let c = 0; c < 3; c++) {
    for (let rr = 0; rr < 3; rr++) {
      let s = 0;
      for (let k = 0; k < 3; k++) s += A[k * 3 + rr] * B[c * 3 + k];
      r[c * 3 + rr] = s;
    }
  }
  return r;
}

/** 로컬 Y축(화면 수직) 주위 각도(라디안) 회전 행렬 */
function mat3RotY(a: number): Mat3 {
  const c = Math.cos(a), s = Math.sin(a);
  return [c,0,-s, 0,1,0, s,0,c];
}

/** 로컬 X축(화면 수평) 주위 각도(라디안) 회전 행렬 */
function mat3RotX(a: number): Mat3 {
  const c = Math.cos(a), s = Math.sin(a);
  return [1,0,0, 0,c,s, 0,-s,c];
}

/** 로컬 Z축(화면 깊이) 주위 각도(라디안) 회전 행렬 */
function mat3RotZ(a: number): Mat3 {
  const c = Math.cos(a), s = Math.sin(a);
  return [c,s,0, -s,c,0, 0,0,1];
}

/** 행렬로 벡터 변환 */
function mat3Vec(m: Mat3, x: number, y: number, z: number): [number,number,number] {
  return [
    m[0]*x + m[3]*y + m[6]*z,
    m[1]*x + m[4]*y + m[7]*z,
    m[2]*x + m[5]*y + m[8]*z,
  ];
}

/** yaw(도), pitch(도), roll(도)로 초기 행렬 생성.
 *  순서: yaw(Z-up 방향, 월드 Y축), pitch(로컬 X축), roll(로컬 Z축) */
function mat3FromEuler(yawDeg: number, pitchDeg: number, rollDeg: number): Mat3 {
  const toR = Math.PI / 180;
  const Ry = mat3RotY(yawDeg * toR);
  const Rx = mat3RotX(pitchDeg * toR);
  const Rz = mat3RotZ(rollDeg * toR);
  // 적용 순서: 먼저 Ry, 그 다음 Rx, 그 다음 Rz
  return mat3Mul(Rz, mat3Mul(Rx, Ry));
}

/** 행렬 정규직교화 (부동소수점 드리프트 방지) */
function mat3Orthonormalize(m: Mat3): Mat3 {
  // Gram-Schmidt: 열0, 열1, 열2
  let x0=m[0],x1=m[1],x2=m[2];
  let y0=m[3],y1=m[4],y2=m[5];
  let z0=m[6],z1=m[7],z2=m[8];
  // 열0 정규화
  let len = Math.hypot(x0,x1,x2)||1; x0/=len; x1/=len; x2/=len;
  // 열1에서 열0 성분 제거 후 정규화
  const dot01 = y0*x0+y1*x1+y2*x2;
  y0-=dot01*x0; y1-=dot01*x1; y2-=dot01*x2;
  len = Math.hypot(y0,y1,y2)||1; y0/=len; y1/=len; y2/=len;
  // 열2 = 열0 × 열1
  z0=x1*y2-x2*y1; z1=x2*y0-x0*y2; z2=x0*y1-x1*y0;
  return [x0,x1,x2, y0,y1,y2, z0,z1,z2];
}

export default (w: Window): CartesianChart3DCtor => {
  const existing = w.customElements.get(tagName);
  if (existing) return existing as unknown as CartesianChart3DCtor;

  @elementDefine(tagName, { window: w })
  class CartesianChart3DImpl extends w.HTMLElement implements CartesianChart3D {
    private vectors: CartesianVector3D[] = [];
    private points: CartesianPoint3D[] = [];
    private polygons: CartesianPolygon3D[] = [];

    /** 현재 뷰 회전 행렬 (월드→카메라 로컬 변환).
     *  드래그/터치/roll 모두 이 행렬을 왼쪽 곱해서 누적. */
    private viewMat: Mat3 = mat3Identity();
    private zoom = 1;
    private dragging = false;
    private dragLastX = 0;
    private dragLastY = 0;
    private pinchLastDist = 0;
    private pinchLastAngle = 0;
    private resizeRaf = 0;

    public reset(): void {
      const yaw   = num(this.getAttribute('yaw'),   35);
      const pitch = num(this.getAttribute('pitch'), 25);
      const roll  = num(this.getAttribute('roll'),   0);
      this.viewMat = mat3FromEuler(yaw, pitch, roll);
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
      console.info('[cc3d] orbit=matrix build=20260908d');
      const yaw   = num(this.getAttribute('yaw'),   35);
      const pitch = num(this.getAttribute('pitch'), 25);
      const roll  = num(this.getAttribute('roll'),   0);
      this.viewMat = mat3FromEuler(yaw, pitch, roll);
      this.collect();
      if (this.canvas) this.draw();
      this.railThumbAll();
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
        this.railThumbAll();
      });
    }

    @onConnectedBodyShadow
    render(): string {
      return `
        <style>
          :host { display:block; position:relative; height:var(--cc-canvas-height, 320px); }
          #cc3d-wrap { display:flex; flex-direction:column; width:100%; height:100%; }
          #cc3d-mid { display:flex; flex:1; min-height:0; }
          #cc3d-stage { position:relative; flex:1; min-width:0; }
          #cc3d-canvas {
            display:block; width:100%; height:100%;
            touch-action:none; cursor:grab;
            background:#fff;
          }
          :host([disabled-drag]) #cc3d-canvas { cursor:default; }
          .rail { position:relative; touch-action:none; user-select:none; -webkit-user-select:none; cursor:pointer; display:none; }
          .rail .track { position:absolute; inset:0; background:rgba(15,23,42,0.18); border-radius:7px; }
          .thumb {
            position:absolute; background:#fff; border:1px solid #cbd5e1; border-radius:6px;
            box-shadow:0 1px 4px rgba(0,0,0,0.25);
          }
          .thumb.snap { transition:left .18s ease, top .18s ease; }
          #rail-x { height:14px; margin:4px 2px 0; }
          #rail-x .thumb { top:2px; bottom:2px; width:22px; }
          #rail-r { height:14px; margin:0 2px 4px; }
          #rail-r .thumb { top:2px; bottom:2px; width:22px; }
          .rail.v { width:14px; margin:0 2px; align-self:stretch; flex-shrink:0; }
          .rail.v .thumb { left:2px; right:2px; height:22px; }
          :host([hide-controls]) .rail { display:none; }
          :host([show-rail-controller]) #rail-r,
          :host([show-rail-controller]) #rail-x { display:block; }
          :host([show-rail-controller]) #rail-y,
          :host([show-rail-controller]) #rail-z { display:flex; }
          #cc3d-reset {
            position:absolute; top:6px; right:6px; z-index:2;
            width:26px; height:26px; border-radius:6px;
            border:1px solid #e2e8f0; background:rgba(255,255,255,0.92);
            color:#64748b; font-size:13px; cursor:pointer; line-height:1; padding:0;
          }
          #cc3d-reset:hover { background:#f1f5f9; }
        </style>
        <div id="cc3d-wrap">
          <div class="rail" id="rail-r" data-kind="r" title="화면 회전(roll)"><div class="track"></div><div class="thumb"></div></div>
          <div id="cc3d-mid">
            <div class="rail v" id="rail-z" data-kind="z" title="줌 인/아웃"><div class="track"></div><div class="thumb"></div></div>
            <div id="cc3d-stage">
              <canvas id="cc3d-canvas"></canvas>
              <button id="cc3d-reset" title="자세 초기화">⟲</button>
            </div>
            <div class="rail v" id="rail-y" data-kind="y" title="상하 회전"><div class="track"></div><div class="thumb"></div></div>
          </div>
          <div class="rail" id="rail-x" data-kind="x" title="좌우 회전"><div class="track"></div><div class="thumb"></div></div>
        </div>
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
      // viewMat: 월드 좌표 → 카메라 로컬 좌표
      // 카메라 로컬: X=화면 오른쪽, Y=화면 위쪽, Z=카메라 앞(깊이)
      const [cx, cy, cz] = mat3Vec(this.viewMat, x, y, z);
      return {
        sx: view.cx + cx * view.scale,
        sy: view.cy - cy * view.scale,
        depth: cz,
      };
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

    /** 화면 기준 드래그(dx=화면 오른쪽, dy=화면 아래)를 카메라 로컬 축으로 회전 (카메라식).
     *  - 카메라는 드래그를 따라가고 내용은 반대로: 오른쪽 드래그 → 카메라는 오른쪽으로, 내용은 왼쪽으로
     *  - 항상 현재 보이는 화면 기준이므로 앞면/뒷면/뒤집힘/roll 무관하게 직관적. */
    private orbitBy(dx: number, dy: number): void {
      const sens = 0.4 * (Math.PI / 180);
      // 카메라 로컬 Y축 주위(좌우): 월드 기준으로는 현재 viewMat의 Y열
      const Ry = mat3RotY(dx * sens);
      // 카메라 로컬 X축 주위(상하): 월드 기준으로는 현재 viewMat의 X열
      const Rx = mat3RotX(dy * sens);
      // 카메라 공간에서 먼저 Rx, 그 다음 Ry 적용 (왼쪽 곱 = 카메라 로컬 회전)
      this.viewMat = mat3Orthonormalize(mat3Mul(mat3Mul(Ry, Rx), this.viewMat));
    }

    /** 두 손가락 트위스트: 화면 Z축(깊이) 주위 roll */
    private rollBy(dAngleDeg: number): void {
      const Rz = mat3RotZ(dAngleDeg * (Math.PI / 180));
      this.viewMat = mat3Orthonormalize(mat3Mul(Rz, this.viewMat));
    }

    // ── 조그 스크롤 (위:roll, 아래:X축 회전, 오른쪽:Y축 회전, 왼쪽:줌. 가운데 기본, 놓으면 복귀) ──
    private railVal = { x: 0, y: 0, z: 0, r: 0 };
    private railDrag: { kind: 'x' | 'y' | 'z' | 'r'; last: number } | null = null;

    private railEl(kind: 'x' | 'y' | 'z' | 'r'): HTMLElement | null {
      return this.shadowRoot?.querySelector(`#rail-${kind}`) as HTMLElement | null;
    }

    private railThumb(kind: 'x' | 'y' | 'z' | 'r'): void {
      const rail = this.railEl(kind);
      const thumb = rail?.querySelector('.thumb') as HTMLElement | null;
      if (!rail || !thumb) return;
      const f = Math.max(-1, Math.min(1, this.railVal[kind] / 100));
      if (kind === 'x' || kind === 'r') {
        const W = rail.clientWidth, half = Math.max(0, (W - 22) / 2);
        thumb.style.left = `${(W - 22) / 2 + f * half}px`;
      } else {
        const H = rail.clientHeight, half = Math.max(0, (H - 22) / 2);
        thumb.style.top = `${(H - 22) / 2 + f * half}px`;
      }
    }

    private railThumbAll(): void {
      this.railThumb('x'); this.railThumb('y'); this.railThumb('z'); this.railThumb('r');
    }

    private railValueFromPos(kind: 'x' | 'y' | 'z' | 'r', clientX: number, clientY: number): number {
      const rail = this.railEl(kind);
      if (!rail) return 0;
      const r = rail.getBoundingClientRect();
      const ratio = (kind === 'x' || kind === 'r')
        ? (clientX - r.left) / Math.max(1, r.width)
        : (clientY - r.top) / Math.max(1, r.height);
      return Math.max(-100, Math.min(100, ratio * 200 - 100));
    }

    private railOf(e: Event): { rail: HTMLElement; kind: 'x' | 'y' | 'z' | 'r' } | null {
      const rail = (e.target as HTMLElement)?.closest?.('.rail') as HTMLElement | null;
      if (!rail) return null;
      const kind = rail.dataset.kind as 'x' | 'y' | 'z' | 'r';
      if (kind !== 'x' && kind !== 'y' && kind !== 'z' && kind !== 'r') return null;
      return { rail, kind };
    }

    @eventShadow('.rail', 'pointerdown')
    private onRailDown(e: PointerEvent): void {
      const found = this.railOf(e);
      if (!found) return;
      const { rail, kind } = found;
      try { rail.setPointerCapture(e.pointerId); } catch {}
      const thumb = rail.querySelector('.thumb') as HTMLElement | null;
      thumb?.classList.remove('snap');
      const v = this.railValueFromPos(kind, e.clientX, e.clientY);
      this.railVal[kind] = v;
      this.railDrag = { kind, last: v };
      this.railThumb(kind);
    }

    @eventShadow('.rail', 'pointermove')
    private onRailMove(e: PointerEvent): void {
      if (!this.railDrag) return;
      const { kind, last } = this.railDrag;
      const v = this.railValueFromPos(kind, e.clientX, e.clientY);
      const d = v - last;
      if (d === 0) return;
      this.railVal[kind] = v;
      this.railDrag.last = v;
      // X스크롤 = 좌우 움직임(yaw 계열), Y스크롤 = 상하 움직임(pitch 계열). Thumb 방향 = 내용 방향.
      if (kind === 'x') this.orbitBy(d, 0);
      else if (kind === 'y') this.orbitBy(0, d);
      else if (kind === 'r') this.rollBy(d * 1.2);
      else this.zoom = Math.max(0.3, Math.min(5, this.zoom * (1 - d * 0.004)));
      this.railThumb(kind);
      this.draw();
    }

    private railRelease(): void {
      if (!this.railDrag) return;
      const { kind } = this.railDrag;
      this.railDrag = null;
      this.railVal[kind] = 0;
      const rail = this.railEl(kind);
      const thumb = rail?.querySelector('.thumb') as HTMLElement | null;
      thumb?.classList.add('snap');
      this.railThumb(kind);
    }

    @eventShadow('.rail', 'pointerup')
    private onRailUp(): void {
      this.railRelease();
    }

    @eventShadow('.rail', 'pointercancel')
    private onRailCancel(): void {
      this.railRelease();
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
      this.orbitBy(e.clientX - this.dragLastX, e.clientY - this.dragLastY);
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

    private touchDist(a: Touch, b: Touch): number {
      return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    }

    private touchAngle(a: Touch, b: Touch): number {
      return (Math.atan2(a.clientY - b.clientY, a.clientX - b.clientX) * 180) / Math.PI;
    }

    @eventShadow('#cc3d-canvas', 'touchstart', { passive: false })
    private onTouchStart(e: TouchEvent): void {
      if (this.hasAttribute('disabled-drag')) return;
      e.preventDefault();
      if (e.touches.length === 2) {
        // 두 손가락 시작: 핀치(줌) + 트위스트(회전) 기준점 저장, 한 손 드래그는 중단
        this.dragging = false;
        this.pinchLastDist = this.touchDist(e.touches[0], e.touches[1]);
        this.pinchLastAngle = this.touchAngle(e.touches[0], e.touches[1]);
        return;
      }
      if (e.touches.length !== 1) {
        this.dragging = false;
        return;
      }
      this.dragging = true;
      this.dragLastX = e.touches[0].clientX;
      this.dragLastY = e.touches[0].clientY;
    }

    @eventShadow('#cc3d-canvas', 'touchmove', { passive: false })
    private onTouchMove(e: TouchEvent): void {
      if (this.hasAttribute('disabled-drag')) return;
      e.preventDefault();
      if (e.touches.length === 2) {
        // 핀치 줌 + 두 손가락 트위스트 회전
        const dist = this.touchDist(e.touches[0], e.touches[1]);
        const angle = this.touchAngle(e.touches[0], e.touches[1]);
        if (this.pinchLastDist > 0 && dist > 0) {
          this.zoom = Math.max(0.3, Math.min(5, this.zoom * (dist / this.pinchLastDist)));
        }
        let dAngle = angle - this.pinchLastAngle;
        if (dAngle > 180) dAngle -= 360;
        else if (dAngle < -180) dAngle += 360;
        // 두 손가락 비틀기 = 화면 내 회전(roll, 시계방향 +가 화면 시계방향 추종)
        this.rollBy(-dAngle);
        this.pinchLastDist = dist;
        this.pinchLastAngle = angle;
        this.dragging = false;
        this.draw();
        return;
      }
      if (!this.dragging || e.touches.length !== 1) return;
      this.orbitBy(e.touches[0].clientX - this.dragLastX, e.touches[0].clientY - this.dragLastY);
      this.dragLastX = e.touches[0].clientX;
      this.dragLastY = e.touches[0].clientY;
      this.draw();
    }

    @eventShadow('#cc3d-canvas', 'touchend')
    private onTouchEnd(e: TouchEvent): void {
      this.pinchLastDist = 0;
      // 두 손가락에서 한 손가락으로 줄면 남은 손가락으로 드래그 이어가기
      if (e.touches.length === 1 && !this.hasAttribute('disabled-drag')) {
        this.dragging = true;
        this.dragLastX = e.touches[0].clientX;
        this.dragLastY = e.touches[0].clientY;
      } else {
        this.dragging = false;
      }
    }

    @eventShadow('#cc3d-canvas', 'touchcancel')
    private onTouchCancel(): void {
      this.dragging = false;
      this.pinchLastDist = 0;
    }

    @eventShadow('#cc3d-reset', 'click')
    private onResetClick(): void {
      this.reset();
    }
  }

  return CartesianChart3DImpl;
};
