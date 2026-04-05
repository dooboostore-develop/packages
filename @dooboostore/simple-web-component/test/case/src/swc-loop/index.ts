import swcRegister, { elementDefine, onConnectedInnerHtml } from '@dooboostore/simple-web-component';

swcRegister(window);

@elementDefine('loop-test-app', { window })
class LoopTestApp extends HTMLElement {
  @onConnectedInnerHtml({ useShadow: true })
  render() {
    return `<slot></slot>`;
  }

  // Handle deletion by updating the value property of the loop
  deleteItem(index: number) {
    const loop = document.getElementById('main-loop') as any;
    console.log('>>> [Loop Test App] Removing index:', index);
    const newList = [...loop.value];
    newList.splice(index, 1);
    loop.value = newList;
  }
}

const loop = document.getElementById('main-loop') as any;

// --- Button Actions ---

document.getElementById('reset-btn')?.addEventListener('click', () => {
  console.log('>>> [Loop Test] Resetting list via .value = [...]');
  loop.value = [
    { name: 'Dave', age: 40 },
    { name: 'Eve', age: 22 }
  ];
});

document.getElementById('append-btn')?.addEventListener('click', () => {
  const name = 'Guest ' + Math.floor(Math.random() * 100);
  const age = Math.floor(Math.random() * 50) + 5;
  console.log(`>>> [Loop Test] Pushing: ${name} (age ${age})`);
  loop.value = [...loop.value, { name, age }];
});

document.getElementById('clear-btn')?.addEventListener('click', () => {
  console.log('>>> [Loop Test] Clearing list');
  loop.value = [];
});
