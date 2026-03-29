import swcRegister, { elementDefine, onConnectedInnerHtml, emitCustomEvent, addEventListener, HostSet } from '@dooboostore/simple-web-component';

swcRegister(window);
@elementDefine('advanced-sender', { window })
class AdvancedSender extends HTMLElement {
  @onConnectedInnerHtml
  render() {
    return `
      <div>
        <button swc-on-click="$host.sendToAllApps()">Broadcast to All Apps (:appHosts)</button>
        <button swc-on-click="$host.sendToWindow()">Broadcast to Window (:window)</button>
        <button swc-on-click="$host.sendToParent()">Direct Message to Parent (:parentHost)</button>
      </div>
    `;
  }

  @emitCustomEvent(':appHosts', 'app:broadcast')
  sendToAllApps() {
    console.log('>>> [Sender] Broadcasting to all parent apps (:appHosts)');
    return { time: new Date().toLocaleTimeString(), msg: 'Hello to all ancestor apps!' };
  }

  @emitCustomEvent(':window', 'global:ping')
  sendToWindow() {
    console.log('>>> [Sender] Pinging window (:window)');
    return { from: 'AdvancedSender', msg: 'Window-level Broadcast' };
  }

  @emitCustomEvent(':parentHost', 'msg:direct')
  sendToParent() {
    console.log('>>> [Sender] Direct message to parent (:parentHost)');
    return { msg: 'Only for my parent!' };
  }
}

@elementDefine('advanced-receiver', { window })
class AdvancedReceiver extends HTMLElement {
  @onConnectedInnerHtml
  render() {
    return `
      <div style="margin-top: 5px;">
        <strong>${this.getAttribute('label')}</strong>
        <div class="log-area" style="color: #1976d2; font-size: 0.9em; font-family: monospace; background: rgba(0,0,0,0.03); padding: 5px; margin-top: 5px; border-radius: 3px;">Ready.</div>
      </div>
    `;
  }

  // Listen for broadcast from any app host
  @addEventListener(':appHost', 'app:broadcast')
  onAppBroadcast(e: CustomEvent) {
    const el = this.querySelector('.log-area');
    if (el) el.textContent = `[APP-MSG] ${e.detail.msg} (${e.detail.time})`;
  }

  // Listen for direct messages from children
  @addEventListener(':host', 'msg:direct')
  onDirectMsg(e: CustomEvent) {
    const el = this.querySelector('.log-area');
    if (el) el.textContent = `[DIRECT] ${e.detail.msg}`;
  }
}

// Global Window Listener
window.addEventListener('global:ping', (e: any) => {
  const log = document.getElementById('window-log');
  if (log) {
    if (log.textContent && log.textContent.startsWith('Waiting')) log.innerHTML = '';
    const entry = document.createElement('div');
    entry.textContent = `[WINDOW] Ping from ${e.detail.from} at ${new Date().toLocaleTimeString()}`;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
  }
});

console.log('>>> Advanced Messaging System Test Loaded');
