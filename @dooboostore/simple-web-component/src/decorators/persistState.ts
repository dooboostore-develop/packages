import { ReflectUtils } from '@dooboostore/core';

export type PersistStorage = 'local' | 'session' | 'cookie' | 'indexeddb';
/** Sync backends complete synchronously; async ones resolve in a microtask/macrotask. */
export const ASYNC_STORAGES: ReadonlySet<string> = new Set(['indexeddb']);
export const isAsyncStorage = (storage?: string) => ASYNC_STORAGES.has(storage ?? 'local');
export interface CookieOpts {
  path?: string;
  domain?: string;
  maxAge?: number;
  expires?: Date;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}
export interface CookieRemoveOpts {
  path?: string;
  domain?: string;
}
export type PersistOptions =
  | { storage?: 'local' | 'session' | 'indexeddb'; valueKey?: string | symbol; serialize?: (v: any) => string; deserialize?: (s: string) => any }
  | ({ storage: 'cookie'; valueKey?: string | symbol; serialize?: (v: any) => string; deserialize?: (s: string) => any } & CookieOpts);
export type RemovePersistOptions =
  | { storage?: 'local' | 'session' | 'indexeddb'; valueKey?: string | symbol }
  | ({ storage: 'cookie'; valueKey?: string | symbol } & CookieRemoveOpts);

/** Marks a method already wrapped for persist injection — prevents double-wrap. */
const PERSIST_WRAPPED = Symbol.for('simple-web-component:persist-wrapped');

const winOf = (inst: any): any => {
  try {
    return inst?.ownerDocument?.defaultView ?? (globalThis as any);
  } catch { return globalThis as any; }
};
const storeOf = (w: any, storage: PersistStorage): Storage | null => {
  try {
    if (storage === 'local') return w?.localStorage ?? null;
    if (storage === 'session') return w?.sessionStorage ?? null;
    return null;
  } catch { return null; }
};

const readCookie = (w: any, key: string): string | null => {
  try {
    const doc = w?.document ?? (globalThis as any)?.document;
    if (!doc?.cookie && doc?.cookie !== '') return null;
    const parts = String(doc.cookie).split(';');
    for (const p of parts) {
      const i = p.indexOf('=');
      const k = p.slice(0, i).trim();
      if (k === key) return decodeURIComponent(p.slice(i + 1).trim());
    }
    return null;
  } catch { return null; }
};
const writeCookie = (w: any, key: string, raw: string, opts: CookieOpts = {}) => {
  const doc = w?.document ?? (globalThis as any)?.document;
  if (!doc) return;
  let c = `${key}=${encodeURIComponent(raw)}; path=${opts.path ?? '/'}`;
  if (opts.domain) c += `; domain=${opts.domain}`;
  if (opts.maxAge !== undefined) c += `; max-age=${opts.maxAge}`;
  if (opts.expires) c += `; expires=${opts.expires.toUTCString()}`;
  if (opts.secure) c += '; secure';
  if (opts.sameSite) c += `; samesite=${opts.sameSite}`;
  try { doc.cookie = c; } catch { /* ignore */ }
};
const eraseCookie = (w: any, key: string, opts: CookieRemoveOpts = {}) => {
  writeCookie(w, key, '', { path: opts.path ?? '/', domain: opts.domain, expires: new Date(0) });
};

// ─── IndexedDB backend (async; single db/store, raw strings) ───
const IDB_DB = 'swc-persist';
const IDB_STORE = 'kv';
const idbConns = new WeakMap<object, Promise<any>>();
const idbOpen = (w: any): Promise<any> => {
  const idb = w?.indexedDB ?? (globalThis as any)?.indexedDB;
  if (!idb) return Promise.reject(new Error('[SWC] indexedDB unavailable'));
  const wKey = w ?? globalThis;
  let p = idbConns.get(wKey);
  if (!p) {
    p = new Promise((resolve, reject) => {
      const req = idb.open(IDB_DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    // 열기에 실패하면 캐시에서 지워서 다음 호출이 재시도할 수 있게 한다 — 그대로 캐싱해두면 한 번 실패로 영구히 막힌다.
    p.catch(() => idbConns.delete(wKey));
    idbConns.set(wKey, p);
  }
  return p;
};
const idbTx = async (w: any, mode: IDBTransactionMode, fn: (store: any) => IDBRequest): Promise<any> => {
  const db = await idbOpen(w);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, mode);
    const req = fn(tx.objectStore(IDB_STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};
const idbGet = (w: any, key: string): Promise<string | null> =>
  idbTx(w, 'readonly', (s) => s.get(key)).then((v) => (v === undefined ? null : v));
const idbSet = (w: any, key: string, raw: string): Promise<void> =>
  idbTx(w, 'readwrite', (s) => s.put(raw, key)).then(() => undefined);
const idbDel = (w: any, key: string): Promise<void> =>
  idbTx(w, 'readwrite', (s) => s.delete(key)).then(() => undefined);

const defSer = (v: any) => JSON.stringify(v);
const defDe = (s: string) => {
  try { return JSON.parse(s); } catch { return s; }
};

export async function persistReadAsync(inst: any, key: string, opts: PersistOptions & { storage?: PersistStorage }): Promise<any> {
  const storage = opts?.storage ?? 'local';
  if (!isAsyncStorage(storage)) return persistRead(inst, key, opts);
  const de = (opts as any)?.deserialize ?? defDe;
  const raw = await idbGet(winOf(inst), key);
  if (raw === null || raw === undefined) return undefined;
  try { return de(raw); } catch { return raw; }
}
export async function persistWriteAsync(inst: any, key: string, value: any, opts: PersistOptions & { storage?: PersistStorage }): Promise<void> {
  const storage = opts?.storage ?? 'local';
  if (!isAsyncStorage(storage)) { persistWrite(inst, key, value, opts); return; }
  if (value === undefined) { await persistRemoveAsync(inst, key, opts as any); return; }
  const se = (opts as any)?.serialize ?? defSer;
  await idbSet(winOf(inst), key, se(value));
}
export async function persistRemoveAsync(inst: any, key: string, opts: RemovePersistOptions & { storage?: PersistStorage } = {}): Promise<void> {
  const storage = (opts as any)?.storage ?? 'local';
  if (!isAsyncStorage(storage)) { persistRemove(inst, key, opts); return; }
  await idbDel(winOf(inst), key);
}

const warnedAsyncField = new WeakSet<object>();
const isPromiseLike = (v: any) => v instanceof Promise || (v && typeof v.then === 'function');

export function persistRead(inst: any, key: string, opts: PersistOptions & { storage?: PersistStorage }): any {
  const storage = opts?.storage ?? 'local';
  const de = (opts as any)?.deserialize ?? defDe;
  const w = winOf(inst);
  let raw: string | null = null;
  if (storage === 'cookie') raw = readCookie(w, key);
  else raw = storeOf(w, storage)?.getItem(key) ?? null;
  if (raw === null || raw === undefined) return undefined;
  try { return de(raw); } catch { return raw; }
}
export function persistWrite(inst: any, key: string, value: any, opts: PersistOptions & { storage?: PersistStorage }) {
  const storage = opts?.storage ?? 'local';
  if (value === undefined) { persistRemove(inst, key, opts as any); return; }
  const se = (opts as any)?.serialize ?? defSer;
  const raw = se(value);
  const w = winOf(inst);
  if (storage === 'cookie') writeCookie(w, key, raw, opts as CookieOpts);
  else {
    try { storeOf(w, storage)?.setItem(key, raw); }
    catch (e) { console.warn('[SWC] persistState write failed:', e); }
  }
}
export function persistRemove(inst: any, key: string, opts: RemovePersistOptions & { storage?: PersistStorage } = {}) {
  const storage = (opts as any)?.storage ?? 'local';
  const w = winOf(inst);
  if (storage === 'cookie') eraseCookie(w, key, opts as CookieRemoveOpts);
  else {
    try { storeOf(w, storage)?.removeItem(key); } catch { /* ignore */ }
  }
}

const pickValue = (ret: any, valueKey?: string | symbol) =>
  valueKey !== undefined ? (ret && typeof ret === 'object' ? ret[valueKey] : undefined) : ret;

function defineField(targetObj: any, propertyKey: string | symbol, key: string, opts: PersistOptions & { storage?: PersistStorage }) {
  const slot = Symbol(`persist:${String(propertyKey)}`);
  const initialized = Symbol(`persist:init:${String(propertyKey)}`);
  const storage = (opts as any)?.storage ?? 'local';
  const async = isAsyncStorage(storage);
  // Runtime guard: a getter cannot await — the first read resolves behind.
  // Warn once per class so the flicker (initial → restored) is a conscious choice.
  if (async && !warnedAsyncField.has(targetObj)) {
    warnedAsyncField.add(targetObj);
    console.warn(`[SWC] @persistState(${storage}) on field "${String(propertyKey)}" resolves asynchronously: first read returns the initializer, the stored value lands right after. Prefer calling persistReadAsync directly or Promise-typed fields for async backends.`);
  }
  Object.defineProperty(targetObj, propertyKey, {
    get(this: any) {
      const own = Object.getOwnPropertyDescriptor(this, propertyKey);
      if (own && 'value' in own) {
        delete this[propertyKey];
        const initVal = own.value;
        // Promise initializer: persist its resolution, expose the promise meanwhile.
        // Stored value still wins if present — mirrors the non-Promise branch below.
        if (async && isPromiseLike(initVal)) {
          this[slot] = initVal;
          this[initialized] = true;
          void persistReadAsync(this, key, opts).then((stored) => {
            if (stored !== undefined) {
              this[slot] = Promise.resolve(stored);
            } else {
              void (initVal as Promise<any>).then((v) => {
                this[slot] = v;
                void persistWriteAsync(this, key, v, opts).catch((e) => console.warn('[SWC] persistState write failed:', e));
              });
            }
          }).catch(() => undefined);
          return this[slot];
        }
        this[slot] = initVal;
        this[initialized] = true;
        // initializer wins on first boot? No — stored value wins if present.
        if (async) {
          // cannot await in a getter — read behind, update the slot when it lands.
          void persistReadAsync(this, key, opts).then((stored) => {
            if (stored !== undefined) this[slot] = stored;
            else void persistWriteAsync(this, key, this[slot], opts).catch((e) => console.warn('[SWC] persistState write failed:', e));
          }).catch(() => undefined);
        } else {
          const stored = persistRead(this, key, opts);
          if (stored !== undefined) this[slot] = stored;
          else persistWrite(this, key, this[slot], opts);
        }
        return this[slot];
      }
      if (!this[initialized]) {
        this[initialized] = true;
        if (async) {
          void persistReadAsync(this, key, opts).then((stored) => {
            if (stored !== undefined) this[slot] = stored;
            else if (this[slot] !== undefined) void persistWriteAsync(this, key, this[slot], opts).catch((e) => console.warn('[SWC] persistState write failed:', e));
          }).catch(() => undefined);
        } else {
          const stored = persistRead(this, key, opts);
          this[slot] = stored !== undefined ? stored : this[slot];
          if (stored === undefined && this[slot] !== undefined) persistWrite(this, key, this[slot], opts);
        }
      }
      return this[slot];
    },
    set(this: any, nv: any) {
      if (async) {
        const firstCall = !this[initialized];
        this[slot] = nv;
        this[initialized] = true;
        if (firstCall) {
          // 필드 초기화의 첫 set — 생성자 할당(또는 초기값 없는 필드의 첫 접근)이라 저장된 값이 있으면 그게 이긴다.
          void persistReadAsync(this, key, opts).then((stored) => {
            if (stored !== undefined) { this[slot] = isPromiseLike(nv) ? Promise.resolve(stored) : stored; return; }
            if (isPromiseLike(nv)) {
              void (nv as Promise<any>).then((v) => {
                this[slot] = v;
                void persistWriteAsync(this, key, v, opts).catch((e) => console.warn('[SWC] persistState write failed:', e));
              });
            } else if (nv !== undefined) {
              void persistWriteAsync(this, key, nv, opts).catch((e) => console.warn('[SWC] persistState write failed:', e));
            }
          }).catch(() => undefined);
          return;
        }
        // 생성자 이후의 명시적 재할당 — 의도된 덮어쓰기이므로 그대로 저장.
        if (isPromiseLike(nv)) {
          void (nv as Promise<any>).then((v) => {
            this[slot] = v;
            void persistWriteAsync(this, key, v, opts).catch((e) => console.warn('[SWC] persistState write failed:', e));
          });
        } else if (nv === undefined) {
          void persistRemoveAsync(this, key, opts as any).catch(() => undefined);
        } else {
          void persistWriteAsync(this, key, nv, opts).catch((e) => console.warn('[SWC] persistState write failed:', e));
        }
        return;
      }
      // field initializer runs through the setter at construction and would
      // clobber the stored value — stored wins on first write.
      if (!this[initialized]) {
        const stored = persistRead(this, key, opts);
        this[initialized] = true;
        if (stored !== undefined) { this[slot] = stored; return; }
      }
      this[slot] = nv;
      this[initialized] = true;
      persistWrite(this, key, nv, opts);
    },
    enumerable: true,
    configurable: true,
  });
}

function wrapMethod(targetObj: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor, key: string, opts: PersistOptions & { storage?: PersistStorage }) {
  const original = descriptor.value;
  if ((original as any)[PERSIST_WRAPPED]) return descriptor;
  const storage = (opts as any)?.storage ?? 'local';
  const async = isAsyncStorage(storage);
  const wrapped = function (this: any, ...args: any[]) {
    const res = (original as any).apply(this, args);
    const doPersist = (v: any) => {
      const val = pickValue(v, (opts as any)?.valueKey);
      if (val === undefined) return;
      if (async) void persistWriteAsync(this, key, val, opts).catch((e) => console.warn('[SWC] persistState write failed:', e));
      else persistWrite(this, key, val, opts);
    };
    if (res instanceof Promise) return res.then((v: any) => { doPersist(v); return v; });
    doPersist(res);
    return res;
  };
  (wrapped as any)[PERSIST_WRAPPED] = true;
  descriptor.value = wrapped;
  return descriptor;
}

// ─── persistState (field + method, bareable) ───
export function persistState(target: Object, propertyKey: string | symbol): void;
export function persistState(key?: string, options?: PersistOptions): PropertyDecorator & MethodDecorator;
export function persistState(keyOrTarget?: string | Object, optionsOrKey?: PersistOptions | string | symbol, descriptor?: PropertyDescriptor): any {
  // bare: @persistState
  if (typeof keyOrTarget === 'object' && (typeof optionsOrKey === 'string' || typeof optionsOrKey === 'symbol')) {
    const targetObj = keyOrTarget as Object;
    const propertyKey = optionsOrKey as string | symbol;
    if (descriptor) return wrapMethod(targetObj, propertyKey, descriptor, String(propertyKey), { storage: 'local' });
    defineField(targetObj, propertyKey, String(propertyKey), { storage: 'local' });
    return;
  }
  const key = typeof keyOrTarget === 'string' ? keyOrTarget : undefined;
  const opts = (typeof keyOrTarget === 'object' && keyOrTarget !== null ? {} : (optionsOrKey as PersistOptions ?? {})) as PersistOptions & { storage?: PersistStorage };
  return (targetObj: Object, propertyKey: string | symbol, desc?: PropertyDescriptor): any => {
    const k = key ?? String(propertyKey);
    if (desc) return wrapMethod(targetObj, propertyKey, desc, k, opts);
    defineField(targetObj, propertyKey, k, opts);
  };
}

// thin aliases — storage preset
const alias = (storage: PersistStorage, extra: any = {}) => {
  const fn = (a?: any, b?: any, c?: PropertyDescriptor): any => {
    // bare: @localStorage
    if (typeof b === 'string' || typeof b === 'symbol') {
      if (c) return wrapMethod(a, b, c, String(b), { storage, ...extra });
      defineField(a, b, String(b), { storage, ...extra });
      return;
    }
    if (typeof a === 'string') return persistState(a, { ...(b ?? {}), storage, ...extra });
    if (a && typeof a === 'object' && b === undefined && c === undefined) {
      // @localStorage({...}) options form
      return persistState(undefined, { ...(a ?? {}), storage, ...extra });
    }
    return (persistState(undefined, { storage, ...extra }) as any)(a, b, c!);
  };
  return fn;
};
export const localStorage = alias('local');
export const sessionStorage = alias('session');
export const cookie = alias('cookie', { path: '/' });
/** Async backend — see runtime guards in wrapMethod/defineField. */
export const indexedDb = alias('indexeddb');

// ─── remove* (method only, Declaration = action) ───
export function removePersistState(key?: string, options?: RemovePersistOptions): MethodDecorator;
export function removePersistState(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): any;
export function removePersistState(a?: any, b?: any, c?: PropertyDescriptor): any {
  if (c) {
    const propertyKey = b as string | symbol;
    const orig = c.value;
    c.value = function (...args: any[]) {
      const res = orig.apply(this, args);
      const doRemove = (v: any) => {
        const go = (a as RemovePersistOptions)?.valueKey !== undefined
          ? (v && typeof v === 'object' ? v[(a as any).valueKey] : undefined)
          : true;
        if (!go) return;
        persistRemove(this, String(propertyKey), (a as any) ?? {});
      };
      if (res instanceof Promise) return res.then((v: any) => { doRemove(v); return v; });
      doRemove(res);
      return res;
    };
    return c;
  }
  const key = typeof a === 'string' ? a : undefined;
  const opts = (typeof a === 'object' && a !== null ? a : (b as any ?? {})) as RemovePersistOptions;
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): any => {
    const k = key ?? String(propertyKey);
    const orig = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const res = orig.apply(this, args);
      const doRemove = (v: any) => {
        const vk = (opts as any)?.valueKey;
        const go = vk !== undefined ? (v && typeof v === 'object' ? v[vk] : undefined) : true;
        if (!go) return;
        persistRemove(this, k, opts);
      };
      if (res instanceof Promise) return res.then((v: any) => { doRemove(v); return v; });
      doRemove(res);
      return res;
    };
    return descriptor;
  };
}
const removeAlias = (storage: PersistStorage) => (a?: any, b?: any, c?: PropertyDescriptor): any => {
  if (c) {
    const key = String(b);
    return removePersistState(key, { storage } as any)(a!, b!, c);
  }
  if (typeof a === 'string') return removePersistState(a, { ...(b ?? {}), storage } as any);
  if (a && typeof a === 'object') return removePersistState(undefined, { ...(a ?? {}), storage } as any);
  // bare @removeLocalStorage
  return (t: Object, pk: string | symbol, d: PropertyDescriptor): any =>
    removePersistState(String(pk), { storage } as any)(t, pk, d);
};
export const removeLocalStorage = removeAlias('local');
export const removeSessionStorage = removeAlias('session');
export const removeCookie = removeAlias('cookie');
export const removeIndexedDb = removeAlias('indexeddb');
