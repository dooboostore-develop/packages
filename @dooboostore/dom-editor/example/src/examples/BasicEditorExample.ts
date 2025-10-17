import { DomEditor } from '@dooboostore/dom-editor';

export class BasicEditorExample {
  private editor?: DomEditor;

  run() {
    const output = document.getElementById('output');
    if (!output) return;

    // Create controls
    const controls = document.createElement('div');
    controls.className = 'controls';
    controls.innerHTML = `
      <button id="add-element">➕ Add Element</button>
      <button id="clear-all" class="secondary">🗑️ Clear All</button>
      <button id="export-html" class="success">📄 Export HTML</button>
    `;

    // Create editor container
    const editorContainer = document.createElement('div');
    editorContainer.className = 'editor-container';
    editorContainer.id = 'basic-editor';

    // Create output area
    const codeOutput = document.createElement('div');
    codeOutput.className = 'code-output';
    codeOutput.textContent = 'HTML output will appear here...';

    output.appendChild(controls);
    output.appendChild(editorContainer);
    output.appendChild(codeOutput);

    // Initialize editor
    this.editor = new DomEditor({
      container: editorContainer,
      debug: true,
      enableMobileSupport: true,
      initialContent: `
        <div class="draggable" id="welcome-box">
          <h3>🎉 Welcome to DOM Editor!</h3>
          <p>This is a basic example. Try dragging this element around!</p>
        </div>
        <div class="draggable" id="sample-element">
          <h4>📦 Sample Element</h4>
          <p>You can drag me too! Click to select and see the property panel.</p>
        </div>
      `
    });

    // Add event listeners
    const addElementBtn = controls.querySelector('#add-element') as HTMLButtonElement;
    const clearAllBtn = controls.querySelector('#clear-all') as HTMLButtonElement;
    const exportHtmlBtn = controls.querySelector('#export-html') as HTMLButtonElement;

    addElementBtn?.addEventListener('click', () => {
      const newContent = this.editor!.getContent() + `
        <div class="draggable" id="new-element-${Date.now()}">
          <h4>✨ New Element</h4>
          <p>I was just added! You can drag and edit me.</p>
        </div>
      `;
      this.editor!.loadContent(newContent);
    });

    clearAllBtn?.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all elements?')) {
        this.editor!.loadContent('');
        codeOutput.textContent = 'All elements cleared.';
      }
    });

    exportHtmlBtn?.addEventListener('click', () => {
      const html = this.editor!.getContent();
      codeOutput.textContent = html;
    });

    // Show initial HTML
    setTimeout(() => {
      const html = this.editor!.getContent();
      codeOutput.textContent = html;
    }, 500);
  }

  destroy() {
    if (this.editor) {
      this.editor.destroy();
      this.editor = undefined;
    }
  }
}