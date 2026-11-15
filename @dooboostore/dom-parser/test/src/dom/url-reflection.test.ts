import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser } from '@dooboostore/dom-parser';

// a.href, img.src … 는 브라우저처럼 문서 base URL 기준 절대 주소. 적힌 값은 getAttribute.
const page = (html: string, href = 'https://example.com/blog/post?x=1') => new DomParser(html, { href });

describe('URL reflecting properties', () => {
  test('resolve against the document URL', () => {
    const { document } = page(`
      <a href="/docs?q=1">a</a><area href="../map"><link href="style.css">
      <img src="img/a.png"><script src="//cdn.example.org/x.js"></script>
      <iframe src="frame.html"></iframe><embed src="movie.swf">
      <form action="send"></form>`);
    const $ = (s: string) => document.querySelector(s) as any;
    assert.equal($('a').href, 'https://example.com/docs?q=1');
    assert.equal($('a').getAttribute('href'), '/docs?q=1');
    assert.equal($('area').href, 'https://example.com/map');
    assert.equal($('link').href, 'https://example.com/blog/style.css');
    assert.equal($('img').src, 'https://example.com/blog/img/a.png');
    assert.equal($('script').src, 'https://cdn.example.org/x.js');
    assert.equal($('iframe').src, 'https://example.com/blog/frame.html');
    assert.equal($('embed').src, 'https://example.com/blog/movie.swf');
    assert.equal($('form').action, 'https://example.com/blog/send');
  });

  test('absent → "", form without action → document URL, setter writes the attribute', () => {
    const { document } = page('<a>x</a><img><form></form>');
    const a = document.querySelector('a') as any;
    assert.equal(a.href, '');
    assert.equal((document.querySelector('img') as any).src, '');
    assert.equal((document.querySelector('form') as any).action, 'https://example.com/blog/post?x=1');
    a.href = '#top';
    assert.equal(a.getAttribute('href'), '#top');
    assert.equal(a.href, 'https://example.com/blog/post?x=1#top');
  });

  test('<base href> changes the base; base.href resolves against the document URL', () => {
    const { document } = page('<base href="/static/"><a href="x.html">x</a>');
    assert.equal((document.querySelector('base') as any).href, 'https://example.com/static/');
    assert.equal(document.body.baseURI, 'https://example.com/static/');
    assert.equal((document.querySelector('a') as any).href, 'https://example.com/static/x.html');
  });

  test('no document URL (about:blank) or unparsable → the attribute as written', () => {
    const { document } = new DomParser('<a href="/docs">x</a><img src="http://[bad">');
    assert.equal((document.querySelector('a') as any).href, '/docs');
    assert.equal((document.querySelector('img') as any).src, 'http://[bad');
  });
});
