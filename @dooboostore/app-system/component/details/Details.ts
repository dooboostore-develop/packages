import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import template from './details.html';
import style from './details.css';
import { ValidUtils } from '@dooboostore/core-web/valid/ValidUtils';
import { EventUtils } from '@dooboostore/core-web/event/EventUtils';
import { Subscription } from '@dooboostore/core/message';
import { ComponentBase } from '../ComponentBase';
import { OnCreateRender } from '@dooboostore/dom-render/lifecycle/OnCreateRender';

export namespace Details {
  export const selector = 'Details';

  export type Attribute = {
    class?: string;
  }
  export type BodyAttribute = {
    float?: 'bottom-left'
  } & Attribute

  @Component({
    template: '<summary class="${`${@this@.attribute.class} details-summary-container`}$">#innerHTML#</summary>',
    styles: '',
    selector: `${selector}.Summary`
  })
  export class Summary extends ComponentBase<Attribute> {
    constructor() {
      super({onlyParentType: [Wrap]});
    }
  }

  @Component({
    template: '<div class="${`${@this@.attribute.class} details-body-container`}$">#innerHTML#</div>',
    styles: '.details-body-container {position: ${@this@.attribute.float ? "absolute" : "static"}$;}',
    selector: `${selector}.Body`
  })
  export class Body extends ComponentBase<BodyAttribute> {
    constructor() {
      super({onlyParentType: [Wrap]});
    }


  }

  @Component({
    template: template,
    styles: style,
    selector: `${selector}.Wrap`
  })
  export class Wrap extends ComponentBase<Attribute> implements OnCreateRender{
    private name = 'wrap';
    private detailsElement?: HTMLDetailsElement;
    private documentClickSubscription?: Subscription;
    onCreateRender(...param: any[]): void {
      // console.log('onCreateRender', param, this.rawSet?.dataSet.config);
      if (ValidUtils.isBrowser()) {
        this.documentClickSubscription = EventUtils.htmlElementEventObservable(document, 'click').subscribe(event => {
          if (this.detailsElement && !this.detailsElement?.contains(event?.target as Node)){
            this.detailsElement.open = false;
          }
        })
      }
    }


    onDestroyRender(...metaData: any[]): void {
      this.documentClickSubscription?.unsubscribe();
      // console.log('onDestroyRender', metaData);
      // if (ValidUtils.isBrowser()) {
      //   document.removeEventListener('click', this.ccc)
      // }
    }

    // changeAttribute(attribute: { className: string } | undefined) {
    // }

  }
}
