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

export const componentFactories: ComponentFactory[] = [
  StockChart,
  RadarChart,
  BubbleChart,
  RangeSlider,
  CartesianChart,
  CartesianChart3D,
];

export { computeSmaSeries, computeMacdSeries, computeRsiSeries, computeObvSeries } from './StockChart';
