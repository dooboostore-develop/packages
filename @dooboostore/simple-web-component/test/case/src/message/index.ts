import swcRegister, { elementDefine, onConnectedInnerHtml, emitCustomEvent, addEventListener } from '@dooboostore/simple-web-component';

swcRegister(window);
@elementDefine('message-sender', { window })
class MessageSender extends HTMLElement {
  label = '';

  @onConnectedInnerHtml
  render() {
    this.label = this.getAttribute('label') || 'Sender';
    return `
      <div class="comp-box">
        <strong>${this.label}</strong><br>
        <div style="margin-top: 10px;">
            <button swc-on-click="$host.sendLocal()">Send to AppHost</button>
            <button swc-on-click="$host.sendGlobal()">Send to Window</button>
        </div>
      </div>
    `;
  }

  @emitCustomEvent(':appHost', 'msg:local')
  sendLocal() {
    console.log(`>>> [${this.label}] Emitting local message to :appHost`);
    return { from: this.label, text: 'Hello neighbors!' };
  }

  @emitCustomEvent(':window', 'msg:global')
  sendGlobal() {
    console.log(`>>> [${this.label}] Emitting global message to :window`);
    return { from: this.label, text: 'Hello WORLD!' };
  }
}

@elementDefine('message-receiver', { window })
class MessageReceiver extends HTMLElement {
  @onConnectedInnerHtml
  render() {
    return `
      <div class="comp-box" style="background: #e1f5fe;">
        <strong>${this.getAttribute('label')}</strong>
        <p class="status-box">Status: <span class="status">Waiting...</span></p>
      </div>
    `;
  }

  @addEventListener(':appHost', 'msg:local')
  onLocal(e: CustomEvent) {
    console.log(`>>> [${this.getAttribute('label')}] Received local message:`, e.detail);
    const el = this.querySelector('.status');
    if (el) el.textContent = `${e.detail.from} says: ${e.detail.text}`;
  }

  @addEventListener(':window', 'msg:global')
  onGlobal(e: CustomEvent) {
    console.log(`>>> [${this.getAttribute('label')}] Received global message:`, e.detail);
    const el = this.querySelector('.status');
    if (el) el.textContent = `GLOBAL from ${e.detail.from}`;
  }
}

// Global Log to verify native bubbling/dispatching
window.addEventListener('msg:global', (e: any) => {
  const log = document.getElementById('global-log');
  if (log) log.textContent = `[Window Observer] Last Global Data: ${JSON.stringify(e.detail)}`;
});

console.log('>>> Messaging System Test Loaded');
