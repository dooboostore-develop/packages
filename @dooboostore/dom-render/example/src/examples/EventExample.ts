import { DomRender } from '@dooboostore/dom-render/DomRender';

export class EventExample {
  run() {
    const output = document.getElementById('output');
    if (!output) return;

    const demoDiv = document.createElement('div');
    demoDiv.className = 'demo-box';
    demoDiv.innerHTML = `
      <h3>Event Handling - dr-event-*</h3>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
        <!-- Mouse Events -->
        <div style="border: 2px solid #3b82f6; padding: 15px; border-radius: 8px;">
          <h4 style="color: #3b82f6;">Mouse Events</h4>
          <div 
            id="mouse-area" 
            dr-event-click="@this@.logEvent('click', $event)"
            dr-event-dblclick="@this@.logEvent('dblclick', $event)"
            dr-event-mouseenter="@this@.logEvent('mouseenter', $event)"
            dr-event-mouseleave="@this@.logEvent('mouseleave', $event)"
            style="padding: 30px; background: #dbeafe; border-radius: 8px; text-align: center; cursor: pointer; user-select: none;">
            Click, Double-click, or Hover me!
          </div>
          <div style="margin-top: 10px; font-size: 12px; color: #666;">
            Last event: <strong id="mouse-event">\${@this@.lastMouseEvent}$</strong>
          </div>
        </div>

        <!-- Keyboard Events -->
        <div style="border: 2px solid #10b981; padding: 15px; border-radius: 8px;">
          <h4 style="color: #10b981;">Keyboard Events</h4>
          <input 
            type="text" 
            id="keyboard-input"
            dr-event-keydown="@this@.logEvent('keydown', $event)"
            dr-event-keyup="@this@.logEvent('keyup', $event)"
            placeholder="Type something..."
            style="width: 100%; padding: 10px; border: 1px solid #10b981; border-radius: 4px;">
          <div style="margin-top: 10px; font-size: 12px; color: #666;">
            Last key: <strong id="key-event">\${@this@.lastKey}$</strong><br>
            Event: <strong>\${@this@.lastKeyEvent}$</strong>
          </div>
        </div>

        <!-- Form Events -->
        <div style="border: 2px solid #f59e0b; padding: 15px; border-radius: 8px;">
          <h4 style="color: #f59e0b;">Form Events</h4>
          <input 
            type="text" 
            id="form-input"
            dr-event-input="@this@.handleInput($event)"
            dr-event-change="@this@.handleChange($event)"
            dr-event-focus="@this@.logEvent('focus', $event)"
            dr-event-blur="@this@.logEvent('blur', $event)"
            placeholder="Type and blur..."
            style="width: 100%; padding: 10px; border: 1px solid #f59e0b; border-radius: 4px; margin-bottom: 10px;">
          <div style="font-size: 12px; color: #666;">
            Input value: <strong>\${@this@.inputValue}$</strong><br>
            Last form event: <strong>\${@this@.lastFormEvent}$</strong>
          </div>
        </div>

        <!-- Toggle & Dialog Events -->
        <div style="border: 2px solid #8b5cf6; padding: 15px; border-radius: 8px;">
          <h4 style="color: #8b5cf6;">Toggle & Dialog Events</h4>
          <details dr-event-toggle="@this@.handleToggle($event)" style="margin-bottom: 15px;">
            <summary style="cursor: pointer; padding: 8px; background: #ede9fe; border-radius: 4px;">
              Click to toggle details
            </summary>
            <div style="padding: 10px; margin-top: 10px; background: #f5f3ff; border-radius: 4px;">
              This is the detail content!
            </div>
          </details>
          <button 
            dr-event-click="@this@.openDialog()"
            style="padding: 8px 16px; background: #8b5cf6; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Open Dialog
          </button>
          <dialog 
            id="example-dialog" 
            dr-event-close="@this@.handleDialogClose($event)"
            style="padding: 20px; border: 2px solid #8b5cf6; border-radius: 8px;">
            <p>This is a dialog with close event!</p>
            <button 
              dr-event-click="@this@.closeDialog()"
              style="padding: 6px 12px; background: #8b5cf6; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Close
            </button>
          </dialog>
          <div style="margin-top: 10px; font-size: 12px; color: #666;">
            Toggle state: <strong>\${@this@.detailsOpen ? 'Open' : 'Closed'}$</strong><br>
            Dialog closed: <strong>\${@this@.dialogClosedCount}$ times</strong><br>
            Last event: <strong>\${@this@.lastToggleEvent}$</strong>
          </div>
        </div>
      </div>
    `;
    output.appendChild(demoDiv);

    // Initial state
    let state = {
      lastMouseEvent: 'none',
      lastKey: 'none',
      lastKeyEvent: 'none',
      lastFormEvent: 'none',
      lastToggleEvent: 'none',
      inputValue: '',
      detailsOpen: false,
      dialogClosedCount: 0,

      logEvent(type: string, event: Event) {
        // Update specific event type trackers
        if (type === 'click' || type === 'dblclick' || type === 'mouseenter' || type === 'mouseleave') {
          this.lastMouseEvent = type;
        } else if (type === 'keydown' || type === 'keyup') {
          this.lastKeyEvent = type;
          if (event instanceof KeyboardEvent) {
            this.lastKey = event.key;
          }
        } else if (type === 'input' || type === 'change' || type === 'focus' || type === 'blur') {
          this.lastFormEvent = type;
        } else if (type === 'toggle' || type === 'dialog-close') {
          this.lastToggleEvent = type;
        }
      },

      handleInput(event: Event) {
        if (event.target instanceof HTMLInputElement) {
          this.inputValue = event.target.value;
        }
        this.logEvent('input', event);
      },

      handleChange(event: Event) {
        this.logEvent('change', event);
      },

      handleToggle(event: Event) {
        if (event.target instanceof HTMLDetailsElement) {
          this.detailsOpen = event.target.open;
        }
        this.lastToggleEvent = 'toggle';
        this.logEvent('toggle', event);
      },

      openDialog() {
        const dialog = demoDiv.querySelector('#example-dialog') as HTMLDialogElement;
        dialog?.showModal();
      },

      closeDialog() {
        const dialog = demoDiv.querySelector('#example-dialog') as HTMLDialogElement;
        dialog?.close();
      },

      handleDialogClose(event: Event) {
        this.dialogClosedCount++;
        this.lastToggleEvent = 'dialog-close';
        this.logEvent('dialog-close', event);
      }
    };

    // Initialize DomRender
    const result = new DomRender({
      rootObject: state,
      target: demoDiv,
      config: { window }
    });
    state = result.rootObject;

 ;
  }
}
