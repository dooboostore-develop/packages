export { SimpleBootFront } from './SimpleBootFront';
export { SimFrontOption, UrlType } from './option/SimFrontOption';

// Decorators
export { Component, getComponent, componentSelectors } from './decorators/Component';
export type { ComponentConfig } from './decorators/Component';
export { Script, getScript, scripts } from './decorators/Script';
export type { ScriptConfig } from './decorators/Script';

// Components
export { ComponentSet } from './component/ComponentSet';
export { ComponentRouterBase } from './component/ComponentRouterBase';

// Lifecycle
export type { onChangedRender } from './lifecycle/OnChangedRender';
// export { isOnDestroy } from './lifecycle/OnDestroy';
// export type { OnDestroy } from './lifecycle/OnDestroy';
export type { OnFinish } from './lifecycle/OnFinish';
// export { isOnInit } from './lifecycle/OnInit';
// export type { OnInit, OnInitParameter } from './lifecycle/OnInit';
export type { OnInitedChild } from './lifecycle/OnInitedChild';

// Services
export { View } from './service/view/View';
export { ViewService } from './service/view/ViewService';
export { CookieService } from './service/CookieService';
export { MetaTagService } from './service/MetaTagService';
export { ScriptService } from './service/ScriptService';
export { StorageService } from './service/StorageService';

// Errors
export { RouterError } from './throwable/RouterError';
export { RouterIntentError } from './throwable/RouterIntentError';
export { RouterNotFount } from './throwable/RouterNotFount';

// Scripts
export { ScriptRunnable } from './script/ScriptRunnable';
