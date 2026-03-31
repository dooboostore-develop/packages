import register from '@dooboostore/simple-web-component';
import { serviceFactories } from './services';
import { componentFactories } from "./components";
import { pageFactories, rootRouterFactory } from "./pages";

export default (w: Window, container: symbol) => {
  serviceFactories.forEach(s => s(container));
  register(w, [...pageFactories, ...componentFactories]);
};
