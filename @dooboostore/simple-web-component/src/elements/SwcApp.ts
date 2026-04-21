import {elementDefine} from "../decorators";
import {SwcAppInterface} from "../types";
import {SwcAppMixin} from "./SwcAppMixin";
import {SwcUtils, createElement, CreateElementConfig} from "../utils/Utils";

// ============================================
// SwcApp (HTMLElement)
// ============================================
export const swcAppTagName = 'swc-app';

export const SwcApp = (w: Window, data?: CreateElementConfig) => {
  return createElement<SwcAppInterface>(w, swcAppTagName, data);
};

export const defineSwcApp = async (w: Window) => {
  const existing = w.customElements.get(swcAppTagName);
  if (existing) return existing;

  @elementDefine(swcAppTagName, {window: w})
  class SwcAppImpl extends SwcAppMixin(w.HTMLElement) implements SwcAppInterface {
    // SwcAppMixin에서 모든 기능을 상속받음
  }

  return w.customElements.whenDefined(swcAppTagName);
};

// ============================================
// SwcAppBody (HTMLBodyElement)
// ============================================
export const swcAppBodyTagName = 'swc-app-body';

export const SwcAppBody = (w: Window, data?: CreateElementConfig) => {
  return createElement<SwcAppInterface & HTMLBodyElement>(w, swcAppBodyTagName, data);
};

export const defineSwcAppBody = async (w: Window) => {
  const existing = w.customElements.get(swcAppBodyTagName);
  if (existing) return existing;

  @elementDefine(swcAppBodyTagName, {window: w, extends: 'body'})
  class SwcAppBodyImpl extends SwcAppMixin(w.HTMLBodyElement) implements SwcAppInterface {
    // SwcAppMixin에서 모든 기능을 상속받음
  }
  return w.customElements.whenDefined(swcAppBodyTagName);
};

// ============================================
// SwcAppDiv (HTMLDivElement)
// ============================================
export const swcAppDivTagName = 'swc-app-div';

export const SwcAppDiv = (w: Window, data?: CreateElementConfig) => {
  return createElement<SwcAppInterface & HTMLDivElement>(w, swcAppDivTagName, data);
};

export const defineSwcAppDiv = async (w: Window) => {
  const existing = w.customElements.get(swcAppDivTagName);
  if (existing) return existing;

  @elementDefine(swcAppDivTagName, {window: w, extends: 'div'})
  class SwcAppDivImpl extends SwcAppMixin(w.HTMLDivElement) implements SwcAppInterface {
    // SwcAppMixin에서 모든 기능을 상속받음
  }

  return w.customElements.whenDefined(swcAppDivTagName);
};

// ============================================
// SwcAppSection (HTMLElement)
// ============================================
export const swcAppSectionTagName = 'swc-app-section';

export const SwcAppSection = (w: Window, data?: CreateElementConfig) => {
  return createElement<SwcAppInterface & HTMLElement>(w, swcAppSectionTagName, data);
};

export const defineSwcAppSection = async (w: Window) => {
  const existing = w.customElements.get(swcAppSectionTagName);
  if (existing) return existing;

  @elementDefine(swcAppSectionTagName, {window: w, extends: 'section'})
  class SwcAppSectionImpl extends SwcAppMixin(w.HTMLElement) implements SwcAppInterface {
    // SwcAppMixin에서 모든 기능을 상속받음
  }

  return w.customElements.whenDefined(swcAppSectionTagName);
};

// ============================================
// SwcAppMain (HTMLElement)
// ============================================
export const swcAppMainTagName = 'swc-app-main';

export const SwcAppMain = (w: Window, data?: CreateElementConfig) => {
  return createElement<SwcAppInterface & HTMLElement>(w, swcAppMainTagName, data);
};

export const defineSwcAppMain = async (w: Window) => {
  const existing = w.customElements.get(swcAppMainTagName);
  if (existing) return existing;

  @elementDefine(swcAppMainTagName, {window: w, extends: 'main'})
  class SwcAppMainImpl extends SwcAppMixin(w.HTMLElement) implements SwcAppInterface {
    // SwcAppMixin에서 모든 기능을 상속받음
  }

  return w.customElements.whenDefined(swcAppMainTagName);
};

// ============================================
// SwcAppArticle (HTMLElement)
// ============================================
export const swcAppArticleTagName = 'swc-app-article';

export const SwcAppArticle = (w: Window, data?: CreateElementConfig) => {
  return createElement<SwcAppInterface & HTMLElement>(w, swcAppArticleTagName, data);
};

export const defineSwcAppArticle = async (w: Window) => {
  const existing = w.customElements.get(swcAppArticleTagName);
  if (existing) return existing;

  @elementDefine(swcAppArticleTagName, {window: w, extends: 'article'})
  class SwcAppArticleImpl extends SwcAppMixin(w.HTMLElement) implements SwcAppInterface {
    // SwcAppMixin에서 모든 기능을 상속받음
  }

  return w.customElements.whenDefined(swcAppArticleTagName);
};

// ============================================
// SwcAppHeader (HTMLElement)
// ============================================
export const swcAppHeaderTagName = 'swc-app-header';

export const SwcAppHeader = (w: Window, data?: CreateElementConfig) => {
  return createElement<SwcAppInterface & HTMLElement>(w, swcAppHeaderTagName, data);
};

export const defineSwcAppHeader = async (w: Window) => {
  const existing = w.customElements.get(swcAppHeaderTagName);
  if (existing) return existing;

  @elementDefine(swcAppHeaderTagName, {window: w, extends: 'header'})
  class SwcAppHeaderImpl extends SwcAppMixin(w.HTMLElement) implements SwcAppInterface {
    // SwcAppMixin에서 모든 기능을 상속받음
  }

  return w.customElements.whenDefined(swcAppHeaderTagName);
};

// ============================================
// SwcAppFooter (HTMLElement)
// ============================================
export const swcAppFooterTagName = 'swc-app-footer';

export const SwcAppFooter = (w: Window, data?: CreateElementConfig) => {
  return createElement<SwcAppInterface & HTMLElement>(w, swcAppFooterTagName, data);
};

export const defineSwcAppFooter = async (w: Window) => {
  const existing = w.customElements.get(swcAppFooterTagName);
  if (existing) return existing;

  @elementDefine(swcAppFooterTagName, {window: w, extends: 'footer'})
  class SwcAppFooterImpl extends SwcAppMixin(w.HTMLElement) implements SwcAppInterface {
    // SwcAppMixin에서 모든 기능을 상속받음
  }

  return w.customElements.whenDefined(swcAppFooterTagName);
};

// ============================================
// SwcAppNav (HTMLElement)
// ============================================
export const swcAppNavTagName = 'swc-app-nav';

export const SwcAppNav = (w: Window, data?: CreateElementConfig) => {
  return createElement<SwcAppInterface & HTMLElement>(w, swcAppNavTagName, data);
};

export const defineSwcAppNav = async (w: Window) => {
  const existing = w.customElements.get(swcAppNavTagName);
  if (existing) return existing;

  @elementDefine(swcAppNavTagName, {window: w, extends: 'nav'})
  class SwcAppNavImpl extends SwcAppMixin(w.HTMLElement) implements SwcAppInterface {
    // SwcAppMixin에서 모든 기능을 상속받음
  }

  return w.customElements.whenDefined(swcAppNavTagName);
};

// ============================================
// SwcAppAside (HTMLElement)
// ============================================
export const swcAppAsideTagName = 'swc-app-aside';

export const SwcAppAside = (w: Window, data?: CreateElementConfig) => {
  return createElement<SwcAppInterface & HTMLElement>(w, swcAppAsideTagName, data);
};

export const defineSwcAppAside = async (w: Window) => {
  const existing = w.customElements.get(swcAppAsideTagName);
  if (existing) return existing;

  @elementDefine(swcAppAsideTagName, {window: w, extends: 'aside'})
  class SwcAppAsideImpl extends SwcAppMixin(w.HTMLElement) implements SwcAppInterface {
    // SwcAppMixin에서 모든 기능을 상속받음
  }

  return w.customElements.whenDefined(swcAppAsideTagName);
};

// ============================================
// Factory Array
// ============================================
export const swcAppFactories = [
  defineSwcApp,
  defineSwcAppBody,
  defineSwcAppDiv,
  defineSwcAppSection,
  defineSwcAppMain,
  defineSwcAppArticle,
  defineSwcAppHeader,
  defineSwcAppFooter,
  defineSwcAppNav,
  defineSwcAppAside
];

// ============================================
// Define All SwcApp Elements
// ============================================
export const defineSwcAppAll = async (w: Window) => {
  await Promise.all(swcAppFactories.map(factory => factory(w)));
  return w.customElements.whenDefined(swcAppTagName);
};

// Default export for backward compatibility
export default defineSwcAppAll;