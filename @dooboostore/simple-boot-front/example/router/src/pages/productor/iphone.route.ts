import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { OnDestroyRender } from '@dooboostore/dom-render/lifecycle/OnDestroyRender.ts';
import { CreatorMetaData } from '@dooboostore/dom-render/rawsets/CreatorMetaData.ts';
import { OnDomRenderInitRender } from 'packages/@dooboostore/dom-render/src/lifecycle/OnDomRenderInitRender.ts';
@Sim({
})
@Component({
    template: '<div>iphone</div>',
    // styles: [style]
})
export class IphoneRoute implements OnDomRenderInitRender, OnDestroyRender {
    public name = 'IphoneRoute';
    wow='ssssss';
    toggle = false;




    onInitRender(...param: any[]): void {
        console.log('home onInitRender', param)
        this.name = 'onInitRenderxxxxxxxxxx';
        setInterval(() => {
            this.name = new Date().toString();
        }, 2000)
    }

    onDestroyRender(metaData?: CreatorMetaData): void {
        console.log('home onDestroyRender', metaData)
    }

}
