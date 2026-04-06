import { elementDefine, onConnectedInnerHtml, applyNodeThis } from '@dooboostore/simple-web-component';
import type { Accommodation } from '../services/AccommodationService';

declare const L: any; // Leaflet Global from index.html

export default (w: Window) => {
  const tagName = 'swc-example-accommodation-map';
  const existing = w.customElements.get(tagName);
  if (existing) return existing;



  @elementDefine(tagName, { window: w })
  class AppMap extends w.HTMLElement {
    private map: any = null;
    private markers: any[] = [];

    connectedCallback() {
      // Small delay to ensure container has dimensions
      setTimeout(() => this.initMap(), 100);
    }

    private initMap() {
      if (this.map) return;

      const container = this.shadowRoot?.querySelector('#map-container');
      if (!container) return;

      // Initialize Leaflet map with a sensible minZoom to prevent "World View"
      this.map = L.map(container, {
        minZoom: 4,
        scrollWheelZoom: true
      }).setView([36.5, 127.5], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(this.map);

      // Force size calculation for Shadow DOM visibility
      setTimeout(() => {
        this.map.invalidateSize();
      }, 300);
    }

    @applyNodeThis({ position: 'innerHtml' })
    setMarkers(accommodations: Accommodation[], focus?: { lat: number; lng: number }) {
      if (!this.map) {
        setTimeout(() => this.setMarkers(accommodations, focus), 200);
        return;
      }

      // Clear existing markers
      this.markers.forEach(m => this.map.removeLayer(m));
      this.markers = [];

      if (accommodations.length === 0) return;

      const points: any[] = [];

      accommodations.forEach(acc => {
        if (!acc.lat || !acc.lng) return;

        const marker = L.marker([acc.lat, acc.lng]).addTo(this.map).bindPopup(`
            <div style="width: 150px">
              <img src="${acc.images[0]}" style="width: 100%; border-radius: 4px; height: 80px; object-fit: cover;">
              <h4 style="margin: 8px 0 4px 0; font-size: 14px;">${acc.name}</h4>
              <p style="margin: 0; color: #FF385C; font-weight: 700; font-size: 13px;">₩${acc.price.toLocaleString()}</p>
            </div>
          `);

        this.markers.push(marker);
        points.push([acc.lat, acc.lng]);
      });

      if (focus) {
        // If a specific point is focused (e.g. an Event location), zoom in tight
        this.map.setView([focus.lat, focus.lng], 15);
      } else if (points.length === 1) {
        this.map.setView(points[0], 15);
      } else if (points.length > 0) {
        // Use fitBounds but with a maxZoom to keep it close
        this.map.fitBounds(points, { padding: [50, 50], maxZoom: 15 });
      }
    }

    @onConnectedInnerHtml({ useShadow: true })
    render() {
      return `
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        :host { display: block; height: 100%; width: 100%; }
        #map-container { height: 100%; width: 100%; background: #f8f9fa; }
        
        /* Fix for Leaflet in Shadow DOM */
        .leaflet-container { width: 100%; height: 100%; }
        .leaflet-marker-icon { filter: hue-rotate(140deg); }
      </style>
      <div id="map-container"></div>
      `;
    }
  }
  return AppMap;
};
