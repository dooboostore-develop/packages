import { DomRender } from '@dooboostore/dom-render/DomRender';
import { ComponentRouterBase } from '@dooboostore/dom-render/components/ComponentRouterBase';
import { ComponentBase } from '@dooboostore/dom-render/components/ComponentBase';
import { ComponentSet } from '@dooboostore/dom-render/components/ComponentSet';
import { OnCreateRenderDataParams } from '@dooboostore/dom-render/lifecycle';

// Page Components
class HomePage extends ComponentBase {
  message = 'Welcome to Home Page! 🏠';
  constructor() {
    super();
    console.log('HomePage constructor');
  }
  onInitRender(param: any, rawSet: any) {
    super.onInitRender(param, rawSet);
    console.log('HomePage initialized');
  }
  
  onDrThisUnBind() {
    super.onDrThisUnBind();
    console.log('HomePage destroyed');
  }
}

class AboutPage extends ComponentBase {
  title = 'About Us';
  description = 'We build awesome reactive UIs with DomRender! 👥';
  constructor() {
    super();
    console.log('AboutPage constructor');
  }
  onInitRender(param: any, rawSet: any) {
    super.onInitRender(param, rawSet);
    console.log('AboutPage initialized');
  }
  
  onDrThisUnBind() {
    super.onDrThisUnBind();
    console.log('AboutPage destroyed');
  }
}

class ContactPage extends ComponentBase {
  email = 'hello@dooboostore.com';
  phone = '+1 234 567 8900';
  constructor() {
    super();
    console.log('ContactPage constructor');
  }
  onInitRender(param: any, rawSet: any) {
    super.onInitRender(param, rawSet);
    console.log('ContactPage initialized');
  }
  
  onDrThisUnBind() {
    super.onDrThisUnBind();
    console.log('ContactPage destroyed');
  }
}

export class RouterOutletExample extends ComponentRouterBase {
  currentRoute = 'home';
  
  constructor() {
    super();
    // Set initial page
    this.navigateToHome();
  }

  onCreatedThisChild(child: any, data: OnCreateRenderDataParams) {
    super.onCreatedThisChild(child, data);
  }

  navigateToHome() {
    this.currentRoute = 'home';
    this.setChild(new ComponentSet(new HomePage(), {
      template: `
        <div style="padding: 20px; background: #e3f2fd; border-radius: 8px;">
          <h4 style="color: #1976d2; margin-bottom: 10px;">🏠 Home</h4>
          <p>\${@this@.message}$</p>
        </div>
      `
    }));
  }
  
  navigateToAbout() {
    this.currentRoute = 'about';
    this.setChild(new ComponentSet(new AboutPage(), {
      template: `
        <div style="padding: 20px; background: #f3e5f5; border-radius: 8px;">
          <h4 style="color: #7b1fa2; margin-bottom: 10px;">👥 \${@this@.title}$</h4>
          <p>\${@this@.description}$</p>
        </div>
      `
    }));
  }
  
  navigateToContact() {
    this.currentRoute = 'contact';
    this.setChild(new ComponentSet(new ContactPage(), {
      template: `
        <div style="padding: 20px; background: #e8f5e9; border-radius: 8px;">
          <h4 style="color: #388e3c; margin-bottom: 10px;">📧 Contact Us</h4>
          <p><strong>Email:</strong> \${@this@.email}$</p>
          <p><strong>Phone:</strong> \${@this@.phone}$</p>
        </div>
      `
    }));
  }
  
  onCreatedOutletDebounce(child: any) {
    console.log('RouterOutlet created with child:', child);
  }

  run() {
    const output = document.getElementById('output');
    if (!output) return;

    const demoDiv = document.createElement('div');
    demoDiv.className = 'demo-box';
    demoDiv.innerHTML = `
      <h3>RouterOutlet Example</h3>
      <p style="color: #666; margin-bottom: 20px;">
        Using <code>ComponentRouterBase</code> and <code>dr-router-outlet</code> for routing
      </p>
      
      <div style="margin-bottom: 20px;">
        <button dr-event-click="@this@.navigateToHome()" style="padding: 8px 16px; margin-right: 8px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Home
        </button>
        <button dr-event-click="@this@.navigateToAbout()" style="padding: 8px 16px; margin-right: 8px; background: #7b1fa2; color: white; border: none; border-radius: 4px; cursor: pointer;">
          About
        </button>
        <button dr-event-click="@this@.navigateToContact()" style="padding: 8px 16px; background: #388e3c; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Contact
        </button>
      </div>
      
      <div style="margin-bottom: 10px;">
        <strong>Current Route:</strong> <code style="background: #f5f5f5; padding: 2px 8px; border-radius: 4px;">\${@this@.currentRoute}$</code>
      </div>
      
      <dr-router-outlet></dr-router-outlet>
    `;
    output.appendChild(demoDiv);

    // Initialize DomRender with this RouterOutletExample as rootObject
    const result = new DomRender({
      rootObject: this,
      target: demoDiv,
      config: { window }
    });


  }
}
