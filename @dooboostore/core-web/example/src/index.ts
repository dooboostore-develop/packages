import 'reflect-metadata'
import { Runnable } from '@dooboostore/core/runs/Runnable';
import { ClipboardExample } from './clipboard/ClipboardExample';
import { StorageExample } from './storage/StorageExample';
import { CookieExample } from './cookie/CookieExample';
import { ElementExample } from './element/ElementExample';
import { EventExample } from './event/EventExample';
import { WindowExample } from './window/WindowExample';

interface ExampleConfig {
  title: string;
  description: string;
  icon: string;
  example: Runnable;
}

const examples: ExampleConfig[] = [
  {
    title: 'Clipboard',
    description: '클립보드 읽기/쓰기 기능',
    icon: '📋',
    example: new ClipboardExample(),
  },
  {
    title: 'Storage',
    description: 'LocalStorage와 SessionStorage 관리',
    icon: '💾',
    example: new StorageExample(),
  },
  {
    title: 'Cookie',
    description: '쿠키 생성, 읽기, 삭제',
    icon: '🍪',
    example: new CookieExample(),
  },
  {
    title: 'Element',
    description: 'DOM 요소 조작 및 로딩',
    icon: '🎯',
    example: new ElementExample(),
  },
  {
    title: 'Event',
    description: '이벤트 처리 유틸리티',
    icon: '⚡',
    example: new EventExample(),
  },
  {
    title: 'Window',
    description: '윈도우 및 스크롤 유틸리티',
    icon: '🪟',
    example: new WindowExample(),
  },
];

function renderMenu() {
  const menu = document.getElementById('menu');
  if (!menu) return;

  menu.innerHTML = '';
  
  examples.forEach((config, index) => {
    const item = document.createElement('div');
    item.className = 'menu-item';
    item.innerHTML = `
      <h3>${config.icon} ${config.title}</h3>
      <p>${config.description}</p>
    `;
    
    item.addEventListener('click', async () => {
      const output = document.getElementById('output');
      if (!output) return;
      
      output.innerHTML = `<h2>${config.icon} ${config.title}</h2>`;
      
      try {
        await config.example.run();
      } catch (error) {
        output.innerHTML += `
          <div class="result-item error">
            <strong>Error:</strong> ${error}
          </div>
        `;
      }
    });
    
    menu.appendChild(item);
  });
}

// 유틸리티 함수들
export function showResult(title: string, content: string, success: boolean = true) {
  const output = document.getElementById('output');
  if (!output) return;
  
  const className = success ? 'success' : 'error';
  const resultDiv = document.createElement('div');
  resultDiv.className = `result-item ${className}`;
  resultDiv.innerHTML = `
    <strong>${title}:</strong><br/>
    ${content}
  `;
  output.appendChild(resultDiv);
}

export function showCode(code: string) {
  const output = document.getElementById('output');
  if (!output) return;
  
  const pre = document.createElement('pre');
  pre.textContent = code;
  output.appendChild(pre);
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  renderMenu();
});
