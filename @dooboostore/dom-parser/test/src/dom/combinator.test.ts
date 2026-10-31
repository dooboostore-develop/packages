import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser, parseHTML } from '@dooboostore/dom-parser';

// Ground truth: Chromium (via Playwright) for every expectation below.
// Covers happy-dom#2505, #2507, #2550 and #2489 classes.
describe('selector combinators (descendant, >, +, ~)', () => {
    test('descendant and child combinators', () => {
        const doc = new DomParser('<div id="o"><span>hi</span></div>').document as any;
        assert.equal(doc.querySelectorAll('div span').length, 1);
        assert.equal(doc.querySelectorAll('div > span').length, 1);
        assert.equal(doc.querySelector('span').matches('div span'), true);
    });

    test('sibling combinators (happy-dom#2505)', () => {
        const doc = new DomParser('<a></a><b></b><c></c><b></b>').document as any;
        assert.equal(doc.querySelectorAll('a ~ b').length, 2);
        assert.equal(doc.querySelectorAll('a ~ *').length, 3);
        assert.equal(doc.querySelectorAll('a ~ * ~ *').length, 2);
        assert.equal(doc.querySelectorAll('a + b').length, 1);
        assert.equal(doc.querySelectorAll('b + b').length, 0);
    });

    test('pseudo-class between functionals needs working ">" (happy-dom#2507)', () => {
        const doc = new DomParser('<r><c></c><d></d><e></e></r>').document as any;
        assert.equal(doc.querySelectorAll('r > c').length, 1);
        assert.equal(doc.querySelectorAll('r > :not(c):first-child:nth-child(2)').length, 0);
        assert.equal(doc.querySelectorAll('r > :first-child:nth-child(2)').length, 0);
    });

    test('escaped colon in tag name, incl. descendant (happy-dom#2550)', () => {
        const doc = new DomParser('<q:template><span id="inner"></span></q:template><span id="outer"></span>').document as any;
        assert.equal(doc.querySelector('q\\:template')?.tagName, 'Q:TEMPLATE');
        assert.equal(doc.getElementById('inner')?.closest('q\\:template')?.tagName, 'Q:TEMPLATE');
        assert.equal(doc.getElementById('outer')?.closest('q\\:template'), null);
        assert.equal(doc.querySelectorAll('q\\:template span').length, 1);
    });

    test('matches() reflects the live document (happy-dom#2489)', () => {
        const doc = new DomParser('<header><div><span></span></div></header>').document as any;
        const span = doc.querySelector('span');
        assert.equal(span.matches('[data-stage] span'), false);
        doc.querySelector('header').setAttribute('data-stage', 'lean');
        assert.equal(span.matches('[data-stage] span'), true);
        assert.equal(span.matches('[data-stage]  span'), true);
    });

    test('comma lists still work', () => {
        const doc = new DomParser('<div></div><p></p>').document as any;
        assert.equal(doc.querySelectorAll('div, p').length, 2);
    });

    test(':not with brackets inside keeps one compound (happy-dom#2077)', () => {
        const doc = new DomParser('<div attr2="val2" attr3="(val3)"></div><div attr3="(val3)"></div>').document as any;
        assert.equal(doc.querySelectorAll(':not([attr2="val2"])[attr3="(val3)"]').length, 1);
    });

    test(':scope is the queried root, evaluated fresh every call (nwsapi#144 class)', () => {
        const doc = new DomParser('<!doctype html><html><head></head><body><div></div></body></html>').document as any;
        assert.deepEqual(
            Array.from(doc.querySelectorAll(':scope>*')).map((e: any) => e.tagName),
            ['HEAD', 'BODY']
        );
        doc.body.querySelectorAll('*');
        assert.deepEqual(
            Array.from(doc.querySelectorAll(':scope>*')).map((e: any) => e.tagName),
            ['HEAD', 'BODY']
        );
        assert.equal(doc.querySelector('div').querySelectorAll(':scope>*').length, 0);
        assert.equal(doc.querySelector('div').matches(':scope'), true);
        assert.deepEqual(
            Array.from(doc.querySelectorAll(':scope')).map((e: any) => e.tagName),
            ['HTML']
        );
    });

    test('shadow scoping: selectors never cross the shadow boundary except via :host (happy-dom#2554)', () => {
        const window = parseHTML('<div></div>') as any;
        const document = window.document;
        const host = document.createElement('div');
        host.id = 'host';
        document.body.appendChild(host);
        const shadowRoot = host.attachShadow({ mode: 'open' });
        const target = document.createElement('span');
        target.className = 'target';
        shadowRoot.appendChild(target);
        assert.equal(shadowRoot.querySelectorAll('#host .target').length, 0);
        assert.equal(shadowRoot.querySelectorAll(':host .target').length, 1);
        assert.equal(shadowRoot.querySelectorAll(':host').length, 0);
        assert.equal(host.matches(':host'), false);
        assert.equal(target.matches(':host span'), true);
        assert.equal(target.matches('div span'), false);
    });

    test(':host() functional form matches host against its argument', () => {        const window = parseHTML('<div id="host" class="x"></div>') as any;
        const document = window.document;
        const host = document.querySelector('#host');
        const shadowRoot = host.attachShadow({ mode: 'open' });
        shadowRoot.innerHTML = '<span class="t"></span>';
        const span = shadowRoot.querySelector('span');
        assert.equal(shadowRoot.querySelectorAll(':host(.x) span').length, 1);
        assert.equal(shadowRoot.querySelectorAll(':host(.y) span').length, 0);
        assert.equal(host.matches(':host(.x)'), false);
        assert.equal(span.matches(':host(.x) span'), true);
        assert.equal(span.matches(':host(.y) span'), false);
    });

    test(':nth-child() an+b microsyntax (odd/even/2n/2n+1/-n+2)', () => {
        const doc = new DomParser('<ul><li>a</li><li>b</li><li>c</li><li>d</li><li>e</li></ul>').document as any;
        assert.equal(doc.querySelectorAll('li:nth-child(2n)').length, 2);
        assert.equal(doc.querySelectorAll('li:nth-child(odd)').length, 3);
        assert.equal(doc.querySelectorAll('li:nth-child(even)').length, 2);
        assert.equal(doc.querySelectorAll('li:nth-child(2n+1)').length, 3);
        assert.equal(doc.querySelectorAll('li:nth-child(-n+2)').length, 2);
        assert.equal(doc.querySelectorAll('li:nth-child(n)').length, 5);
        assert.equal(doc.querySelectorAll('li:nth-child(3)').length, 1);
    });

    test(':is/:where and positional type selectors', () => {
        const doc = new DomParser('<div><p>a</p><span>b</span></div><ul><li>x</li><span>y</span><li>z</li></ul><ol><li>only</li></ol>').document as any;
        assert.equal(doc.querySelectorAll(':is(div, span)').length, 3);
        assert.equal(doc.querySelectorAll(':where(div, span)').length, 3);
        assert.equal(doc.querySelectorAll(':is(div, :not(ul))').length, 11);
        assert.equal(doc.querySelectorAll('li:nth-of-type(2)').length, 1);
        assert.equal(doc.querySelectorAll('li:nth-last-child(1)').length, 2);
        assert.equal(doc.querySelectorAll('li:nth-last-of-type(1)').length, 2);
        assert.equal(doc.querySelectorAll('span:first-of-type').length, 2);
        assert.equal(doc.querySelectorAll('ol li:only-child').length, 1);
    });

    test('CSS escape sequences in identifiers (hex and single-char)', () => {
        const doc = new DomParser('<div id="9abc" class="9abc"></div><q:template></q:template>').document as any;
        assert.equal(doc.querySelectorAll('#\\39 abc').length, 1);
        assert.equal(doc.querySelectorAll('.\\39 abc').length, 1);
        assert.equal(doc.querySelectorAll('q\\:template').length, 1);
    });

    test(':lang() matches own or inherited language', () => {
        const doc = new DomParser('<div id="a" lang="en-US"><p id="p1">x</p></div><div id="b" lang="FR"><p id="p2">y</p></div><div id="c" LANG="EN"></div>').document as any;
        const ids = (sel: string) => Array.from(doc.querySelectorAll(sel)).map((e: any) => e.id || e.tagName).join(',');
        assert.equal(ids(':lang(en)'), 'a,p1,c');
        assert.equal(ids(':lang(en-US)'), 'a,p1');
        assert.equal(ids(':lang(fr)'), 'b,p2');
        assert.equal(ids(':lang(de)'), '');
    });

    test(':link/:visited and :required/:optional', () => {        const doc = new DomParser('<a id="a1" href="/x">x</a><a id="a2">nohref</a><area id="ar" href="/y"><input id="i1" required><input id="i2"><select id="s1" required></select><textarea id="t1"></textarea><button id="b1" required>x</button><button id="b2">y</button>').document as any;
        const ids = (sel: string) => Array.from(doc.querySelectorAll(sel)).map((e: any) => e.id).join(',');
        assert.equal(ids(':link'), 'a1,ar');
        assert.equal(doc.querySelectorAll(':visited').length, 0);
        assert.equal(ids(':required'), 'i1,s1');
        assert.equal(ids(':optional'), 'i2,t1,b1,b2');
        assert.equal(doc.querySelector('button#b1').matches(':required'), false);
    });
});
    test(':host-context() matches host or its light-DOM ancestors', () => {
        const doc = new DomParser('<section id="s"><div id="host" class="x"><div id="mid"></div></div></section>').document as any;
        const host = doc.querySelector('#host');
        const shadowRoot = host.attachShadow({ mode: 'open' });
        shadowRoot.innerHTML = '<span class="t"></span>';
        const span = shadowRoot.querySelector('span');
        assert.equal(shadowRoot.querySelectorAll(':host-context(div#host) span').length, 1);
        assert.equal(shadowRoot.querySelectorAll(':host-context(section) span').length, 1);
        assert.equal(shadowRoot.querySelectorAll(':host-context(article) span').length, 0);
        assert.equal(span.matches(':host-context(div#host) span'), true);
        assert.equal(host.matches(':host-context(section)'), false);
    });

    test(':read-only/:read-write', () => {
        const doc = new DomParser('<input id="a"><input id="b" readonly><input id="c" disabled><input id="d" type="checkbox"><textarea id="e"></textarea><textarea id="f" readonly></textarea><select id="g"></select><div id="h" contenteditable></div><div id="i"></div><input id="w" type="week"><input id="nt" type="text" value="x" readonly>').document as any;
        const ids = (sel: string) => Array.from(doc.querySelectorAll(sel)).map((e: any) => e.id || e.tagName).join(',');
        assert.equal(ids(':read-only'), 'HTML,HEAD,BODY,b,c,d,f,g,i,nt');
        assert.equal(ids(':read-write'), 'a,e,h,w');
    });

    test(':target matches the element addressed by the document URL fragment', () => {
        const bare = new DomParser('<div id="a"></div><div id="b"></div>').document as any;
        assert.equal(bare.querySelectorAll(':target').length, 0);
        const doc = new DomParser('<div id="a"></div><div id="b"></div>').document as any;
        doc.location = { href: 'http://x/#b' };
        assert.deepEqual(Array.from(doc.querySelectorAll(':target')).map((e: any) => e.id), ['b']);
        assert.equal(doc.querySelector('#b').matches(':target'), true);
        assert.equal(doc.querySelector('#a').matches(':target'), false);
    });

    test(':placeholder-shown needs placeholder plus empty value on applicable controls', () => {
        const doc = new DomParser('<input id="a" placeholder="name"><input id="b" placeholder="name" value="x"><input id="c"><input id="n" type="number" placeholder="x"><input id="cb" type="checkbox" placeholder="x"><textarea id="d" placeholder="t"></textarea><textarea id="e" placeholder="t">y</textarea>').document as any;
        const ids = (sel: string) => Array.from(doc.querySelectorAll(sel)).map((e: any) => e.id).join(',');
        assert.equal(ids(':placeholder-shown'), 'a,n,d');
    });

    test('parsed attributes sync IDL fields (value/type/checked/required/selected/readOnly)', () => {
        const doc = new DomParser('<input id="a" type="checkbox" checked><input id="b" type="text" value="x" required><option id="c" selected></option><textarea id="d" readonly>hi</textarea>').document as any;
        const a = doc.querySelector('#a');
        assert.equal(a.checked, true);
        assert.equal(a.type, 'checkbox');
        const b = doc.querySelector('#b');
        assert.equal(b.value, 'x');
        assert.equal(b.required, true);
        assert.equal(doc.querySelector('#c').selected, true);
        const d = doc.querySelector('#d');
        assert.equal(d.readOnly, true);
        assert.equal(d.value, 'hi');
    });
});
