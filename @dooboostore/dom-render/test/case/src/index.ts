import 'reflect-metadata';
import { DomRender } from '@dooboostore/dom-render/DomRender';
import { RandomUtils } from '@dooboostore/core/random/RandomUtils';
import { OnInitRender } from '../../../src/lifecycle';
import { RawSet } from '../../../src/rawsets';
import { Appender } from '../../../src/operators/Appender';

class Root implements OnInitRender {
  name = 'root';
  age = 'age';
  sw = true;
  t = 'dr-if';
  tag = '<dr-if value="${false}$">ddd</dr-if>';
  imgSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  users: any[] | undefined;
  selectedIndex = 0;
  private attrValue?: string;
  dataAppender: Appender<string> = new Appender();

  changeName() {
    this.name = RandomUtils.rgba();
  }

  async onInitRender(param: any, rawSet: RawSet): Promise<void> {
    const start = performance.now();
    this.users = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      imgUrl: 'https://picsum.photos/50/50',
      office: { name: `office-${i}` },
      name: `user${i}`
    }));
    this.pushData();
  }

  pushData() {
    const nextData = Array.from({ length: 10 }, (_, i) => `Data ${this.dataAppender.length + i}`);
    this.dataAppender.push(...nextData);
  }

  changeAge() {
    this.age = RandomUtils.rgba();
  }

  toggleSw() {
    this.sw = !this.sw;
  }

  clear() {
    this.users = undefined;
    this.dataAppender.clear();
  }

  changeAttr() {
    this.attrValue = RandomUtils.rgba();
  }

  changeData(data: any) {
    data.imgUrl = new Date().toISOString();
  }
}

class WOWComponent {
  attrValue = 'initial value';

  changeAttr() {
    this.attrValue = RandomUtils.rgba();
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const appElement = document.querySelector('#app');
  if (appElement) {
    const wowComponent = DomRender.createComponent({
      type: WOWComponent,
      tagName: 'wow',
      template: '<div dr-event-click="@this@.changeAttr()">wow ${@this@.attrValue}$</div>'
    });
    const result = new DomRender({
      rootObject: new Root(),
      target: appElement,
      config: { window, targetElements: [wowComponent] }
    });

    const root = result.rootObject;
    root.name = 'z';
    (window as any).root = root;
  }
});
