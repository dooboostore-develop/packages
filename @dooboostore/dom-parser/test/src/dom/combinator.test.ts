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
});
