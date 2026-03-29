import 'reflect-metadata';
import { registerAllElements } from './elements/register';

// Decorators
export * from './decorators/elementDefine';
export * from './decorators/attribute';
export * from './decorators/setAttribute';
export * from './decorators/changedAttribute';
export { onConnectedInnerHtml } from './decorators/onConnectedInnerHtml';
export * from './decorators/replaceChildren';
export * from './decorators/appendChild';
export * from './decorators/classList';
export * from './decorators/style';
export * from './decorators/emitCustomEvent';
export * from './decorators/lifecycles';
export * from './decorators/query';
export * from './decorators/queryAll';
export * from './decorators/addEventListener';

// Types
export * from './types';

// Utilities
export * from './utils/Utils';
export * from './utils/TemplateUtils';

// Config
export * from './config/config';

// Registration Factory
export default (w: Window, other?: ((w: Window) => void)[]): void => {
  registerAllElements(w);
  other?.forEach(fn => {
    fn(w);
  });
};
