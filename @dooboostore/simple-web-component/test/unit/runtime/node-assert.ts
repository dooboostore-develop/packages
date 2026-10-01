// 브라우저용 `node:assert` 대체 — 테스트가 쓰는 것만: strictEqual / notStrictEqual / deepStrictEqual / ok / throws / rejects

export class AssertionError extends Error {
  name = 'AssertionError';
  constructor(message: string, public actual?: unknown, public expected?: unknown) { super(message); }
}

const show = (v: unknown): string => {
  if (v && typeof v === 'object' && 'nodeType' in (v as any)) {
    const n = v as any;
    return n.nodeType === 1 ? `<${n.tagName.toLowerCase()}${n.id ? '#' + n.id : ''}${n.className ? '.' + String(n.className).split(' ').join('.') : ''}>` : `[${n.nodeName}]`;
  }
  if (typeof v === 'string') return JSON.stringify(v);
  if (typeof v === 'function') return `[Function ${v.name || 'anonymous'}]`;
  if (typeof v === 'symbol' || typeof v === 'bigint' || v === undefined) return String(v);
  if (Array.isArray(v)) return `[${v.map(show).join(', ')}]`;
  if (v instanceof Map) return `Map(${[...v].map(([k, x]) => `${show(k)} => ${show(x)}`).join(', ')})`;
  if (v instanceof Set) return `Set(${[...v].map(show).join(', ')})`;
  if (v && typeof v === 'object') {
    const keys = [...Object.keys(v), ...Object.getOwnPropertySymbols(v)];
    return `{ ${keys.map(k => `${String(k)}: ${show((v as any)[k])}`).join(', ')} }`;
  }
  return String(v);
};

const fail = (message: string | undefined, fallback: string, actual?: unknown, expected?: unknown): never => {
  throw new AssertionError(message ? `${message}\n  ${fallback}` : fallback, actual, expected);
};

const tag = (v: unknown) => Object.prototype.toString.call(v);

// node 의 isDeepStrictEqual 과 같은 규칙: 원시값 Object.is, 같은 종류, own enumerable 키(심볼 포함), Map/Set/Date/RegExp
// iframe(다른 realm) 객체도 비교하므로 prototype 동일성 대신 종류(tag)와 배열 여부로 본다
const deepEqual = (a: any, b: any, seen = new Map<any, any>()): boolean => {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (tag(a) !== tag(b) || Array.isArray(a) !== Array.isArray(b)) return false;
  if ('nodeType' in a || 'nodeType' in b) return false; // DOM 노드는 같은 객체일 때만
  if (seen.get(a) === b) return true;
  seen.set(a, b);
  if (a instanceof Date || tag(a) === '[object Date]') return a.getTime() === b.getTime();
  if (tag(a) === '[object RegExp]') return String(a) === String(b);
  if (tag(a) === '[object Map]') {
    if (a.size !== b.size) return false;
    for (const [k, v] of a) if (!b.has(k) || !deepEqual(v, b.get(k), seen)) return false;
    return true;
  }
  if (tag(a) === '[object Set]') {
    if (a.size !== b.size) return false;
    for (const v of a) if (!b.has(v)) return false;
    return true;
  }
  const ka = [...Object.keys(a), ...Object.getOwnPropertySymbols(a).filter(s => Object.prototype.propertyIsEnumerable.call(a, s))];
  const kb = [...Object.keys(b), ...Object.getOwnPropertySymbols(b).filter(s => Object.prototype.propertyIsEnumerable.call(b, s))];
  if (ka.length !== kb.length) return false;
  for (const k of ka) if (!Object.prototype.hasOwnProperty.call(b, k) || !deepEqual(a[k], b[k], seen)) return false;
  return true;
};

const matches = (err: any, expected: unknown): boolean => {
  if (expected === undefined) return true;
  if (expected instanceof RegExp) return expected.test(String(err?.message ?? err));
  if (typeof expected === 'function') {
    if (expected.prototype !== undefined && err instanceof (expected as any)) return true;
    if (Error.isPrototypeOf(expected as any) || expected === Error) return false;
    return (expected as any)(err) === true;
  }
  if (expected && typeof expected === 'object') return Object.entries(expected).every(([k, v]) => v instanceof RegExp ? v.test(err?.[k]) : deepEqual(err?.[k], v));
  return false;
};

function assert(value: unknown, message?: string): asserts value { if (!value) fail(message, `expected truthy, got ${show(value)}`, value, true); }

assert.ok = assert;
assert.strictEqual = (actual: unknown, expected: unknown, message?: string) => {
  if (!Object.is(actual, expected)) fail(message, `Expected values to be strictly equal:\n    actual: ${show(actual)}\n  expected: ${show(expected)}`, actual, expected);
};
assert.notStrictEqual = (actual: unknown, expected: unknown, message?: string) => {
  if (Object.is(actual, expected)) fail(message, `Expected "actual" to be strictly unequal to: ${show(expected)}`, actual, expected);
};
assert.deepStrictEqual = (actual: unknown, expected: unknown, message?: string) => {
  if (!deepEqual(actual, expected)) fail(message, `Expected values to be strictly deep-equal:\n    actual: ${show(actual)}\n  expected: ${show(expected)}`, actual, expected);
};
assert.throws = (fn: () => unknown, expected?: unknown, message?: string) => {
  try { fn(); } catch (e) {
    if (!matches(e, expected)) fail(message, `The error did not match: ${show((e as any)?.message ?? e)}`);
    return;
  }
  fail(message, 'Missing expected exception.');
};
assert.rejects = async (promiseOrFn: Promise<unknown> | (() => Promise<unknown>), expected?: unknown, message?: string) => {
  try { await (typeof promiseOrFn === 'function' ? promiseOrFn() : promiseOrFn); } catch (e) {
    if (!matches(e, expected)) fail(message, `The rejection did not match: ${show((e as any)?.message ?? e)}`);
    return;
  }
  fail(message, 'Missing expected rejection.');
};

export default assert;
export const { ok, strictEqual, notStrictEqual, deepStrictEqual, throws, rejects } = assert;
