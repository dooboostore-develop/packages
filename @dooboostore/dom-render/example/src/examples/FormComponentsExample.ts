import { DomRender } from '@dooboostore/dom-render/DomRender';

export class FormComponentsExample {
  run() {
    const output = document.getElementById('output');
    if (!output) return;

    const demoDiv = document.createElement('div');
    demoDiv.className = 'demo-box';
    demoDiv.innerHTML = `
      <h3>Form Components</h3>
      <p style="color: #666; margin-bottom: 20px;">
        Using <code>dr-checkbox</code> and <code>dr-select</code> for advanced form controls with fully customizable UI
      </p>
      
      <!-- Example 1: CheckBox Component -->
      <div style="margin-bottom: 30px; padding: 20px; background: #f0f9ff; border-radius: 8px;">
        <h4 style="color: #0284c7; margin-bottom: 15px;">Example 1: CheckBox with Custom UI</h4>
        
        <div style="margin-bottom: 20px;">
          <dr-checkbox 
            checked="\${@this@.agreeTerms}$" 
            change="\${(checked) => @this@.agreeTerms = checked}$">
            <dr-checkbox-unchecked>
              <div style="display: flex; align-items: center; gap: 10px; padding: 15px; background: white; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                <div style="width: 24px; height: 24px; border: 2px solid #d1d5db; border-radius: 4px; display: flex; align-items: center; justify-content: center; background: white;">
                </div>
                <span style="color: #374151; font-size: 14px;">I agree to the Terms and Conditions</span>
              </div>
            </dr-checkbox-unchecked>
            
            <dr-checkbox-checked>
              <div style="display: flex; align-items: center; gap: 10px; padding: 15px; background: #dbeafe; border: 2px solid #0284c7; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                <div style="width: 24px; height: 24px; border: 2px solid #0284c7; border-radius: 4px; display: flex; align-items: center; justify-content: center; background: #0284c7;">
                  <span style="color: white; font-weight: bold;">✓</span>
                </div>
                <span style="color: #0c4a6e; font-size: 14px; font-weight: 500;">I agree to the Terms and Conditions</span>
              </div>
            </dr-checkbox-checked>
          </dr-checkbox>
        </div>
        
        <div style="margin-bottom: 20px;">
          <dr-checkbox 
            checked="\${@this@.newsletter}$" 
            change="\${(checked) => @this@.newsletter = checked}$">
            <dr-checkbox-unchecked>
              <div style="display: flex; align-items: center; gap: 10px; padding: 15px; background: white; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer;">
                <div style="width: 24px; height: 24px; border: 2px solid #d1d5db; border-radius: 4px;"></div>
                <div>
                  <div style="color: #374151; font-size: 14px; font-weight: 500;">Subscribe to newsletter</div>
                  <div style="color: #6b7280; font-size: 12px;">Get weekly updates about new features</div>
                </div>
              </div>
            </dr-checkbox-unchecked>
            
            <dr-checkbox-checked>
              <div style="display: flex; align-items: center; gap: 10px; padding: 15px; background: #d1fae5; border: 2px solid #10b981; border-radius: 8px; cursor: pointer;">
                <div style="width: 24px; height: 24px; border: 2px solid #10b981; border-radius: 4px; background: #10b981; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-weight: bold;">✓</span>
                </div>
                <div>
                  <div style="color: #065f46; font-size: 14px; font-weight: 600;">Subscribed to newsletter ✨</div>
                  <div style="color: #047857; font-size: 12px;">You'll receive weekly updates</div>
                </div>
              </div>
            </dr-checkbox-checked>
          </dr-checkbox>
        </div>
        
        <div style="padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #0284c7;">
          <strong>Current State:</strong><br>
          <div style="margin-top: 8px; font-size: 14px;">
            Terms Agreed: <strong dr-style="{color: @this@.agreeTerms ? '#10b981' : '#ef4444'}">\${@this@.agreeTerms ? 'Yes' : 'No'}$</strong><br>
            Newsletter: <strong dr-style="{color: @this@.newsletter ? '#10b981' : '#ef4444'}">\${@this@.newsletter ? 'Subscribed' : 'Not subscribed'}$</strong>
          </div>
        </div>
      </div>

      <!-- Example 2: Multiple CheckBoxes -->
      <div style="margin-bottom: 30px; padding: 20px; background: #fef3c7; border-radius: 8px;">
        <h4 style="color: #d97706; margin-bottom: 15px;">Example 2: Feature Selection</h4>
        
        <div style="margin-bottom: 15px;">
          <dr-checkbox 
            checked="\${@this@.features.darkMode}$" 
            change="\${(checked) => @this@.features.darkMode = checked}$">
            <dr-checkbox-unchecked>
              <div style="padding: 12px; background: white; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 10px;">
                <div style="width: 20px; height: 20px; border: 2px solid #d1d5db; border-radius: 4px;"></div>
                <span>🌙 Dark Mode</span>
              </div>
            </dr-checkbox-unchecked>
            <dr-checkbox-checked>
              <div style="padding: 12px; background: #1f2937; color: white; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 10px;">
                <div style="width: 20px; height: 20px; border: 2px solid #d97706; background: #d97706; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 12px;">✓</span>
                </div>
                <span>🌙 Dark Mode (Active)</span>
              </div>
            </dr-checkbox-checked>
          </dr-checkbox>
        </div>
        
        <div style="margin-bottom: 15px;">
          <dr-checkbox 
            checked="\${@this@.features.notifications}$" 
            change="\${(checked) => @this@.features.notifications = checked}$">
            <dr-checkbox-unchecked>
              <div style="padding: 12px; background: white; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 10px;">
                <div style="width: 20px; height: 20px; border: 2px solid #d1d5db; border-radius: 4px;"></div>
                <span>🔔 Push Notifications</span>
              </div>
            </dr-checkbox-unchecked>
            <dr-checkbox-checked>
              <div style="padding: 12px; background: white; border: 2px solid #d97706; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 10px;">
                <div style="width: 20px; height: 20px; border: 2px solid #d97706; background: #d97706; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-size: 12px;">✓</span>
                </div>
                <span style="font-weight: 600;">🔔 Push Notifications</span>
              </div>
            </dr-checkbox-checked>
          </dr-checkbox>
        </div>
        
        <div style="margin-bottom: 15px;">
          <dr-checkbox 
            checked="\${@this@.features.autoSave}$" 
            change="\${(checked) => @this@.features.autoSave = checked}$">
            <dr-checkbox-unchecked>
              <div style="padding: 12px; background: white; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 10px;">
                <div style="width: 20px; height: 20px; border: 2px solid #d1d5db; border-radius: 4px;"></div>
                <span>💾 Auto Save</span>
              </div>
            </dr-checkbox-unchecked>
            <dr-checkbox-checked>
              <div style="padding: 12px; background: white; border: 2px solid #d97706; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 10px;">
                <div style="width: 20px; height: 20px; border: 2px solid #d97706; background: #d97706; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-size: 12px;">✓</span>
                </div>
                <span style="font-weight: 600;">💾 Auto Save</span>
              </div>
            </dr-checkbox-checked>
          </dr-checkbox>
        </div>
        
        <div style="margin-top: 15px; padding: 15px; background: white; border-radius: 8px;">
          <strong>Enabled Features:</strong>
          <ul style="margin-top: 8px; padding-left: 20px; font-size: 14px;">
            <li dr-if="@this@.features.darkMode">Dark Mode</li>
            <li dr-if="@this@.features.notifications">Push Notifications</li>
            <li dr-if="@this@.features.autoSave">Auto Save</li>
            <li dr-if="!@this@.features.darkMode && !@this@.features.notifications && !@this@.features.autoSave" style="color: #6b7280;">No features enabled</li>
          </ul>
        </div>
      </div>

      <!-- Example 3: Interactive CheckBox with Change Callback -->
      <div style="margin-bottom: 30px; padding: 20px; background: #f3e8ff; border-radius: 8px;">
        <h4 style="color: #9333ea; margin-bottom: 15px;">Example 3: Task Completion</h4>
        
        <div style="margin-bottom: 15px;">
          <dr-checkbox 
            checked="\${@this@.task1Done}$" 
            change="\${(checked) => @this@.onTaskChange('Task 1: Setup project', checked)}$">
            <dr-checkbox-unchecked>
              <div style="padding: 15px; background: white; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 12px; border: 2px solid #e5e7eb;">
                <div style="width: 28px; height: 28px; border: 2px solid #d1d5db; border-radius: 50%; flex-shrink: 0;"></div>
                <div style="flex: 1;">
                  <div style="font-weight: 500; color: #374151;">Setup project</div>
                  <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">Initialize repository and dependencies</div>
                </div>
              </div>
            </dr-checkbox-unchecked>
            <dr-checkbox-checked>
              <div style="padding: 15px; background: #ede9fe; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 12px; border: 2px solid #9333ea;">
                <div style="width: 28px; height: 28px; border: 2px solid #9333ea; background: #9333ea; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-weight: bold;">✓</span>
                </div>
                <div style="flex: 1;">
                  <div style="font-weight: 600; color: #6b21a8; text-decoration: line-through;">Setup project</div>
                  <div style="font-size: 12px; color: #7c3aed; margin-top: 2px;">✨ Completed!</div>
                </div>
              </div>
            </dr-checkbox-checked>
          </dr-checkbox>
        </div>
        
        <div style="margin-bottom: 15px;">
          <dr-checkbox 
            checked="\${@this@.task2Done}$" 
            change="\${(checked) => @this@.onTaskChange('Task 2: Write code', checked)}$">
            <dr-checkbox-unchecked>
              <div style="padding: 15px; background: white; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 12px; border: 2px solid #e5e7eb;">
                <div style="width: 28px; height: 28px; border: 2px solid #d1d5db; border-radius: 50%; flex-shrink: 0;"></div>
                <div style="flex: 1;">
                  <div style="font-weight: 500; color: #374151;">Write code</div>
                  <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">Implement features and tests</div>
                </div>
              </div>
            </dr-checkbox-unchecked>
            <dr-checkbox-checked>
              <div style="padding: 15px; background: #ede9fe; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 12px; border: 2px solid #9333ea;">
                <div style="width: 28px; height: 28px; border: 2px solid #9333ea; background: #9333ea; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-weight: bold;">✓</span>
                </div>
                <div style="flex: 1;">
                  <div style="font-weight: 600; color: #6b21a8; text-decoration: line-through;">Write code</div>
                  <div style="font-size: 12px; color: #7c3aed; margin-top: 2px;">✨ Completed!</div>
                </div>
              </div>
            </dr-checkbox-checked>
          </dr-checkbox>
        </div>
        
        <div style="margin-bottom: 15px;">
          <dr-checkbox 
            checked="\${@this@.task3Done}$" 
            change="\${(checked) => @this@.onTaskChange('Task 3: Deploy', checked)}$">
            <dr-checkbox-unchecked>
              <div style="padding: 15px; background: white; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 12px; border: 2px solid #e5e7eb;">
                <div style="width: 28px; height: 28px; border: 2px solid #d1d5db; border-radius: 50%; flex-shrink: 0;"></div>
                <div style="flex: 1;">
                  <div style="font-weight: 500; color: #374151;">Deploy</div>
                  <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">Ship to production</div>
                </div>
              </div>
            </dr-checkbox-unchecked>
            <dr-checkbox-checked>
              <div style="padding: 15px; background: #ede9fe; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 12px; border: 2px solid #9333ea;">
                <div style="width: 28px; height: 28px; border: 2px solid #9333ea; background: #9333ea; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-weight: bold;">✓</span>
                </div>
                <div style="flex: 1;">
                  <div style="font-weight: 600; color: #6b21a8; text-decoration: line-through;">Deploy</div>
                  <div style="font-size: 12px; color: #7c3aed; margin-top: 2px;">✨ Completed!</div>
                </div>
              </div>
            </dr-checkbox-checked>
          </dr-checkbox>
        </div>
        
        <div style="padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #9333ea;">
          <strong>Activity Log:</strong>
          <div dr-if="@this@.activityLog.length === 0" style="margin-top: 8px; color: #6b7280; font-size: 14px;">
            No activities yet
          </div>
          <ul dr-for-of="@this@.activityLog" style="margin-top: 8px; padding-left: 20px; font-size: 14px;">
            <li style="margin: 4px 0;">\${#it#}$</li>
          </ul>
        </div>
      </div>

      <!-- Example 4: Select Component -->
      <div style="margin-bottom: 30px; padding: 20px; background: #ede9fe; border-radius: 8px;">
        <h4 style="color: #7c3aed; margin-bottom: 15px;">Example 4: Custom Select Dropdown</h4>
        
        <dr-select changeSelected="\${(data) => {console.log(1); @this@.selectedCountry = data[0]}}$">
          <dr-select-summary>
            <dr-select-summary-placeholder>
              <div style="padding: 12px 16px; background: white; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #9ca3af;">Select a country...</span>
                <span style="color: #6b7280;">▼</span>
              </div>
            </dr-select-summary-placeholder>
            
            <dr-select-summary-selected>
              <div style="padding: 12px 16px; background: white; border: 2px solid #7c3aed; border-radius: 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #5b21b6; font-weight: 500;">\${@this@.selectedCountry}$</span>
                <span style="color: #7c3aed;">▼</span>
              </div>
            </dr-select-summary-selected>
          </dr-select-summary>
          
          <dr-select-body float="bottom-left" style="z-index: 1000; margin-top: 4px; min-width: 100%; background: white; border: 2px solid #e5e7eb; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); max-height: 300px; overflow-y: auto;">
            <dr-select-option value="🇺🇸 United States" selected="\${true}$">
              <dr-select-option-unselected>
                <div style="padding: 10px 16px; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='white'">
                  🇺🇸 United States
                </div>
              </dr-select-option-unselected>
              <dr-select-option-selected>
                <div style="padding: 10px 16px; background: #ede9fe; color: #5b21b6; font-weight: 600; cursor: pointer;">
                  🇺🇸 United States ✓
                </div>
              </dr-select-option-selected>
            </dr-select-option>
            
            <dr-select-option value="🇬🇧 United Kingdom">
              <dr-select-option-unselected>
                <div style="padding: 10px 16px; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='white'">
                  🇬🇧 United Kingdom
                </div>
              </dr-select-option-unselected>
              <dr-select-option-selected>
                <div style="padding: 10px 16px; background: #ede9fe; color: #5b21b6; font-weight: 600; cursor: pointer;">
                  🇬🇧 United Kingdom ✓
                </div>
              </dr-select-option-selected>
            </dr-select-option>
            
            <dr-select-option value="🇯🇵 Japan">
              <dr-select-option-unselected>
                <div style="padding: 10px 16px; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='white'">
                  🇯🇵 Japan
                </div>
              </dr-select-option-unselected>
              <dr-select-option-selected>
                <div style="padding: 10px 16px; background: #ede9fe; color: #5b21b6; font-weight: 600; cursor: pointer;">
                  🇯🇵 Japan ✓
                </div>
              </dr-select-option-selected>
            </dr-select-option>
            
            <dr-select-option value="🇰🇷 South Korea">
              <dr-select-option-unselected>
                <div style="padding: 10px 16px; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='white'">
                  🇰🇷 South Korea
                </div>
              </dr-select-option-unselected>
              <dr-select-option-selected>
                <div style="padding: 10px 16px; background: #ede9fe; color: #5b21b6; font-weight: 600; cursor: pointer;">
                  🇰🇷 South Korea ✓
                </div>
              </dr-select-option-selected>
            </dr-select-option>
            
            <dr-select-option value="🇩🇪 Germany">
              <dr-select-option-unselected>
                <div style="padding: 10px 16px; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='white'">
                  🇩🇪 Germany
                </div>
              </dr-select-option-unselected>
              <dr-select-option-selected>
                <div style="padding: 10px 16px; background: #ede9fe; color: #5b21b6; font-weight: 600; cursor: pointer;">
                  🇩🇪 Germany ✓
                </div>
              </dr-select-option-selected>
            </dr-select-option>
          </dr-select-body>
        </dr-select>
        
        <div style="margin-top: 15px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #7c3aed;">
          <strong>Selected Country:</strong> 
          <span style="color: #5b21b6; font-weight: 600;">\${@this@.selectedCountry || 'None'}$</span>
        </div>
      </div>
    `;
    output.appendChild(demoDiv);

    // Initialize state
    let state = {
      agreeTerms: false,
      newsletter: false,
      features: {
        darkMode: false,
        notifications: false,
        autoSave: true
      },
      task1Done: false,
      task2Done: false,
      task3Done: false,
      activityLog: [] as string[],
      selectedCountry: '🇺🇸 United States',
      
      onTaskChange(taskName: string, checked: boolean) {
        const timestamp = new Date().toLocaleTimeString();
        const action = checked ? 'completed' : 'uncompleted';
        state.activityLog = [...state.activityLog, `[${timestamp}] ${taskName} ${action}`];
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
