# STAY LUXE - Experience-First Premium Curation Platform

STAY LUXE is an example premium travel platform that goes beyond plain lodging bookings: it curates stays around local events and special experiences. It is built as an SPA (Single Page Application) with `@dooboostore/simple-web-component`.

## 🌟 Core Concept (Experience-First)

Trips start from **"What should I do?"** rather than "Where should I go?". Users explore local festivals, exhibitions and events first, then get matched with the best stays to complete that experience.

## 🏨 Key Features

### 1. Experience-Driven Landing Page
- **Event curation:** the hottest local events and festivals right on the main page
- **Themed browsing:** categories such as music festivals, food tours and wellness
- **Polished UI:** a modern, responsive design reflecting a premium brand identity

### 2. Hybrid List & Interactive Map
- **Live filtering:** filter chips (price range, beachside, kitchen, Wi-Fi, ...) update the list and the map together
- **Marker sync:** Leaflet.js shows the filtered stays on the map
- **Smart zoom:** the map center and zoom level adapt to the results

### 3. Rich Accommodation Details
- **Premium gallery:** an Airbnb-style 5-cell grid of photos
- **Floor plan:** a floor-plan image that visualizes the layout
- **Local experience matching:** nearby events are matched and recommended automatically
- **Reviews:** user reviews and ratings in a two-column grid
- **Sticky booking widget:** price and booking action stay visible while scrolling

## 🏗️ Project Structure

```
src/
├── components/           # UI components
│   ├── AppHeader.ts          # Global header (responsive, emits `navigate`)
│   ├── AppMap.ts             # Leaflet-based map component
│   ├── AccommodationCard.ts  # Accommodation card (hover animation)
│   └── index.ts              # componentFactories export
│
├── pages/                # Page components (SPA)
│   ├── LandingPage.ts        # Event-centric landing page
│   ├── ListPage.ts           # Search results (list + map hybrid)
│   ├── DetailPage.ts         # Accommodation detail (gallery, floor plan, nearby events)
│   ├── EventDetailPage.ts    # Event detail (event info + nearby stays)
│   └── index.ts              # Root router (accommodation-root-router) + pageFactories
│
├── services/             # Business logic & data
│   ├── AccommodationService.ts # Global luxury stays (10 properties)
│   ├── EventService.ts         # Regional event/festival data
│   └── index.ts                # serviceFactories export
│
├── types/window.d.ts    # Global window typings
├── index.html           # HTML entry (loads Leaflet, custom-elements polyfill)
└── index.ts             # SPA bootstrap (defineSwcAppBody + swc-app connect)
```

Routes (`pages/index.ts`): `/`, `/list`, `/event/{eventId}`, `/detail/{productId}`, plus a 404 fallback.

## 🎯 Tech Stack

### Simple Web Component (SWC)
A lightweight framework on top of standard Web Components. This example uses:

1. **DI (Dependency Injection):** services registered as singletons with `@Sim`, injected with `@Inject`
2. **Declarative rendering:** `@onConnectedBody({ useShadow: true })` / `@onConnectedBodyShadow` return the template
3. **Targeted DOM updates:** `@innerHtml`, `@innerHtmlLight`, `@replaceChildren`, `@attribute`, `@updateClass`, `@query`
4. **SPA routing:** swc-app (`defineSwcAppBody`, `connect({ routeType: 'path' })`) with `@subscribeSwcAppRouteChange` handlers
5. **Shadow DOM:** full style encapsulation per component

### 📦 Key Libraries
- **Leaflet.js:** interactive map with synced markers
- **reflect-metadata:** decorator-based DI
- **Unsplash:** high-resolution theme images (image URLs)

## 🚀 Getting Started

### Install

```bash
pnpm install
```

### Dev Server

```bash
# http://localhost:3000
pnpm run dev
```

### Production Build

```bash
pnpm run build
```

## 📚 Learning Points

1. **Component-based architecture:** how feature components and pages are composed
2. **Cross-domain data:** linking accommodations and events through location data
3. **State-driven UI updates:** list and map reacting together to filter changes
4. **Responsive design:** media queries and flexible layouts for mobile
5. **Third-party integration:** using a library like Leaflet safely inside Shadow DOM

---
This example shows how to apply `@dooboostore/simple-web-component` to a realistic, complex scenario.
