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
    location: Location;
    document: Document;
    history: History;
  }
}

export {};
