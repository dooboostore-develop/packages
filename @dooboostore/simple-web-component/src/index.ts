import 'reflect-metadata';
import { registerAllElements } from './elements/register';
import {ConstructorType} from "@dooboostore/core";

// Decorators
export * from './decorators';

// Types
export * from './types';

// Utilities
export * from './utils/Utils';

// Config
export * from './config/config';

// Registration Factory
export default (w: Window, other?: (((w: Window) => ConstructorType<any>) | any) []) => {
  registerAllElements(w);
  const r = other?.map(fn => {
    if (typeof fn === 'function') {
      const a = fn(w);
    } else {
    }
  });
  // return r??[];
};
