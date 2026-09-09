import {
  changedAttribute,
  elementDefine,
  eventShadow,
  eventWindow,
  mutationObserverLight,
  onConnectedAfter,
  onConnectedBodyShadow,
  onDisconnected,
  queryShadow,
  resizeObserverLight
} from "@dooboostore/simple-web-component";
import { computeMacdSeries, computeRsiSeries, computeObvSeries, computeSmaSeries } from '@dooboostore/algorithm';

/** OBV 설정 — 자식 <obv><line color=".."/></obv> 로 지정 (파라미터 없음) */
export interface ObvConfig {
  lineColor: string;
}

const tagName = "stock-chart";

/** 캔들 데이터 한 건 — 자식 <line>/<tooltip> 포함 가능 (건별 B/S) */
export interface StockChartPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  lines?: { width: number; color: string }[];
  tooltips?: { position: 'top' | 'bottom' | 'candle-top' | 'candle-bottom'; color?: string; fillColor?: string; lineColor?: string; labelColor?: string; label: string; lineWidth?: number }[];
  // 하위 호환 단일 필드
  line?: { width: number; color: string };
  tooltip?: { position: 'top' | 'bottom' | 'candle-top' | 'candle-bottom'; color?: string; fillColor?: string; labelColor?: string; label: string; lineWidth?: number; lineColor?: string };
}

/** 자식 <rect>/<arc> 로 그려지는 오버레이 도형 (캔버스 픽셀 좌표) */
export interface ChartShapeBase {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  /** 외곽선 점선 패턴 (예: [5,5]) — rect 외곽선에만 적용 */
  dash?: number[];
  target?: 'candle' | 'volume' | 'all';
  /** rect 상하 여백 (px) — 영역 rect와 구분용 인셋 */
  marginTop?: number;
  marginBottom?: number;
  /** rect 좌상단 라벨 텍스트 + 색상 */
  label?: string;
  color?: string;
}
export type ChartShape =
  | (ChartShapeBase & { type: 'rect'; x: number; y: number; width: number; height: number })
  | (ChartShapeBase & { type: 'arc'; x: number; y: number; r: number; start: number; end: number })
  // 날짜 기반 rect — x는 date-start/date-end 캔들 위치, y는 전체 가격 범위 자동 계산
  | (ChartShapeBase & { type: 'rect-date'; dateStart: string; dateEnd: string });

function num(v: string | null | undefined): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** 지표 패널 y축 라벨 — 크기별 자릿수 조절 */
function fmtInd(v: number): string {
  const a = Math.abs(v);
  if (a >= 1000) return Math.round(v).toLocaleString();
  if (a >= 100) return v.toFixed(1);
  if (a >= 1) return v.toFixed(2);
  if (a === 0) return '0';
  return v.toFixed(3);
}

/** 큰 수 압축 (억/만, 음수 포함) */
function fmtBig(v: number): string {
  const a = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (a >= 100000000) return `${sign}${(a / 100000000).toFixed(1)}억`;
  if (a >= 10000) return `${sign}${Math.round(a / 10000).toLocaleString()}만`;
  return Math.round(v).toLocaleString();
}

/** MACD 설정 — 자식 <macd><fast/><slow/><signal/></macd> 로 지정 (기본 12/26/9) */
export interface MacdConfig {
  fast: number;
  slow: number;
  signal: number;
  fastColor: string;
  signalColor: string;
}

/** RSI 설정 — 자식 <rsi period="14"><line/><overbought/><oversold/></rsi> 로 지정 */
export interface RsiConfig {
  period: number;
  lineColor: string;
  overbought: { level: number; color: string };
  oversold: { level: number; color: string };
}

/** 종가 배열 → RSI (Wilder 스무딩, 전체 구간 기준이라 줌과 무관) */
/** 종가·거래량 배열 → OBV (누적, 전체 구간 기준이라 줌과 무관) */
/** 캔들 1건의 OHLCV + 현재 설정 기준 지표값 */
export interface CandleInfo {
  index: number;
  candle: { date: string; open: number; high: number; low: number; close: number; volume: number };
  ma: { period: number; color: string; value: number | null; slope: number | null }[];
  macd: { fast: number; slow: number; signalPeriod: number; value: number; signal: number; hist: number; histSlope: number | null } | null;
  rsi: { period: number; value: number } | null;
  obv: { value: number } | null;
}

/** 인덱스 기준 CandleInfo 조립 (순수 함수) */
export function buildCandleInfo(
  index: number,
  points: StockChartPoint[],
  mas: Array<{ color: string; period: number }>,
  sma: Map<number, (number | null)[]>,
  macdCfg: MacdConfig | null,
  macd: { macd: number[]; signal: number[]; hist: number[] } | null,
  rsiCfg: RsiConfig | null,
  rsi: number[] | null,
  obvCfg: ObvConfig | null,
  obv: number[] | null,
): CandleInfo | null {
  const d = points[index];
  if (!d) return null;
  const maSlopeOf = (arr: (number | null)[] | undefined): number | null => {
    const v = arr?.[index] ?? null;
    const pv = arr?.[index - 1] ?? null;
    return v != null && pv != null && pv !== 0 ? ((v - pv) / pv) * 100 : null;
  };
  return {
    index,
    candle: { date: d.date, open: d.open, high: d.high, low: d.low, close: d.close, volume: d.volume },
    ma: mas.map(m => {
      const arr = sma.get(m.period);
      return { period: m.period, color: m.color, value: arr?.[index] ?? null, slope: maSlopeOf(arr) };
    }),
    macd: macdCfg && macd
      ? { fast: macdCfg.fast, slow: macdCfg.slow, signalPeriod: macdCfg.signal, value: macd.macd[index], signal: macd.signal[index], hist: macd.hist[index], histSlope: index > 0 ? macd.hist[index] - macd.hist[index - 1] : null }
      : null,
    rsi: rsiCfg && rsi ? { period: rsiCfg.period, value: rsi[index] } : null,
    obv: obvCfg && obv ? { value: obv[index] } : null,
  };
}

export interface StockChart extends HTMLElement {
  /** 외부에서 데이터 주입 (tick 요소 대신 사용 가능) */
  setData(points: StockChartPoint[]): void;
  /** 프로그래밍 방식 뷰(줌/포커스) 지정 — 캔들 인덱스 양쪽 포함 */
  setView(start: number, end: number): void;
  /** 캔들 1건 조회 — 날짜 문자열 또는 인덱스, 없으면 null */
  getCandleInfo(key: string | number): CandleInfo | null;
  /** 캔들 여러 건 조회 — 인자 없으면 전체, 찾은 것만 배열로 */
  getCandleInfos(keys?: (string | number)[]): CandleInfo[];
  /** name 속성(없으면 date)으로 1건 조회 — 첫 매칭, 없으면 null */
  getCandleInfoByName(name: string): CandleInfo | null;
  /** name 속성(없으면 date)으로 여러 건 조회 — 인자 없으면 전체, 찾은 것만 배열로 */
  getCandleInfoByNames(names?: string[]): CandleInfo[];
}

/** 자식 <candle>/<tick> — .value로 지표 포함 정보 조회 */
export interface StockChartCandle extends HTMLElement {
  value: CandleInfo | null;
}

export interface StockChartCtor {
  new (): StockChart;
}

export default (w: Window): StockChartCtor => {
  const existing = w.customElements.get(tagName);
  if (existing) return existing as unknown as StockChartCtor;

  @elementDefine(tagName, { window: w })
  class StockChartImpl extends w.HTMLElement implements StockChart {
    // ---------- 상태 ----------
    private points: StockChartPoint[] = [];
    private shapes: ChartShape[] = [];
    private mas: Array<{ color: string; period: number }> = [];
    private viewStart: number = 0;
    private viewEnd: number = 0;
    private selectedIdx: number = -1;
    private viewInitDone: boolean = false;
    private showCloseLine: boolean = false;
    private showVolume: boolean = false;
    private macd: MacdConfig | null = null;
    private macdCache: { macd: number[]; signal: number[]; hist: number[] } | null = null;
    private rsi: RsiConfig | null = null;
    private rsiCache: number[] | null = null;
    private obv: ObvConfig | null = null;
    private obvCache: number[] | null = null;
    // 지표 시리즈 캐시 (데이터/설정 변경 시 dirty)
    private seriesDirty: boolean = true;
    private series: {
      sma: Map<number, (number | null)[]>;
      macd: { macd: number[]; signal: number[]; hist: number[] } | null;
      rsi: number[] | null;
      obv: number[] | null;
    } | null = null;
    private showMinMax: boolean = false;
    private showLastLine: boolean = false;
    private controlsEnabled: boolean = false;
    private readoutEnabled: boolean = false;
    private hiddenXLabel: boolean = false;
    private hiddenYLabel: boolean = false;

    // show-close-line 속성 변경 시 호출 (기본값: 안 보임)
    @changedAttribute('show-close-line', { type: Boolean })
    onShowCloseLineChanged(value: boolean) {
      this.showCloseLine = !!value;
      if (this.chartCanvas) this.drawChart();
    }

    // 자식 <volume> 요소 — 있으면 거래량 영역 표시 (기본값: 숨김)
    private collectVolume(): void {
      this.showVolume = !!this.querySelector(':scope > volume');
    }

    // 자식 <macd> 요소 — 있으면 MACD 영역 표시 (기본값: 숨김)
    // <macd><fast period="12" color=".."/><slow period="26"/><signal period="9" color=".."/></macd>
    // slow는 period만 사용 (슬로우선은 그리지 않음)
    private collectMacd(): void {
      const el = this.querySelector(':scope > macd');
      if (!el) {
        this.macd = null;
        this.seriesDirty = true;
        return;
      }
      const attr = (name: string, an: string, fb: string): string =>
        el.querySelector(`:scope > ${name}`)?.getAttribute(an) || fb;
      const per = (name: string, fb: number): number =>
        Math.max(2, Math.round(Number(attr(name, 'period', String(fb))) || fb));
      const fast = per('fast', 12);
      let slow = per('slow', 26);
      if (slow <= fast) slow = fast + 1; // 역전 시 퇴화 방지
      this.macd = {
        fast,
        slow,
        signal: per('signal', 9),
        fastColor: attr('fast', 'color', '#e5484d'),
        signalColor: attr('signal', 'color', '#f59e0b'),
      };
      this.seriesDirty = true;
    }

    // 자식 <rsi> 요소 — 있으면 RSI 영역 표시 (기본값: 숨김)
    // <rsi period="14"><line color=".."/><overbought level="70" color=".."/><oversold level="30" color=".."/></rsi>
    private collectRsi(): void {
      const el = this.querySelector(':scope > rsi');
      if (!el) {
        this.rsi = null;
        this.seriesDirty = true;
        return;
      }
      const child = (name: string): Element | null => el.querySelector(`:scope > ${name}`);
      const lv = (name: string, fb: number): number => {
        const c = child(name);
        const raw = c ? (c.getAttribute('level') ?? c.getAttribute('value')) : null;
        const v = Number(raw);
        return raw != null && Number.isFinite(v) && v > 0 && v < 100 ? v : fb;
      };
      let ob = lv('overbought', 70);
      let os = lv('oversold', 30);
      if (ob <= os) { ob = 70; os = 30; } // 역전 시 기본값으로 복원
      this.rsi = {
        period: Math.max(2, Math.round(Number(el.getAttribute('period')) || 14)),
        lineColor: child('line')?.getAttribute('color') || '#7c3aed',
        overbought: { level: ob, color: child('overbought')?.getAttribute('color') || '#e5484d' },
        oversold: { level: os, color: child('oversold')?.getAttribute('color') || '#3e63dd' },
      };
      this.seriesDirty = true;
    }

    // 자식 <obv> 요소 — 있으면 OBV 영역 표시 (기본값: 숨김)
    // <obv><line color=".."/></obv>
    private collectObv(): void {
      const el = this.querySelector(':scope > obv');
      if (!el) {
        this.obv = null;
        this.seriesDirty = true;
        return;
      }
      this.obv = {
        lineColor: el.querySelector(':scope > line')?.getAttribute('color') || '#0ea5e9',
      };
      this.seriesDirty = true;
    }

    // show-min-max 속성 — true면 최고/최저 툴팁 표시 (기본값: 안 보임)
    @changedAttribute('show-min-max', { type: Boolean })
    onShowMinMaxChanged(value: boolean) {
      this.showMinMax = !!value;
      if (this.chartCanvas) this.drawChart();
    }

    // show-last-line 속성 — true면 마지막 종가 가로점선 + 태그 표시 (기본값: 안 보임)
    @changedAttribute('show-last-line', { type: Boolean })
    onShowLastLineChanged(value: boolean) {
      this.showLastLine = !!value;
      if (this.chartCanvas) this.drawChart();
    }

    // enabled-control 속성 — true면 드래그 이동/휠 줌/핀치 등 제어 활성화 (기본값: 비활성)
    @changedAttribute('enabled-control', { type: Boolean })
    onEnabledControlChanged(value: boolean) {
      this.controlsEnabled = !!value;
    }

    // enabled-readout 속성 — true면 클릭/탭 시 캔들 정보(리드아웃) 표시 (기본값: 비활성)
    @changedAttribute('enabled-readout', { type: Boolean })
    onEnabledReadoutChanged(value: boolean) {
      this.readoutEnabled = !!value;
    }

    // hidden-x-label — true면 x축(날짜) 라벨 숨김 (기본값: 보임)
    @changedAttribute('hidden-x-label', { type: Boolean })
    onHiddenXLabelChanged(value: boolean) {
      this.hiddenXLabel = !!value;
      if (this.chartCanvas) this.drawChart();
    }

    // hidden-y-label — true면 y축(가격/거래량 수치) 라벨 숨김 (기본값: 보임)
    @changedAttribute('hidden-y-label', { type: Boolean })
    onHiddenYLabelChanged(value: boolean) {
      this.hiddenYLabel = !!value;
      if (this.chartCanvas) this.drawChart();
    }

    private disabledEvent: boolean = false;

    // disabled-event 속성 — true면 모든 포인터/터치/휠 이벤트 리스너를 무시 (기본값: 활성)
    @changedAttribute('disabled-event', { type: Boolean })
    onDisabledEventChanged(value: boolean) {
      this.disabledEvent = !!value;
    }

    private dragLastX: number = 0;
    private dragging: boolean = false;
    private downX: number = 0;
    private downY: number = 0;
    private pinchDist0: number = 0;
    private pinchSpan0: number = 0;
    private pinchAnchorFrac: number = 0.5;
    private pinchViewStart0: number = 0;
    private readonly padL: number = 6;
    private readonly padR: number = 58;
    /** 모바일 touchend 후 합성 mouseup 이벤트로 팝업이 닫히는 것을 방지하는 타임스탬프 */
    private lastTouchEndTime: number = 0;

    // ---------- public ----------

    setData(points: StockChartPoint[]): void {
      this.points = points || [];
      this.viewInitDone = false;
      this.selectedIdx = -1;
      this.seriesDirty = true;
      if (this.isConnected) {
        this.setupChart();
      }
    }

    setView(start: number, end: number): void {
      const n = this.points.length;
      if (!n) return;
      const s = Math.max(0, Math.min(Math.floor(start), n - 1));
      const e = Math.max(s, Math.min(Math.ceil(end), n - 1));
      this.viewStart = s;
      this.viewEnd = e;
      this.viewInitDone = true;
      if (this.isConnected) {
        this.drawChart();
      }
    }

    getCandleInfo(key: string | number): CandleInfo | null {
      const idx = typeof key === 'number'
        ? (Number.isInteger(key) ? key : -1)
        : this.points.findIndex(d => d.date === key);
      if (idx < 0 || idx >= this.points.length) return null;
      const s = this.ensureSeries();
      return buildCandleInfo(idx, this.points, this.mas, s.sma, this.macd, s.macd, this.rsi, s.rsi, this.obv, s.obv);
    }

    getCandleInfos(keys?: (string | number)[]): CandleInfo[] {
      const list = keys ?? this.points.map((_, i) => i);
      const out: CandleInfo[] = [];
      for (const k of list) {
        const info = this.getCandleInfo(k);
        if (info) out.push(info);
      }
      return out;
    }

    getCandleInfoByName(name: string): CandleInfo | null {
      // 자식 순서 = points 순서 (collectFromTicks) — name 속성 우선, 없으면 date 매칭
      let idx = -1;
      this.querySelectorAll(':scope > tick, :scope > candle').forEach((el, i) => {
        if (idx >= 0) return;
        if (el.getAttribute('name') === name || el.getAttribute('date') === name) idx = i;
      });
      if (idx < 0 || idx >= this.points.length) idx = this.points.findIndex(d => d.date === name);
      if (idx < 0 || idx >= this.points.length) return null;
      const s = this.ensureSeries();
      return buildCandleInfo(idx, this.points, this.mas, s.sma, this.macd, s.macd, this.rsi, s.rsi, this.obv, s.obv);
    }

    getCandleInfoByNames(names?: string[]): CandleInfo[] {
      if (names == null) return this.getCandleInfos();
      const out: CandleInfo[] = [];
      for (const nm of names) {
        const info = this.getCandleInfoByName(nm);
        if (info) out.push(info);
      }
      return out;
    }

    // ---------- 지표 시리즈 (그리기·조회 공용 캐시) ----------

    private ensureSeries(): {
      sma: Map<number, (number | null)[]>;
      macd: { macd: number[]; signal: number[]; hist: number[] } | null;
      rsi: number[] | null;
      obv: number[] | null;
    } {
      if (!this.seriesDirty && this.series) return this.series;
      const closes = this.points.map(p => p.close);
      const sma = new Map<number, (number | null)[]>();
      for (const ma of this.mas) {
        if (!sma.has(ma.period)) sma.set(ma.period, computeSmaSeries(closes, ma.period));
      }
      this.series = {
        sma,
        macd: this.macd ? computeMacdSeries(closes, this.macd.fast, this.macd.slow, this.macd.signal) : null,
        rsi: this.rsi ? computeRsiSeries(closes, this.rsi.period) : null,
        obv: this.obv ? computeObvSeries(closes, this.points.map(p => p.volume)) : null,
      };
      this.seriesDirty = false;
      return this.series;
    }

    // 자식 <candle>/<tick>에 .value 주입 — 속성 변경이 아니라 감시 루프 없음
    private stampCandleValues(): void {
      const s = this.ensureSeries();
      this.querySelectorAll(':scope > tick, :scope > candle').forEach((el, i) => {
        (el as any).value = buildCandleInfo(i, this.points, this.mas, s.sma, this.macd, s.macd, this.rsi, s.rsi, this.obv, s.obv);
      });
    }

    // ---------- 렌더 ----------

    @onConnectedBodyShadow
    render(): string {
      return `
        <style>
          :host { display: block; position: relative; }
          #stock-chart-canvas {
            display: block; width: 100%; height: 100%;
            touch-action: pan-y; cursor: crosshair;
          }
          :host([enabled-control]) #stock-chart-canvas {
            touch-action: pan-y;
          }
          .chart-readout {
            position: absolute; top: 8px; left: 10px;
            display: none; flex-wrap: wrap; gap: 8px;
            font-size: 11px; color: #555;
            background: rgba(255,255,255,0.92); border: 1px solid #eef0f4;
            border-radius: 6px; padding: 3px 9px;
            pointer-events: none; z-index: 2;
          }
        </style>
        <canvas id="stock-chart-canvas"></canvas>
        <div class="chart-readout" id="stock-chart-readout"></div>
      `;
    }

    // ---------- 라이프사이클 ----------

    @onConnectedAfter
    onConnected() {
      // tick 자식 요소들로 데이터 구성
      this.collectFromTicks();
      this.collectFromShapes();
      this.collectMas();
      this.collectVolume();
      this.collectMacd();
      this.collectRsi();
      this.collectObv();
      this.stampCandleValues();
      if (this.points.length === 0) {
        // 사용자가 setData를 부르길 기다림
        return;
      }
      this.setupChart();
    }

    @onDisconnected
    onDisconnected() {
      // observer 정리는 프레임워크가 자동 처리
    }

     // host(컴포넌트) 크기 변경 시 재그리기
    @resizeObserverLight()
    onHostResize(matchedEls: HTMLElement[], entries: ResizeObserverEntry[]): void {
      if (this.chartCanvas) this.drawChart();
    }

    private collectMas(): void {
      const mas: Array<{ color: string; period: number }> = [];
      this.querySelectorAll(':scope > ma').forEach(el => {
        const color = el.getAttribute('color') || '#6366f1';
        const sizeAttr = el.getAttribute('size') || el.getAttribute('period') || '20';
        const period = Math.max(2, Number(sizeAttr) || 20);
        mas.push({ color, period });
      });
      this.mas = mas;
      this.seriesDirty = true;
    }

    // ---------- 데이터 수집 ----------

    private collectFromTicks(): void {
      // 하위호환: <tick> (구) / <candle> (신) 모두 지원
      const ticks = this.querySelectorAll(":scope > tick, :scope > candle");
      const points: StockChartPoint[] = [];
      ticks.forEach((tick) => {
        const date = tick.getAttribute("date") || "";
        const open = Number(tick.getAttribute("open")) || 0;
        const high = Number(tick.getAttribute("high")) || 0;
        const low = Number(tick.getAttribute("low")) || 0;
        const close = Number(tick.getAttribute("close")) || 0;
        const volume = Number(tick.getAttribute("volume")) || 0;
        // candle/tick 자식 <line> / <tooltip> — 건별 B/S 등 여러 개 가능
        const lines: { width: number; color: string }[] = [];
        tick.querySelectorAll(':scope > line').forEach(lineEl => {
          const w = lineEl.getAttribute('width');
          const c = lineEl.getAttribute('color');
          if (w || c) lines.push({ width: w ? Number(w) || 1 : 1, color: c || 'rgba(99,102,241,0.6)' });
        });
        const tooltips: NonNullable<StockChartPoint['tooltips']> = [];
        tick.querySelectorAll(':scope > tooltip').forEach(tipEl => {
          let pos = (tipEl.getAttribute('position') || 'top') as string;
          // 하위호환: tip-top/bottom → candle-top/bottom
          if (pos === 'tip-top') pos = 'candle-top';
          if (pos === 'tip-bottom') pos = 'candle-bottom';
          const lab = tipEl.getAttribute('label') || tipEl.getAttribute('lable') || '';
          const fillC = tipEl.getAttribute('fill-color') || tipEl.getAttribute('color') || '';
          const lineC = tipEl.getAttribute('line-color') || '';
          const labelC = tipEl.getAttribute('label-color') || '';
          const lw = tipEl.getAttribute('line-width');
          // fill-color 없이 label-color/line-color만 있으면 비포커싱(투명 배경)
          const col = fillC || labelC || lineC || '#6366f1';
          tooltips.push({
            position: (['top','bottom','candle-top','candle-bottom'].includes(pos) ? pos : 'top') as any,
            color: col,
            fillColor: fillC || undefined,
            lineColor: lineC || undefined,
            labelColor: labelC || undefined,
            label: lab,
            lineWidth: lw ? Number(lw) : undefined
          } as any);
        });
        const line = lines[0];
        const tooltip = tooltips[0];
        points.push({ date, open, high, low, close, volume, lines: lines.length ? lines : undefined, tooltips: tooltips.length ? tooltips : undefined, line, tooltip });
      });
      this.points = points;
      this.seriesDirty = true;
    }

    // 자식 <rect>/<arc> 요소를 도형으로 수집 (캔버스 픽셀 좌표 오버레이)
    private collectFromShapes(): void {
      const shapes: ChartShape[] = [];
      this.querySelectorAll(":scope > rect").forEach((el) => {
        const attr = (n: string) => el.getAttribute(n);
        const dashRaw = attr("stroke-dasharray") || attr("dash") || undefined;
        const dash = dashRaw ? dashRaw.split(/[\s,]+/).map(Number).filter(v => Number.isFinite(v) && v >= 0) : undefined;
        const base = { fill: attr("fill") || attr("fill-style") || undefined, stroke: attr("stroke") || attr("stroke-style") || undefined, strokeWidth: num(attr("stroke-width")), dash: dash?.length ? dash : undefined, target: (attr("target") === 'volume' ? 'volume' : attr("target") === 'all' ? 'all' : 'candle') as 'candle' | 'volume' | 'all', marginTop: Math.max(0, num(attr("margin-top"))), marginBottom: Math.max(0, num(attr("margin-bottom"))), label: attr("label") || undefined, color: attr("color") || undefined };
        const ds = attr("date-start"), de = attr("date-end");
        if (ds && de) {
          shapes.push({ type: 'rect-date', dateStart: ds, dateEnd: de, ...base });
          return;
        }
        // start-x/start-y/end-x/end-y 또는 x/y/width/height
        const sx = num(attr("start-x")), sy = num(attr("start-y"));
        const ex = num(attr("end-x")), ey = num(attr("end-y"));
        const x = sx || num(attr("x"));
        const y = sy || num(attr("y"));
        const width = (ex && sx) ? ex - sx : num(attr("width"));
        const height = (ey && sy) ? ey - sy : num(attr("height"));
        shapes.push({ type: "rect", x, y, width, height, ...base });
      });
      this.querySelectorAll(":scope > arc").forEach((el) => {
        const attr = (n: string) => el.getAttribute(n);
        shapes.push({
          type: "arc",
          x: num(attr("x")), y: num(attr("y")), r: num(attr("r") || attr("radius")),
          start: num(attr("start") || attr("start-angle")), end: num(attr("end") || attr("end-angle")),
          fill: attr("fill") || attr("fill-style") || undefined,
          stroke: attr("stroke") || attr("stroke-style") || undefined,
          strokeWidth: num(attr("stroke-width")),
        });
      });
      this.shapes = shapes;
    }

    // tick/ma 자식 요소 변경(추가/삭제/속성) 시 재수집 후 다시 그림
    // 셀렉터 생략 → $this(host, light DOM) observe
    @mutationObserverLight({ childList: true, attributes: true, subtree: true })
    private onTicksMutated(matchedEls: HTMLElement[]): void {
      this.collectFromTicks();
      this.collectFromShapes();
      this.collectMas();
      this.collectVolume();
      this.collectMacd();
      this.collectRsi();
      this.collectObv();
      this.stampCandleValues();
      if (this.chartCanvas && this.points.length > 0) {
        if (!this.viewInitDone) {
          const n = this.points.length;
          this.viewStart = 0;
          this.viewEnd = n - 1;
          this.viewInitDone = true;
        }
        this.drawChart();
      }
    }

    // ---------- 캔들 차트 (canvas) ----------

    @queryShadow('#stock-chart-canvas')
    private chartCanvas!: HTMLCanvasElement;

    @queryShadow('#stock-chart-readout')
    private readoutEl!: HTMLElement;

    private setupChart(): void {
      const canvas = this.chartCanvas;
      if (!canvas || this.points.length === 0) return;
      if (!this.viewInitDone) {
        const n = this.points.length;
        this.viewStart = 0;
        this.viewEnd = n - 1;
        this.viewInitDone = true;
      }

      this.drawChart();
    }

    private clampView(): void {
      const n = this.points.length;
      if (n === 0) return;
      let span = this.viewEnd - this.viewStart + 1;
      span = Math.max(8, Math.min(n, Math.round(span)));
      this.viewStart = Math.max(0, Math.min(this.viewStart, n - span));
      this.viewEnd = this.viewStart + span - 1;
    }

    private isAtFullView(): boolean {
      const n = this.points.length;
      if (n === 0) return true;
      const span = this.viewEnd - this.viewStart + 1;
      return span >= n - 0.5;
    }

    @eventShadow('#stock-chart-canvas', 'wheel', { passive: false })
    private onWheel(e: WheelEvent): void {
      if (this.disabledEvent) return;
      if (!this.controlsEnabled) return;
      const n = this.points.length;
      const span0 = this.viewEnd - this.viewStart + 1;
      const isFull = n > 0 && span0 >= n - 0.5;
      const factor = e.deltaY > 0 ? 1.15 : 1 / 1.15;
      // A: 100%(full)에서 줌아웃(휠 다운, factor>1)은 차트가 더 축소 불가 → 윈도우 스크롤로 흘림
      // B: 100%에서 한 손가락 세로 스크롤도 touchMove에서 윈도우로 흘림 (아래)
      if (isFull && factor > 1) return;
      e.preventDefault();
      const canvas = this.chartCanvas;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const plotW = Math.max(1, rect.width - this.padL - this.padR);
      const frac = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left - this.padL) / plotW),
      );
      const span = this.viewEnd - this.viewStart + 1;
      const anchorIdx = this.viewStart + frac * span;
      const newSpan = span * factor;
      this.viewStart = anchorIdx - frac * newSpan;
      this.viewEnd = this.viewStart + newSpan - 1;
      this.clampView();
      this.drawChart();
    }

    @eventShadow('#stock-chart-canvas', 'mousedown')
    private onMouseDown(e: MouseEvent): void {
      if (this.disabledEvent) return;
      if (!this.controlsEnabled && !this.readoutEnabled) return;
      this.dragging = true;
      this.dragLastX = e.clientX;
      this.downX = e.clientX;
      this.downY = e.clientY;
    }

    @eventWindow('mouseup')
    private onMouseUp(e: MouseEvent): void {
      if (this.disabledEvent) return;
      if (!this.dragging) return;
      // touchend 후 300ms 이내에 발생하는 합성 mouseup은 무시
      // (모바일에서 팝업이 열리자마자 닫히는 현상 방지)
      if (Date.now() - this.lastTouchEndTime < 350) return;
      this.dragging = false;
      const moved =
        Math.abs(e.clientX - this.downX) + Math.abs(e.clientY - this.downY);
      if (this.readoutEnabled && moved < 5) {
        const idx = this.indexAtX(e.clientX);
        this.selectedIdx = idx === this.selectedIdx ? -1 : idx;
        this.drawChart();
      }
    }

    @eventShadow('#stock-chart-canvas', 'mousemove')
    private onMouseMove(e: MouseEvent): void {
      if (this.disabledEvent) return;
      if (this.controlsEnabled && this.dragging) {
        const canvas = this.chartCanvas;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const plotW = Math.max(1, rect.width - this.padL - this.padR);
        const dataLen =
          Math.ceil(this.viewEnd) - Math.floor(this.viewStart) + 1;
        const candleW = plotW / dataLen;
        const dx = e.clientX - this.dragLastX;
        if (Math.abs(dx) >= 1) {
          const shift = -dx / candleW;
          this.viewStart += shift;
          this.viewEnd += shift;
          this.clampView();
          this.dragLastX = e.clientX;
          this.drawChart();
        }
      }
    }

    private indexAtX(clientX: number): number {
      const canvas = this.chartCanvas;
      if (!canvas) return -1;
      const rect = canvas.getBoundingClientRect();
      // 그리기(xCandle)와 동일한 기준: effective padR + floor(viewStart) 원점
      const padR = this.hiddenYLabel ? 8 : this.padR;
      const plotW = Math.max(1, rect.width - this.padL - padR);
      const s = Math.floor(this.viewStart),
        eI = Math.ceil(this.viewEnd);
      const dataLen = eI - s + 1;
      const frac = (clientX - rect.left - this.padL) / plotW;
      const idx = Math.round(s + frac * dataLen - 0.5);
      return idx >= s && idx <= eI ? idx : -1;
    }

    @eventShadow('#stock-chart-canvas', 'touchstart', { passive: false })
    private onTouchStart(e: TouchEvent): void {
      if (this.disabledEvent) return;
      if (!this.controlsEnabled && !this.readoutEnabled) return;
      const touches = e.touches;
      if (touches.length === 2) {
        // 핀치 줌: 스크롤 막고 핀치 처리
        e.preventDefault();
        this.pinchDist0 = Math.abs(touches[0].clientX - touches[1].clientX);
        this.pinchSpan0 = this.viewEnd - this.viewStart + 1;
        this.pinchViewStart0 = this.viewStart;
        const canvas = this.chartCanvas;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const plotW = Math.max(1, rect.width - this.padL - this.padR);
          const midX = (touches[0].clientX + touches[1].clientX) / 2;
          this.pinchAnchorFrac = Math.max(
            0,
            Math.min(1, (midX - rect.left - this.padL) / plotW),
          );
        }
        this.dragging = false;
      } else if (touches.length === 1) {
        // 1터치: 드래그 여부는 touchmove에서 판단하므로 여기선 preventDefault 안 함
        this.dragging = true;
        this.dragLastX = touches[0].clientX;
        this.downX = touches[0].clientX;
        this.downY = touches[0].clientY;
      }
    }

    @eventShadow('#stock-chart-canvas', 'touchmove', { passive: false })
    private onTouchMove(e: TouchEvent): void {
      if (this.disabledEvent) return;
      if (!this.controlsEnabled) return;
      const touches = e.touches;
      if (touches.length === 2 && this.pinchDist0 > 0) {
        const dist = Math.abs(touches[0].clientX - touches[1].clientX);
        if (dist === 0) return;
        const factor = this.pinchDist0 / dist;
        const isFull = this.isAtFullView();
        // 100%에서 핀치 줌아웃(벌려서 축소, factor>1)은 더 축소 불가 → 윈도우로 흘림
        if (isFull && factor > 1) return;
        e.preventDefault();
        const newSpan = this.pinchSpan0 * factor;
        // 핀치 중심은 현재 손가락 사이 중간점으로 매 프레임 재계산 (고정 앵커가 끝으로 쏠리는 현상 방지)
        const canvas = this.chartCanvas;
        const rect = canvas?.getBoundingClientRect();
        const plotW = rect ? Math.max(1, rect.width - this.padL - this.padR) : 1;
        const midX = (touches[0].clientX + touches[1].clientX) / 2;
        const curFrac = rect
          ? Math.max(0, Math.min(1, (midX - rect.left - this.padL) / plotW))
          : this.pinchAnchorFrac;
        const anchorIdx = this.pinchSpan0 * curFrac + this.pinchViewStart0;
        this.viewStart = anchorIdx - curFrac * newSpan;
        this.viewEnd = this.viewStart + newSpan - 1;
        this.clampView();
        this.drawChart();
      } else if (touches.length === 1 && this.dragging) {
        // 100% 뷰에서는 한 손가락 제스처는 윈도우 스크롤로 흘림 (B)
        if (this.isAtFullView()) return;
        const canvas = this.chartCanvas;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const plotW = Math.max(1, rect.width - this.padL - this.padR);
        const dataLen =
          Math.ceil(this.viewEnd) - Math.floor(this.viewStart) + 1;
        const candleW = plotW / dataLen;
        const dx = touches[0].clientX - this.dragLastX;
        const dy = touches[0].clientY - this.downY;
        // 수평 이동이 수직보다 클 때만 차트 드래그로 처리 (스크롤 방해 안 함)
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) >= 1) {
          e.preventDefault();
          this.viewStart += -dx / candleW;
          this.viewEnd += -dx / candleW;
          this.clampView();
          this.dragLastX = touches[0].clientX;
          this.drawChart();
        }
      }
    }

    @eventShadow('#stock-chart-canvas', 'touchend')
    private onTouchEnd(e: TouchEvent): void {
      if (this.disabledEvent) return;
      const moved =
        Math.abs(e.changedTouches[0].clientX - this.downX) +
        Math.abs(e.changedTouches[0].clientY - this.downY);
      const wasPinch = this.pinchDist0 > 0;
      this.pinchDist0 = 0;
      // 모바일은 손가락 접촉면이 넓어 자연스럽게 수 px 이동이 발생하므로 임계값을 10으로 설정
      if (this.readoutEnabled && this.dragging && !wasPinch && moved < 10) {
        const idx = this.indexAtX(e.changedTouches[0].clientX);
        this.selectedIdx = idx === this.selectedIdx ? -1 : idx;
        this.drawChart();
      }
      this.dragging = false;
      // touchend 후 합성 mouseup/mousedown 이벤트가 약 300ms 뒤에 발생함
      // → 그 사이에 mouseup 핸들러가 팝업을 닫지 못하도록 타임스탬프 기록
      this.lastTouchEndTime = Date.now();
    }

    private drawChart(): void {
      const canvas = this.chartCanvas;
      if (!canvas || this.points.length === 0) return;
      const cssW = canvas.clientWidth || 320;
      const cssH = canvas.clientHeight || 300;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const startI = Math.floor(this.viewStart);
      const endI = Math.ceil(this.viewEnd);
      const data = this.points.slice(startI, endI + 1);
      if (data.length === 0) return;

      const W = cssW,
        H = cssH;
      const padL = this.padL,
        padT = 26;
      // 라벨 숨김 시 해당 여백을 그래프로 확장
      const padR = this.hiddenYLabel ? 8 : this.padR;
      const axisH = this.hiddenXLabel ? 6 : 18;
      const showMacd = !!this.macd;
      const showRsi = !!this.rsi;
      const showObv = !!this.obv;
      const gapV = this.showVolume ? 4 : 0;
      const gapM = showMacd ? 4 : 0;
      const gapR = showRsi ? 4 : 0;
      const gapO = showObv ? 4 : 0;
      // 서브패널이 늘어날수록 각각 축소 (단독 볼륨 0.3·단독 지표 0.28 유지)
      const plotH = H - padT - axisH - gapV - gapM - gapR - gapO;
      const nSub = (this.showVolume ? 1 : 0) + (showMacd ? 1 : 0) + (showRsi ? 1 : 0) + (showObv ? 1 : 0);
      const frac = (a: number, b: number, c: number, d: number): number =>
        nSub <= 1 ? a : nSub === 2 ? b : nSub === 3 ? c : d;
      const volH = this.showVolume ? Math.max(8, plotH * frac(0.3, 0.2, 0.15, 0.12)) : 0;
      const macdH = showMacd ? Math.max(24, plotH * frac(0.28, 0.22, 0.18, 0.15)) : 0;
      const rsiH = showRsi ? Math.max(24, plotH * frac(0.28, 0.2, 0.16, 0.14)) : 0;
      const obvH = showObv ? Math.max(24, plotH * frac(0.28, 0.2, 0.16, 0.14)) : 0;
      const priceH = plotH - volH - macdH - rsiH - obvH;
      const priceBottom = padT + priceH;
      const plotW = W - padL - padR;

      const UP = "#e5484d",
        DOWN = "#3e63dd";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);

      let maxP = -Infinity,
        minP = Infinity;
      let maxV = 0;
      for (const d of data) {
        maxP = Math.max(maxP, d.high);
        minP = Math.min(minP, d.low);
        maxV = Math.max(maxV, d.volume);
      }
      const pPad = (maxP - minP) * 0.07 || maxP * 0.02 || 1;
      maxP += pPad;
      minP -= pPad;

      const yPrice = (p: number) =>
        padT + priceH - ((p - minP) / (maxP - minP)) * priceH;
      const xCandle = (i: number) => padL + ((i + 0.5) / data.length) * plotW;
      const candleW = plotW / data.length;
      const bodyW = Math.max(1, Math.min(18, candleW * 0.65));

      // 가격 그리드 + 라벨
      ctx.font = "10px -apple-system, sans-serif";
      ctx.textBaseline = "middle";
      const gridCount = 4;
      for (let g = 0; g <= gridCount; g++) {
        const p = minP + ((maxP - minP) * g) / gridCount;
        const y = yPrice(p);
        ctx.strokeStyle = "#f0f2f5";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(W - padR, y);
        ctx.stroke();
        if (!this.hiddenYLabel) {
          ctx.fillStyle = "#98a2b3";
          ctx.textAlign = "left";
          ctx.fillText(p.toLocaleString(), W - padR + 6, y);
        }
      }

      // 거래량 영역 라인 + y축 수치 라벨
      const volTop = priceBottom + gapV;
      const macdTop = volTop + volH + gapM;
      const rsiTop = macdTop + macdH + gapR;
      const obvTop = rsiTop + rsiH + gapO;
      const volPlotH = Math.max(0, volH - 6);
      if (this.showVolume) {
        const fmtVol = (v: number): string => {
          if (v >= 100000000) return (v / 100000000).toFixed(1) + "억";
          if (v >= 10000) return Math.round(v / 10000).toLocaleString() + "만";
          return v.toLocaleString();
        };
        ctx.strokeStyle = "#f6f7f9";
        for (let g = 1; g <= 2; g++) {
          const vv = (maxV * g) / 2;
          const vy = volTop + volH - (volPlotH * g) / 2;
          ctx.beginPath();
          ctx.moveTo(padL, vy);
          ctx.lineTo(W - padR, vy);
          ctx.stroke();
          if (!this.hiddenYLabel) {
            ctx.fillStyle = "#98a2b3";
            ctx.textAlign = "left";
            ctx.fillText(fmtVol(vv), W - padR + 6, vy);
          }
        }
        ctx.strokeStyle = "#f0f2f5";
        ctx.beginPath();
        ctx.moveTo(padL, volTop);
        ctx.lineTo(W - padR, volTop);
        ctx.stroke();
      }

      // 세로 시간 그리드 (가격+거래량 영역 관통) — 모바일 4개, 데스크탑 6개
      const isMobile = W < 420;
      const timeGridCount = isMobile ? 4 : 6;
      const step = Math.max(1, Math.ceil(data.length / timeGridCount));
      ctx.strokeStyle = "#f6f7f9";
      ctx.lineWidth = 1;
      for (let i = 0; i < data.length; i += step) {
        const gx = Math.round(xCandle(i)) + 0.5;
        ctx.beginPath();
        ctx.moveTo(gx, padT);
        ctx.lineTo(gx, H - axisH);
        ctx.stroke();
      }

      // --- 클리핑: 가격 영역만 (거래량/x축 라벨로 침범 방지) ---
      ctx.save();
      ctx.beginPath();
      ctx.rect(padL, padT, plotW, priceH);
      ctx.clip();

      // 캔들 (가격 영역만)
      for (let i = 0; i < data.length; i++) {
        const d = data[i];
        const up = d.close >= d.open;
        const color = up ? UP : DOWN;
        const x = Math.round(xCandle(i)) + 0.5;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, yPrice(d.high));
        ctx.lineTo(x, yPrice(d.low));
        ctx.stroke();
        const yO = yPrice(d.open),
          yC = yPrice(d.close);
        const top = Math.min(yO, yC);
        const hgt = Math.max(1, Math.abs(yC - yO));
        ctx.fillStyle = color;
        ctx.fillRect(x - bodyW / 2, top, bodyW, hgt);
      }

      // 이동평균선 (캔들 위에, 클리핑 내)
      if (this.mas.length) {
        const sma = this.ensureSeries().sma;
        for (const ma of this.mas) {
          const arr = sma.get(ma.period);
          if (!arr) continue;
          ctx.strokeStyle = ma.color;
          ctx.lineWidth = 1.2;
          ctx.lineJoin = 'round';
          ctx.beginPath();
          let started = false;
          for (let i = 0; i < data.length; i++) {
            const v = arr[startI + i];
            if (v == null) continue;
            const px = xCandle(i);
            const py = yPrice(v);
            if (!started) { ctx.moveTo(px, py); started = true; }
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
      }

      ctx.restore();

      // 거래량 (별도 영역, 클리핑 없음)
      if (this.showVolume) {
        for (let i = 0; i < data.length; i++) {
          const d = data[i];
          const up = d.close >= d.open;
          const color = up ? UP : DOWN;
          const x = Math.round(xCandle(i)) + 0.5;
          const vh = maxV > 0 ? (d.volume / maxV) * (volH - 6) : 0;
          ctx.globalAlpha = 0.55;
          ctx.fillStyle = color;
          ctx.fillRect(x - bodyW / 2, volTop + volH - vh, bodyW, vh);
          ctx.globalAlpha = 1;
        }
      }

      // MACD 영역 (별도 패널: 0선 + 히스토그램 + MACD선/시그널선)
      if (showMacd && this.macd) {
        const m = this.macd;
        const full = computeMacdSeries(this.points.map(p => p.close), m.fast, m.slow, m.signal);
        this.macdCache = full;
        const mM = full.macd.slice(startI, endI + 1);
        const mS = full.signal.slice(startI, endI + 1);
        const mH = full.hist.slice(startI, endI + 1);
        let mx = 0, mn = 0;
        for (let i = 0; i < data.length; i++) {
          mx = Math.max(mx, mM[i], mS[i], mH[i]);
          mn = Math.min(mn, mM[i], mS[i], mH[i]);
        }
        const mPad = (mx - mn) * 0.1 || 1;
        mx += mPad;
        mn -= mPad;
        const yM = (v: number) => macdTop + macdH - ((v - mn) / (mx - mn)) * macdH;
        const y0 = yM(0);
        ctx.save();
        ctx.beginPath();
        ctx.rect(padL, macdTop, plotW, macdH);
        ctx.clip();
        // 0선
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(padL, y0);
        ctx.lineTo(W - padR, y0);
        ctx.stroke();
        ctx.setLineDash([]);
        // 히스토그램 (캔들과 같은 상승/하락 색)
        for (let i = 0; i < data.length; i++) {
          const h = mH[i];
          const y1 = yM(h);
          const x = Math.round(xCandle(i)) + 0.5;
          ctx.globalAlpha = 0.5;
          ctx.fillStyle = h >= 0 ? UP : DOWN;
          ctx.fillRect(x - bodyW / 2, Math.min(y0, y1), bodyW, Math.max(1, Math.abs(y1 - y0)));
          ctx.globalAlpha = 1;
        }
        // MACD선·시그널선
        const strokeMacdLine = (arr: number[], color: string) => {
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.2;
          ctx.lineJoin = 'round';
          ctx.beginPath();
          let started = false;
          for (let i = 0; i < data.length; i++) {
            const px = xCandle(i);
            const py = yM(arr[i]);
            if (!started) { ctx.moveTo(px, py); started = true; }
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
        };
        strokeMacdLine(mM, m.fastColor);
        strokeMacdLine(mS, m.signalColor);
        ctx.restore();
        if (!this.hiddenYLabel) {
          ctx.fillStyle = '#98a2b3';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(fmtInd(mx - mPad), W - padR + 6, macdTop + 7);
          ctx.fillText(fmtInd(mn + mPad), W - padR + 6, macdTop + macdH - 7);
        }
      } else {
        this.macdCache = null;
      }

      // RSI 영역 (별도 패널: 과열/과매도 음영 + 70/50/30선 + RSI선, 0~100 고정 스케일)
      if (showRsi && this.rsi) {
        const rcfg = this.rsi;
        const full = computeRsiSeries(this.points.map(p => p.close), rcfg.period);
        this.rsiCache = full;
        const rV = full.slice(startI, endI + 1);
        const yR = (v: number) => rsiTop + rsiH - (Math.max(0, Math.min(100, v)) / 100) * rsiH;
        ctx.save();
        ctx.beginPath();
        ctx.rect(padL, rsiTop, plotW, rsiH);
        ctx.clip();
        // 과열/과매도 구간 음영
        ctx.globalAlpha = 0.08;
        ctx.fillStyle = rcfg.overbought.color;
        ctx.fillRect(padL, yR(100), plotW, yR(rcfg.overbought.level) - yR(100));
        ctx.fillStyle = rcfg.oversold.color;
        ctx.fillRect(padL, yR(rcfg.oversold.level), plotW, yR(0) - yR(rcfg.oversold.level));
        ctx.globalAlpha = 1;
        // 70/50/30선
        const gridRsi = (v: number, color: string, dash: number[]) => {
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.setLineDash(dash);
          ctx.beginPath();
          ctx.moveTo(padL, yR(v));
          ctx.lineTo(W - padR, yR(v));
          ctx.stroke();
          ctx.setLineDash([]);
        };
        gridRsi(rcfg.overbought.level, rcfg.overbought.color, [3, 3]);
        gridRsi(rcfg.oversold.level, rcfg.oversold.color, [3, 3]);
        gridRsi(50, '#cbd5e1', [3, 3]);
        // RSI선
        ctx.strokeStyle = rcfg.lineColor;
        ctx.lineWidth = 1.2;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        let rStarted = false;
        for (let i = 0; i < data.length; i++) {
          const px = xCandle(i);
          const py = yR(rV[i]);
          if (!rStarted) { ctx.moveTo(px, py); rStarted = true; }
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();
        if (!this.hiddenYLabel) {
          ctx.fillStyle = '#98a2b3';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(rcfg.overbought.level), W - padR + 6, yR(rcfg.overbought.level));
          ctx.fillText(String(rcfg.oversold.level), W - padR + 6, yR(rcfg.oversold.level));
        }
      } else {
        this.rsiCache = null;
      }

      // OBV 영역 (별도 패널: 누적선, 보이는 구간 자동 스케일)
      if (showObv && this.obv) {
        const ocfg = this.obv;
        const full = computeObvSeries(this.points.map(p => p.close), this.points.map(p => p.volume));
        this.obvCache = full;
        const oV = full.slice(startI, endI + 1);
        let ox = -Infinity, on = Infinity;
        for (let i = 0; i < data.length; i++) {
          if (oV[i] > ox) ox = oV[i];
          if (oV[i] < on) on = oV[i];
        }
        const oPad = (ox - on) * 0.1 || Math.abs(ox) * 0.1 || 1;
        ox += oPad;
        on -= oPad;
        const yO = (v: number) => obvTop + obvH - ((v - on) / (ox - on)) * obvH;
        ctx.save();
        ctx.beginPath();
        ctx.rect(padL, obvTop, plotW, obvH);
        ctx.clip();
        ctx.strokeStyle = ocfg.lineColor;
        ctx.lineWidth = 1.2;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        let oStarted = false;
        for (let i = 0; i < data.length; i++) {
          const px = xCandle(i);
          const py = yO(oV[i]);
          if (!oStarted) { ctx.moveTo(px, py); oStarted = true; }
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();
        if (!this.hiddenYLabel) {
          ctx.fillStyle = '#98a2b3';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(fmtBig(ox - oPad), W - padR + 6, obvTop + 7);
          ctx.fillText(fmtBig(on + oPad), W - padR + 6, obvTop + obvH - 7);
        }
      } else {
        this.obvCache = null;
      }

      // tick 자식 <line>/<tooltip> (건별 B/S 등 마커) — 여러 개 가능
      for (let i = 0; i < data.length; i++) {
        const d = data[i] as StockChartPoint;
        const x = xCandle(i);
        const lines = (d as any).lines as StockChartPoint['line'][] | undefined;
        const tooltips = (d as any).tooltips as StockChartPoint['tooltip'][] | undefined;
        // <line> : 수직 타임라인 (가격 영역만)
        const lineList = lines ?? (d.line ? [d.line] : []);
        for (const ln of lineList) {
          const yEnd = padT + priceH;
          ctx.save();
          ctx.strokeStyle = ln.color;
          ctx.lineWidth = ln.width;
          ctx.beginPath();
          ctx.moveTo(Math.round(x) + 0.5, padT);
          ctx.lineTo(Math.round(x) + 0.5, yEnd);
          ctx.stroke();
          ctx.restore();
        }
        // <tooltip> : 라벨 + (선택) 라인
        const tipList = tooltips ?? (d.tooltip ? [d.tooltip] : []);
        for (const tip of tipList) {
          if (!tip.label) continue;
          // 라인 (tooltip의 line-width/line-color 가 있으면 그림) — 가격 영역만
          if (tip.lineWidth && tip.lineColor) {
            const yEnd = padT + priceH;
            ctx.save();
            ctx.strokeStyle = tip.lineColor;
            ctx.lineWidth = tip.lineWidth;
            ctx.beginPath();
            ctx.moveTo(Math.round(x) + 0.5, padT);
            ctx.lineTo(Math.round(x) + 0.5, yEnd);
            ctx.stroke();
            ctx.restore();
          }
          // 라벨 위치 — candle-*는 캔들 팁, top/bottom은 가격 영역 위/아래
          let ly = padT - 5;
          if (tip.position === 'bottom') ly = padT + priceH + 6;
          else if (tip.position === 'candle-top' || (tip as any).position === 'tip-top') ly = yPrice(d.high) - 10 - 8;
          else if (tip.position === 'candle-bottom' || (tip as any).position === 'tip-bottom') ly = yPrice(d.low) + 10 + 8;
          const tipAny = tip as any;
          const fillColor: string | undefined = tipAny.fillColor;
          const labelColor: string | undefined = tipAny.labelColor;
          const hasFill = !!fillColor;
          const bg = fillColor || tip.color;
          const fg = labelColor || (tip.label === 'D' || tip.label === 'G' ? '#fff' : '#fff');
          // G/D처럼 fill 없이 label/line만인 경우 연하게 보이지 않도록, fill 없으면 흰 글자 대신 labelColor 사용
          const useTextOnly = !hasFill && !!labelColor;
          ctx.font = 'bold 10px -apple-system, sans-serif';
          const tw = ctx.measureText(tip.label).width + 10;
          const th = 16;
          let tx = x - tw / 2;
          tx = Math.max(padL + 2, Math.min(W - padR - tw - 2, tx));
          // clamp y — 상하 18px 여유
          if (ly - th/2 < padT - 18) ly = padT - 18 + th/2;
          if (ly + th/2 > padT + priceH + 18) ly = padT + priceH + 18 - th/2;
          if (hasFill) {
            ctx.fillStyle = bg;
            ctx.beginPath();
            ctx.roundRect(tx, ly - th/2, tw, th, 6);
            ctx.fill();
            ctx.fillStyle = fg;
          } else {
            // fill 없이 라벨만: 배경 없이 텍스트만 (포커싱 약하게)
            ctx.fillStyle = labelColor || tip.color;
            // 텍스트 가독성을 위한 흰 외곽선은 유지하되 배경은 투명
          }
          // G/D처럼 fill 없이 label만인 경우 테두리 불필요
          if (hasFill) {
            ctx.strokeStyle = tip.label === 'D' ? '#ef4444' : tip.label === 'G' ? '#d97706' : (tipAny.lineColor || bg);
            ctx.lineWidth = 1;
            ctx.stroke();
          }
          ctx.fillStyle = fg;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(tip.label, tx + tw/2, ly + 0.5);
        }
      }

      // 종가 연결선 (캔들 위에 그려짐, show-close-line 속성 있을 때만)
      if (this.showCloseLine) {
        ctx.strokeStyle = "#111111";
        ctx.lineWidth = 1;
        ctx.lineJoin = "round";
        ctx.beginPath();
        for (let i = 0; i < data.length; i++) {
          const px = xCandle(i);
          const py = yPrice(data[i].close);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // 보이는 구간 최고/최저 툴팁
      let hiIdx = 0,
        loIdx = 0;
      for (let i = 1; i < data.length; i++) {
        if (data[i].high > data[hiIdx].high) hiIdx = i;
        if (data[i].low < data[loIdx].low) loIdx = i;
      }
      const drawChartTip = (
        i: number,
        price: number,
        text: string,
        above: boolean,
      ) => {
        ctx.font = "bold 10px -apple-system, sans-serif";
        const tw = ctx.measureText(text).width + 14;
        const th = 16;
        const cx = Math.max(
          padL + tw / 2,
          Math.min(W - padR - tw / 2, xCandle(i)),
        );
        const py = yPrice(price);
        const ty = above ? py - 8 - th : py + 8;
        ctx.fillStyle = "#33475b";
        ctx.beginPath();
        ctx.roundRect(cx - tw / 2, ty, tw, th, 4);
        ctx.fill();
        const tipX = Math.max(
          cx - tw / 2 + 6,
          Math.min(cx + tw / 2 - 6, xCandle(i)),
        );
        ctx.beginPath();
        if (above) {
          ctx.moveTo(tipX - 4, ty + th);
          ctx.lineTo(tipX + 4, ty + th);
          ctx.lineTo(tipX, ty + th + 4);
        } else {
          ctx.moveTo(tipX - 4, ty);
          ctx.lineTo(tipX + 4, ty);
          ctx.lineTo(tipX, ty - 4);
        }
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, cx, ty + th / 2 + 0.5);
      };
      if (this.showMinMax) {
        drawChartTip(
          hiIdx,
          data[hiIdx].high,
          `최고: ${data[hiIdx].high.toLocaleString()}원`,
          true,
        );
        drawChartTip(
          loIdx,
          data[loIdx].low,
          `최저: ${data[loIdx].low.toLocaleString()}원`,
          false,
        );
      }

      // 날짜 축 — 원문 그대로 표시
      if (!this.hiddenXLabel) {
        ctx.fillStyle = "#98a2b3";
        ctx.textAlign = "center";
        ctx.font = `${isMobile ? 9 : 10}px -apple-system, sans-serif`;
        for (let i = 0; i < data.length; i += step) {
          const label = data[i].date;
          const x = xCandle(i);
          if (x < padL + 20 || x > W - padR - 20) continue;
          ctx.fillText(label, x, H - axisH / 2);
        }
      }

      // 마지막 종가 라인 (show-last-line 속성 있을 때만)
      if (this.showLastLine) {
        const last = data[data.length - 1];
        const lastUp = last.close >= last.open;
        const ly = yPrice(last.close);
        ctx.strokeStyle = lastUp ? UP : DOWN;
        ctx.setLineDash([4, 3]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padL, ly);
        ctx.lineTo(W - padR, ly);
        ctx.stroke();
        ctx.setLineDash([]);
        // 종가 태그
        const tagText = last.close.toLocaleString();
        ctx.fillStyle = lastUp ? UP : DOWN;
        const tagW = ctx.measureText(tagText).width + 10;
        ctx.beginPath();
        const tagY = Math.max(padT, Math.min(priceBottom - 8, ly));
        ctx.roundRect(W - padR + 2, tagY - 8, tagW, 16, 4);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.textAlign = "left";
        ctx.fillText(tagText, W - padR + 7, tagY);
      }

      // 범례 (각 영역 좌상단: 영역별 지표 색상 매핑)
      {
        ctx.font = '10px -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        const rowH = 15, padBX = 5, lineW = 12, gapX = 9;
        const maxW = Math.max(40, plotW - 8);
        const drawPaneLegend = (top: number, items: { label: string; color: string | null }[]): void => {
          if (!items.length) return;
          const rows: { label: string; color: string | null; x: number; w: number }[][] = [[]];
          let cx = 0;
          for (const it of items) {
            const w = (it.color ? lineW + 4 : 0) + ctx.measureText(it.label).width;
            if (cx > 0 && cx + w > maxW) { rows.push([]); cx = 0; }
            rows[rows.length - 1].push({ ...it, x: cx, w });
            cx += w + gapX;
          }
          const bgW = Math.max(...rows.map(r => r.reduce((a, b) => a + b.w + gapX, -gapX)));
          const bx = padL + 2, by = top + 2;
          ctx.fillStyle = 'rgba(255,255,255,0.88)';
          ctx.beginPath();
          ctx.roundRect(bx, by, bgW + padBX * 2, rows.length * rowH + 6, 5);
          ctx.fill();
          ctx.strokeStyle = '#eef0f4';
          ctx.lineWidth = 1;
          ctx.stroke();
          rows.forEach((row, ri) => {
            const ry = by + 3 + ri * rowH + rowH / 2;
            for (const it of row) {
              const ix = bx + padBX + it.x;
              if (it.color) {
                ctx.strokeStyle = it.color;
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(ix, ry);
                ctx.lineTo(ix + lineW, ry);
                ctx.stroke();
              }
              ctx.fillStyle = '#475569';
              ctx.fillText(it.label, ix + (it.color ? lineW + 4 : 0), ry + 0.5);
            }
          });
        };
        if (this.mas.length) drawPaneLegend(padT, this.mas.map(ma => ({ label: `MA${ma.period}`, color: ma.color })));
        if (this.showVolume) drawPaneLegend(volTop, [{ label: '거래량', color: null }]);
        if (this.macd) drawPaneLegend(macdTop, [{ label: 'MACD', color: this.macd.fastColor }, { label: 'SIG', color: this.macd.signalColor }]);
        if (this.rsi) drawPaneLegend(rsiTop, [{ label: `RSI${this.rsi.period}`, color: this.rsi.lineColor }]);
        if (this.obv) drawPaneLegend(obvTop, [{ label: 'OBV', color: this.obv.lineColor }]);
      }

      // 선택된 캔들: 크로스헤어 + 종가 가로선 + 리드아웃
      const readout = this.readoutEl;
      if (this.selectedIdx >= startI && this.selectedIdx <= endI && readout) {
        const hi = this.selectedIdx - startI;
        const d = this.points[this.selectedIdx];
        const up = d.close >= d.open;
        const hx = Math.round(xCandle(hi)) + 0.5;
        ctx.strokeStyle = "#94a3b8";
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(hx, padT);
        ctx.lineTo(hx, H - axisH);
        ctx.stroke();
        const cy = yPrice(d.close);
        ctx.strokeStyle = up ? UP : DOWN;
        ctx.beginPath();
        ctx.moveTo(padL, cy);
        ctx.lineTo(W - padR, cy);
        ctx.stroke();
        if (this.showVolume && d.volume > 0) {
          const vy = volTop + volH - (d.volume / maxV) * volPlotH;
          ctx.beginPath();
          ctx.moveTo(padL, vy);
          ctx.lineTo(W - padR, vy);
          ctx.stroke();
        }
        ctx.setLineDash([]);
        // x축 날짜 필 하이라이트
        ctx.font = "bold 10px -apple-system, sans-serif";
        const selLabel = d.date.includes(' ') ? d.date : d.date.slice(5);
        const selTw = ctx.measureText(selLabel).width + 10;
        ctx.fillStyle = "#33475b";
        ctx.beginPath();
        ctx.roundRect(
          Math.min(W - padR - selTw / 2, Math.max(padL, hx - selTw / 2)),
          H - axisH + 2,
          selTw,
          axisH - 4,
          4,
        );
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText(
          selLabel,
          Math.min(W - padR - selTw / 2, Math.max(padL, hx - selTw / 2)) +
            selTw / 2,
          H - axisH / 2,
        );
        const prev = this.points[this.selectedIdx - 1] || d;
        const diff = prev.close
          ? ((d.close - prev.close) / prev.close) * 100
          : 0;
        const sign = diff > 0 ? "+" : "";
        readout.innerHTML = `
          <span>${d.date}</span>
          <span>시 ${d.open.toLocaleString()}</span>
          <span>고 ${d.high.toLocaleString()}</span>
          <span>저 ${d.low.toLocaleString()}</span>
          <span style="color:${up ? UP : DOWN};font-weight:700">종 ${d.close.toLocaleString()} (${sign}${diff.toFixed(2)}%)</span>
          <span>거래량 ${d.volume.toLocaleString()}</span>
          ${this.macd && this.macdCache && this.selectedIdx >= 0 && this.selectedIdx < this.macdCache.macd.length ? `<span style="color:${this.macd.fastColor};font-weight:700">MACD ${this.macdCache.macd[this.selectedIdx].toFixed(2)}</span><span style="color:${this.macd.signalColor};font-weight:700">시그널 ${this.macdCache.signal[this.selectedIdx].toFixed(2)}</span>` : ''}
          ${this.rsi && this.rsiCache && this.selectedIdx >= 0 && this.selectedIdx < this.rsiCache.length ? `<span style="color:${this.rsi.lineColor};font-weight:700">RSI ${this.rsiCache[this.selectedIdx].toFixed(1)}</span>` : ''}
          ${this.obv && this.obvCache && this.selectedIdx >= 0 && this.selectedIdx < this.obvCache.length ? `<span style="color:${this.obv.lineColor};font-weight:700">OBV ${Math.round(this.obvCache[this.selectedIdx]).toLocaleString()}</span>` : ''}
        `;
        // 초기 위치를 먼저 설정하고 표시 (깜빡임 방지)
        readout.style.left = `${Math.max(4, hx - 60)}px`;
        readout.style.top = `${Math.max(4, yPrice(d.high) - 48)}px`;
        readout.style.display = "flex";
        // 실제 크기가 렌더링된 이후 정확한 위치로 보정
        requestAnimationFrame(() => {
          const r = readout.getBoundingClientRect();
          let lx = hx - r.width / 2;
          lx = Math.max(4, Math.min(cssW - r.width - 4, lx));
          let ty = yPrice(d.high) - r.height - 10;
          if (ty < padT) ty = yPrice(d.low) + 12;
          readout.style.left = `${lx}px`;
          readout.style.top = `${Math.max(4, ty)}px`;
        });
      } else if (readout) {
        readout.style.display = "none";
      }

      // 자식 <rect>/<arc> 도형 오버레이
      this.drawShapes(ctx, { data, xCandle, bodyW, yPrice, minP, maxP, volTop, volH, H, axisH, padT });
    }

    // rect 좌상단 라벨 (배경 pill + 텍스트)
    private drawShapeLabel(ctx: CanvasRenderingContext2D, x: number, y: number, label: string | undefined, color: string | undefined): void {
      if (!label) return;
      ctx.font = 'bold 10px -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      const tw = ctx.measureText(label).width;
      const lx = x + 4, ly = y + 4;
      ctx.fillStyle = 'rgba(255,255,255,0.88)';
      ctx.beginPath();
      ctx.roundRect(lx - 3, ly - 2, tw + 12, 17, 5);
      ctx.fill();
      ctx.fillStyle = color || '#475569';
      ctx.fillText(label, lx + 3, ly + 1);
    }

    private drawShapes(ctx: CanvasRenderingContext2D, c: { data: StockChartPoint[]; xCandle: (i: number) => number; bodyW: number; yPrice: (p: number) => number; minP: number; maxP: number; volTop: number; volH: number; H: number; axisH: number; padT: number }): void {      for (const s of this.shapes) {
        ctx.save();
        if (s.fill) ctx.fillStyle = s.fill;
        if (s.stroke) {
          ctx.strokeStyle = s.stroke;
          ctx.lineWidth = s.strokeWidth || 1;
          ctx.setLineDash(s.dash ?? []);
        }
        if (s.type === 'rect-date') {
          // 전체 points 기준 인덱스 → 보이는 구간과 교집합 (줌해도 클리핑 표시)
          const g0 = this.points.findIndex(d => d.date === s.dateStart);
          const g1 = this.points.findIndex(d => d.date === s.dateEnd);
          if (g0 < 0 || g1 < 0 || g1 < g0) continue;
          const v0 = Math.floor(this.viewStart);
          const c0 = Math.max(g0, v0);
          const c1 = Math.min(g1, Math.ceil(this.viewEnd));
          if (c1 < c0) continue;
          const i0 = c0 - v0;
          const i1 = c1 - v0;
          const x = c.xCandle(i0) - c.bodyW / 2;
          const w = c.xCandle(i1) + c.bodyW / 2 - x;
          let y: number, h: number;
          if (s.target === 'all') {
            // 가격 범위 최고점 ~ x축 (캔들+볼륨을 하나로)
            y = c.yPrice(c.maxP);
            h = (c.H - c.axisH) - y;
          } else if (s.target === 'volume') {
            // 거래량 영역 상단 ~ 거래량 영역 하단
            y = c.volTop;
            h = c.volH;
          } else {
            // 캔들 가격 범위 (전체 max~min)
            y = c.yPrice(c.maxP);
            h = c.yPrice(c.minP) - y;
          }
          // 상하 여백 인셋 (영역 rect와 구분)
          const mTop = Math.max(0, s.marginTop || 0), mBot = Math.max(0, s.marginBottom || 0);
          y += mTop;
          h = Math.max(0, h - mTop - mBot);
          if (s.fill) ctx.fillRect(x, y, w, h);
          if (s.stroke) ctx.strokeRect(x, y, w, h);
          this.drawShapeLabel(ctx, x, y, s.label, s.color);
        } else if (s.type === 'rect') {
          const mTop = Math.max(0, s.marginTop || 0), mBot = Math.max(0, s.marginBottom || 0);
          const ry = s.y + mTop, rh = Math.max(0, s.height - mTop - mBot);
          if (s.fill) ctx.fillRect(s.x, ry, s.width, rh);
          if (s.stroke) ctx.strokeRect(s.x, ry, s.width, rh);
          this.drawShapeLabel(ctx, s.x, ry, s.label, s.color);
        } else if (s.type === 'arc') {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, s.start, s.end);
          if (s.fill) ctx.fill();
          if (s.stroke) ctx.stroke();
        }
        ctx.restore();
      }
    }
  }

  return StockChartImpl;
};