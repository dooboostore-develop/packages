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
