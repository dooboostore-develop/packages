import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';

export interface EmitCustomEventOptions {
  type: string;
  attributeName?: string; // Default: on + type
  bubbles?: boolean; // Default: true
  composed?: boolean; // Default: true
  cancelable?: boolean;
}

export interface EmitCustomEventMetadata {
  propertyKey: string | symbol;
  options: EmitCustomEventOptions;
}

export const EMIT_CUSTOM_EVENT_METADATA_KEY = Symbol('simple-web-component:emit-custom-event');

export function emitCustomEvent(typeOrOptions: string | EmitCustomEventOptions): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const constructor = target.constructor;
    const options: EmitCustomEventOptions = typeof typeOrOptions === 'string' ? { type: typeOrOptions } : typeOrOptions;

    if (!options.attributeName) {
      options.attributeName = `on${options.type}`;
    }
    if (options.bubbles === undefined) options.bubbles = true;
    if (options.composed === undefined) options.composed = true;

    let list = ReflectUtils.getMetadata<EmitCustomEventMetadata[]>(EMIT_CUSTOM_EVENT_METADATA_KEY, constructor);
    if (!list) {
      list = [];
      ReflectUtils.defineMetadata(EMIT_CUSTOM_EVENT_METADATA_KEY, list, constructor);
    }
    list.push({ propertyKey, options });

    // Wrap the original method to dispatch event after execution
    const originalMethod = descriptor.value;
    descriptor.value = function (this: HTMLElement, ...args: any[]) {
      const detail = originalMethod.apply(this, args);

      const event = new CustomEvent(options.type, {
        detail,
        bubbles: options.bubbles,
        composed: options.composed,
        cancelable: options.cancelable
      });

      this.dispatchEvent(event);
      return detail;
    };
  };
}

export const getEmitCustomEventMetadataList = (target: any): EmitCustomEventMetadata[] | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(EMIT_CUSTOM_EVENT_METADATA_KEY, constructor);
};
