import StockChart from './StockChart';
import type { StockChartCtor } from './StockChart';
import RadarChart from './RadarChart';
import type { RadarChartCtor } from './RadarChart';
import BubbleChart from './BubbleChart';
import type { BubbleChartCtor } from './BubbleChart';
import RangeSlider from './RangeSlider';
import type { RangeSliderCtor } from './RangeSlider';

export type ComponentFactory =
  | ((w: Window) => StockChartCtor)
  | ((w: Window) => RadarChartCtor)
  | ((w: Window) => BubbleChartCtor)
  | ((w: Window) => RangeSliderCtor);

export const componentFactories: ComponentFactory[] = [
  StockChart,
  RadarChart,
  BubbleChart,
  RangeSlider,
];

export { computeSmaSeries, computeMacdSeries, computeRsiSeries, computeObvSeries } from './StockChart';
