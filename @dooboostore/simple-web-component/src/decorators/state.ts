import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';

export interface StateOptions {
  name?: string;
}

export interface StateMetadata {
  propertyKey: string | symbol;
  options: StateOptions;
}

export const STATE_METADATA_KEY = Symbol('simple-web-component:state');

export function state(nameOrOptions?: string | StateOptions): PropertyDecorator;
export function state(target: Object, propertyKey: string | symbol): void;
export function state(arg1?: string | StateOptions | Object, arg2?: string | symbol): PropertyDecorator | void {
  const decorator = (options: StateOptions, target: Object, propertyKey: string | symbol) => {
    const constructor = target.constructor;
    if (!options.name) options.name = String(propertyKey);

    let list = ReflectUtils.getMetadata<StateMetadata[]>(STATE_METADATA_KEY, constructor);
    if (!list) {
      list = [];
      ReflectUtils.defineMetadata(STATE_METADATA_KEY, list, constructor);
    }
    list.push({ propertyKey, options });
  };

  if (arg2) {
    // Used as @state
    return decorator({}, arg1!, arg2);
  }

  // Used as @state(options)
  return (target: Object, propertyKey: string | symbol) => {
    const options: StateOptions = typeof arg1 === 'string' ? { name: arg1 } : (arg1 as StateOptions) || {};
    decorator(options, target, propertyKey);
  };
}

export const getStateMetadataList = (target: any): StateMetadata[] | undefined => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(STATE_METADATA_KEY, constructor);
};
