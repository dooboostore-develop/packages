import 'reflect-metadata';
import { DomRender } from '@dooboostore/dom-render/DomRender';
import { RandomUtils } from '@dooboostore/core/random/RandomUtils';

class Root {
  name = 'root';
  age = 'age';
  sw = true;
  users = [{name:'aa', age:22}, {name:'bb', age:22}]
  changeName(){
    this.name = RandomUtils.rgba()
  }
  changeAge() {
    this.age = RandomUtils.rgba()
  }
  toggleSw() {
    this.sw = !this.sw
  }
}


// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const appElement = document.querySelector('#app');
  if (appElement) {
    const result = new DomRender({
      rootObject: new Root(),
      target: appElement,
      config: { window }
    });
    const root = result.rootObject;
    root.name='z';
    (window as any).root = root;
  }
});
