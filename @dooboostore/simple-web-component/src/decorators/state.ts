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

    // around.ts와 동일: 클로저 변수에 두면 모든 인스턴스가 공유해버리므로
    // 인스턴스 전용 Symbol 슬롯에 실제 값을 둔다.
    const storageKey = Symbol(`state:${String(stateMetadata.propertyKey)}`);
    Object.defineProperty(targetObj, stateMetadata.propertyKey, {
      set(this: any, nv: string) {
        this[storageKey] = nv;
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
        // 안전망: 필드 이니셜라이저의 own property가 남아있다면(ensureInit이 안 돈
        // 일반 클래스 등) 슬롯으로 회수한다. setter 경유는 안 함 — setter의 DOM
        // 동기화는 초기화 전에 돌면 안 되므로 직접 슬롯에 둔다.
        const own = Object.getOwnPropertyDescriptor(this, stateMetadata.propertyKey);
        if (own && 'value' in own) {
          delete this[stateMetadata.propertyKey];
          this[storageKey] = own.value;
        }
        return this[storageKey];
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
