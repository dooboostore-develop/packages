import { ReflectUtils } from '@dooboostore/core';
import { ensureInit, getElementConfig } from './elementDefine';
import { SwcUtils } from '../utils/Utils';
import { HelperHostSet } from '../types';

export const AROUND_METADATA_KEY = Symbol.for('simple-web-component:around');

export interface AroundMetadata {
  propertyKey: string | symbol;
}

export interface AroundPropertyOptions<Value = any> {
  /**
   * get할 때 (helperHostSet, 저장된 값)을 받아 실제로 읽는 쪽에 돌려줄 값을 리턴한다.
   * undefined 리턴이면 저장값 그대로 통과. 안 주면 그대로 통과.
   */
  get?: (helperHostSet: HelperHostSet, stored: Value) => Value | void;
  /**
   * set할 때 (helperHostSet, 대입되는 값)을 받아 실제로 저장할 값을 리턴한다.
   * 안 주면 그대로 통과.
   */
  set?: (helperHostSet: HelperHostSet, incoming: Value) => Value | void;
}
export interface AroundOptions<Args extends any[] = any[], Return = any> {
  /**
   * 원본 실행 전에, (helperHostSet, 호출자가 넘긴 인자 배열)을 받아
   * 실제로 원본에 넘길 인자 배열을 리턴한다. undefined 리턴이면 인자 그대로 통과.
   * 원본이 Promise를 리턴하면 before도 Promise를 리턴할 수 있다 —
   * resolve된 값으로 원본이 호출된다 (이 경우 래퍼도 Promise 반환).
   * 원본이 sync면 before도 sync여야 한다 (async를 달면 호출 측이 모르는 Promise가 새어나감).
   * 안 주면 그대로 통과.
   *
   * 제네릭 생략 시(Return=any) 양쪽 다 허용이라 느슨하게 동작하고,
   * `@around<[number], number>`처럼 명시하면 위 규칙이 검사된다.
   */
  before?: (helperHostSet: HelperHostSet, args: Args) => Return extends Promise<any> ? Args | void | Promise<Args | void> : Args | void;
  /**
   * 원본 실행 후에, (helperHostSet, 리턴값)을 받아 실제로 호출자에게
   * 돌려줄 값을 리턴한다.
   *   원본이 Promise를 리턴하면 resolve된 값(Awaited<Return>)을 넘겨받고,
   *   after의 리턴값이 그대로 최종 Promise의 resolve 값이 된다.
   *   after가 Promise를 리턴해도 된다 — resolve된 값이 최종값이 된다.
   * 안 주면 그대로 통과.
   *
   * 제네릭을 명시하면 훅 입출력이 검사된다:
   * `@around<[string], Promise<string>>({ after: (h, r) => ... })`
   * (r은 string으로 추론). 생략하면 any로 느슨하게 동작한다.
   * 단, legacy 데코레이터 한계상 래핑된 메서드의 겉보기 시그니처는 안 바뀌므로
   * async 훅을 단 sync 메서드는 호출 측에서 Promise로 취급해야 한다.
   */
  after?: (helperHostSet: HelperHostSet, result: Awaited<Return>) => Return | Promise<Awaited<Return>>;
  /**
   * before/원본/after 실행이 끝나면 성공·실패와 무관하게 항상 실행되는 정리 훅 (try/finally의 finally).
   * 두 번째 인자로 컨텍스트를 받는다:
   *   - args: 호출자가 넘긴 원본 인자 배열(before 가공 전)
   *   - result: 성공 시 최종 리턴값(after 적용 후). 실패 시 없음.
   *   - error: throw/reject 시 그 에러. 성공 시 없음.
   * 에러를 삼키지 않는다 — finally를 먼저 돌린 뒤 원래 에러/리턴값이 그대로 전파된다.
   * sync 원본 + sync finally면 sync로 유지되지만, finally가 Promise를 리턴하면
   * 래퍼는 Promise를 반환한다(async before/after와 동일 규칙).
   */
  finally?: (helperHostSet: HelperHostSet, ctx: { args: Args; result?: Awaited<Return>; error?: any }) => void | Promise<void>;
}

/** 인스턴스에서 HelperHostSet을 해석한다 — 실패(SSR/미초기화)하면 최소 폴백을 돌려준다. */
const resolveHelperHostSet = (inst: any): HelperHostSet => {
  try {
    ensureInit(inst);
    const conf = getElementConfig(inst);
    const win = inst._resolveWindow?.(conf) ?? (typeof window !== 'undefined' ? window : undefined);
    return SwcUtils.getHelperAndHostSet(win, inst);
  } catch {
    return { $this: inst } as HelperHostSet;
  }
};

/**
 * 메서드에 걸면 호출을 감싸서 호출 전(인자 가공)/후(리턴값 가공) 훅을 건다 - AOP의 "around advice".
 *
 * @around({
 *   before: (h, args: [number, string]) => [args[0], args[1].toUpperCase()],
 *   after: (h, r: string) => r + '!'
 * })
 * greet(a: number, b: string) { return `${a}:${b}`; }
 *
 * 프로퍼티(필드)에 걸면 get/set을 가로챈다 - get은 get, set은 set이 호출된다.
 * (프로퍼티 경로에서는 값이 배열이 아니라 단일값으로 넘어간다)
 * 필드 이니셜라이저(`wow = 'x'`)가 있어도 된다 — ensureInit이 state처럼
 * 초기값을 살려 setter 경유로 정리하므로 초기값에도 set()이 적용된다.
 * (단, custom element가 아닌 일반 클래스에서는 ensureInit이 안 돌므로
 * `declare` + 생성자 대입으로 쓸 것)
 *
 * @around({
 *   get: (h, stored: string) => stored?.toUpperCase(),
 *   set: (h, incoming: string) => incoming?.trim()
 * })
 * wow: string = '  hi ';
 */
export function around<Args extends any[] = any[], Return = any>(options: AroundOptions<NoInfer<Args>, NoInfer<Return>>): MethodDecorator;
export function around<Value = any>(options: AroundPropertyOptions<NoInfer<Value>>): PropertyDecorator;
export function around(options: any = {}): MethodDecorator & PropertyDecorator {
  return ((target: Object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => {
    // 메서드: descriptor.value가 실제 함수일 때만 (이미 정의된 접근자를 감싸는 건 지원 범위 밖)
    if (descriptor && typeof descriptor.value === 'function') {
      const original = descriptor.value;
      const runAfter = function (this: any, hhs: HelperHostSet, res: any) {
        if (!options.after) return res;
        const run = (v: any) => (options.after as any).call(this, hhs, v);
        // after가 Promise를 리턴하면 resolve된 값이 최종값이 된다 (then 플래트닝).
        return res && typeof res.then === 'function' ? res.then(run) : run(res);
      };
      descriptor.value = function (this: any, ...args: any[]) {
        const hhs = resolveHelperHostSet(this);
        const self = this;
        const callOriginal = (finalArgs: any[]) => runAfter.call(self, hhs, original.apply(self, finalArgs));
        const runBody = () => {
          if (options.before) {
            const mapped = (options.before as any).call(self, hhs, args);
            if (mapped && typeof mapped.then === 'function') {
              // async before — resolve된 인자로 원본 호출, 래퍼는 Promise 반환.
              // (sync 원본 + sync 훅일 때만 sync 반환이 유지된다)
              return mapped.then((m: any) => {
                if (Array.isArray(m)) return callOriginal(m);
                if (m !== undefined) return callOriginal([m]);
                return callOriginal(args);
              });
            }
            if (Array.isArray(mapped)) return callOriginal(mapped);
            if (mapped !== undefined) return callOriginal([mapped]);
          }
          return callOriginal(args);
        };
        if (!options.finally) return runBody();
        // sync/async 투명성을 지키는 try/finally — 에러는 삼키지 않고 finally 후 전파.
        const afterFin = (settle: () => any, ctx: { args: any[]; result?: any; error?: any }) => {
          const f = (options.finally as any).call(self, hhs, ctx);
          return f && typeof f.then === 'function' ? f.then(settle) : settle();
        };
        let out: any;
        try {
          out = runBody();
        } catch (e) {
          return afterFin(() => { throw e; }, { args, error: e });
        }
        if (out && typeof out.then === 'function') {
          return out.then(
            (v: any) => afterFin(() => v, { args, result: v }),
            (e: any) => afterFin(() => { throw e; }, { args, error: e })
          );
        }
        return afterFin(() => out, { args, result: out });
      };
      return descriptor;
    }

    // 프로퍼티: ensureInit에서 own property를 정리할 수 있도록 메타데이터 등록 (state.ts와 동일 패턴).
    // 필드 이니셜라이저가 있으면 own property가 accessor를 가리므로 getter가 영원히 안 불림 —
    // getter 안의 자체이주는 마지막 안전망일 뿐, 실질적인 살림은 ensureInit이 한다.
    const constructor = (target as any).constructor;
    let aroundList = ReflectUtils.getMetadata<AroundMetadata[]>(AROUND_METADATA_KEY, constructor);
    if (!aroundList) {
      aroundList = [];
      ReflectUtils.defineMetadata(AROUND_METADATA_KEY, aroundList, constructor);
    }
    aroundList.push({ propertyKey });

    // target은 prototype이라 여기 값을 직접 두면 모든 인스턴스가 공유해버린다.
    // 인스턴스별로 따로 저장되도록 인스턴스 전용 Symbol 슬롯(this[storageKey])에 실제 값을 둔다.
    const storageKey = Symbol(`around:${String(propertyKey)}`);
    const getFn = (options as AroundPropertyOptions).get as unknown as ((hhs: HelperHostSet, value: any) => any) | undefined;
    const setFn = (options as AroundPropertyOptions).set as unknown as ((hhs: HelperHostSet, value: any) => any) | undefined;
    Object.defineProperty(target, propertyKey, {
      get(this: any) {
        // 안전망: 누군가 plain delete로 own을 걷어낸 뒤라면 여기서 슬롯으로 회수한다.
        // (정상 경로에서는 ensureInit이 이미 setter 경유로 정리했으므로 own이 없음)
        const own = Object.getOwnPropertyDescriptor(this, propertyKey);
        if (own && 'value' in own) {
          delete this[propertyKey];
          this[storageKey] = setFn ? setFn.call(this, resolveHelperHostSet(this), own.value) : own.value;
        }
        const raw = this[storageKey];
        if (!getFn) return raw;
        const mapped = getFn.call(this, resolveHelperHostSet(this), raw);
        return mapped === undefined ? raw : mapped;
      },
      set(this: any, value: any) {
        this[storageKey] = setFn ? setFn.call(this, resolveHelperHostSet(this), value) : value;
      },
      enumerable: true,
      configurable: true
    });
  }) as MethodDecorator & PropertyDecorator;
}

export const findAllAroundMetadata = (target: any): AroundMetadata[] => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(AROUND_METADATA_KEY, constructor) ?? [];
};
