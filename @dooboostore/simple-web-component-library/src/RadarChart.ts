import { elementDefine, mutationObserverLight, onConnectedAfter, onConnectedBodyShadow, queryShadow, resizeObserverLight } from "@dooboostore/simple-web-component";

const tagName = "stock-radar";

interface AxisDef {
  id: string;
  label: string;   // 축 이름 (축 끝 라벨)
  color: string;   // 라벨 색
}
interface ScoreSet {
  fill?: string;
  stroke?: string;
  strokeWidth: number;
  scores: Record<string, number>;
}

export interface RadarChart extends HTMLElement {}

export interface RadarChartCtor {
  new (): RadarChart;
}

export default (w: Window): RadarChartCtor => {
  const existing = w.customElements.get(tagName);
  if (existing) return existing as unknown as RadarChartCtor;

  @elementDefine(tagName, { window: w })
  class RadarChartImpl extends w.HTMLElement implements RadarChart {
    private axes: AxisDef[] = [];
    private sets: ScoreSet[] = [];

    // 자식 <axis>로 축 정의, <score-set>/<score>로 오버레이 폴리곤 정의
    private collect(): void {
      const axes: AxisDef[] = [];
      this.querySelectorAll(':scope > axis').forEach((el) => {
        axes.push({
          id: el.getAttribute('id') || el.getAttribute('axis') || `ax${axes.length}`,
          label: el.getAttribute('label') || String(axes.length),
          color: el.getAttribute('color') || '#6366f1',
        });
      });
      this.axes = axes;

      const sets: ScoreSet[] = [];
      this.querySelectorAll(':scope > score-set').forEach((setEl) => {
        const scores: Record<string, number> = {};
        setEl.querySelectorAll(':scope > score').forEach((sc) => {
          const ax = sc.getAttribute('axis');
          const v = Number(sc.getAttribute('value'));
          if (ax && Number.isFinite(v)) scores[ax] = v;
        });
        sets.push({
          fill: setEl.getAttribute('fill-style') || undefined,
          stroke: setEl.getAttribute('stroke-style') || undefined,
          strokeWidth: Number(setEl.getAttribute('stroke-width')) || 1,
          scores,
        });
      });
      this.sets = sets;
    }

    @onConnectedAfter
    onConnected() {
      this.collect();
      if (this.canvas) this.drawRadar();
    }

    // 자식 변경 시 재수집 후 다시 그림
    @mutationObserverLight({ childList: true, attributes: true, subtree: true })
    onMutated() {
      this.collect();
      if (this.canvas) this.drawRadar();
    }

    @onConnectedBodyShadow
    render(): string {
      return `
        <style>
          :host { display: block; }
          #radar-canvas { display: block; width: 100%; height: 100%; }
        </style>
        <canvas id="radar-canvas"></canvas>
      `;
    }

    @resizeObserverLight()
    onHostResize(): void {
      if (this.isConnected) this.drawRadar();
    }

    @queryShadow('#radar-canvas')
    private canvas!: HTMLCanvasElement;

    private drawRadar(): void {
      const canvas = this.canvas;
      const axes = this.axes;
      if (!canvas || axes.length === 0) return;
      const n = axes.length;
      const dpr = w.devicePixelRatio || 1;
      const W = canvas.clientWidth || 360;
      const H = canvas.clientHeight || 360;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.36;
      const angle = (i: number) => -Math.PI / 2 + (Math.PI * 2 * i / n);
      const pt = (i: number, v: number) => [cx + Math.cos(angle(i)) * R * (v / 100), cy + Math.sin(angle(i)) * R * (v / 100)] as const;

      // 그리드 5단계 (20, 40, 60, 80, 100%) + 축선
      const GRID_STEPS = 5;
      const GRID_LABELS = ['20%', '40%', '60%', '80%', '100%'];
      for (let r = 1; r <= GRID_STEPS; r++) {
        const pct = (r / GRID_STEPS) * 100;
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          const [x, y] = pt(i, pct);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = r === GRID_STEPS ? '#c8cdd6' : '#eef0f4';
        ctx.lineWidth = r === GRID_STEPS ? 1.5 : 1;
        ctx.stroke();

        // 12시 방향 축(i=0)을 기준으로 퍼센트 라벨 표기
        const [lx, ly] = pt(0, pct);
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = '#b0b8c6';
        ctx.fillText(GRID_LABELS[r - 1], lx, ly - 2);
      }

      // 축선
      ctx.strokeStyle = '#eef0f4';
      ctx.lineWidth = 1;
      for (let i = 0; i < n; i++) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        const [x, y] = pt(i, 100);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      // score-set 별 오버레이 폴리곤 (정의 순서대로)
      for (const set of this.sets) {
        ctx.beginPath();
        axes.forEach((a, i) => {
          const v = set.scores[a.id] ?? 50;
          const [x, y] = pt(i, v);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.closePath();
        if (set.fill) { ctx.fillStyle = set.fill; ctx.fill(); }
        if (set.stroke) { ctx.strokeStyle = set.stroke; ctx.lineWidth = set.strokeWidth; ctx.stroke(); }
      }

      // 축 라벨 (label + color, \n 개행 지원)
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const lineHeight = 13;
      axes.forEach((a, i) => {
        const lines = a.label.split('\n');
        const [x, y] = pt(i, 120);
        const totalH = lines.length * lineHeight;
        ctx.font = 'bold 10px sans-serif';
        ctx.fillStyle = a.color;
        lines.forEach((line, li) => {
          ctx.fillText(line, x, y - totalH / 2 + li * lineHeight + lineHeight / 2);
        });
      });
    }
  }

  return RadarChartImpl;
};
