import { Lifecycle, Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import template from './index.route.component.html';
import style from './index.route.component.css';
import { SimFrontOption } from '@dooboostore/simple-boot-front/option/SimFrontOption';
import { ComponentBase } from '@dooboostore/dom-render/components/ComponentBase';
import { Appender } from '@dooboostore/dom-render/operators/Appender';
import { ApiService } from '@dooboostore/simple-boot/fetch/ApiService';
import { Inject } from '@dooboostore/simple-boot/decorators/inject/Inject';
import { TalkService } from '@src/service/TalkService';

@Sim({
  scope: Lifecycle.Transient
})
@Component({
  template: template,
  styles: style
})
export class IndexRouteComponent extends ComponentBase<any> {
  private fetchAppender = new Appender<string>();
  // private fetchAppender: string[] = [];
    user = [1,2,3,4]
  constructor(
    private simFrontConfig: SimFrontOption,
    private apiService: ApiService,
    @Inject({symbol: TalkService.SYMBOL}) private talkService: TalkService,
  ) {
    super();
  }

  async apiFetch() {
    const data = await this.apiService.get<{ hello: string, date: string }>({target: '/api/hello'});
    this.fetchAppender.push(JSON.stringify(data));
  }

  async apiIntentFetch() {
    const data = await this.talkService.talk({seq: Math.random()});
    this.fetchAppender.push(JSON.stringify(data));
  }
}
