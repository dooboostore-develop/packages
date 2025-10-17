import { DomEditor } from '@dooboostore/dom-editor';

export class FormBuilderExample {
  private editor?: DomEditor;

  run() {
    const output = document.getElementById('output');
    if (!output) return;

    // Create controls
    const controls = document.createElement('div');
    controls.className = 'controls';
    controls.innerHTML = `
      <button id="add-input">📝 Add Input</button>
      <button id="add-textarea">📄 Add Textarea</button>
      <button id="add-select">📋 Add Select</button>
      <button id="add-checkbox">☑️ Add Checkbox</button>
      <button id="add-button">🔘 Add Button</button>
      <button id="preview-form" class="success">👀 Preview Form</button>
    `;

    // Create editor container
    const editorContainer = document.createElement('div');
    editorContainer.className = 'editor-container';
    editorContainer.id = 'form-builder';

    // Create preview area
    const previewArea = document.createElement('div');
    previewArea.className = 'code-output';
    previewArea.innerHTML = '<strong>Form Preview:</strong><br>Build your form and click "Preview Form" to see it in action!';

    output.appendChild(controls);
    output.appendChild(editorContainer);
    output.appendChild(previewArea);

    // Initialize editor with form template
    this.editor = new DomEditor({
      container: editorContainer,
      debug: false,
      customStyles: this.getFormStyles(),
      initialContent: `
        <form class="draggable form-container">
          <h3>📋 Contact Form</h3>
          <div class="draggable form-group">
            <label>Name:</label>
            <input type="text" name="name" placeholder="Enter your name" required>
          </div>
          <div class="draggable form-group">
            <label>Email:</label>
            <input type="email" name="email" placeholder="Enter your email" required>
          </div>
          <div class="draggable form-group">
            <label>Message:</label>
            <textarea name="message" placeholder="Enter your message" rows="4"></textarea>
          </div>
          <div class="draggable form-group">
            <button type="submit" class="submit-btn">Send Message</button>
          </div>
        </form>
      `
    });

    // Add event listeners
    this.setupFormBuilderControls(controls, previewArea);
  }

  private setupFormBuilderControls(controls: HTMLElement, previewArea: HTMLElement) {
    const addInputBtn = controls.querySelector('#add-input') as HTMLButtonElement;
    const addTextareaBtn = controls.querySelector('#add-textarea') as HTMLButtonElement;
    const addSelectBtn = controls.querySelector('#add-select') as HTMLButtonElement;
    const addCheckboxBtn = controls.querySelector('#add-checkbox') as HTMLButtonElement;
    const addButtonBtn = controls.querySelector('#add-button') as HTMLButtonElement;
    const previewFormBtn = controls.querySelector('#preview-form') as HTMLButtonElement;

    addInputBtn?.addEventListener('click', () => {
      this.addFormElement('input');
    });

    addTextareaBtn?.addEventListener('click', () => {
      this.addFormElement('textarea');
    });

    addSelectBtn?.addEventListener('click', () => {
      this.addFormElement('select');
    });

    addCheckboxBtn?.addEventListener('click', () => {
      this.addFormElement('checkbox');
    });

    addButtonBtn?.addEventListener('click', () => {
      this.addFormElement('button');
    });

    previewFormBtn?.addEventListener('click', () => {
      this.previewForm(previewArea);
    });
  }

  private addFormElement(type: string) {
    if (!this.editor) return;

    const timestamp = Date.now();
    let elementHtml = '';

    switch (type) {
      case 'input':
        elementHtml = `
          <div class="draggable form-group">
            <label>New Input:</label>
            <input type="text" name="field_${timestamp}" placeholder="Enter value">
          </div>
        `;
        break;
      case 'textarea':
        elementHtml = `
          <div class="draggable form-group">
            <label>New Textarea:</label>
            <textarea name="textarea_${timestamp}" placeholder="Enter text" rows="3"></textarea>
          </div>
        `;
        break;
      case 'select':
        elementHtml = `
          <div class="draggable form-group">
            <label>New Select:</label>
            <select name="select_${timestamp}">
              <option value="">Choose option</option>
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
              <option value="option3">Option 3</option>
            </select>
          </div>
        `;
        break;
      case 'checkbox':
        elementHtml = `
          <div class="draggable form-group checkbox-group">
            <label>
              <input type="checkbox" name="checkbox_${timestamp}" value="yes">
              New Checkbox Option
            </label>
          </div>
        `;
        break;
      case 'button':
        elementHtml = `
          <div class="draggable form-group">
            <button type="button" class="form-btn">New Button</button>
          </div>
        `;
        break;
    }

    const currentContent = this.editor.getContent();
    this.editor.loadContent(currentContent + elementHtml);
  }

  private previewForm(previewArea: HTMLElement) {
    if (!this.editor) return;

    const formHtml = this.editor.getContent();
    
    // Create a functional form preview
    const previewContainer = document.createElement('div');
    previewContainer.innerHTML = formHtml;
    
    // Remove draggable classes and editor-specific elements
    const elements = previewContainer.querySelectorAll('.draggable');
    elements.forEach(el => {
      el.classList.remove('draggable');
      // Remove action buttons if any
      const actionButtons = el.querySelector('.action-buttons');
      if (actionButtons) {
        actionButtons.remove();
      }
    });

    // Add form submission handler
    const forms = previewContainer.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data: Record<string, any> = {};
        
        for (const [key, value] of formData.entries()) {
          data[key] = value;
        }
        
        previewArea.innerHTML = `
          <strong>Form Submitted!</strong><br>
          <pre>${JSON.stringify(data, null, 2)}</pre>
          <button onclick="location.reload()" style="margin-top: 10px;">Reset Preview</button>
        `;
      });
    });

    // Add click handlers for buttons
    const buttons = previewContainer.querySelectorAll('button[type="button"]');
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        alert(`Button "${button.textContent}" clicked!`);
      });
    });

    previewArea.innerHTML = '<strong>Live Form Preview:</strong>';
    previewArea.appendChild(previewContainer);
  }

  private getFormStyles(): string {
    return `
      .form-container {
        background: #f8f9fa;
        padding: 30px;
        border-radius: 12px;
        border: 2px solid #dee2e6;
        max-width: 600px;
        margin: 0 auto;
      }
      
      .form-container h3 {
        color: #495057;
        margin-bottom: 20px;
        text-align: center;
      }
      
      .form-group {
        margin-bottom: 20px;
        padding: 15px;
        background: white;
        border-radius: 8px;
        border: 1px solid #e9ecef;
      }
      
      .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #495057;
      }
      
      .form-group input,
      .form-group textarea,
      .form-group select {
        width: 100%;
        padding: 12px;
        border: 2px solid #e9ecef;
        border-radius: 6px;
        font-size: 14px;
        transition: border-color 0.3s ease;
      }
      
      .form-group input:focus,
      .form-group textarea:focus,
      .form-group select:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
      }
      
      .checkbox-group {
        display: flex;
        align-items: center;
      }
      
      .checkbox-group label {
        display: flex;
        align-items: center;
        margin-bottom: 0;
        cursor: pointer;
      }
      
      .checkbox-group input[type="checkbox"] {
        width: auto;
        margin-right: 10px;
        transform: scale(1.2);
      }
      
      .submit-btn,
      .form-btn {
        background: #007bff;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.3s ease;
      }
      
      .submit-btn:hover,
      .form-btn:hover {
        background: #0056b3;
      }
      
      .form-btn {
        background: #28a745;
      }
      
      .form-btn:hover {
        background: #218838;
      }
      
      /* Form validation styles */
      .form-group input:invalid {
        border-color: #dc3545;
      }
      
      .form-group input:valid {
        border-color: #28a745;
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