import { ReflectUtils } from '@dooboostore/core';
import { ElementDefineLifeCycler, HelperHostSet } from '../types';

export const SET_TIMEOUT_METADATA_KEY = Symbol.for('simple-web-component:set-timeout');

export interface SetTimeoutOptions {
  /** 실행 시 데코레이트된 메서드에 넘길 인자를 계산. 없으면 인자 없이 호출. */
  parameter?: (set: HelperHostSet) => any[];
  /** 타이머 등록 직후 1회 호출 (디버깅/로깅용). id는 실제 setTimeout 반환값 - cleanup은 자동으로 처리되므로 직접 clear할 필요 없음. */
  created?: (set: HelperHostSet, id: number) => void;
  /**
   * fire 시 데코레이트된 메서드의 리턴값이 객체이고 이 키의 값이 함수이면 (id: number)로 호출한다.
   * applyAttribute.ts의 valueKey와 동일한 컨벤션 - 리턴 객체에서 이 데코레이터 몫만 뽑아 쓴다.
   */
  valueKey?: symbol | string;
}

export interface SetTimeoutMetadata {
  propertyKey: string | symbol;
  delay: number;
  options: SetTimeoutOptions;
}

/**
 * connect 시 자동으로 setTimeout을 걸고, disconnect 시 (아직 실행 전이라면) 자동으로 clearTimeout 한다.
 */
export function setTimeout(delay: number, options: SetTimeoutOptions = {}): MethodDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const constructor = target.constructor;
    let metaList = ReflectUtils.getOwnMetadata(SET_TIMEOUT_METADATA_KEY, constructor) as SetTimeoutMetadata[];
    if (!metaList) {
      metaList = [];
      ReflectUtils.defineMetadata(SET_TIMEOUT_METADATA_KEY, metaList, constructor);
    }
    metaList.push({ propertyKey, delay, options });
  };
}

export const findAllSetTimeoutMetadata = (target: any): SetTimeoutMetadata[] => {
  const constructor = target instanceof Function ? target : target.constructor;
  return (ReflectUtils.findAllMetadata<SetTimeoutMetadata[]>(SET_TIMEOUT_METADATA_KEY, constructor) || []).flat();
};

export class SetTimeoutLifeCycler implements ElementDefineLifeCycler {
  private readonly activeMap = new WeakMap<any, number[]>();

  onConnected(helperHostSet: HelperHostSet): void {
    const inst = helperHostSet.$this;
    const ids: number[] = [];
    for (const meta of findAllSetTimeoutMetadata(inst)) {
      const id = helperHostSet.$w.setTimeout(() => {
        const args = meta.options.parameter?.(helperHostSet) ?? [];
        try {
          const res = inst[meta.propertyKey](...args);
          const vk = meta.options.valueKey;
          if (vk && res && typeof res === 'object' && typeof res[vk] === 'function') {
            res[vk](id);
          }
        } catch (e) {
          console.error('[SWC] setTimeout fire error:', e);
        }
      }, meta.delay);
      meta.options.created?.(helperHostSet, id);
      ids.push(id);
    }
    this.activeMap.set(inst, ids);
  }

  onDisconnected(helperHostSet: HelperHostSet): void {
    const inst = helperHostSet.$this;
    for (const id of this.activeMap.get(inst) ?? []) {
      try {
        helperHostSet.$w.clearTimeout(id);
      } catch (e) {
        console.error('[SWC] clearTimeout error:', e);
      }
    }
    this.activeMap.delete(inst);
  }
}
