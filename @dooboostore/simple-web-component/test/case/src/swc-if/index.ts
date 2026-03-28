import { elementDefine, onConnectedInnerHtml, SwcIf } from '@dooboostore/simple-web-component';

console.log('>>> SwcIf class definition:', SwcIf);

// Define a parent to handle event delegation for children
@elementDefine('if-test-app')
class IfTestApp extends HTMLElement {
  @onConnectedInnerHtml({ useShadow: true })
  render() {
    return `<slot></slot>`;
  }
}

(window as any).userData = null;

const ifEl = document.getElementById('my-if') as SwcIf;

// --- Test Actions ---

const testContainer = document.createElement('div');
testContainer.style.marginTop = '20px';
testContainer.style.padding = '15px';
testContainer.style.border = '1px solid #ccc';
document.body.appendChild(testContainer);

const btnSet = document.createElement('button');
btnSet.textContent = 'Set Attribute (Show User)';
btnSet.onclick = () => {
  (window as any).userData = { name: 'John Doe', age: 30 };
  ifEl.setAttribute('on-get-value', 'userData');
};
testContainer.appendChild(btnSet);

const btnRemove = document.createElement('button');
btnRemove.textContent = 'Remove Attribute (Hide)';
btnRemove.style.marginLeft = '10px';
btnRemove.onclick = () => {
  ifEl.removeAttribute('on-get-value');
};
testContainer.appendChild(btnRemove);
