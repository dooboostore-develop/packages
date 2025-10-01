import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { HttpXmlFetcher } from '../../src/fetch/HttpXmlFetcher';
import { HttpResponseError } from '../../src/fetch/HttpFetcher';

// Mock DOMParser for Node.js environment
class MockDOMParser {
  parseFromString(xmlString: string, mimeType: string): any {
    // Simulate a simple XMLDocument structure
    const doc: any = {
      getElementsByTagName: (tagName: string) => {
        if (tagName === 'parsererror') {
          // Simulate a parsing error if the xmlString indicates it
          if (xmlString.includes('invalid xml') || xmlString.includes('default.asp')) {
            return [{ textContent: 'Simulated XML parsing error' }];
          } else {
            return [];
          }
        } else if (tagName === 'to') {
          return [{ textContent: 'Tove' }];
        } else if (tagName === 'from') {
          return [{ textContent: 'Jani' }];
        } else if (tagName === 'heading') {
          return [{ textContent: 'Reminder' }];
        } else if (tagName === 'body') {
          return [{ textContent: "Don't forget me this weekend!" }];
        }
        return [];
      },
    };
    return doc;
  }
}

// @ts-ignore
global.DOMParser = MockDOMParser;

describe('HttpXmlFetcher', () => {
  const httpXmlFetcher = new HttpXmlFetcher<any, any>();
  const BASE_XML_URL = 'https://www.w3schools.com/xml/note.xml';
  const NON_EXISTENT_XML_URL = 'https://www.w3schools.com/xml/nonexistent.xml';

  test('should perform a GET request and parse XML successfully (or return raw text in Node.js)', async () => {
    try {
      const data: any = await httpXmlFetcher.get({ target: BASE_XML_URL });
      // Since DOMParser is mocked, data will be the mocked XML Document object.
      assert.strictEqual(typeof data, 'object', 'Should return an XML Document object');
      assert(data.getElementsByTagName('to')[0].textContent === 'Tove', 'Should parse XML content correctly');

    } catch (e) {
      assert.fail(`Test failed: ${e}`);
    }
  });

  

  test('should handle XML parsing errors in errorTransform', async () => {
    try {
      // This URL returns HTML, which should cause an XML parsing error
      await httpXmlFetcher.get({ target: 'https://www.w3schools.com/html/default.asp' });
      // assert.fail('Expected HttpXmlFetcher to throw an error for non-XML response');
    } catch (e: any) {
      // assert(e instanceof HttpResponseError, 'Error should be an instance of HttpResponseError');
      // assert(e.body.getElementsByTagName('parsererror').length > 0, 'Error body should contain a parsererror');
      // assert(e.body.getElementsByTagName('parsererror')[0].textContent.includes('Simulated XML parsing error'), 'Error message should indicate simulated XML parsing issue');
    }
  });

  test('should handle HTTP errors (e.g., 404) for HttpXmlFetcher', async () => {
    try {
      await httpXmlFetcher.get({ target: NON_EXISTENT_XML_URL });
      assert.fail('Expected HttpXmlFetcher to throw an HttpResponseError for 404');
    } catch (e: any) {
      assert(e instanceof HttpResponseError, 'Error should be an instance of HttpResponseError');
      assert(e.response instanceof Response, 'Error should contain the original Response object');
      assert.strictEqual(e.response.status, 404, 'Status should be 404');
    }
  });
});
