import swcRegister, { elementDefine, onConnectedInnerHtml, query, queryAll, addEventListener } from '@dooboostore/simple-web-component';

swcRegister(window);
@elementDefine('query-element', { window })
class QueryElement extends HTMLElement {
  // 1. Property injection (@query)
  @query('h2') titleEl?: HTMLElement;
  @query('#main-input') inputEl?: HTMLInputElement;

  // 2. Property injection (@queryAll)
  @queryAll('.item') listItems?: NodeListOf<HTMLElement>;

  @onConnectedInnerHtml({ useShadow: true })
  render() {
    return `
      <div style="padding: 20px; border: 2px solid #34a853; border-radius: 8px; background: #e6f4ea;">
        <h2>Query Test Component</h2>
        
        <div style="margin-bottom: 15px;">
          <input id="main-input" type="text" value="Hello Queries!" style="padding: 8px; width: 200px;">
          <button id="check-btn">Check Elements</button>
        </div>

        <ul style="padding-left: 20px;">
          <li class="item">Item A</li>
          <li class="item">Item B</li>
          <li class="item">Item C</li>
        </ul>

        <div id="log" style="margin-top: 20px; padding: 10px; background: white; border: 1px solid #ccc; font-family: monospace; font-size: 0.9em; white-space: pre-wrap;"></div>
      </div>
    `;
  }

  @addEventListener('#check-btn', 'click')
  onCheck() {
    const logEl = this.shadowRoot?.getElementById('log');
    if (!logEl) return;

    let text = '--- Query Results ---\n';

    // Test @query
    text += `@query('h2'): ${this.titleEl?.textContent}\n`;
    text += `@query('#main-input'): value = "${this.inputEl?.value}"\n`;

    // Test @queryAll
    text += `@queryAll('.item'): count = ${this.listItems?.length}\n`;
    this.listItems?.forEach((it, i) => {
      text += `  [${i}] ${it.textContent}\n`;
    });

    logEl.textContent = text;
    console.log('Query check:', { title: this.titleEl, input: this.inputEl, items: this.listItems });
  }
}
