import { ReflectUtils } from '@dooboostore/core';
import { SpecialSelector, SwcQueryOptions, SwcFnSelector, SwcSelector, HelperHostSet } from '../types';

// 공통 옵션 — root·delegate 없음
export interface ResizeObserverBaseOptions {
  box?: 'content-box' | 'border-box' | 'device-pixel-content-box';
  filter?: (matchedEls: HTMLElement[], meta: { currentThis: any, helper: HelperHostSet }) => boolean;
  removeObserver?: (target: Element, optionValue: ResizeObserverOptions) => void;
}

// 문자열 셀렉터 전용 — root·delegate 허용
export type ResizeObserverQueryOptions = ResizeObserverBaseOptions & SwcQueryOptions & { delegate?: boolean };
// 함수 셀렉터 전용 — root·delegate 금지
export type ResizeObserverNonQueryOptions = ResizeObserverBaseOptions;
// 내부 저장/해석용
export type ResizeObserverOptions = ResizeObserverQueryOptions;

// 셀렉터 종류에 따라 옵션 타입 분기
export type ResizeObserverOptionsOf<S extends SwcSelector> = S extends string ? ResizeObserverQueryOptions : ResizeObserverNonQueryOptions;

export interface ResizeObserverMetadata {
  propertyKey: string | symbol;
  selector: SwcSelector;
  options: ResizeObserverOptions;
}

export const RESIZE_OBSERVER_METADATA_KEY = Symbol.for('simple-web-component:resize-observer');

export function resizeObserver(target: SpecialSelector, options?: ResizeObserverQueryOptions): MethodDecorator;
export function resizeObserver(selector: string, options?: ResizeObserverQueryOptions): MethodDecorator;
export function resizeObserver(selector: SwcFnSelector, options?: ResizeObserverNonQueryOptions): MethodDecorator;
export function resizeObserver(options?: ResizeObserverQueryOptions): MethodDecorator;
/**
 * @resizeObserver decorator to observe element size changes.
 */
export function resizeObserver(selectorOrOptions?: SwcSelector | ResizeObserverOptions, maybeOptions?: ResizeObserverOptions): MethodDecorator {
  return (targetObj: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    let selector: SwcSelector = '$this';
    let options: ResizeObserverOptions = {};

    if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
      selector = selectorOrOptions;
      options = maybeOptions ?? {};
    } else {
      selector = '$this';
      options = selectorOrOptions ?? {};
    }

    const constructor = targetObj.constructor;

    let observers = ReflectUtils.getMetadata<ResizeObserverMetadata[]>(RESIZE_OBSERVER_METADATA_KEY, constructor);
    if (!observers) {
      observers = [];
      ReflectUtils.defineMetadata(RESIZE_OBSERVER_METADATA_KEY, observers, constructor);
    }

    observers.push({ propertyKey, selector, options });
  };
}

export function resizeObserverThis(options?: ResizeObserverQueryOptions): MethodDecorator {
  return resizeObserver('$this', options);
}

// ─── root별 delegate 헬퍼 (root 주입 → 문자열 셀렉터 전용) ───

export function resizeObserverDelegateLight(selector: string, options?: Omit<ResizeObserverQueryOptions, 'delegate'>): MethodDecorator;
export function resizeObserverDelegateLight(options?: Omit<ResizeObserverQueryOptions, 'delegate'>): MethodDecorator;
export function resizeObserverDelegateLight(selectorOrOptions?: string | Omit<ResizeObserverQueryOptions, 'delegate'>, maybeOptions?: Omit<ResizeObserverQueryOptions, 'delegate'>): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return resizeObserver(selectorOrOptions as any, {...maybeOptions ?? {}, root: 'light', delegate: true});
  }
  return resizeObserver({...selectorOrOptions ?? {}, root: 'light', delegate: true});
}

export function resizeObserverDelegateShadow(selector: string, options?: Omit<ResizeObserverQueryOptions, 'delegate'>): MethodDecorator;
export function resizeObserverDelegateShadow(options?: Omit<ResizeObserverQueryOptions, 'delegate'>): MethodDecorator;
export function resizeObserverDelegateShadow(selectorOrOptions?: string | Omit<ResizeObserverQueryOptions, 'delegate'>, maybeOptions?: Omit<ResizeObserverQueryOptions, 'delegate'>): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return resizeObserver(selectorOrOptions as any, {...maybeOptions ?? {}, root: 'shadow', delegate: true});
  }
  return resizeObserver({...selectorOrOptions ?? {}, root: 'shadow', delegate: true});
}

export function resizeObserverDelegateAll(selector: string, options?: Omit<ResizeObserverQueryOptions, 'delegate'>): MethodDecorator;
export function resizeObserverDelegateAll(options?: Omit<ResizeObserverQueryOptions, 'delegate'>): MethodDecorator;
export function resizeObserverDelegateAll(selectorOrOptions?: string | Omit<ResizeObserverQueryOptions, 'delegate'>, maybeOptions?: Omit<ResizeObserverQueryOptions, 'delegate'>): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return resizeObserver(selectorOrOptions as any, {...maybeOptions ?? {}, root: 'all', delegate: true});
  }
  return resizeObserver({...selectorOrOptions ?? {}, root: 'all', delegate: true});
}

export function resizeObserverDelegate(selector: string, options?: Omit<ResizeObserverQueryOptions, 'delegate'>): MethodDecorator;
export function resizeObserverDelegate(options?: Omit<ResizeObserverQueryOptions, 'delegate'>): MethodDecorator;
export function resizeObserverDelegate(selectorOrOptions?: string | Omit<ResizeObserverQueryOptions, 'delegate'>, maybeOptions?: Omit<ResizeObserverQueryOptions, 'delegate'>): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return resizeObserver(selectorOrOptions as any, {...maybeOptions ?? {}, root: 'auto', delegate: true});
  }
  return resizeObserver({...selectorOrOptions ?? {}, root: 'auto', delegate: true});
}

// ─── root별 일반 헬퍼 (delegate 없이, 셀렉터 생략 시 $this) ───

export function resizeObserverLight(selector: string, options?: ResizeObserverQueryOptions): MethodDecorator;
export function resizeObserverLight(options?: ResizeObserverQueryOptions): MethodDecorator;
export function resizeObserverLight(selectorOrOptions?: string | ResizeObserverQueryOptions, maybeOptions?: ResizeObserverQueryOptions): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return resizeObserver(selectorOrOptions as any, {...maybeOptions ?? {}, root: 'light'});
  }
  return resizeObserver({...selectorOrOptions ?? {}, root: 'light'});
}

export function resizeObserverShadow(selector: string, options?: ResizeObserverQueryOptions): MethodDecorator;
export function resizeObserverShadow(options?: ResizeObserverQueryOptions): MethodDecorator;
export function resizeObserverShadow(selectorOrOptions?: string | ResizeObserverQueryOptions, maybeOptions?: ResizeObserverQueryOptions): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return resizeObserver(selectorOrOptions as any, {...maybeOptions ?? {}, root: 'shadow'});
  }
  return resizeObserver({...selectorOrOptions ?? {}, root: 'shadow'});
}

export function resizeObserverAll(selector: string, options?: ResizeObserverQueryOptions): MethodDecorator;
export function resizeObserverAll(options?: ResizeObserverQueryOptions): MethodDecorator;
export function resizeObserverAll(selectorOrOptions?: string | ResizeObserverQueryOptions, maybeOptions?: ResizeObserverQueryOptions): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return resizeObserver(selectorOrOptions as any, {...maybeOptions ?? {}, root: 'all'});
  }
  return resizeObserver({...selectorOrOptions ?? {}, root: 'all'});
}

export function getResizeObserverMetadata(target: any): ResizeObserverMetadata[] | undefined {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(RESIZE_OBSERVER_METADATA_KEY, constructor);
}