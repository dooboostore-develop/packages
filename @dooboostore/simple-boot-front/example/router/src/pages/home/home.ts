import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { Lifecycle, Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import template from './home.html';
import styles from './home.css';
import { CreatorMetaData } from '@dooboostore/dom-render/rawsets/CreatorMetaData.ts';
import { ComponentBase } from '@dooboostore/dom-render';
import { RandomUtils } from '@dooboostore/core/random/RandomUtils';

@Sim({
  // scope: Lifecycle.Transient,
    using: []
})
@Component({
    template,
    styles
})
export class Home extends ComponentBase {
    public name = 'home'+RandomUtils.uuid4();
    wow='ssssss';
    toggle = false;


  onDrThisBind() {
    super.onDrThisBind();
    console.log('Home - onDrThisBind', this.name);
  }
  onDrThisUnBind() {
    super.onDrThisUnBind();
    console.log('Home - onDrThisUnBind', this.name);
  }


    onInitRender(...param: any[]): void {
        // console.log('home onInitRender', param)
        // this.name = 'onInitRenderxxxxxxxxxx';
        // setInterval(() => {
        //     this.name = new Date().toString();
        // }, 2000)

    }

    onDestroyRender(metaData?: CreatorMetaData): void {
        console.log('home onDestroyRender', metaData)
    }

}
