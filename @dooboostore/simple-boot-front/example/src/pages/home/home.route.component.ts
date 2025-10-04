import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { OnInitRender } from '@dooboostore/dom-render/lifecycle/OnInitRender';
import { OnDestroyRender } from '@dooboostore/dom-render/lifecycle/OnDestroyRender';
import { CreatorMetaData } from '@dooboostore/dom-render/rawsets/CreatorMetaData';
import template from './home.route.component.html';
import style from './home.route.component.css';
import { ComponentBase } from '@dooboostore/simple-boot-front/component/ComponentBase';
import { RawSet } from '@dooboostore/dom-render/rawsets/RawSet';

@Sim
@Component({
  template,
  styles: [style]
})
export class HomeRouteComponent extends ComponentBase implements OnInitRender, OnDestroyRender {
  public currentTime = new Date().toLocaleString();
  private intervalId?: number;

  async onInitRender(param: any, rawSet: RawSet) {
    await super.onInitRender(param,rawSet);

    console.log('🏠 Home onInitRender', param);
    
    // 1초마다 시간 업데이트
    this.intervalId = window.setInterval(() => {
      this.currentTime = new Date().toLocaleString();
    }, 1000);
  }

  onDestroyRender(metaData?: CreatorMetaData): void {
    console.log('🏠 Home onDestroyRender', metaData);
    
    // 인터벌 정리
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
