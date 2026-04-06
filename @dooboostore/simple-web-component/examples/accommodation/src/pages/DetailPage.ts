import { onConnectedBefore, setAttributeThis, applyAttributeThis, query, queryThis, attributeThis, attribute, changedAttributeThis, onInitialize, elementDefine, onConnectedInnerHtml, addEventListener, applyNodeThis, subscribeSwcAppRouteChangeWhileConnected } from '@dooboostore/simple-web-component';
import { Sim, RouterAction, RoutingDataSet, Inject } from '@dooboostore/simple-boot';
import { AccommodationService } from '../services/AccommodationService';
import { EventService, LocalEvent } from '../services/EventService';
import { Router  } from '@dooboostore/core-web';

export default (w: Window, container: symbol) => {
  const tagName = 'swc-example-accommodation-detail-page';
  const existing = w.customElements.get(tagName);
  if (existing) {
    return tagName;
  }

  // @Sim({ container: container })
  @elementDefine(tagName, { window: w })
  class DetailPage extends w.HTMLElement {
    private accommodation: any = null;
    private localEvents: LocalEvent[] = [];
    private accommodationService: AccommodationService;
    private eventService: EventService;
    private router: Router;
    @attributeThis('product-id') productId: string;
    @attributeThis('product-id22') productId22: string = 'vvvvvvvvvV';
    @query('$this')
    gg: HTMLElement = '' as any;

    @onConnectedBefore
    onconstructor(@Inject({ symbol: AccommodationService.SYMBOL }) accommodationService: AccommodationService, @Inject({ symbol: EventService.SYMBOL }) eventService: EventService, router: Router) {
      this.accommodationService = accommodationService;
      this.eventService = eventService;
      this.router = router;

      // console.log('onInit detail', this.productId, this.productId22, this.gg);
      // setInterval(()=>{
      //   this.productId=new Date().toDateString() as any;
      // }, 1000)
      // setTimeout(() => {
      //   console.log('product-idproduct-idproduct-id', this.productId);
      // }, 1000);
      this.accommodation = this.accommodationService.getById(this.productId);
      if (this.accommodation) {
        // 숙소 이름을 기반으로 지역 매칭하여 이벤트 검색
        this.localEvents = this.eventService.getEventsByLocation(this.accommodation.name);
      }

      this.render();
    }

    // @onAfterConnected
    // tt() {
    //   console.log('vvvvvvvvvvvvv this.productId:', this.productId, this.gg);
    //   console.log('vvvvvvvvvvvvv direct getAttribute:', this.getAttribute('product-id'));
    //   this.aa();
    // }
    //
    // @setAttributeThis('ggg')
    // aa() {
    //   return 'zzz'
    // }

    @subscribeSwcAppRouteChangeWhileConnected('/accommodation/{id}')
    onRouteChangeToDetailPage(router: any, pathData: any) {
      console.log('[DetailPage] onRouteChangeToDetailPage called', { pathData, currentPath: router.currentPath });
    }

    @subscribeSwcAppRouteChangeWhileConnected()
    onAnyRouteChange(router: any, pathData: any) {
      console.log('[DetailPage] onAnyRouteChange called', { currentPath: router.currentPath });
    }

    @applyNodeThis({ position: 'innerHtml' })
    @onConnectedInnerHtml({ useShadow: true })
    render() {
      if (!this.accommodation) return '<div>숙소를 찾을 수 없습니다.</div>';
      const { name, images, rating, reviewCount, price, description, amenities, hostName, reviews, category, floorPlanImage } = this.accommodation;

      return `
      <style>
        * { box-sizing: border-box; }
        :host { display: block; background: white; padding-bottom: 100px; box-sizing: border-box; overflow-x: hidden; }
        .container { max-width: 1200px; margin: 0 auto; padding: 32px 40px; }
        
        .title-section { margin-bottom: 24px; }
        .title-section h1 { font-size: 32px; font-weight: 850; margin-bottom: 12px; color: #1a1a1a; letter-spacing: -1px; }
        .meta { display: flex; justify-content: space-between; align-items: center; font-size: 15px; font-weight: 600; color: #222; }
        
        .gallery { display: grid; grid-template-columns: 2fr 1fr 1fr; grid-template-rows: 240px 240px; gap: 12px; border-radius: 24px; overflow: hidden; margin-bottom: 56px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .gallery-item img { width: 100%; height: 100%; object-fit: cover; cursor: pointer; transition: transform 0.6s; }
        .gallery-item:first-child { grid-row: span 2; }
        .gallery-item:hover img { transform: scale(1.05); }
        
        .main-content { display: grid; grid-template-columns: 1.8fr 1fr; gap: 80px; margin-bottom: 80px; }
        
        .info-side { color: #222; }
        .host-info { padding-bottom: 32px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .host-avatar { width: 64px; height: 64px; background: #222; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; }
        
        .description-box { font-size: 18px; line-height: 1.7; color: #484848; margin-bottom: 48px; }
        
        .floor-plan-section { margin-bottom: 64px; }
        .floor-plan-card { background: #f7f7f7; border-radius: 24px; padding: 48px; text-align: center; border: 1px solid #eee; }
        .floor-plan-img { max-width: 100%; border-radius: 12px; mix-blend-mode: multiply; filter: contrast(1.1); }

        /* Experience Section */
        .experience-section { padding: 80px 0; border-top: 1px solid #f0f0f0; margin-top: 40px; }
        .experience-header { margin-bottom: 40px; }
        .experience-header h2 { font-size: 28px; font-weight: 850; letter-spacing: -1px; margin: 0 0 12px 0; }
        .experience-header p { color: #717171; font-size: 17px; margin: 0; }
        
        .experience-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 32px; }
        .exp-card { border-radius: 20px; overflow: hidden; background: white; border: 1px solid #eee; cursor: pointer; transition: all 0.3s cubic-bezier(0.2, 0, 0, 1); }
        .exp-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
        .exp-img { width: 100%; height: 200px; object-fit: cover; }
        .exp-info { padding: 24px; }
        .exp-tag { display: inline-block; padding: 4px 10px; background: #FFF3F5; color: #FF385C; border-radius: 6px; font-size: 12px; font-weight: 800; margin-bottom: 12px; }
        .exp-info h3 { font-size: 20px; margin: 0 0 8px 0; font-weight: 800; }
        .exp-info p { margin: 0; color: #717171; font-size: 14px; }
        
        .booking-side { position: sticky; top: 120px; height: fit-content; border: 1px solid #ebebeb; border-radius: 24px; padding: 32px; box-shadow: 0 15px 40px rgba(0,0,0,0.1); background: white; }
        .btn-reserve { background: linear-gradient(to right, #E61E4D 0%, #E31C5F 50%, #D70466 100%); color: white; border: none; padding: 18px; width: 100%; border-radius: 12px; font-size: 17px; font-weight: 700; cursor: pointer; margin-top: 24px; }
        
        .reviews-section { padding: 80px 0; border-top: 1px solid #f0f0f0; }
        .reviews-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px 80px; }

        @media (max-width: 900px) {
          .main-content { grid-template-columns: 1fr; }
          .booking-side { position: relative; top: 0; }
          .reviews-grid { grid-template-columns: 1fr; }
        }
      </style>

      <div class="container">
        <div class="title-section">
          <h1>${name}</h1>
          <div class="meta">
            <span>★ ${rating} · 후기 ${reviewCount}개 · 📍 ${category}</span>
            <span style="text-decoration: underline; cursor: pointer;">공유하기 · 저장하기</span>
          </div>
        </div>
        
        <div class="gallery">
          ${images.map((img: string) => `<div class="gallery-item"><img src="${img}"></div>`).join('')}
        </div>

        <div class="main-content">
          <div class="info-side">
            <div class="host-info">
              <div>
                <h2>${hostName}님이 호스팅하는 전용 공간</h2>
                <p>최대 인원 4명 · 침실 2개 · 침대 2개 · 욕실 1개</p>
              </div>
              <div class="host-avatar">${hostName[0]}</div>
            </div>
            
            <div class="description-box">
              <p>${description}</p>
            </div>
            
            ${
              floorPlanImage
                ? `
              <div class="floor-plan-section">
                <h3 style="font-size: 22px; font-weight: 800; margin-bottom: 24px;">객실 구조 및 도면</h3>
                <div class="floor-plan-card">
                  <img src="${floorPlanImage}" class="floor-plan-img">
                  <p style="margin-top: 20px; color: #717171; font-size: 15px;">※ 프리미엄 객실 레이아웃 가이드</p>
                </div>
              </div>
            `
                : ''
            }

            <div class="amenities-section">
              <h3 style="font-size: 22px; font-weight: 800; margin-bottom: 24px;">숙소 편의시설</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                ${amenities.map(a => `<div style="display: flex; align-items: center; gap: 12px; font-size: 16px;">✨ ${a}</div>`).join('')}
              </div>
            </div>
          </div>
          
          <div class="booking-side">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <span style="font-size: 24px; font-weight: 850;">₩${price.toLocaleString()} <span style="font-size: 16px; font-weight: 400; color: #717171;">/ 박</span></span>
              <span style="font-size: 14px; font-weight: 700;">★ ${rating}</span>
            </div>
            <button class="btn-reserve" id="reserve-btn">예약하기</button>
            <p style="text-align: center; font-size: 14px; color: #717171; margin-top: 16px;">예약 확정 전에는 요금이 청구되지 않습니다.</p>
          </div>
        </div>

        ${
          this.localEvents.length > 0
            ? `
          <div class="experience-section">
            <div class="experience-header">
              <h2>이 숙소에 머물며 즐기는 특별한 경험</h2>
              <p>${this.accommodation.name} 인근에서 지금 진행 중인 축제와 행사를 확인하세요.</p>
            </div>
            <div class="experience-grid">
              ${this.localEvents
                .map(
                  e => `
                <div class="exp-card" data-id="${e.id}">
                  <img src="${e.imageUrl}" class="exp-img">
                  <div class="exp-info">
                    <span class="exp-tag">${e.category}</span>
                    <h3>${e.title}</h3>
                    <p>📅 ${e.date}</p>
                    <p style="margin-top: 12px; color: #484848;">${e.description.substring(0, 60)}...</p>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        `
            : ''
        }

        <div class="reviews-section">
          <div class="reviews-header">
            <span>★ ${rating}</span>
            <span>·</span>
            <span>후기 ${reviewCount}개</span>
          </div>
          <div class="reviews-grid">
            ${reviews
              .map(
                (r: any) => `
              <div class="review-item">
                <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                  <div style="width: 48px; height: 48px; background: #f0f0f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800;">${r.userName[0]}</div>
                  <div>
                    <h4 style="margin: 0; font-size: 17px;">${r.userName}</h4>
                    <span style="font-size: 14px; color: #717171;">${r.date}</span>
                  </div>
                </div>
                <div style="font-size: 16px; line-height: 1.6; color: #484848;">${r.comment}</div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </div>
      `;
    }

    @addEventListener('.exp-card', 'click', { delegate: true })
    onEventClick(e: any) {
      const id = e.target.closest('.exp-card').dataset.id;
      this.router.go(`/event/${id}`);
    }

    @addEventListener('#reserve-btn', 'click')
    onReserve() {
      alert('STAY LUXE: 예약 시스템이 곧 오픈됩니다!');
    }
  }
  return tagName;
};
