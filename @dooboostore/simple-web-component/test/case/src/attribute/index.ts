import swcRegister, { changedAttributeThis, elementDefine, onConnectedInnerHtml, attribute, attributeHost, query } from '@dooboostore/simple-web-component';

swcRegister(window);

@elementDefine('attribute-test-element', { window })
class AttributeTestElement extends HTMLElement {
  @attributeHost stringValue?: string;
  @attributeHost numValue: number = 0;
  @attributeHost boolValue: boolean = true;
  @attributeHost({ name: 'data-host-value' }) hostValue: string = 'host-initial';

  @query('#string-input') stringInput?: HTMLInputElement;
  @query('#string-display') stringDisplay?: HTMLElement;
  @query('#num-display') numDisplay?: HTMLElement;
  @query('#bool-toggle') boolToggle?: HTMLInputElement;
  @query('#bool-label') boolLabel?: HTMLElement;
  @query('#host-display') hostDisplay?: HTMLElement;

  @onConnectedInnerHtml({ useShadow: true })
  render() {

    return `
      <div style="padding: 15px; border: 2px solid #1a73e8; border-radius: 8px; background: #e8f0fe;">
        <h3 style="margin-top: 0;">Attribute Test Component</h3>
        <p>Testing <code>@attribute</code>, <code>@attributeHost</code>, and directives.</p>
        
        <div style="background: white; padding: 10px; border-radius: 4px; border: 1px solid #ccc;">
          <!-- String Attribute -->
          <div style="margin-bottom: 15px;">
            <label>String Value:</label><br/>
            <input type="text" id="string-input" value="${this.stringValue}" style="width: 200px; padding: 5px;" />
            <div id="string-display" style="margin-top: 5px; padding: 8px; background: #f0f0f0; border-radius: 3px; font-family: monospace;">
              Current: ${this.stringValue}
            </div>
          </div>

          <!-- Number Attribute -->
          <div style="margin-bottom: 15px;">
            <label>Number Value:</label><br/>
            <button id="inc-btn" style="padding: 5px 10px;">Increment</button>
            <div id="num-display" style="margin-top: 5px; padding: 8px; background: #f0f0f0; border-radius: 3px; font-family: monospace;">
              Count: ${this.numValue}
            </div>
          </div>

          <!-- Boolean Attribute -->
          <div style="margin-bottom: 15px;">
            <label>
              <input type="checkbox" id="bool-toggle" ${this.boolValue ? 'checked' : ''} />
              Boolean Value
            </label>
            <span id="bool-label" style="margin-left: 10px; font-family: monospace;">
              ${this.boolValue ? 'true' : 'false'}
            </span>
          </div>

          <!-- AttributeHost -->
          <div style="margin-bottom: 15px;">
            <label>Host Attribute (@attributeHost):</label><br/>
            <div id="host-display" style="margin-top: 5px; padding: 8px; background: #f0f0f0; border-radius: 3px; font-family: monospace;">
              data-host-value: <strong>${this.hostValue}</strong>
            </div>
          </div>
        </div>

        <!-- Execution Test Component -->
        <execution-test-element id="exec-test" result="{{= $host.stringValue}}"></execution-test-element>
      </div>
    `;
  }

  connectedCallback() {
    // String input sync
    this.stringInput?.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      this.stringValue = target.value;
      if (this.stringDisplay) {
        this.stringDisplay.textContent = `Current: ${this.stringValue}`;
      }
    });

    // Number increment
    const incBtn = this.querySelector('#inc-btn') as HTMLButtonElement;
    incBtn?.addEventListener('click', () => {
      this.numValue = (this.numValue || 0) + 1;
      if (this.numDisplay) {
        this.numDisplay.textContent = `Count: ${this.numValue}`;
      }
    });

    // Boolean toggle
    this.boolToggle?.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      this.boolValue = target.checked;
      if (this.boolLabel) {
        this.boolLabel.textContent = this.boolValue ? 'true' : 'false';
      }
    });

    console.log('[Attribute Test] Component initialized');
  }
}

// ========== Execution Directive Test Element ==========
@elementDefine('execution-test-element', { window })
class ExecutionTestElement extends HTMLElement {
  @attributeHost result?: string;
  @query('#exec-test-btn') execBtn?: HTMLButtonElement;
  @query('#exec-result') execResult?: HTMLElement;

  constructor() {
    super();
    setInterval(()=>{
    console.log('vvvvvvvvvvvv122', this.result);
    }, 1000)
  }
  @changedAttributeThis('result')
  ggg(z: string) {
    console.log('vvvvvvvvvvvv', z);
  }

  @onConnectedInnerHtml({ useShadow: true })
  render() {
    console.log('------>', this.result);
    return `
      <div style="padding: 15px; border: 2px solid #27ae60; border-radius: 8px; background: #e8f5e9; margin-top: 20px;">
        <h3 style="margin-top: 0; color: #27ae60;">{{= }} Execution Directive Test</h3>
        <p>Testing <code>{{= ... }}</code> execution in attributes.</p>
        
        <div style="background: white; padding: 10px; border-radius: 4px; border: 1px solid #ccc;">
          <div style="margin-bottom: 15px;">
            <label>Execution Test:</label><br/>
            <button id="exec-test-btn" style="padding: 5px 15px; background: #27ae60; color: white; border: none; border-radius: 3px; cursor: pointer;">
              Execute {{= 'getTimestamp()' }}
            </button>
            <div id="exec-result" style="margin-top: 10px; padding: 8px; background: #f0f0f0; border-radius: 3px; font-family: monospace;">
              Result: <strong style="color: #27ae60;">${this.result}</strong>
            </div>
          </div>

          <div style="margin-bottom: 15px;">
            <label>Math Calculation:</label><br/>
            <div id="calc-result" style="margin-top: 5px; padding: 8px; background: #f0f0f0; border-radius: 3px; font-family: monospace;">
              2 + 2 = <strong id="calc-value" style="color: #27ae60;">4</strong>
            </div>
          </div>

          <div>
            <label>String Template:</label><br/>
            <div id="template-result" style="margin-top: 5px; padding: 8px; background: #f0f0f0; border-radius: 3px; font-family: monospace;">
              \`Host ID: \${$host?.id || 'unknown'}\`
            </div>
          </div>
        </div>
      </div>
    `;
  }

  connectedCallback() {
    this.execBtn?.addEventListener('click', () => {
      // Simulate {{= }} execution
      const timestamp = new Date().toISOString();
      this.result = timestamp;
      if (this.execResult) {
        this.execResult.innerHTML = `Result: <strong style="color: #27ae60;">${timestamp}</strong>`;
      }
      console.log('[Execution Test] Function executed:', timestamp);
    });

    // Math calculation test
    const calcValue = this.querySelector('#calc-value') as HTMLElement;
    if (calcValue) {
      calcValue.textContent = String(2 + 2);
    }

    // Template string test
    const templateResult = this.querySelector('#template-result') as HTMLElement;
    if (templateResult) {
      templateResult.textContent = `Host ID: ${this.id || 'execution-test-element'}`;
    }

    console.log('[Execution Test] Component initialized');
  }
}

