import { DomEditor } from '@dooboostore/dom-editor';

export class MobileEditorExample {
  private editor?: DomEditor;

  run() {
    const output = document.getElementById('output');
    if (!output) return;

    // Create info section
    const info = document.createElement('div');
    info.className = 'demo-box';
    info.innerHTML = `
      <h4>📱 Mobile Touch Support</h4>
      <p><strong>Features:</strong></p>
      <ul>
        <li>✅ Touch-friendly drag and drop</li>
        <li>✅ Smart scroll detection (try scrolling on elements)</li>
        <li>✅ 500ms hold delay to prevent accidental drags</li>
        <li>✅ Visual feedback with vibration (on supported devices)</li>
        <li>✅ Responsive design for all screen sizes</li>
      </ul>
      <p><strong>Try this:</strong> On mobile, try scrolling over elements vs holding for 500ms to drag.</p>
    `;

    // Create controls
    const controls = document.createElement('div');
    controls.className = 'controls';
    controls.innerHTML = `
      <button id="toggle-mobile">📱 Toggle Mobile Mode</button>
      <button id="adjust-delay">⏱️ Adjust Drag Delay</button>
      <button id="test-touch">👆 Test Touch Events</button>
      <span id="delay-display">Current delay: 500ms</span>
    `;

    // Create editor container with mobile-friendly styling
    const editorContainer = document.createElement('div');
    editorContainer.className = 'editor-container';
    editorContainer.id = 'mobile-editor';
    editorContainer.style.cssText = `
      min-height: 500px;
      touch-action: manipulation;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    `;

    // Create status display
    const statusDisplay = document.createElement('div');
    statusDisplay.className = 'result';
    statusDisplay.id = 'touch-status';
    statusDisplay.textContent = 'Touch events will be displayed here...';

    output.appendChild(info);
    output.appendChild(controls);
    output.appendChild(editorContainer);
    output.appendChild(statusDisplay);

    // Initialize editor with mobile optimizations
    this.editor = new DomEditor({
      container: editorContainer,
      debug: true,
      enableMobileSupport: true,
      dragDelay: 500,
      customStyles: this.getMobileStyles(),
      initialContent: `
        <div class="draggable mobile-card">
          <h3>📱 Mobile-Friendly Card</h3>
          <p>Try scrolling over me, then hold for 500ms to drag!</p>
          <div class="draggable nested-mobile">
            <p>🎯 Nested element - I work on mobile too!</p>
          </div>
        </div>
        <div class="draggable touch-demo">
          <h4>👆 Touch Demo</h4>
          <p>Large touch targets for easy interaction</p>
        </div>
        <div class="draggable scroll-test">
          <h4>📜 Scroll Test</h4>
          <p>This element is tall enough to test scrolling behavior.</p>
          <p>Try scrolling vertically over this element.</p>
          <p>The editor should detect scroll vs drag intent.</p>
          <p>Hold for 500ms to activate drag mode.</p>
        </div>
      `
    });

    // Add event listeners
    this.setupEventListeners(controls, statusDisplay);
    this.setupTouchEventLogging(editorContainer, statusDisplay);
  }

  private setupEventListeners(controls: HTMLElement, statusDisplay: HTMLElement) {
    const toggleMobileBtn = controls.querySelector('#toggle-mobile') as HTMLButtonElement;
    const adjustDelayBtn = controls.querySelector('#adjust-delay') as HTMLButtonElement;
    const testTouchBtn = controls.querySelector('#test-touch') as HTMLButtonElement;
    const delayDisplay = controls.querySelector('#delay-display') as HTMLSpanElement;

    let currentDelay = 500;
    let mobileMode = true;

    toggleMobileBtn?.addEventListener('click', () => {
      mobileMode = !mobileMode;
      statusDisplay.textContent = `Mobile support ${mobileMode ? 'enabled' : 'disabled'}`;
      
      // Recreate editor with new mobile setting
      if (this.editor) {
        const content = this.editor.getContent();
        this.editor.destroy();
        
        const container = document.getElementById('mobile-editor');
        if (container) {
          container.innerHTML = '';
          
          this.editor = new DomEditor({
            container,
            debug: true,
            enableMobileSupport: mobileMode,
            dragDelay: currentDelay,
            customStyles: this.getMobileStyles()
          });
          
          this.editor.loadContent(content);
          this.setupTouchEventLogging(container, statusDisplay);
        }
      }
    });

    adjustDelayBtn?.addEventListener('click', () => {
      const delays = [100, 300, 500, 1000, 1500];
      const currentIndex = delays.indexOf(currentDelay);
      const nextIndex = (currentIndex + 1) % delays.length;
      currentDelay = delays[nextIndex];
      
      delayDisplay.textContent = `Current delay: ${currentDelay}ms`;
      statusDisplay.textContent = `Drag delay changed to ${currentDelay}ms`;
      
      // Recreate editor with new delay
      if (this.editor) {
        const content = this.editor.getContent();
        this.editor.destroy();
        
        const container = document.getElementById('mobile-editor');
        if (container) {
          container.innerHTML = '';
          
          this.editor = new DomEditor({
            container,
            debug: true,
            enableMobileSupport: mobileMode,
            dragDelay: currentDelay,
            customStyles: this.getMobileStyles()
          });
          
          this.editor.loadContent(content);
          this.setupTouchEventLogging(container, statusDisplay);
        }
      }
    });

    testTouchBtn?.addEventListener('click', () => {
      statusDisplay.textContent = 'Touch test: Try touching and dragging elements to see events logged here.';
    });
  }

  private setupTouchEventLogging(container: HTMLElement, statusDisplay: HTMLElement) {
    let touchStartTime = 0;
    let touchStartPos = { x: 0, y: 0 };

    container.addEventListener('touchstart', (e) => {
      touchStartTime = Date.now();
      const touch = e.touches[0];
      touchStartPos = { x: touch.clientX, y: touch.clientY };
      statusDisplay.textContent = `Touch start at (${Math.round(touch.clientX)}, ${Math.round(touch.clientY)})`;
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - touchStartPos.x);
      const deltaY = Math.abs(touch.clientY - touchStartPos.y);
      const duration = Date.now() - touchStartTime;
      
      const isScroll = deltaY > 15 && deltaY > deltaX * 1.5;
      statusDisplay.textContent = `Touch move: Δx=${Math.round(deltaX)}, Δy=${Math.round(deltaY)}, ${duration}ms ${isScroll ? '(scroll detected)' : ''}`;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      const duration = Date.now() - touchStartTime;
      statusDisplay.textContent = `Touch end after ${duration}ms`;
    }, { passive: true });
  }

  private getMobileStyles(): string {
    return `
      .mobile-card {
        padding: 20px;
        min-height: 80px;
        font-size: 16px;
        line-height: 1.6;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px;
        border: none;
      }
      
      .nested-mobile {
        background: rgba(255,255,255,0.2);
        margin-top: 15px;
        padding: 15px;
        border-radius: 8px;
        border: 1px solid rgba(255,255,255,0.3);
      }
      
      .touch-demo {
        padding: 25px;
        min-height: 100px;
        background: #28a745;
        color: white;
        border-radius: 12px;
        border: none;
        font-size: 18px;
        text-align: center;
      }
      
      .scroll-test {
        padding: 20px;
        min-height: 200px;
        background: #17a2b8;
        color: white;
        border-radius: 12px;
        border: none;
        line-height: 1.8;
      }
      
      /* Mobile-specific optimizations */
      @media (max-width: 768px) {
        .dom-editor .draggable {
          min-height: 60px;
          padding: 20px;
          font-size: 16px;
          margin: 15px 10px;
        }
        
        .dom-editor .action-btn {
          min-width: 44px;
          min-height: 44px;
          font-size: 16px;
          padding: 12px;
        }
        
        .dom-editor .property-panel {
          font-size: 16px;
        }
        
        .dom-editor .property-panel input {
          min-height: 44px;
          font-size: 16px;
        }
      }
      
      /* Touch feedback */
      .dom-editor .draggable:active {
        transform: scale(0.98);
        transition: transform 0.1s ease;
      }
    `;
  }

  destroy() {
    if (this.editor) {
      this.editor.destroy();
      this.editor = undefined;
    }
  }
}