import { DomEditor } from '@dooboostore/dom-editor';

export class AdvancedFeaturesExample {
  private editor?: DomEditor;

  run() {
    const output = document.getElementById('output');
    if (!output) return;

    const info = document.createElement('div');
    info.className = 'demo-box';
    info.innerHTML = `
      <h4>🚀 Advanced Features Demo</h4>
      <p>This example showcases advanced DOM Editor capabilities:</p>
      <ul>
        <li>Property panel for editing attributes</li>
        <li>Nested element management</li>
        <li>Animation effects</li>
        <li>Complex element structures</li>
        <li>Real-time property updates</li>
      </ul>
      <p><strong>Try:</strong> Click on elements to select them and see the property panel!</p>
    `;

    const controls = document.createElement('div');
    controls.className = 'controls';
    controls.innerHTML = `
      <button id="add-complex">🏗️ Add Complex Structure</button>
      <button id="add-animated">✨ Add Animated Element</button>
      <button id="add-nested">📦 Add Nested Container</button>
      <button id="show-structure">🔍 Show Structure</button>
    `;

    const editorContainer = document.createElement('div');
    editorContainer.className = 'editor-container';
    editorContainer.id = 'advanced-editor';

    const structureView = document.createElement('div');
    structureView.className = 'code-output';
    structureView.innerHTML = '<strong>Element Structure:</strong><br>Select elements to see their properties and structure.';

    output.appendChild(info);
    output.appendChild(controls);
    output.appendChild(editorContainer);
    output.appendChild(structureView);

    this.editor = new DomEditor({
      container: editorContainer,
      debug: false,
      customStyles: this.getAdvancedStyles(),
      initialContent: `
        <div class="draggable card-component" data-component="card" data-theme="primary">
          <header class="draggable card-header">
            <h3>🎯 Advanced Card Component</h3>
            <span class="badge">Featured</span>
          </header>
          <div class="draggable card-body">
            <p>This is a complex component with multiple nested elements and custom attributes.</p>
            <div class="draggable button-group">
              <button class="btn primary">Primary</button>
              <button class="btn secondary">Secondary</button>
            </div>
          </div>
          <footer class="draggable card-footer">
            <small>Last updated: ${new Date().toLocaleDateString()}</small>
          </footer>
        </div>
        <div class="draggable animated-box" data-animation="bounce">
          <h4>✨ Animated Element</h4>
          <p>I have CSS animations and custom data attributes!</p>
        </div>
      `
    });

    this.setupAdvancedControls(controls, structureView);
    this.setupPropertyInspector(editorContainer, structureView);
  }

  private setupAdvancedControls(controls: HTMLElement, structureView: HTMLElement) {
    controls.addEventListener('click', (e) => {
      const target = e.target as HTMLButtonElement;
      const id = target.id;

      switch (id) {
        case 'add-complex':
          this.addComplexStructure();
          break;
        case 'add-animated':
          this.addAnimatedElement();
          break;
        case 'add-nested':
          this.addNestedContainer();
          break;
        case 'show-structure':
          this.showElementStructure(structureView);
          break;
      }
    });
  }

  private setupPropertyInspector(container: HTMLElement, structureView: HTMLElement) {
    container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const draggable = target.closest('.draggable') as HTMLElement;
      
      if (draggable) {
        this.inspectElement(draggable, structureView);
      }
    });
  }

  private addComplexStructure() {
    if (!this.editor) return;

    const timestamp = Date.now();
    const complexElement = `
      <div class="draggable dashboard-widget" data-widget-id="${timestamp}" data-type="analytics">
        <div class="draggable widget-header">
          <h4>📊 Analytics Widget</h4>
          <div class="draggable widget-controls">
            <button class="btn-icon">⚙️</button>
            <button class="btn-icon">📈</button>
            <button class="btn-icon">❌</button>
          </div>
        </div>
        <div class="draggable widget-content">
          <div class="draggable metric-card" data-metric="users">
            <h5>👥 Users</h5>
            <span class="metric-value">1,234</span>
          </div>
          <div class="draggable metric-card" data-metric="revenue">
            <h5>💰 Revenue</h5>
            <span class="metric-value">$5,678</span>
          </div>
        </div>
      </div>
    `;

    const currentContent = this.editor.getContent();
    this.editor.loadContent(currentContent + complexElement);
  }

  private addAnimatedElement() {
    if (!this.editor) return;

    const animations = ['bounce', 'pulse', 'shake', 'glow'];
    const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
    
    const animatedElement = `
      <div class="draggable animated-element ${randomAnimation}" data-animation="${randomAnimation}">
        <h4>✨ ${randomAnimation.charAt(0).toUpperCase() + randomAnimation.slice(1)} Animation</h4>
        <p>I'm animated with the "${randomAnimation}" effect!</p>
        <button onclick="this.parentElement.classList.toggle('paused')">⏸️ Toggle Animation</button>
      </div>
    `;

    const currentContent = this.editor.getContent();
    this.editor.loadContent(currentContent + animatedElement);
  }

  private addNestedContainer() {
    if (!this.editor) return;

    const nestedElement = `
      <div class="draggable nested-container" data-depth="0">
        <h4>📦 Nested Container (Level 1)</h4>
        <div class="draggable nested-item" data-depth="1">
          <h5>📄 Level 2 Item</h5>
          <div class="draggable nested-item" data-depth="2">
            <h6>🎯 Level 3 Item</h6>
            <p>Deep nesting is supported!</p>
            <div class="draggable nested-item" data-depth="3">
              <span>🔹 Level 4 Item</span>
            </div>
          </div>
        </div>
      </div>
    `;

    const currentContent = this.editor.getContent();
    this.editor.loadContent(currentContent + nestedElement);
  }

  private inspectElement(element: HTMLElement, structureView: HTMLElement) {
    const tagName = element.tagName.toLowerCase();
    const id = element.id || 'no-id';
    const classes = Array.from(element.classList).filter(c => c !== 'draggable').join(', ') || 'no-classes';
    
    // Get all attributes
    const attributes: string[] = [];
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      if (attr.name !== 'class' && attr.name !== 'id') {
        attributes.push(`${attr.name}="${attr.value}"`);
      }
    }

    // Get children info
    const children = Array.from(element.children).filter(child => 
      child.classList.contains('draggable')
    );

    const structureHtml = `
      <strong>Selected Element Inspector:</strong><br>
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 10px;">
        <h5 style="margin: 0 0 10px 0; color: #007bff;">&lt;${tagName}&gt;</h5>
        <div style="margin-left: 15px;">
          <p><strong>ID:</strong> ${id}</p>
          <p><strong>Classes:</strong> ${classes}</p>
          ${attributes.length > 0 ? `<p><strong>Attributes:</strong><br>${attributes.map(attr => `&nbsp;&nbsp;${attr}`).join('<br>')}</p>` : ''}
          <p><strong>Children:</strong> ${children.length} draggable elements</p>
          <p><strong>Text Content:</strong> ${element.textContent?.substring(0, 100)}${element.textContent && element.textContent.length > 100 ? '...' : ''}</p>
        </div>
      </div>
      <div style="margin-top: 15px;">
        <strong>Element Hierarchy:</strong><br>
        <div style="font-family: monospace; background: #f8f9fa; padding: 10px; border-radius: 4px; margin-top: 5px;">
          ${this.generateElementTree(element)}
        </div>
      </div>
    `;

    structureView.innerHTML = structureHtml;
  }

  private generateElementTree(element: HTMLElement, depth: number = 0): string {
    const indent = '  '.repeat(depth);
    const tagName = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : '';
    const classes = Array.from(element.classList).filter(c => c !== 'draggable').map(c => `.${c}`).join('');
    
    let tree = `${indent}&lt;${tagName}${id}${classes}&gt;<br>`;
    
    const draggableChildren = Array.from(element.children).filter(child => 
      child.classList.contains('draggable')
    ) as HTMLElement[];
    
    draggableChildren.forEach(child => {
      tree += this.generateElementTree(child, depth + 1);
    });
    
    return tree;
  }

  private showElementStructure(structureView: HTMLElement) {
    if (!this.editor) return;

    const data = this.editor.exportData();
    const jsonString = JSON.stringify(data, null, 2);
    
    structureView.innerHTML = `
      <strong>Complete Element Structure (JSON):</strong><br>
      <pre style="background: #f8f9fa; padding: 15px; border-radius: 8px; overflow-x: auto; font-size: 12px; max-height: 400px;">${this.escapeHtml(jsonString)}</pre>
    `;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private getAdvancedStyles(): string {
    return `
      .card-component {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        overflow: hidden;
        border: none;
      }
      
      .card-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: none;
      }
      
      .card-body {
        padding: 20px;
        border: none;
      }
      
      .card-footer {
        background: #f8f9fa;
        padding: 15px 20px;
        border-top: 1px solid #dee2e6;
        border: none;
      }
      
      .badge {
        background: rgba(255,255,255,0.2);
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
      }
      
      .button-group {
        display: flex;
        gap: 10px;
        margin-top: 15px;
        border: none;
      }
      
      .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
      }
      
      .btn.primary {
        background: #007bff;
        color: white;
      }
      
      .btn.secondary {
        background: #6c757d;
        color: white;
      }
      
      .animated-box {
        background: linear-gradient(45deg, #ff6b35, #f7931e);
        color: white;
        text-align: center;
        border-radius: 12px;
        border: none;
      }
      
      .bounce {
        animation: bounceAnim 2s infinite;
      }
      
      .pulse {
        animation: pulseAnim 2s infinite;
      }
      
      .shake {
        animation: shakeAnim 0.5s infinite;
      }
      
      .glow {
        animation: glowAnim 2s infinite;
      }
      
      .paused {
        animation-play-state: paused !important;
      }
      
      @keyframes bounceAnim {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
      }
      
      @keyframes pulseAnim {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      @keyframes shakeAnim {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
      
      @keyframes glowAnim {
        0%, 100% { box-shadow: 0 0 20px rgba(255,107,53,0.5); }
        50% { box-shadow: 0 0 40px rgba(255,107,53,0.8); }
      }
      
      .dashboard-widget {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        border: none;
      }
      
      .widget-header {
        background: #f8f9fa;
        padding: 15px;
        border-bottom: 1px solid #dee2e6;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: none;
      }
      
      .widget-controls {
        display: flex;
        gap: 5px;
        border: none;
      }
      
      .btn-icon {
        background: none;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        padding: 5px 8px;
        cursor: pointer;
      }
      
      .widget-content {
        padding: 15px;
        display: flex;
        gap: 15px;
        border: none;
      }
      
      .metric-card {
        flex: 1;
        text-align: center;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 6px;
        border: none;
      }
      
      .metric-value {
        display: block;
        font-size: 24px;
        font-weight: bold;
        color: #007bff;
        margin-top: 5px;
      }
      
      .nested-container {
        border-left: 4px solid #007bff;
        background: #f8f9fa;
      }
      
      .nested-item {
        margin-left: 20px;
        border-left: 2px solid #dee2e6;
        background: white;
      }
      
      .nested-item[data-depth="1"] { border-left-color: #28a745; }
      .nested-item[data-depth="2"] { border-left-color: #ffc107; }
      .nested-item[data-depth="3"] { border-left-color: #dc3545; }
    `;
  }

  destroy() {
    if (this.editor) {
      this.editor.destroy();
      this.editor = undefined;
    }
  }
}