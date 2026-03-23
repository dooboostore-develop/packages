import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';

export interface AttributeOptions {
  name?: string;
  type?: any; // String, Number, Boolean, Object
  disableReflect?: boolean; // Default is false (reflect is enabled by default)
}

export interface AttributeMetadata {
  propertyKey: string | symbol;
  options: AttributeOptions;
}

export const ATTRIBUTE_METADATA_KEY = Symbol('simple-web-component:attribute');

export function attribute(nameOrOptions?: string | AttributeOptions): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const constructor = target.constructor;
    const options: AttributeOptions = typeof nameOrOptions === 'string' ? { name: nameOrOptions } : nameOrOptions || {};

    if (!options.name) options.name = String(propertyKey);
    if (!options.type) options.type = String;
    if (options.disableReflect === undefined) options.disableReflect = false;

    let list = ReflectUtils.getMetadata<AttributeMetadata[]>(ATTRIBUTE_METADATA_KEY, constructor);
    if (!list) {
      list = [];
      ReflectUtils.defineMetadata(ATTRIBUTE_METADATA_KEY, list, constructor);
    }
    list.push({ propertyKey, options });

    // Define getter and setter for the property
    const internalKey = Symbol(String(propertyKey));
    Object.defineProperty(target, propertyKey, {
      get(this: any) {
        return this[internalKey];
      },
      set(this: any, val: any) {
        const oldVal = this[internalKey];
        if (oldVal === val) return;

        // Type conversion
        let convertedVal = val;
        if (options.type === Number) convertedVal = Number(val);
        else if (options.type === Boolean) convertedVal = Boolean(val);
        else if (options.type === Object && typeof val === 'string') {
          try {
            convertedVal = JSON.parse(val);
          } catch (e) {
            convertedVal = val;
          }
        }

        this[internalKey] = convertedVal;

        // Reflection
        if (!options.disableReflect && this.setAttribute) {
          if (convertedVal === null || convertedVal === undefined || convertedVal === false) {
            this.removeAttribute(options.name);
          } else {
            const attrVal = typeof convertedVal === 'object' ? JSON.stringify(convertedVal) : String(convertedVal);
            if (this.getAttribute(options.name) !== attrVal) {
              this.setAttribute(options.name, attrVal);
            }
          }
        }
      },
      enumerable: true,
      configurable: true
    });
  };
}

export const getAttributeMetadataList = (target: any): AttributeMetadata[] | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(ATTRIBUTE_METADATA_KEY, constructor);
};
