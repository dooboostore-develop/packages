import { Config } from 'configs/Config';

declare global {
  interface Window {
    HTMLMetaElement: typeof HTMLMetaElement;
    domRender?: { configs: Config[] }
  }

  // interface Document {
  //   domRenderSyntheticSuccess?: boolean;
  // }
}