import { DomEditor, ElementData } from '@dooboostore/dom-editor';

export class ImportExportExample {
  private editor?: DomEditor;

  run() {
    const output = document.getElementById('output');
    if (!output) return;

    const controls = document.createElement('div');
    controls.className = 'controls';
    controls.innerHTML = `
      <button id="export-html">📄 Export HTML</button>
      <button id="export-data">📊 Export Data</button>
      <button id="import-data">📥 Import Data</button>
      <button id="save-local">💾 Save to LocalStorage</button>
      <button id="load-local">📂 Load from LocalStorage</button>
    `;

    const editorContainer = document.createElement('div');
    editorContainer.className = 'editor-container';
    editorContainer.id = 'import-export-editor';

    const outputArea = document.createElement('div');
    outputArea.className = 'code-output';
    outputArea.textContent = 'Export/Import results will appear here...';

    output.appendChild(controls);
    output.appendChild(editorContainer);
    output.appendChild(outputArea);

    this.editor = new DomEditor({
      container: editorContainer,
      debug: false,
      initialContent: `
        <div class="draggable sample-content">
          <h3>📦 Sample Content</h3>
          <p>This content can be exported and imported!</p>
          <div class="draggable nested-item">
            <h4>🎯 Nested Item</h4>
            <p>Nested elements are preserved during export/import.</p>
          </div>
        </div>
      `
    });

    this.setupImportExportControls(controls, outputArea);
  }

  private setupImportExportControls(controls: HTMLElement, outputArea: HTMLElement) {
    controls.addEventListener('click', (e) => {
      const target = e.target as HTMLButtonElement;
      const id = target.id;

      switch (id) {
        case 'export-html':
          this.exportHTML(outputArea);
          break;
        case 'export-data':
          this.exportData(outputArea);
          break;
        case 'import-data':
          this.importData(outputArea);
          break;
        case 'save-local':
          this.saveToLocalStorage(outputArea);
          break;
        case 'load-local':
          this.loadFromLocalStorage(outputArea);
          break;
      }
    });
  }

  private exportHTML(outputArea: HTMLElement) {
    if (!this.editor) return;

    const html = this.editor.getContent();
    outputArea.innerHTML = `
      <strong>Exported HTML:</strong><br>
      <pre style="background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto;">${this.escapeHtml(html)}</pre>
      <button onclick="navigator.clipboard.writeText(\`${html.replace(/`/g, '\\`')}\`)">📋 Copy to Clipboard</button>
    `;
  }

  private exportData(outputArea: HTMLElement) {
    if (!this.editor) return;

    const data = this.editor.exportData();
    const jsonString = JSON.stringify(data, null, 2);
    
    outputArea.innerHTML = `
      <strong>Exported Data (JSON):</strong><br>
      <pre style="background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto;">${this.escapeHtml(jsonString)}</pre>
      <button onclick="navigator.clipboard.writeText(\`${jsonString.replace(/`/g, '\\`')}\`)">📋 Copy to Clipboard</button>
    `;
  }

  private importData(outputArea: HTMLElement) {
    const sampleData: ElementData = {
      tagName: 'div',
      className: 'draggable imported-content',
      children: [
        {
          tagName: 'h3',
          textContent: '📥 Imported Content'
        },
        {
          tagName: 'p',
          textContent: 'This content was imported from structured data!'
        },
        {
          tagName: 'div',
          className: 'draggable imported-child',
          children: [
            {
              tagName: 'h4',
              textContent: '✨ Imported Child'
            },
            {
              tagName: 'p',
              textContent: 'Child elements are also imported correctly.'
            }
          ]
        }
      ]
    };

    if (this.editor) {
      this.editor.importData(sampleData);
      outputArea.innerHTML = `
        <strong>Data Imported Successfully!</strong><br>
        Sample structured data has been imported into the editor.
      `;
    }
  }

  private saveToLocalStorage(outputArea: HTMLElement) {
    if (!this.editor) return;

    const data = this.editor.exportData();
    localStorage.setItem('dom-editor-content', JSON.stringify(data));
    
    outputArea.innerHTML = `
      <strong>Saved to LocalStorage!</strong><br>
      Content has been saved and will persist across browser sessions.
    `;
  }

  private loadFromLocalStorage(outputArea: HTMLElement) {
    const savedData = localStorage.getItem('dom-editor-content');
    
    if (savedData && this.editor) {
      try {
        const data = JSON.parse(savedData);
        this.editor.importData(data);
        outputArea.innerHTML = `
          <strong>Loaded from LocalStorage!</strong><br>
          Previously saved content has been restored.
        `;
      } catch (error) {
        outputArea.innerHTML = `
          <strong>Error loading from LocalStorage:</strong><br>
          ${error}
        `;
      }
    } else {
      outputArea.innerHTML = `
        <strong>No saved content found!</strong><br>
        Save some content first using "Save to LocalStorage".
      `;
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  destroy() {
    if (this.editor) {
      this.editor.destroy();
      this.editor = undefined;
    }
  }
}