import { elementDefine, innerHtml, onBeforeConnected, onAfterConnected, onBeforeDisconnected, onAfterDisconnected, onBeforeAdopted, onAfterAdopted, onAddEventListener, onConnected, onDisconnected } from '@dooboostore/simple-web-component';

@elementDefine({ name: 'lifecycle-element' })
class LifecycleElement extends HTMLElement {
  @innerHtml
  render() {
    return `
      <div style="padding: 20px; border: 2px solid #f29900; border-radius: 8px; background: #fff7e6;">
        <h3 style="margin-top: 0; color: #f29900;">Lifecycle Test Component</h3>
        <p>Check the browser console to see the sequence of lifecycle calls.</p>
        <button id="internal-btn">Internal Button (for @onAddEventListener)</button>
      </div>
    `;
  }

  @onBeforeConnected
  beforeConnected() {
    console.log('>>> [Lifecycle] 1. onBeforeConnected');
  }

  @onConnected
  onConnected() {
    console.log('>>> [Lifecycle] 2. onConnected (alias for onAfterConnected)');
  }

  @onBeforeDisconnected
  beforeDisconnected() {
    console.log('>>> [Lifecycle] 3. onBeforeDisconnected');
  }

  @onDisconnected
  onDisconnected() {
    console.log('>>> [Lifecycle] 4. onDisconnected (alias for onAfterDisconnected)');
  }

  @onBeforeAdopted
  beforeAdopted() {
    console.log('>>> [Lifecycle] 5. onBeforeAdopted (Moved to new document)');
  }

  @onAfterAdopted
  afterAdopted() {
    console.log('>>> [Lifecycle] 6. onAfterAdopted');
  }

  @onAddEventListener
  onAddedListener() {
    console.log('>>> [Lifecycle] 7. onAddEventListener (A listener was attached via decorator)');
  }
}

// Interactive Testing Logic
const container = document.createElement('div');
container.style.marginTop = '20px';
document.body.appendChild(container);

const btnAdd = document.createElement('button');
btnAdd.textContent = 'Add Component';
btnAdd.onclick = () => {
  if (!document.querySelector('lifecycle-element')) {
    const el = document.createElement('lifecycle-element');
    container.appendChild(el);
  }
};
document.body.appendChild(btnAdd);

const btnRemove = document.createElement('button');
btnRemove.textContent = 'Remove Component';
btnRemove.style.marginLeft = '10px';
btnRemove.onclick = () => {
  document.querySelector('lifecycle-element')?.remove();
};
document.body.appendChild(btnRemove);

const btnAdopt = document.createElement('button');
btnAdopt.textContent = 'Adopt (Move to iframe)';
btnAdopt.style.marginLeft = '10px';
btnAdopt.onclick = () => {
  const el = document.querySelector('lifecycle-element');
  if (el) {
    let iframe = document.querySelector('iframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
    }
    iframe.contentDocument?.body.appendChild(el);
  }
};
document.body.appendChild(btnAdopt);
