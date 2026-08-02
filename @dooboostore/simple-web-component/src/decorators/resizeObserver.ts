import { ReflectUtils } from '@dooboostore/core';
import { SpecialSelector, SwcQueryOptions, HelperHostSet } from '../types';
import { EventListenerSelector } from './addEventListener';

export interface ResizeObserverOptions extends SwcQueryOptions {
  // 관찰 대상 셀렉터. 기본값 $this (컴포넌트 자신)
  // delegate: true 인 경우 루트에서 매칭 요소들의 크기 변화를 감지 (동적 요소 포함)
  delegate?: boolean;
  // ResizeObserver box 옵션
  box?: 'content-box' | 'border-box' | 'device-pixel-content-box';
  filter?: (matchedEls: HTMLElement[], meta: { currentThis: any, helper: HelperHostSet }) => boolean;
  // observer 해제(disconnected) 시 호출되는 콜백. 첫 번째 인자는 observe된 target element, 두 번째는 사용자 옵션 객체.
  removeObserver?: (target: Element, optionValue: ResizeObserverOptions) => void;
}

export interface ResizeObserverMetadata {
  propertyKey: string | symbol;
  selector: EventListenerSelector;
  options: ResizeObserverOptions;
}

export const RESIZE_OBSERVER_METADATA_KEY = Symbol.for('simple-web-component:resize-observer');

export function resizeObserver(target: SpecialSelector, options?: ResizeObserverOptions): MethodDecorator;
export function resizeObserver(selector: EventListenerSelector, options?: ResizeObserverOptions): MethodDecorator;
export function resizeObserver(options?: ResizeObserverOptions): MethodDecorator;
/**
 * @resizeObserver decorator to observe element size changes.
 */
export function resizeObserver(selectorOrOptions?: EventListenerSelector | ResizeObserverOptions, maybeOptions?: ResizeObserverOptions): MethodDecorator {
  return (targetObj: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    let selector: EventListenerSelector = '$this';
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

export function resizeObserverThis(options?: ResizeObserverOptions): MethodDecorator {
  return resizeObserver('$this', options);
}

// ─── root별 delegate 헬퍼 ───

export function resizeObserverDelegateLight(selector: EventListenerSelector, options?: Omit<ResizeObserverOptions, 'delegate'>): MethodDecorator;
export function resizeObserverDelegateLight(options?: Omit<ResizeObserverOptions, 'delegate'>): MethodDecorator;
export function resizeObserverDelegateLight(selectorOrOptions?: EventListenerSelector | Omit<ResizeObserverOptions, 'delegate'>, maybeOptions?: Omit<ResizeObserverOptions, 'delegate'>): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return resizeObserver(selectorOrOptions, {...maybeOptions ?? {}, root: 'light', delegate: true});
  }
  return resizeObserver({...selectorOrOptions ?? {}, root: 'light', delegate: true});
}

export function resizeObserverDelegateShadow(selector: EventListenerSelector, options?: Omit<ResizeObserverOptions, 'delegate'>): MethodDecorator;
export function resizeObserverDelegateShadow(options?: Omit<ResizeObserverOptions, 'delegate'>): MethodDecorator;
export function resizeObserverDelegateShadow(selectorOrOptions?: EventListenerSelector | Omit<ResizeObserverOptions, 'delegate'>, maybeOptions?: Omit<ResizeObserverOptions, 'delegate'>): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return resizeObserver(selectorOrOptions, {...maybeOptions ?? {}, root: 'shadow', delegate: true});
  }
  return resizeObserver({...selectorOrOptions ?? {}, root: 'shadow', delegate: true});
}

export function resizeObserverDelegateAll(selector: EventListenerSelector, options?: Omit<ResizeObserverOptions, 'delegate'>): MethodDecorator;
export function resizeObserverDelegateAll(options?: Omit<ResizeObserverOptions, 'delegate'>): MethodDecorator;
export function resizeObserverDelegateAll(selectorOrOptions?: EventListenerSelector | Omit<ResizeObserverOptions, 'delegate'>, maybeOptions?: Omit<ResizeObserverOptions, 'delegate'>): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return resizeObserver(selectorOrOptions, {...maybeOptions ?? {}, root: 'all', delegate: true});
  }
  return resizeObserver({...selectorOrOptions ?? {}, root: 'all', delegate: true});
}

export function resizeObserverDelegate(selector: EventListenerSelector, options?: Omit<ResizeObserverOptions, 'delegate'>): MethodDecorator;
export function resizeObserverDelegate(options?: Omit<ResizeObserverOptions, 'delegate'>): MethodDecorator;
export function resizeObserverDelegate(selectorOrOptions?: EventListenerSelector | Omit<ResizeObserverOptions, 'delegate'>, maybeOptions?: Omit<ResizeObserverOptions, 'delegate'>): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return resizeObserver(selectorOrOptions, {...maybeOptions ?? {}, root: 'auto', delegate: true});
  }
  return resizeObserver({...selectorOrOptions ?? {}, root: 'auto', delegate: true});
}

// ─── root별 일반 헬퍼 (delegate 없이, 셀렉터 생략 시 $this) ───

export function resizeObserverLight(selector: EventListenerSelector, options?: ResizeObserverOptions): MethodDecorator;
export function resizeObserverLight(options?: ResizeObserverOptions): MethodDecorator;
export function resizeObserverLight(selectorOrOptions?: EventListenerSelector | ResizeObserverOptions, maybeOptions?: ResizeObserverOptions): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return resizeObserver(selectorOrOptions, {...maybeOptions ?? {}, root: 'light'});
  }
  return resizeObserver({...selectorOrOptions ?? {}, root: 'light'});
}

export function resizeObserverShadow(selector: EventListenerSelector, options?: ResizeObserverOptions): MethodDecorator;
export function resizeObserverShadow(options?: ResizeObserverOptions): MethodDecorator;
export function resizeObserverShadow(selectorOrOptions?: EventListenerSelector | ResizeObserverOptions, maybeOptions?: ResizeObserverOptions): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return resizeObserver(selectorOrOptions, {...maybeOptions ?? {}, root: 'shadow'});
  }
  return resizeObserver({...selectorOrOptions ?? {}, root: 'shadow'});
}

export function resizeObserverAll(selector: EventListenerSelector, options?: ResizeObserverOptions): MethodDecorator;
export function resizeObserverAll(options?: ResizeObserverOptions): MethodDecorator;
export function resizeObserverAll(selectorOrOptions?: EventListenerSelector | ResizeObserverOptions, maybeOptions?: ResizeObserverOptions): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return resizeObserver(selectorOrOptions, {...maybeOptions ?? {}, root: 'all'});
  }
  return resizeObserver({...selectorOrOptions ?? {}, root: 'all'});
}

export function getResizeObserverMetadata(target: any): ResizeObserverMetadata[] | undefined {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(RESIZE_OBSERVER_METADATA_KEY, constructor);
}