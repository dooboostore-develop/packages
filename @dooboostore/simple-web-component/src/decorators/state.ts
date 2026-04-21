import {ReflectUtils} from '@dooboostore/core';
import {ElementApply} from "@dooboostore/core-web";
import {SwcUtils} from "../utils/Utils";
import {getElementConfig} from "./elementDefine";

export interface StateMetadata {
  propertyKey: string | symbol;
  name: string;
}

export const STATE_METADATA_KEY = Symbol.for('simple-web-component:state');

// export function state(target: SpecialSelector): PropertyDecorator;
// export function state(): PropertyDecorator;
export function state(target: Object, propertyKey: string | symbol): void;
export function state(name: string): PropertyDecorator;
/**
 * Supports both forms:
 * - @state
 * - @state()
 * - @state('selector')
 */
export function state(nameOrTarget?: string | Object, propertyKey?: string | symbol): any {

  const stateDefine = (targetObj: any, stateMetadata: StateMetadata) => {

    let storage = targetObj[stateMetadata.propertyKey];
    // console.log('ssssssssssssssss', storage, stateMetadata.propertyKey)
    Object.defineProperty(targetObj, stateMetadata.propertyKey, {
      set(this: any, nv: string) {
        storage = nv;
        const config = getElementConfig(this)
        const ea = new ElementApply(this, {id: this._swcId});
        const helperHostSet = SwcUtils.getHelperAndHostSet(config.window, this);
        const stateContext: any = {...helperHostSet};
        findAllStateMetadata(this).forEach(it => {
          stateContext[it.name] = this[it.propertyKey]
        })
        ea.apply({context:stateContext, targetVariableName: stateMetadata.name, bind: this});
      },
      get(this: any) {
        return storage;
      },
      enumerable: true,
      configurable: true
    });
  }

  // If used as @state (no parentheses), TypeScript will call this function with (target, propertyKey)
  if (typeof nameOrTarget === 'object' && propertyKey) {
    const targetObj = nameOrTarget as Object;
    const name = String(propertyKey);
    const constructor = (targetObj as any).constructor;
    let states = ReflectUtils.getMetadata<StateMetadata[]>(STATE_METADATA_KEY, constructor);
    if (!states) {
      states = [];
      ReflectUtils.defineMetadata(STATE_METADATA_KEY, states, constructor);
    }
    const stateMetadata = {propertyKey, name};
    states.push(stateMetadata);
    stateDefine(targetObj, stateMetadata);
    return;
  }

  // Otherwise return a decorator factory
  return (targetObj: Object, propertyKey: string | symbol): void => {
    const name = String(nameOrTarget);
    const constructor = targetObj.constructor;
    let states = ReflectUtils.getMetadata<StateMetadata[]>(STATE_METADATA_KEY, constructor);
    if (!states) {
      states = [];
      ReflectUtils.defineMetadata(STATE_METADATA_KEY, states, constructor);
    }
    const stateMetadata = {propertyKey, name};
    states.push(stateMetadata);
    stateDefine(targetObj, stateMetadata);
  };
}

export const findAllStateMetadata = (target: any): StateMetadata[] => {
  const constructor = target instanceof Function ? target : target.constructor;
  return ReflectUtils.getMetadata(STATE_METADATA_KEY, constructor) ?? [];
};
