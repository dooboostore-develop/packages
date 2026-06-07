import {
  addEventListener,
  appendHtmlSlot,
  elementDefine,
  onConnectedBodyShadow,
  state,
  createElement,
  CreateElementConfig
} from '@dooboostore/simple-web-component';

export const tagName = 'user-route';

export interface UserRoute extends HTMLElement {}

export const UserRoute = (w: Window, data?: CreateElementConfig) => {
  return createElement<UserRoute>(w, tagName, data);
}

export default (w: Window) => {
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  @elementDefine(tagName, { window: w })
  class Imp extends w.HTMLElement implements UserRoute {
    @state
    private counter = 0;

    @addEventListener('.test-btn', 'click', { root: 'shadow' })
    onTestClick() {
      this.counter++;
      console.log('Counter increased:', this.counter);
    }

    @onConnectedBodyShadow
    render() {
      return `
      <style>
        .user-container {
          padding: 24px;
          background: white;
          border-radius: 12px;
          border: 1px solid #eee;
        }
        .test-btn {
          padding: 10px 20px;
          border-radius: 6px;
          border: 1px solid #ddd;
          background: #f0f0f0;
          cursor: pointer;
        }
        .test-btn:hover { background: #e0e0e0; }
        .counter-display {
          margin-top: 16px;
          font-size: 18px;
          font-weight: 600;
        }
      </style>
      <div class="user-container">
        <h1>User Dashboard</h1>
        <p>This page demonstrates @state and @addEventListener decorators.</p>
        
        <button class="test-btn">Click Me!</button>
        
        <div class="counter-display">
          Count: <span>{{= @counter@ }}</span>
        </div>

        <div style="margin-top: 24px; padding: 16px; background: #fff9db; border-radius: 8px;">
          <slot name="extra"></slot>
        </div>
      </div>
    `;
    }
  }
  return tagName;
};
