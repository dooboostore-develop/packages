import { DomRender } from '@dooboostore/dom-render/DomRender';

export class PromiseSwitchExample {
  run() {
    const output = document.getElementById('output');
    if (!output) return;

    const demoDiv = document.createElement('div');
    demoDiv.className = 'demo-box';
    demoDiv.innerHTML = `
      <h3>PromiseSwitch Component</h3>
      <p style="color: #666; margin-bottom: 20px;">
        Using <code>dr-promise-switch</code> to handle async operations with pending, fulfilled, and rejected states
      </p>
      
      <!-- Example 1: Simple API Call -->
      <div style="margin-bottom: 30px; padding: 20px; background: #f0f9ff; border-radius: 8px;">
        <h4 style="color: #0284c7; margin-bottom: 15px;">Example 1: Simulated API Call</h4>
        <div style="margin-bottom: 15px;">
          <button dr-event-click="@this@.loadUser()" style="padding: 8px 16px; margin-right: 8px; background: #0284c7; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Load User
          </button>
          <button dr-event-click="@this@.loadUserWithError()" style="padding: 8px 16px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Load User (Error)
          </button>
        </div>
        
        <dr-promise-switch data="\${@this@.userPromise}$" dr-option-component-variable-name="switch">
           [\${#switch#.state}$]
          <dr-promise-switch-default>
            <div style="padding: 15px; background: #e5e7eb; border-radius: 4px;">
              👤 Click a button to load user data 
            </div>
          </dr-promise-switch-default>
          
          <dr-promise-switch-pending>
            <div style="padding: 15px; background: #dbeafe; border-radius: 4px; display: flex; align-items: center; gap: 10px;">
              <div style="width: 20px; height: 20px; border: 3px solid #0284c7; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
              <span>Loading user data...</span>
            </div>
          </dr-promise-switch-pending>
          <dr-promise-switch-fulfilled dr-option-component-variable-name="fulfilled">
            <div style="padding: 15px; background: #d1fae5; border-radius: 4px; border-left: 4px solid #10b981;">
              <strong>✅ User Loaded Successfully!</strong><br>
              <div style="margin-top: 10px; font-size: 14px;">
                Name: <strong>\${#fulfilled#.data?.name}$</strong><br>
                Email: <strong>\${#fulfilled#.data?.email}$</strong><br>
                Role: <strong>\${#fulfilled#.data?.role}$</strong>
              </div>
            </div>
          </dr-promise-switch-fulfilled>
          
          <dr-promise-switch-rejected dr-option-component-variable-name="rejected">
            <div style="padding: 15px; background: #fee2e2; border-radius: 4px; border-left: 4px solid #ef4444;">
              <strong>❌ Error Loading User</strong><br>
              <div style="margin-top: 10px; font-size: 14px; color: #991b1b;">
                \${#rejected#.data?.message || #rejected#.data}$
              </div>
            </div>
          </dr-promise-switch-rejected>
        </dr-promise-switch>
      </div>

      <!-- Example 2: Multiple API Calls -->
      <div style="margin-bottom: 30px; padding: 20px; background: #fef3c7; border-radius: 8px;">
        <h4 style="color: #d97706; margin-bottom: 15px;">Example 2: Load Multiple Items</h4>
        <div style="margin-bottom: 15px;">
          <button dr-event-click="@this@.loadItems()" style="padding: 8px 16px; background: #d97706; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Load Items
          </button>
        </div>
        
        <dr-promise-switch data="\${@this@.itemsPromise}$">
          <dr-promise-switch-default>
            <div style="padding: 15px; background: white; border-radius: 4px;">
              📦 No items loaded yet
            </div>
          </dr-promise-switch-default>
          
          <dr-promise-switch-pending>
            <div style="padding: 15px; background: white; border-radius: 4px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 16px; height: 16px; border: 2px solid #d97706; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <span>Fetching items...</span>
              </div>
            </div>
          </dr-promise-switch-pending>
          
          <dr-promise-switch-fulfilled>
            <div style="padding: 15px; background: white; border-radius: 4px;">
              <strong>📦 Items Loaded (\${@this@.data?.length}$)</strong>
              <ul dr-for-of="@this@.data" style="margin-top: 10px; padding-left: 20px;">
                <li style="margin: 5px 0;">\${#it#.name}$ - $\${#it#.price}$</li>
              </ul>
            </div>
          </dr-promise-switch-fulfilled>
          
          <dr-promise-switch-rejected>
            <div style="padding: 15px; background: #fee2e2; border-radius: 4px;">
              ❌ Failed to load items: \${@this@.data}$
            </div>
          </dr-promise-switch-rejected>
        </dr-promise-switch>
      </div>

      <!-- Example 3: With Change Callback -->
      <div style="margin-bottom: 30px; padding: 20px; background: #f3e8ff; border-radius: 8px;">
        <h4 style="color: #9333ea; margin-bottom: 15px;">Example 3: Status Tracking</h4>
        <div style="margin-bottom: 15px;">
          <button dr-event-click="@this@.loadData()" style="padding: 8px 16px; background: #9333ea; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Load Data
          </button>
        </div>
        
        <div style="margin-bottom: 15px; padding: 10px; background: white; border-radius: 4px;">
          <strong>Status History:</strong>
          <ul dr-for-of="@this@.statusHistory" style="margin-top: 5px; padding-left: 20px; font-size: 14px;">
            <li>\${#it#}$</li>
          </ul>
        </div>
        
        <dr-promise-switch data="\${@this@.dataPromise}$" change="\${(data)=>@this@.onStatusChange(data)}$">
          <dr-promise-switch-default>
            <div style="padding: 15px; background: white; border-radius: 4px;">
              🎯 Ready to load
            </div>
          </dr-promise-switch-default>
          
          <dr-promise-switch-pending>
            <div style="padding: 15px; background: #ede9fe; border-radius: 4px;">
              ⏳ Processing...
            </div>
          </dr-promise-switch-pending>
          
          <dr-promise-switch-fulfilled>
            <div style="padding: 15px; background: #ede9fe; border-radius: 4px; border-left: 4px solid #9333ea;">
              ✨ Data: <strong>\${@this@.data}$</strong>
            </div>
          </dr-promise-switch-fulfilled>
          
          <dr-promise-switch-rejected>
            <div style="padding: 15px; background: #fee2e2; border-radius: 4px;">
              💥 Error occurred
            </div>
          </dr-promise-switch-rejected>
        </dr-promise-switch>
      </div>

      <style>
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    `;
    output.appendChild(demoDiv);

    // Simulate API calls
    const simulateUserLoad = (): Promise<any> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            name: 'John Doe',
            email: 'john@example.com',
            role: 'Developer'
          });
        }, 1500);
      });
    };

    const simulateUserLoadError = (): Promise<any> => {
      return new Promise((_, reject) => {
        setTimeout(() => {
          reject({ message: 'Network error: Unable to reach server' });
        }, 1500);
      });
    };

    const simulateItemsLoad = (): Promise<any[]> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            { name: 'Laptop', price: 1299 },
            { name: 'Mouse', price: 29 },
            { name: 'Keyboard', price: 89 },
            { name: 'Monitor', price: 399 }
          ]);
        }, 2000);
      });
    };

    const simulateDataLoad = (): Promise<string> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve('Success Data Loaded!');
        }, 1000);
      });
    };

    // Initialize state
    let state = {
      userPromise: undefined as any,
      itemsPromise: undefined as any,
      dataPromise: undefined as any,
      statusHistory: [] as string[],
      
      loadUser() {
        state.userPromise = simulateUserLoad();
      },
      
      loadUserWithError() {
        state.userPromise = simulateUserLoadError();
      },
      
      loadItems() {
        state.itemsPromise = simulateItemsLoad();
      },
      
      loadData() {
        state.statusHistory = [];
        state.dataPromise = simulateDataLoad();
      },
      
      onStatusChange(params: any) {
        const timestamp = new Date().toLocaleTimeString();
        if (params.status === 'pending') {
          state.statusHistory = [...state.statusHistory, `[${timestamp}] Status: pending`];
        } else if (params.status === 'fulfilled') {
          state.statusHistory = [...state.statusHistory, `[${timestamp}] Status: fulfilled - ${params.data}`];
        } else if (params.status === 'rejected') {
          state.statusHistory = [...state.statusHistory, `[${timestamp}] Status: rejected`];
        } else if (params.status === 'finally') {
          state.statusHistory = [...state.statusHistory, `[${timestamp}] Status: finally (completed)`];
        }
      }
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
