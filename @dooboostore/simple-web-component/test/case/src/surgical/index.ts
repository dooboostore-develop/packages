import swcRegister, { elementDefine, onConnectedInnerHtml, replaceChildren, appendChild, addEventListener, htmlFragment, textNode, htmlDivElement, htmlSpanElement, createElement, HostSet, setStyle, updateStyle, setClassList, updateClassList } from '@dooboostore/simple-web-component';

swcRegister(window);
@elementDefine('surgical-element', { window })
class SurgicalElement extends HTMLElement {
  isActive = false;

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

  // --- 5. setStyle & updateStyle ---
  @setStyle('#style-box')
  testSetStyle() {
    return { background: '#ffcdd2', color: '#c62828', padding: '20px', border: '2px solid #c62828' };
  }

  @updateStyle('#style-box')
  testUpdateStyle() {
    return { borderRadius: '15px', fontWeight: 'bold', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' };
  }

  // --- 6. updateClassList (Object mapping or String/Array) ---
  @updateClassList('#style-box')
  testUpdateClassList() {
    // If you want to just add classes as string/array:
    // return ['added-via-update', 'another-one'];
    return { 'active-mode': this.isActive, 'fancy-border': true };
  }

  // --- 7. setClassList (Replace all) ---
  @setClassList('#style-box')
  testSetClassList() {
    return { 'new-class-only': true, 'removed-class': false };
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
  onCreate(event: Event, h: HostSet) {
    console.log('--->', event, h);
    this.testCreateElement();
  }

  @addEventListener('#btn-set-style', 'click')
  onSetStyle() {
    this.testSetStyle();
  }

  @addEventListener('#btn-update-style', 'click')
  onUpdateStyle() {
    this.testUpdateStyle();
  }

  @addEventListener('#btn-update-class', 'click')
  onUpdateClass() {
    this.isActive = !this.isActive;
    this.testUpdateClassList();
  }

  @addEventListener('#btn-set-class', 'click')
  onSetClass() {
    this.testSetClassList();
  }

  @onConnectedInnerHtml({ useShadow: true })
  render() {
    return `
      <style>
        .surgical-box { border: 2px solid #2196f3; padding: 20px; border-radius: 10px; background: #e3f2fd; font-family: sans-serif; }
        .outlet { border: 1px dashed #2196f3; padding: 15px; background: white; min-height: 40px; margin: 10px 0; transition: all 0.3s; }
        .item { padding: 8px; margin: 5px 0; border: 1px solid #ccc; border-radius: 4px; font-size: 0.9em; }
        .controls { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
        button { padding: 8px 12px; cursor: pointer; }

        /* Class Test Styles */
        .active-mode { background: #e1f5fe !important; border-color: #03a9f4 !important; border-style: solid !important; }
        .fancy-border { border-width: 4px !important; }
        .new-class-only { background: black !important; color: white !important; }
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

        <hr>

        <h3>3. Style & Class Surgical Test</h3>
        <div class="controls">
            <button id="btn-set-style">setStyle (Replace All Styles)</button>
            <button id="btn-update-style">updateStyle (Merge Styles)</button>
            <button id="btn-update-class">updateClassList (Toggle Object)</button>
            <button id="btn-set-class">setClassList (Replace All Classes)</button>
        </div>
        <div id="style-box" class="outlet" style="font-size: 1.2em;">Target Box for Styling & Classes</div>
      </div>
    `;
  }
}

console.log('>>> SurgicalElement module loaded with TemplateUtils');
