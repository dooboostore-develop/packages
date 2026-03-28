import { addEventListener, elementDefine, onConnectedInnerHtml, onDisconnected, emitCustomEvent } from '@dooboostore/simple-web-component';

@elementDefine({
  name: 'event-test-host'
})
class EventTestHost extends HTMLElement {
  @addEventListener('#test-btn', 'click')
  testBtn() {
    console.log('--- Internal Test Button Clicked ---');
  }

  @addEventListener('#emit-btn', 'click')
  emitBtn() {
    console.log('--- Internal Emit Test Button Clicked ---');
    this.sendData();
  }

  @emitCustomEvent(':host', 'my-custom-event')
  sendData() {
    const data = { time: Date.now(), msg: 'Hello from SWC!' };
    console.log('--- Dispatching my-custom-event ---', data);
    return data; // This will be e.detail
  }

  @onDisconnected
  dd() {
    console.log('EventTestHost disconnected');
  }

  @onConnectedInnerHtml({ useShadow: true })
  render() {
    return `
            <div style="padding: 15px; border: 2px solid #1a73e8; border-radius: 8px; background: #e8f0fe;">
                <h3 style="margin-top: 0;">Event Host Component</h3>
                <p>This component tests <code>swc-on-*</code> and <code>@emitCustomEvent</code>.</p>
                <div style="background: white; padding: 10px; border-radius: 4px; border: 1px solid #ccc; margin-bottom: 10px;">
                    <slot name="content"></slot>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button id="test-btn">Internal Listener Test</button>
                    <button id="emit-btn">Trigger @emitCustomEvent</button>
                </div>
            </div>
        `;
  }
}

const mountPoint = document.getElementById('mount-point')!;
const addBtn = document.getElementById('add-host-btn')!;
const removeBtn = document.getElementById('remove-host-btn')!;
const removeAttrBtn = document.getElementById('remove-attr-btn')!;

let hostCount = 0;

addBtn.addEventListener('click', () => {
  hostCount++;
  const container = document.createElement('div');
  container.id = `container-${hostCount}`;
  container.style.marginBottom = '20px';

  // Dynamic creation with swc-on-click, swc-on-connected AND custom event handler (using 'swc-on' prefix)
  container.innerHTML = `
        <event-test-host id="host-${hostCount}" 
            swc-on-connected="console.log('>>> [Host Event] connected', $host?.id)"
            swc-on-click="console.log('>>> [Host Event] clicked', $host?.id)"
            swc-on-my-custom-event="alert(1); console.log('>>> [Custom Event Received via swc-on-my-custom-event attribute]', event.detail); alert('Custom event from ' + $host?.id + '\\nData: ' + JSON.stringify(event.detail))"
            >
            
            <div slot="content">
                <strong>Host ID: host-${hostCount}</strong>
                <p>Try the buttons below to test listeners and custom events.</p>
            </div>
        </event-test-host>
    `;

  mountPoint.appendChild(container);
  console.log(`Added host-${hostCount} with custom event handlers.`);
});

removeAttrBtn.addEventListener('click', () => {
  const allHosts = document.querySelectorAll('event-test-host');
  allHosts.forEach(host => {
    host.removeAttribute('swc-on-click');
    host.removeAttribute('swc-on-my-custom-event');
    console.log(`Removed attributes from ${host.id}. (Events remain bound in 'Pure' mode)`);
  });
});

removeBtn.addEventListener('click', () => {
  mountPoint.innerHTML = '';
  hostCount = 0;
  console.log('Cleared all components.');
});

// Global listener test
document.addEventListener('my-custom-event', (e: any) => {
  console.log('>>> [Global Listener] Caught my-custom-event:', e.detail);
});
