import { ReflectUtils } from '@dooboostore/core';
import { ensureInit, getElementConfig } from './elementDefine';
import { SwcUtils } from '../utils/Utils';
import { ElementDefineLifeCycler, HelperHostSet } from '../types';

export const REQUEST_ANIMATION_FRAME_METADATA_KEY = Symbol.for('simple-web-component:request-animation-frame');

export type RequestAnimationFrameType = 'onConnected' | 'returnValue';

export interface RequestAnimationFrameOptions {
  /**
   * 'onConnected' - connect 시 자동으로 루프 시작 (매 프레임 데코레이트된 메서드를 직접 호출), disconnect 시 자동 정리.
   * 'returnValue'(기본값) - 자동 시작 없음. 개발자가 이 메서드를 직접 호출해야 시작되고,
   *   그 호출의 리턴값(또는 valueKey로 뽑은 값)이 실제로 매 프레임 호출될 함수가 된다.
   */
  type?: RequestAnimationFrameType;
  /** 루프 시작 직후 1회 호출 (디버깅/로깅용). id는 첫 requestAnimationFrame 반환값 - cleanup은 자동으로 처리되므로 직접 취소할 필요 없음. */
  created?: (set: HelperHostSet, id: number) => void;
  /**
   * type:'returnValue' 전용 - 리턴값이 함수면 그 자체를, 객체면 이 키의 값이 함수일 때 그 값을
   * "매 프레임 호출될 함수"로 사용한다. 안 주면 REQUEST_ANIMATION_FRAME_METADATA_KEY로 폴백한다 -
   * applyAttribute.ts/applyNode.ts의 valueKey와 동일한 컨벤션.
   */
  valueKey?: symbol | string;
}

export interface RequestAnimationFrameMetadata {
  propertyKey: string | symbol;
  options: RequestAnimationFrameOptions;
}

/**
 * 프레임 콜백 시그니처.
 * - timestamp: 이번 프레임의 시각 (requestAnimationFrame이 넘겨주는 값)
 * - prevValue: 직전 호출이 리턴한 값 (첫 호출에서는 undefined)
 * 리턴값이 undefined/null이면 다음 프레임을 예약하지 않고 루프가 멈춘다 (개발자가 종료를 제어).
 * undefined/null이 아닌 값을 리턴하면 그 값 그대로 다음 호출의 prevValue로 전달된다.
 */
export type FrameCallback = (timestamp: number, prevValue?: any) => any;

const getActiveEntries = (inst: any): number[] => (inst.__swc_requestAnimationFrameIds ??= []);

const startFrameLoop = (win: Window, entries: number[], frameFn: FrameCallback): number => {
  let currentId = 0;
  const step = (timestamp: number, prevValue?: any) => {
    const idx = entries.indexOf(currentId);
    if (idx >= 0) entries.splice(idx, 1);
    let result: any;
    try {
      result = frameFn(timestamp, prevValue);
    } catch (e) {
      console.error('[SWC] requestAnimationFrame callback error:', e);
      return;
    }
    if (result === undefined || result === null) return; // 개발자가 종료를 신호함 - 다음 프레임 예약 안 함
    currentId = win.requestAnimationFrame(ts => step(ts, result));
    entries.push(currentId);
  };
  currentId = win.requestAnimationFrame(ts => step(ts, undefined));
  entries.push(currentId);
  return currentId;
};

const applyRequestAnimationFrame = (options: RequestAnimationFrameOptions, target: Object, propertyKey: string | symbol, descriptor?: PropertyDescriptor): PropertyDescriptor | void => {
  const constructor = target.constructor;
  const normalizedOptions: RequestAnimationFrameOptions = { ...options, type: options.type ?? 'returnValue' };

  let metaList = ReflectUtils.getOwnMetadata(REQUEST_ANIMATION_FRAME_METADATA_KEY, constructor) as RequestAnimationFrameMetadata[];
  if (!metaList) {
    metaList = [];
    ReflectUtils.defineMetadata(REQUEST_ANIMATION_FRAME_METADATA_KEY, metaList, constructor);
  }
  metaList.push({ propertyKey, options: normalizedOptions });

  if (normalizedOptions.type === 'onConnected' || !descriptor) {
    return; // LifeCycler가 connect/disconnect를 전담 - wrapping 불필요
  }

  const original = descriptor.value;
  descriptor.value = function (this: any, ...args: any[]) {
    const res = original.apply(this, args);
    // valueKey를 안 주면 이 데코레이터 전용 METADATA_KEY로 폴백 (applyAttribute.ts/applyNode.ts와 동일한 컨벤션)
    const vk = normalizedOptions.valueKey ?? REQUEST_ANIMATION_FRAME_METADATA_KEY;
    const frameFn: FrameCallback | undefined =
      typeof res === 'function' ? res : res && typeof res === 'object' && typeof res[vk] === 'function' ? res[vk] : undefined;

    if (frameFn) {
      ensureInit(this);
      const conf = getElementConfig(this);
      const win = (this as any)._resolveWindow?.(conf) || ((typeof window !== 'undefined' ? window : undefined) as Window);
      const id = startFrameLoop(win, getActiveEntries(this), frameFn);
      normalizedOptions.created?.(SwcUtils.getHelperAndHostSet(win, this), id);
    }
    return res;
  };
  return descriptor;
};

/**
 * type:'onConnected' - connect 시 자동으로 매 프레임 루프를 시작하고, disconnect 시 자동으로 cancelAnimationFrame 한다.
 * type:'returnValue'(기본값) - 메서드를 감싸지 않는 대신, 호출될 때마다(개발자가 직접 호출) 원본 로직을
 *   그대로 실행하고 리턴값(또는 valueKey로 뽑은 값)이 함수면 그 함수를 매 프레임 호출되는 루프로 등록한다.
 *   원본 리턴값은 그대로 통과시키므로 다른 데코레이터와 같은 메서드에 스택해도 순서에 상관없이 안전하다.
 *
 * 옵션 없이 `@requestAnimationFrame` 그대로 붙여도 되고, `@requestAnimationFrame({...})`처럼 옵션을 줄 수도 있다.
 */
export function requestAnimationFrame(options?: RequestAnimationFrameOptions): MethodDecorator;
export function requestAnimationFrame(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function requestAnimationFrame(optionsOrTarget?: RequestAnimationFrameOptions | Object, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): MethodDecorator | void {
  if (propertyKey !== undefined) {
    // 옵션 없이: @requestAnimationFrame
    applyRequestAnimationFrame({}, optionsOrTarget as Object, propertyKey, descriptor);
    return;
  }
  // 옵션과 함께: @requestAnimationFrame() 또는 @requestAnimationFrame({...})
  return (target: Object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => {
    return applyRequestAnimationFrame((optionsOrTarget as RequestAnimationFrameOptions) ?? {}, target, propertyKey, descriptor);
  };
}

export const findAllRequestAnimationFrameMetadata = (target: any): RequestAnimationFrameMetadata[] => {
  const constructor = target instanceof Function ? target : target.constructor;
  return (ReflectUtils.findAllMetadata<RequestAnimationFrameMetadata[]>(REQUEST_ANIMATION_FRAME_METADATA_KEY, constructor) || []).flat();
};

export class RequestAnimationFrameLifeCycler implements ElementDefineLifeCycler {
  onConnected(helperHostSet: HelperHostSet): void {
    const inst = helperHostSet.$this;
    inst.__swc_requestAnimationFrameIds = []; // 재연결 대비 리셋
    const entries = getActiveEntries(inst);
    for (const meta of findAllRequestAnimationFrameMetadata(inst)) {
      if (meta.options.type !== 'onConnected') continue; // returnValue 타입은 수동 호출을 기다림
      const frameFn: FrameCallback = (timestamp, prevValue) => inst[meta.propertyKey](timestamp, prevValue);
      const id = startFrameLoop(helperHostSet.$w, entries, frameFn);
      meta.options.created?.(helperHostSet, id);
    }
  }

  onDisconnected(helperHostSet: HelperHostSet): void {
    const inst = helperHostSet.$this;
    for (const id of inst.__swc_requestAnimationFrameIds ?? []) {
      try {
        helperHostSet.$w.cancelAnimationFrame(id);
      } catch (e) {
        console.error('[SWC] cancelAnimationFrame error:', e);
      }
    }
    inst.__swc_requestAnimationFrameIds = [];
  }
}
