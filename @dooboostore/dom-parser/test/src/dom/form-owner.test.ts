import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser } from '@dooboostore/dom-parser';

console.log('🚀 Form owner association Tests Starting...');

const MARKUP = `<html><body>
<form id="a"><input name="own" value="1"><input form="b" name="other" value="2"><input form="nope" name="orphan" value="4"><input form="notform" name="wrongtype" value="5"></form>
<form id="b"></form>
<input form="a" name="external" value="3">
<div id="notform"></div>
</body></html>`;

describe('Form owner association (matches browsers)', () => {
    test('form.elements honors explicit association over ancestry', () => {
        const document = new DomParser(MARKUP).document as any;
        const names = (id: string) => {
            const els = document.getElementById(id).elements;
            const out: string[] = [];
            for (let i = 0; i < els.length; i++) out.push(els[i].getAttribute('name'));
            return out;
        };
        assert.deepEqual(names('a'), ['own', 'external'], 'a owns own + external');
        assert.deepEqual(names('b'), ['other'], 'b owns other only');
    });

    test('control.form resolves per spec, no ancestor fallback on explicit mismatch', () => {
        const document = new DomParser(MARKUP).document as any;
        const byName = (n: string) => document.querySelector(`[name="${n}"]`);
        assert.equal(byName('own').form?.getAttribute('id') ?? null, 'a', 'own -> a');
        assert.equal(byName('other').form?.getAttribute('id') ?? null, 'b', 'other -> b');
        assert.equal(byName('external').form?.getAttribute('id') ?? null, 'a', 'external -> a');
        assert.equal(byName('orphan').form, null, 'absent id -> null');
        assert.equal(byName('wrongtype').form, null, 'non-form match -> null (no ancestor fallback)');
    });

    test('elements are in tree order', () => {
        const document = new DomParser(
            '<html><body><form id="f"><select name="s"></select><input name="i"><textarea name="t"></textarea><button name="b"></button></form></body></html>'
        ).document as any;
        const els = document.getElementById('f').elements;
        const names: string[] = [];
        for (let i = 0; i < els.length; i++) names.push(els[i].getAttribute('name'));
        assert.deepEqual(names, ['s', 'i', 't', 'b'], 'tree order across tag groups');
    });
});
