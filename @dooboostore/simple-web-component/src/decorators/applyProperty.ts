import { ReflectUtils } from '@dooboostore/core';
import { ensureInit, getElementConfig } from './elementDefine';
import { SwcUtils } from '../utils/Utils';
import { SwcQueryOptions, HelperHostSet, SwcFnSelector, SwcSelector } from '../types';

// 공통 옵션 — root 없음
export interface PropertyBaseOptions {
  name?: string | symbol;
  filter?: (target: HTMLElement, value: any, meta: {currentThis: any, helper: HelperHostSet}) => boolean;
  valueKey?: symbol | string;
  /** 읽기 방식: 'get' 타깃 프로퍼티 읽기 (기본), 'call' 타깃 호출 후 리턴 사용 */
  getType?: 'get' | 'call';
  /** 쓰기 방식: 'set' 타깃 프로퍼티 대입 (기본), 'call' 타깃 호출 (배열이면 spread) */
  setType?: 'set' | 'call';
}

// 문자열 셀렉터 전용 — root 허용
export type PropertyQueryOptions = PropertyBaseOptions & SwcQueryOptions;
// 함수 셀렉터 전용 — root 금지
export type PropertyNonQueryOptions = PropertyBaseOptions;
// 내부 저장/해석용 — root optional이라 두 종류 모두 저장 가능
export type PropertyOptions = PropertyQueryOptions;

export type PropertyFnSelector = SwcFnSelector;
export type PropertySelector = SwcSelector;

// 셀렉터 종류에 따라 옵션 타입 분기
export type PropertyOptionsOf<S extends PropertySelector> = S extends string ? PropertyQueryOptions : PropertyNonQueryOptions;

export interface PropertyMetadata {
  propertyKey: string | symbol;
  selector: PropertySelector;
  targetPropertyKey: string | symbol;
  options: PropertyOptions;
  type: 'property' | 'method';
}

export const PROPERTY_METADATA_KEY = Symbol.for('simple-web-component:property');

// ============================================
// Utilities
// ============================================

/**
 * Resolve target elements based on selector and options
 * Handles special selectors ($this, $host, etc.), CSS selectors, and function-based selectors
 * Returns HTMLElement[] but can include Window and Document for property access
 */
export const resolvePropertyTargets = (inst: any, selector: PropertySelector, options: PropertyOptions): any[] => {
  const conf = getElementConfig(inst);
  const currentWin = conf.window;
  const r = options.root || 'auto';
  const results: any[] = [];

  // Resolve selector if it's a function
  let resolvedSelector: string | Node | Element | NodeList | Element[] | null = selector as any;
  if (typeof selector === 'function') {
    const hostSet = SwcUtils.getHelperAndHostSet(currentWin, inst);
    resolvedSelector = selector(inst, hostSet);
  }

  // If selector function returned elements directly, use them
  if (resolvedSelector instanceof currentWin.Element) {
    results.push(resolvedSelector);
    return results;
  }
  if (resolvedSelector instanceof currentWin.NodeList) {
    results.push(...Array.from(resolvedSelector));
    return results;
  }
  if (Array.isArray(resolvedSelector)) {
    results.push(...resolvedSelector);
    return results;
  }
  if (resolvedSelector === null) {
    return results;
  }

  // Handle string selector
  const stringSelector = resolvedSelector as string;

  const applyRoot = (target: any) => {
    if (!target) return;
    if (r === 'auto') {
      results.push(target);
    } else {
      if (r === 'light' || r === 'all') results.push(target);
      if ((r === 'shadow' || r === 'all') && target.shadowRoot) results.push(target.shadowRoot);
    }
  };

  if (stringSelector === '$this' || !stringSelector) {
    applyRoot(inst);
  } else if (stringSelector === '$window') {
    results.push(currentWin);
  } else if (stringSelector === '$document') {
    results.push(currentWin.document);
  } else {
    const hostSet = SwcUtils.getHostSet(inst);
    if (stringSelector === '$host') applyRoot(hostSet.$host);
    else if (stringSelector === '$parentHost') applyRoot(hostSet.$parentHost);
    else if (stringSelector === '$appHost') applyRoot(hostSet.$appHost as any);
    else if (stringSelector === '$firstHost') applyRoot(hostSet.$firstHost);
    else if (stringSelector === '$lastHost') applyRoot(hostSet.$lastHost);
    else if (stringSelector === '$firstAppHost') applyRoot(hostSet.$firstAppHost as any);
    else if (stringSelector === '$lastAppHost') applyRoot(hostSet.$lastAppHost as any);
    else if (stringSelector === '$hosts') hostSet.$hosts.forEach(applyRoot);
    else if (stringSelector === '$appHosts') hostSet.$appHosts.forEach(applyRoot);
    else {
      if (r === 'shadow') {
        const found = inst.shadowRoot?.querySelectorAll(stringSelector);
        if (found) results.push(...found);
      } else if (r === 'light') {
        const found = inst.querySelectorAll(stringSelector);
        if (found) results.push(...found);
      } else if (r === 'all') {
        const sMatch = inst.shadowRoot?.querySelectorAll(stringSelector);
        const lMatch = inst.querySelectorAll(stringSelector);
        if (sMatch) results.push(...sMatch);
        if (lMatch) results.push(...lMatch);
      } else {
        const found = (inst.shadowRoot || inst).querySelectorAll(stringSelector);
        if (found) results.push(...found);
      }
    }
  }
  return results;
};

/**
 * @applyProperty decorator - set/get element properties
 * 
 * Usage:
 * - @applyProperty('selector', 'propertyName') - Set property with explicit name
 * - @applyProperty('selector') - Use property name as target property name
 * - @applyProperty('selector', { name: 'propertyName' }) - Set property via options
 * - @applyProperty((this, helper) => 'selector', 'propertyName') - Function-based selector
 * - Return null/undefined to skip setting
 */
export function applyProperty<S extends PropertySelector>(selector: S, targetPropertyKey: string | symbol, options?: PropertyOptionsOf<S>): MethodDecorator & PropertyDecorator;
export function applyProperty<S extends PropertySelector>(selector: S, options?: PropertyOptionsOf<S>): MethodDecorator & PropertyDecorator;
export function applyProperty(selector: PropertySelector, targetPropertyKeyOrOptions?: string | symbol | PropertyOptions, options?: PropertyOptions): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor?: PropertyDescriptor) => {
    // ensureInit(target as any);
    
    const constructor = target.constructor;
    const metaType: 'property' | 'method' = descriptor && typeof descriptor.value === 'function' ? 'method' : 'property';
    
    // Parse arguments
    let finalOptions: PropertyOptions = {};
    let targetPropertyKey: string | symbol;
    
    if (typeof targetPropertyKeyOrOptions === 'string' || typeof targetPropertyKeyOrOptions === 'symbol') {
      // applyProperty('selector', 'propertyName', options?)
      targetPropertyKey = targetPropertyKeyOrOptions;
      finalOptions = options || {};
    } else if (targetPropertyKeyOrOptions) {
      // applyProperty('selector', options)
      finalOptions = targetPropertyKeyOrOptions;
      targetPropertyKey = finalOptions.name || propertyKey;
    } else {
      // applyProperty('selector')
      targetPropertyKey = propertyKey;
    }

    // Store metadata
    let metaList = ReflectUtils.getOwnMetadata(PROPERTY_METADATA_KEY, constructor) as PropertyMetadata[];
    if (!metaList) {
      metaList = [];
      ReflectUtils.defineMetadata(PROPERTY_METADATA_KEY, metaList, constructor);
    }
    metaList.push({
      propertyKey,
      selector: selector as PropertySelector,
      targetPropertyKey,
      options: finalOptions,
      type: metaType
    });

    // Helper: apply resolved value to targets (setType 'call'이면 타깃 호출 — 배열은 spread)
    const applyValueToTargets = (inst: any, resolvedValue: any) => {
      if (resolvedValue === undefined) return resolvedValue;

      const targetEls = resolvePropertyTargets(inst, selector, finalOptions);
      const conf = getElementConfig(inst);
      const currentWin = conf.window;
      const hostSet = SwcUtils.getHelperAndHostSet(currentWin, inst);

      targetEls.forEach(targetEl => {
        // Apply filter if provided
        if (finalOptions.filter && !finalOptions.filter(targetEl, resolvedValue, { currentThis: inst, helper: hostSet })) {
          return;
        }

        const resolvedRes = typeof resolvedValue === 'function' ? (resolvedValue as any)(targetEl, hostSet) : resolvedValue;
        if (finalOptions.setType === 'call') {
          if (typeof (targetEl as any)[targetPropertyKey] !== 'function') return;
          if (Array.isArray(resolvedRes)) (targetEl as any)[targetPropertyKey].apply(targetEl, resolvedRes);
          else (targetEl as any)[targetPropertyKey].call(targetEl, resolvedRes);
          return;
        }
        (targetEl as any)[targetPropertyKey] = resolvedRes;
      });

      return resolvedValue;
    };

    // Method decorator: wrap method to apply its return value to properties
    if (descriptor && typeof descriptor.value === 'function') {
      const original = descriptor.value;
      descriptor.value = function (...args: any[]) {
        ensureInit(this);
        const res = (original as any).apply(this, args);

        /**
         * Extract value for this decorator from method return value
         * 
         * If return value is an object with this decorator's symbol key,
         * use that value. Otherwise use the entire return value.
         * 
         * Example:
         * @property('selector')
         * myMethod() {
         *   return {
         *     [PROPERTY_METADATA_KEY]: 'property-value',
         *     [OTHER_DECORATOR_KEY]: 'other-value'
         *   };
         * }
         * 
         * This decorator will use 'property-value'
         */
        const extractValue = (v: any) => {
          if (v && typeof v === 'object' && PROPERTY_METADATA_KEY in v) {
            return v[PROPERTY_METADATA_KEY];
          }
          return v;
        };

        if (res instanceof Promise) {
          return res.then((v: any) => { 
            const extracted = extractValue(v);
            applyValueToTargets(this, extracted); 
            return v; 
          });
        } else {
          const extracted = extractValue(res);
          applyValueToTargets(this, extracted);
          return res;
        }
      };
      return;
    }

    // Property decorator: define getter/setter to proxy to element properties.
    // selector가 '$this' + 타겟 키가 자기 필드면 getter/setter 만들지 않고 리턴.
    // (메타데이터는 위에서 이미 등록됨 → 하이드레이션 수집은 됨.)
    // 순수 필드로 두는 게 업그레이드 때 값 유지에 안전 (setter 경로 타면 생성자·폴리필에 날아감).
    if (selector === '$this' && targetPropertyKey === propertyKey) {
      return;
    }
    Object.defineProperty(target, propertyKey, {
      configurable: true,
      enumerable: true,
      get(this: any) {
        ensureInit(this);
        // Read from matched elements
        const targetEls = resolvePropertyTargets(this, selector, finalOptions);
        const conf = getElementConfig(this);
        const currentWin = conf.window;
        const hostSet = SwcUtils.getHelperAndHostSet(currentWin, this);

        // Apply filter
        const filtered = targetEls.filter(el => {
          if (finalOptions.filter && !finalOptions.filter(el, (el as any)[targetPropertyKey], { currentThis: this, helper: hostSet })) {
            return false;
          }
          return true;
        });

        const values = filtered.map(el => {
          const raw = (el as any)[targetPropertyKey];
          // getType 'call'이면 타깃 호출 후 리턴 사용
          if (finalOptions.getType === 'call' && typeof raw === 'function') return raw.call(el);
          return raw;
        });
        return values.length === 1 ? values[0] : values;
      },
      set(this: any, value: any) {
        ensureInit(this);
        applyValueToTargets(this, value);
      }
    });
  };
}

// ============================================
// Convenience Aliases
// ============================================

/**
 * @property - 필드/메서드 공용. 붙은 곳에 따라 동작이 갈린다.
 * - 필드: 대상 엘리먼트 프로퍼티를 읽고 쓰는 getter/setter ($this + 같은 이름이면 순수 필드로 두고 하이드레이션만 등록)
 * - 메서드: 리턴값을 대상 엘리먼트 프로퍼티에 대입 (undefined 면 무시)
 *
 * 첫 문자열은 항상 셀렉터. 자기 자신의 프로퍼티는 필드 그 자체라 이름만 받는 형태는 의미가 없다.
 * - @property - $this, 이름은 필드/메서드 이름
 * - @property('selector') / @property('selector', options) - 대상의 같은 이름 프로퍼티
 * - @property('selector', 'propertyName', options?) - 대상의 propertyName
 * - @property((this, helper) => el, 'propertyName') - 함수 셀렉터
 * - @property(options) - $this, 이름은 options.name 또는 필드/메서드 이름
 *
 * Example:
 * @property('#chart', 'data') chartData: number[];
 *
 * @property('button', 'disabled')
 * lock() { return true; }
 */
export function property(selector: string, targetPropertyKey: string | symbol, options?: PropertyQueryOptions): MethodDecorator & PropertyDecorator;
export function property(selector: PropertyFnSelector, targetPropertyKey: string | symbol, options?: PropertyNonQueryOptions): MethodDecorator & PropertyDecorator;
export function property(selector: string, options?: PropertyQueryOptions): MethodDecorator & PropertyDecorator;
export function property(selector: PropertyFnSelector, options?: PropertyNonQueryOptions): MethodDecorator & PropertyDecorator;
export function property(options: PropertyOptions): MethodDecorator & PropertyDecorator;
// bare(@property) 시그니처는 맨 뒤 — 앞에 있으면 문자열 두 개짜리 호출이 (target, key) 로 먼저 잡혀 TS1240
export function property(target: Object, propertyKey: string | symbol): void;
export function property(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
export function property(selectorOrTarget?: PropertySelector | PropertyOptions | Object, targetPropertyKeyOrOptions?: any, optionsOrDescriptor?: any): any {
  // 셀렉터 (문자열 / 함수)
  if (typeof selectorOrTarget === 'string' || typeof selectorOrTarget === 'function') {
    return applyProperty(selectorOrTarget as PropertySelector, targetPropertyKeyOrOptions as any, optionsOrDescriptor as PropertyOptions);
  }
  // bare: @property — 데코레이터로 바로 호출됨 (target=prototype, key[, descriptor])
  if (selectorOrTarget && (typeof targetPropertyKeyOrOptions === 'string' || typeof targetPropertyKeyOrOptions === 'symbol')) {
    return applyProperty('$this', {})(selectorOrTarget as Object, targetPropertyKeyOrOptions, optionsOrDescriptor as PropertyDescriptor);
  }
  // 옵션만: $this
  return applyProperty('$this', selectorOrTarget as PropertyOptions);
}

/**
 * @callProperty - Method decorator for calling a method on matched elements.
 * - @callProperty('selector', 'methodName') - 메서드 리턴값으로 타깃 메서드 호출
 * - @callProperty('selector') - 메서드 이름과 같은 타깃 메서드 호출
 * - 리턴값이 배열이면 spread 인자로 호출, 아니면 단일 인자로 호출
 *
 * Example:
 * @event('#popup', 'open-request')
 * @callProperty('#popup', 'show')
 * onPopupOpen() {
 *   return [this.rows]; // popup.show(this.rows)
 * }
 */
export function callProperty(selector: string, targetMethodKey?: string | symbol, options?: PropertyQueryOptions): MethodDecorator;
export function callProperty(selector: PropertyFnSelector, targetMethodKey?: string | symbol, options?: PropertyNonQueryOptions): MethodDecorator;
export function callProperty(selector: string, options?: PropertyQueryOptions): MethodDecorator;
export function callProperty(selectorOrTarget?: PropertySelector | PropertyOptions, targetMethodKeyOrOptions?: any, optionsOrUndefined?: PropertyOptions): MethodDecorator {
  // setType 'call' 위임 — 메서드 리턴값을 타깃 메서드 호출로 전달 (배열이면 spread)
  if (typeof selectorOrTarget === 'string' || typeof selectorOrTarget === 'function') {
    if (typeof targetMethodKeyOrOptions === 'string' || typeof targetMethodKeyOrOptions === 'symbol') {
      return applyProperty(selectorOrTarget as any, targetMethodKeyOrOptions, { ...optionsOrUndefined ?? {}, setType: 'call' }) as MethodDecorator;
    }
    return applyProperty(selectorOrTarget as any, { ...optionsOrUndefined ?? targetMethodKeyOrOptions ?? {}, setType: 'call' }) as MethodDecorator;
  }
  return applyProperty('$this', undefined as any, { ...selectorOrTarget ?? {}, setType: 'call' }) as MethodDecorator;
}
export function callPropertyLight(selector: string, targetMethodKey?: string | symbol, options?: Omit<PropertyQueryOptions, 'root'>): MethodDecorator;
export function callPropertyLight(selector: string, options?: Omit<PropertyQueryOptions, 'root'>): MethodDecorator;
export function callPropertyLight(selector: string, targetMethodKeyOrOptions?: any, options?: Omit<PropertyQueryOptions, 'root'>): MethodDecorator {
  if (targetMethodKeyOrOptions != null && typeof targetMethodKeyOrOptions !== 'string' && typeof targetMethodKeyOrOptions !== 'symbol') {
    return callProperty(selector, undefined, { ...targetMethodKeyOrOptions ?? {}, root: 'light' });
  }
  return callProperty(selector, targetMethodKeyOrOptions as any, { ...options ?? {}, root: 'light' });
}
export function callPropertyShadow(selector: string, targetMethodKey?: string | symbol, options?: Omit<PropertyQueryOptions, 'root'>): MethodDecorator;
export function callPropertyShadow(selector: string, options?: Omit<PropertyQueryOptions, 'root'>): MethodDecorator;
export function callPropertyShadow(selector: string, targetMethodKeyOrOptions?: any, options?: Omit<PropertyQueryOptions, 'root'>): MethodDecorator {
  if (targetMethodKeyOrOptions != null && typeof targetMethodKeyOrOptions !== 'string' && typeof targetMethodKeyOrOptions !== 'symbol') {
    return callProperty(selector, undefined, { ...targetMethodKeyOrOptions ?? {}, root: 'shadow' });
  }
  return callProperty(selector, targetMethodKeyOrOptions as any, { ...options ?? {}, root: 'shadow' });
}
export function callPropertyAll(selector: string, targetMethodKey?: string | symbol, options?: Omit<PropertyQueryOptions, 'root'>): MethodDecorator {
  return callProperty(selector, targetMethodKey as any, { ...options ?? {}, root: 'all' });
}

// ============================================
// Metadata Helpers
// ============================================

export const findAllPropertyMetadata = (target: any): PropertyMetadata[] => {
  const actualTarget = target instanceof Function ? target : target.constructor;
  return ReflectUtils.findAllMetadata<PropertyMetadata[]>(PROPERTY_METADATA_KEY, actualTarget).flat();
};

// Backward compatibility alias
export const findAllPropertyApplyMetadata = (target: any): Map<string | symbol, PropertyMetadata> => {
  const result = new Map<string | symbol, PropertyMetadata>();
  findAllPropertyMetadata(target).forEach(meta => {
    result.set(meta.propertyKey, meta);
  });
  return result;
};

// ─── Aliases ───
// applyProperty 단축명
export const prop = applyProperty;

// ─── 편의 헬퍼 (selector/root 생략) ───

const dispatchPropConvenience = (
  selector: '$this' | '$appHost' | '$window' | '$document',
  targetPropertyKeyOrTarget?: string | symbol | Object,
  optionsOrPropertyKey?: PropertyQueryOptions | string | symbol,
  descriptor?: PropertyDescriptor
): any => {
  if ((typeof optionsOrPropertyKey === 'string' || typeof optionsOrPropertyKey === 'symbol') && descriptor !== undefined) {
    return (applyProperty(selector, undefined as any, {}) as any)(targetPropertyKeyOrTarget, optionsOrPropertyKey, descriptor);
  }
  return applyProperty(selector, targetPropertyKeyOrTarget as any, optionsOrPropertyKey as PropertyQueryOptions);
};

export function propThis(targetPropertyKey?: string | symbol, options?: PropertyQueryOptions): MethodDecorator;
export function propThis(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
export function propThis(targetPropertyKeyOrTarget?: string | symbol | Object, optionsOrPropertyKey?: PropertyQueryOptions | string | symbol, descriptor?: PropertyDescriptor): any {
  return dispatchPropConvenience('$this', targetPropertyKeyOrTarget, optionsOrPropertyKey, descriptor);
}
export function propAppHost(targetPropertyKey?: string | symbol, options?: PropertyQueryOptions): MethodDecorator;
export function propAppHost(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
export function propAppHost(targetPropertyKeyOrTarget?: string | symbol | Object, optionsOrPropertyKey?: PropertyQueryOptions | string | symbol, descriptor?: PropertyDescriptor): any {
  return dispatchPropConvenience('$appHost', targetPropertyKeyOrTarget, optionsOrPropertyKey, descriptor);
}
export function propWindow(targetPropertyKey?: string | symbol, options?: PropertyQueryOptions): MethodDecorator;
export function propWindow(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
export function propWindow(targetPropertyKeyOrTarget?: string | symbol | Object, optionsOrPropertyKey?: PropertyQueryOptions | string | symbol, descriptor?: PropertyDescriptor): any {
  return dispatchPropConvenience('$window', targetPropertyKeyOrTarget, optionsOrPropertyKey, descriptor);
}
export function propDocument(targetPropertyKey?: string | symbol, options?: PropertyQueryOptions): MethodDecorator;
export function propDocument(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
export function propDocument(targetPropertyKeyOrTarget?: string | symbol | Object, optionsOrPropertyKey?: PropertyQueryOptions | string | symbol, descriptor?: PropertyDescriptor): any {
  return dispatchPropConvenience('$document', targetPropertyKeyOrTarget, optionsOrPropertyKey, descriptor);
}
export function propLight(selector: string, targetPropertyKey?: string | symbol, options?: Omit<PropertyQueryOptions, 'root'>): MethodDecorator {
  return applyProperty(selector, targetPropertyKey, {...options ?? {}, root: 'light'});
}
export function propShadow(selector: string, targetPropertyKey?: string | symbol, options?: Omit<PropertyQueryOptions, 'root'>): MethodDecorator {
  return applyProperty(selector, targetPropertyKey, {...options ?? {}, root: 'shadow'});
}
export function propAll(selector: string, targetPropertyKey?: string | symbol, options?: Omit<PropertyQueryOptions, 'root'>): MethodDecorator {
  return applyProperty(selector, targetPropertyKey, {...options ?? {}, root: 'all'});
}

// ─── property root 별칭 ───
export function propertyLight(selector: string, targetPropertyKey?: string | symbol, options?: Omit<PropertyQueryOptions, 'root'>): MethodDecorator & PropertyDecorator {
  return applyProperty(selector, targetPropertyKey, {...options ?? {}, root: 'light'});
}
export function propertyShadow(selector: string, targetPropertyKey?: string | symbol, options?: Omit<PropertyQueryOptions, 'root'>): MethodDecorator & PropertyDecorator {
  return applyProperty(selector, targetPropertyKey, {...options ?? {}, root: 'shadow'});
}
export function propertyAll(selector: string, targetPropertyKey?: string | symbol, options?: Omit<PropertyQueryOptions, 'root'>): MethodDecorator & PropertyDecorator {
  return applyProperty(selector, targetPropertyKey, {...options ?? {}, root: 'all'});
}

export default applyProperty;
