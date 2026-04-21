import {ReflectUtils} from '@dooboostore/core';
import { SpecialSelector, SwcQueryOptions, HelperHostSet } from '../types';
import {ensureInit, getElementConfig} from './elementDefine';
import {SwcUtils} from '../utils/Utils';

export type EmitCustomEventSelector = string | ((currentThis: any, helper: HelperHostSet) => NodeList | Element | Element[] | null);

export interface EmitCustomEventBaseOptions {
  bubbles?: boolean;
  composed?: boolean;
  cancelable?: boolean;
  filter?: (target: EventTarget, detail: any, meta: { currentThis: any, helper: HelperHostSet }) => boolean;
  /**
   * Custom key to extract value from return object.
   * If not provided, uses EMIT_CUSTOM_EVENT_METADATA_KEY by default.
   * Useful when multiple @emitCustomEvent decorators are on the same method.
   * 
   * Example:
   * @emitCustomEvent('$appHost', 'event1', { valueKey: 'detail1' })
   * @emitCustomEvent('$appHost', 'event2', { valueKey: 'detail2' })
   * myMethod() {
   *   return {
   *     detail1: { type: 'event1', data: 'value1' },
   *     detail2: { type: 'event2', data: 'value2' }
   *   };
   * }
   */
  valueKey?: symbol | string;
}

type Options = (EmitCustomEventBaseOptions & SwcQueryOptions) | (EmitCustomEventBaseOptions & SwcQueryOptions & { attributeName?: string });

export interface EmitCustomEventMetadata {
  propertyKey: string | symbol;
  selector: EmitCustomEventSelector;
  type: string;
  options: Options;
}

export const EMIT_CUSTOM_EVENT_METADATA_KEY = Symbol.for('simple-web-component:emit-custom-event');

export function emitCustomEvent(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor | void;
export function emitCustomEvent(selector: EmitCustomEventSelector, type: string, options?: Options): MethodDecorator;
export function emitCustomEvent(type: string, options?: Options): MethodDecorator;
/**
 * @emitCustomEvent decorator to dispatch custom events to a target.
 * 
 * Usage:
 * - @emitCustomEvent('$this', 'event-name', options) - Emit from $this
 * - @emitCustomEvent('$appHost', 'event-name', options) - Emit from $appHost
 * - @emitCustomEvent((this, helper) => '.button', 'event-name', options) - Function-based selector
 * - @emitCustomEvent('event-name', options) - Emit from $this (defaults to $this)
 * - @emitCustomEvent('event-name') - Emit from $this with no options
 */
export function emitCustomEvent(selectorOrTarget: any, typeOrPropertyKey?: any, optionsOrDescriptor?: any): any {
  // Case 1: Bare decorator on property
  if (typeof selectorOrTarget === 'object' && typeof typeOrPropertyKey === 'string' && typeof optionsOrDescriptor === 'object' && 'value' in optionsOrDescriptor) {
    throw new Error(`@emitCustomEvent decorator cannot be used on properties. (Property: ${String(typeOrPropertyKey)})`);
  }

  // Case 2: With selector and type - @emitCustomEvent('selector', 'event-name', options)
  if ((typeof selectorOrTarget === 'string' || typeof selectorOrTarget === 'function') && typeof typeOrPropertyKey === 'string') {
    return createEmitDecorator(selectorOrTarget, typeOrPropertyKey, optionsOrDescriptor as Options);
  }

  // Case 3: Without selector (type only) - @emitCustomEvent('event-name', options)
  if (typeof selectorOrTarget === 'string' && typeOrPropertyKey !== 'string') {
    return createEmitDecorator('$this', selectorOrTarget, typeOrPropertyKey as Options);
  }

  // Fallback
  throw new Error('Invalid @emitCustomEvent usage');
}

function createEmitDecorator(selector: EmitCustomEventSelector, type: string, options?: Options) {
  return (targetObj: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const constructor = targetObj.constructor;

    const fullOptions: any = {...(options || {}), type};

    if (fullOptions.bubbles === undefined) fullOptions.bubbles = true;
    if (fullOptions.composed === undefined) fullOptions.composed = true;

    let list = ReflectUtils.getMetadata<EmitCustomEventMetadata[]>(EMIT_CUSTOM_EVENT_METADATA_KEY, constructor);
    if (!list) {
      list = [];
      ReflectUtils.defineMetadata(EMIT_CUSTOM_EVENT_METADATA_KEY, list, constructor);
    }
    list.push({propertyKey, selector, type, options: fullOptions});

    const original = descriptor.value;
    descriptor.value = function (...args: any[]) {
      ensureInit(this);
      const res = original.apply(this, args);

      const handleResult = (detail: any) => {
        const event = new CustomEvent(type, {
          detail,
          bubbles: fullOptions.bubbles,
          composed: fullOptions.composed,
          cancelable: fullOptions.cancelable
        });

        const conf = getElementConfig(this);
        const currentWin = (this as any)._resolveWindow?.(conf) || ((typeof window !== 'undefined' ? window : undefined) as Window);
        const hostSet = SwcUtils.getHelperAndHostSet(currentWin, this as any);

        const eventTargets: EventTarget[] = [];
        
        // Resolve selector if it's a function
        let resolvedSelector: string | Element | NodeList | Element[] | null = selector as any;
        if (typeof selector === 'function') {
          resolvedSelector = selector(this, hostSet);
        }

        // If selector function returned elements directly, use them
        if (resolvedSelector instanceof currentWin.Element) {
          eventTargets.push(resolvedSelector as EventTarget);
        } else if (resolvedSelector instanceof currentWin.NodeList) {
          eventTargets.push(...Array.from(resolvedSelector as EventTarget[]));
        } else if (Array.isArray(resolvedSelector)) {
          eventTargets.push(...(resolvedSelector as EventTarget[]));
        } else if (resolvedSelector === null) {
          // No targets
        } else {
          // Handle string selector
          const stringSelector = resolvedSelector as string;
          
          if (stringSelector === '$window') eventTargets.push(currentWin);
          else if (stringSelector === '$document') eventTargets.push(currentWin.document);
          else if (stringSelector === '$host') {
            if (hostSet.$host) eventTargets.push(hostSet.$host);
          } else if (stringSelector === '$parentHost') {
            if (hostSet.$parentHost) eventTargets.push(hostSet.$parentHost);
          } else if (stringSelector === '$appHost') {
            if (hostSet.$appHost) eventTargets.push(hostSet.$appHost);
          } else if (stringSelector === '$firstHost') {
            if (hostSet.$firstHost) eventTargets.push(hostSet.$firstHost);
          } else if (stringSelector === '$lastHost') {
            if (hostSet.$lastHost) eventTargets.push(hostSet.$lastHost);
          } else if (stringSelector === '$firstAppHost') {
            if (hostSet.$firstAppHost) eventTargets.push(hostSet.$firstAppHost);
          } else if (stringSelector === '$lastAppHost') {
            if (hostSet.$lastAppHost) eventTargets.push(hostSet.$lastAppHost);
          } else if (stringSelector === '$hosts') {
            hostSet.$hosts.forEach(h => eventTargets.push(h));
          } else if (stringSelector === '$appHosts') {
            hostSet.$appHosts.forEach(h => eventTargets.push(h));
          } else if (stringSelector === '$this' || !stringSelector) {
            eventTargets.push(this as any);
          } else {
            const r = fullOptions.root || 'auto';
            const searchRoots: (HTMLElement | ShadowRoot)[] = [];
            if (r === 'auto') searchRoots.push(this.shadowRoot || (this as any));
            else if (r === 'light') searchRoots.push(this as any);
            else if (r === 'shadow' && this.shadowRoot) searchRoots.push(this.shadowRoot);
            else if (r === 'all') {
              searchRoots.push(this as any);
              if (this.shadowRoot) searchRoots.push(this.shadowRoot);
            }

            searchRoots.forEach(sr => {
              sr.querySelectorAll(stringSelector).forEach(el => eventTargets.push(el));
            });
          }
        }

        eventTargets.forEach(t => {
          if (fullOptions.filter && !fullOptions.filter(t, detail, {currentThis: this, helper: hostSet})) {
            return;
          }
          t.dispatchEvent(event);
        });

        return detail;
      };

      if (res instanceof Promise) {
        return res.then(handleResult);
      } else {
        return handleResult(res);
      }
    };
  };
}

export const getEmitCustomEventMetadataList = (target: any): EmitCustomEventMetadata[] | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(EMIT_CUSTOM_EVENT_METADATA_KEY, constructor);
};

// --- Aliases: emit... ---
export const emit = emitCustomEvent;
