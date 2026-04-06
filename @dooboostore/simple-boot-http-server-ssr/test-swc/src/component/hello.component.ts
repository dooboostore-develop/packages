import {addEventListener, elementDefine, onConnectedInnerHtml} from '@dooboostore/simple-web-component';



export const tagName = 'hello-component';
export default (w: Window) => {
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;
  @elementDefine(tagName, { window: w })
  class HelloComponentImp extends w.HTMLElement {
    say() {
      return 'hello';
    }

    @onConnectedInnerHtml({ useShadow: true })
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

    @addEventListener('#btn', 'click', { root: 'light' })
    aa() {
      alert(1);
    }
  }

  return tagName;
}
