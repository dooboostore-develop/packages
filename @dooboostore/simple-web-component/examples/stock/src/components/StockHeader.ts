import { elementDefine, onConnectedInnerHtml, addEventListener, emitCustomEventHost } from '@dooboostore/simple-web-component';

export default (w: Window) => {
  const tagName = 'swc-example-stock-stock-header';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;


  @elementDefine(tagName, { window: w })
  class StockHeader extends w.HTMLElement {
    @onConnectedInnerHtml({ useShadow: true })
    render() {
      return `
      <style>
        * { box-sizing: border-box; }
        :host { display: block; position: sticky; top: 0; z-index: 100; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px); border-bottom: 1px solid #f2f4f6; box-sizing: border-box; }
        header { display: flex; justify-content: space-between; align-items: center; padding: 0 40px; height: 60px; width: 100%; margin: 0 auto; }
        .logo { font-size: 20px; font-weight: 800; color: #3182f6; cursor: pointer; letter-spacing: -0.5px; }
        .nav { display: flex; gap: 24px; }
        .nav-item { font-size: 15px; font-weight: 600; color: #4e5968; cursor: pointer; transition: color 0.2s; }
        .nav-item:hover { color: #191f28; }
        .search-icon { font-size: 20px; cursor: pointer; }
      </style>
      <header>
        <div class="logo" id="logo" data-path="/">STAY STOCK</div>
        <nav class="nav">
          <span class="nav-item" data-path="/">내 주식</span>
          <span class="nav-item" data-path="/">오늘의 시세</span>
        </nav>
        <div class="search-icon">🔍</div>
      </header>
      `;
    }

    @addEventListener('.nav-item, #logo', 'click', { delegate: true })
    @emitCustomEventHost('navigate', { bubbles: true, attributeName: 'on-navigate' })
    onNavigate(e: any) {
      const target = e.target.closest('[data-path]');
      return { path: target?.dataset.path || '/' };
    }
  }
  return tagName;
};
