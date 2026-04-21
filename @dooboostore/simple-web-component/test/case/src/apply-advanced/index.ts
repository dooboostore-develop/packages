import swcRegister, { 
  elementDefine, 
  onConnectedInnerHtml, 
  addEventListener, 
  updateClass, 
  updateStyle, 
  updateAttribute,
  setClassHost,
  updateStyleHost,
  innerHtmlNode
} from '@dooboostore/simple-web-component';

swcRegister(window);

@elementDefine('apply-advanced-element', { window })
class ApplyAdvancedElement extends HTMLElement {
  private count = 0;
  private status = 'idle';

  // --- 1. Dynamic Class with Filter Functions ---
  @updateClass('.item')
  updateItems(currentCount: number) {
    return {
      'even': (el: HTMLElement) => Number(el.dataset.index) % 2 === 0,
      'odd': (el: HTMLElement) => Number(el.dataset.index) % 2 !== 0,
      'highlight': (el: HTMLElement) => Number(el.dataset.index) === currentCount
    };
  }

  // --- 2. Dynamic Style with Function Values ---
  @updateStyle('.box')
  refreshBoxStyle(status: string) {
    return {
      'background-color': () => {
        if (status === 'active') return '#4caf50';
        if (status === 'error') return '#f44336';
        return '#2196f3';
      },
      'transform': () => `scale(${1 + (this.count % 5) * 0.1})`,
      'opacity': status === 'idle' ? 0.5 : 1
    };
  }

  // --- 3. Dynamic Attributes with Multi-Property Object ---
  @updateAttribute('.status-indicator')
  syncStatus(status: string) {
    return {
      'data-status': status,
      'aria-busy': status === 'active',
      'title': () => `Current status is ${status}`
    };
  }

  // --- 4. Host Decorators ---
  @setClassHost() // Correctly passing no options for default name matching if desired, or provide specific string
  setLoaded() { return 'is-loaded'; }

  @updateStyleHost()
  updateHostStyle() {
    return {
      'border': this.count > 5 ? '5px solid gold' : '2px solid #333'
    };
  }

  @addEventListener('#btn-step', 'click')
  onStep() {
    this.count++;
    this.status = this.count % 3 === 0 ? 'error' : (this.count % 2 === 0 ? 'active' : 'idle');
    
    // Trigger updates
    this.updateItems(this.count % 5);
    this.refreshBoxStyle(this.status);
    this.syncStatus(this.status);
    this.updateHostStyle();
    this.renderUpdate();
  }

  @onConnectedInnerHtml({ useShadow: true })
  render() {
    return `
      <style>
        :host { display: block; padding: 20px; border-radius: 12px; transition: 0.3s; }
        .container { font-family: sans-serif; }
        .box { width: 100px; height: 100px; margin: 20px 0; border-radius: 8px; transition: 0.3s; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
        .item { padding: 10px; margin: 4px 0; border: 1px solid #ccc; border-radius: 4px; }
        .item.even { background: #f5f5f5; }
        .item.odd { background: #fff; }
        .item.highlight { border-color: #FF385C; background: #fff0f3; font-weight: bold; }
        .status-indicator { padding: 10px; border: 1px solid #333; display: inline-block; }
      </style>
      <div class="container">
        <h2>Advanced Apply Decorators Test</h2>
        <button id="btn-step">Step Interactions (${this.count})</button>
        
        <div class="box">BOX</div>
        
        <div class="status-indicator">Status: ${this.status}</div>
        
        <div class="list" style="margin-top: 20px;">
          <div class="item" data-index="0">Item 0</div>
          <div class="item" data-index="1">Item 1</div>
          <div class="item" data-index="2">Item 2</div>
          <div class="item" data-index="3">Item 3</div>
          <div class="item" data-index="4">Item 4</div>
        </div>
      </div>
    `;
  }

  @innerHtmlNode('.container button')
  renderUpdate() {
    return `Step Interactions (${this.count})`;
  }
}
