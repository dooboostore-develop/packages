import { elementDefine, onConnectedInnerHtml, addEventListener, emitCustomEventThis } from '@dooboostore/simple-web-component';

export default (w: Window) => {
  const tagName = 'swc-example-accommodation-header';
  const existing = w.customElements.get(tagName);
  if (existing) return existing;



  @elementDefine(tagName, { window: w })
  class AppHeader extends w.HTMLElement {
    @onConnectedInnerHtml({ useShadow: true })
    render() {
      return `
      <style>
        * { box-sizing: border-box; }
        :host { display: block; position: sticky; top: 0; z-index: 100; background: white; border-bottom: 1px solid #f0f0f0; box-sizing: border-box; }
        header { display: flex; justify-content: space-between; align-items: center; padding: 0 40px; height: 80px; width: 100%; margin: 0 auto; }
        .logo { font-size: 24px; font-weight: 850; color: #FF385C; cursor: pointer; letter-spacing: -1px; text-decoration: none; }
        .nav { display: flex; gap: 32px; font-size: 15px; font-weight: 600; align-items: center; }
        .nav-item { cursor: pointer; color: #222; padding: 10px 0; border-bottom: 2px solid transparent; transition: 0.2s; }
        .nav-item:hover { color: #FF385C; border-bottom-color: #FF385C; }
        .user-section { display: flex; align-items: center; gap: 12px; border: 1px solid #DDD; padding: 8px 14px; border-radius: 25px; cursor: pointer; transition: box-shadow 0.2s; }
        .user-section:hover { box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .user-section > span { color: #717171; font-size: 20px;}

        @container (max-width: 768px) {
          header { padding: 0 16px; height: 60px; }
          .nav { display: none; }
          .logo { font-size: 18px; }
          .user-section { padding: 6px 10px; gap: 8px; }
        }
        @container (max-width: 480px) {
          header { padding: 0 12px; height: 56px; }
          .logo { font-size: 16px; }
          .user-section span { display: none; }
        }
      </style>
      <header>
        <a class="logo" id="logo" data-path="/">STAY LUXE</a>
        <nav class="nav">
          <span class="nav-item" data-path="/">홈</span>
          <span class="nav-item" data-path="/list">숙소 찾기</span>
          <span class="nav-item">위시리스트</span>
          <span class="nav-item">숙소 호스팅하기</span>
        </nav>
        <div class="user-section">
          <span>☰</span>
          <div style="width: 32px; height: 32px; background: #717171; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">U</div>
        </div>
      </header>
      `;
    }

    @addEventListener('.nav-item, #logo', 'click', { delegate: true })
    @emitCustomEventThis('navigate', { bubbles: true, attributeName: 'on-navigate' })
    onNavigate(e: any) {
      const target = e.target.closest('[data-path]');
      return { path: target?.dataset.path || '/' };
    }
  }
  return AppHeader;
};
