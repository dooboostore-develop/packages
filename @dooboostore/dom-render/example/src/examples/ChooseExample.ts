import { DomRender } from '@dooboostore/dom-render/DomRender';

export class ChooseExample {
  run() {
    const output = document.getElementById('output');
    if (!output) return;

    const demoDiv = document.createElement('div');
    demoDiv.className = 'demo-box';
    demoDiv.innerHTML = `
      <h3>Choose Component</h3>
      <p style="color: #666; margin-bottom: 20px;">
        Using <code>dr-choose</code> for switch-case style conditional rendering
      </p>
      
      <!-- Example 1: Simple Choose (like switch-case) -->
      <div style="margin-bottom: 30px; padding: 20px; background: #f0f9ff; border-radius: 8px;">
        <h4 style="color: #0284c7; margin-bottom: 15px;">Example 1: Status Display</h4>
        <div style="margin-bottom: 15px;">
          <button dr-event-click="@this@.orderStatus = 'pending'" style="padding: 6px 12px; margin-right: 8px; background: #f59e0b; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
            Pending
          </button>
          <button dr-event-click="@this@.orderStatus = 'processing'" style="padding: 6px 12px; margin-right: 8px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
            Processing
          </button>
          <button dr-event-click="@this@.orderStatus = 'shipped'" style="padding: 6px 12px; margin-right: 8px; background: #8b5cf6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
            Shipped
          </button>
          <button dr-event-click="@this@.orderStatus = 'delivered'" style="padding: 6px 12px; margin-right: 8px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
            Delivered
          </button>
          <button dr-event-click="@this@.orderStatus = 'cancelled'" style="padding: 6px 12px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
            Cancelled
          </button>
        </div>
        
        <dr-choose data="\${@this@.orderStatus}$">
          <dr-choose-when test="\${(status) => status === 'pending'}$">
            <div style="padding: 20px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
              <div style="font-size: 24px; margin-bottom: 8px;">⏳</div>
              <strong style="color: #92400e;">Order Pending</strong>
              <p style="margin-top: 8px; color: #78350f; font-size: 14px;">Your order is waiting to be processed.</p>
            </div>
          </dr-choose-when>
          
          <dr-choose-when test="\${(status) => status === 'processing'}$">
            <div style="padding: 20px; background: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 4px;">
              <div style="font-size: 24px; margin-bottom: 8px;">🔄</div>
              <strong style="color: #1e40af;">Processing Order</strong>
              <p style="margin-top: 8px; color: #1e3a8a; font-size: 14px;">We're preparing your order for shipment.</p>
            </div>
          </dr-choose-when>
          
          <dr-choose-when test="\${(status) => status === 'shipped'}$">
            <div style="padding: 20px; background: #ede9fe; border-left: 4px solid #8b5cf6; border-radius: 4px;">
              <div style="font-size: 24px; margin-bottom: 8px;">📦</div>
              <strong style="color: #6b21a8;">Order Shipped</strong>
              <p style="margin-top: 8px; color: #581c87; font-size: 14px;">Your order is on its way!</p>
            </div>
          </dr-choose-when>
          
          <dr-choose-when test="\${(status) => status === 'delivered'}$">
            <div style="padding: 20px; background: #d1fae5; border-left: 4px solid #10b981; border-radius: 4px;">
              <div style="font-size: 24px; margin-bottom: 8px;">✅</div>
              <strong style="color: #065f46;">Order Delivered</strong>
              <p style="margin-top: 8px; color: #064e3b; font-size: 14px;">Your order has been successfully delivered!</p>
            </div>
          </dr-choose-when>
          
          <dr-choose-when test="\${(status) => status === 'cancelled'}$">
            <div style="padding: 20px; background: #fee2e2; border-left: 4px solid #ef4444; border-radius: 4px;">
              <div style="font-size: 24px; margin-bottom: 8px;">❌</div>
              <strong style="color: #991b1b;">Order Cancelled</strong>
              <p style="margin-top: 8px; color: #7f1d1d; font-size: 14px;">This order has been cancelled.</p>
            </div>
          </dr-choose-when>
          
          <dr-choose-other-wise>
            <div style="padding: 20px; background: #f3f4f6; border-left: 4px solid #6b7280; border-radius: 4px;">
              <strong style="color: #374151;">Unknown Status</strong>
              <p style="margin-top: 8px; color: #4b5563; font-size: 14px;">Status: \${@this@.data}$</p>
            </div>
          </dr-choose-other-wise>
        </dr-choose>
        
        <div style="margin-top: 15px; font-size: 14px; color: #666;">
          Current Status: <strong>\${@this@.orderStatus}$</strong>
        </div>
      </div>

      <!-- Example 2: User Role Based Content -->
      <div style="margin-bottom: 30px; padding: 20px; background: #fef3c7; border-radius: 8px;">
        <h4 style="color: #d97706; margin-bottom: 15px;">Example 2: Role-Based Dashboard</h4>
        <div style="margin-bottom: 15px;">
          <button dr-event-click="@this@.userRole = 'admin'" style="padding: 6px 12px; margin-right: 8px; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
            Admin
          </button>
          <button dr-event-click="@this@.userRole = 'moderator'" style="padding: 6px 12px; margin-right: 8px; background: #d97706; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
            Moderator
          </button>
          <button dr-event-click="@this@.userRole = 'user'" style="padding: 6px 12px; margin-right: 8px; background: #059669; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
            User
          </button>
          <button dr-event-click="@this@.userRole = 'guest'" style="padding: 6px 12px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
            Guest
          </button>
        </div>
        
        <dr-choose data="\${@this@.userRole}$">
          <dr-choose-when test="\${(role) => role === 'admin'}$">
            <div style="padding: 20px; background: white; border-radius: 8px; border: 2px solid #dc2626;">
              <h5 style="color: #dc2626; margin-bottom: 10px;">🔐 Admin Dashboard</h5>
              <ul style="padding-left: 20px; color: #374151;">
                <li>User Management</li>
                <li>System Settings</li>
                <li>Analytics & Reports</li>
                <li>Database Access</li>
                <li>Security Logs</li>
              </ul>
            </div>
          </dr-choose-when>
          
          <dr-choose-when test="\${(role) => role === 'moderator'}$">
            <div style="padding: 20px; background: white; border-radius: 8px; border: 2px solid #d97706;">
              <h5 style="color: #d97706; margin-bottom: 10px;">⚡ Moderator Dashboard</h5>
              <ul style="padding-left: 20px; color: #374151;">
                <li>Content Moderation</li>
                <li>User Reports</li>
                <li>Community Guidelines</li>
                <li>Ban/Unban Users</li>
              </ul>
            </div>
          </dr-choose-when>
          
          <dr-choose-when test="\${(role) => role === 'user'}$">
            <div style="padding: 20px; background: white; border-radius: 8px; border: 2px solid #059669;">
              <h5 style="color: #059669; margin-bottom: 10px;">👤 User Dashboard</h5>
              <ul style="padding-left: 20px; color: #374151;">
                <li>My Profile</li>
                <li>My Content</li>
                <li>Settings</li>
                <li>Messages</li>
              </ul>
            </div>
          </dr-choose-when>
          
          <dr-choose-other-wise>
            <div style="padding: 20px; background: white; border-radius: 8px; border: 2px solid #6b7280;">
              <h5 style="color: #6b7280; margin-bottom: 10px;">🔒 Guest View</h5>
              <p style="color: #4b5563;">Please log in to access your dashboard.</p>
            </div>
          </dr-choose-other-wise>
        </dr-choose>
      </div>

      <!-- Example 3: Number Range Conditions -->
      <div style="margin-bottom: 30px; padding: 20px; background: #f3e8ff; border-radius: 8px;">
        <h4 style="color: #9333ea; margin-bottom: 15px;">Example 3: Score Grade System</h4>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 8px; color: #4b5563;">
            Score: <strong>\${@this@.score}$</strong>
          </label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            dr-value-link="@this@.score"
            style="width: 100%; margin-bottom: 10px;"
          >
        </div>
        
        <dr-choose data="\${@this@.score}$">
          <dr-choose-when test="\${(score) => score >= 90}$">
            <div style="padding: 20px; background: #d1fae5; border-left: 4px solid #10b981; border-radius: 4px;">
              <div style="display: flex; align-items: center; gap: 15px;">
                <div style="font-size: 48px;">🏆</div>
                <div>
                  <div style="font-size: 32px; font-weight: bold; color: #065f46;">A</div>
                  <div style="color: #047857;">Excellent Work!</div>
                </div>
              </div>
            </div>
          </dr-choose-when>
          
          <dr-choose-when test="\${(score) => score >= 80}$">
            <div style="padding: 20px; background: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 4px;">
              <div style="display: flex; align-items: center; gap: 15px;">
                <div style="font-size: 48px;">⭐</div>
                <div>
                  <div style="font-size: 32px; font-weight: bold; color: #1e40af;">B</div>
                  <div style="color: #1e3a8a;">Great Job!</div>
                </div>
              </div>
            </div>
          </dr-choose-when>
          
          <dr-choose-when test="\${(score) => score >= 70}$">
            <div style="padding: 20px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
              <div style="display: flex; align-items: center; gap: 15px;">
                <div style="font-size: 48px;">👍</div>
                <div>
                  <div style="font-size: 32px; font-weight: bold; color: #92400e;">C</div>
                  <div style="color: #78350f;">Good Work!</div>
                </div>
              </div>
            </div>
          </dr-choose-when>
          
          <dr-choose-when test="\${(score) => score >= 60}$">
            <div style="padding: 20px; background: #ffe4e6; border-left: 4px solid #f43f5e; border-radius: 4px;">
              <div style="display: flex; align-items: center; gap: 15px;">
                <div style="font-size: 48px;">📚</div>
                <div>
                  <div style="font-size: 32px; font-weight: bold; color: #9f1239;">D</div>
                  <div style="color: #881337;">Keep Trying!</div>
                </div>
              </div>
            </div>
          </dr-choose-when>
          
          <dr-choose-other-wise>
            <div style="padding: 20px; background: #fee2e2; border-left: 4px solid #ef4444; border-radius: 4px;">
              <div style="display: flex; align-items: center; gap: 15px;">
                <div style="font-size: 48px;">💪</div>
                <div>
                  <div style="font-size: 32px; font-weight: bold; color: #991b1b;">F</div>
                  <div style="color: #7f1d1d;">Need Improvement!</div>
                </div>
              </div>
            </div>
          </dr-choose-other-wise>
        </dr-choose>
      </div>
    `;
    output.appendChild(demoDiv);

    // Initialize state
    let state = {
      orderStatus: 'pending',
      userRole: 'guest',
      score: 75
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
