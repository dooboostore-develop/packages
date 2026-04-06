import { ReflectUtils } from '@dooboostore/core';
import { SpecialSelector, SwcQueryOptions, HelperHostSet } from '../types';
import { ensureInit, getElementConfig } from './elementDefine';
import { SwcUtils } from '../utils/Utils';

export interface EmitCustomEventBaseOptions {
  bubbles?: boolean;
  composed?: boolean;
  cancelable?: boolean;
  filter?: (target: EventTarget, detail: any, meta: {currentThis: any, helper: HelperHostSet}) => boolean;
}

export interface EmitCustomEventMetadata {
  propertyKey: string | symbol;
  selector: string;
  type: string;
  options: (EmitCustomEventBaseOptions & SwcQueryOptions) | (EmitCustomEventBaseOptions & SwcQueryOptions & { attributeName?: string });
}

export const EMIT_CUSTOM_EVENT_METADATA_KEY = Symbol.for('simple-web-component:emit-custom-event');
export function emitCustomEvent(target: SpecialSelector, type: string, options?: EmitCustomEventBaseOptions): MethodDecorator;
export function emitCustomEvent(selector: string, type: string, options?: EmitCustomEventBaseOptions & SwcQueryOptions): MethodDecorator;
/**
 * @emitCustomEvent decorator to dispatch custom events to a target.
 */
export function emitCustomEvent(selectorOrTarget: string, type: string, options: any = {}): MethodDecorator {
  return (targetObj: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const constructor = targetObj.constructor;

    const fullOptions: any = { ...options, type };

    if (fullOptions.bubbles === undefined) fullOptions.bubbles = true;
    if (fullOptions.composed === undefined) fullOptions.composed = true;

    let list = ReflectUtils.getMetadata<EmitCustomEventMetadata[]>(EMIT_CUSTOM_EVENT_METADATA_KEY, constructor);
    if (!list) {
      list = [];
      ReflectUtils.defineMetadata(EMIT_CUSTOM_EVENT_METADATA_KEY, list, constructor);
    }
    list.push({ propertyKey, selector: selectorOrTarget, type, options: fullOptions });

    const original = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      ensureInit(this);
      const detail = await original.apply(this, args);
      const event = new CustomEvent(type, {
        detail,
        bubbles: fullOptions.bubbles,
        composed: fullOptions.composed,
        cancelable: fullOptions.cancelable
      });

      const hostSet = SwcUtils.getHostSet(this as any);
      const conf = getElementConfig(this);
      const currentWin = (this as any)._resolveWindow?.(conf) || ((typeof window !== 'undefined' ? window : undefined) as Window);
      // console.log('emitEEEEEEEEEEE', hostSet);

      const eventTargets: EventTarget[] = [];
      if (selectorOrTarget === ':window') eventTargets.push(currentWin);
      else if (selectorOrTarget === ':document') eventTargets.push(currentWin.document);
      else if (selectorOrTarget === ':parentHost') {
        if (hostSet.$parentHost) eventTargets.push(hostSet.$parentHost);
      } else if (selectorOrTarget === ':appHost') {
        if (hostSet.$appHost) eventTargets.push(hostSet.$appHost);
      } else if (selectorOrTarget === ':firstHost') {
        if (hostSet.$firstHost) eventTargets.push(hostSet.$firstHost);
      } else if (selectorOrTarget === ':lastHost') {
        if (hostSet.$lastHost) eventTargets.push(hostSet.$lastHost);
      } else if (selectorOrTarget === ':firstAppHost') {
        if (hostSet.$firstAppHost) eventTargets.push(hostSet.$firstAppHost);
      } else if (selectorOrTarget === ':lastAppHost') {
        if (hostSet.$lastAppHost) eventTargets.push(hostSet.$lastAppHost);
      } else if (selectorOrTarget === ':hosts') {
        hostSet.$hosts.forEach(h => eventTargets.push(h));
      } else if (selectorOrTarget === ':appHosts') {
        hostSet.$appHosts.forEach(h => eventTargets.push(h));
      } else if (selectorOrTarget === ':host' || !selectorOrTarget) eventTargets.push(this as any);
      else {
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
          sr.querySelectorAll(selectorOrTarget).forEach(el => eventTargets.push(el));
        });
      }

      eventTargets.forEach(t => {
        if (fullOptions.filter && !fullOptions.filter(t, detail, {currentThis: this, helper: hostSet})) {
          return;
        }
        t.dispatchEvent(event);
      });
      return detail;
    };
  };
}

export const getEmitCustomEventMetadataList = (target: any): EmitCustomEventMetadata[] | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(EMIT_CUSTOM_EVENT_METADATA_KEY, constructor);
};

/**
 * @emitCustomEventHost decorator - simplified version of @emitCustomEvent for :host selector
 * Usage: @emitCustomEventHost('navigate') // default attributeName: 'on-emit-navigate'
 * Usage: @emitCustomEventHost('navigate', { attributeName: 'on-navigate' })
 * 
 * The attributeName option is used to automatically observe attributes for this event.
 * For example, { attributeName: 'on-navigate' } will add 'on-navigate' to observedAttributes.
 */
export function emitCustomEventHost(type: string, options: EmitCustomEventBaseOptions & SwcQueryOptions & { attributeName?: string } = {}): MethodDecorator {
  if (!options.attributeName) {
    options.attributeName = `on-emit-${type}`;
  }
  return emitCustomEvent(':host', type, options);
}
