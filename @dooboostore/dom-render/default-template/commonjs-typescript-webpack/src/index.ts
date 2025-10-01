import 'reflect-metadata'
import { DomRender } from '@dooboostore/dom-render/DomRender';
import { ComponentSet } from '@dooboostore/dom-render/components/ComponentSet';
import { Appender } from '@dooboostore/dom-render/operators/Appender';
import { RandomUtils } from '@dooboostore/core/random/RandomUtils';
import { DomRenderRunConfig } from '@dooboostore/dom-render/DomRender';

class ContentViewModel {
  constructor(
    public name: string,
    public itemAppender: Appender<ComponentSet>,
    public counter: number
  ) {}
}

class App {
  public name = 'World';
  public itemAppender = new Appender<ComponentSet>();
  public counter = 0;

  child = new ComponentSet(
    new ContentViewModel(this.name, this.itemAppender, this.counter),
    {
      template: `
        <div>
          <h3 style="color: #4a5568; margin-bottom: 1rem; font-size: 1.5rem;">
            Hello, <span style="color: #667eea;">\${@this@.name}$</span>!
          </h3>
          <p style="color: #718096; margin-bottom: 1rem;">
            This is a live demo of Dom Render. Try typing in the input field above or clicking the buttons!
          </p>
          <div style="margin-top: 1.5rem;">
            <h4 style="color: #4a5568; margin-bottom: 1rem; font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
              Items <span style="background: #667eea; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.875rem;">\${@this@.counter}$</span>
            </h4>
            <div dr-appender="@this@.itemAppender">
              <div style="background: white; padding: 1.25rem; margin-bottom: 0.75rem; border-radius: 12px; border-left: 4px solid #667eea; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <div>
                  <div style="font-weight: 600; color: #2d3748; margin-bottom: 0.25rem;">
                    ID: <code style="background: #f7fafc; padding: 0.25rem 0.5rem; border-radius: 4px;">\${#it#.id}$</code>
                  </div>
                  <div style="color: #718096; font-size: 0.875rem;">
                    Created: \${#it#.timestamp}$
                  </div>
                </div>
              </div>
            </div>
            <div dr-if="@this@.counter === 0">
              <div style="text-align: center; padding: 2rem; color: #a0aec0;">
                <div style="font-size: 3rem; margin-bottom: 0.5rem;">📭</div>
                <p>No items yet. Click Add Item to create one!</p>
              </div>
            </div>
          </div>
        </div>
      `
    }
  );

  constructor() {
    console.log('App initialized');
  }

  add(): void {
    const id = RandomUtils.uuid().substring(0, 8);
    const timestamp = new Date().toLocaleString();
    
    const itemComponent = new ComponentSet(
      { id, timestamp },
      { template: '' }
    );
    
    this.itemAppender.push(itemComponent);
    this.counter++;
    (this.child.obj as ContentViewModel).counter = this.counter;
    
    console.log('Added new item:', { id, timestamp });
  }

  change(): void {
    if (this.counter === 0) {
      console.log('No items to change');
      return;
    }

    const newId = RandomUtils.uuid().substring(0, 8);
    const timestamp = new Date().toLocaleString();
    
    const updatedComponent = new ComponentSet(
      { id: newId + ' (updated)', timestamp },
      { template: '' }
    );
    
    // Add as new item (Appender doesn't have update method)
    this.itemAppender.push(updatedComponent);
    this.counter++;
    (this.child.obj as ContentViewModel).counter = this.counter;
    
    console.log('Added updated item:', { id: newId, timestamp });
  }

  clear(): void {
    this.itemAppender.clear();
    this.counter = 0;
    (this.child.obj as ContentViewModel).counter = this.counter;
    console.log('Cleared all items');
  }
}

const config: DomRenderRunConfig = {
  window
};

const app = new App();
const domRenderInstance = DomRender.run({
  rootObject: app,
  target: document.querySelector('#app')!,
  config
});

console.log('Dom Render started successfully!');
