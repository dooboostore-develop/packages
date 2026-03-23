import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';

export interface InnerHtmlOptions {
  useShadow?: boolean;
}

export interface InnerHtmlMetadata {
  propertyKey: string | symbol;
  options: InnerHtmlOptions;
}

export const INNER_HTML_METADATA_KEY = Symbol('simple-web-component:inner-html');

export function innerHtml(options: InnerHtmlOptions): MethodDecorator;
export function innerHtml(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function innerHtml(arg1?: InnerHtmlOptions | Object, arg2?: string | symbol, arg3?: PropertyDescriptor): MethodDecorator | void {
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
    // Used as @innerHtml
    return decorator({}, arg1!, arg2);
  }

  // Used as @innerHtml(options)
  return (target: Object, propertyKey: string | symbol) => {
    decorator((arg1 as InnerHtmlOptions) || {}, target, propertyKey);
  };
}

export const getInnerHtmlMetadataList = (target: any): InnerHtmlMetadata[] | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(INNER_HTML_METADATA_KEY, constructor);
};
