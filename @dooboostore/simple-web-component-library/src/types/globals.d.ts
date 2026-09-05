/**
 * Global Window type augmentation for the component library.
 * (center app historically got this via an unrelated example stub —
 *  the library owns its own so it builds standalone.)
 */
declare global {
  interface Window {
    HTMLElement: typeof HTMLElement;
  }
}

export {};
