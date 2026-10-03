import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert';
import { createWindow, sleep } from './dom.ts';
import { elementDefine, onConnectedBodyShadow, event, innerHtml, defineSwcAppAll } from '../../src/index.ts';

// 쇼케이스 사이트 /start 페이지의 퀵스타트 코드와 같은 것 — 문서가 거짓이 되지 않게 실제로 돌린다.
// (사이트 쪽: src/pages/start/index.ts. 한쪽을 바꾸면 다른 쪽도 맞출 것)
// 사용자 프로젝트의 env.d.ts 와 같은 선언 (w.HTMLElement 를 쓰려면 필요)
declare global { interface Window { HTMLElement: typeof HTMLElement } }

const helloCard = (w: Window) => {
  const tag = 'hello-card';
  if (w.customElements.get(tag)) return tag;

  @elementDefine(tag, { window: w })
  class HelloCard extends w.HTMLElement {
    private count = 0;

    @onConnectedBodyShadow
    render() {
      return `<p>Hello, ${this.getAttribute('name')}!</p>
              <button>clicked <b>0</b> times</button>`;
    }

    @event('button', 'click')
    @innerHtml('b')
    onClick() {
      return String(++this.count);
    }
  }
  return tag;
};

test('quickstart (/start page): body app + hello-card renders and counts clicks', async () => {
  const { w, destroy } = await createWindow(`<!DOCTYPE html><html><body id="app" is="swc-app-body"><hello-card name="World"></hello-card></body></html>`);
  await defineSwcAppAll(w);
  (w.document.querySelector('#app') as any).connect({
    window: w,
    container: Symbol('app'),
    onStartedLazyDefineComponent: [helloCard],
  });
  await sleep(100);
  const card: any = w.document.querySelector('hello-card');
  assert.strictEqual(card.shadowRoot.querySelector('p').textContent, 'Hello, World!');
  card.shadowRoot.querySelector('button').click();
  card.shadowRoot.querySelector('button').click();
  assert.strictEqual(card.shadowRoot.querySelector('b').textContent, '2');
  destroy();
});
