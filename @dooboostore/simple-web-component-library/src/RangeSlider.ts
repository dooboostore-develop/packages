import {
  addEventListener,
  changedAttribute,
  elementDefine,
  eventShadow,
  eventWindow,
  mutationObserverLight,
  onConnectedAfter,
  onConnectedBodyShadow,
  queryShadow,
} from '@dooboostore/simple-web-component';
export interface ThumbState {
  name: string;
  value: number;
  step: number;
}

/** ref 해석: 숫자면 그대로, 썸 이름이면 그 썸의 현재값, 그 외(없음/미존재)=fallback */
export function resolveBound(ref: string | undefined | null, states: ThumbState[], fallback: number): number {
  if (ref == null || ref === '') return fallback;
  const n = Number(ref);
  if (Number.isFinite(n)) return n;
  const t = states.find(s => s.name === ref);
  return t ? t.value : fallback;
}

export function snapValue(v: number, gmin: number, step: number): number {
  const st = step > 0 ? step : 1;
  return gmin + Math.round((v - gmin) / st) * st;
}

/**
 * 전 썸을 문서 순서대로 경계 안으로 클램프. 조작 썸 우선(먼저 적용됨) 후
 * 나머지가 적응. 참조 체인은 패스 반복으로 수렴 (사이클도 수렴 보장).
 */
export function clampThumbs(
  states: ThumbState[],
  mins: (string | undefined)[],
  maxs: (string | undefined)[],
  gmin: number,
  gmax: number,
): void {
  const n = states.length;
  if (!n) return;
  for (let pass = 0; pass < n + 1; pass++) {
    let changed = false;
    for (let i = 0; i < n; i++) {
      const lo = resolveBound(mins[i], states, gmin);
      const hi = resolveBound(maxs[i], states, gmax);
      const lo2 = Math.min(lo, hi);
      const hi2 = Math.max(lo, hi);
      const nv = snapValue(Math.min(Math.max(states[i].value, lo2), hi2), gmin, states[i].step);
      if (nv !== states[i].value) { states[i].value = nv; changed = true; }
    }
    if (!changed) break;
  }
}

/** 값 공간에서 가장 가까운 썸 인덱스 (트랙 클릭용) */
export function nearestThumbIndex(states: ThumbState[], v: number): number {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < states.length; i++) {
    const d = Math.abs(states[i].value - v);
    if (d < bestD) { bestD = d; best = i; }
  }
  return best;
}

/**
 * 그룹 단위 리지드 평행이동: 델타를 그룹 전체가 경계 안에 머무르도록 먼저 클램프한 뒤
 * 전 멤버에 동일 적용. 동일 이동 하에서는 멤버 간 상대 참조가 불변이므로
 * 이동 전 해석값으로 클램프해도 정확. 달성 델타 반환.
 */
export function translateStates(
  states: ThumbState[],
  names: Set<string>,
  delta: number,
  mins: (string | undefined)[],
  maxs: (string | undefined)[],
  gmin: number,
  gmax: number,
): number {
  if (!delta || !names.size) return 0;
  let loD = -Infinity;
  let hiD = Infinity;
  for (let i = 0; i < states.length; i++) {
    if (!names.has(states[i].name)) continue;
    const lo = resolveBound(mins[i], states, gmin);
    const hi = resolveBound(maxs[i], states, gmax);
    loD = Math.max(loD, Math.min(lo, hi) - states[i].value);
    hiD = Math.min(hiD, Math.max(lo, hi) - states[i].value);
  }
  const d = Math.min(Math.max(delta, loD), hiD);
  if (!d) return 0;
  for (let i = 0; i < states.length; i++) {
    if (!names.has(states[i].name)) continue;
    states[i].value = snapValue(states[i].value + d, gmin, states[i].step);
  }
  return d;
}



const tagName = 'range-slider';

export type RangeSliderMode = 'single' | 'range';
export type RangeSliderOrientation = 'horizontal' | 'vertical';

/** 선언형 썸 자식 1건: <thumb name="p1" value="0" min="0" max="p2"> (min/max는 숫자 또는 썸 이름) */
export interface RangeThumbValues {
  [name: string]: number;
}

export interface RangeSlider extends HTMLElement {
  minValue: number;
  maxValue: number;
  /**
   * 썸 자식 없음(레거시): single=현재값 / range=차이값 문자열
   * 썸 자식 있음: {name: 값} 객체
   */
  value: any;
  avgValue: number;
  /** 썸 모드에서 값 일괄 지정 (이벤트 미발생) */
  setValues(values: RangeThumbValues): void;
  min: number;
  max: number;
  step: number;
  mode: RangeSliderMode;
  orientation: RangeSliderOrientation;
}

function num(v: string | null | undefined, fb: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fb;
}

export interface RangeSliderCtor {
  new (): RangeSlider;
}

export default (w: Window): RangeSliderCtor => {
  const existing = w.customElements.get(tagName);
  if (existing) return existing as unknown as RangeSliderCtor;

  @elementDefine(tagName, { window: w })
  class RangeSliderImpl extends w.HTMLElement implements RangeSlider {
    static get formAssociated() { return true; }

    private _min = 0;
    private _max = 100;
    private _step = 1;
    private _mode: RangeSliderMode = 'range';
    private _orientation: RangeSliderOrientation = 'horizontal';
    private _low = 0;
    private _high = 100;
    private _drag: 'min' | 'max' | null = null;
    private _syncing = false;
    private _internals: any = null;
    // ---------- 선언형 썸 (자식 <thumb> 있을 때만 사용, 레거시와 배타) ----------
    private _thumbs: (ThumbState & { el: Element; minRef?: string; maxRef?: string; color?: string; group?: string })[] | null = null;
    private _groups: { id: string; label: string; color?: string }[] | null = null;
    private _dragThumb: string | null = null;
    private _dragGroup: { group: string; lastV: number } | null = null;

    // ---------- input-like API ----------

    get min(): number { return this._min; }
    set min(v: number) { this.setAttr('min', String(v)); }
    get max(): number { return this._max; }
    set max(v: number) { this.setAttr('max', String(v)); }
    get step(): number { return this._step; }
    set step(v: number) { this.setAttr('step', String(v)); }
    get mode(): RangeSliderMode { return this._mode; }
    set mode(v: RangeSliderMode) { this.setAttr('mode', v); }
    get orientation(): RangeSliderOrientation { return this._orientation; }
    set orientation(v: RangeSliderOrientation) { this.setAttr('orientation', v); }

    get minValue(): number {
      if (this._thumbs?.length) return Math.min(...this._thumbs.map(t => t.value));
      return this._mode === 'single' ? this._low : this._low;
    }
    set minValue(v: number) { this.setLow(Number(v)); }
    get maxValue(): number {
      if (this._thumbs?.length) return Math.max(...this._thumbs.map(t => t.value));
      return this._mode === 'single' ? this._low : this._high;
    }
    set maxValue(v: number) {
      if (this._mode === 'single') this.setLow(Number(v));
      else this.setHigh(Number(v));
    }

    /** 썸 자식 있음: {name: 값} 객체 / 레거시 range: 차이값 문자열 */
    get value(): any {
      if (this._thumbs?.length) {
        const o: RangeThumbValues = {};
        for (const t of this._thumbs) o[t.name] = t.value;
        return o;
      }
      return String(this._mode === 'single' ? this._low : this._high - this._low);
    }
    set value(v: any) {
      if (v != null && typeof v === 'object' && this._thumbs?.length) { this.setValues(v as RangeThumbValues); return; }
      const n = Number(v);
      if (!Number.isFinite(n)) return;
      if (this._mode === 'single') this.setLow(n);
      else this.setHigh(this._low + n);
    }

    get avgValue(): number {
      if (this._thumbs?.length) return this._thumbs.reduce((s, t) => s + t.value, 0) / this._thumbs.length;
      return (this.minValue + this.maxValue) / 2;
    }

    setValues(values: RangeThumbValues): void {
      if (!this._thumbs?.length || !values) return;
      for (const t of this._thumbs) {
        if (typeof values[t.name] === 'number' && Number.isFinite(values[t.name])) t.value = values[t.name];
      }
      this.clampMulti();
      this.reflectMulti();
      this.paint();
    }

    // ---------- 렌더 ----------

    @onConnectedBodyShadow
    render(): string {
      return `
        <style>
          :host { display: inline-block; touch-action: none; user-select: none; -webkit-user-select: none; width: 100%; height: 28px; }
          :host([orientation="vertical"]) { width: 28px; height: 200px; }
          :host(.has-groups) { height: 44px; }
          :host(.has-groups[orientation="vertical"]) { width: 44px; height: 200px; }
          .rs-track { position: relative; width: 100%; height: 100%; cursor: pointer; }
          .rs-rail { position: absolute; background: #e2e8f0; border-radius: 999px; }
          :host([orientation="horizontal"]) .rs-rail { left: 0; right: 0; top: 50%; height: 6px; transform: translateY(-50%); }
          :host([orientation="vertical"]) .rs-rail { top: 0; bottom: 0; left: 50%; width: 6px; transform: translateX(-50%); }
          .rs-fill { position: absolute; background: #6366f1; border-radius: 999px; }
          .rs-thumb {
            position: absolute; width: 18px; height: 18px; border-radius: 50%;
            background: #fff; border: 2px solid #6366f1; box-shadow: 0 1px 3px rgba(0,0,0,.2);
            cursor: grab; z-index: 2; outline: none;
          }
          .rs-thumb:focus-visible { box-shadow: 0 0 0 3px rgba(99,102,241,.35); }
          .rs-thumb:active { cursor: grabbing; }
          #rs-groups { position: absolute; inset: 0; pointer-events: none; z-index: 1; }
          .rs-group-bar {
            position: absolute; pointer-events: auto; cursor: grab;
            border: 1.5px solid #7c3aed; border-top: none; border-radius: 0 0 6px 6px;
            background: rgba(124,58,237,0.07);
          }
          .rs-group-bar:active { cursor: grabbing; }
          .rs-group-bar:focus-visible { outline: 2px solid #7c3aed; outline-offset: 1px; }
          :host([orientation="horizontal"]) .rs-group-bar { height: 12px; bottom: 0; }
          :host([orientation="vertical"]) .rs-group-bar { width: 12px; right: 0; border: 1.5px solid #7c3aed; border-left: none; border-radius: 0 6px 6px 0; background: rgba(124,58,237,0.07); }
          :host([orientation="vertical"]) .rs-group-bar { height: auto; }
          .rs-group-label {
            position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
            font-size: 9px; font-weight: 800; color: #7c3aed; white-space: nowrap; line-height: 1;
            pointer-events: none;
          }
        </style>
        <div class="rs-track" id="rs-track">
          <div class="rs-rail"></div>
          <div class="rs-fill" id="rs-fill"></div>
          <div class="rs-thumb" id="rs-min" tabindex="0" role="slider" aria-label="min"></div>
          <div class="rs-thumb" id="rs-max" tabindex="0" role="slider" aria-label="max"></div>
          <div id="rs-thumbs"></div>
          <div id="rs-groups"></div>
        </div>
      `;
    }

    @queryShadow('#rs-track')
    private track!: HTMLElement;
    @queryShadow('#rs-fill')
    private fill!: HTMLElement;
    @queryShadow('#rs-min')
    private thumbMin!: HTMLElement;
    @queryShadow('#rs-max')
    private thumbMax!: HTMLElement;
    @queryShadow('#rs-thumbs')
    private thumbBox!: HTMLElement;

    @onConnectedAfter
    onConnected() {
      try { this._internals = (this as any).attachInternals?.() ?? null; } catch { this._internals = null; }
      this.readAllAttributes();
      this.parseThumbs();
      this.paint();
    }

    // ---------- 속성 동기화 ----------

    @changedAttribute('min', { type: Number })
    onMinChanged(v: number) { this._min = Number.isFinite(v) ? v : 0; if (this._thumbs?.length) { this.clampMulti(); this.paint(); } else this.clampAll(false); }
    @changedAttribute('max', { type: Number })
    onMaxChanged(v: number) { this._max = Number.isFinite(v) ? v : 100; if (this._thumbs?.length) { this.clampMulti(); this.paint(); } else this.clampAll(false); }
    @changedAttribute('step', { type: Number })
    onStepChanged(v: number) { this._step = (Number.isFinite(v) && (v as number) > 0) ? (v as number) : 1; if (this._thumbs?.length) { this.clampMulti(); this.paint(); } else this.clampAll(false); }
    @changedAttribute('mode')
    onModeChanged(v: string) {
      this._mode = v === 'single' ? 'single' : 'range';
      this.clampAll(false);
    }
    @changedAttribute('orientation')
    onOrientationChanged(v: string) {
      this._orientation = v === 'vertical' ? 'vertical' : 'horizontal';
      this.paint();
    }
    @changedAttribute('min-value', { type: Number })
    onMinValueChanged(v: number) {
      if (this._syncing || !Number.isFinite(v)) return;
      this.setLow(v, true);
    }
    @changedAttribute('max-value', { type: Number })
    onMaxValueChanged(v: number) {
      if (this._syncing || !Number.isFinite(v)) return;
      if (this._mode === 'single') this.setLow(v, true);
      else this.setHigh(v, true);
    }
    @changedAttribute('value', { type: String })
    onValueChanged(v: string) {
      if (this._syncing) return;
      const n = Number(v);
      if (!Number.isFinite(n)) return;
      if (this._mode === 'single') this.setLow(n, true);
      else this.setHigh(this._low + n, true);
    }

    // ---------- 드래그 ----------

    @eventShadow('#rs-min', 'pointerdown')
    onMinDown(e: PointerEvent) {
      e.preventDefault();
      this._drag = 'min';
      try { (e.target as Element).setPointerCapture?.(e.pointerId); } catch { /* noop */ }
    }

    @eventShadow('#rs-max', 'pointerdown')
    onMaxDown(e: PointerEvent) {
      e.preventDefault();
      this._drag = this._mode === 'single' ? 'min' : 'max';
      try { (e.target as Element).setPointerCapture?.(e.pointerId); } catch { /* noop */ }
    }

    @eventShadow('#rs-track', 'pointerdown')
    onTrackDown(e: PointerEvent) {
      if ((e.target as HTMLElement)?.closest?.('.rs-thumb, .rs-group-bar')) return;
      const v = this.posToValue(e);
      if (this._thumbs?.length) {
        const i = nearestThumbIndex(this._thumbs, v);
        const nm = this._thumbs[i].name;
        this.setThumbValue(nm, v);
        this._dragThumb = null;
        this.emit('input', nm);
        this.emit('change', nm);
        return;
      }
      if (this._mode === 'single') {
        this.setLow(v);
      } else {
        const dLow = Math.abs(v - this._low);
        const dHigh = Math.abs(v - this._high);
        if (dLow <= dHigh) this.setLow(v);
        else this.setHigh(v);
      }
      this._drag = null;
      this.emit('input');
      this.emit('change');
    }

    @eventWindow('pointermove')
    onDragMove(e: PointerEvent) {
      if (this._dragGroup && this._thumbs?.length) {
        e.preventDefault();
        const v = this.posToValue(e);
        const d = v - this._dragGroup.lastV;
        this._dragGroup.lastV = v;
        const g = this._dragGroup.group;
        this.moveGroup(g, d);
        this.emit('input', `group:${g}`);
        return;
      }
      if (this._dragThumb && this._thumbs?.length) {
        e.preventDefault();
        this.setThumbValue(this._dragThumb, this.posToValue(e));
        this.emit('input', this._dragThumb);
        return;
      }
      if (!this._drag) return;
      e.preventDefault();
      const v = this.posToValue(e);
      if (this._mode === 'single' || this._drag === 'min') this.setLow(v);
      else this.setHigh(v);
      this.emit('input');
    }

    @eventWindow('pointerup')
    onDragUp() {
      if (this._dragGroup) { const g = this._dragGroup.group; this._dragGroup = null; this.emit('change', `group:${g}`); return; }
      if (this._dragThumb) { const nm = this._dragThumb; this._dragThumb = null; this.emit('change', nm); return; }
      if (!this._drag) return;
      this._drag = null;
      this.emit('change');
    }

    @eventWindow('pointercancel')
    onDragCancel() {
      if (this._dragGroup) { const g = this._dragGroup.group; this._dragGroup = null; this.emit('change', `group:${g}`); return; }
      if (this._dragThumb) { const nm = this._dragThumb; this._dragThumb = null; this.emit('change', nm); return; }
      if (!this._drag) return;
      this._drag = null;
      this.emit('change');
    }

    @eventShadow('#rs-min', 'keydown')
    onMinKey(e: KeyboardEvent) {
      const d = this.keyDelta(e);
      if (d === null) return;
      e.preventDefault();
      this.setLow(this._low + d);
      this.emit('input');
      this.emit('change');
    }

    @eventShadow('#rs-max', 'keydown')
    onMaxKey(e: KeyboardEvent) {
      const d = this.keyDelta(e);
      if (d === null) return;
      e.preventDefault();
      if (this._mode === 'single') this.setLow(this._low + d);
      else this.setHigh(this._high + d);
      this.emit('input');
      this.emit('change');
    }

    // ---------- 내부 ----------

    private setAttr(name: string, val: string) {
      this._syncing = true;
      try { this.setAttribute(name, val); } finally { this._syncing = false; }
      this.readAllAttributes();
      this.paint();
    }

    private readAllAttributes() {
      this._min = num(this.getAttribute('min'), 0);
      this._max = num(this.getAttribute('max'), 100);
      if (this._max <= this._min) this._max = this._min + 1;
      const st = num(this.getAttribute('step'), 1);
      this._step = st > 0 ? st : 1;
      this._mode = this.getAttribute('mode') === 'single' ? 'single' : 'range';
      this._orientation = this.getAttribute('orientation') === 'vertical' ? 'vertical' : 'horizontal';
      const lo = this.getAttribute('min-value');
      const hi = this.getAttribute('max-value');
      const vv = this.getAttribute('value');
      if (lo !== null) this._low = this.snap(num(lo, this._min));
      else if (vv !== null && this._mode === 'single') this._low = this.snap(num(vv, this._min));
      else if (this._low === undefined) this._low = this._min;
      if (this._mode === 'single') {
        this._high = this._max;
      } else if (hi !== null) {
        this._high = this.snap(num(hi, this._max));
      } else if (vv !== null && lo !== null) {
        this._high = this.snap(this._low + num(vv, 0));
      }
      this.clampAll(false);
    }

    private snap(v: number): number {
      const steps = Math.round((v - this._min) / this._step);
      return this._min + steps * this._step;
    }

    private setLow(v: number, fromAttr = false) {
      const nv = Math.min(Math.max(this.snap(v), this._min), this._mode === 'single' ? this._max : this._high);
      if (nv === this._low && !fromAttr) return;
      this._low = nv;
      this.afterChange(fromAttr, 'min');
    }

    private setHigh(v: number, fromAttr = false) {
      const nv = Math.min(Math.max(this.snap(v), this._low), this._max);
      if (nv === this._high && !fromAttr) return;
      this._high = nv;
      this.afterChange(fromAttr, 'max');
    }

    private clampAll(reflect = true) {
      if (this._max <= this._min) this._max = this._min + 1;
      this._low = Math.min(Math.max(this._low ?? this._min, this._min), this._max);
      this._high = Math.min(Math.max(this._high ?? this._max, this._low), this._max);
      if (this._mode === 'single') this._high = this._max;
      if (reflect) this.reflect();
      this.paint();
    }

    private afterChange(fromAttr: boolean, which: 'min' | 'max') {
      if (!fromAttr) this.reflect(which);
      this.paint();
    }

    private reflect(which?: 'min' | 'max') {
      this._syncing = true;
      try {
        this.setAttribute('min-value', String(this._low));
        if (this._mode === 'range') this.setAttribute('max-value', String(this._high));
        else this.removeAttribute('max-value');
        this.setAttribute('value', String(this._mode === 'single' ? this._low : this._high - this._low));
        void which;
      } finally {
        this._syncing = false;
      }
      try { this._internals?.setFormValue?.(this.value); } catch { /* noop */ }
    }

    private emit(type: 'input' | 'change', changed?: string) {
      const multi = !!this._thumbs?.length;
      this.dispatchEvent(new (w as any).CustomEvent(type, {
        bubbles: true,
        composed: true,
        detail: multi ? {
          values: this.value,
          minValue: this.minValue,
          maxValue: this.maxValue,
          avgValue: this.avgValue,
          changed,
          mode: 'multi',
        } : {
          minValue: this._mode === 'single' ? this._low : this._low,
          maxValue: this._mode === 'single' ? this._low : this._high,
          value: this._mode === 'single' ? this._low : this._high - this._low,
          mode: this._mode,
        },
      }));
    }

    private frac(): { lo: number; hi: number } {
      const span = this._max - this._min || 1;
      return { lo: (this._low - this._min) / span, hi: (this._high - this._min) / span };
    }

    private paint() {
      if (this._thumbs?.length) { this.paintMulti(); return; }
      this.paintLegacy();
    }

    private paintLegacy() {
      if (!this.track || !this.fill || !this.thumbMin || !this.thumbMax) return;
      const { lo, hi } = this.frac();
      const loP = Math.min(Math.max(lo, 0), 1) * 100;
      const hiP = Math.min(Math.max(hi, 0), 1) * 100;
      const isV = this._orientation === 'vertical';
      if (isV) {
        this.fill.style.left = '50%';
        this.fill.style.transform = 'translateX(-50%)';
        this.fill.style.width = '6px';
        this.fill.style.bottom = `${this._mode === 'single' ? 0 : loP}%`;
        this.fill.style.height = `${this._mode === 'single' ? loP : hiP - loP}%`;
        this.thumbMin.style.left = '50%';
        this.thumbMin.style.bottom = `${loP}%`;
        this.thumbMin.style.transform = 'translate(-50%, 50%)';
        this.thumbMax.style.left = '50%';
        this.thumbMax.style.bottom = `${hiP}%`;
        this.thumbMax.style.transform = 'translate(-50%, 50%)';
        this.thumbMax.style.display = this._mode === 'single' ? 'none' : '';
      } else {
        this.fill.style.bottom = '';
        this.fill.style.transform = '';
        this.fill.style.width = '';
        this.fill.style.height = '6px';
        this.fill.style.top = '50%';
        this.fill.style.transform = 'translateY(-50%)';
        this.fill.style.left = `${this._mode === 'single' ? 0 : loP}%`;
        this.fill.style.width = `${this._mode === 'single' ? loP : hiP - loP}%`;
        this.thumbMin.style.bottom = '';
        this.thumbMin.style.left = `${loP}%`;
        this.thumbMin.style.top = '50%';
        this.thumbMin.style.transform = 'translate(-50%, -50%)';
        this.thumbMax.style.bottom = '';
        this.thumbMax.style.left = `${hiP}%`;
        this.thumbMax.style.top = '50%';
        this.thumbMax.style.transform = 'translate(-50%, -50%)';
        this.thumbMax.style.display = this._mode === 'single' ? 'none' : '';
      }
      this.thumbMin.setAttribute('aria-valuemin', String(this._min));
      this.thumbMin.setAttribute('aria-valuemax', String(this._mode === 'single' ? this._max : this._high));
      this.thumbMin.setAttribute('aria-valuenow', String(this._low));
      this.thumbMax.setAttribute('aria-valuemin', String(this._low));
      this.thumbMax.setAttribute('aria-valuemax', String(this._max));
      this.thumbMax.setAttribute('aria-valuenow', String(this._high));
    }

    private posToValue(e: PointerEvent): number {
      const r = this.track.getBoundingClientRect();
      const isV = this._orientation === 'vertical';
      const ratio = isV
        ? 1 - Math.min(Math.max((e.clientY - r.top) / (r.height || 1), 0), 1)
        : Math.min(Math.max((e.clientX - r.left) / (r.width || 1), 0), 1);
      return this._min + ratio * (this._max - this._min);
    }

    private keyDelta(e: KeyboardEvent): number | null {
      const big = this._step * 10;
      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowRight': return this._step;
        case 'ArrowDown':
        case 'ArrowLeft': return -this._step;
        case 'PageUp': return big;
        case 'PageDown': return -big;
        case 'Home':
          if (e.target === this.thumbMin) { this.setLow(this._min); this.emit('input'); this.emit('change'); }
          else { this.setHigh(this._min); this.emit('input'); this.emit('change'); }
          return null;
        case 'End':
          if (e.target === this.thumbMin) { this.setLow(this._mode === 'single' ? this._max : this._high); this.emit('input'); this.emit('change'); }
          else { this.setHigh(this._max); this.emit('input'); this.emit('change'); }
          return null;
        default: return null;
      }
    }

    // ---------- 선언형 썸 (multi) ----------

    /**
     * 선언형 구조를 문서 순서대로 읽음:
     * - 직접 자식 <thumb name=...> → 단독 썸
     * - <thumb-group label="" color=""> 안의 <thumb> → 같은 그룹 (브래킷+팬 단위)
     * 소속은 중첩 구조로만 결정 (썸의 group 속성은 무시 — 단일 진실원천).
     */
    private readThumbStructure(): { els: Element[]; groups: { id: string; label: string; color?: string }[]; owner: Map<Element, string | undefined> } {
      const els: Element[] = [];
      const groups: { id: string; label: string; color?: string }[] = [];
      const owner = new Map<Element, string | undefined>();
      let gi = 0;
      for (const node of Array.from(this.childNodes)) {
        if (node.nodeType !== 1) continue;
        const el = node as Element;
        const tag = (el.tagName || '').toLowerCase();
        if (tag === 'thumb-group') {
          const id = `g${gi++}`;
          groups.push({
            id,
            label: el.getAttribute('label') || `그룹 ${gi}`,
            color: el.getAttribute('color') ?? undefined,
          });
          for (const sub of Array.from(el.children)) {
            if ((sub.tagName || '').toLowerCase() !== 'thumb') continue;
            if (!(sub.getAttribute('name') || '').trim()) continue;
            els.push(sub);
            owner.set(sub, id);
          }
        } else if (tag === 'thumb') {
          if (!(el.getAttribute('name') || '').trim()) continue;
          els.push(el);
          owner.set(el, undefined);
        }
      }
      return { els, groups, owner };
    }

    private parseThumbs() {
      const { els, groups, owner } = this.readThumbStructure();
      if (!els.length) {
        if (this._thumbs?.length) {
          this._thumbs = null;
          this._groups = null;
          if (this.thumbBox) this.thumbBox.innerHTML = '';
          const gb = this.shadowRoot?.querySelector('#rs-groups') as HTMLElement | null;
          if (gb) gb.innerHTML = '';
          this.classList.remove('has-groups');
          if (this.thumbMin) this.thumbMin.style.display = '';
          if (this.thumbMax) this.thumbMax.style.display = '';
          this.paint();
        } else {
          this._thumbs = null;
          this._groups = null;
        }
        return;
      }
      const gkey = groups.map(g => `${g.id}:${g.label}:${g.color ?? ''}`).join('~');
      const structKey = `${gkey}||` + els.map(el => [el.getAttribute('name'), el.getAttribute('min'), el.getAttribute('max'), el.getAttribute('step'), el.getAttribute('color'), owner.get(el) ?? ''].join('|')).join('~');
      const prevKey = this._thumbs ? (this._thumbs as any)._structKey : null;
      if (this._thumbs?.length && prevKey === structKey) {
        // 구조 동일 → value 속성만 외부에서 바뀌었는지 흡수
        let touched = false;
        for (const t of this._thumbs) {
          const raw = t.el.getAttribute('value');
          if (raw !== null) {
            const n = Number(raw);
            if (Number.isFinite(n) && n !== t.value) { t.value = n; touched = true; }
          }
        }
        if (touched) { this.clampMulti(); this.reflectMulti(); this.paint(); }
        return;
      }
      const n = els.length;
      const states = els.map((el, i) => {
        const raw = el.getAttribute('value');
        const fb = this._min + ((this._max - this._min) * (n === 1 ? 0.5 : i / (n - 1)));
        const v = raw !== null && Number.isFinite(Number(raw)) ? Number(raw) : fb;
        const st = num(el.getAttribute('step'), this._step);
        return {
          el,
          name: (el.getAttribute('name') || '').trim(),
          value: v,
          step: st > 0 ? st : this._step,
          minRef: el.getAttribute('min') ?? undefined,
          maxRef: el.getAttribute('max') ?? undefined,
          color: el.getAttribute('color') ?? undefined,
          group: owner.get(el),
        };
      });
      (states as any)._structKey = structKey;
      this._thumbs = states;
      this._groups = groups;
      this.buildMultiThumbs();
      this.clampMulti();
      this.reflectMulti();
      this.paint();
    }

    private buildMultiThumbs() {
      if (!this.thumbBox || !this._thumbs) return;
      this.thumbBox.innerHTML = '';
      const doc = this.thumbBox.ownerDocument;
      for (const t of this._thumbs) {
        const d = doc.createElement('div');
        d.className = 'rs-thumb rs-thumb-multi';
        d.dataset.name = t.name;
        d.setAttribute('tabindex', '0');
        d.setAttribute('role', 'slider');
        d.setAttribute('aria-label', t.name);
        const bc = t.color ?? (t.group ? this.groupColor(t.group) : undefined);
        if (bc) d.style.borderColor = bc;
        this.thumbBox.appendChild(d);
      }
      if (this.thumbMin) this.thumbMin.style.display = 'none';
      if (this.thumbMax) this.thumbMax.style.display = 'none';
      this.buildGroupBars();
    }

    private buildGroupBars() {
      const box = this.shadowRoot?.querySelector('#rs-groups') as HTMLElement | null;
      if (!box) return;
      box.innerHTML = '';
      const groups = this.groupNames();
      this.classList.toggle('has-groups', groups.length > 0);
      if (!this._thumbs?.length) return;
      const doc = box.ownerDocument;
      for (const g of groups) {
        const bar = doc.createElement('div');
        bar.className = 'rs-group-bar';
        bar.dataset.group = g;
        bar.setAttribute('tabindex', '0');
        bar.setAttribute('role', 'slider');
        bar.setAttribute('aria-label', this.groupLabel(g));
        const gc = this.groupColor(g);
        if (gc) {
          bar.style.borderColor = gc;
          bar.style.background = 'transparent';
        }
        const label = doc.createElement('span');
        label.className = 'rs-group-label';
        label.textContent = this.groupLabel(g);
        if (gc) label.style.color = gc;
        bar.appendChild(label);
        box.appendChild(bar);
      }
    }

    private clampMulti() {
      if (!this._thumbs?.length) return;
      if (this._max <= this._min) this._max = this._min + 1;
      clampThumbs(
        this._thumbs,
        this._thumbs.map(t => t.minRef),
        this._thumbs.map(t => t.maxRef),
        this._min,
        this._max,
      );
    }

    /** 썸 단독 이동 (제약만 적용, 그룹 전파 없음 — 그룹 이동은 브래킷 드래그) */
    private setThumbValue(name: string, v: number) {
      if (!this._thumbs?.length) return;
      const t = this._thumbs.find(x => x.name === name);
      if (!t || !Number.isFinite(v)) return;
      t.value = v;
      this.clampMulti();
      this.reflectMulti();
      this.paint();
    }

    /** 그룹 전체 리지드 이동 (브래킷 드래그용). 달성 델타 반환 */
    private moveGroup(group: string, delta: number): number {
      if (!this._thumbs?.length || !delta) return 0;
      const members = new Set(this._thumbs.filter(x => x.group === group).map(x => x.name));
      if (!members.size) return 0;
      const d = translateStates(
        this._thumbs,
        members,
        delta,
        this._thumbs.map(x => x.minRef),
        this._thumbs.map(x => x.maxRef),
        this._min,
        this._max,
      );
      this.clampMulti();
      this.reflectMulti();
      this.paint();
      return d;
    }

    private groupNames(): string[] {
      return (this._groups ?? []).map(g => g.id);
    }

    private groupLabel(group: string): string {
      return this._groups?.find(g => g.id === group)?.label ?? group;
    }

    private groupColor(group: string): string | undefined {
      return this._groups?.find(g => g.id === group)?.color;
    }

    private reflectMulti() {
      if (!this._thumbs?.length) return;
      this._syncing = true;
      try {
        for (const t of this._thumbs) {
          if (t.el.getAttribute('value') !== String(t.value)) t.el.setAttribute('value', String(t.value));
        }
      } finally {
        this._syncing = false;
      }
      try { this._internals?.setFormValue?.(JSON.stringify(this.value)); } catch { /* noop */ }
    }

    private multiBound(name: string, which: 'min' | 'max'): number {
      if (!this._thumbs?.length) return which === 'min' ? this._min : this._max;
      const t = this._thumbs.find(x => x.name === name);
      if (!t) return which === 'min' ? this._min : this._max;
      return which === 'min'
        ? resolveBound(t.minRef, this._thumbs, this._min)
        : resolveBound(t.maxRef, this._thumbs, this._max);
    }

    private paintMulti() {
      if (!this.track || !this.fill || !this.thumbBox) return;
      const vs = this._thumbs!.map(t => t.value);
      const lo = Math.min(...vs);
      const hi = Math.max(...vs);
      const span = this._max - this._min || 1;
      const pct = (v: number) => Math.min(Math.max((v - this._min) / span, 0), 1) * 100;
      const isV = this._orientation === 'vertical';
      if (isV) {
        this.fill.style.left = '50%';
        this.fill.style.transform = 'translateX(-50%)';
        this.fill.style.width = '6px';
        this.fill.style.top = '';
        this.fill.style.height = '';
        this.fill.style.bottom = `${pct(lo)}%`;
        this.fill.style.height = `${pct(hi) - pct(lo)}%`;
      } else {
        this.fill.style.bottom = '';
        this.fill.style.height = '6px';
        this.fill.style.top = '50%';
        this.fill.style.transform = 'translateY(-50%)';
        this.fill.style.left = `${pct(lo)}%`;
        this.fill.style.width = `${pct(hi) - pct(lo)}%`;
      }
      for (const t of this._thumbs!) {
        const d = this.thumbBox.querySelector(`[data-name="${t.name}"]`) as HTMLElement | null;
        if (!d) continue;
        const p = pct(t.value);
        if (isV) {
          d.style.left = '50%';
          d.style.bottom = `${p}%`;
          d.style.top = '';
          d.style.transform = 'translate(-50%, 50%)';
        } else {
          d.style.bottom = '';
          d.style.left = `${p}%`;
          d.style.top = '50%';
          d.style.transform = 'translate(-50%, -50%)';
        }
        d.setAttribute('aria-valuemin', String(this.multiBound(t.name, 'min')));
        d.setAttribute('aria-valuemax', String(this.multiBound(t.name, 'max')));
        d.setAttribute('aria-valuenow', String(t.value));
      }
      // 그룹 브래킷: 멤버 최소~최대 구간 표시
      const gbox = this.shadowRoot?.querySelector('#rs-groups') as HTMLElement | null;
      if (gbox && this._thumbs) {
        for (const g of this.groupNames()) {
          const bar = gbox.querySelector(`[data-group="${g}"]`) as HTMLElement | null;
          if (!bar) continue;
          const vs = this._thumbs.filter(t => t.group === g).map(t => t.value);
          if (!vs.length) continue;
          const loP = pct(Math.min(...vs));
          const hiP = pct(Math.max(...vs));
          if (isV) {
            bar.style.bottom = `${loP}%`;
            bar.style.height = `${hiP - loP}%`;
            bar.style.left = '';
          } else {
            bar.style.left = `${loP}%`;
            bar.style.width = `${hiP - loP}%`;
          }
          bar.setAttribute('aria-valuemin', String(Math.min(...vs)));
          bar.setAttribute('aria-valuemax', String(Math.max(...vs)));
        }
      }
    }

    @addEventListener('.rs-thumb-multi', 'pointerdown', { root: 'shadow', delegate: true })
    onMultiThumbDown(e: PointerEvent) {
      const th = (e.target as HTMLElement)?.closest?.('.rs-thumb-multi') as HTMLElement | null;
      const name = th?.dataset?.name;
      if (!name) return;
      e.preventDefault();
      this._dragThumb = name;
      try { (e.target as Element).setPointerCapture?.(e.pointerId); } catch { /* noop */ }
    }

    @addEventListener('.rs-thumb-multi', 'keydown', { root: 'shadow', delegate: true })
    onMultiThumbKey(e: KeyboardEvent) {
      const th = (e.target as HTMLElement)?.closest?.('.rs-thumb-multi') as HTMLElement | null;
      const name = th?.dataset?.name;
      if (!name || !this._thumbs?.length) return;
      const t = this._thumbs.find(x => x.name === name);
      if (!t) return;
      const big = t.step * 10;
      let handled = true;
      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowRight': this.setThumbValue(name, t.value + t.step); break;
        case 'ArrowDown':
        case 'ArrowLeft': this.setThumbValue(name, t.value - t.step); break;
        case 'PageUp': this.setThumbValue(name, t.value + big); break;
        case 'PageDown': this.setThumbValue(name, t.value - big); break;
        case 'Home': this.setThumbValue(name, this.multiBound(name, 'min')); break;
        case 'End': this.setThumbValue(name, this.multiBound(name, 'max')); break;
        default: handled = false;
      }
      if (!handled) return;
      e.preventDefault();
      this.emit('input', name);
      this.emit('change', name);
    }

    @addEventListener('.rs-group-bar', 'pointerdown', { root: 'shadow', delegate: true })
    onGroupBarDown(e: PointerEvent) {
      const bar = (e.target as HTMLElement)?.closest?.('.rs-group-bar') as HTMLElement | null;
      const group = bar?.dataset?.group;
      if (!group || !this._thumbs?.length) return;
      e.preventDefault();
      e.stopPropagation();
      this._dragGroup = { group, lastV: this.posToValue(e) };
      try { (e.target as Element).setPointerCapture?.(e.pointerId); } catch { /* noop */ }
    }

    @addEventListener('.rs-group-bar', 'keydown', { root: 'shadow', delegate: true })
    onGroupBarKey(e: KeyboardEvent) {
      const bar = (e.target as HTMLElement)?.closest?.('.rs-group-bar') as HTMLElement | null;
      const group = bar?.dataset?.group;
      if (!group || !this._thumbs?.length) return;
      const step = this._step;
      let d: number | null = null;
      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowRight': d = step; break;
        case 'ArrowDown':
        case 'ArrowLeft': d = -step; break;
        case 'PageUp': d = step * 10; break;
        case 'PageDown': d = -step * 10; break;
        default: return;
      }
      e.preventDefault();
      this.moveGroup(group, d);
      this.emit('input', `group:${group}`);
      this.emit('change', `group:${group}`);
    }

    @mutationObserverLight({ childList: true, attributes: true, subtree: true })
    onThumbChildrenMutated() {
      if (this._syncing || this._dragThumb || this._dragGroup) return;
      this.parseThumbs();
      this.paint();
    }
  }

  return RangeSliderImpl;
};
