import { ReflectUtils } from '@dooboostore/core';
import { ensureInit, getElementConfig } from './elementDefine';
import { SwcUtils } from '../utils/Utils';
import { buildSwcParameterArgs } from './parameter';
import { ElementDefineLifeCycler, HelperHostSet } from '../types';

export const SET_TIMEOUT_METADATA_KEY = Symbol.for('simple-web-component:set-timeout');

export type SetTimeoutType = 'onConnected' | 'returnValue';

export interface SetTimeoutOptions {
  /**
   * 'onConnected' (connect 시 자동으로 예약, disconnect 시 자동 정리) |
   * 'returnValue' (기본값 - 자동 예약 없음. 개발자가 이 메서드를 직접 호출해야 예약되고,
   *   그 호출의 리턴값이 실제로 실행될 함수가 된다 - 아래 설명 참고).
   */
  type?: SetTimeoutType;
  /** 실행 시 데코레이트된 메서드에 넘길 인자를 계산. type:'onConnected'에서만 의미가 있음 (없으면 인자 없이 호출). */
  parameter?: (set: HelperHostSet) => any[];
  /** 타이머 등록 직후 1회 호출 (디버깅/로깅용). id는 실제 setTimeout 반환값 - cleanup은 자동으로 처리되므로 직접 clear할 필요 없음. */
  created?: (set: HelperHostSet, id: number) => void;
  /** [type:'onConnected' 전용] 발화 여부 게이트. Promise<boolean>도 가능. false면 스킵. */
  filter?: (set: HelperHostSet) => boolean | Promise<boolean>;
  /** [type:'onConnected' 전용] 핸들러 직전 훅. await되고, 리턴값은 @setTimeoutBeforeReturn 으로 주입된다. */
  before?: (set: HelperHostSet) => any | Promise<any>;
  /** [type:'onConnected' 전용] 핸들러가 성공/실패해도 항상 실행되는 정리 훅. ctx로 인자/결과/에러. */
  finally?: (set: HelperHostSet, ctx: { args: any[]; result?: any; error?: any }) => any | Promise<any>;
  /**
   * type:'onConnected' - fire 시 데코레이트된 메서드의 리턴값이 객체이고 이 키의 값이 함수이면 (id: number)로 호출한다.
   * type:'returnValue' - 리턴값이 함수면 그 자체를, 객체면 이 키의 값이 함수일 때 그 값을 "실제로 실행될 함수"로 사용한다.
   * 안 주면 SET_TIMEOUT_METADATA_KEY로 폴백한다 - applyAttribute.ts/applyNode.ts의 valueKey와 동일한 컨벤션
   * (리턴 객체에서 이 데코레이터 몫만 뽑아 쓰고, 다른 데코레이터와 스택할 때만 커스텀 키로 구분하면 된다).
   */
  valueKey?: symbol | string;
}

export interface SetTimeoutMetadata {
  propertyKey: string | symbol;
  delay: number;
  options: SetTimeoutOptions;
}

const getActiveEntries = (inst: any): number[] => (inst.__swc_timeoutIds ??= []);

/**
 * type:'onConnected' - connect 시 자동으로 setTimeout을 걸고, disconnect 시 (아직 실행 전이라면) 자동으로 clearTimeout 한다.
 * type:'returnValue'(기본값) - 메서드를 감싸지 않는 대신, 호출될 때마다(개발자가 직접 호출) 원본 로직을
 *   그대로 실행하고 리턴값(또는 valueKey로 뽑은 값)이 함수면 그 함수를 새 setTimeout으로 예약한다.
 *   호출할 때마다 별도의 새 타이머가 생기며, disconnect 시 (아직 실행 전인 것들은) 전부 정리된다.
 *   원본 리턴값은 그대로 통과시키므로 다른 데코레이터와 같은 메서드에 스택해도 순서에 상관없이 안전하다.
 */
export function setTimeout(delay: number, options: SetTimeoutOptions = {}): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => {
    const constructor = target.constructor;
    const normalizedOptions: SetTimeoutOptions = { ...options, type: options.type ?? 'returnValue' };

    let metaList = ReflectUtils.getOwnMetadata(SET_TIMEOUT_METADATA_KEY, constructor) as SetTimeoutMetadata[];
    if (!metaList) {
      metaList = [];
      ReflectUtils.defineMetadata(SET_TIMEOUT_METADATA_KEY, metaList, constructor);
    }
    metaList.push({ propertyKey, delay, options: normalizedOptions });

    if (normalizedOptions.type === 'onConnected' || !descriptor) {
      return; // LifeCycler가 connect/disconnect를 전담 - wrapping 불필요
    }

    const original = descriptor.value;
    descriptor.value = function (this: any, ...args: any[]) {
      const res = original.apply(this, args);
      // valueKey를 안 주면 이 데코레이터 전용 METADATA_KEY로 폴백 (applyAttribute.ts/applyNode.ts와 동일한 컨벤션)
      const vk = normalizedOptions.valueKey ?? SET_TIMEOUT_METADATA_KEY;
      const tickFn: ((id: number) => void) | undefined =
        typeof res === 'function' ? res : res && typeof res === 'object' && typeof res[vk] === 'function' ? res[vk] : undefined;

      if (tickFn) {
        ensureInit(this);
        const conf = getElementConfig(this);
        const win = (this as any)._resolveWindow?.(conf) || ((typeof window !== 'undefined' ? window : undefined) as Window);
        const id = win.setTimeout(() => {
          const entries = getActiveEntries(this);
          const idx = entries.indexOf(id);
          if (idx >= 0) entries.splice(idx, 1);
          try {
            tickFn(id);
          } catch (e) {
            console.error('[SWC] setTimeout fire error:', e);
          }
        }, delay);
        normalizedOptions.created?.(SwcUtils.getHelperAndHostSet(win, this), id);
        getActiveEntries(this).push(id);
      }
      return res;
    };
    return descriptor;
  };
}

export const findAllSetTimeoutMetadata = (target: any): SetTimeoutMetadata[] => {
  const constructor = target instanceof Function ? target : target.constructor;
  return (ReflectUtils.findAllMetadata<SetTimeoutMetadata[]>(SET_TIMEOUT_METADATA_KEY, constructor) || []).flat();
};

export class SetTimeoutLifeCycler implements ElementDefineLifeCycler {
  onConnected(helperHostSet: HelperHostSet): void {
    const inst = helperHostSet.$this;
    inst.__swc_timeoutIds = []; // 재연결 대비 리셋
    for (const meta of findAllSetTimeoutMetadata(inst)) {
      if (meta.options.type !== 'onConnected') continue; // returnValue 타입은 수동 호출을 기다림
      const id = helperHostSet.$w.setTimeout(() => {
        void (async () => {
          const helper = SwcUtils.getHelperAndHostSet(helperHostSet.$w, inst);
          if (meta.options.filter && !(await meta.options.filter(helper))) return;
          const paramArgs = meta.options.parameter?.(helperHostSet) ?? [];
          const hostSet = SwcUtils.getHostSet(inst);
          const helperSet = SwcUtils.getHelperSet(helperHostSet.$w);
          const buildArgs = (beforeReturn: any) => buildSwcParameterArgs(inst, meta.propertyKey, {
            hostSet, helperHostSet: helper, helperSet, setTimeoutBeforeReturn: beforeReturn
          }, [...paramArgs, beforeReturn]);
          let args = buildArgs(undefined);
          if (meta.options.before) { const br = await meta.options.before(helper); args = buildArgs(br); }
          let result: any, error: any;
          try {
            result = await inst[meta.propertyKey](...args);
            const vk = meta.options.valueKey ?? SET_TIMEOUT_METADATA_KEY;
            if (result && typeof result === 'object' && typeof result[vk] === 'function') result[vk](id);
          } catch (e) {
            error = e;
          } finally {
            if (meta.options.finally) await meta.options.finally(helper, { args, result, error });
          }
          if (error) console.error('[SWC] setTimeout fire error:', error);
        })().catch(e => console.error('[SWC] setTimeout fire error:', e));
      }, meta.delay);
      meta.options.created?.(helperHostSet, id);
      getActiveEntries(inst).push(id);
    }
  }

  onDisconnected(helperHostSet: HelperHostSet): void {
    const inst = helperHostSet.$this;
    for (const id of inst.__swc_timeoutIds ?? []) {
      try {
        helperHostSet.$w.clearTimeout(id);
      } catch (e) {
        console.error('[SWC] clearTimeout error:', e);
      }
    }
    inst.__swc_timeoutIds = [];
  }
}
