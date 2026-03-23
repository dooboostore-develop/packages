import 'reflect-metadata';
import { elementDefine, innerHtml, attribute, onAttributeChanged, query, queryAll, addEventListener, onBeforeConnected, onAfterConnected, onConnected, onBeforeDisconnected, onAfterDisconnected, onDisconnected, onAddEventListener, emitCustomEvent, state, SwcForOf, SwcIf, SwcObject, SwcForOfUl, SwcIfDiv, SwcChooseDiv, SwcObjectDiv } from '@dooboostore/simple-web-component';

window.addEventListener('DOMContentLoaded', () => {
  // 1. Nesting & Alias Test
  const t1 = document.querySelector('#the-t-test') as any;
  const t2 = document.querySelector('#the-t-test2') as any;
  document.getElementById('inc-count-btn')?.addEventListener('click', () => t1 && t1.count++);
  document.getElementById('inc-count-btn2')?.addEventListener('click', () => t2 && t2.count++);

  // 2. is="swc-for-of-ul"
  const iul = document.querySelector('#is-u-loop') as SwcForOfUl;
  if (iul) {
    iul.swcValue = [{ name: 'IS-Item 1' }, { name: 'IS-Item 2' }];
  }

  // 3. is="swc-if-div"
  const iif = document.querySelector('#is-if-el') as SwcIfDiv;
  if (iif) {
    iif.swcValue = true;
    document.getElementById('toggle-is-if-btn')?.addEventListener('click', () => (iif.swcValue = !iif.swcValue));
  }

  // 4. is="swc-choose-div"
  const ice = document.querySelector('#is-choose-el') as SwcChooseDiv;
  if (ice) {
    ice.swcValue = 'A';
    document.getElementById('set-choose-a-btn')?.addEventListener('click', () => (ice.swcValue = 'A'));
    document.getElementById('set-choose-b-btn')?.addEventListener('click', () => (ice.swcValue = 'B'));
    document.getElementById('set-choose-c-btn')?.addEventListener('click', () => (ice.swcValue = 'C'));
  }

  // 5. is="swc-object-div"
  const iol = document.querySelector('#is-obj-el') as SwcObjectDiv;
  // console.log('vvvvvvv',iol)
  if (iol) {
    iol.swcValue = { name: 'IS Object User', age: 40 };
    document.getElementById('update-is-obj-btn')?.addEventListener('click', () => {
      iol.swcValue.name = 'Updated IS User ' + new Date().getSeconds();
      iol.swcValue.age = Math.floor(Math.random() * 100);
    });
  }

  // 6. Autonomous Logic Components
  const aif = document.querySelector('#auto-if') as SwcIf;
  document.getElementById('toggle-auto-if-btn')?.addEventListener('click', () => aif && (aif.swcValue = !aif.swcValue));

  const aloop = document.querySelector('#auto-loop') as SwcForOf;
  if (aloop) aloop.swcValue = [{ name: 'Auto Item 1' }, { name: 'Auto Item 2' }];
});

// Component Definitions
@elementDefine({ name: 't-test', autoRemoveEventListeners: true })
class T extends HTMLElement {
  @emitCustomEvent('btn-click')
  sendData() {
    return { message: 'Hello from T1!', time: Date.now() };
  }

  @state
  @attribute({ type: Number })
  count = 0;

  @emitCustomEvent('connected')
  @onConnected
  init() {
    console.log('T1 Connected');
  }

  @innerHtml({ useShadow: true })
  render() {
    return `
      <div style="border: 2px solid #1a73e8; padding: 15px; border-radius: 10px; background: white;">
        <h3>T1 Component (as="t1")</h3>
        <p>Own Count: <strong>{{count}}</strong></p>
        <p>User Name: <strong>{{userName}}</strong></p>
        <button id="inner-emit-btn">Emit from Inside</button>
        <slot name="good"></slot>
      </div>
    `;
  }

  @addEventListener({ type: 'click', query: '#inner-emit-btn' })
  onInnerEmit() {
    console.log('T1: Inner button clicked, calling sendData()...');
    this.sendData();
  }

  good(t: any) {
    console.log('good', t.innerHTML)
  }
}

@elementDefine({ name: 't-test2' })
class T2 extends HTMLElement {
  @state @attribute({ type: Number }) count = 0;

  @emitCustomEvent('connected')
  @onConnected
  init() {
    console.log('T2 Connected');
  }

  @innerHtml({ useShadow: true })
  render() {
    return `
      <div style="background: #f1f3f4; padding: 10px; border-radius: 5px; margin-top: 10px;">
        <h4>T2 Component (as="t2")</h4>
        <p>T2's count: <strong>{{count}}</strong></p>
        <slot></slot>
      </div>
    `;
  }
}

@elementDefine({ name: 'light-t' })
class LightT extends HTMLElement {
  @innerHtml
  render() {
    return `<div style="color: green; border: 1px solid green; padding: 10px;">Light DOM Component!</div>`;
  }
}

@elementDefine({ name: 'multi-html-t' })
class MultiHtmlT extends HTMLElement {
  @innerHtml({ useShadow: true })
  rs1() {
    return `<div>Shadow Content</div>`;
  }

  @innerHtml
  rl1() {
    return `<div style="color: red;">Light Content</div>`;
  }
}

@elementDefine({ name: 'query-event-test' })
class QueryEventTest extends HTMLElement {
  @state name = 'Developer';

  @query
  hostEl!: HTMLElement;

  @query('input')
  myInput!: HTMLInputElement;

  @query({ selector: 'p', root: 'shadow' })
  pEl!: HTMLElement;

  @query('span')
  statusSpan!: HTMLElement;

  @innerHtml({ useShadow: true })
  render() {
    return `
      <div style="padding: 10px; border: 1px solid #aaa;">
        <h3>@query & @addEventListener Test</h3>
        <input type="text" value="{{name}}" placeholder="Type here...">
        <button id="alert-btn">Alert Name</button>
        <p>Current Name: {{name}}</p>
        Status: <span class="status"></span>
      </div>
    `;
  }

  @addEventListener({ type: 'input', query: 'input' })
  onInput(e: any) {
    console.log('--1', this, this.name);
    this.name = e.target.value;
    console.log('--2', this, this.name);
    if (this.statusSpan) {
      this.statusSpan.textContent = 'Typing...';
    }
  }

  @addEventListener({ type: 'click', query: '#alert-btn' })
  onAlert() {
    alert('Hello, ' + this.name);
    this.name = 'zzzz';
    console.log('Input Element via @query:', this.myInput);
  }

  @onAfterConnected
  afterInit() {
    console.log('Host Element via @query:', this.hostEl);
    console.log('P Element via @query({selector:"p"}):', this.pEl);
    if (this.statusSpan) {
      this.statusSpan.textContent = 'Ready';
    }
  }
}
