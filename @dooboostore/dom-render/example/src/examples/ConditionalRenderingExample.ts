import { DomRender } from '@dooboostore/dom-render/DomRender';

export class ConditionalRenderingExample {
  run() {
    const output = document.getElementById('output');
    if (!output) return;

    const demoDiv = document.createElement('div');
    demoDiv.className = 'demo-box';
    demoDiv.innerHTML = `
      <h3>Conditional Rendering</h3>
      <p style="color: #666; margin-bottom: 20px;">
        Using <code>dr-if</code> for conditional rendering
      </p>
      
      <!-- Example 1: Simple Toggle -->
      <div style="margin-bottom: 30px; padding: 20px; background: #f0f9ff; border-radius: 8px;">
        <h4 style="color: #0284c7; margin-bottom: 15px;">Simple Toggle</h4>
        <button dr-event-click="@this@.showMessage = !@this@.showMessage" style="padding: 8px 16px; background: #0284c7; color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 10px;">
          Toggle Message
        </button>
        <div dr-if="@this@.showMessage" style="padding: 15px; background: white; border-left: 4px solid #0284c7; margin-top: 10px;">
          <strong>Hello!</strong> This message appears when showMessage is true.
        </div>
        <div style="margin-top: 10px; font-size: 14px; color: #666;">
          Current state: <strong>\${@this@.showMessage ? 'Visible' : 'Hidden'}$</strong>
        </div>
      </div>

      <!-- Example 2: Multiple Conditions -->
      <div style="margin-bottom: 30px; padding: 20px; background: #fef3c7; border-radius: 8px;">
        <h4 style="color: #d97706; margin-bottom: 15px;">Multiple Conditions</h4>
        <div style="margin-bottom: 15px;">
          <button dr-event-click="@this@.status = 'idle'" style="padding: 6px 12px; margin-right: 8px; background: #94a3b8; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Idle
          </button>
          <button dr-event-click="@this@.status = 'loading'" style="padding: 6px 12px; margin-right: 8px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Loading
          </button>
          <button dr-event-click="@this@.status = 'success'" style="padding: 6px 12px; margin-right: 8px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Success
          </button>
          <button dr-event-click="@this@.status = 'error'" style="padding: 6px 12px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Error
          </button>
        </div>
        
        <div dr-if="@this@.status === 'idle'" style="padding: 15px; background: white; border-left: 4px solid #94a3b8; margin-top: 10px;">
          ⏸️ System is idle
        </div>
        <div dr-if="@this@.status === 'loading'" style="padding: 15px; background: white; border-left: 4px solid #3b82f6; margin-top: 10px;">
          ⏳ Loading data...
        </div>
        <div dr-if="@this@.status === 'success'" style="padding: 15px; background: white; border-left: 4px solid #10b981; margin-top: 10px;">
          ✅ Data loaded successfully!
        </div>
        <div dr-if="@this@.status === 'error'" style="padding: 15px; background: white; border-left: 4px solid #ef4444; margin-top: 10px;">
          ❌ Error loading data
        </div>
        
        <div style="margin-top: 10px; font-size: 14px; color: #666;">
          Current status: <strong>\${@this@.status}$</strong>
        </div>
      </div>

      <!-- Example 3: Nested Conditions -->
      <div style="margin-bottom: 30px; padding: 20px; background: #f3e8ff; border-radius: 8px;">
        <h4 style="color: #9333ea; margin-bottom: 15px;">Nested Conditions</h4>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 10px;">
            <input type="checkbox" dr-event-change="@this@.isLoggedIn = $event.target.checked" style="margin-right: 8px;">
            Logged In
          </label>
          <label style="display: block;">
            <input type="checkbox" dr-event-change="@this@.isPremium = $event.target.checked" style="margin-right: 8px;">
            Premium Member
          </label>
        </div>
        
        <div dr-if="@this@.isLoggedIn" style="padding: 15px; background: white; border-radius: 4px; margin-top: 10px;">
          <div style="margin-bottom: 10px;">
            👤 Welcome back!
          </div>
          <div dr-if="@this@.isPremium" style="padding: 10px; background: #fef3c7; border-radius: 4px;">
            ⭐ Premium features unlocked!
          </div>
          <div dr-if="!@this@.isPremium" style="padding: 10px; background: #e5e7eb; border-radius: 4px;">
            Upgrade to Premium for more features
          </div>
        </div>
        <div dr-if="!@this@.isLoggedIn" style="padding: 15px; background: white; border-radius: 4px; margin-top: 10px;">
          🔒 Please log in to continue
        </div>
      </div>
    `;
    output.appendChild(demoDiv);

    // Initialize state
    let state = {
      showMessage: false,
      status: 'idle',
      isLoggedIn: false,
      isPremium: false
    };

    // Initialize DomRender
    const result = new DomRender({
      rootObject: state,
      target: demoDiv,
      config: { window }
    });
    state = result.rootObject;

  }
}
