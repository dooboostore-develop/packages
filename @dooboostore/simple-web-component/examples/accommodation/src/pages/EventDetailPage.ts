import { onConnectedSwcApp, addEventListener, applyNodeHost, attributeHost, elementDefine, onConnectedInnerHtml, onInitialize } from '@dooboostore/simple-web-component';
import { Inject, Sim } from '@dooboostore/simple-boot';
import { EventService } from '../services/EventService';
import { AccommodationService } from '../services/AccommodationService';
import { Router } from '@dooboostore/core-web';

export default (w: Window, container: symbol) => {
  const tagName = 'swc-example-accommodation-event-detail-page';
  const existing = w.customElements.get(tagName);
  if (existing) {
    return tagName;
  }

  @Sim({ container: container })
  @elementDefine(tagName, { window: w })
  class EventDetailPage extends w.HTMLElement {
    private event: any = null;
    private nearbyAccommodations: any[] = [];
    private eventService: EventService;
    private accommodationService: AccommodationService;
    @attributeHost('event-id') eventId: string;
    router: Router<any>;

    @onConnectedSwcApp
    onInitialize(@Inject({ symbol: EventService.SYMBOL }) eventService: EventService, @Inject({ symbol: AccommodationService.SYMBOL }) accommodationService: AccommodationService, router: Router) {
      this.eventService = eventService;
      this.accommodationService = accommodationService;
      this.router = router;
      this.event = this.eventService.getEventById(this.eventId);
      if (this.event) {
        // 인근 숙소 필터링 (행사 위치가 포함된 숙소 검색)
        this.nearbyAccommodations = this.accommodationService.getAccommodations().filter(acc => acc.name.includes(this.event.location) || acc.description.includes(this.event.location));
      }
      this.render();
    }

    @applyNodeHost({ position: 'innerHtml' })
    @onConnectedInnerHtml({ useShadow: true })
    render() {
      if (!this.event) return '<div>행사를 찾을 수 없습니다.</div>';
      const { title, location, date, description, imageUrl, tags, category } = this.event;

      return `
      <style>
        * { box-sizing: border-box; }
        :host { display: block; background: white; padding-bottom: 120px; box-sizing: border-box; overflow-x: hidden; }
        
        .hero-section { height: 500px; position: relative; overflow: hidden; background: #000; }
        .hero-image { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.6) scale(1.1); transition: transform 10s linear; }
        :host(:hover) .hero-image { transform: scale(1.2); }
        
        .hero-overlay { position: absolute; inset: 0; background: linear-gradient(transparent, rgba(0,0,0,0.7)); }
        .hero-content { position: absolute; bottom: 64px; left: 0; right: 0; max-width: 1200px; margin: 0 auto; padding: 0 80px; color: white; }
        .event-badge { background: #FF385C; display: inline-block; padding: 6px 14px; border-radius: 6px; font-weight: 800; font-size: 13px; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 1px; }
        .hero-content h1 { font-size: 52px; margin: 0 0 16px 0; font-weight: 850; letter-spacing: -2px; }
        .hero-content p { font-size: 20px; opacity: 0.9; margin: 0; font-weight: 500; }
        
        .container { max-width: 1200px; margin: 0 auto; padding: 64px 80px; display: grid; grid-template-columns: 1.8fr 1fr; gap: 80px; }
        
        .section-title { font-size: 28px; font-weight: 850; margin-bottom: 32px; color: #1a1a1a; letter-spacing: -1px; }
        .description { font-size: 19px; line-height: 1.7; color: #484848; margin-bottom: 40px; }
        
        .tag-list { display: flex; gap: 12px; margin-bottom: 56px; }
        .tag { padding: 8px 16px; background: #f7f7f7; border-radius: 100px; font-size: 14px; font-weight: 700; color: #222; border: 1px solid #eee; }
        
        .map-section { 
          height: 400px; 
          border-radius: 28px; 
          overflow: hidden; 
          border: 1px solid #eee; 
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          margin-bottom: 64px;
        }
        
        .sidebar-card { background: white; padding: 32px; border-radius: 24px; border: 1px solid #ebebeb; box-shadow: 0 10px 30px rgba(0,0,0,0.05); position: sticky; top: 120px; }
        .sidebar-card h3 { font-size: 20px; font-weight: 800; margin: 0 0 24px 0; }
        .info-list { list-style: none; padding: 0; margin: 0; }
        .info-list li { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-size: 15px; }
        .info-list li span:first-child { color: #717171; font-weight: 500; }
        .info-list li span:last-child { color: #222; font-weight: 700; }
        
        .btn-website { width: 100%; background: #222; color: white; border: none; padding: 16px; border-radius: 12px; font-size: 16px; font-weight: 700; margin-top: 32px; cursor: pointer; transition: all 0.2s; }
        .btn-website:hover { background: #444; transform: translateY(-2px); }

        .nearby-stays { margin-top: 20px; }
        .acc-mini-card { display: flex; gap: 20px; cursor: pointer; padding: 16px; border-radius: 20px; transition: all 0.3s cubic-bezier(0.2, 0, 0, 1); border: 1px solid transparent; }
        .acc-mini-card:hover { background: white; border-color: #eee; box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
        .acc-mini-img { width: 120px; height: 120px; border-radius: 16px; object-fit: cover; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .acc-mini-info { flex: 1; display: flex; flex-direction: column; justify-content: center; }
        .acc-mini-info h4 { margin: 0 0 6px 0; font-size: 18px; font-weight: 800; }
        .acc-mini-info p { margin: 0; font-size: 14px; color: #717171; font-weight: 500; }
        .acc-dist-badge { display: inline-block; margin-top: 8px; font-size: 12px; font-weight: 800; color: #FF385C; }

        @media (max-width: 900px) {
          .container { grid-template-columns: 1fr; padding: 40px 20px; }
          .hero-content { padding: 0 20px; bottom: 40px; }
          .hero-content h1 { font-size: 36px; }
          .sidebar-card { position: relative; top: 0; }
        }
      </style>
      
      <div class="hero-section">
        <img src="${imageUrl}" class="hero-image">
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <div class="event-badge">Recommended Experience</div>
          <h1>${title}</h1>
          <p>📍 ${location} · 📅 ${date}</p>
        </div>
      </div>
      
      <div class="container">
        <div class="main-info">
          <div class="section-title">About the Experience</div>
          <p class="description">${description}</p>
          
          <div class="tag-list">
            ${tags.map((t: string) => `<span class="tag">#${t}</span>`).join('')}
          </div>
          
          <div class="section-title">Location</div>
          <div class="map-section">
            <app-map id="event-map"></app-map>
          </div>

          <div class="nearby-stays">
            <div class="section-title">Perfect Stays Nearby</div>
            <div class="nearby-grid">
              ${
                this.nearbyAccommodations.length > 0
                  ? this.nearbyAccommodations
                      .map(
                        acc => `
                    <div class="acc-mini-card" data-id="${acc.id}">
                      <img src="${acc.images[0]}" class="acc-mini-img">
                      <div class="acc-mini-info">
                        <h4>${acc.name}</h4>
                        <p>★ ${acc.rating} · ₩${acc.price.toLocaleString()} / night</p>
                        <span class="acc-dist-badge">Walking Distance to Event</span>
                      </div>
                    </div>
                  `
                      )
                      .join('')
                  : '<p style="color: #717171; padding: 20px; background: #f9f9f9; border-radius: 12px; text-align: center;">No recommended stays found for this location yet.</p>'
              }
            </div>
          </div>
        </div>
        
        <div class="sidebar">
          <div class="sidebar-card">
            <h3>Event Information</h3>
            <ul class="info-list">
              <li><span>Category</span><span>${category}</span></li>
              <li><span>Entrance Fee</span><span>Free / Varied</span></li>
              <li><span>Parking</span><span>Available</span></li>
              <li><span>Contact</span><span>Local Tourist Center</span></li>
            </ul>
            <button class="btn-website">Visit Official Website</button>
          </div>
        </div>
      </div>

      `;
    }

    @addEventListener('.acc-mini-card', 'click', { delegate: true })
    onAccClick(e: any) {
      const id = e.target.closest('.acc-mini-card').dataset.id;
      this.router.go(`/detail/${id}`);
    }
  }
  return tagName;
};
