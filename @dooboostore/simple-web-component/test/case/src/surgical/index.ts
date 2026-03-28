import {elementDefine, onConnectedInnerHtml, replaceChildren, appendChild, addEventListener, htmlFragment, textNode, htmlDivElement, htmlSpanElement, createElement, HostSet} from '@dooboostore/simple-web-component';

@elementDefine('surgical-element')
class SurgicalElement extends HTMLElement {
  // --- 1. htmlFragment & replaceChildren ---
  @replaceChildren('#display-outlet')
  testHtmlFragment() {
    console.log('>>> [Surgical Test] htmlFragment called');
    return htmlFragment`
      <div style="background: #fff9c4; padding: 10px; border: 1px solid #fbc02d;">
        <strong>Fragment Result:</strong>
        <p>This was created using <code>htmlFragment\`...\`</code></p>
      </div>
    `;
  }

  // --- 2. textNode & appendChild ---
  @appendChild('#display-outlet')
  testTextNode() {
    console.log('>>> [Surgical Test] textNode called');
    return textNode` (Added via textNode\`)`;
  }

  // --- 3. html***Element & appendChild ---
  @appendChild('#list-outlet')
  testElementFactory() {
    const res = htmlDivElement`
        <span style="color: #673ab7;">[Factory]</span> New Row at ${new Date().toLocaleTimeString()}
    `;
    console.log('>>> [Surgical Test] htmlDivElement result:', res);
    return res;
  }

  // --- 4. createElement (Structured) ---
  @appendChild('#list-outlet', { position: 'afterBegin' })
  testCreateElement() {
    console.log('>>> [Surgical Test] createElement called');
    return createElement({ tagName: 'div', innerHtml: '<strong>[Structured]</strong> Prepended via <code>createElement</code>' }, { class: 'item', style: 'background: #f1f8e9; border-color: #8bc34a;' });
  }

  // --- Event Listeners ---
  @addEventListener('#btn-fragment', 'click')
  onFragment() {
    this.testHtmlFragment();
  }

  @addEventListener('#btn-textnode', 'click')
  onTextNode() {
    this.testTextNode();
  }

  @addEventListener('#btn-factory', 'click')
  onFactory() {
    this.testElementFactory();
  }

  @addEventListener('#btn-create', 'click')
  onCreate(event: Event, h:HostSet) {
    console.log('--->', event, h)
    this.testCreateElement();
  }

  @onConnectedInnerHtml({ useShadow: true })
  render() {
    return `
      <style>
        .surgical-box { border: 2px solid #2196f3; padding: 20px; border-radius: 10px; background: #e3f2fd; font-family: sans-serif; }
        .outlet { border: 1px dashed #2196f3; padding: 15px; background: white; min-height: 40px; margin: 10px 0; }
        .item { padding: 8px; margin: 5px 0; border: 1px solid #ccc; border-radius: 4px; font-size: 0.9em; }
        .controls { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
        button { padding: 8px 12px; cursor: pointer; }
      </style>

      <div class="surgical-box">
        <h3>1. Template Utilities Test</h3>
        <div class="controls">
            <button id="btn-fragment">replaceChildren (htmlFragment)</button>
            <button id="btn-textnode">appendChild (textNode)</button>
        </div>
        <div id="display-outlet" class="outlet">Initial Context</div>

        <hr>

        <h3>2. Element Creation Test</h3>
        <div class="controls">
            <button id="btn-factory">appendChild (htmlDivElement factory)</button>
            <button id="btn-create">appendChild (createElement structured)</button>
        </div>
        <div id="list-outlet" class="outlet">
            <div class="item">Initial Static Item</div>
        </div>
      </div>
    `;
  }
}

console.log('>>> SurgicalElement module loaded with TemplateUtils');
