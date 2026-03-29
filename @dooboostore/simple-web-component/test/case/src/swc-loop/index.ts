import swcRegister, { elementDefine, onConnectedInnerHtml, addEventListener } from '@dooboostore/simple-web-component';

swcRegister(window);
// Define a parent to test context
@elementDefine('loop-test-app', { window })
class LoopTestApp extends HTMLElement {
  @onConnectedInnerHtml({ useShadow: true })
  render() {
    return `<slot></slot>`;
  }

  // Helper for children to trigger loop removal
  deleteItem(index: number) {
    const loop = document.getElementById('main-loop') as any;
    console.log('>>> [Loop Test App] Request to remove index:', index);
    loop.remove(index);
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
  console.log(`>>> [Loop Test] Appending: ${name} (age ${age})`);
  loop.append({ name, age });
});

document.getElementById('remove-last-btn')?.addEventListener('click', () => {
  console.log('>>> [Loop Test] Removing last row');
  loop.remove();
});
