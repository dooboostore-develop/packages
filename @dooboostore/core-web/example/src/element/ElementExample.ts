import { Runnable } from '@dooboostore/core/runs/Runnable';
import { ElementUtils } from '@dooboostore/core-web/element/ElementUtils';
import { showResult, showCode } from '../index';

export class ElementExample implements Runnable {
  async run(): Promise<void> {
    showResult('Element Utils', 'Testing DOM element utilities');
    
    // Load image example
    showResult('Loading Image', 'Loading a test image...', true);
    
    try {
      const img = await ElementUtils.loadImage('https://dooboostore-develop.github.io/assets/images/dooboostore.png');
      showResult('Image Loaded', `Image size: ${img.width}x${img.height}`, true);
      
      // Display the image
      const output = document.getElementById('output');
      if (output) {
        const imgEl = document.createElement('img');
        imgEl.src = img.src;
        imgEl.style.maxWidth = '150px';
        imgEl.style.borderRadius = '8px';
        imgEl.style.margin = '10px 0';
        output.appendChild(imgEl);
      }
    } catch (error) {
      showResult('Image Load Error', `${error}`, false);
    }
    
    // Test HTML fragment operations
    const testHTML = `
      <div class="test-container">
        <h3>Test Fragment</h3>
        <p>This is a test paragraph</p>
        <span>This is a test span</span>
      </div>
    `;
    
    const fragment = ElementUtils.htmlToFragment(testHTML, { document });
    showResult('HTML to Fragment', 'Created document fragment from HTML', true);
    
    const innerHTML = ElementUtils.toInnerHTML(fragment, { document });
    showResult('Fragment to HTML', `Fragment innerHTML: ${innerHTML.substring(0, 100)}...`, true);
    
    // Add fragment to page
    const output = document.getElementById('output');
    if (output) {
      output.appendChild(fragment);
    }
    
    // Test element querying
    const testContainer = document.querySelector('.test-container');
    if (testContainer) {
      const h3Element = ElementUtils.querySelector(testContainer, 'h3');
      if (h3Element) {
        showResult('Element Query', `Found h3: ${h3Element.textContent}`, true);
      }
      
      const spanElements = ElementUtils.querySelectorAll(testContainer, 'span');
      showResult('Element Query All', `Found ${spanElements.length} span elements`, true);
    }
    
    // Test element manipulation
    const testDiv = document.createElement('div');
    testDiv.innerHTML = '<p>Original content</p><span>Another element</span>';
    
    // Test attribute operations
    ElementUtils.setAttribute(testDiv, ['data-test', 'data-value']);
    showResult('Set Attributes', 'Set data attributes', true);
    
    ElementUtils.setAttributeAttr(testDiv, [
      { name: 'id', value: 'test-div' },
      { name: 'class', value: 'test-class' }
    ]);
    showResult('Set Attribute Objects', 'Set attributes with objects', true);
    
    const attributes = ElementUtils.getAttributeToObject(testDiv);
    showResult('Get Attributes', `Attributes: ${JSON.stringify(attributes)}`, true);
    
    // Test style operations
    testDiv.style.color = 'blue';
    testDiv.style.fontSize = '16px';
    testDiv.style.backgroundColor = 'yellow';
    
    const styles = ElementUtils.getStyleToObject(testDiv);
    showResult('Get Styles', `Styles: ${JSON.stringify(styles)}`, true);
    
    // Test element replacement
    const newElement = document.createElement('div');
    newElement.textContent = 'Replaced element';
    newElement.style.backgroundColor = 'lightgreen';
    newElement.style.padding = '10px';
    
    if (testDiv.firstElementChild) {
      ElementUtils.replaceWith(testDiv.firstElementChild, newElement);
      showResult('Replace Element', 'Replaced first child element', true);
    }
    
    // Add test div to output
    if (output) {
      output.appendChild(testDiv);
    }
    
    // Test node list operations
    const nodeList = ElementUtils.nodeList(testDiv);
    showResult('Node List', `Container has ${nodeList.length} child nodes`, true);
    
    const clonedNodes = ElementUtils.cloneNodeList(testDiv);
    showResult('Clone Node List', `Cloned ${clonedNodes.length} nodes`, true);
    
    // Test selector utilities
    const allDivs = ElementUtils.selectorElements('div', document);
    showResult('Selector Elements', `Found ${allDivs.length} div elements`, true);
    
    const allSpans = ElementUtils.selectorNodes('span', document);
    showResult('Selector Nodes', `Found ${allSpans.length} span nodes`, true);
    
    // Test attribute removal
    ElementUtils.removeAttribute(testDiv, ['data-test', 'data-value']);
    showResult('Remove Attributes', 'Removed data attributes', true);
    
    showResult('Info', 'ElementUtils provides comprehensive DOM element manipulation utilities');
  }
}
