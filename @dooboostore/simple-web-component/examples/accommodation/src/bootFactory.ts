import 'reflect-metadata';
import register, { elementDefine, onConnectedInnerHtml, applyReplaceChildrenNodeHost } from '@dooboostore/simple-web-component';
import { Sim, Router, RouterAction, RoutingDataSet, RouterConfig, Inject } from '@dooboostore/simple-boot';
import { Router as WebRouter } from '@dooboostore/core-web';

// Services
import { serviceFactories, AccommodationService, EventService } from './services';

// Components & Pages
import { componentFactories } from './components';
import { pageFactories } from './pages';

export default (w: Window, container: symbol) => {
  serviceFactories.forEach(s => s(container));
  register(w, [...pageFactories, ...componentFactories]);
};
