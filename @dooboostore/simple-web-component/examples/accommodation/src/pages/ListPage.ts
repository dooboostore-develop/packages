import { onConnectedSwcApp, onInitialize, addEventListener, applyInnerHtmlNode, elementDefine, onConnectedInnerHtml, updateClass } from '@dooboostore/simple-web-component';
import { Inject } from '@dooboostore/simple-boot';
import { Router } from '@dooboostore/core-web';
import { Accommodation, AccommodationService } from '../services/AccommodationService';

export default (w: Window, container: symbol) => {
  const tagName = 'swc-example-accommodation-list-page';
  const existing = w.customElements.get(tagName);
  if (existing) {
    // Sim({ container: container })(existing);
    // return existing;
    return tagName;
  }
  // @Sim({ container: container })
  @elementDefine(tagName, { window: w })
  class ListPage extends w.HTMLElement {
    private allAccommodations: Accommodation[];
    private filteredAccommodations: Accommodation[];
    private activeFilters: Set<string> = new Set();
    private accommodationService: AccommodationService;
    private router: Router;

    @onConnectedSwcApp
    onInitialize(@Inject({ symbol: AccommodationService.SYMBOL }) accommodationService: AccommodationService, router: Router) {
      this.accommodationService = accommodationService;
      this.router = router;
      this.allAccommodations = this.accommodationService.getAccommodations();
      this.filteredAccommodations = [...this.allAccommodations];
      this.setContentDisplay(this.filteredAccommodations);
    }


    @applyInnerHtmlNode('.list-content')
    setContentDisplay(filteredAccommodations: Accommodation[]) {
      return `
             <div class="header-info">
              <h2>${filteredAccommodations.length}개의 엄선된 숙소</h2>
              <p>최고의 경험을 위한 프리미엄 스테이 컬렉션</p>
            </div>
            
            <div class="grid">
              ${filteredAccommodations.length > 0 ? filteredAccommodations.map(acc => `<swc-example-accommodation-accommodation-card data-id="${acc.id}" class="card-item"></swc-example-accommodation-accommodation-card>`).join('') : `<div class="empty-state">...</div>`}
            </div>
            `;
    }


    connectedCallback() {
      this.updateCardData();
      this.updateMapMarkers();
    }

    private updateMapMarkers() {
      setTimeout(() => {
        const mapComp = this.shadowRoot?.querySelector('#list-map') as any;
        if (mapComp) {
          mapComp.setMarkers(this.filteredAccommodations);
        }
      }, 100);
    }

    private updateCardData() {
      // Small delay to ensure cards are in DOM if re-rendered
      setTimeout(() => {
        this.shadowRoot?.querySelectorAll('swc-example-accommodation-accommodation-card').forEach(card => {
          const id = (card as HTMLElement).dataset.id;
          const data = this.allAccommodations.find(a => a.id === id);
          if (data) (card as any).setData(data);
        });
      }, 0);
    }

    @applyInnerHtmlNode('.grid')
    private renderGrid() {
      if (this.filteredAccommodations.length > 0) {
        return this.filteredAccommodations.map(acc => `<swc-example-accommodation-accommodation-card data-id="${acc.id}" class="card-item"></swc-example-accommodation-accommodation-card>`).join('');
      } else {
        return `
          <div class="empty-state">
            <div style="font-size: 40px; margin-bottom: 16px;">🏝️</div>
            <h3 style="color: #222; margin-bottom: 8px;">조건에 맞는 숙소를 찾을 수 없습니다.</h3>
            <p>필터를 조정하여 다른 숙소를 찾아보세요.</p>
            <button class="reset-btn" id="reset-filters">모든 필터 해제</button>
          </div>
        `;
      }
    }

    @applyInnerHtmlNode('.header-info h2')
    private renderCount() {
      return `${this.filteredAccommodations.length}개의 엄선된 숙소`;
    }

    @updateClass('.filter-chip')
    private syncFilterUI() {
      return {
        active: (el: HTMLElement) => this.activeFilters.has(el.dataset.filter!)
      };
    }

    private toggleFilter(filter: string) {
      if (this.activeFilters.has(filter)) {
        this.activeFilters.delete(filter);
      } else {
        this.activeFilters.add(filter);
      }
      this.applyFilters();
    }

    private applyFilters() {
      this.filteredAccommodations = this.allAccommodations.filter(acc => {
        if (this.activeFilters.has('가격 범위') && acc.price < 400000) return false;
        if (this.activeFilters.has('주방') && !acc.amenities.includes('주방')) return false;
        if (this.activeFilters.has('무선 인터넷') && !acc.amenities.includes('무선 인터넷')) return false;
        if (this.activeFilters.has('숙소 유형') && acc.category !== 'beach') return false;
        return true;
      });

      this.syncFilterUI();
      this.renderCount();
      this.renderGrid();
      this.updateCardData();
      this.updateMapMarkers();
    }

    @onConnectedInnerHtml({ useShadow: true })
    render() {
      return `
      <style>
        * { box-sizing: border-box; }
        :host { display: block; height: 100%; background: #fcfcfc; box-sizing: border-box; }
        .layout { display: flex; height: 100%; }
        
        .list-panel { 
          width: 55%; 
          height: 100vh;
          overflow-y: auto; 
          border-right: 1px solid #eee;
          background: #fcfcfc;
          scrollbar-width: none;
        }
        .list-panel::-webkit-scrollbar { display: none; }
        
        .filter-header {
          position: sticky;
          top: 0;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          z-index: 100;
          padding: 24px 40px;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }

        .filter-bar { 
          display: flex; 
          gap: 12px; 
          overflow-x: auto; 
          scrollbar-width: none; 
        }
        .filter-bar::-webkit-scrollbar { display: none; }
        
        .filter-chip { 
          border: 1px solid #e0e0e0; 
          padding: 12px 24px; 
          border-radius: 100px; 
          font-size: 13px; 
          cursor: pointer; 
          white-space: nowrap; 
          font-weight: 600;
          color: #222;
          background: white;
          transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
        }
        .filter-chip:hover { border-color: #222; transform: translateY(-1px); box-shadow: 0 4px 8px rgba(0,0,0,0.05); }
        .filter-chip.active { 
          background: #222; 
          color: white; 
          border-color: #222; 
        }

        .list-content { padding: 40px; }
        .header-info { margin-bottom: 40px; }
        .header-info h2 { font-size: 32px; margin: 0 0 12px 0; font-weight: 850; letter-spacing: -1.5px; color: #1a1a1a; }
        .header-info p { color: #666; font-size: 16px; font-weight: 400; }
        
        .grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
          gap: 48px 24px; 
        }

        .map-panel { 
          width: 45%; 
          background: white; 
          position: sticky; 
          top: 0; 
          height: 100vh; 
          padding: 24px;
          box-sizing: border-box;
        }
        #list-map { 
          width: 100%; 
          height: 100%; 
          border-radius: 32px; 
          overflow: hidden; 
          box-shadow: 0 20px 50px rgba(0,0,0,0.1);
          border: 1px solid rgba(0,0,0,0.03);
        }

        .empty-state { 
          padding: 120px 40px; 
          text-align: center; 
          grid-column: 1 / -1; 
          background: white;
          border-radius: 32px;
          border: 1px solid #eee;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }
        .reset-btn {
          margin-top: 24px;
          padding: 14px 32px;
          background: #222;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .reset-btn:hover { transform: scale(1.05); background: #444; }

        @media (max-width: 1200px) {
          .list-panel { width: 50%; }
          .map-panel { width: 50%; }
        }

        @media (max-width: 900px) {
          .layout { flex-direction: column; }
          .list-panel { width: 100%; height: auto; border-right: none; }
          .map-panel { width: 100%; height: 50vh; position: relative; top: 0; padding: 16px; }
          .filter-header { padding: 16px 20px; }
          .list-content { padding: 32px 20px; }
        }
      </style>

      <div class="layout">
        <div class="list-panel">
          <div class="filter-header">
            <div class="filter-bar">
              <div class="filter-chip" data-filter="가격 범위">₩400,000+</div>
              <div class="filter-chip" data-filter="숙소 유형">해변 근처</div>
              <div class="filter-chip" data-filter="무료 취소">무료 취소</div>
              <div class="filter-chip" data-filter="주방">주방 시설</div>
              <div class="filter-chip" data-filter="무선 인터넷">Wi-Fi</div>
            </div>
          </div>
          
          <div class="list-content">
     
          </div>
        </div>

        <div class="map-panel">
          <swc-example-accommodation-map id="list-map"></swc-example-accommodation-map>
        </div>
      </div>
      `;
    }

    @addEventListener('.filter-chip', 'click', { delegate: true })
    onFilterClick(e: any) {
      const filter = e.target.closest('.filter-chip').dataset.filter;
      this.toggleFilter(filter);
    }

    @addEventListener('#reset-filters', 'click', { delegate: true })
    onResetFilters() {
      this.activeFilters.clear();
      this.applyFilters();
    }

    @addEventListener('.card-item', 'click', { delegate: true })
    onCardClick(e: any) {
      const id = e.target.closest('swc-example-accommodation-accommodation-card').dataset.id;
      this.router.go(`/detail/${id}`);
    }
  }
  return tagName;
};
