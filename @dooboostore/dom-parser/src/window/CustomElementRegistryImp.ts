export interface CustomElementRegistration {
  constructor: any;
  options?: ElementDefinitionOptions;
}

export class CustomElementRegistryImp implements CustomElementRegistration {
  private _definitions = new Map<string, CustomElementRegistration>();
  private _whenDefinedPromises = new Map<string, { promise: Promise<void>; resolve: () => void }>();
  private _window: any;

  setWindow(window: any): void {
    this._window = window;
  }

  define(name: string, constructor: any, options?: ElementDefinitionOptions): void {
    if (this._definitions.has(name)) {
      throw new Error(`Registration failed for '${name}': a device with this name has already been registered.`);
    }

    // Basic validation of custom element name (must contain a hyphen)
    if (!name.includes('-')) {
      throw new Error(`Registration failed for '${name}': the name is not a valid custom element name.`);
    }

    this._definitions.set(name, { constructor, options });

    // Resolve any pending whenDefined promises
    if (this._whenDefinedPromises.has(name)) {
      this._whenDefinedPromises.get(name)!.resolve();
    }

    // Automatically upgrade existing elements in the document
    if (this._window && this._window.document) {
      // console.log(`   [CustomElementRegistry] Upgrading document for: ${name}`);
      this.upgrade(this._window.document);
    }
  }

  get(name: string): any | undefined {
    return this._definitions.get(name)?.constructor;
  }

  upgrade(root: any): void {
    if (!root) return;

    const nodesToUpgrade: any[] = [];
    const walk = (node: any) => {
      if (node.nodeType === 1) {
        const tagName = node.tagName.toLowerCase();
        const isAttr = node.getAttribute('is');
        const registration = isAttr ? this._definitions.get(isAttr) : this._definitions.get(tagName);

        if (registration) {
          const isInstance = node instanceof registration.constructor;
          if (!isInstance) {
            // console.log(`   [CustomElementRegistry] Found node to upgrade: <${tagName}${isAttr ? ' is="' + isAttr + '"' : ''}>`);
            nodesToUpgrade.push({ node, registration });
          }
        }
      }

      let child = node.firstChild;
      while (child) {
        walk(child);
        child = child.nextSibling;
      }
    };

    walk(root);

    // Perform upgrades after walking to avoid traversal issues
    for (const { node, registration } of nodesToUpgrade) {
      const newInstance = new registration.constructor();
      // Ensure the tag name is preserved if it's an autonomous custom element
      // or set correctly if it's a customized built-in
      newInstance._tagName = node.tagName;
      newInstance.nodeName = node.tagName;

      // Copy attributes
      if (node.attributes) {
        for (let i = 0; i < node.attributes.length; i++) {
          const attr = node.attributes.item(i);
          if (attr) {
            newInstance.setAttribute(attr.name, attr.value);
          }
        }
      }

      // Move children
      while (node.firstChild) {
        newInstance.appendChild(node.firstChild);
      }

      // Replace in parent
      if (node.parentNode) {
        node.parentNode.replaceChild(newInstance, node);
      }
    }
  }

  whenDefined(name: string): Promise<void> {
    if (this._definitions.has(name)) {
      return Promise.resolve();
    }

    if (!this._whenDefinedPromises.has(name)) {
      let resolve!: () => void;
      const promise = new Promise<void>(r => {
        resolve = r;
      });
      this._whenDefinedPromises.set(name, { promise, resolve });
    }

    return this._whenDefinedPromises.get(name)!.promise;
  }
}

export interface ElementDefinitionOptions {
  extends?: string;
}
