import { ReflectUtils } from '@dooboostore/core';
import { SpecialSelector, SwcQueryOptions, HelperHostSet } from '../types';
import { EventListenerSelector } from './addEventListener';

export interface MutationObserverBaseOptions extends MutationObserverInit, SwcQueryOptions {
  // observe 대상 셀렉터. 기본값 $this (컴포넌트 자신)
  // delegate: true 인 경우 root에 observer를 걸고 셀렉터 매칭 대상의 mutation만 콜백
  // 셀렉터로 직접 지정한 경우 해당 요소들을 각각 observe
  delegate?: boolean;
  filter?: (matchedEls: HTMLElement[], meta: { currentThis: any, helper: HelperHostSet }) => boolean;
  // observer 해제(disconnected) 시 호출되는 콜백. 첫 번째 인자는 observe된 target element, 두 번째는 사용자 옵션 객체.
  removeObserver?: (target: Element, optionValue: MutationObserverBaseOptions) => void;
}

export interface MutationObserverMetadata {
  propertyKey: string | symbol;
  selector: EventListenerSelector;
  options: MutationObserverBaseOptions;
}

export const MUTATION_OBSERVER_METADATA_KEY = Symbol.for('simple-web-component:mutation-observer');

export function mutationObserver(target: SpecialSelector, options?: MutationObserverBaseOptions): MethodDecorator;
export function mutationObserver(selector: EventListenerSelector, options?: MutationObserverBaseOptions): MethodDecorator;
export function mutationObserver(options?: MutationObserverBaseOptions): MethodDecorator;
/**
 * @mutationObserver decorator to observe DOM mutations.
 */
export function mutationObserver(selectorOrOptions?: EventListenerSelector | MutationObserverBaseOptions, maybeOptions?: MutationObserverBaseOptions): MethodDecorator {
  return (targetObj: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    let selector: EventListenerSelector = '$this';
    let options: MutationObserverBaseOptions = {};

    if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
      selector = selectorOrOptions;
      options = maybeOptions ?? {};
    } else {
      selector = '$this';
      options = selectorOrOptions ?? {};
    }

    const constructor = targetObj.constructor;

    let observers = ReflectUtils.getMetadata<MutationObserverMetadata[]>(MUTATION_OBSERVER_METADATA_KEY, constructor);
    if (!observers) {
      observers = [];
      ReflectUtils.defineMetadata(MUTATION_OBSERVER_METADATA_KEY, observers, constructor);
    }

    observers.push({ propertyKey, selector, options });
  };
}

export function mutationObserverThis<TEvent extends Event = Event>(options?: MutationObserverBaseOptions): MethodDecorator {
  return mutationObserver('$this', options);
}

// ─── root별 delegate 헬퍼 (addEventListener와 동일 패턴) ───

export function mutationObserverDelegateLight(selector: EventListenerSelector, options?: Omit<MutationObserverBaseOptions, 'delegate'>): MethodDecorator;
export function mutationObserverDelegateLight(options?: Omit<MutationObserverBaseOptions, 'delegate'>): MethodDecorator;
export function mutationObserverDelegateLight(selectorOrOptions?: EventListenerSelector | Omit<MutationObserverBaseOptions, 'delegate'>, maybeOptions?: Omit<MutationObserverBaseOptions, 'delegate'>): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return mutationObserver(selectorOrOptions, {...maybeOptions ?? {}, root: 'light', delegate: true});
  }
  return mutationObserver({...selectorOrOptions ?? {}, root: 'light', delegate: true});
}

export function mutationObserverDelegateShadow(selector: EventListenerSelector, options?: Omit<MutationObserverBaseOptions, 'delegate'>): MethodDecorator;
export function mutationObserverDelegateShadow(options?: Omit<MutationObserverBaseOptions, 'delegate'>): MethodDecorator;
export function mutationObserverDelegateShadow(selectorOrOptions?: EventListenerSelector | Omit<MutationObserverBaseOptions, 'delegate'>, maybeOptions?: Omit<MutationObserverBaseOptions, 'delegate'>): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return mutationObserver(selectorOrOptions, {...maybeOptions ?? {}, root: 'shadow', delegate: true});
  }
  return mutationObserver({...selectorOrOptions ?? {}, root: 'shadow', delegate: true});
}

export function mutationObserverDelegateAll(selector: EventListenerSelector, options?: Omit<MutationObserverBaseOptions, 'delegate'>): MethodDecorator;
export function mutationObserverDelegateAll(options?: Omit<MutationObserverBaseOptions, 'delegate'>): MethodDecorator;
export function mutationObserverDelegateAll(selectorOrOptions?: EventListenerSelector | Omit<MutationObserverBaseOptions, 'delegate'>, maybeOptions?: Omit<MutationObserverBaseOptions, 'delegate'>): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return mutationObserver(selectorOrOptions, {...maybeOptions ?? {}, root: 'all', delegate: true});
  }
  return mutationObserver({...selectorOrOptions ?? {}, root: 'all', delegate: true});
}

export function mutationObserverDelegate(selector: EventListenerSelector, options?: Omit<MutationObserverBaseOptions, 'delegate'>): MethodDecorator;
export function mutationObserverDelegate(options?: Omit<MutationObserverBaseOptions, 'delegate'>): MethodDecorator;
export function mutationObserverDelegate(selectorOrOptions?: EventListenerSelector | Omit<MutationObserverBaseOptions, 'delegate'>, maybeOptions?: Omit<MutationObserverBaseOptions, 'delegate'>): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return mutationObserver(selectorOrOptions, {...maybeOptions ?? {}, root: 'auto', delegate: true});
  }
  return mutationObserver({...selectorOrOptions ?? {}, root: 'auto', delegate: true});
}

// ─── root별 일반 헬퍼 (delegate 없이, 셀렉터 생략 시 $this) ───

export function mutationObserverLight(selector: EventListenerSelector, options?: MutationObserverBaseOptions): MethodDecorator;
export function mutationObserverLight(options?: MutationObserverBaseOptions): MethodDecorator;
export function mutationObserverLight(selectorOrOptions?: EventListenerSelector | MutationObserverBaseOptions, maybeOptions?: MutationObserverBaseOptions): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return mutationObserver(selectorOrOptions, {...maybeOptions ?? {}, root: 'light'});
  }
  return mutationObserver({...selectorOrOptions ?? {}, root: 'light'});
}

export function mutationObserverShadow(selector: EventListenerSelector, options?: MutationObserverBaseOptions): MethodDecorator;
export function mutationObserverShadow(options?: MutationObserverBaseOptions): MethodDecorator;
export function mutationObserverShadow(selectorOrOptions?: EventListenerSelector | MutationObserverBaseOptions, maybeOptions?: MutationObserverBaseOptions): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return mutationObserver(selectorOrOptions, {...maybeOptions ?? {}, root: 'shadow'});
  }
  return mutationObserver({...selectorOrOptions ?? {}, root: 'shadow'});
}

export function mutationObserverAll(selector: EventListenerSelector, options?: MutationObserverBaseOptions): MethodDecorator;
export function mutationObserverAll(options?: MutationObserverBaseOptions): MethodDecorator;
export function mutationObserverAll(selectorOrOptions?: EventListenerSelector | MutationObserverBaseOptions, maybeOptions?: MutationObserverBaseOptions): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return mutationObserver(selectorOrOptions, {...maybeOptions ?? {}, root: 'all'});
  }
  return mutationObserver({...selectorOrOptions ?? {}, root: 'all'});
}

export function getMutationObserverMetadata(target: any): MutationObserverMetadata[] | undefined {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(MUTATION_OBSERVER_METADATA_KEY, constructor);
}