import { ReflectUtils } from '@dooboostore/core';
import { SpecialSelector, SwcQueryOptions, SwcSelector, SwcFnSelector, HelperHostSet } from '../types';

// 공통 옵션 — root·delegate 없음 (MutationObserverInit + filter/removeObserver)
export interface MutationObserverBaseOptions extends MutationObserverInit {
  filter?: (matchedEls: HTMLElement[], meta: { currentThis: any, helper: HelperHostSet }) => boolean;
  // observer 해제(disconnected) 시 호출되는 콜백. 첫 번째 인자는 observe된 target element, 두 번째는 사용자 옵션 객체.
  removeObserver?: (target: Element, optionValue: MutationObserverQueryOptions) => void;
}

// 문자열 셀렉터 전용 — root·delegate 허용 (셀렉터로 탐색/델리게이션)
export type MutationObserverQueryOptions = MutationObserverBaseOptions & SwcQueryOptions & { delegate?: boolean };
// 함수 셀렉터 전용 — root·delegate 금지 (이미 요소를 직접 반환)
export type MutationObserverNonQueryOptions = MutationObserverBaseOptions;

// 셀렉터 종류에 따라 옵션 타입 분기
export type MutationObserverOptionsOf<S extends SwcSelector> = S extends string ? MutationObserverQueryOptions : MutationObserverNonQueryOptions;

export interface MutationObserverMetadata {
  propertyKey: string | symbol;
  selector: SwcSelector;
  options: MutationObserverQueryOptions;
}

export const MUTATION_OBSERVER_METADATA_KEY = Symbol.for('simple-web-component:mutation-observer');

export function mutationObserver(target: SpecialSelector, options?: MutationObserverQueryOptions): MethodDecorator;
export function mutationObserver(selector: string, options?: MutationObserverQueryOptions): MethodDecorator;
export function mutationObserver(selector: SwcFnSelector, options?: MutationObserverNonQueryOptions): MethodDecorator;
export function mutationObserver(options?: MutationObserverQueryOptions): MethodDecorator;
/**
 * @mutationObserver decorator to observe DOM mutations.
 */
export function mutationObserver(selectorOrOptions?: SwcSelector | MutationObserverQueryOptions, maybeOptions?: MutationObserverQueryOptions): MethodDecorator {
  return (targetObj: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    let selector: SwcSelector = '$this';
    let options: MutationObserverQueryOptions = {};

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

export function mutationObserverThis<TEvent extends Event = Event>(options?: MutationObserverQueryOptions): MethodDecorator {
  return mutationObserver('$this', options);
}

// ─── root별 delegate 헬퍼 (addEventListener와 동일 패턴) ───

export function mutationObserverDelegateLight(selector: string, options?: MutationObserverBaseOptions): MethodDecorator;
export function mutationObserverDelegateLight(options?: MutationObserverBaseOptions): MethodDecorator;
export function mutationObserverDelegateLight(selectorOrOptions?: string | Omit<MutationObserverQueryOptions, 'root'>, maybeOptions?: Omit<MutationObserverQueryOptions, 'root'>): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return mutationObserver(selectorOrOptions, {...maybeOptions ?? {}, root: 'light', delegate: true});
  }
  return mutationObserver({...selectorOrOptions ?? {}, root: 'light', delegate: true});
}

export function mutationObserverDelegateShadow(selector: string, options?: MutationObserverBaseOptions): MethodDecorator;
export function mutationObserverDelegateShadow(options?: MutationObserverBaseOptions): MethodDecorator;
export function mutationObserverDelegateShadow(selectorOrOptions?: string | Omit<MutationObserverQueryOptions, 'root'>, maybeOptions?: Omit<MutationObserverQueryOptions, 'root'>): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return mutationObserver(selectorOrOptions, {...maybeOptions ?? {}, root: 'shadow', delegate: true});
  }
  return mutationObserver({...selectorOrOptions ?? {}, root: 'shadow', delegate: true});
}

export function mutationObserverDelegateAll(selector: string, options?: MutationObserverBaseOptions): MethodDecorator;
export function mutationObserverDelegateAll(options?: MutationObserverBaseOptions): MethodDecorator;
export function mutationObserverDelegateAll(selectorOrOptions?: string | Omit<MutationObserverQueryOptions, 'root'>, maybeOptions?: Omit<MutationObserverQueryOptions, 'root'>): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return mutationObserver(selectorOrOptions, {...maybeOptions ?? {}, root: 'all', delegate: true});
  }
  return mutationObserver({...selectorOrOptions ?? {}, root: 'all', delegate: true});
}

export function mutationObserverDelegate(selector: string, options?: MutationObserverBaseOptions): MethodDecorator;
export function mutationObserverDelegate(options?: MutationObserverBaseOptions): MethodDecorator;
export function mutationObserverDelegate(selectorOrOptions?: string | Omit<MutationObserverQueryOptions, 'root'>, maybeOptions?: Omit<MutationObserverQueryOptions, 'root'>): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return mutationObserver(selectorOrOptions, {...maybeOptions ?? {}, root: 'auto', delegate: true});
  }
  return mutationObserver({...selectorOrOptions ?? {}, root: 'auto', delegate: true});
}

// ─── root별 일반 헬퍼 (delegate 없이, 셀렉터 생략 시 $this) ───

export function mutationObserverLight(selector: string, options?: Omit<MutationObserverQueryOptions, 'root'>): MethodDecorator;
export function mutationObserverLight(options?: Omit<MutationObserverQueryOptions, 'root'>): MethodDecorator;
export function mutationObserverLight(selectorOrOptions?: string | Omit<MutationObserverQueryOptions, 'root'>, maybeOptions?: Omit<MutationObserverQueryOptions, 'root'>): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return mutationObserver(selectorOrOptions, {...maybeOptions ?? {}, root: 'light'});
  }
  return mutationObserver({...selectorOrOptions ?? {}, root: 'light'});
}

export function mutationObserverShadow(selector: string, options?: Omit<MutationObserverQueryOptions, 'root'>): MethodDecorator;
export function mutationObserverShadow(options?: Omit<MutationObserverQueryOptions, 'root'>): MethodDecorator;
export function mutationObserverShadow(selectorOrOptions?: string | Omit<MutationObserverQueryOptions, 'root'>, maybeOptions?: Omit<MutationObserverQueryOptions, 'root'>): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return mutationObserver(selectorOrOptions, {...maybeOptions ?? {}, root: 'shadow'});
  }
  return mutationObserver({...selectorOrOptions ?? {}, root: 'shadow'});
}

export function mutationObserverAll(selector: string, options?: Omit<MutationObserverQueryOptions, 'root'>): MethodDecorator;
export function mutationObserverAll(options?: Omit<MutationObserverQueryOptions, 'root'>): MethodDecorator;
export function mutationObserverAll(selectorOrOptions?: string | Omit<MutationObserverQueryOptions, 'root'>, maybeOptions?: Omit<MutationObserverQueryOptions, 'root'>): MethodDecorator {
  if (typeof selectorOrOptions === 'string' || typeof selectorOrOptions === 'function') {
    return mutationObserver(selectorOrOptions, {...maybeOptions ?? {}, root: 'all'});
  }
  return mutationObserver({...selectorOrOptions ?? {}, root: 'all'});
}

export function getMutationObserverMetadata(target: any): MutationObserverMetadata[] | undefined {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(MUTATION_OBSERVER_METADATA_KEY, constructor);
}