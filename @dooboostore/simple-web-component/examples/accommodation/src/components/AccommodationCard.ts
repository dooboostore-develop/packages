import { elementDefine, onConnectedInnerHtml, applyNodeHost } from '@dooboostore/simple-web-component';
import type { Accommodation } from '../services/AccommodationService';

export default (w: Window) => {
  const tagName = 'swc-example-accommodation-accommodation-card';
  const existing = w.customElements.get(tagName);
  if (existing) return existing;


  @elementDefine(tagName, { window: w })
  class AccommodationCard extends w.HTMLElement {
    private accommodation: Accommodation | null = null;

    @applyNodeHost({ position: 'innerHtml' })
    setData(data: Accommodation) {
      this.accommodation = data;
      return this.render();
    }

    render() {
      if (!this.accommodation) return '';
      const { name, images, price, rating, category, hostName } = this.accommodation;

      return `
      <style>
        :host { display: block; cursor: pointer; }
        
        .card-container {
          transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
        }
        
        .image-container { 
          width: 100%; 
          aspect-ratio: 4/3; 
          background: #f0f0f0; 
          border-radius: 16px; 
          overflow: hidden; 
          margin-bottom: 14px; 
          position: relative;
        }
        
        img { 
          width: 100%; 
          height: 100%; 
          object-fit: cover; 
          transition: transform 0.6s cubic-bezier(0.2, 0, 0, 1);
        }
        
        :host(:hover) img { transform: scale(1.1); }
        
        .info { display: flex; flex-direction: column; gap: 4px; }
        
        .header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
        }
        
        .title { 
          font-weight: 700; 
          font-size: 16px; 
          color: #222; 
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
        }
        
        .rating { 
          display: flex; 
          align-items: center; 
          gap: 4px; 
          font-size: 14px; 
          font-weight: 500;
        }
        
        .host { color: #717171; font-size: 14px; }
        
        .category-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(255, 255, 255, 0.9);
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 800;
          color: #222;
          z-index: 2;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          text-transform: uppercase;
        }

        .price { 
          margin-top: 6px; 
          font-weight: 700; 
          font-size: 15px; 
          color: #222;
        }
        .price-sub { font-weight: 400; color: #484848; font-size: 14px; }
      </style>
      
      <div class="card-container">
        <div class="image-container">
          <div class="category-badge">${category}</div>
          <img src="${images[0]}" alt="${name}" loading="lazy">
        </div>
        <div class="info">
          <div class="header">
            <div class="title">${name}</div>
            <div class="rating"><span>★</span><span>${rating}</span></div>
          </div>
          <div class="host">호스트: ${hostName}님</div>
          <div class="price">₩${price.toLocaleString()} <span class="price-sub">/ 박</span></div>
        </div>
      </div>
      `;
    }
  }
  return AccommodationCard;
};
