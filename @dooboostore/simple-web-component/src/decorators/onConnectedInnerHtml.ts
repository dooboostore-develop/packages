import { ReflectUtils } from '@dooboostore/core';

export interface InnerHtmlOptions {
  useShadow?: boolean;
}

export interface InnerHtmlMetadata {
  propertyKey: string | symbol;
  options: InnerHtmlOptions;
}

export const INNER_HTML_METADATA_KEY = Symbol('simple-web-component:inner-html');

/**
 * @onConnectedInnerHtml decorator to define the initial HTML content when connected.
 */
export function onConnectedInnerHtml(options: InnerHtmlOptions): MethodDecorator;
export function onConnectedInnerHtml(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function onConnectedInnerHtml(arg1?: InnerHtmlOptions | Object, arg2?: string | symbol, arg3?: PropertyDescriptor): MethodDecorator | void {
  const decorator = (options: InnerHtmlOptions, target: Object, propertyKey: string | symbol) => {
    const constructor = target.constructor;
    let list = ReflectUtils.getMetadata<InnerHtmlMetadata[]>(INNER_HTML_METADATA_KEY, constructor);
    if (!list) {
      list = [];
      ReflectUtils.defineMetadata(INNER_HTML_METADATA_KEY, list, constructor);
    }
    list.push({ propertyKey, options });
  };

  if (arg2) {
    return decorator({}, arg1!, arg2);
  }

  return (target: Object, propertyKey: string | symbol) => {
    decorator((arg1 as InnerHtmlOptions) || {}, target, propertyKey);
  };
}

export const getOnConnectedInnerHtmlMetadata = (target: any): InnerHtmlMetadata[] | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(INNER_HTML_METADATA_KEY, constructor);
};
