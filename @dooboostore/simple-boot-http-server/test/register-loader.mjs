// --experimental-loader는 deprecated 경로라, 권장되는 module.register()로 등록한다.
import { register } from 'node:module';

register('./ts-loader.mjs', import.meta.url);
