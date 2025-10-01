import { DomRender } from '@dooboostore/dom-render/DomRender';
import { Appender } from '@dooboostore/dom-render/operators/Appender';

export class ArrayBindingExample {
  run() {
    const output = document.getElementById('output');
    if (!output) return;

    const demoDiv = document.createElement('div');
    demoDiv.className = 'demo-box';
    demoDiv.innerHTML = `
      <h3>Array Binding - Two Methods</h3>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
        <!-- Method 1: dr-for-of (Full Re-render) -->
        <div style="border: 2px solid #8b5cf6; padding: 15px; border-radius: 8px;">
          <h4 style="color: #8b5cf6;">Method 1: dr-for-of</h4>
          <p style="font-size: 12px; color: #666;">Re-renders entire array on change</p>
          <div style="margin: 10px 0;">
            <input type="text" id="forof-input" placeholder="Enter task" style="width: 60%;">
            <button id="forof-add">Add</button>
          </div>
          <ul id="forof-list" dr-for-of="@this@.forOfItems" style="list-style: none; padding: 0;">
            <li style="padding: 8px; margin: 4px 0; background: #f3f4f6; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
              <span>\${#it#}$</span>
              <button class="forof-remove-btn" style="padding: 2px 8px; font-size: 11px;">Remove</button>
            </li>
          </ul>
          <button id="forof-clear" style="margin-top: 10px;">Clear All</button>
        </div>

        <!-- Method 2: dr-appender (Incremental Update) -->
        <div style="border: 2px solid #10b981; padding: 15px; border-radius: 8px;">
          <h4 style="color: #10b981;">Method 2: dr-appender</h4>
          <p style="font-size: 12px; color: #666;">Updates only added/deleted/modified items</p>
          <div style="margin: 10px 0;">
            <input type="text" id="appender-input" placeholder="Enter task" style="width: 60%;">
            <button id="appender-add">Add</button>
          </div>
          <ul id="appender-list" style="list-style: none; padding: 0;">
            <li dr-appender="@this@.appenderItems" style="padding: 8px; margin: 4px 0; background: #f3f4f6; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
              <span>\${#it#}$</span>
              <button class="appender-remove-btn" style="padding: 2px 8px; font-size: 11px;">Remove</button>
            </li>
          </ul>
          <button id="appender-clear" style="margin-top: 10px;">Clear All</button>
        </div>
      </div>
    `;
    output.appendChild(demoDiv);

    // 초기 상태
    let state = {
      forOfItems: ['Task 1', 'Task 2', 'Task 3'],
      appenderItems: new Appender('Task A', 'Task B', 'Task C')
    };

    // DomRender 초기화
    const result = new DomRender({
      rootObject: state,
      target: demoDiv,
      config: { window }
    });
    state = result.rootObject;

    // Method 1: dr-for-of 이벤트 핸들러
    const forofInput = demoDiv.querySelector('#forof-input') as HTMLInputElement;
    const forofAddBtn = demoDiv.querySelector('#forof-add');
    const forofClearBtn = demoDiv.querySelector('#forof-clear');
    
    forofAddBtn?.addEventListener('click', () => {
      if (forofInput.value.trim()) {
        state.forOfItems.push(forofInput.value);
        // 전체 배열을 재할당하여 재렌더링 트리거
        state.forOfItems = [...state.forOfItems];
        forofInput.value = '';
      }
    });

    forofClearBtn?.addEventListener('click', () => {
      state.forOfItems = [];
    });

    // Remove 버튼들은 이벤트 위임으로 처리
    demoDiv.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('forof-remove-btn')) {
        const li = target.closest('li');
        const index = Array.from(li?.parentElement?.children || []).indexOf(li!);
        if (index !== -1) {
          state.forOfItems.splice(index, 1);
          state.forOfItems = [...state.forOfItems];
        }
      }
    });

    // Method 2: dr-appender 이벤트 핸들러
    const appenderInput = demoDiv.querySelector('#appender-input') as HTMLInputElement;
    const appenderAddBtn = demoDiv.querySelector('#appender-add');
    const appenderClearBtn = demoDiv.querySelector('#appender-clear');
    
    let appenderKeyCounter = 0;
    
    appenderAddBtn?.addEventListener('click', () => {
      if (appenderInput.value.trim()) {
        const key = `key-${Date.now()}-${appenderKeyCounter++}`;
        state.appenderItems.set(key, appenderInput.value);
        appenderInput.value = '';
      }
    });

    appenderClearBtn?.addEventListener('click', () => {
      state.appenderItems.clear();
    });

    // Appender remove 버튼 (이벤트 위임)
    demoDiv.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('appender-remove-btn')) {
        const li = target.closest('li');
        const index = Array.from(li?.parentElement?.children || []).indexOf(li!);
        if (index !== -1) {
          // Appender에서 키로 삭제
          const keys = Array.from(state.appenderItems.keyMap.keys());
          if (keys[index]) {
            state.appenderItems.delete(keys[index]);
          }
        }
      }
    });
  }
}
