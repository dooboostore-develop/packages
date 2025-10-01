import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { OnInitRender } from '@dooboostore/dom-render/lifecycle/OnInitRender';
import { OnDestroyRender } from '@dooboostore/dom-render/lifecycle/OnDestroyRender';
import { CreatorMetaData } from '@dooboostore/dom-render/rawsets/CreatorMetaData';
import template from './home.html';
import style from './home.css';

@Sim
@Component({
  template,
  styles: [style]
})
export class Home implements OnInitRender, OnDestroyRender {
  public currentTime = new Date().toLocaleString();
  private intervalId?: number;

  onInitRender(...param: any[]): void {
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
