import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser } from '@dooboostore/dom-parser';
import { parseHTML } from 'linkedom';
import { JSDOM } from 'jsdom';
import { parseFromString } from 'dom-parser';
import {data} from '../../data/Data'
console.log('🚀 Performance Tests Starting...');

describe('Performance Tests', () => {
    // test('should test JSDOM performance', () => {
    //     console.log('Testing JSDOM...');
    //
    //     const parser = new JSDOM(data.bigHTML, {
    //         pretendToBeVisual: false,
    //         resources: "usable",
    //         runScripts: "outside-only",
    //         beforeParse(window: any) {
    //             // Disable default stylesheet loading
    //             window.document.implementation.createHTMLDocument = function () {
    //                 const doc = window.document.implementation.createDocument(null, 'html', null);
    //                 return doc;
    //             };
    //         }
    //     });
    //
    //     const document = parser.window.document;
    //     const elements = document.querySelectorAll('*');
    //     console.log('JSDOM elements count:', elements.length);
    //
    //     assert.ok(parser, 'JSDOM parser should exist');
    //     assert.ok(document, 'Document should exist');
    //     assert.ok(elements.length > 0, 'Should have elements');
    //
    //     console.log('✅ JSDOM test works');
    // });
    test('should test dom-render performance', () => {
        console.log('Testing dom-render...');

        const parser = parseFromString(data.bigHTML);

        // const document = parser;
        // const elements = document.querySelectorAll('*');
        // console.log('dom-render elements count:', elements.length);
        //
        // assert.ok(parser, 'dom-render parser should exist');
        // assert.ok(document, 'Document should exist');
        // assert.ok(elements.length > 0, 'Should have elements');

        console.log('✅ dom-render test works');
    });

    test('should test linkedom performance', () => {
        console.log('Testing linkedom...');

        const { window } = parseHTML(data.bigHTML);

        const document = window.document;
        const elements = document.querySelectorAll('*');
        console.log('linkedom elements count:', elements.length);

        assert.ok(window, 'linkedom window should exist');
        assert.ok(document, 'Document should exist');
        assert.ok(elements.length > 0, 'Should have elements');

        console.log('✅ linkedom test works');
    });

    test('should test dom-parser performance', () => {
        console.log('Testing dom-parser...');

        const parser = new DomParser(data.bigHTML);

        const document = parser.document;
        const elements = document.querySelectorAll('*');
        console.log('dom-parser elements count:', elements.length);

        assert.ok(parser, 'dom-parser should exist');
        assert.ok(document, 'Document should exist');
        assert.ok(elements.length > 0, 'Should have elements');

        console.log('✅ dom-parser test works');
    });
});