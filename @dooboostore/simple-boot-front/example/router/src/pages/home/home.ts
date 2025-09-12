import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import template from './home.html';
import styles from './home.css';
import { OnDestroyRender } from '@dooboostore/dom-render/lifecycle/OnDestroyRender.ts';
import { CreatorMetaData } from '@dooboostore/dom-render/rawsets/CreatorMetaData.ts';
import { OnInitRender } from '@dooboostore/dom-render/lifecycle/OnInitRender.ts';
@Sim({
    using: []
})
@Component({
    template,
    styles
})
export class Home implements OnInitRender, OnDestroyRender {
    public name = 'home';
    wow='ssssss';
    toggle = false;




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
