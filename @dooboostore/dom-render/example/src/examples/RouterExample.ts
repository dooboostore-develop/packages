import { DomRender } from '@dooboostore/dom-render/DomRender';

export class RouterExample {
  run() {
    const output = document.getElementById('output');
    if (!output) return;

    const demoDiv = document.createElement('div');
    demoDiv.className = 'demo-box';
    demoDiv.innerHTML = `
      <h3>Simple Router Example</h3>
      <div style="margin: 20px 0;">
        <button id="home-btn">Go to Home</button>
        <button id="about-btn">Go to About</button>
        <button id="contact-btn">Go to Contact</button>
      </div>
      <div id="router-content" style="padding: 20px; background: #e3f2fd; border-radius: 8px;">
        <div id="page-content">\${@this@.currentPage}$</div>
      </div>
      <div style="margin-top: 10px;">
        <strong>Current Route:</strong> <code id="current-route">\${@this@.route}$</code>
      </div>
    `;
    output.appendChild(demoDiv);

    // Initial state
    let state = {
      route: '/home',
      currentPage: 'Welcome to Home Page!'
    };

    // Initialize DomRender
    const result = new DomRender({
      rootObject: state,
      target: demoDiv,
      config: { 
        window,
        routerType: 'hash'
      }
    }, {firstUrl:'home'});
    state = result.rootObject;
    const router = result.router;
    
    // Navigation using result.router.go()
    const navigate = (route: string, content: string) => {
      state.currentPage = content;
      router.go(route);
    };

    // Button events
    demoDiv.querySelector('#home-btn')?.addEventListener('click', () => {
      navigate('/home', 'Welcome to Home Page! 🏠');
    });

    demoDiv.querySelector('#about-btn')?.addEventListener('click', () => {
      navigate('/about', 'About Us: We build awesome reactive UIs! 👥');
    });

    demoDiv.querySelector('#contact-btn')?.addEventListener('click', () => {
      navigate('/contact', 'Contact Us: hello@dooboostore.com 📧');
    });


  }
}
