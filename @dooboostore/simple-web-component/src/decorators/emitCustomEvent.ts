import {ReflectUtils} from '@dooboostore/core';
import {SpecialSelector, SwcQueryOptions, HelperHostSet} from '../types';
import {ensureInit, getElementConfig} from './elementDefine';
import {SwcUtils} from '../utils/Utils';

export interface EmitCustomEventBaseOptions {
  bubbles?: boolean;
  composed?: boolean;
  cancelable?: boolean;
  filter?: (target: EventTarget, detail: any, meta: { currentThis: any, helper: HelperHostSet }) => boolean;
}

type Options = (EmitCustomEventBaseOptions & SwcQueryOptions) | (EmitCustomEventBaseOptions & SwcQueryOptions & { attributeName?: string });

export interface EmitCustomEventMetadata {
  propertyKey: string | symbol;
  selector: string;
  type: string;
  options: Options;
}

export const EMIT_CUSTOM_EVENT_METADATA_KEY = Symbol.for('simple-web-component:emit-custom-event');

export function emitCustomEvent(target: SpecialSelector, type: string, options?: Options): MethodDecorator;
export function emitCustomEvent(selector: string, type: string, options?: Options): MethodDecorator;
/**
 * @emitCustomEvent decorator to dispatch custom events to a target.
 */
export function emitCustomEvent(selectorOrTarget: string, type: string, options: any = {}): MethodDecorator {
  return (targetObj: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const constructor = targetObj.constructor;

    const fullOptions: any = {...options, type};

    if (fullOptions.bubbles === undefined) fullOptions.bubbles = true;
    if (fullOptions.composed === undefined) fullOptions.composed = true;

    let list = ReflectUtils.getMetadata<EmitCustomEventMetadata[]>(EMIT_CUSTOM_EVENT_METADATA_KEY, constructor);
    if (!list) {
      list = [];
      ReflectUtils.defineMetadata(EMIT_CUSTOM_EVENT_METADATA_KEY, list, constructor);
    }
    list.push({propertyKey, selector: selectorOrTarget, type, options: fullOptions});

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

        const hostSet = SwcUtils.getHostSet(this as any);
        const conf = getElementConfig(this);
        const currentWin = (this as any)._resolveWindow?.(conf) || ((typeof window !== 'undefined' ? window : undefined) as Window);

        const eventTargets: EventTarget[] = [];
        if (selectorOrTarget === '$window') eventTargets.push(currentWin);
        else if (selectorOrTarget === '$document') eventTargets.push(currentWin.document);
        else if (selectorOrTarget === '$host') {
          if (hostSet.$host) eventTargets.push(hostSet.$host);
        } else if (selectorOrTarget === '$parentHost') {
          if (hostSet.$parentHost) eventTargets.push(hostSet.$parentHost);
        } else if (selectorOrTarget === '$appHost') {
          if (hostSet.$appHost) eventTargets.push(hostSet.$appHost);
        } else if (selectorOrTarget === '$firstHost') {
          if (hostSet.$firstHost) eventTargets.push(hostSet.$firstHost);
        } else if (selectorOrTarget === '$lastHost') {
          if (hostSet.$lastHost) eventTargets.push(hostSet.$lastHost);
        } else if (selectorOrTarget === '$firstAppHost') {
          if (hostSet.$firstAppHost) eventTargets.push(hostSet.$firstAppHost);
        } else if (selectorOrTarget === '$lastAppHost') {
          if (hostSet.$lastAppHost) eventTargets.push(hostSet.$lastAppHost);
        } else if (selectorOrTarget === '$hosts') {
          hostSet.$hosts.forEach(h => eventTargets.push(h));
        } else if (selectorOrTarget === '$appHosts') {
          hostSet.$appHosts.forEach(h => eventTargets.push(h));
        } else if (selectorOrTarget === '$this' || !selectorOrTarget) {
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

/**
 * @emitCustomEventThis decorator - simplified version of @emitCustomEvent for $this selector
 */
export function emitCustomEventThis(type: string, options: EmitCustomEventBaseOptions & SwcQueryOptions & { attributeName?: string }): MethodDecorator ;
export function emitCustomEventThis(type: string, attributeName: string): MethodDecorator ;
export function emitCustomEventThis(type: string): MethodDecorator;
export function emitCustomEventThis(type: string, optionsOrAttributeaName?: string | (EmitCustomEventBaseOptions & SwcQueryOptions & { attributeName?: string })): MethodDecorator {
  if (optionsOrAttributeaName && typeof optionsOrAttributeaName === 'string') {
    return emitCustomEventThis(type, {attributeName: optionsOrAttributeaName});
  } else if (optionsOrAttributeaName && typeof optionsOrAttributeaName === 'object') {
    if (!optionsOrAttributeaName.attributeName) {
      optionsOrAttributeaName.attributeName = `on-emit-${type}`;
    }
    return emitCustomEvent('$this', type, optionsOrAttributeaName);
  } else {
    return emitCustomEvent('$this', type, {attributeName: `on-emit-${type}`});
  }
}
