import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser, parseHTML as swcParseHTML } from '@dooboostore/dom-parser';
import { parseHTML as linkedParseHTML } from 'linkedom';
import { JSDOM } from 'jsdom';
import { data } from '../../data/Data';

console.log('🚀 Performance Tests Starting...');

describe('Performance Tests', () => {
  test('should test JSDOM performance', async () => {
    console.log('Testing JSDOM...');
    // Explicitly disable features that cause async activity
    const dom = new JSDOM(data.bigHTML, {
      resources: 'usable', // or undefined to avoid external fetching
      runScripts: 'outside-only'
    });
    const document = dom.window.document;
    const elements = document.querySelectorAll('*');
    console.log('JSDOM elements count:', elements.length);
    assert.ok(elements.length > 0);

    // Close window and wait a bit for any pending internal cleanup
    dom.window.close();
    await new Promise(resolve => setTimeout(resolve, 0));
    console.log('✅ JSDOM test works');
  });

  test('should test linkedom performance', async () => {
    console.log('Testing linkedom...');
    const { window } = linkedParseHTML(data.bigHTML);
    const document = window.document;
    const elements = document.querySelectorAll('*');
    console.log('linkedom elements count:', elements.length);
    assert.ok(elements.length > 0);

    // window.close();
    await new Promise(resolve => setTimeout(resolve, 0));
    console.log('✅ linkedom test works');
  });

  test('should test dom-parser performance', async () => {
    console.log('Testing dom-parser...');
    const parser = new DomParser(data.bigHTML);
    const document = parser.document;
    const elements = document.querySelectorAll('*');
    console.log('dom-parser elements count:', elements.length);
    assert.ok(elements.length > 0);

    parser.destroy();
    await new Promise(resolve => setTimeout(resolve, 0));
    console.log('✅ dom-parser test works');
  });

  test('should test dom-parser utility performance', async () => {
    console.log('Testing dom-parser utility...');
    const window = swcParseHTML(data.bigHTML);
    const document = window.document;
    const elements = document.querySelectorAll('*');
    console.log('dom-parser utility elements count:', elements.length);
    assert.ok(elements.length > 0);

    window.close();
    await new Promise(resolve => setTimeout(resolve, 0));
    console.log('✅ dom-parser utility test works');
  });
});
