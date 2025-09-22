import 'reflect-metadata';
import { ConstructorType } from '@dooboostore/core/types';
import { ValidUtils } from '@dooboostore/core/valid/ValidUtils';
import { StringUtils } from '@dooboostore/core';

// export type ReflectField = (target: Object|{constructor: ConstructorType<any>, [key: string]: Function}, propertyKey: string | symbol) => void;
export const SimNoProxyKey = Symbol('Sim:NoProxy');
export const SimNoProxy = (target: any, propertyKey?: string | symbol) => {
  // 클래스 데코레이터로 사용된 경우
  if (propertyKey === undefined) {
    // target은 클래스 생성자
    Reflect.defineMetadata(SimNoProxyKey, true, target);
    return;
  }

  // 프로퍼티 데코레이터로 사용된 경우
  // target은 프로토타입, propertyKey는 프로퍼티 이름
  Reflect.defineMetadata(SimNoProxyKey, true, target, propertyKey);
};

export const getSimNoProxy = (target: any, propertyKey?: string | symbol) => {
  try {
    // if (ValidUtils.isNotNullUndefined(target)) {
    // 클래스 데코레이터
    if (propertyKey === undefined) {
      return Reflect.getMetadata(SimNoProxyKey, target);
    }
    // 프로퍼티 데코레이터
    return Reflect.getMetadata(SimNoProxyKey, target, propertyKey);
  } catch (e) {
    return undefined;
  }
  // } else {
  //   return undefined;
  // }
};

export const isSimNoProxy = (target: any, propertyKey?: string | symbol) => {
  if (target === null || target === undefined) {
    return false;
  }
  return getSimNoProxy(target, propertyKey) === true;
};
