import { DomEditor } from '@dooboostore/dom-editor';

export class LayoutDesignerExample {
  private editor?: DomEditor;

  run() {
    const output = document.getElementById('output');
    if (!output) return;

    const controls = document.createElement('div');
    controls.className = 'controls';
    controls.innerHTML = `
      <button id="add-header">📄 Add Header</button>
      <button id="add-section">📦 Add Section</button>
      <button id="add-sidebar">📋 Add Sidebar</button>
      <button id="add-footer">📝 Add Footer</button>
      <button id="export-layout" class="success">💾 Export Layout</button>
    `;

    const editorContainer = document.createElement('div');
    editorContainer.className = 'editor-container';
    editorContainer.id = 'layout-designer';

    output.appendChild(controls);
    output.appendChild(editorContainer);

    this.editor = new DomEditor({
      container: editorContainer,
      debug: false,
      customStyles: this.getLayoutStyles(),
      initialContent: `
        <header class="draggable layout-header">
          <h1>🏠 Website Header</h1>
          <nav class="draggable">
            <a href="#">Home</a> | <a href="#">About</a> | <a href="#">Contact</a>
          </nav>
        </header>
        <main class="draggable layout-main">
          <section class="draggable layout-section">
            <h2>📖 Main Content</h2>
            <p>This is the main content area. Drag elements around to design your layout!</p>
          </section>
        </main>
        <footer class="draggable layout-footer">
          <p>© 2024 Your Website. Built with DOM Editor.</p>
        </footer>
      `
    });

    this.setupLayoutControls(controls);
  }

  private setupLayoutControls(controls: HTMLElement) {
    controls.addEventListener('click', (e) => {
      const target = e.target as HTMLButtonElement;
      const id = target.id;

      switch (id) {
        case 'add-header':
          this.addLayoutElement('header');
          break;
        case 'add-section':
          this.addLayoutElement('section');
          break;
        case 'add-sidebar':
          this.addLayoutElement('sidebar');
          break;
        case 'add-footer':
          this.addLayoutElement('footer');
          break;
        case 'export-layout':
          this.exportLayout();
          break;
      }
    });
  }

  private addLayoutElement(type: string) {
    if (!this.editor) return;

    const elements = {
      header: `<header class="draggable layout-header"><h2>🎯 New Header</h2></header>`,
      section: `<section class="draggable layout-section"><h3>📄 New Section</h3><p>Content goes here...</p></section>`,
      sidebar: `<aside class="draggable layout-sidebar"><h4>📋 Sidebar</h4><ul><li>Menu item 1</li><li>Menu item 2</li></ul></aside>`,
      footer: `<footer class="draggable layout-footer"><p>📝 New Footer Content</p></footer>`
    };

    const currentContent = this.editor.getContent();
    this.editor.loadContent(currentContent + elements[type as keyof typeof elements]);
  }

  private exportLayout() {
    if (!this.editor) return;

    const html = this.editor.getContent();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'layout.html';
    a.click();
    URL.revokeObjectURL(url);
  }

  private getLayoutStyles(): string {
    return `
      .layout-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        text-align: center;
        border-radius: 8px;
      }
      
      .layout-main {
        background: #f8f9fa;
        padding: 20px;
        min-height: 300px;
        border-radius: 8px;
        margin: 10px 0;
      }
      
      .layout-section {
        background: white;
        padding: 20px;
        margin: 10px 0;
        border-radius: 8px;
        border-left: 4px solid #007bff;
      }
      
      .layout-sidebar {
        background: #e9ecef;
        padding: 20px;
        border-radius: 8px;
        border-left: 4px solid #28a745;
      }
      
      .layout-footer {
        background: #343a40;
        color: white;
        padding: 20px;
        text-align: center;
        border-radius: 8px;
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