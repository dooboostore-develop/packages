import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser } from '@dooboostore/dom-parser';


describe('textnode Tests', () => {
  test('textnode', () => {

    const parser = new DomParser(`
            <html>
                <head>
                    <title>Complex CSS Test</title>
                </head>
                <body>
                    <div id="container"></div>
                </body>
            </html>
        `);
    const document = parser.document;
    const t = document.createTextNode('<div>Hello, World!</div>');
    const container = document.getElementById('container')!;
    container.appendChild(t);

    console.log(container.innerHTML);
    assert.strictEqual(container.innerHTML, '&lt;div&gt;Hello, World!&lt;/div&gt;');

    console.log('✅ Multiple complex JavaScript expressions innerHTML parsing works');
  });
});
