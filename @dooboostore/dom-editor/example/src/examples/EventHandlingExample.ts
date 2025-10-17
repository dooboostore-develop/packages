import { DomEditor } from '@dooboostore/dom-editor';

export class EventHandlingExample {
  private editor?: DomEditor;
  private eventLog: string[] = [];

  run() {
    const output = document.getElementById('output');
    if (!output) return;

    const info = document.createElement('div');
    info.className = 'demo-box';
    info.innerHTML = `
      <h4>⚡ Event Handling Demo</h4>
      <p>This example demonstrates various editor events and interactions:</p>
      <ul>
        <li>Element selection/deselection</li>
        <li>Drag and drop events</li>
        <li>Content changes</li>
        <li>Custom event handling</li>
      </ul>
    `;

    const controls = document.createElement('div');
    controls.className = 'controls';
    controls.innerHTML = `
      <button id="clear-log">🗑️ Clear Log</button>
      <button id="trigger-custom">🎯 Trigger Custom Event</button>
      <button id="add-interactive">➕ Add Interactive Element</button>
    `;

    const editorContainer = document.createElement('div');
    editorContainer.className = 'editor-container';
    editorContainer.id = 'event-editor';

    const eventLogArea = document.createElement('div');
    eventLogArea.className = 'code-output';
    eventLogArea.id = 'event-log';
    eventLogArea.innerHTML = '<strong>Event Log:</strong><br>Events will appear here...';

    output.appendChild(info);
    output.appendChild(controls);
    output.appendChild(editorContainer);
    output.appendChild(eventLogArea);

    this.editor = new DomEditor({
      container: editorContainer,
      debug: true,
      initialContent: `
        <div class="draggable event-demo">
          <h3>🎯 Interactive Element</h3>
          <p>Click me, drag me, or select me to see events!</p>
          <button onclick="alert('Button clicked!')">Click Me!</button>
        </div>
        <div class="draggable hover-demo">
          <h4>👆 Hover Demo</h4>
          <p>Hover over me to see mouse events!</p>
        </div>
      `
    });

    this.setupEventHandling(controls, eventLogArea);
  }

  private setupEventHandling(controls: HTMLElement, eventLogArea: HTMLElement) {
    // Monitor editor container for various events
    const editorContainer = document.getElementById('event-editor');
    if (editorContainer) {
      this.addEventListeners(editorContainer, eventLogArea);
    }

    // Setup control buttons
    controls.addEventListener('click', (e) => {
      const target = e.target as HTMLButtonElement;
      const id = target.id;

      switch (id) {
        case 'clear-log':
          this.clearEventLog(eventLogArea);
          break;
        case 'trigger-custom':
          this.triggerCustomEvent(editorContainer!);
          break;
        case 'add-interactive':
          this.addInteractiveElement();
          break;
      }
    });
  }

  private addEventListeners(container: HTMLElement, logArea: HTMLElement) {
    // Selection events
    container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('draggable')) {
        this.logEvent('Element Selected', `${target.tagName.toLowerCase()}#${target.id || 'no-id'}`, logArea);
      }
    });

    // Drag events
    container.addEventListener('dragstart', (e) => {
      const target = e.target as HTMLElement;
      this.logEvent('Drag Start', `${target.tagName.toLowerCase()}#${target.id || 'no-id'}`, logArea);
    });

    container.addEventListener('dragend', (e) => {
      const target = e.target as HTMLElement;
      this.logEvent('Drag End', `${target.tagName.toLowerCase()}#${target.id || 'no-id'}`, logArea);
    });

    container.addEventListener('dragover', (e) => {
      e.preventDefault();
      // Throttle dragover events to avoid spam
      if (Math.random() < 0.1) {
        this.logEvent('Drag Over', 'Element being dragged over', logArea);
      }
    });

    container.addEventListener('drop', (e) => {
      this.logEvent('Drop', 'Element dropped', logArea);
    });

    // Touch events (mobile)
    container.addEventListener('touchstart', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('draggable')) {
        this.logEvent('Touch Start', `${target.tagName.toLowerCase()}#${target.id || 'no-id'}`, logArea);
      }
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      this.logEvent('Touch End', 'Touch interaction ended', logArea);
    }, { passive: true });

    // Mouse events for hover demo
    container.addEventListener('mouseenter', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('hover-demo')) {
        this.logEvent('Mouse Enter', 'Hover demo element', logArea);
      }
    });

    container.addEventListener('mouseleave', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('hover-demo')) {
        this.logEvent('Mouse Leave', 'Hover demo element', logArea);
      }
    });

    // Custom events
    container.addEventListener('custom-editor-event', (e: any) => {
      this.logEvent('Custom Event', e.detail.message, logArea);
    });
  }

  private logEvent(eventType: string, details: string, logArea: HTMLElement) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${eventType}: ${details}`;
    
    this.eventLog.unshift(logEntry);
    
    // Keep only last 20 events
    if (this.eventLog.length > 20) {
      this.eventLog = this.eventLog.slice(0, 20);
    }

    this.updateEventLog(logArea);
  }

  private updateEventLog(logArea: HTMLElement) {
    const logHtml = this.eventLog
      .map(entry => `<div style="padding: 2px 0; border-bottom: 1px solid #eee;">${entry}</div>`)
      .join('');
    
    logArea.innerHTML = `<strong>Event Log (${this.eventLog.length}/20):</strong><br>${logHtml}`;
  }

  private clearEventLog(logArea: HTMLElement) {
    this.eventLog = [];
    logArea.innerHTML = '<strong>Event Log:</strong><br>Events will appear here...';
  }

  private triggerCustomEvent(container: HTMLElement) {
    const customEvent = new CustomEvent('custom-editor-event', {
      detail: {
        message: 'Custom event triggered manually!',
        timestamp: Date.now()
      }
    });
    
    container.dispatchEvent(customEvent);
  }

  private addInteractiveElement() {
    if (!this.editor) return;

    const timestamp = Date.now();
    const newElement = `
      <div class="draggable interactive-element" id="interactive-${timestamp}">
        <h4>🎮 Interactive Element #${timestamp}</h4>
        <p>I have custom event handlers!</p>
        <button onclick="this.parentElement.style.backgroundColor = this.parentElement.style.backgroundColor === 'lightblue' ? '' : 'lightblue'">
          Toggle Background
        </button>
        <button onclick="this.parentElement.classList.toggle('animated')">
          Toggle Animation
        </button>
      </div>
    `;

    const currentContent = this.editor.getContent();
    this.editor.loadContent(currentContent + newElement);

    // Add CSS for animation
    const style = document.createElement('style');
    style.textContent = `
      .animated {
        animation: pulse 1s infinite;
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
  }

  destroy() {
    if (this.editor) {
      this.editor.destroy();
      this.editor = undefined;
    }
    this.eventLog = [];
  }
}