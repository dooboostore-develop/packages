import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';

export interface EmitCustomEventOptions {
  type: string;
  attributeName?: string;
  bubbles?: boolean;
  composed?: boolean;
  cancelable?: boolean;
}

export interface EmitCustomEventMetadata {
  propertyKey: string | symbol;
  options: EmitCustomEventOptions;
}

export const EMIT_CUSTOM_EVENT_METADATA_KEY = Symbol('simple-web-component:emit-custom-event');

export function emitCustomEvent(typeOrOptions: string | EmitCustomEventOptions): MethodDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const constructor = target.constructor;
    const options: EmitCustomEventOptions = typeof typeOrOptions === 'string' ? { type: typeOrOptions } : typeOrOptions;

    if (!options.attributeName) {
      options.attributeName = `swc-on-${options.type}`;
    }
    if (options.bubbles === undefined) options.bubbles = true;
    if (options.composed === undefined) options.composed = true;

    let list = ReflectUtils.getMetadata<EmitCustomEventMetadata[]>(EMIT_CUSTOM_EVENT_METADATA_KEY, constructor);
    if (!list) {
      list = [];
      ReflectUtils.defineMetadata(EMIT_CUSTOM_EVENT_METADATA_KEY, list, constructor);
    }
    list.push({ propertyKey, options });
  };
}

export const getEmitCustomEventMetadataList = (target: any): EmitCustomEventMetadata[] | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(EMIT_CUSTOM_EVENT_METADATA_KEY, constructor);
};
