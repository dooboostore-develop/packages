import { DomRender, RunConfig } from '@dooboostore/dom-render/DomRender';
import { Config } from '@dooboostore/dom-render/configs/Config';
import { Second } from './second/second';
import { Detail } from './detail/detail';
import SecondTemplate from './second/second.html';
import DetailTemplate from './detail/detail.html';
import { Router } from '@dooboostore/dom-render/routers/Router';
import { LocationUtils } from '@dooboostore/core-web/location/LocationUtils';
import { OnDestroyRender } from '@dooboostore/dom-render/lifecycle/OnDestroyRender';
import { ComponentSet } from '@dooboostore/dom-render/components/ComponentSet';


export class Sub implements OnDestroyRender {
  age = 0;
  display='';
  private interval?: number;
  constructor(private name: string) {
    console.log('Sub constructor', name);
  }

  onDrThisBind(): void {
    console.log(this.name, 'onDrThisBind');
    this.interval = setInterval(() => {
      this.display = `${this.name} ${this.age++}`;
    }, 1000)
  }

  onDrThisUnBind(): void {
    console.log(this.name, 'onDrThisUnBind');
    clearInterval(this.interval);
  }

  onDestroyRender(data: any): void {
    console.log('onDestroyRender', this.name, data)
  }
}

export class Index {
  child: any;
  value = 'wowvvvvvvvvv';
  sub1 = new ComponentSet(new Sub('sub1'), '<div><h1>11subthis</h1><div>${@this@.display}$  ${console.log("asas${@this@.name}$")}$ <!-- ${#this#}$--></div></div>');
  sub2 =  new ComponentSet(new Sub('sub2'), '<div><h1>22subthis</h1><div>${@this@.display}$</div></div>');
  constructor() {
  }

  changeThis() {
    if (this.child === this.sub1) {
      this.child = this.sub2;
    } else {
      this.child = this.sub1;
    }
    console.log('-ss', this.child)
  }
}
class CustomRouter extends Router<Index> {
  test(urlExpression: string): boolean {
    if (this.getPathData(urlExpression)) {
      return true;
    } else {
      return false;
    }
  }


  getData(): any {
    return this.config.window.history.state;
  }

  getSearchParams(): URLSearchParams {
    return new URLSearchParams(LocationUtils.hashSearch(this.config.window));
  }

  push(path: string, data?: any, title: string = ''): void {
    if (path === '/') {
      super.pushState(data, title, '');
    } else {
      path = '#' + path;
      super.pushState(data, title, path);
    }
  }

  getUrl(): string {
    return LocationUtils.hash(this.config.window) || '/';
  }

  getPath(): string {
    return LocationUtils.hashPath(this.config.window) || '/';
  }

}


const config: RunConfig<Index> = {
  window: window,
  scripts: {
    concat: function (data: string, str: string) {
      return data + str;
    }
  },
  targetElements: [
    DomRender.createComponent({type: Second, tagName: 'page-second', template: SecondTemplate}),
    DomRender.createComponent({type: Detail, tagName: 'page-detail', template: DetailTemplate})
  ],
  routerType: 'path'
  // routerType: (obj, w) => new CustomRouter(obj, w)
};

const data = DomRender.run({
  rootObject: new Index(),
  target:  document.querySelector('#app')!,
  config: config
});
// setInterval(() => {
//   data.value = Date.now().toString();
// }, 2000)
