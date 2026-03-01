import { attribute, ComponentBase } from '../ComponentBase';
import { DomRender, DomRenderRunConfig } from '../../DomRender';
import { RawSet } from '../../rawsets/RawSet';
import {OtherData} from "../../lifecycle";

export namespace A {
  export const selector = 'dr-a';

  export type ClickCallbackData = {
      event: MouseEvent,
      attributes: {
          href: string | null;
          target: string | null;
          style: string | null;
          class: string | null;
          replace?: boolean;
          scrollToTop?: boolean;
      }
  }

  export type Attribute = {
    href?: string | null;
    target?: string | null;
    style?: string | null;
    class?: string | null;
    click?: ((data: ClickCallbackData) => void) | null;
    onInit?: (e: HTMLAnchorElement) => void;
    replace?: boolean | null;
    scrollToTop?: boolean | null;
  };

  export class A extends ComponentBase<Attribute> {
    @attribute({ converter: v => v || null }) href: string | null = null;
    @attribute({ converter: v => v || null }) target: string | null = null;
    @attribute({ converter: v => v || null }) style: string | null = null;
    @attribute({ name: 'class', converter: v => v || null }) classAttr: string | null = null;
    @attribute({ name: 'dr-class', converter: v => v || null }) drClass: string | null = null;
    @attribute() click?: ((data: ClickCallbackData) => void) | null = null;
    @attribute({ converter: v => v !== null && String(v) !== 'false' }) replace = false;
    @attribute({ converter: v => v !== null && String(v) !== 'false' }) scrollToTop = true;
    private element?: HTMLElement;

    onClick(event: MouseEvent) {
      console.log('----22----click.!!!1')
      if (this.click) {
          const attributes = {
              href: this.href,
              target: this.target,
              style: this.style,
              class: this.classAttr,
              replace: this.replace,
              scrollToTop: this.scrollToTop
          };
          this.click({ event, attributes });
      }

      if (event.defaultPrevented) {
          return;
      }

      if (this.target !== '_blank' && this.href) {
        event.preventDefault();
        // console.log('scrollTop', this.scrollToTop);
        this.domRenderConfig?.router?.go({path: this.href, replace: this.replace, scrollToTop: this.scrollToTop });
      }
    }

    onChangeAttrRender(name: string, value: any, other: OtherData) {
      super.onChangeAttrRender(name, value, other);
      if (this.element && name.startsWith('attribute-')) {
        this.element.setAttribute(name, value);
      }
    }

    onAElementInit($element: HTMLElement) {
      this.element = $element;
      this.getAttribute('onInit')?.($element as HTMLAnchorElement);
      this.getAttributeNames()
        .filter(it => it.startsWith('attribute-'))
        .forEach(it => {
          const attrName = it.replace(/^attribute-/, '');
          const attrValue = this.getAttribute(it as any);
          this.element.setAttribute(attrName, attrValue);
        });
    }
  }
}

export default {
  a: (config?: DomRenderRunConfig) => {
    return RawSet.createComponentTargetElement({
      name: A.selector,
      template: `<a
        href="\${@this@.href}$"
        target="\${@this@.target}$"
        style="\${@this@.style}$"
        class="\${@this@.classAttr}$"
        dr-event-click="@this@.onClick($event)"
        dr-class="\${@this@.drClass}$"
        dr-on-init="@this@.onAElementInit($element)"
      >#innerHTML#</a>`,
      objFactory: (e, o, r2, constructorParam) => {
        return DomRender.run({ rootObject: new A.A(...constructorParam), config });
      },
    });
  },
};
