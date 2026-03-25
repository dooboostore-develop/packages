import { PathRouter } from '@dooboostore/core-web/routers/PathRouter';
import { HashRouter } from '@dooboostore/core-web/routers/HashRouter';
import { attribute, elementDefine, innerHtml, state, onAfterConnected, addEventListener } from '@dooboostore/simple-web-component';
import {SimpleApplication} from "@dooboostore/simple-boot/SimpleApplication";
import {Sim, SimConfig} from "@dooboostore/simple-boot/decorators/SimDecorator";
import {SimOption} from "@dooboostore/simple-boot/SimOption";
import {ConstructorType} from "@dooboostore/core/types";
import {Router} from "@dooboostore/core-web/routers/Router";







const router = new PathRouter({ window });

@Sim
@elementDefine({ name: 'my-component' })
class MyComponent extends HTMLElement {
  @state route = 'zz';
  @state @attribute name?: string | null;

  @state showExtra = false;

  constructor(private router: Router) {
    super();
    console.log('------->', router)
  }

  @innerHtml
  render() {
    return `
      <div style="padding: 10px; border: 1px solid #ccc;">
        <h3>My Component</h3>
        <p>Current Route: <strong>{{route}}</strong></p>
        <p>Current name: <strong>{{name}}</strong></p>
        <button id="change-name-btn">Change Name Internal</button>
        <button id="toggle-extra-btn">Toggle Extra Content</button>
        
        <div is="swc-if-div" swcValue="{{showExtra}}">
          <p style="color: blue; font-weight: bold;">This is extra content triggered by @state showExtra!</p>
        </div>
      </div>
    `;
  }

  @onAfterConnected
  init() {
    console.log('init2222', this.name);
  }

  @addEventListener({ type: 'click', query: '#change-name-btn' })
  onChangeName() {
    this.name = 'Internal Change ' + new Date().getSeconds();
  }

  @addEventListener({ type: 'click', query: '#toggle-extra-btn' })
  onToggleExtra() {
    this.showExtra = !this.showExtra;
  }
}

// @Sim
// class MyComponent2 {
//
//   constructor(private router: Router) {
//     console.log('------->', router)
//   }
// }
const option = new SimOption({excludeProxys: [Node]});
const otherInstanceSim = new Map<ConstructorType<any> | Function | SimConfig | Symbol, any>();
otherInstanceSim.set(Router, router);
const sim = new SimpleApplication(option).run(otherInstanceSim);

const m = sim.sim(MyComponent)
console.log('m', m);

router.observable.subscribe(it => {
  console.log('router.observable', it);
  if (it.triggerPoint === 'end') {
    const app = document.getElementById('app');
    if (app) {
      // const e = new MyComponent();
      // app.appendChild(e);
      // app.innerHTML = `
      //   <my-component swc-on-constructor="this.name='zzzz'; console.log('11', this, window);" names="Initial Name" route="${it.path}"></my-component>
      // `;

      document.querySelector('#route-btn')?.addEventListener('click', () => {
        router.go(`/${Date.now()}`);
      });
    }
  }
});
window.addEventListener('DOMContentLoaded', () => {
  // document.querySelector('#route-btn')?.addEventListener('click', () => {
  //   router.go(`/${Date.now()}`);
  // })
});
