import 'reflect-metadata';
import { BasicBindingExample } from './examples/BasicBindingExample';
import { TwoWayBindingExample } from './examples/TwoWayBindingExample';
import { ArrayBindingExample } from './examples/ArrayBindingExample';
import { ComponentExample } from './examples/ComponentExample';
import { EventExample } from './examples/EventExample';
import { DecoratorExample } from './examples/DecoratorExample';
import { RouterExample } from './examples/RouterExample';
import { RouterOutletExample } from './examples/RouterOutletExample';
import { ConditionalRenderingExample } from './examples/ConditionalRenderingExample';
import { PromiseSwitchExample } from './examples/PromiseSwitchExample';
import { TimerExample } from './examples/TimerExample';
import { ChooseExample } from './examples/ChooseExample';
import { FormComponentsExample } from './examples/FormComponentsExample';

interface ExampleConfig {
  title: string;
  description: string;
  icon: string;
  example: () => void;
}

const examples: ExampleConfig[] = [
  {
    title: 'Basic Binding',
    description: 'Basic data binding - ${@this@.property}$',
    icon: '📌',
    example: () => new BasicBindingExample().run(),
  },
  {
    title: 'Two-Way Binding',
    description: 'Two-way data binding - sync with inputs',
    icon: '🔄',
    example: () => new TwoWayBindingExample().run(),
  },
  {
    title: 'Array Binding',
    description: 'Array binding - dr-for-of & dr-appender',
    icon: '📋',
    example: () => new ArrayBindingExample().run(),
  },
  {
    title: 'Component',
    description: 'ComponentSet - reusable components',
    icon: '🧩',
    example: () => new ComponentExample().run(),
  },
  {
    title: 'Event Handling',
    description: 'Mouse, keyboard, form, and custom events',
    icon: '⚡',
    example: () => new EventExample().run(),
  },
  {
    title: 'Decorators',
    description: '@attribute, @query, @event decorators',
    icon: '✨',
    example: () => new DecoratorExample().run(),
  },
  {
    title: 'Router',
    description: 'Hash-based routing with router.go()',
    icon: '🚦',
    example: () => new RouterExample().run(),
  },
  {
    title: 'RouterOutlet',
    description: 'ComponentRouterBase & dr-router-outlet',
    icon: '🛣️',
    example: () => new RouterOutletExample().run(),
  },
  {
    title: 'Conditional Rendering',
    description: 'dr-if for conditional rendering',
    icon: '🔀',
    example: () => new ConditionalRenderingExample().run(),
  },
  {
    title: 'PromiseSwitch',
    description: 'Async state handling with promises',
    icon: '⏳',
    example: () => new PromiseSwitchExample().run(),
  },
  {
    title: 'Timer',
    description: 'Countdown timer component',
    icon: '⏱️',
    example: () => new TimerExample().run(),
  },
  {
    title: 'Choose',
    description: 'Switch-case style conditional rendering',
    icon: '🔀',
    example: () => new ChooseExample().run(),
  },
  {
    title: 'Form Components',
    description: 'dr-checkbox with custom UI',
    icon: '☑️',
    example: () => new FormComponentsExample().run(),
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
      }
    });
    
    menu.appendChild(item);
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderMenu();
});
