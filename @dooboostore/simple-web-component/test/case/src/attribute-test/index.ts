import swcRegister, { elementDefine, onConnectedInnerHtml, attribute, addEventListener } from '@dooboostore/simple-web-component';

swcRegister(window);

@elementDefine('attribute-test-element')
class AttributeTestElement extends HTMLElement {
  @attribute(':host',  { name:'zz', connectedInitialize: true })
  v = 1022;

  // 1. Host attribute with auto-init and Number type
  @attribute(':host', { connectedInitialize: true })
  count = 10;

  // 2. Host attribute with custom name and Boolean type
  @attribute(':host', { name: 'is-active', type: Boolean, connectedInitialize: true })
  active  = true;

  // 3. Child attribute
  @attribute('#child-box', { name: 'color' })
  boxColor = 'red';

  @addEventListener('#inc-btn', 'click')
  inc() {
    this.count++;
    console.log('inc count', this.count);
  }

  @addEventListener('#toggle-btn', 'click')
  toggle() {
    console.log('-------->', typeof this.active)
    this.active = !this.active;
    console.log('toggle active',typeof this.active,  this.active, this.getAttribute('is-active'));
  }

  @addEventListener('#color-btn', 'click')
  changeColor() {
    this.boxColor = this.boxColor === 'red' ? 'blue' : 'red';
  }

  @onConnectedInnerHtml({ useShadow: true })
  render() {
    console.log('ggggg', typeof this.v, this.getAttribute('zz'));
    console.log('ggggg', typeof this.count, this.getAttribute('count'));
    console.log('ggggg', typeof this.active, this.getAttribute('active'));
    return `
      <div style="padding: 20px; border: 2px solid #333; border-radius: 8px;">
        <h3>@attribute Decorator Test</h3>
        <p>Count (Synced to :host[count]): <strong id="count-val">${this.count}</strong></p>
        <p>Active (Synced to :host[is-active]): <strong id="active-val">${this.active}</strong></p>
        
        <div id="child-box" style="width: 50px; height: 50px; border: 1px solid black; margin-bottom: 10px;"></div>
        <div id="child-box" style="width: 50px; height: 50px; border: 1px solid black; margin-bottom: 10px;"></div>

        <button id="inc-btn">Increment Count</button>
        <button id="toggle-btn">Toggle Active</button>
        <button id="color-btn">Change Box Color</button>
      </div>
    `;
  }
}
