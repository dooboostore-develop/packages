import { elementDefine, onConnectedInnerHtml, onAfterConnected, addEventListener } from '@dooboostore/simple-web-component';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Router as WebRouter } from '@dooboostore/core-web/routers/Router';

export default (w: Window) => {
  @Sim
  @elementDefine('my-component', { window: w })
  class MyComponent extends HTMLElement {
    name?: string | null;
    showExtra = false;
    showRealIf = true;

    constructor(private router: WebRouter) {
      super();
      console.log('------->', router);
    }

    @onConnectedInnerHtml({ useShadow: true })
    render() {
      return `
        <div style="padding: 10px; border: 1px solid #ccc;">
          <h3>My Component</h3>
          <p>Current Route: <strong>{{route}}</strong></p>
          <p>Current name: <strong>{{name}}</strong></p>
          <button id="change-name-btn">Change Name Internal</button>
          <button id="toggle-extra-btn">Toggle IfChildren</button>
          <button id="toggle-real-if-btn">Toggle Real If</button>
          <button swc-on-click="console.log('This is element:', this, 'Nearest host is:', $host);">Attribute Event Test</button>
          <input swc-on-input="$host.name = event.target.value" value="{{name}}" swc-on-connected="console.log('Input connected!')"/>
          <hr/>
          <button swc-on-click="console.log('vvvvvvvvvvv')">Click</button>
          <hr/>
          <h4>IfChildren Test (Wrapper stays)</h4>
          <div is="swc-if-children-div" swc-value="{{showExtra}}">
            <p style="color: blue; font-weight: bold;">This is extra content triggered by @state showExtra!</p>
          </div>
          <h4>Real If Test (Element removed)</h4>
          <div is="swc-if-div" swc-value="{{showRealIf}}" style="background: yellow; padding: 5px;"
            swc-on-click="console.log(this, $host, $hosts, $firstHost, $lastHost, 'Real If Div clicked!', event)"
            swc-on-connected="console.log('Real If Div connected!', $host, $hosts, $firstHost, $lastHost)">
            <b>I am a physical div! Toggle me to see me disappear from DOM.</b>
          </div>
        </div>
      `;
    }

    @onAfterConnected
    init() {
      console.log('init2222', this.name);
    }

    @addEventListener('#change-name-btn', 'click')
    onChangeName() {
      this.name = 'Internal Change ' + new Date().getSeconds();
    }

    @addEventListener('#toggle-extra-btn', 'click')
    onToggleExtra() {
      this.showExtra = !this.showExtra;
    }

    @addEventListener('#toggle-real-if-btn', 'click')
    onToggleRealIf() {
      this.showRealIf = !this.showRealIf;
    }
  }

  return MyComponent;
};
