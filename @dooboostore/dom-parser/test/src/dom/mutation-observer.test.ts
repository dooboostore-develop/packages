import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser } from '@dooboostore/dom-parser';

console.log('🚀 MutationObserver Tests Starting...');

// Ground truth: Chromium (measured matrix) — jsdom#4447 class is the
// transient-observer case.
describe('MutationObserver (matches Chromium)', () => {
    const make = () => {
        const w = new DomParser('<html><body></body></html>').window as any;
        const document = w.document;
        const parent = document.createElement('div');
        parent.id = 'p';
        const child = document.createElement('div');
        child.id = 'c';
        parent.appendChild(child);
        document.body.appendChild(parent);
        return { w, document, parent, child };
    };

    test('transient observers report mutations inside a just-removed subtree', () => {
        const { w, parent, child } = make();
        const mo = new w.MutationObserver(() => {});
        mo.observe(parent, { childList: true, subtree: true, attributes: true });

        child.remove();
        child.setAttribute('x', '1');
        child.append(w.document.createElement('span'));

        assert.deepEqual(
            mo.takeRecords().map((r: any) => r.type + ':' + (r.target.id || r.target.tagName)),
            ['childList:p', 'attributes:c', 'childList:c'],
        );
    });

    test('subtree gates descendant records; attributeFilter gates names', () => {
        {
            const { w, parent, child } = make();
            const mo = new w.MutationObserver(() => {});
            mo.observe(parent, { childList: true, attributes: true });
            child.setAttribute('a', '1');
            parent.appendChild(w.document.createElement('i'));
            assert.deepEqual(
                mo.takeRecords().map((r: any) => r.type + ':' + (r.target.id || r.target.tagName)),
                ['childList:p'],
            );
        }
        {
            const { w, parent, child } = make();
            const mo = new w.MutationObserver(() => {});
            mo.observe(parent, { attributes: true, subtree: true, attributeFilter: ['a'] });
            child.setAttribute('a', '1');
            child.setAttribute('b', '2');
            assert.deepEqual(
                mo.takeRecords().map((r: any) => r.type + ':' + (r.target.id || r.target.tagName)),
                ['attributes:c'],
            );
        }
    });

    test('callback receives records asynchronously; takeRecords clears', async () => {
        const { w, parent, child } = make();
        const seen: any[] = [];
        const mo = new w.MutationObserver((records: any[]) => {
            seen.push(records.map((r) => r.type));
        });
        mo.observe(parent, { attributes: true, subtree: true });
        child.setAttribute('a', '1');
        assert.equal(seen.length, 0, 'not delivered synchronously');
        await new Promise((r) => setTimeout(r, 0));
        assert.deepEqual(seen, [['attributes']]);

        child.setAttribute('b', '2');
        assert.equal(mo.takeRecords().length, 1, 'takeRecords returns pending');
        assert.equal(mo.takeRecords().length, 0, 'and clears them');
    });

    test('disconnect stops delivery', async () => {
        const { w, parent, child } = make();
        const seen: any[] = [];
        const mo = new w.MutationObserver((records: any[]) => seen.push(records.length));
        mo.observe(parent, { attributes: true, subtree: true });
        mo.disconnect();
        child.setAttribute('a', '1');
        await new Promise((r) => setTimeout(r, 0));
        assert.deepEqual(seen, []);
    });

    test('oldValue is reported for attributes when requested', () => {
        const { w, parent, child } = make();
        child.setAttribute('a', 'v1');
        const mo = new w.MutationObserver(() => {});
        mo.observe(parent, { attributes: true, subtree: true, attributeOldValue: true });
        child.setAttribute('a', 'v2');
        const records = mo.takeRecords();
        assert.equal(records.length, 1);
        assert.equal(records[0].attributeName, 'a');
        assert.equal(records[0].oldValue, 'v1');
    });
});
