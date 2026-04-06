import { ConstructorType, MethodKeys } from '@dooboostore/core';
import { ReflectUtils } from '@dooboostore/core';
import { ExceptionHandlerSituationType } from '../exception/ExceptionDecorator';
import { SimpleApplication } from '../../SimpleApplication';

export enum InjectSituationType {
  INDEX = 'SIMPLE_BOOT_CORE://Inject/INDEX'
}

export type SituationType = string | symbol | ConstructorType<any> | InjectSituationType | ExceptionHandlerSituationType;

export class SituationTypeContainer {
  public situationType: SituationType;
  public data: any;
  public index?: number;

  constructor({ situationType, data, index }: { situationType: SituationType; data: any; index?: number }) {
    this.situationType = situationType;
    this.data = data;
    this.index = index;
  }
}

export class SituationTypeContainers {
  public containers: SituationTypeContainer[] = [];

  constructor(containers?: SituationTypeContainer[]) {
    if (containers) {
      this.containers.push(...containers);
    }
  }

  public push(...item: SituationTypeContainer[]) {
    this.containers.push(...item);
  }

  get length() {
    return this.containers.length;
  }

  find(predicate: (value: SituationTypeContainer, index: number, obj: SituationTypeContainer[]) => unknown, thisArg?: any): SituationTypeContainer | undefined {
    return this.containers.find(predicate);
  }
}

// [아키텍트님의 정석] 주입 공통 옵션
type InjectOptions = {
  situationType?: SituationType;
  proxy?: ConstructorType<ProxyHandler<any>> | ((caller: { application: SimpleApplication; instance: any }) => ProxyHandler<any>);
  optional?: boolean;
};

// [아키텍트님의 정석] 3대 주입 전략
export type InjectBySymbol = {
  symbol: symbol;
  factory?: (caller: { instance?: any; methodName?: string | symbol; parameter: any[]; application: SimpleApplication; injectInstance?: any }) => any;
};

export type InjectByType<T> = {
  type?: ConstructorType<T> | Function;
  scheme?: string;
  factory?: (caller: { instance?: any; methodName?: string | symbol; parameter: any[]; application: SimpleApplication; injectInstance?: T }) => any;
};

export type InjectFactoryCallerType<T = any> = { instance?: T; methodName?: string | symbol; parameter: any[]; application: SimpleApplication };
export type InjectByFactory<T> = {
  factory: (caller: InjectFactoryCallerType) => T;
};

export type InjectConfig<T = any> = InjectOptions & (InjectBySymbol | InjectByType<T> | InjectByFactory<T>);

// [아키텍트님의 정석] Type Guards
export const isTargetSymbol = (config: InjectConfig): config is InjectOptions & InjectBySymbol => {
  return 'symbol' in config && config.symbol !== undefined;
};

export const isTargetType = (config: InjectConfig): config is InjectOptions & { type: ConstructorType<any> } & InjectByType<any> => {
  return 'type' in config && config.type !== undefined;
};

export const isTargetScheme = (config: InjectConfig): config is InjectOptions & { scheme: string } & InjectByType<any> => {
  return 'scheme' in config && config.scheme !== undefined;
};

export const isTargetFactory = (config: InjectConfig): config is InjectOptions & InjectByFactory<any> => {
  return 'factory' in config && typeof config.factory === 'function' && !('symbol' in config) && !('type' in config) && !('scheme' in config);
};

export const isTargetNone = (config: InjectConfig): boolean => {
  return !('symbol' in config) && !('type' in config) && !('scheme' in config) && !isTargetFactory(config);
};

export type SaveInjectConfig = {
  index: number;
  type?: ConstructorType<any>;
  propertyKey?: string | symbol;
  config: InjectConfig;
};

const InjectMetadataKey = Symbol.for('simple-boot:inject-metadata');
const injectProcess = (config: InjectConfig, target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
  if (propertyKey && typeof target === 'object') {
    const otarget = target;
    target = target.constructor;
    const saves = (Reflect.getOwnMetadata(InjectMetadataKey, target, propertyKey) || []) as SaveInjectConfig[];
    const type = ReflectUtils.getParameterTypes(otarget, propertyKey)[parameterIndex];
    saves.push({ index: parameterIndex, config: config, propertyKey, type });
    ReflectUtils.defineMetadata(InjectMetadataKey, saves, target, propertyKey);
  } else if (!propertyKey || typeof target === 'function') {
    const existingInjectdParameters = (ReflectUtils.getMetadata(InjectMetadataKey, target) || []) as SaveInjectConfig[];
    const type = ReflectUtils.getParameterTypes(target)[parameterIndex];
    existingInjectdParameters.push({ index: parameterIndex, config: config, type });
    ReflectUtils.defineMetadata(InjectMetadataKey, existingInjectdParameters, target);
  }
};

export function Inject(target: Object, propertyKey: string | symbol | undefined, parameterIndex: number): void;
export function Inject<T = any>(config: InjectConfig<T>): ParameterDecorator;
export function Inject<T = any>(symbol: symbol): ParameterDecorator;
export function Inject<T = any>(type: ConstructorType<T> | Function): ParameterDecorator;
export function Inject<T = any>(configOrTargetOrSymbolOrType: Object | InjectConfig<T> | symbol | ConstructorType<T> | Function, propertyKey?: string | symbol | undefined, parameterIndex?: number): void | ParameterDecorator {
  if (propertyKey && parameterIndex !== undefined) {
    // 1. Used without parenthesis: @Inject
    injectProcess({} as any, configOrTargetOrSymbolOrType, propertyKey, parameterIndex);
  } else {
    // Used as factory: @Inject(options) or @Inject(Symbol) or @Inject(Type)
    return (target: Object, propKey: string | symbol | undefined, paramIndex: number) => {
      let finalConfig: InjectConfig<T>;

      if (typeof configOrTargetOrSymbolOrType === 'symbol') {
        // 2. Used with symbol: @Inject(Symbol.for('...'))
        finalConfig = { symbol: configOrTargetOrSymbolOrType } as InjectConfig<T>;
      } else if (typeof configOrTargetOrSymbolOrType === 'function') {
        // 3. Used with type: @Inject(MyService)
        finalConfig = { type: configOrTargetOrSymbolOrType as ConstructorType<T> } as InjectConfig<T>;
      } else {
        // 4. Used with explicit config object: @Inject({ type: MyService, optional: true })
        finalConfig = (configOrTargetOrSymbolOrType || {}) as InjectConfig<T>;
      }

      injectProcess(finalConfig, target, propKey, paramIndex);
    };
  }
}

export const getInject = (target: any, propertyKey?: string | symbol): SaveInjectConfig[] => {
  return ReflectUtils.findMetadata(InjectMetadataKey, target, propertyKey) ?? [];
};

// Alias for @inject (lowercase)
export const inject = Inject;
