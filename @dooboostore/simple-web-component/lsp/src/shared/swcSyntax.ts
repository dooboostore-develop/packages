export const DOM_EVENT_NAMES = [
  'click', 'dblclick', 'mousedown', 'mouseenter', 'mouseleave', 'mousemove',
  'mouseout', 'mouseover', 'mouseup', 'contextmenu', 'keydown', 'keypress',
  'keyup', 'blur', 'change', 'focus', 'focusin', 'focusout', 'input',
  'invalid', 'reset', 'search', 'select', 'submit', 'drag', 'dragend',
  'dragenter', 'dragleave', 'dragover', 'dragstart', 'drop', 'copy', 'cut',
  'paste', 'abort', 'canplay', 'canplaythrough', 'durationchange', 'emptied',
  'ended', 'error', 'loadeddata', 'loadedmetadata', 'loadstart', 'pause',
  'play', 'playing', 'progress', 'ratechange', 'seeked', 'seeking', 'stalled',
  'suspend', 'timeupdate', 'volumechange', 'waiting', 'scroll', 'resize',
  'load', 'unload', 'hashchange', 'connected'
];

export const EXPRESSION_STARTS = ['{{=', '{{@', '{{'] as const;
export const EXPRESSION_END = '}}';
export const VAR_WRAP = { start: '@', end: '@' };

export const BROWSER_GLOBALS = [
  'window', 'document', 'Node', 'Element', 'HTMLElement', 'DocumentFragment',
  'CustomEvent', 'customElements', 'NodeFilter', 'console'
];

// Reserved variables available inside SWC template expressions.
// Mirrors `getHelperAndHostSet` in Utils.ts: HelperSet + HostSet + `$this`.
export const HOST_HELPERS: Array<{ name: string; type: string; documentation: string }> = [
  { name: '$this', type: 'HTMLElement', documentation: '현재 컴포넌트 엘리먼트' },
  // HelperSet
  { name: '$w', type: 'Window', documentation: 'window 객체' },
  { name: '$d', type: 'Document', documentation: 'document 객체' },
  { name: '$q', type: '(sel, root?) => HTMLElement | null', documentation: 'querySelector' },
  { name: '$qa', type: '(sel, root?) => HTMLElement[]', documentation: 'querySelectorAll' },
  { name: '$qi', type: '(id, root?) => HTMLElement', documentation: 'getElementById' },
  // HostSet
  { name: '$host', type: 'HTMLElement | null', documentation: '가장 가까운 부모 SWC 컴포넌트' },
  { name: '$parentHost', type: 'HTMLElement | null', documentation: '조부모 SWC 조상' },
  { name: '$hosts', type: 'HTMLElement[]', documentation: '모든 SWC 조상 [root, ..., parent]' },
  { name: '$firstHost', type: 'HTMLElement | null', documentation: '최상위 SWC 조상' },
  { name: '$lastHost', type: 'HTMLElement | null', documentation: '$host와 동일' },
  { name: '$appHost', type: 'SwcAppInterface | null', documentation: '가장 가까운 앱 호스트' },
  { name: '$appHosts', type: 'SwcAppInterface[]', documentation: '모든 앱 호스트' },
  { name: '$firstAppHost', type: 'SwcAppInterface | null', documentation: '최상위 앱 호스트' },
  { name: '$lastAppHost', type: 'SwcAppInterface | null', documentation: '$appHost와 동일' }
];

// Members offered after `@name@.` based on the state/property's TS type.
// Keys mirror common type annotations found on `@state`/field declarations.
export const TYPE_MEMBERS: Record<string, Array<{ label: string; documentation?: string }>> = {
  number: [
    { label: 'toString', documentation: '→ string' },
    { label: 'toFixed', documentation: 'toFixed(digits?) → string' },
    { label: 'toPrecision', documentation: 'toPrecision(precision?) → string' },
    { label: 'toExponential', documentation: 'toExponential(fractionDigits?) → string' },
    { label: 'valueOf', documentation: '→ number' }
  ],
  string: [
    { label: 'toString', documentation: '→ string' },
    { label: 'toUpperCase', documentation: '→ string' },
    { label: 'toLowerCase', documentation: '→ string' },
    { label: 'trim', documentation: 'trim() → string' },
    { label: 'replace', documentation: 'replace(searchValue, replaceValue) → string' },
    { label: 'split', documentation: 'split(separator, limit?) → string[]' },
    { label: 'includes', documentation: 'includes(searchString, position?) → boolean' },
    { label: 'startsWith', documentation: 'startsWith(searchString) → boolean' },
    { label: 'endsWith', documentation: 'endsWith(searchString) → boolean' },
    { label: 'slice', documentation: 'slice(start?, end?) → string' },
    { label: 'length', documentation: '→ number (property)' }
  ],
  boolean: [
    { label: 'toString', documentation: '→ string' },
    { label: 'valueOf', documentation: '→ boolean' }
  ],
  'string[]': [
    { label: 'map', documentation: 'map<U>(callbackfn) → U[]' },
    { label: 'filter', documentation: 'filter(predicate) → T[]' },
    { label: 'forEach', documentation: 'forEach(callback) → void' },
    { label: 'length', documentation: 'length → number' },
    { label: 'includes', documentation: 'includes(searchElement) → boolean' },
    { label: 'join', documentation: 'join(separator?) → string' },
    { label: 'push', documentation: 'push(...items) → number' }
  ],
  'number[]': [
    { label: 'map', documentation: 'map<U>(callback) → U[]' },
    { label: 'filter', documentation: 'filter(predicate) → T[]' },
    { label: 'forEach', documentation: 'forEach(callback) → void' },
    { label: 'length', documentation: 'length → number' },
    { label: 'reduce', documentation: 'reduce(reducer, initialValue?) → number' },
    { label: 'sort', documentation: 'sort(comparator?) → T[]' },
    { label: 'join', documentation: 'join(separator?) → string' }
  ]
};

export const GENERIC_MEMBERS: Array<{ label: string; documentation?: string }> = [
  { label: 'toString', documentation: '→ string' }
];
