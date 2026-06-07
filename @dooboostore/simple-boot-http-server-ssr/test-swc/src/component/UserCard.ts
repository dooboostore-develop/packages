import {
  elementDefine,
  onConnectedBodyShadow,
  attribute,
  createElement,
  CreateElementConfig
} from '@dooboostore/simple-web-component';

export const tagName = 'user-card';

export interface UserCard extends HTMLElement {
  name?: string;
  email?: string;
}

export const UserCard = (w: Window, data?: CreateElementConfig) => {
  return createElement<UserCard>(w, tagName, data);
}

export default (w: Window) => {
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  @elementDefine(tagName, { window: w })
  class Imp extends w.HTMLElement implements UserCard {
    @attribute
    name?: string;

    @attribute
    email?: string;

    @onConnectedBodyShadow
    render() {
      return `
        <style>
          :host {
            display: block;
            padding: 16px;
            margin: 8px 0;
            border-radius: 8px;
            background: #fff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          }
          h3 { margin: 0 0 8px 0; color: #333; }
          p { margin: 0; color: #666; font-size: 14px; }
        </style>
        <div>
          <h3>User: ${this.name || 'Anonymous'}</h3>
          <p>Email: ${this.email || 'N/A'}</p>
        </div>
      `;
    }
  }

  return tagName;
}
