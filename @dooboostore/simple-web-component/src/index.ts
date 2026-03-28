import 'reflect-metadata';

// Decorators
export * from './decorators/elementDefine';
export * from './decorators/setAttribute';
export * from './decorators/changedAttribute';
export * from './decorators/onConnectedInnerHtml';
export { onConnectedInnerHtml as innerHtml } from './decorators/onConnectedInnerHtml';
export * from './decorators/replaceChildren';
export * from './decorators/appendChild';
export * from './decorators/emitCustomEvent';
export * from './decorators/lifecycles';
export * from './decorators/query';
export * from './decorators/queryAll';
export * from './decorators/addEventListener';

// Types
export * from './types';

// Apps (Customized Built-in Elements)
export * from './elements';

// Utilities
export * from './utils/Utils';
export * from './utils/TemplateUtils';
