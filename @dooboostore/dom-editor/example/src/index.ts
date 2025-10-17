import { BasicEditorExample } from './examples/BasicEditorExample';
import { CustomStylesExample } from './examples/CustomStylesExample';
import { MobileEditorExample } from './examples/MobileEditorExample';
import { FormBuilderExample } from './examples/FormBuilderExample';
import { LayoutDesignerExample } from './examples/LayoutDesignerExample';
import { ImportExportExample } from './examples/ImportExportExample';
import { EventHandlingExample } from './examples/EventHandlingExample';
import { AdvancedFeaturesExample } from './examples/AdvancedFeaturesExample';

interface ExampleConfig {
  title: string;
  description: string;
  icon: string;
  example: () => void;
}

const examples: ExampleConfig[] = [
  {
    title: 'Basic Editor',
    description: 'Basic DOM editor with drag & drop functionality',
    icon: '📝',
    example: () => new BasicEditorExample().run(),
  },
  {
    title: 'Custom Styles',
    description: 'Editor with custom CSS styles and themes',
    icon: '🎨',
    example: () => new CustomStylesExample().run(),
  },
  {
    title: 'Mobile Support',
    description: 'Touch-friendly editor with mobile optimizations',
    icon: '📱',
    example: () => new MobileEditorExample().run(),
  },
  {
    title: 'Form Builder',
    description: 'Build forms with input elements and validation',
    icon: '📋',
    example: () => new FormBuilderExample().run(),
  },
  {
    title: 'Layout Designer',
    description: 'Create page layouts with sections and containers',
    icon: '🏗️',
    example: () => new LayoutDesignerExample().run(),
  },
  {
    title: 'Import/Export',
    description: 'Save and load HTML structures and data',
    icon: '💾',
    example: () => new ImportExportExample().run(),
  },
  {
    title: 'Event Handling',
    description: 'Handle editor events and custom interactions',
    icon: '⚡',
    example: () => new EventHandlingExample().run(),
  },
  {
    title: 'Advanced Features',
    description: 'Property editing, nested elements, and animations',
    icon: '🚀',
    example: () => new AdvancedFeaturesExample().run(),
  },
];

function renderMenu() {
  const menu = document.getElementById('menu');
  if (!menu) return;

  menu.innerHTML = '';
  
  examples.forEach((config) => {
    const item = document.createElement('div');
    item.className = 'menu-item';
    item.innerHTML = `
      <h3>${config.icon} ${config.title}</h3>
      <p>${config.description}</p>
    `;
    
    item.addEventListener('click', () => {
      const output = document.getElementById('output');
      if (!output) return;
      
      output.innerHTML = `<h2>${config.icon} ${config.title}</h2>`;
      
      try {
        config.example();
      } catch (error) {
        output.innerHTML += `
          <div style="color: red; padding: 20px; background: #ffebee; border-radius: 8px;">
            <strong>Error:</strong> ${error}
          </div>
        `;
        console.error('Example error:', error);
      }
    });
    
    menu.appendChild(item);
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderMenu();
  
  // Show first example by default
  if (examples.length > 0) {
    setTimeout(() => {
      examples[0].example();
      const output = document.getElementById('output');
      if (output) {
        output.innerHTML = `<h2>${examples[0].icon} ${examples[0].title}</h2>` + output.innerHTML;
      }
    }, 100);
  }
});