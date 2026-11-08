/**
 * Input value sanitization + constraint validation, matching Chromium
 * (measured matrix — see the tests for the exact probes).
 */

export type InputType = string;

const NUMBER_RE = /^-?(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][-+]?\d+)?$/;
const DATE_RE = /^(\d{4,})-(\d{2})-(\d{2})$/;
const TIME_RE = /^(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;
const COLOR_HEX_RE = /^#([0-9a-fA-F]{6})$/;

const NAMED_COLORS: Record<string, string> = {
  black: '#000000', white: '#ffffff', red: '#ff0000', green: '#008000', blue: '#0000ff',
  yellow: '#ffff00', cyan: '#00ffff', magenta: '#ff00ff', gray: '#808080', grey: '#808080',
  silver: '#c0c0c0', maroon: '#800000', olive: '#808000', lime: '#00ff00', aqua: '#00ffff',
  teal: '#008080', navy: '#000080', fuchsia: '#ff00ff', purple: '#800080', orange: '#ffa500',
};

function isValidDate(value: string): boolean {
  const m = DATE_RE.exec(value);
  if (!m) return false;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1) return false;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return day <= daysInMonth;
}

function isValidTime(value: string): boolean {
  const m = TIME_RE.exec(value);
  if (!m) return false;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  const second = m[3] === undefined ? 0 : Number(m[3]);
  return hour <= 23 && minute <= 59 && second <= 59;
}

/**
 * The input value sanitization algorithm, per type. Returns the value the
 * element should expose (and a flag for whether the raw value was invalid).
 */
export function sanitizeInputValue(type: string, rawValue: string): string {
  switch (type) {
    case 'range': {
      // Sanitized to the default 50, then clamped to min/max by the caller.
      if (!NUMBER_RE.test(rawValue)) return '50';
      return rawValue;
    }
    case 'number': {
      // Strict: '12:30' and ' 12 ' are invalid (Chromium measured).
      return NUMBER_RE.test(rawValue) ? rawValue : '';
    }
    case 'color': {
      const lower = rawValue.trim().toLowerCase();
      if (COLOR_HEX_RE.test(rawValue)) return rawValue;
      if (NAMED_COLORS[lower]) return NAMED_COLORS[lower];
      return '#000000';
    }
    case 'date':
      return isValidDate(rawValue) ? rawValue : '';
    case 'time':
      return isValidTime(rawValue) ? rawValue : '';
    case 'email':
      // Whitespace is stripped (browsers: ' a@b.c ' -> 'a@b.c').
      return rawValue.replace(/[\r\n\t ]/g, '');
    default:
      return rawValue;
  }
}

/** Numeric value of a number/range input, or NaN. */
export function parseValueAsNumber(type: string, value: string): number {
  if (type !== 'number' && type !== 'range') return NaN;
  if (value === '') return NaN;
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

/**
 * Whether the element is barred from constraint validation (Chromium
 * measured): disabled, readonly, hidden, inside a <datalist>, inside a
 * disabled <fieldset>, or a <button type=button|reset|menu>.
 */
export function isBarredFromValidation(element: any): boolean {
  const tag = String(element?.tagName ?? '').toUpperCase();
  const attr = (n: string) => (typeof element?.hasAttribute === 'function' ? element.hasAttribute(n) : false);

  if (attr('disabled')) return true;

  if (tag === 'INPUT') {
    if (attr('readonly')) return true;
    const type = String(element.getAttribute?.('type') ?? 'text').toLowerCase();
    if (type === 'hidden') return true;
  }

  if (tag === 'BUTTON') {
    const type = String(element.getAttribute?.('type') ?? 'submit').toLowerCase();
    if (type === 'button' || type === 'reset' || type === 'menu') return true;
  }

  let node = element?.parentNode;
  while (node) {
    const parentTag = String(node.tagName ?? '').toUpperCase();
    if (parentTag === 'DATALIST') return true;
    if (parentTag === 'FIELDSET' && node.hasAttribute?.('disabled')) return true;
    node = node.parentNode;
  }
  return false;
}

/**
 * `validity.valueMissing`: required, not barred, and holding no value.
 * Note Chromium still computes this for datalist descendants (where
 * willValidate is false), so callers must not short-circuit on willValidate.
 */
export function computeValueMissing(element: any): boolean {
  const tag = String(element?.tagName ?? '').toUpperCase();
  if (!element?.hasAttribute?.('required')) return false;
  const attr = (n: string) => element.hasAttribute(n);
  if (attr('disabled')) return false;
  if (tag === 'INPUT') {
    if (attr('readonly')) return false;
    const type = String(element.getAttribute?.('type') ?? 'text').toLowerCase();
    if (type === 'hidden') return false;
    if (type === 'checkbox' || type === 'radio') return !attr('checked');
  }
  if (tag === 'BUTTON') {
    const type = String(element.getAttribute?.('type') ?? 'submit').toLowerCase();
    if (type === 'button' || type === 'reset' || type === 'menu') return false;
  }
  // A disabled <fieldset> ancestor also bars the control, and unlike the
  // <datalist> case Chromium reports valueMissing === false there
  // (measured: datalist keeps true, fieldset gives false).
  let node = element?.parentNode;
  while (node) {
    const parentTag = String(node.tagName ?? '').toUpperCase();
    if (parentTag === 'FIELDSET' && node.hasAttribute?.('disabled')) return false;
    node = node.parentNode;
  }
  const value = String(element.value ?? '');
  return value === '';
}

const ValidityStateImp = class {
  constructor(private readonly element: any) {}
  get valueMissing(): boolean {
    return computeValueMissing(this.element);
  }
  get patternMismatch(): boolean {
    const pattern = this.element.getAttribute?.('pattern');
    if (!pattern) return false;
    let re: RegExp;
    try {
      re = new RegExp(`^(?:${pattern})$`, 'v');
    } catch {
      // Invalid patterns are ignored (Chromium: no throw, no mismatch).
      try {
        re = new RegExp(`^(?:${pattern})$`, 'u');
      } catch {
        return false;
      }
    }
    return !re.test(String(this.element.value ?? ''));
  }
  get valid(): boolean {
    return !this.valueMissing && !this.patternMismatch;
  }
};

export function createValidityState(element: any): any {
  return new ValidityStateImp(element);
}
