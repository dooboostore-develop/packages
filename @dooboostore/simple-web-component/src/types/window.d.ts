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

  namespace Dooboostore {
    interface PackageInfo {
      id: string;
      name: string;
      description: string;
      longDescription: string;
      icon: string;
      color: string;
      features: PackageFeature[];
      example: string;
    }

    interface PackageFeature {
      title: string;
      desc: string;
    }
  }
}

export {};
