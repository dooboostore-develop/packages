import { ReflectUtils } from '@dooboostore/core';
import { ensureInit, getElementConfig } from './elementDefine';
import { SwcUtils } from '../utils/Utils';
import { ElementDefineLifeCycler, HelperHostSet } from '../types';

export const SET_INTERVAL_METADATA_KEY = Symbol.for('simple-web-component:set-interval');

export type SetIntervalType = 'onConnected' | 'returnValue';

export interface SetIntervalOptions {
  /**
   * 'onConnected' (connect 시 자동으로 시작, disconnect 시 자동 정리) |
   * 'returnValue' (기본값 - 자동 시작 없음. 개발자가 이 메서드를 직접 호출해야 시작되고,
   *   그 호출의 리턴값이 실제로 반복 실행될 함수가 된다 - 아래 설명 참고).
   */
  type?: SetIntervalType;
  /** 매 tick마다 데코레이트된 메서드에 넘길 인자를 계산. type:'onConnected'에서만 의미가 있음 (없으면 인자 없이 호출). */
  parameter?: (set: HelperHostSet) => any[];
  /** 타이머 등록 직후 1회 호출 (디버깅/로깅용). id는 실제 setInterval 반환값 - cleanup은 자동으로 처리되므로 직접 clear할 필요 없음. */
  created?: (set: HelperHostSet, id: number) => void;
  /**
   * type:'onConnected' - 매 tick마다 데코레이트된 메서드의 리턴값이 객체이고 이 키의 값이 함수이면 (id: number)로 호출한다.
   * type:'returnValue' - 리턴값이 함수면 그 자체를, 객체면 이 키의 값이 함수일 때 그 값을 "실제로 반복 실행될 함수"로 사용한다.
   * 안 주면 SET_INTERVAL_METADATA_KEY로 폴백한다 - applyAttribute.ts/applyNode.ts의 valueKey와 동일한 컨벤션
   * (리턴 객체에서 이 데코레이터 몫만 뽑아 쓰고, 다른 데코레이터와 스택할 때만 커스텀 키로 구분하면 된다).
   */
  valueKey?: symbol | string;
}

export interface SetIntervalMetadata {
  propertyKey: string | symbol;
  interval: number;
  options: SetIntervalOptions;
}

const activeMap = new WeakMap<any, number[]>();
const getActiveEntries = (inst: any): number[] => {
  let entries = activeMap.get(inst);
  if (!entries) {
    entries = [];
    activeMap.set(inst, entries);
  }
  return entries;
};

/**
 * type:'onConnected' - connect 시 자동으로 setInterval을 걸고, disconnect 시 자동으로 clearInterval 한다.
 * type:'returnValue'(기본값) - 메서드를 감싸지 않는 대신, 호출될 때마다(개발자가 직접 호출) 원본 로직을
 *   그대로 실행하고 리턴값(또는 valueKey로 뽑은 값)이 함수면 그 함수를 새 setInterval의 반복 콜백으로 등록한다.
 *   호출할 때마다 별도의 새 타이머가 생기며, disconnect 시 전부 정리된다. 원본 리턴값은 그대로 통과시키므로
 *   다른 데코레이터와 같은 메서드에 스택해도 순서에 상관없이 안전하다.
 */
export function setInterval(interval: number, options: SetIntervalOptions = {}): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => {
    const constructor = target.constructor;
    const normalizedOptions: SetIntervalOptions = { ...options, type: options.type ?? 'returnValue' };

    let metaList = ReflectUtils.getOwnMetadata(SET_INTERVAL_METADATA_KEY, constructor) as SetIntervalMetadata[];
    if (!metaList) {
      metaList = [];
      ReflectUtils.defineMetadata(SET_INTERVAL_METADATA_KEY, metaList, constructor);
    }
    metaList.push({ propertyKey, interval, options: normalizedOptions });

    if (normalizedOptions.type === 'onConnected' || !descriptor) {
      return; // LifeCycler가 connect/disconnect를 전담 - wrapping 불필요
    }

    const original = descriptor.value;
    descriptor.value = function (this: any, ...args: any[]) {
      const res = original.apply(this, args);
      // valueKey를 안 주면 이 데코레이터 전용 METADATA_KEY로 폴백 (applyAttribute.ts/applyNode.ts와 동일한 컨벤션)
      const vk = normalizedOptions.valueKey ?? SET_INTERVAL_METADATA_KEY;
      const tickFn: ((id: number) => void) | undefined =
        typeof res === 'function' ? res : res && typeof res === 'object' && typeof res[vk] === 'function' ? res[vk] : undefined;

      if (tickFn) {
        ensureInit(this);
        const conf = getElementConfig(this);
        const win = (this as any)._resolveWindow?.(conf) || ((typeof window !== 'undefined' ? window : undefined) as Window);
        const id = win.setInterval(() => {
          try {
            tickFn(id);
          } catch (e) {
            console.error('[SWC] setInterval tick error:', e);
          }
        }, interval);
        normalizedOptions.created?.(SwcUtils.getHelperAndHostSet(win, this), id);
        getActiveEntries(this).push(id);
      }
      return res;
    };
    return descriptor;
  };
}

export const findAllSetIntervalMetadata = (target: any): SetIntervalMetadata[] => {
  const constructor = target instanceof Function ? target : target.constructor;
  return (ReflectUtils.findAllMetadata<SetIntervalMetadata[]>(SET_INTERVAL_METADATA_KEY, constructor) || []).flat();
};

export class SetIntervalLifeCycler implements ElementDefineLifeCycler {
  onConnected(helperHostSet: HelperHostSet): void {
    const inst = helperHostSet.$this;
    activeMap.delete(inst); // 재연결 대비 리셋
    for (const meta of findAllSetIntervalMetadata(inst)) {
      if (meta.options.type !== 'onConnected') continue; // returnValue 타입은 수동 호출을 기다림
      const id = helperHostSet.$w.setInterval(() => {
        const args = meta.options.parameter?.(helperHostSet) ?? [];
        try {
          const res = inst[meta.propertyKey](...args);
          const vk = meta.options.valueKey ?? SET_INTERVAL_METADATA_KEY;
          if (res && typeof res === 'object' && typeof res[vk] === 'function') {
            res[vk](id);
          }
        } catch (e) {
          console.error('[SWC] setInterval tick error:', e);
        }
      }, meta.interval);
      meta.options.created?.(helperHostSet, id);
      getActiveEntries(inst).push(id);
    }
  }

  onDisconnected(helperHostSet: HelperHostSet): void {
    const inst = helperHostSet.$this;
    for (const id of activeMap.get(inst) ?? []) {
      try {
        helperHostSet.$w.clearInterval(id);
      } catch (e) {
        console.error('[SWC] clearInterval error:', e);
      }
    }
    activeMap.delete(inst);
  }
}
