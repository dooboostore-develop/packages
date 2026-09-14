import StockChart from './StockChart';
import type { StockChartCtor } from './StockChart';
import RadarChart from './RadarChart';
import type { RadarChartCtor } from './RadarChart';
import BubbleChart from './BubbleChart';
import type { BubbleChartCtor } from './BubbleChart';
import RangeSlider from './RangeSlider';
import type { RangeSliderCtor } from './RangeSlider';
import CartesianChart from './CartesianChart';
import type { CartesianChartCtor } from './CartesianChart';
import CartesianChart3D from './CartesianChart3D';
import type { CartesianChart3DCtor } from './CartesianChart3D';

export type ComponentFactory =
  | ((w: Window) => StockChartCtor)
  | ((w: Window) => RadarChartCtor)
  | ((w: Window) => BubbleChartCtor)
  | ((w: Window) => RangeSliderCtor)
  | ((w: Window) => CartesianChartCtor)
  | ((w: Window) => CartesianChart3DCtor);

// NOTE: dist/cjs는 파일 단위 트랜스파일이라 esbuild가 ./StockChart 등을 CJS로 보고
// node 호환 interop(__toESM(mod, 1))을 적용함. 그 결과 .default가 네임스페이스
// 객체가 되므로(SSR require 경로), 여기서 한 번 풀어준다. ESM 경로엔 영향 없음.
const undefault = <T>(m: T | { default: T }): T =>
  (typeof m === 'function' ? m : (m as { default: T }).default) as T;

export const componentFactories: ComponentFactory[] = [
  undefault(StockChart),
  undefault(RadarChart),
  undefault(BubbleChart),
  undefault(RangeSlider),
  undefault(CartesianChart),
  undefault(CartesianChart3D),
];
