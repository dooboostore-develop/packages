import 'reflect-metadata';
export * from './elements'
import { defineSwcAppAll } from './elements';
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
export default async (w: Window, other?: (((w: Window) => Promise<CustomElementConstructor> | CustomElementConstructor) | any) []) => {
  const cr = await defineSwcAppAll(w);
  // const cr = await elementFactories(w);
  if (other) {
    for (const fn of other) {
      if (typeof fn === 'function') {
        await fn(w);
      }
    }
  }

  return cr;
};
