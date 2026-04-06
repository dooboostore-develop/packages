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

    // Keep registration metadata on constructor so direct `new` calls can infer the proper tag name.
    // const ctor = constructor as any;
    // ctor.__domParserTagName = name;
    // if (options?.extends) {
    //   ctor.__domParserExtendsTagName = options.extends;
    // }

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

  getName(constructor: any): string | undefined {
    for (const [name, registration] of this._definitions) {
      if (registration.constructor === constructor) {
        return name;
      }
    }
    return undefined;
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

        // For customized built-ins (with 'is' attribute), always consider for upgrade,
        // even if they're special document elements (html, head, body)
        // For autonomous custom elements and other elements, skip special document elements
        if (isAttr || !['html', 'head', 'body'].includes(tagName)) {
          const registration = isAttr ? this._definitions.get(isAttr) : this._definitions.get(tagName);

          if (registration) {
            const isInstance = node instanceof registration.constructor;
            if (!isInstance) {
              // console.log(`   [CustomElementRegistry] Found node to upgrade: <${tagName}${isAttr ? ' is="' + isAttr + '"' : ''}>`);
              nodesToUpgrade.push({ node, registration });
            }
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

    // Track which special document elements were upgraded
    let upgradedBody = null;
    let upgradedHead = null;
    let upgradedHtml = null;

    // Perform upgrades after walking to avoid traversal issues
    for (const { node, registration } of nodesToUpgrade) {
      // 1. Create the real instance
      // In JS environments with complex mixins, we MUST instantiate the class normally.
      let newInstance = new registration.constructor();

      // Ensure the tag name is preserved
      newInstance._tagName = node.tagName;
      newInstance.nodeName = node.tagName;

      // console.log('no1',node)
      // 올래 브라우저 동작방식인 이렇게 prototypeof 만 바꾸는거다
      // Object.setPrototypeOf(node, registration.constructor.prototype)
      // console.log('no2',node)
      // Copy all own properties from old node to new instance
      // This preserves any custom fields set on the node
      for (const key of Object.getOwnPropertyNames(node)) {
        // Skip internal properties and methods
        if ( key.startsWith('__swc')) {
          try {
            newInstance[key] = node[key];
          } catch (e) {
            // Some properties might be read-only, skip them
          }
        }
      }

      // Also ensure __swc_* properties are explicitly set (in case they weren't in own properties)
      // newInstance = Object.assign(newInstance, node, newInstance);
      // if (node.__swc_host) {
      //   newInstance.__swc_host = node.__swc_host;
      // }
      // if (node.__swc_template_host) {
      //   newInstance.__swc_template_host = node.__swc_template_host;
      // }
      // if (node.__swc_loop_context) {
      //   newInstance.__swc_loop_context = node.__swc_loop_context;
      // }

      // Move children
      while (node.firstChild) {
        newInstance.appendChild(node.firstChild);
      }

      // Replace in parentssss
      if (node.parentNode) {
        (node as HTMLElement).getAttributeNames().forEach(it => {
          const value = (node as HTMLElement).getAttribute(it);
          if (value) {
            (newInstance as HTMLElement).setAttribute(it, value);
          }
        })
        node.parentNode.replaceChild(newInstance, node);
      }

      // 💥 CRITICAL: Save the reference of the new instance onto the old shell!
      // This allows cached template arrays (like this._nodes in SwcIf) to find the real upgraded node later!
      node.__upgraded_instance = newInstance;

      // 3. Trigger attributeChangedCallback for all existing attributes
      if (node.attributes) {
        for (let i = 0; i < node.attributes.length; i++) {
          const attr = node.attributes.item(i);
          if (attr) {
            newInstance.setAttribute(attr.name, attr.value);
            if (typeof newInstance.attributeChangedCallback === 'function') {
              const observedAttributes = registration.constructor.observedAttributes || [];
              if (observedAttributes.includes(attr.name) || observedAttributes.includes(attr.name.toLowerCase())) {
                newInstance.attributeChangedCallback(attr.name, null, attr.value);
              }
            }
          }
        }
      }

      // Track special elements that were upgraded
      // IMPORTANT: Track the NEW instance, not the old node!
      const tagName = node.tagName.toLowerCase();
      if (tagName === 'body') {
        upgradedBody = newInstance;
      } else if (tagName === 'head') {
        upgradedHead = newInstance;
      } else if (tagName === 'html') {
        upgradedHtml = newInstance;
      }
    }

    // Re-set document references if special elements were upgraded
    const doc = root.ownerDocument || root;
    if (upgradedBody || upgradedHead || upgradedHtml) {
      if (upgradedHtml && doc.documentElement !== upgradedHtml) {
        (doc as any).documentElement = upgradedHtml;
      }
      if (upgradedHead && doc.head !== upgradedHead) {
        (doc as any).head = upgradedHead;
      }
      if (upgradedBody && doc.body !== upgradedBody) {
        (doc as any).body = upgradedBody;
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
