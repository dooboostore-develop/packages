import { DomEditor } from '@dooboostore/dom-editor';

export class CustomStylesExample {
  private editor?: DomEditor;

  run() {
    const output = document.getElementById('output');
    if (!output) return;

    // Create controls
    const controls = document.createElement('div');
    controls.className = 'controls';
    controls.innerHTML = `
      <button id="theme-default">🎨 Default Theme</button>
      <button id="theme-dark">🌙 Dark Theme</button>
      <button id="theme-colorful">🌈 Colorful Theme</button>
      <button id="add-styled-element" class="success">➕ Add Styled Element</button>
    `;

    // Create editor container
    const editorContainer = document.createElement('div');
    editorContainer.className = 'editor-container';
    editorContainer.id = 'styled-editor';

    output.appendChild(controls);
    output.appendChild(editorContainer);

    // Initialize editor with custom styles
    this.editor = new DomEditor({
      container: editorContainer,
      debug: false,
      customStyles: this.getDefaultTheme(),
      initialContent: `
        <div class="draggable gradient-box">
          <h3>🎨 Gradient Box</h3>
          <p>This element has custom gradient styling!</p>
        </div>
        <div class="draggable shadow-card">
          <h4>💫 Shadow Card</h4>
          <p>I have a beautiful shadow effect.</p>
        </div>
        <div class="draggable neon-glow">
          <h4>✨ Neon Glow</h4>
          <p>Check out my glowing border!</p>
        </div>
      `
    });

    // Add event listeners
    const themeDefaultBtn = controls.querySelector('#theme-default') as HTMLButtonElement;
    const themeDarkBtn = controls.querySelector('#theme-dark') as HTMLButtonElement;
    const themeColorfulBtn = controls.querySelector('#theme-colorful') as HTMLButtonElement;
    const addStyledBtn = controls.querySelector('#add-styled-element') as HTMLButtonElement;

    themeDefaultBtn?.addEventListener('click', () => {
      this.updateTheme(this.getDefaultTheme());
    });

    themeDarkBtn?.addEventListener('click', () => {
      this.updateTheme(this.getDarkTheme());
    });

    themeColorfulBtn?.addEventListener('click', () => {
      this.updateTheme(this.getColorfulTheme());
    });

    addStyledBtn?.addEventListener('click', () => {
      const styles = ['gradient-box', 'shadow-card', 'neon-glow', 'glass-effect'];
      const randomStyle = styles[Math.floor(Math.random() * styles.length)];
      
      const newContent = this.editor!.getContent() + `
        <div class="draggable ${randomStyle}">
          <h4>🎯 New Styled Element</h4>
          <p>I have the "${randomStyle}" style applied!</p>
        </div>
      `;
      this.editor!.loadContent(newContent);
    });
  }

  private updateTheme(styles: string) {
    if (this.editor) {
      this.editor.destroy();
      
      const container = document.getElementById('styled-editor');
      if (container) {
        container.innerHTML = '';
        
        this.editor = new DomEditor({
          container,
          debug: false,
          customStyles: styles,
          initialContent: this.editor.getContent()
        });
      }
    }
  }

  private getDefaultTheme(): string {
    return `
      .gradient-box {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px;
      }
      
      .shadow-card {
        background: white;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        border-radius: 8px;
        border: none;
      }
      
      .neon-glow {
        background: #1a1a1a;
        color: #00ff88;
        border: 2px solid #00ff88;
        border-radius: 8px;
        box-shadow: 0 0 20px rgba(0,255,136,0.3);
      }
      
      .glass-effect {
        background: rgba(255,255,255,0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 12px;
        color: #333;
      }
    `;
  }

  private getDarkTheme(): string {
    return `
      .dom-editor {
        background-color: #2d3748;
      }
      
      .dom-editor .container {
        background-color: #4a5568;
        border-color: #718096;
      }
      
      .dom-editor .draggable {
        background: #1a202c;
        color: #e2e8f0;
        border-color: #4a5568;
      }
      
      .gradient-box {
        background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
        color: #e2e8f0;
        border: 2px solid #718096;
      }
      
      .shadow-card {
        background: #2d3748;
        color: #e2e8f0;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        border: 1px solid #4a5568;
      }
      
      .neon-glow {
        background: #000;
        color: #00ffff;
        border: 2px solid #00ffff;
        box-shadow: 0 0 20px rgba(0,255,255,0.5);
      }
      
      .glass-effect {
        background: rgba(45,55,72,0.8);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(226,232,240,0.1);
        color: #e2e8f0;
      }
    `;
  }

  private getColorfulTheme(): string {
    return `
      .gradient-box {
        background: linear-gradient(45deg, #ff6b35, #f7931e, #ffd23f, #06ffa5);
        background-size: 400% 400%;
        animation: gradientShift 3s ease infinite;
        color: white;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
      }
      
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      .shadow-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        box-shadow: 0 15px 35px rgba(102,126,234,0.4);
        transform: perspective(1000px) rotateX(5deg);
      }
      
      .neon-glow {
        background: #000;
        color: #ff0080;
        border: 2px solid #ff0080;
        box-shadow: 
          0 0 10px #ff0080,
          0 0 20px #ff0080,
          0 0 40px #ff0080;
        animation: pulse 2s ease-in-out infinite alternate;
      }
      
      @keyframes pulse {
        from { box-shadow: 0 0 10px #ff0080, 0 0 20px #ff0080, 0 0 40px #ff0080; }
        to { box-shadow: 0 0 20px #ff0080, 0 0 30px #ff0080, 0 0 60px #ff0080; }
      }
      
      .glass-effect {
        background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
        backdrop-filter: blur(15px);
        border: 1px solid rgba(255,255,255,0.3);
        border-radius: 20px;
        box-shadow: 0 8px 32px rgba(31,38,135,0.37);
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