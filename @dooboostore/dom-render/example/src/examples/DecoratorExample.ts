import { DomRender } from '@dooboostore/dom-render/DomRender';
import { ComponentBase, attribute, query, event } from '@dooboostore/dom-render/components/ComponentBase';
import { ComponentSet } from '@dooboostore/dom-render/components/ComponentSet';

// Example component using decorators
class TodoComponent extends ComponentBase<{ title?: string, max?: number }> {
  // @attribute decorator - binds to HTML attributes
  @attribute('title')
  componentTitle: string = 'Default Title';

  @attribute({ name: 'max', converter: (value) => parseInt(value || '10') })
  maxItems: number = 10;

  // @query decorator - queries DOM elements
  @query('.todo-item')
  todoItems?: Element[];

  @query({ selector: '#add-button', refreshRawSetRendered: true })
  addButton?: Element;

  @query({ selector: '.todo-count', refreshRawSetRendered: true })
  setCountElement(element: Element) {
    console.log('Count element found:', element);
  }

  // @event decorator - binds event listeners
  @event({ query: '#add-button', name: 'click' })
  handleAddClick(e: Event) {
    console.log('Add button clicked via @event decorator!');
    this.addTodoItem();
  }

  @event({ query: '.delete-btn', name: 'click', refreshRawSetRendered: true })
  handleDeleteClick(e: Event) {
    const target = e.target as HTMLElement;
    const index = target.getAttribute('data-index');
    if (index !== null) {
      console.log('Delete clicked via @event decorator!');
      this.deleteTodoItem(parseInt(index));
    }
  }

  todos: string[] = ['Learn decorators', 'Build awesome apps'];

  addTodoItem() {
    if (this.todos.length < this.maxItems) {
      this.todos.push(`New task ${this.todos.length + 1}`);
      this.todos = [...this.todos];
    } else {
      alert(`Maximum ${this.maxItems} items reached!`);
    }
  }

  deleteTodoItem(index: number) {
    this.todos.splice(index, 1);
    this.todos = [...this.todos];
  }

  onInitRender(param: any, rawSet: any) {
    super.onInitRender(param, rawSet);
    console.log('Component initialized with:');
    console.log('- Title from @attribute:', this.componentTitle);
    console.log('- Max items from @attribute:', this.maxItems);
    console.log('- Todo items from @query:', this.todoItems?.length);
  }
}

export class DecoratorExample {
  run() {
    const output = document.getElementById('output');
    if (!output) return;

    const demoDiv = document.createElement('div');
    demoDiv.className = 'demo-box';
    demoDiv.innerHTML = `
      <h3>ComponentBase Decorators</h3>
      <p style="color: #666; margin-bottom: 20px;">
        Using <code>@attribute</code>, <code>@query</code>, and <code>@event</code> decorators
      </p>
      
      <div id="decorator-demo" dr-this="@this@.todoComponent" style="border: 2px solid #8b5cf6; padding: 20px; border-radius: 8px;">
        <!-- ComponentSet content will be rendered here -->
      </div>
    `;
    output.appendChild(demoDiv);

    // Create component with ComponentSet
    let state = {
      todoComponent: new ComponentSet(new TodoComponent(), {
        template: `
          <div>
            <h4 style="color: #8b5cf6; margin-bottom: 15px;">\${@this@.componentTitle}$ (Max: \${@this@.maxItems}$)</h4>
            
            <div style="margin-bottom: 15px;">
              <button id="add-button" style="padding: 8px 16px; background: #8b5cf6; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Add Todo
              </button>
            </div>
            
            <ul style="list-style: none; padding: 0;" dr-for-of="@this@.todos">
              <li class="todo-item" style="padding: 10px; margin: 8px 0; background: #f3f4f6; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                <span>\${#it#}$</span>
                <button class="delete-btn" data-index="#index#" style="padding: 4px 12px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                  Delete
                </button>
              </li>
            </ul>
            
            <div class="todo-count" style="margin-top: 15px; padding: 10px; background: #ede9fe; border-radius: 4px; font-size: 14px;">
              Total items: <strong>\${@this@.todos.length}$ / \${@this@.maxItems}$</strong>
            </div>
          </div>
        `
      })
    };

    // Set attributes on the component
    (state.todoComponent.obj as TodoComponent).setAttribute({
      title: 'My Todo List',
      max: 5
    } as any);

    // Initialize DomRender
    const result = new DomRender({
      rootObject: state,
      target: demoDiv,
      config: { window }
    });
    state = result.rootObject;


  }
}
