import { DomRender, DomRenderRunConfig } from '@dooboostore/dom-render/DomRender';
import { Second } from './second/second';
import { Detail } from './detail/detail';
import SecondTemplate from './second/second.html';
import DetailTemplate from './detail/detail.html';
import { OnDestroyRender } from '@dooboostore/dom-render/lifecycle/OnDestroyRender';
import { ComponentSet } from '@dooboostore/dom-render/components/ComponentSet';
import { OnInitRender } from '@dooboostore/dom-render/lifecycle/OnInitRender';
import { RawSet } from '@dooboostore/dom-render/rawsets/RawSet';


export class Sub implements OnDestroyRender {
  age = 0;
  display='';
  private interval?:  NodeJS.Timeout;
  constructor(private name: string) {
    console.log('Sub constructor', name);
  }

  onDrThisBind(): void {
    console.log(this.name, 'onDrThisBind');
    // this.interval = setInterval(() => {
    //   this.display = `${this.name} ${this.age++}`;
    // }, 1000)
  }

  onDrThisUnBind(): void {
    console.log(this.name, 'onDrThisUnBind');
    clearInterval(this.interval);
  }

  onDestroyRender(data: any): void {
    console.log('onDestroyRender', this.name, data)
  }
}

export class Index implements OnInitRender{
  sw= false;
  child: any;
  name = 'index name';
  value = 'wowvvvvvvvvv';
  sub1 = new ComponentSet(new Sub('sub1'), {template: '<div><h1>11subthis</h1><div>${@this@.display}$ </div></div>'});
  sub2 =  new ComponentSet(new Sub('sub2'), {template: '<div><h1>22subthis</h1><div>${@this@.display}$</div></div>'});
  constructor() {
  }

  toggleSw() {
    this.sw = !this.sw;
  }
  changeThis() {
    if (this.child === this.sub1) {
      this.child = this.sub2;
    } else {
      this.child = this.sub1;
    }
    console.log('-ss', this.child)
  }
  changeNewThis() {
    console.log('changeNewThis------', this)
    this.child = new ComponentSet(new Sub('s222222222ub1'), {template: '<div><h1>11subthis</h1><div>${@this@.display}$ </div></div>'})
  }
  onInitRender(param: any, rawSet: RawSet) {
    console.log('------',rawSet)
  }
}

// class CustomRouter extends Router<Index> {
//   test(urlExpression: string): boolean {
//     if (this.getPathData(urlExpression)) {
//       return true;
//     } else {
//       return false;
//     }
//   }
//
//
//   getData(): any {
//     return this.config.window.history.state;
//   }
//
//   getSearchParams(): URLSearchParams {
//     return new URLSearchParams(LocationUtils.hashSearch(this.config.window));
//   }
//
//   push(path: string, data?: any, title: string = ''): void {
//     if (path === '/') {
//       super.pushState(data, title, '');
//     } else {
//       path = '#' + path;
//       super.pushState(data, title, path);
//     }
//   }
//
//   getUrl(): string {
//     return LocationUtils.hash(this.config.window) || '/';
//   }
//
//   getPathName(): string {
//     return LocationUtils.hashPath(this.config.window) || '/';
//   }
// }


const config: DomRenderRunConfig<Index> = {
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

const domRender = new DomRender({
  rootObject: new Index(),
  target:  document.querySelector('#app')!,
  config: config
});

const data = domRender.rootObject;
(window as any).domrender = data;


setTimeout(() => {
  data.child = new ComponentSet(new Sub('aadds222222222ub1'), {template: '<div><h1>aadds222222222ub1</h1><div>${@this@.display}$  </div></div>'})
//   data.value = Date.now().toString();
}, 2000)
