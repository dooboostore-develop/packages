import swcRegister, { elementDefine, onConnectedInnerHtml, addEventListener, HostSet, query } from '@dooboostore/simple-web-component';

swcRegister(window);

@elementDefine('event-element', { window })
class EventElement extends HTMLElement {
  @query('#dynamic-container') containerEl?: HTMLElement;
  @query('#delegate-container') delegateContainerEl?: HTMLElement;

  @onConnectedInnerHtml({ useShadow: true })
  render() {
    return `
      <div style="padding: 20px; border: 2px solid #673ab7; border-radius: 8px; background: #f3e5f5; font-family: sans-serif;">
        <h3 style="margin-top: 0; color: #673ab7;">Event Test Component (Pure + Delegate)</h3>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <!-- Section 1: Pure Mode (Direct) -->
            <div class="box" style="background: white; border: 1px solid #ccc; padding: 15px; border-radius: 6px;">
              <h4>1. Pure Mode (Direct Binding)</h4>
              <p style="font-size: 0.85em; color: #666;">Only elements present at <code>connectedCallback</code> are bound.</p>
              <button id="add-pure-btn">Add .pure-btn</button>
              <div id="dynamic-container" style="margin-top: 10px; display: flex; gap: 5px; flex-wrap: wrap;"></div>
            </div>

            <!-- Section 2: Delegate Mode -->
            <div class="box" style="background: white; border: 1px solid #ccc; padding: 15px; border-radius: 6px;">
              <h4>2. Delegate Mode (Shadow)</h4>
              <p style="font-size: 0.85em; color: #666;">Dynamic elements are caught by host listener.</p>
              <button id="add-delegate-btn">Add .delegate-btn</button>
              <div id="delegate-container" style="margin-top: 10px; display: flex; gap: 5px; flex-wrap: wrap;"></div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
            <!-- Section 3: Root Test (Light DOM) -->
            <div class="box" style="background: white; border: 1px solid #ccc; padding: 15px; border-radius: 6px;">
              <h4>3. Light DOM Delegate</h4>
              <p style="font-size: 0.85em; color: #666;">Testing <code>root: 'light'</code> delegation.</p>
              <button id="add-light-btn">Add .light-btn (to Light DOM)</button>
              <div id="light-container" style="margin-top: 10px; border: 1px dashed #aaa; padding: 5px;">
                 <slot name="light-content"></slot>
              </div>
            </div>

            <!-- Section 4: Host Test -->
            <div class="box" style="background: white; border: 1px solid #ccc; padding: 15px; border-radius: 6px;">
              <h4>4. Host & Special Selectors</h4>
              <button id="host-trigger-btn">Click Me (Tests :host)</button>
              <p style="font-size: 0.85em; color: #666; margin-top: 10px;">Check console for context logs.</p>
            </div>
        </div>
      </div>
    `;
  }

  // --- 1. Pure Mode Handler ---
  @addEventListener('.pure-btn', 'click')
  onPureClick() {
    alert('Directly bound! This only works for elements that existed during connection.');
  }

  @addEventListener('#add-pure-btn', 'click')
  onAddPure() {
    const btn = document.createElement('button');
    btn.className = 'pure-btn';
    btn.textContent = 'I am Pure';
    btn.style.padding = '5px 10px';
    this.containerEl?.appendChild(btn);
  }

  // --- 2. Delegate Mode Handler (Shadow - Default) ---
  @addEventListener('.delegate-btn', 'click', { delegate: true })
  onDelegateClick(event: MouseEvent, { $host }: HostSet, target: HTMLElement) {
    alert(`[Delegated Shadow] Clicked: ${target.textContent} on host ${$host.tagName}`);
  }

  @addEventListener('#add-delegate-btn', 'click')
  onAddDelegate() {
    const btn = document.createElement('button');
    btn.className = 'delegate-btn';
    btn.textContent = `Shadow ${this.delegateContainerEl?.children.length || 0}`;
    btn.style.padding = '5px 10px';
    this.delegateContainerEl?.appendChild(btn);
  }

  // --- 3. Light DOM Delegate Handler ---
  @addEventListener('.light-btn', 'click', { delegate: true, root: 'light' })
  onLightDelegateClick(event: MouseEvent, { $host }: HostSet, target: HTMLElement) {
    alert(`[Delegated Light] Clicked: ${target.textContent} on host ${$host.tagName}`);
  }

  @addEventListener('#add-light-btn', 'click')
  onAddLight() {
    const btn = document.createElement('button');
    btn.className = 'light-btn';
    btn.slot = 'light-content';
    btn.textContent = `Light ${this.querySelectorAll('.light-btn').length}`;
    btn.style.padding = '5px 10px';
    btn.style.margin = '2px';
    this.appendChild(btn); // Add to Light DOM
  }

  // --- 4. Host Handler ---
  @addEventListener(':host', 'click')
  onHostClick(event: MouseEvent, { $host }: HostSet) {
    console.log('>>> [Event Test] :host clicked!', {
      tag: $host?.tagName,
      target: event.target,
      currentTarget: event.currentTarget
    });

    if ((event.target as HTMLElement).id === 'host-trigger-btn') {
      alert('Host listener triggered! (Target is button because of auto-shadow)');
    }
  }

  @addEventListener(':host', 'click', { root: 'shadow' })
  onHostShadowClick(event: MouseEvent, { $host }: HostSet) {
    console.log('>>> shadow [Event Test] :host clicked!', {
      tag: $host?.tagName,
      target: event.target,
      currentTarget: event.currentTarget
    });
  }

  @addEventListener(':parentHost', 'click', { root: 'shadow' })
  onParentShadowClick(event: Event) {
    console.log('>>> [Event Test] :parentHost shadow clicked!', event.target);
  }
}
