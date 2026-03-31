import accommodationServiceFactory from './AccommodationService';
import eventServiceFactory from './EventService';

export const serviceFactories = [
  accommodationServiceFactory,
  eventServiceFactory
];

export { AccommodationService } from './AccommodationService';
export { EventService } from './EventService';

