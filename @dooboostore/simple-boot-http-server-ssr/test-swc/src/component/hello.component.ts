import {addEventListener, elementDefine, onConnectedInnerHtml} from '@dooboostore/simple-web-component';
import {Sim} from "@dooboostore/simple-boot";

export namespace HelloComponent {
  export const SYMBOL = Symbol.for('HelloComponent');
}

export interface HelloComponent {
  say(): string;
}


export default (w: Window) => {
  const HTMLElement = (w as any).HTMLElement as typeof globalThis.HTMLElement;

  @Sim({symbol: HelloComponent.SYMBOL})
  @elementDefine('hello-component', {window: w})
  class HelloComponentImp extends HTMLElement implements HelloComponent {

    say() {
      return 'hello';
    }

    @onConnectedInnerHtml({useShadow: true})
    render() {
      return `
      <style>
        :host { display: block; padding: 20px; background: #f0f0f0; border-radius: 8px; }
        h1 { color: #333; }
      </style>
      <div>
        <h1>Hello from Simple Web Component SSR!</h1>
        <p>This was rendered on the server at ${new Date().toLocaleString()}</p>
        <slot></slot>
      </div>
    `;
    }

    @onConnectedInnerHtml
    render2() {
      return `
      <div> <h1>vvvvvvvvvvvvvv</h1> <button id="btn">asd</button>  </div>
    `;
    }


    @addEventListener('#btn', 'click', {root: 'light'})
    aa() {
      alert(1);
    }
  }

  return HelloComponentImp;
}
