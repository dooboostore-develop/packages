import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML, DomParser, NodeIterator } from '@dooboostore/dom-parser';

console.log('🚀 NodeIterator Mutation Tests Starting...');

// Ground truth: Chrome/Firefox/Safari + DOM Standard "remove a node"
// (NodeIterator pre-remove steps) and "adjust a node pointer".
// https://github.com/jsdom/jsdom/issues/3040
// https://github.com/dooboostore-develop/packages/issues/19
describe('NodeIterator survives removal during traversal (issue #19)', () => {
    test('jsdom#3040 repro: removing current text node visits the rest', () => {
        const window = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
        const document = window.document;

        const template = document.createElement('template');
        template.innerHTML = '<div>foo</div>bar';
        const fragment = template.content;
        const nodeIterator = document.createNodeIterator(fragment);

        let visited = false;
        const seen: string[] = [];
        let node;
        while ((node = nodeIterator.nextNode())) {
            seen.push(node.nodeName + ':' + (node.data ?? node.textContent));
            if (node.data && node.data === 'foo') {
                node.parentNode?.removeChild(node);
            } else if (node.data && node.data === 'bar') {
                visited = true;
            }
        }

        assert.equal(visited, true, 'should visit bar after removing foo');
        assert.deepEqual(seen, [
            '#document-fragment:foobar',
            'DIV:foo',
            '#text:foo',
            '#text:bar'
        ]);
    });

    test('reference rewinds to removed node parent, pointer stays after', () => {
        const window = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
        const document = window.document;

        const template = document.createElement('template');
        template.innerHTML = '<div>foo</div>bar';
        const it = document.createNodeIterator(template.content);
        it.nextNode(); // fragment
        it.nextNode(); // div
        it.nextNode(); // text foo
        assert.equal(it.referenceNode.nodeName, '#text');

        it.referenceNode.parentNode?.removeChild(it.referenceNode);
        assert.equal(it.referenceNode.nodeName, 'DIV');
        assert.equal(it.pointerBeforeReferenceNode, false);

        // traversal continues with the next sibling
        const next = it.nextNode();
        assert.equal(next?.nodeName, '#text');
        assert.equal((next as Text)?.data, 'bar');
    });

    test('removing an ancestor of the reference rewinds to its parent', () => {
        const window = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
        const document = window.document;

        const template = document.createElement('template');
        template.innerHTML = '<div><b>xy</b>tail</div>';
        const it = document.createNodeIterator(template.content);
        it.nextNode(); // fragment
        it.nextNode(); // div
        assert.equal(it.referenceNode.nodeName, 'DIV');

        it.referenceNode.parentNode?.removeChild(it.referenceNode);
        assert.equal(it.referenceNode.nodeName, '#document-fragment');
        assert.equal(it.pointerBeforeReferenceNode, false);
    });

    test('removing an unrelated node does not disturb the iterator', () => {
        const window = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
        const document = window.document;

        const template = document.createElement('template');
        template.innerHTML = '<div>foo</div><p>gone</p>bar';
        const it = document.createNodeIterator(template.content);
        it.nextNode(); // fragment
        it.nextNode(); // div
        const foo = it.nextNode(); // text foo
        assert.equal((foo as Text)?.data, 'foo');

        // remove the <p> subtree while reference is elsewhere
        const p = template.content.querySelector('p');
        assert.ok(p, 'p should exist');
        p.parentNode?.removeChild(p);

        assert.equal(it.referenceNode, foo, 'reference must be untouched');
        const seen: string[] = [];
        let n;
        while ((n = it.nextNode())) {
            seen.push(n.nodeName + ':' + (n.data ?? n.textContent));
        }
        assert.deepEqual(seen, ['#text:bar']);
    });

    test('previousNode still works around removals', () => {
        const doc = new DomParser('<html><body><div>a</div><div>b</div></body></html>').document;
        const it = doc.createNodeIterator(doc.body);
        const first = it.nextNode(); // body
        assert.equal(first?.nodeName, 'BODY');
        const divA = it.nextNode();
        assert.equal((divA as Element)?.textContent, 'a');
        // remove divA (the reference) then go backwards: should land on body
        divA?.parentNode?.removeChild(divA);
        assert.equal(it.referenceNode.nodeName, 'BODY');
        const prev = it.previousNode();
        assert.equal(prev?.nodeName, 'BODY');
    });

    test('filter functions and direct construction work', () => {
        const doc = new DomParser('<html><body><div>x</div><!--c--></body></html>').document;
        // direct construction used to throw (NodeFilter global); must not
        const direct = new NodeIterator(doc.body);
        assert.ok(direct.nextNode(), 'directly constructed iterator should work');
        // filter accepting only elements
        const it = doc.createNodeIterator(doc.body, 0xffffffff, (n: any) => (n.nodeType === 1 ? 1 : 3));
        const seen: string[] = [];
        let n;
        while ((n = it.nextNode())) {
            seen.push(n.nodeName);
        }
        assert.ok(!seen.includes('#text'), 'text nodes must be skipped, got: ' + seen.join(','));
        assert.ok(seen.includes('DIV'), 'div must be visited');
    });
});
