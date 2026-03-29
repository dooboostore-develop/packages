import swcRegister, { elementDefine, onConnectedInnerHtml, setAttribute, addEventListener } from '@dooboostore/simple-web-component';

swcRegister(window);
@elementDefine('attr-surgical-element', { window })
class AttrSurgicalElement extends HTMLElement {
  // 1. Inject attribute into a specific child (#status-display)
  @setAttribute('#status-display', 'data-status')
  setStatus(status: string) {
    console.log('>>> [Surgical Attr] Setting data-status to:', status);
    return status;
  }

  // 2. Inject value into an <input> element
  @setAttribute('#target-input', 'value')
  setInputValue(val: string) {
    console.log('>>> [Surgical Attr] Setting input value attribute to:', val);
    return val;
  }

  // 3. Inject attribute into the host itself
  @setAttribute(':host', 'theme')
  setTheme(theme: string) {
    console.log('>>> [Surgical Attr] Setting host theme to:', theme);
    return theme;
  }

  @addEventListener('#btn-active', 'click')
  onActive() {
    this.setStatus('active');
  }

  @addEventListener('#btn-inactive', 'click')
  onInactive() {
    this.setStatus('inactive');
  }

  @addEventListener('#btn-input-update', 'click')
  onUpdateInput() {
    this.setInputValue('Surgical Value ' + new Date().getSeconds());
  }

  @addEventListener('#btn-theme', 'click')
  onToggleTheme() {
    const current = this.getAttribute('theme');
    this.setTheme(current === 'dark' ? 'light' : 'dark');
  }

  @onConnectedInnerHtml({ useShadow: true })
  render() {
    return `
      <style>
        .surgical-box { border: 2px solid #9c27b0; padding: 20px; border-radius: 10px; background: #f3e5f5; font-family: sans-serif; }
        .child-box { border: 1px solid #7b1fa2; padding: 15px; background: white; margin-top: 15px; border-radius: 8px; }
        .status-tag { padding: 6px 10px; border-radius: 4px; font-size: 0.9em; font-weight: bold; background: #eee; border: 1px solid #ccc; }
        #status-display[data-status="active"] { background: #e8f5e9; color: #2e7d32; border: 1px solid #4caf50; }
        #status-display[data-status="inactive"] { background: #ffebee; color: #c62828; border: 1px solid #ef5350; }
        button { padding: 8px 16px; cursor: pointer; border-radius: 4px; border: 1px solid #ccc; background: white; margin-right: 5px; margin-bottom: 5px; }
        input { padding: 8px; border: 1px solid #ccc; border-radius: 4px; width: 250px; }
      </style>

      <div class="surgical-box">
        <h3>1. Child Attribute Injection (CSS & State)</h3>
        <div class="controls">
            <button id="btn-active">Set Active</button>
            <button id="btn-inactive">Set Inactive</button>
        </div>
        <div class="child-box">
            <span>Current UI Status: </span>
            <span id="status-display" class="status-tag" data-status="none">Check My Style!</span>
        </div>

        <hr style="margin: 20px 0; border: none; border-top: 1px solid rgba(0,0,0,0.1);">

        <h3>2. Input Value Injection</h3>
        <p style="font-size: 0.85em; color: #555;">Updates the <code>value</code> attribute of the input surgically.</p>
        <button id="btn-input-update">Update Input Value</button>
        <div class="child-box">
            <input id="target-input" type="text" placeholder="Watch me change...">
        </div>

        <hr style="margin: 20px 0; border: none; border-top: 1px solid rgba(0,0,0,0.1);">

        <h3>3. Host Attribute Injection</h3>
        <button id="btn-theme">Toggle Host 'theme' Attr</button>
        <p style="font-size: 0.85em; color: #666; margin-top: 10px;">
          Check <code>&lt;attr-surgical-element&gt;</code> in DevTools!
        </p>
      </div>
    `;
  }
}
