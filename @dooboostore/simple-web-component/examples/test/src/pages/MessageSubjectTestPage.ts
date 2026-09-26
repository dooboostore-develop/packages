import {
  elementDefine, onConnectedBodyLight, publishSwcAppMessage, subscribeSwcAppMessage,
  appMessage, onConnectedAfter
} from '@dooboostore/simple-web-component';
import type { SwcAppMessage } from '@dooboostore/simple-web-component';

/**
 * @subscribeSwcAppMessage(type, { subject }) 검증 페이지.
 * - behavior: 늦게 붙어도 마지막 1개 수신
 * - replay: 늦게 붙어도 버퍼 전체 시간순 수신
 * - 미지정: live만 수신
 */
const SUBJECT_META = {
  behavior: { title: 'behavior', desc: '늦게 붙어도 마지막 1개 + 이후 live', color: '#7c3aed' },
  replay: { title: 'replay', desc: '늦게 붙어도 버퍼 전체 시간순 + 이후 live', color: '#0369a1' },
  live: { title: 'subject (live)', desc: '붙은 이후 live만 수신', color: '#15803d' }
} as const;

type SubjectKey = keyof typeof SUBJECT_META;

const defineChild = (w: Window, tagName: string, key: SubjectKey, subject?: 'subject' | 'behavior' | 'replay') => {
  if (w.customElements.get(tagName)) return;
  const meta = SUBJECT_META[key];
  @elementDefine(tagName, { window: w })
  class MessageSubjectChild extends w.HTMLElement {
    private box: string[] = [];

    @subscribeSwcAppMessage('subject-test', subject ? { subject } : undefined)
    onMsg(@appMessage msg: SwcAppMessage<string>) {
      this.box.push(String(msg.data));
      this.paint();
    }

    private paint() {
      const out = this.querySelector('.out');
      if (out) {
        out.innerHTML = this.box.map((v, i, a) =>
          i === a.length - 1
            ? `<li class="latest"><span class="n">new</span>${v}</li>`
            : `<li><span class="n">${i + 1}</span>${v}</li>`
        ).join('');
        const badge = this.querySelector('.count');
        if (badge) badge.textContent = `${this.box.length} received`;
      }
    }

    @onConnectedBodyLight
    render() {
      const sc = `sc-${key}`;
      const items = this.box.map((v, i, a) => i === a.length - 1
        ? `<li class="latest"><span class="n">new</span>${v}</li>`
        : `<li><span class="n">${i + 1}</span>${v}</li>`).join('');
      return `
        <style>
          .${sc} .card { border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background: #fff; }
          .${sc} .head { padding: 12px 16px; color: #fff; background: ${meta.color}; }
          .${sc} .head b { font-size: 15px; }
          .${sc} .head .desc { font-size: 12px; opacity: .85; margin-top: 2px; }
          .${sc} .body { padding: 12px 16px; min-height: 120px; }
          .${sc} .count { display: inline-block; font-size: 12px; font-weight: 700; color: ${meta.color}; background: #f3f4f6; border-radius: 999px; padding: 2px 10px; margin-bottom: 8px; }
          .${sc} ul.out { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
          .${sc} ul.out li { font-size: 13px; background: #f9fafb; border: 1px solid #eef0f3; border-radius: 8px; padding: 6px 10px; }
          .${sc} ul.out li .n { display: inline-block; min-width: 20px; height: 20px; line-height: 20px; text-align: center; font-size: 11px; font-weight: 700; color: #fff; background: ${meta.color}; border-radius: 6px; margin-right: 8px; }
          .${sc} ul.out li.latest { background: ${meta.color}; border-color: ${meta.color}; color: #fff; font-weight: 700; }
          .${sc} ul.out li.latest .n { background: #fff; color: ${meta.color}; }
        </style>
        <div class="${sc}">
        <div class="card">
          <div class="head"><b>${meta.title}</b><div class="desc">${meta.desc}</div></div>
          <div class="body"><span class="count">${this.box.length} received</span><ul class="out">${items}</ul></div>
        </div>
        </div>`;
    }
  }
};

export default (w: Window) => {
  const tagName = 'swc-example-message-subject-test-page';
  if (w.customElements.get(tagName)) return tagName;
  defineChild(w, 'subject-child-behavior', 'behavior', 'behavior');
  defineChild(w, 'subject-child-replay', 'replay', 'replay');
  defineChild(w, 'subject-child-live', 'live');

  @elementDefine(tagName, { window: w })
  class MessageSubjectTestPage extends w.HTMLElement {
    private seq = 0;

    @publishSwcAppMessage('subject-test')
    publishSubject(data: string) {
      return data;
    }

    @onConnectedAfter
    async setup() {
      // 자식이 붙기 전에 3건 발행 → replay 대상
      this.publishSubject('first');
      this.publishSubject('second');
      this.publishSubject('third');
      const slot = this.querySelector('#slot')!;
      for (const t of ['subject-child-behavior', 'subject-child-replay', 'subject-child-live']) {
        slot.appendChild(w.document.createElement(t));
      }
      await new Promise(r => w.setTimeout(r, 100));
      // 자식 연결 후 live 1건
      this.publishSubject('fourth-live');
      // 수동 발행 버튼
      this.querySelector('#pub')!.addEventListener('click', () => {
        this.seq += 1;
        this.publishSubject(`manual-${this.seq}`);
      });
      // behavior 자식 늦게 추가 → 마지막 1개 즉시 수신 확인용
      this.querySelector('#append-behavior')!.addEventListener('click', () => {
        this.querySelector('#slot')!.appendChild(w.document.createElement('subject-child-behavior'));
      });
    }

    @onConnectedBodyLight
    render() {
      return `
        <style>
          .wrap { max-width: 960px; margin: 0 auto; padding: 24px 16px 48px; }
          h1 { font-size: 22px; margin: 0 0 4px; }
          .sub { color: #6b7280; font-size: 13px; margin: 0 0 16px; }
          #pub, #append-behavior { font-size: 14px; font-weight: 700; color: #fff; background: #111827; border: 0; border-radius: 10px; padding: 10px 20px; cursor: pointer; margin: 0 8px 16px 0; }
          #pub:hover, #append-behavior:hover { background: #374151; }
          #append-behavior { background: #7c3aed; }
          #append-behavior:hover { background: #6d28d9; }
          #slot { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }
        </style>
        <div class="wrap">
          <h1>message subject test</h1>
          <p class="sub">진입 시 first/second/third 발행 → 자식 동적 부착 → fourth-live → publish 버튼 수동 발행</p>
          <button id="pub">publish</button><button id="append-behavior">append behavior child</button>
          <div id="slot"></div>
        </div>`;
    }
  }

  return tagName;
};
