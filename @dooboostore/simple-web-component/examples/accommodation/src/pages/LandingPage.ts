import { onInitialize, addEventListener, elementDefine, onConnectedInnerHtml } from '@dooboostore/simple-web-component';
import { Inject } from '@dooboostore/simple-boot';
import { Router} from '@dooboostore/core-web';
import { EventService } from '../services/EventService';

export default (w: Window, container: symbol) => {
  const tagName = 'swc-example-accommodation-landing-page';
  const existing = w.customElements.get(tagName);
  if (existing) {
    // Sim({ container: container })(existing);
    return tagName;
    // return existing;
  }

  // @Sim({ container: container })
  @elementDefine(tagName, { window: w })
  class LandingPage extends w.HTMLElement {
    private events: any[] = [];
    private router: Router;
    private eventService: EventService;

    @onInitialize
    onInitialize(router: Router, @Inject({ symbol: EventService.SYMBOL }) eventService: EventService) {
      this.router = router;
      this.eventService = eventService;
      this.events = this.eventService.getAllEvents();
    }

    @onConnectedInnerHtml({ useShadow: true })
    render() {
      return `
      <style>
        * { box-sizing: border-box; }
        :host { 
          display: block; 
          background: #fff; 
          max-width: 100%; 
          overflow-x: hidden; 
          color: #222; 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        /* Hero: Experience Focused */
        .hero { 
          height: 600px; 
          background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.2)), url('https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1440&q=80'); 
          background-size: cover; 
          background-position: center; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center; 
          color: white; 
          text-align: center;
          padding: 0 20px;
        }
        .hero h1 { font-size: 64px; margin: 0 0 16px 0; font-weight: 850; letter-spacing: -3px; line-height: 1.1; overflow-wrap: break-word; max-width: 100%; }
        .hero p { font-size: 22px; font-weight: 400; margin: 0 0 40px 0; opacity: 0.9; }
        
        /* Quick Discovery Bar */
        .discovery-bar { 
          background: white; 
          padding: 10px; 
          border-radius: 60px; 
          display: flex; 
          width: calc(100% - 40px); 
          max-width: 900px; 
          box-shadow: 0 20px 40px rgba(0,0,0,0.1); 
          margin-top: -60px; 
          position: relative; 
          z-index: 10; 
          margin-left: auto; 
          margin-right: auto;
          border: 1px solid #eee;
        }
        .discovery-item { flex: 1; padding: 15px 35px; border-right: 1px solid #EEE; display: flex; flex-direction: column; text-align: left; }
        .discovery-item:last-of-type { border-right: none; }
        .discovery-item label { font-size: 11px; font-weight: 850; color: #FF385C; text-transform: uppercase; margin-bottom: 4px; }
        .discovery-item span { font-size: 15px; color: #222; font-weight: 500; }
        .search-btn { background: #FF385C; color: white; border: none; padding: 0 40px; border-radius: 50px; font-weight: 700; cursor: pointer; transition: 0.2s; margin: 5px; font-size: 16px; min-height: 48px; }
        .search-btn:hover { background: #E31C5F; transform: scale(1.03); }

        /* Section Styling */
        .section { padding: 80px 40px; width: 100%; margin: 0 auto; color: #222; }
        .section-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 48px; }
        .section-header h2 { font-size: 36px; font-weight: 800; color: #222; margin: 0; letter-spacing: -1px; }
        .section-header p { color: #717171; font-size: 18px; margin: 8px 0 0 0; }
        .view-all { color: #222; font-weight: 600; text-decoration: underline; cursor: pointer; }

        /* Experience Categories */
        .categories { display: flex; gap: 20px; margin-bottom: 60px; overflow-x: auto; padding-bottom: 20px; scrollbar-width: none; }
        .categories::-webkit-scrollbar { display: none; }
        .cat-card { 
          min-width: 200px; 
          height: 120px; 
          border-radius: 16px; 
          background: #f7f7f7; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center; 
          gap: 10px; 
          cursor: pointer; 
          transition: 0.2s; 
          border: 1px solid transparent; 
          color: #222; 
        }
        .cat-card:hover { background: white; border-color: #DDD; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .cat-card span:first-child { font-size: 32px; }
        .cat-card span:last-child { font-weight: 600; font-size: 15px; color: #222; }

        /* Featured Events */
        .events-featured { display: grid; grid-template-columns: 2fr 1fr; gap: 32px; }
        .event-large-card { position: relative; border-radius: 24px; overflow: hidden; height: 500px; cursor: pointer; }
        .event-large-card img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s; }
        .event-large-card:hover img { transform: scale(1.05); }
        .event-overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 40px; background: linear-gradient(transparent, rgba(0,0,0,0.8)); color: white; }
        .event-overlay h3 { font-size: 32px; margin: 0 0 12px 0; color: white; }
        .event-overlay p { margin: 0; opacity: 0.9; font-size: 16px; color: white; }

        .event-list-side { display: flex; flex-direction: column; gap: 24px; }
        .event-small-card { display: flex; gap: 16px; align-items: center; cursor: pointer; }
        .event-small-img { width: 100px; height: 100px; border-radius: 12px; object-fit: cover; flex-shrink: 0; }
        .event-small-info h4 { margin: 0 0 4px 0; font-size: 18px; color: #222; }
        .event-small-info p { margin: 0; color: #717171; font-size: 14px; }

        /* Branding Slogan */
        .slogan-section { background: #F7F7F7; padding: 100px 40px; text-align: center; border-radius: 32px; margin: 0 20px 100px 20px; color: #222; }
        .slogan-section h2 { font-size: 48px; font-weight: 850; max-width: 800px; margin: 0 auto 32px auto; line-height: 1.2; color: #222; }
        .cta-btn { background: #222; color: white; border: none; padding: 16px 32px; border-radius: 8px; font-size: 18px; font-weight: 600; cursor: pointer; }

        /* --- Responsive Container Queries --- */
        @container (max-width: 1024px) {
          .hero h1 { font-size: 48px; }
          .events-featured { grid-template-columns: 1.5fr 1fr; }
        }

        @container (max-width: 768px) {
          .hero { height: 400px; }
          .hero h1 { font-size: 32px; letter-spacing: -1.2px; }
          .hero p { font-size: 15px; }
          
          .discovery-bar { 
            flex-direction: column; 
            border-radius: 20px; 
            margin-top: -60px; 
            padding: 12px;
          }
          .discovery-item { 
            border-right: none; 
            border-bottom: 1px solid #F0F0F0; 
            padding: 12px; 
          }
          .search-btn { margin-top: 8px; padding: 14px; width: 100%; border-radius: 12px; font-size: 15px; }

          .section { padding: 40px 20px; }
          .section-header { margin-bottom: 32px; }
          .section-header h2 { font-size: 24px; }
          .section-header p { font-size: 15px; }
          
          .events-featured { grid-template-columns: 1fr; gap: 32px; }
          .event-large-card { height: 350px; }
          .event-overlay { padding: 24px; }
          .event-overlay h3 { font-size: 22px; }
          
          .slogan-section { padding: 60px 20px; margin: 0 10px 60px 10px; border-radius: 24px; }
          .slogan-section h2 { font-size: 24px; }
        }

        @container (max-width: 600px) {
          .cat-card { min-width: 150px; height: 100px; gap: 8px; }
          .cat-card span:first-child { font-size: 24px; }
          .cat-card span:last-child { font-size: 13px; }
        }

        @container (max-width: 480px) {
          .hero h1 { font-size: 28px; }
          .section-header { flex-direction: column; align-items: flex-start; gap: 12px; }
        }
      </style>

      <div class="hero">
        <h1>일상에 영감을 더하는<br>축제 근처의 특별한 하룻밤</h1>
        <p>전 세계 10,000개 이상의 행사와 그 주변의 엄선된 숙소를 만나보세요.</p>
      </div>

      <div class="discovery-bar">
        <div class="discovery-item">
          <label>관심 행사</label>
          <span>어떤 경험을 원하시나요?</span>
        </div>
        <div class="discovery-item">
          <label>지역</label>
          <span>가고 싶은 도시</span>
        </div>
        <div class="discovery-item">
          <label>일정</label>
          <span>날짜 선택</span>
        </div>
        <button class="search-btn" id="start-discovery">축제 찾기</button>
      </div>

      <div class="section">
        <div class="section-header">
          <div>
            <h2>취향별 테마 탐색</h2>
            <p>당신의 여행 스타일을 선택해보세요.</p>
          </div>
        </div>
        <div class="categories">
          <div class="cat-card"><span>🎸</span><span>뮤직 페스티벌</span></div>
          <div class="cat-card"><span>🎨</span><span>아트 & 전시</span></div>
          <div class="cat-card"><span>🍲</span><span>미식 투어</span></div>
          <div class="cat-card"><span>⛺</span><span>캠핑 & 캠프파이어</span></div>
          <div class="cat-card"><span>🧘</span><span>웰니스 & 요가</span></div>
          <div class="cat-card"><span>🏛️</span><span>전통 문화 체험</span></div>
        </div>

        <div class="section-header">
          <div>
            <h2>지금 이 순간, 놓치지 말아야 할 행사</h2>
            <p>행사장까지 도보로 이동 가능한 숙소가 남아있습니다.</p>
          </div>
          <span class="view-all">전체보기</span>
        </div>

        <div class="events-featured">
          <div class="event-large-card" data-id="${this.events[0].id}">
            <img src="${this.events[0].imageUrl}">
            <div class="event-overlay">
              <div style="background:#FF385C; display:inline-block; padding:4px 12px; border-radius:4px; font-size:12px; font-weight:700; margin-bottom:12px;">인기 급상승</div>
              <h3>${this.events[0].title}</h3>
              <p>${this.events[0].location} · ${this.events[0].date}</p>
            </div>
          </div>
          
          <div class="event-list-side">
            ${this.events
              .slice(1)
              .map(
                e => `
              <div class="event-small-card" data-id="${e.id}">
                <img src="${e.imageUrl}" class="event-small-img">
                <div class="event-small-info">
                  <h4>${e.title}</h4>
                  <p>📍 ${e.location}</p>
                  <p>📅 ${e.date}</p>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </div>

      <div class="slogan-section">
        <h2>"단순한 숙박이 아닌,<br>그 지역의 삶 속으로 들어가는 경험"</h2>
        <button class="cta-btn" id="explore-stays">인근 숙소 전체보기</button>
      </div>
      `;
    }

    @addEventListener('#start-discovery, #explore-stays', 'click')
    onExplore() {
      this.router.go('/list');
    }

    @addEventListener('.event-large-card, .event-small-card', 'click', { delegate: true })
    onEventClick(e: any) {
      const id = e.target.closest('[data-id]').dataset.id;
      this.router.go(`/event/${id}`);
    }
  }
  return tagName;
};
