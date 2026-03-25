import { elementDefine, innerHtml, changedAttribute, setAttribute, addEventListener } from '@dooboostore/simple-web-component';

@elementDefine({ name: 'attr-element' })
class AttrElement extends HTMLElement {
  count = 0;
  active = false;

  @changedAttribute('count')
  onCountChanged(newVal: any, oldVal: any, name: string) {
    console.log(`[changedAttribute] name: ${name}, old: ${oldVal}, new: ${newVal}`);
    this.count = Number(newVal);
  }

  @changedAttribute('active')
  onActiveChanged(newVal: any, oldVal: any, name: string) {
    this.active = newVal !== null;
    console.log(`[changedAttribute] name: ${name}, old: ${oldVal}, new: ${newVal} (active: ${this.active})`);
  }

  @setAttribute('count')
  updateCount(next: number, old?: any, name?: string) {
    console.log(`[setAttribute] name: ${name}, old: ${old}, next: ${next}`);
    return next; // Returns value to be set as attribute
  }

  @setAttribute('active')
  toggleActive(old?: any, name?: string) {
    const next = !this.active;
    console.log(`[setAttribute] name: ${name}, old: ${old}, next: ${next}`);
    return next ? '' : null; // '' to set, null to remove
  }

  @addEventListener('#btn-inc', 'click')
  onBtnIncClick(event: MouseEvent) {
    console.log('[addEventListener] Clicked #btn-inc');
    this.updateCount(this.count + 1);
  }

  @addEventListener('#btn-toggle', 'click')
  onBtnToggleClick(event: MouseEvent) {
    console.log('[addEventListener] Clicked #btn-toggle');
    this.toggleActive();
  }

  @innerHtml
  render() {
    return `
      <div style="padding: 20px; border: 2px solid #1a73e8; border-radius: 8px; background: #f0f4f8; font-family: sans-serif;">
        <h3 style="margin-top: 0; color: #1a73e8;">AttrElement Component</h3>
        <p>Current Count: <strong style="color: #d93025; font-size: 1.2em;">${this.count}</strong></p>
        <p>Active Status: <strong style="color: ${this.active ? '#1e8e3e' : '#5f6368'}; font-size: 1.2em;">${this.active ? 'ACTIVE' : 'INACTIVE'}</strong></p>
        
        <div style="display: flex; gap: 10px; margin-top: 15px;">
          <button id="btn-inc" style="padding: 8px 16px; cursor: pointer; background: #1a73e8; color: white; border: none; border-radius: 4px;">Count up (@addEventListener)</button>
          <button id="btn-toggle" style="padding: 8px 16px; cursor: pointer; background: #34a853; color: white; border: none; border-radius: 4px;">Toggle Active (@addEventListener)</button>
        </div>
        <div style="margin-top: 10px; font-size: 0.9em; color: #666;">
          Check the console and DOM attributes!
        </div>
      </div>
    `;
  }
}

// --- Dynamic Creation Tests ---

const testContainer = document.createElement('div');
testContainer.style.marginTop = '40px';
testContainer.style.padding = '20px';
testContainer.style.border = '2px dashed #999';
testContainer.innerHTML = '<h2>Creation Mode Tests</h2>';
document.body.appendChild(testContainer);

// 1. document.createElement
const btn1 = document.createElement('button');
btn1.textContent = 'Create via document.createElement';
btn1.onclick = () => {
  const el = document.createElement('attr-element');
  el.setAttribute('count', '100');
  testContainer.appendChild(el);
};
testContainer.appendChild(btn1);

// 2. new AttrElement()
const btn2 = document.createElement('button');
btn2.textContent = 'Create via new AttrElement()';
btn2.style.marginLeft = '10px';
btn2.onclick = () => {
  const el = new AttrElement();
  el.setAttribute('count', '200');
  el.setAttribute('active', '');
  testContainer.appendChild(el);
};
testContainer.appendChild(btn2);

// 3. innerHTML
const btn3 = document.createElement('button');
btn3.textContent = 'Create via innerHTML';
btn3.style.marginLeft = '10px';
btn3.onclick = () => {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = '<attr-element count="300"></attr-element>';
  testContainer.appendChild(wrapper.firstChild!);
};
testContainer.appendChild(btn3);
