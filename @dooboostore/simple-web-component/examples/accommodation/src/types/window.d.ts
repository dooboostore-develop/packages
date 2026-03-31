/**
 * Global type augmentation for accommodation review & information website
 * Extends Window and global namespaces with custom types and interfaces
 */

declare global {
  /**
   * Window interface extensions for accommodation app
   */
  interface Window {
    HTMLElement: typeof HTMLElement;
    HTMLDivElement: typeof HTMLDivElement;
    HTMLButtonElement: typeof HTMLButtonElement;
    HTMLFormElement: typeof HTMLFormElement;
    location: Location;
    document: Document;
    history: History;
  }

  /**
   * Accommodation domain models namespace
   */
  namespace Accommodation {
    /**
     * Main accommodation entity
     */
    interface Accommodation {
      id: string;
      name: string;
      address: string;
      latitude: number;
      longitude: number;
      description: string;
      price: number;
      amenities: string[];
      rating: number;
      reviewCount: number;
      nearbyPlaces?: NearbyPlace[];
      events?: Event[];
      transport?: TransportInfo[];
    }

    /**
     * User review for an accommodation
     */
    interface Review {
      id: string;
      accommodationId: string;
      author: string;
      rating: number;
      comment: string;
      createdAt: Date;
    }

    /**
     * Nearby place information
     */
    interface NearbyPlace {
      id: string;
      name: string;
      distance: number;
      category: string; // '명소', '쇼핑', '음식점', '자연' 등
      description: string;
    }

    /**
     * Local event or festival information
     */
    interface Event {
      id: string;
      name: string;
      date: Date;
      description: string;
    }

    /**
     * Transportation information
     */
    interface TransportInfo {
      type: string; // '지하철', '버스', '렌트카', '항공편' 등
      departure: string;
      destination: string;
      duration: number; // minutes
      cost: number; // won
    }
  }
}

export {};
