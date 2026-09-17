import {HTMLDialogElement} from "@dooboostore/dom-parser";

/**
 * Global type augmentation for @dooboostore showcase
 */
declare global {
  interface Window {
    HTMLElement: typeof HTMLElement;
    HTMLDivElement: typeof HTMLDivElement;
    HTMLButtonElement: typeof HTMLButtonElement;
    HTMLTemplateElement: typeof HTMLTemplateElement;
    HTMLAnchorElement: typeof HTMLAnchorElement;
    HTMLDialogElement: typeof HTMLDialogElement;
    ShadowRoot: typeof ShadowRoot;
    location: Location;
    document: Document;
    history: History;
    console: Console;
    IntersectionObserver: typeof IntersectionObserver;
    SwaggerUIBundle: any;

  }
}

export {};
