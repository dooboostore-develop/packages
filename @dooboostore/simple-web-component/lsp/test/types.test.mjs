// pnpm test — `.` 뒤 타입 완성 (TS LanguageService)
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import analyzer from '../out/server/analyzer.js';
import typeService from '../out/server/typeService.js';

const { Index, probeAt } = analyzer;
const { TypeService } = typeService;

const SRC = `
export default (w: Window) => {
  const tag = 'demo-click';
  @elementDefine(tag, { window: w })
  class DemoClick extends HTMLElement {
    private clicks = 0;
    @state('user') profile = { name: 'a', age: 1 };
    onClick() {}
    pick(name: string, count: number) {}
    render() {
      return \`<button swc-on-click="$w.loc|" swc-on-input="$host.cli|"></button>
        <span title="{{= $d.querySel| }}">@user.na|@</span>\`;
    }
  }
  return tag;
};
`;

test('member completion after `.`', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'swc-lsp-'));
  try {
    const file = path.join(dir, 'demo.ts');
    const marks = [];
    const text = SRC.replace(/\|/g, (_, o) => (marks.push(o - marks.length), ''));
    writeFileSync(file, text);
    const uri = pathToFileURL(file).href;
    const index = new Index();
    index.set(uri, text);
    const types = new TypeService(() => undefined);
    const at = i => {
      const probe = probeAt(index, uri, marks[i]);
      assert.ok(probe, `probe at mark ${i}`);
      return types.complete(file, text, probe).map(c => c.label);
    };
    assert.ok(at(0).includes('location'), '$w. → Window');
    const host = at(1);
    assert.ok(host.includes('clicks') && host.includes('onClick') && host.includes('innerHTML'), '$host. → 소유 클래스 + HTMLElement');
    assert.ok(at(2).includes('querySelector'), '{{= $d. → Document');
    assert.deepEqual(at(3).sort(), ['age', 'name'], '@user. → @state 필드 타입');

    // 정의 / hover: $host.onClick → 원본 파일의 onClick 선언, @user → profile 필드 타입
    const { scriptAt } = analyzer;
    const withCall = text.replace('$host.cli', '$host.onClick');
    index.set(uri, withCall);
    const [def] = (() => { const end = withCall.indexOf('$host.onClick') + '$host.onClick'.length; return types.definition(file, withCall, scriptAt(index, uri, end)); })();
    assert.equal(def.fileName, file);
    assert.equal(withCall.slice(def.start, def.end), 'onClick');
    assert.ok(withCall.indexOf('onClick() {}') === def.start, '선언 위치(원본 기준)');
    index.set(uri, text);
    assert.match(types.hover(file, text, scriptAt(index, uri, text.indexOf('@user') + 5)), /profile|name: string/);

    // Cmd+P: $host.pick( → pick(name: string, count: number)
    const withSig = text.replace('$host.cli', '$host.pick(1, ');
    index.set(uri, withSig);
    const sig = types.signature(file, withSig, scriptAt(index, uri, withSig.indexOf('$host.pick(1, ') + 14));
    assert.equal(sig.signatures[0].label, 'pick(name: string, count: number): void');
    assert.equal(sig.activeParameter, 1);
    index.set(uri, text);

    // 소유 클래스가 없는 .html 은 $host 가 HTMLElement
    const html = path.join(dir, 'index.html');
    const htmlText = '<button swc-on-click="$host.inner"></button>';
    index.set(pathToFileURL(html).href, htmlText);
    const probe = probeAt(index, pathToFileURL(html).href, htmlText.indexOf('inner') + 5);
    assert.ok(types.complete(html, htmlText, probe).map(c => c.label).includes('innerHTML'));
    // 점이 없으면 probe 아님 (기존 $ 변수 목록 완성으로)
    assert.equal(probeAt(index, pathToFileURL(html).href, htmlText.indexOf('$host') + 3), undefined);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('type errors inside template scripts', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'swc-lsp-'));
  try {
    const file = path.join(dir, 'diag.ts');
    const text = `
@elementDefine('x-diag')
class XDiag extends HTMLElement {
  @state('user') profile = { name: 'a' };
  tt(aa: string) { return aa; }
  render() {
    return \`<button swc-on-click="$host.tt(4)" swc-on-input="$host.tt('ok')" title="{{= $host.nope }}">@user.name@ @missing@</button>
      <i class="\${this.tt('x')}" swc-on-blur="$host.tt(\${1})"></i>
      <input swc-on-input="this.value.trim()" title="{{= this.checked }}"><x-diag swc-on-connected="this.focus()"></x-diag>
      <style>@media (max-width: 1px) { a { color: red } } @font-face {}</style>\`;
  }
}
`;
    writeFileSync(file, text);
    const { scriptsIn } = analyzer;
    const index = new Index();
    const uri = pathToFileURL(file).href;
    index.set(uri, text);
    const problems = new TypeService(() => undefined).diagnostics(file, text, scriptsIn(index.files.get(uri)));
    const at = problems.map(p => [text.slice(p.start, p.end), p.message.split('\n')[0]]);
    // 틀린 것 세 개만: 인자 타입, 없는 멤버, 없는 이름 — ${} 섞인 것 / <style> 은 검사 안 함
    // this 는 그 요소: <input> 의 this.value / this.checked 는 정상, SWC 태그는 HTMLElement
    assert.deepEqual(at.map(a => a[0]).sort(), ['4', 'missing', 'nope'].sort(), JSON.stringify(at));
    assert.match(at.find(a => a[0] === '4')[1], /number.*string/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
