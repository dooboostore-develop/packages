// Per-library adapters. Every adapter exposes the same 4 operations so scenarios stay identical.
// Each load() imports lazily so cold-start can be measured in a fresh process.
let tick = 0;
export const libs = {
  'dom-parser': async () => {
    const { parseHTML } = await import('@dooboostore/dom-parser');
    return dom((html) => parseHTML(html).document);
  },
  jsdom: async () => {
    const { JSDOM } = await import('jsdom');
    return dom((html) => new JSDOM(html).window.document);
  },
  'happy-dom': async () => {
    const { Window } = await import('happy-dom');
    return dom((html) => {
      const w = new Window();
      w.document.write(html);
      return w.document;
    });
  },
  linkedom: async () => {
    const { parseHTML } = await import('linkedom');
    return dom((html) => parseHTML(html).document);
  },
  cheerio: async () => {
    const { load } = await import('cheerio');
    // cheerio is a jQuery-style API, not a DOM; included as the "fast parser" reference point.
    return {
      parse: (html) => load(html),
      query: ($, sel) => { $('body').attr('data-t', String(++tick)); return $(sel).length; },
      mutate: ($, n) => {
        const body = $('body');
        for (let i = 0; i < n; i++) body.append($('<div>').attr('data-i', i).addClass('m').text('x' + i));
        return $('.m').length;
      },
      innerHTML: ($) => { $('body').html('<ul>' + '<li>a</li>'.repeat(1000) + '</ul>'); return $('li').length; },
      serialize: ($) => $.html().length,
    };
  },
};

function dom(parse) {
  return {
    parse,
    // touch() busts per-document selector caches (happy-dom caches repeat queries) so all libs do real work.
    query: (doc, sel) => { doc.body.setAttribute('data-t', String(++tick)); return doc.querySelectorAll(sel).length; },
    mutate: (doc, n) => {
      const body = doc.body;
      for (let i = 0; i < n; i++) {
        const d = doc.createElement('div');
        d.setAttribute('data-i', String(i));
        d.className = 'm';
        d.textContent = 'x' + i;
        body.appendChild(d);
      }
      return doc.querySelectorAll('.m').length;
    },
    innerHTML: (doc) => {
      doc.body.innerHTML = '<ul>' + '<li>a</li>'.repeat(1000) + '</ul>';
      return doc.querySelectorAll('li').length;
    },
    serialize: (doc) => doc.documentElement.outerHTML.length,
    // jsdom/happy-dom windows keep timers/listeners alive; without this, parse loops OOM.
    dispose: (doc) => { try { doc.defaultView?.close?.(); doc.defaultView?.happyDOM?.close?.(); } catch {} },
  };
}
