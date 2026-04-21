/**
 * Global Window type augmentation for commerce app
 */
declare global {
  interface Window {
    HTMLElement: typeof HTMLElement;
    HTMLDivElement: typeof HTMLDivElement;
    HTMLButtonElement: typeof HTMLButtonElement;
    location: Location;
    document: Document;
  }
}

export {};
