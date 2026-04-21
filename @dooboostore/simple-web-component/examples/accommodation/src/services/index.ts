import accommodationServiceFactory from './AccommodationService';
import eventServiceFactory from './EventService';
export { AccommodationService } from './AccommodationService';
export { EventService } from './EventService';

export const serviceFactories = [
  accommodationServiceFactory,
  eventServiceFactory
];

export default (container: symbol)=>{
  return serviceFactories.map(it => it(container));
}


