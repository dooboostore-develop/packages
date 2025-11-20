// import { ConstructorType } from '@dooboostore/core/types';
// import { ReflectUtils } from '@dooboostore/core/reflect/ReflectUtils';
// import { getInject, SaveInjectConfig } from './Inject';
// import {ValidUtils} from "@dooboostore/core/valid/ValidUtils";
// import isFunction = ValidUtils.isFunction;
//
// const InjectArgumentFactoryMetadataKey = Symbol('InjectArgumentFactory');
//
// export type ArgumentFactoryMap = {
//   // @ts-ignore
//   [key: string | number | symbol | ConstructorType<any>]: ConstructorType<any> | any | Function;
// };
//
// export type SaveInjectArgumentFactoryConfig = {
//   factoryMap: ArgumentFactoryMap;
// };
//
// /**
//  * Method decorator that injects arguments based on parameter types or @Inject decorators
//  *
//  * @example
//  * ```typescript
//  * @InjectArgumentFactory({
//  *   'string': 'default value',
//  *   0: 'first param value',
//  *   [Symbol.for('wow')]: () => 'dynamic value',
//  *   MyClass: myClassInstance
//  * })
//  * methodName(param1: string, param2: MyClass) {
//  *   // param1 will be injected based on type 'string' or index 0
//  *   // param2 will be injected based on type MyClass
//  * }
//  * ```
//  */
// export function InjectArgumentFactory(factoryMap: ArgumentFactoryMap): MethodDecorator {
//   return function (
//     target: Object,
//     propertyKey: string | symbol,
//     descriptor: PropertyDescriptor
//   ) {
//     // Save factory map to metadata
//     ReflectUtils.defineMetadata(
//       InjectArgumentFactoryMetadataKey,
//       { factoryMap },
//       target.constructor,
//       propertyKey
//     );
//
//     const originalMethod = descriptor.value;
//
//     descriptor.value = function (...args: any[]) {
//       // Get parameter types
//       const paramTypes = ReflectUtils.getParameterTypes(target, propertyKey);
//
//       // Get @Inject decorators if any
//       const injectConfigs = getInject(target.constructor, propertyKey) || [];
//
//       // Build final arguments array
//       const finalArgs: any[] = [];
//
//       console.log('parametetType', paramTypes)
//       for (let i = 0; i < paramTypes.length; i++) {
//         let injectedValue: any = args[i]; // default to original argument
//
//         // Priority 1: Check by index
//         if (factoryMap.hasOwnProperty(i)) {
//           injectedValue = resolveValue(factoryMap[i]);
//           if(isFunction(injectedValue)) {
//             injectedValue = injectedValue(this);
//           }
//         }
//         // Priority 2: Check by @Inject decorator symbol/type
//         else {
//           // const injectConfig = injectConfigs.find(cfg => cfg.index === i);
//           // if (injectConfig) {
//           //   // Check by symbol
//           //   if (injectConfig.config.symbol && factoryMap.hasOwnProperty(injectConfig.config.symbol)) {
//           //     injectedValue = resolveValue(factoryMap[injectConfig.config.symbol]);
//           //   }
//           //   // Check by type
//           //   else if (injectConfig.config.type && factoryMap.hasOwnProperty(injectConfig.config.type)) {
//           //     injectedValue = resolveValue(factoryMap[injectConfig.config.type]);
//           //   }
//           //   // Check by situationType
//           //   else if (injectConfig.config.situationType && factoryMap.hasOwnProperty(injectConfig.config.situationType)) {
//           //     injectedValue = resolveValue(factoryMap[injectConfig.config.situationType]);
//           //   }
//           // }
//           // // Priority 3: Check by parameter type
//           // else if (paramTypes[i] && factoryMap.hasOwnProperty(paramTypes[i])) {
//           //   injectedValue = resolveValue(factoryMap[paramTypes[i]]);
//           // }
//           // // Priority 4: Check by type name string
//           // else if (paramTypes[i] && paramTypes[i].name && factoryMap.hasOwnProperty(paramTypes[i].name)) {
//           //   injectedValue = resolveValue(factoryMap[paramTypes[i].name]);
//           // }
//         }
//
//         finalArgs.push(injectedValue);
//       }
//
//       return originalMethod.apply(this, finalArgs);
//     };
//
//     return descriptor;
//   };
// }
//
// /**
//  * Resolve value - if it's a function, call it; otherwise return as is
//  */
// function resolveValue(value: any): any {
//   return typeof value === 'function' ? value() : value;
// }
//
// /**
//  * Get InjectArgumentFactory metadata
//  */
// export const getInjectArgumentFactory = (
//   target: ConstructorType<any> | Function | any,
//   propertyKey: string | symbol
// ): SaveInjectArgumentFactoryConfig | undefined => {
//   if (target != null && target !== undefined && typeof target === 'object') {
//     target = target.constructor;
//   }
//   return ReflectUtils.getMetadata(InjectArgumentFactoryMetadataKey, target, propertyKey);
// };
