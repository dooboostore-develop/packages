import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';
import { SpecialSelector, SwcQueryOptions } from '../types';

export interface EmitCustomEventBaseOptions {
  attributeName?: string;
  bubbles?: boolean;
  composed?: boolean;
  cancelable?: boolean;
}

export interface EmitCustomEventMetadata {
  propertyKey: string | symbol;
  selector: string;
  type: string;
  options: EmitCustomEventBaseOptions & SwcQueryOptions;
}

export const EMIT_CUSTOM_EVENT_METADATA_KEY = Symbol('simple-web-component:emit-custom-event');
export function emitCustomEvent(target: SpecialSelector, type: string, options?: EmitCustomEventBaseOptions): MethodDecorator;
export function emitCustomEvent(selector: string, type: string, options?: EmitCustomEventBaseOptions & SwcQueryOptions): MethodDecorator;
/**
 * @emitCustomEvent decorator to dispatch custom events to a target.
 */
export function emitCustomEvent(selectorOrTarget: string, type: string, options: any = {}): MethodDecorator {
  return (targetObj: Object, propertyKey: string | symbol) => {
    const constructor = targetObj.constructor;

    const fullOptions: any = { ...options, type };

    if (!fullOptions.attributeName) {
      fullOptions.attributeName = `swc-on-${type}`;
    }
    if (fullOptions.bubbles === undefined) fullOptions.bubbles = true;
    if (fullOptions.composed === undefined) fullOptions.composed = true;

    let list = ReflectUtils.getMetadata<EmitCustomEventMetadata[]>(EMIT_CUSTOM_EVENT_METADATA_KEY, constructor);
    if (!list) {
      list = [];
      ReflectUtils.defineMetadata(EMIT_CUSTOM_EVENT_METADATA_KEY, list, constructor);
    }
    list.push({ propertyKey, selector: selectorOrTarget, type, options: fullOptions });
  };
}

export const getEmitCustomEventMetadataList = (target: any): EmitCustomEventMetadata[] | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(EMIT_CUSTOM_EVENT_METADATA_KEY, constructor);
};
