import { Subject } from '@dooboostore/core';

export type Transaction = {
  time: Date;
  type: "BUY" | "SELL";
  symbol: string;
  quantity: number;
  price: number;
  fees: number;
  total: number;
  holdingAfter: number;
  avgBuyPrice?: number;
  profit?: number;
  reason?: string;
  isPyramiding?: boolean;
  isReBuy?: boolean;
  isGoldenCrossEntry?: boolean;
  label?: string;
};

export type OHLCV = {
  open?: number | null;
  high?: number | null;
  low?: number | null;
  close?: number | null;
  volume?: number | null;
};
export type ChartDataPointInput = OHLCV & {
  date: Date;
};

export type CrossPoint = {
  date: Date;
  type: "GOLDEN" | "DEAD" | "NORMAL";
};

export type ChartDataPoint = {
  time: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ma: Map<
    number,
    {
      open?: number;
      high?: number;
      low?: number;
      close?: number;
      volume?: number;
    }
  >;
  obv?: {
    value?: number;
    signal?: number;
  };
  rsi?: {
    value?: number;
    signal?: number;
  };
  vosc?: number;
  macd?: {
    macd: number;
    signal: number;
    histogram: number;
  };
  crossState: "GOLDEN" | "DEAD" | "NORMAL";
  crossEvent?: "GOLDEN" | "DEAD" | "NORMAL";
  transactions?: Transaction[];
};

export type BollingerBandsConfig = {
  period?: number | null; // 이동평균 기간 (기본: 20)
  stdDev?: number | null; // 표준편차 배수 (기본: 2)
};

export type OBVConfig = {
  signalPeriod?: number | null; // OBV Signal (SMA/EMA) period
};

export type RSIConfig = {
  period?: number | null; // RSI 기간 (기본: 14)
  signalPeriod?: number | null; // RSI Signal (SMA) period (기본: 14? or 9?)
  overbought?: number | null; // 과매수 기준 (기본: 70)
  oversold?: number | null; // 과매도 기준 (기본: 30)
};

export type MACDConfig = {
  fastPeriod?: number | null; // 단기 EMA 기간 (기본: 12)
  slowPeriod?: number | null; // 장기 EMA 기간 (기본: 26)
  signalPeriod?: number | null; // Signal EMA 기간 (기본: 9)
};

export type VOSCConfig = {
  shortPeriod?: number | null; // 단기 이동평균 (기본: maPeriods 첫번째)
  longPeriod?: number | null; // 장기 이동평균 (기본: maPeriods 마지막)
};

export type PercentageLinesShow =
  | boolean
  | null
  | {
      line?: boolean | null; // 점선 표시 여부
      fill?: boolean | null; // 영역 채우기 여부
    };

export type YAxisLabelConfig =
  | number
  | null
  | { left: number | null; right: number | null };

export type ChartYAxisConfig = {
  price?: YAxisLabelConfig;
  volume?: YAxisLabelConfig;
  obv?: YAxisLabelConfig;
  vosc?: YAxisLabelConfig;
  rsi?: YAxisLabelConfig;
  macd?: YAxisLabelConfig;
};

export type ChartConfig = {
  show?: {
    volume?: boolean | null;
    obv?: boolean | OBVConfig | null;
    vosc?: boolean | VOSCConfig | null;
    rsi?: boolean | RSIConfig | null;
    macd?: boolean | MACDConfig | null;
    bollingerBands?:
      | boolean
      | BollingerBandsConfig
      | null
      | {
          price?: boolean | BollingerBandsConfig | null;
          volume?: boolean | BollingerBandsConfig | null;
          obv?: boolean | BollingerBandsConfig | null;
          vosc?: boolean | BollingerBandsConfig | null;
          rsi?: boolean | BollingerBandsConfig | null;
          macd?: boolean | BollingerBandsConfig | null;
        };
    goldenCross?: boolean | null;
    deadCross?: boolean | null;
    normalCross?: boolean | null;
    buyMarkers?: boolean | null;
    sellMarkers?: boolean | null;
    percentageLines?:
      | PercentageLinesShow
      | {
          price?: PercentageLinesShow;
          volume?: PercentageLinesShow;
          obv?: PercentageLinesShow;
          vosc?: PercentageLinesShow;
          rsi?: PercentageLinesShow;
          macd?: PercentageLinesShow;
        }
      | null;
    movingAverages?:
      | boolean
      | null
      | {
          price?: boolean | null; // Price 차트의 이동평균선
          volume?: boolean | null; // Volume 차트의 이동평균선
          obv?: boolean | null; // OBV 차트의 이동평균선
          vosc?: boolean | null; // VOSC 차트의 이동평균선
          rsi?: boolean | null; // RSI 차트의 이동평균선
          macd?: boolean | null; // MACD 차트의 이동평균선
        };
  } | null;
  showDateLine?: boolean | null;
  enableZoom?: boolean | null;
  xAxisLabelCount?: number | null;
  yAxisLabelCount?: YAxisLabelConfig | ChartYAxisConfig | null;
};

const MA_COLORS: Record<number, string> = {
  5: "#9C27B0",
  10: "#FF9800",
  20: "#4CAF50",
  50: "#F44336",
  60: "#2196F3",
};

export class TradeChart {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private scale = 1;
  private resizeObserver?: ResizeObserver;

  private mouseX: number | null = null;
  private mouseY: number | null = null;

  private width = 1200;
  private height = 950;
  private padding = { top: 60, right: 80, bottom: 60, left: 80 };
  private gap = 12;

  private title: string = "";
  private data: ChartDataPoint[] = [];
  private maPeriods: number[] = [];
  private isGroup: boolean = false;
  private transactions: Transaction[] = [];
  private crossData: CrossPoint[] = [];
  private summary: {
    totalHolding: number;
    totalProfitRate: number;
    totalProfit: number;
  } | null = null;
  private config: ChartConfig = {
    show: {},
    showDateLine: false,
    enableZoom: true,
  };
  private lastRSIParams: { period: number; signalPeriod: number } | null = null;
  private lastMACDParams: {
    fast: number;
    slow: number;
    signal: number;
  } | null = null;
  private lastOBVParams: { signal: number } | null = null;

  // Zoom & Pan State
  private visibleStartIndex: number = 0;
  private visibleDataCount: number = 0;
  private minVisibleCount: number = 5;
  private isDragging: boolean = false;
  private lastMouseX: number = 0;
  private lastTouchX: number = 0;
  private lastPinchDist: number | null = null;

  private eventSubject = new Subject<{
    type: "zoom" | "pan" | "click";
    visibleDataCount: number;
    x?: Date;
    data: { chart?: ChartDataPoint; transaction?: Transaction };
  }>();

  public static createData(
    inputs: ChartDataPointInput[],
    config: {
      transactions?: Transaction[];
      cross?: CrossPoint[];
      maPeriods?: number[];
      obv?: OBVConfig;
      vosc?: VOSCConfig;
      rsi?: RSIConfig;
      macd?: MACDConfig;
    } = {},
  ): ChartDataPoint[] {
    const data: ChartDataPoint[] = inputs.map((d) => ({
      time: d.date || new Date(),
      open: d.open ?? 0,
      high: d.high ?? 0,
      low: d.low ?? 0,
      close: d.close ?? 0,
      volume: d.volume ?? 0,
      ma: new Map(),
      crossState: "NORMAL",
    }));

    // Collect all required MA periods
    const maPeriods = new Set<number>(config.maPeriods || []);
    if (config.vosc) {
      if (config.vosc.shortPeriod) maPeriods.add(config.vosc.shortPeriod);
      if (config.vosc.longPeriod) maPeriods.add(config.vosc.longPeriod);
    }

    if (maPeriods.size > 0) {
      TradeChart.computeMA(data, Array.from(maPeriods));
    }

    TradeChart.computeOBV(data);

    if (config.obv?.signalPeriod) {
      TradeChart.computeOBVSignal(data, config.obv.signalPeriod);
    }

    if (config.vosc) {
      const sp = config.vosc.shortPeriod ?? 5;
      const lp = config.vosc.longPeriod ?? 20;
      TradeChart.computeVOSC(data, sp, lp);
    }

    if (config.rsi) {
      const period = config.rsi.period ?? 14;
      const signalPeriod = config.rsi.signalPeriod ?? 14;
      TradeChart.computeRSI(data, period, signalPeriod);
    }

    if (config.macd) {
      const fast = config.macd.fastPeriod ?? 12;
      const slow = config.macd.slowPeriod ?? 26;
      const signal = config.macd.signalPeriod ?? 9;
      TradeChart.computeMACD(data, fast, slow, signal);
    }

    if (config.transactions) {
      TradeChart.mapTransactions(data, config.transactions);
    }

    if (config.cross) {
      TradeChart.mapCross(data, config.cross);
    }

    return data;
  }

  private static mapTransactions(
    data: ChartDataPoint[],
    transactions: Transaction[],
  ): void {
    if (data.length === 0 || transactions.length === 0) return;

    // Sort transactions by time just in case
    const sortedTx = [...transactions].sort(
      (a, b) => a.time.getTime() - b.time.getTime(),
    );

    // Assuming data is sorted by time
    let txIdx = 0;

    for (let i = 0; i < data.length; i++) {
      const candleStart = data[i].time.getTime();
      // Next candle time or Infinity if last
      const candleEnd =
        i < data.length - 1 ? data[i + 1].time.getTime() : Infinity;

      // Find all transactions belonging to this candle (start <= tx < end)
      // Usually candles are discrete points, but let's assume tx happens 'at' or 'after' this candle time but before next.
      // Or simply match nearest? Standard is usually time >= candleTime.
      // Let's stick to the logic used in drawTradeMarkersDynamic:
      // It iterates renderData and checks if renderData[i].time >= tx.time is not quite right if not exact match.
      // Better logic: Assign tx to the candle with same time or the one immediately preceding it?
      // Financial charts usually map tx to the specific candle time if exact, or the candle covering that period.
      // Let's assume input data has discrete times. We map tx to the candle with matching time, or closest previous?
      // Simpler approach: Iterate transactions and find the corresponding candle.

      // Let's use a simpler mapping:
      // A transaction at T maps to candle at T. If T is between Candle A and Candle B, it usually maps to A (if A <= T < B).

      while (txIdx < sortedTx.length) {
        const tx = sortedTx[txIdx];
        const txTime = tx.time.getTime();

        if (txTime < candleStart) {
          // Transaction is before current candle (and after previous candle since we moved i).
          // Should have been handled by previous iteration?
          // If we start i=0, and txTime < data[0].time, it's before the chart range or belongs to first candle?
          // Let's skip it if it's strictly before first candle? Or attach to first?
          // Let's attach to the candle if candleStart <= txTime < candleEnd

          // Wait, if txTime < candleStart, it means we missed it or it belongs to previous.
          // Since we iterate i, we should process txs that fall in [current, next).
          txIdx++;
          continue;
        }

        if (txTime >= candleEnd) {
          // Transaction belongs to a future candle
          break;
        }

        // Here: candleStart <= txTime < candleEnd
        if (!data[i].transactions) data[i].transactions = [];
        data[i].transactions!.push(tx);
        txIdx++;
      }
    }
  }

  private static mapCross(data: ChartDataPoint[], crosses: CrossPoint[]): void {
    if (data.length === 0) return;
    const sortedCross = [...crosses].sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );

    let cIdx = 0;
    let currentState: "GOLDEN" | "DEAD" | "NORMAL" = "NORMAL";

    for (let i = 0; i < data.length; i++) {
      const candleStart = data[i].time.getTime();
      const candleEnd =
        i < data.length - 1 ? data[i + 1].time.getTime() : Infinity;

      // Check for any cross events in this candle's timeframe
      // Assuming we want to capture the event that happens strictly before the next candle?
      // Or simply iterate through crosses that haven't been processed and are <= current time?
      // Standard approach: Process all crosses <= candleEnd (or just mapped to this candle).

      // Actually, if we want "last state", we should process crosses up to this point.
      // But we also want to mark the event on the candle.

      let eventType: "GOLDEN" | "DEAD" | "NORMAL" | undefined;

      while (cIdx < sortedCross.length) {
        const cp = sortedCross[cIdx];
        const cpTime = cp.date.getTime();

        // If cross is in the future relative to this candle's start (or end?), wait.
        // Let's assume we map cross to the candle that contains it or is immediately after.
        // If cpTime < candleStart, it belongs to previous (or we missed it / it's initial).
        // If it's initial (before first candle), we just set state.

        if (cpTime < candleStart) {
          // It happened before this candle. Update state, but don't mark event on this candle (unless i=0?)
          currentState = cp.type;
          cIdx++;
          continue;
        }

        if (cpTime >= candleEnd) {
          break;
        }

        // Event is within this candle's range [candleStart, candleEnd)
        currentState = cp.type;
        eventType = cp.type;
        cIdx++;
      }

      data[i].crossState = currentState;
      if (eventType) {
        data[i].crossEvent = eventType;
      }
    }
  }

  private static computeMA(data: ChartDataPoint[], periods: number[]): void {
    if (data.length === 0 || periods.length === 0) return;

    periods.forEach((period) => {
      for (let i = 0; i < data.length; i++) {
        if (i < period - 1) continue;

        const maObj: {
          open: number;
          high: number;
          low: number;
          close: number;
          volume: number;
        } = {
          open: 0,
          high: 0,
          low: 0,
          close: 0,
          volume: 0,
        };

        let sOpen = 0,
          sHigh = 0,
          sLow = 0,
          sClose = 0,
          sVol = 0;
        for (let j = 0; j < period; j++) {
          const d = data[i - j];
          sOpen += d.open;
          sHigh += d.high;
          sLow += d.low;
          sClose += d.close;
          sVol += d.volume;
        }

        maObj.open = sOpen / period;
        maObj.high = sHigh / period;
        maObj.low = sLow / period;
        maObj.close = sClose / period;
        maObj.volume = sVol / period;

        data[i].ma.set(period, maObj);
      }
    });
  }

  private static computeVOSC(
    data: ChartDataPoint[],
    shortPeriod: number,
    longPeriod: number,
  ): void {
    if (data.length === 0) return;

    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      const maShort = d.ma.get(shortPeriod);
      const maLong = d.ma.get(longPeriod);

      if (
        maShort &&
        maLong &&
        maLong.volume !== 0 &&
        maShort.volume !== undefined &&
        maLong.volume !== undefined
      ) {
        d.vosc = ((maShort.volume - maLong.volume) / maLong.volume) * 100;
      }
    }
  }

  private static computeOBV(data: ChartDataPoint[]): void {
    if (data.length === 0) return;
    if (data.length > 1 && data[data.length - 1].obv?.value !== undefined)
      return;

    let currentOBV = 0;
    data[0].obv = { value: currentOBV };

    for (let i = 1; i < data.length; i++) {
      const prevClose = data[i - 1].close;
      const currentClose = data[i].close;
      const volume = data[i].volume;

      if (currentClose > prevClose) {
        currentOBV += volume;
      } else if (currentClose < prevClose) {
        currentOBV -= volume;
      }
      data[i].obv = { value: currentOBV };
    }
  }

  private static computeOBVSignal(
    data: ChartDataPoint[],
    signalPeriod: number,
  ): void {
    if (data.length === 0) return;

    const obvValues: number[] = [];
    const validIndices: number[] = [];

    data.forEach((d, i) => {
      if (d.obv?.value !== undefined && d.obv?.value !== null) {
        obvValues.push(d.obv.value);
        validIndices.push(i);
      }
    });

    if (obvValues.length < signalPeriod) return;

    const k = 2 / (signalPeriod + 1);
    let ema = 0;

    for (let i = 0; i < signalPeriod; i++) {
      ema += obvValues[i];
    }
    ema /= signalPeriod;

    if (!data[validIndices[signalPeriod - 1]].obv)
      data[validIndices[signalPeriod - 1]].obv = {};
    data[validIndices[signalPeriod - 1]].obv!.signal = ema;

    for (let i = signalPeriod; i < obvValues.length; i++) {
      ema = obvValues[i] * k + ema * (1 - k);
      if (!data[validIndices[i]].obv) data[validIndices[i]].obv = {};
      data[validIndices[i]].obv!.signal = ema;
    }
  }

  private static computeRSI(
    data: ChartDataPoint[],
    period: number,
    signalPeriod: number,
  ): void {
    if (data.length <= period) return;

    let avgGain = 0;
    let avgLoss = 0;

    for (let i = 1; i <= period; i++) {
      const change = data[i].close - data[i - 1].close;
      if (change > 0) avgGain += change;
      else avgLoss += Math.abs(change);
    }

    avgGain /= period;
    avgLoss /= period;

    if (period < data.length) {
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);
      if (!data[period].rsi) data[period].rsi = {};
      data[period].rsi!.value = rsi;
    }

    for (let i = period + 1; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? Math.abs(change) : 0;

      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;

      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);
      if (!data[i].rsi) data[i].rsi = {};
      data[i].rsi!.value = rsi;
    }

    const rsiValues: number[] = [];
    const validIndices: number[] = [];

    data.forEach((d, i) => {
      if (d.rsi?.value !== undefined && d.rsi?.value !== null) {
        rsiValues.push(d.rsi.value);
        validIndices.push(i);
      }
    });

    if (rsiValues.length >= signalPeriod) {
      for (let i = signalPeriod - 1; i < rsiValues.length; i++) {
        let sum = 0;
        for (let j = 0; j < signalPeriod; j++) {
          sum += rsiValues[i - j];
        }
        const sma = sum / signalPeriod;
        if (!data[validIndices[i]].rsi) data[validIndices[i]].rsi = {};
        data[validIndices[i]].rsi!.signal = sma;
      }
    }
  }

  private static computeMACD(
    data: ChartDataPoint[],
    fastPeriod: number,
    slowPeriod: number,
    signalPeriod: number,
  ): void {
    if (data.length === 0) return;

    const calcEMA = (values: number[], period: number): (number | null)[] => {
      const result: (number | null)[] = new Array(values.length).fill(null);
      if (values.length < period) return result;

      let sum = 0;
      for (let i = 0; i < period; i++) sum += values[i];
      let prevEma = sum / period;
      result[period - 1] = prevEma;

      const k = 2 / (period + 1);
      for (let i = period; i < values.length; i++) {
        prevEma = (values[i] - prevEma) * k + prevEma;
        result[i] = prevEma;
      }
      return result;
    };

    const closes = data.map((d) => d.close);
    const fastEMA = calcEMA(closes, fastPeriod);
    const slowEMA = calcEMA(closes, slowPeriod);

    const macdLine: (number | null)[] = [];
    for (let i = 0; i < data.length; i++) {
      if (fastEMA[i] !== null && slowEMA[i] !== null) {
        macdLine.push(fastEMA[i]! - slowEMA[i]!);
      } else {
        macdLine.push(null);
      }
    }

    const validMacdStartIndex = macdLine.findIndex((v) => v !== null);
    if (validMacdStartIndex === -1) return;

    const validMacdValues = macdLine.slice(validMacdStartIndex) as number[];
    const signalLineRaw = calcEMA(validMacdValues, signalPeriod);

    const signalLine: (number | null)[] = new Array(validMacdStartIndex)
      .fill(null)
      .concat(signalLineRaw);

    for (let i = 0; i < data.length; i++) {
      if (macdLine[i] !== null && signalLine[i] !== null) {
        data[i].macd = {
          macd: macdLine[i]!,
          signal: signalLine[i]!,
          histogram: macdLine[i]! - signalLine[i]!,
        };
      } else {
        delete data[i].macd;
      }
    }
  }

  constructor(config: {
    canvas: HTMLCanvasElement;
    initialConfig?: ChartConfig;
  }) {
    this.canvas = config.canvas;
    const context = this.canvas.getContext("2d");
    if (!context) throw new Error("Failed to get 2D context");
    this.ctx = context;
    if (config.initialConfig) {
      this.setConfig(config.initialConfig);
    }
    this.init();
  }

  get observable() {
    return this.eventSubject.asObservable();
  }

  private publishEvent(
    type: "zoom" | "pan" | "click",
    data: { chart?: ChartDataPoint; transaction?: Transaction } = {},
  ) {
    const idx = Math.floor(this.visibleStartIndex);
    const currentData = this.data[idx >= 0 && idx < this.data.length ? idx : 0];
    this.eventSubject.next({
      type,
      visibleDataCount: this.visibleDataCount,
      x: currentData?.time,
      data,
    });
  }

  private init() {
    this.resize();
    this.resizeObserver = new ResizeObserver(() => {
      this.resize();
      this.draw();
    });
    this.resizeObserver.observe(this.canvas);

    this.canvas.addEventListener("mousemove", (e) => {
      if (this.config.enableZoom && this.isDragging) {
        this.handleDrag(e.clientX);
      }
      this.handleMouseMove(e);
    });
    this.canvas.addEventListener("mousedown", (e) => {
      if (!this.config.enableZoom) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < this.padding.left || x > this.width - this.padding.right) return;
      if (y < this.padding.top || y > this.height - this.padding.bottom) return;
      this.isDragging = true;
      this.lastMouseX = e.clientX;
    });
    this.canvas.addEventListener("mouseup", () => {
      this.isDragging = false;
    });
    this.canvas.addEventListener("mouseleave", () => {
      this.isDragging = false;
      this.handleMouseLeave();
    });
    this.canvas.addEventListener("click", (e) => {
      if (!this.isDragging) this.handleClick(e);
    });
    this.canvas.addEventListener("wheel", (e) => this.handleWheel(e), {
      passive: false,
    });

    this.canvas.addEventListener(
      "touchstart",
      (e) => this.handleTouchStart(e),
      { passive: false },
    );
    this.canvas.addEventListener("touchmove", (e) => this.handleTouchMove(e), {
      passive: false,
    });
    this.canvas.addEventListener("touchend", () => this.handleTouchEnd());
  }

  private handleWheel(e: WheelEvent) {
    if (!this.config.enableZoom) return;
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    if (mouseX < this.padding.left || mouseX > this.width - this.padding.right)
      return;
    if (mouseY < this.padding.top || mouseY > this.height - this.padding.bottom)
      return;

    e.preventDefault();
    if (this.data.length === 0) return;
    const zoomIntensity = 0.1;
    const direction = e.deltaY > 0 ? 1 : -1;
    const zoomFactor = 1 + direction * zoomIntensity;
    const chartWidth = this.width - this.padding.left - this.padding.right;
    const mouseRatio = Math.max(
      0,
      Math.min(1, (mouseX - this.padding.left) / chartWidth),
    );
    const currentCount = this.visibleDataCount;
    let newCount = currentCount * zoomFactor;
    newCount = Math.max(
      this.minVisibleCount,
      Math.min(this.data.length, newCount),
    );
    const indexAtMouse = this.visibleStartIndex + currentCount * mouseRatio;
    let newStartIndex = indexAtMouse - newCount * mouseRatio;
    this.updateVisibleRange(newStartIndex, newCount);
    this.draw();
    this.publishEvent("zoom");
  }

  private handleDrag(clientX: number) {
    if (this.data.length === 0) return;
    const deltaX = clientX - this.lastMouseX;
    this.lastMouseX = clientX;
    const chartWidth = this.width - this.padding.left - this.padding.right;
    const deltaIndex = (deltaX / chartWidth) * this.visibleDataCount;
    this.updateVisibleRange(
      this.visibleStartIndex - deltaIndex,
      this.visibleDataCount,
      true,
    );
    this.draw();
    this.publishEvent("pan");
  }

  private handleTouchStart(e: TouchEvent) {
    if (!this.config.enableZoom) return;
    const rect = this.canvas.getBoundingClientRect();
    if (e.touches.length === 1) {
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;
      if (x < this.padding.left || x > this.width - this.padding.right) return;
      if (y < this.padding.top || y > this.height - this.padding.bottom) return;
      this.isDragging = true;
      this.lastTouchX = e.touches[0].clientX;
    } else if (e.touches.length === 2) {
      const x1 = e.touches[0].clientX - rect.left,
        y1 = e.touches[0].clientY - rect.top;
      const x2 = e.touches[1].clientX - rect.left,
        y2 = e.touches[1].clientY - rect.top;
      const cx = (x1 + x2) / 2,
        cy = (y1 + y2) / 2;
      if (cx < this.padding.left || cx > this.width - this.padding.right)
        return;
      if (cy < this.padding.top || cy > this.height - this.padding.bottom)
        return;
      this.isDragging = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX,
        dy = e.touches[0].clientY - e.touches[1].clientY;
      this.lastPinchDist = Math.sqrt(dx * dx + dy * dy);
    }
  }

  private handleTouchMove(e: TouchEvent) {
    if (!this.config.enableZoom) return;
    if (e.cancelable) e.preventDefault();
    if (e.touches.length === 1 && this.isDragging) {
      const clientX = e.touches[0].clientX;
      const deltaX = clientX - this.lastTouchX;
      this.lastTouchX = clientX;
      const chartWidth = this.width - this.padding.left - this.padding.right;
      const deltaIndex = (deltaX / chartWidth) * this.visibleDataCount;
      this.updateVisibleRange(
        this.visibleStartIndex - deltaIndex,
        this.visibleDataCount,
        true,
      );
      this.draw();
      this.publishEvent("pan");
    } else if (e.touches.length === 2 && this.lastPinchDist !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX,
        dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const zoomFactor = this.lastPinchDist / dist;
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const rect = this.canvas.getBoundingClientRect();
      const chartWidth = this.width - this.padding.left - this.padding.right;
      const centerRatio = Math.max(
        0,
        Math.min(1, (cx - rect.left - this.padding.left) / chartWidth),
      );
      const currentCount = this.visibleDataCount;
      let newCount = currentCount * zoomFactor;
      newCount = Math.max(
        this.minVisibleCount,
        Math.min(this.data.length, newCount),
      );
      const indexAtCenter = this.visibleStartIndex + currentCount * centerRatio;
      let newStartIndex = indexAtCenter - newCount * centerRatio;
      this.updateVisibleRange(newStartIndex, newCount);
      this.lastPinchDist = dist;
      this.draw();
      this.publishEvent("zoom");
    }
  }

  private handleTouchEnd() {
    this.isDragging = false;
    this.lastPinchDist = null;
  }

  private updateVisibleRange(
    startIndex: number,
    count: number,
    shiftStartIndex: boolean = false,
  ) {
    if (shiftStartIndex) {
      // 1. 팬/드래그 동작: 표시할 데이터 개수(count)를 유지하고 시작 인덱스(startIndex)를 보정
      this.visibleDataCount = Math.max(
        this.minVisibleCount,
        Math.min(count, this.data.length),
      );
      this.visibleStartIndex = Math.max(
        0,
        Math.min(startIndex, this.data.length - this.visibleDataCount),
      );
    } else {
      // 2. 줌/뷰 설정 동작: 시작 인덱스(startIndex)를 우선하고 데이터 개수(count)를 가용 범위 내로 보정
      // 이 방식은 savedState.count = null(전체보기) 시 startIndex를 유지하면서 끝까지 보여주는 기능을 지원함
      this.visibleStartIndex = Math.max(
        0,
        Math.min(startIndex, this.data.length - this.minVisibleCount),
      );
      const availableCount = this.data.length - this.visibleStartIndex;
      this.visibleDataCount = Math.max(
        this.minVisibleCount,
        Math.min(count, availableCount),
      );
    }
  }

  private handleMouseMove(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left;
    this.mouseY = e.clientY - rect.top;
    this.draw();
  }

  private handleMouseLeave() {
    this.mouseX = null;
    this.mouseY = null;
    this.draw();
  }

  private handleClick(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const renderData = this.getRenderData();
    if (renderData.length === 0) return;
    const chartWidth = this.width - this.padding.left - this.padding.right;
    const mouseRatio = (clickX - this.padding.left) / chartWidth;
    const absIdx = this.visibleStartIndex + mouseRatio * this.visibleDataCount;
    let idx = Math.floor(absIdx - Math.floor(this.visibleStartIndex));
    idx = Math.max(0, Math.min(renderData.length - 1, idx));
    const candle = renderData[idx];
    this.publishEvent("click", { chart: candle });
  }

  public resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const logicalWidth = rect.width || this.canvas.clientWidth || 1200;
    const logicalHeight = rect.height || this.canvas.clientHeight || 950;
    this.width = logicalWidth;
    this.height = logicalHeight;
    this.scale = dpr;
    this.canvas.width = logicalWidth * dpr;
    this.canvas.height = logicalHeight * dpr;
    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);
  }

  public destroy() {
    this.resizeObserver?.disconnect();
  }

  public getViewState(): { startIndex: number; count: number } {
    return {
      startIndex: this.visibleStartIndex,
      count: this.visibleDataCount,
    };
  }

  public setViewState(
    state: { startIndex?: number | null; count?: number | null } | null,
  ): this {
    if (state === null) {
      this.visibleStartIndex = 0;
      this.visibleDataCount = this.data.length;
    } else {
      if (state.startIndex === null) {
        this.visibleStartIndex = 0;
      } else if (state.startIndex !== undefined) {
        this.visibleStartIndex = state.startIndex;
      }

      if (state.count === null) {
        this.visibleDataCount = this.data.length;
      } else if (state.count !== undefined) {
        this.visibleDataCount = state.count;
      }
    }

    if (this.data.length > 0) {
      this.updateVisibleRange(this.visibleStartIndex, this.visibleDataCount);
      this.draw();
    }
    return this;
  }

  setTitle(title: string): this {
    this.title = title;
    return this;
  }

  public getData(): ChartDataPoint[] {
    return this.data;
  }

  setData(
    data: ChartDataPointInput[],
    config: {
      periods?: number[];
      transactions?: Transaction[];
      cross?: CrossPoint[];
      obv?: OBVConfig;
      vosc?: VOSCConfig;
      rsi?: RSIConfig;
      macd?: MACDConfig;
    } = {},
  ): this {
    if (config.periods) {
      this.maPeriods = config.periods;
    }

    this.data = TradeChart.createData(data, {
      ...config,
      maPeriods: config.periods || this.maPeriods,
    });

    this.lastRSIParams = null;
    this.lastMACDParams = null;
    this.lastOBVParams = null;
    return this;
  }

  setCross(cross: CrossPoint[]): this {
    this.crossData = cross;
    TradeChart.mapCross(this.data, cross);
    return this;
  }

  private calculateMA(): void {
    TradeChart.computeMA(this.data, this.maPeriods);
  }

  setMAPeriods(periods: number[]): this {
    this.maPeriods = periods;
    return this;
  }

  setIsGroup(isGroup: boolean): this {
    this.isGroup = isGroup;
    return this;
  }

  setTransactions(transactions: Transaction[]): this {
    this.transactions = transactions;
    TradeChart.mapTransactions(this.data, transactions);
    return this;
  }

  setSummary(
    totalHolding: number,
    totalProfitRate: number,
    totalProfit: number,
  ): this {
    this.summary = { totalHolding, totalProfitRate, totalProfit };
    return this;
  }

  public setConfig(config: ChartConfig): this {
    const merge = (target: any, source: any) => {
      if (source === undefined) return target;
      if (source === null) return null;
      if (typeof source !== "object") return source;
      if (Array.isArray(source)) return [...source];

      const res =
        typeof target === "object" && target !== null && !Array.isArray(target)
          ? { ...target }
          : {};
      Object.keys(source).forEach((key) => {
        res[key] = merge(res[key], source[key]);
      });
      return res;
    };

    this.config = merge(this.config, config);

    const subChartCount = [
      this.config.show?.volume,
      this.config.show?.obv,
      this.config.show?.vosc,
      this.config.show?.rsi,
      this.config.show?.macd,
    ].filter((v) => v === true || (typeof v === "object" && v !== null)).length;

    const chartCount = 1 + subChartCount;
    this.canvas.style.height = `${500 + chartCount * 120}px`;
    this.resize();
    return this;
  }

  public showGoldenCross(show: boolean): this {
    if (!this.config.show) this.config.show = {};
    const s = this.config.show;
    s.goldenCross = show;
    this.draw();
    return this;
  }

  public showDeadCross(show: boolean): this {
    if (!this.config.show) this.config.show = {};
    const s = this.config.show;
    s.deadCross = show;
    this.draw();
    return this;
  }

  public showBuyMarkers(show: boolean): this {
    if (!this.config.show) this.config.show = {};
    const s = this.config.show;
    s.buyMarkers = show;
    this.draw();
    return this;
  }

  public showNormalCross(show: boolean): this {
    if (!this.config.show) this.config.show = {};
    const s = this.config.show;
    s.normalCross = show;
    this.draw();
    return this;
  }

  public showPercentageLines(
    show:
      | PercentageLinesShow
      | {
          price?: PercentageLinesShow;
          volume?: PercentageLinesShow;
          obv?: PercentageLinesShow;
          vosc?: PercentageLinesShow;
        },
  ): this {
    if (!this.config.show) this.config.show = {};
    const s = this.config.show;
    s.percentageLines = show;
    this.draw();
    return this;
  }

  public showPercentageLineLines(show: boolean): this {
    if (!this.config.show) this.config.show = {};
    const s = this.config.show;

    // 전역 설정으로 변경
    if (
      typeof s.percentageLines === "object" &&
      s.percentageLines !== null &&
      ("line" in s.percentageLines || "fill" in s.percentageLines)
    ) {
      (s.percentageLines as { line?: boolean; fill?: boolean }).line = show;
    } else {
      s.percentageLines = { line: show, fill: true };
    }
    this.draw();
    return this;
  }

  public showPercentageLineFill(show: boolean): this {
    if (!this.config.show) this.config.show = {};
    const s = this.config.show;

    // 전역 설정으로 변경
    if (
      typeof s.percentageLines === "object" &&
      s.percentageLines !== null &&
      ("line" in s.percentageLines || "fill" in s.percentageLines)
    ) {
      (s.percentageLines as { line?: boolean; fill?: boolean }).fill = show;
    } else {
      s.percentageLines = { line: true, fill: show };
    }
    this.draw();
    return this;
  }

  public showPricePercentageLines(show: PercentageLinesShow): this {
    if (!this.config.show) this.config.show = {};
    const s = this.config.show;
    if (
      typeof s.percentageLines !== "object" ||
      typeof s.percentageLines === "boolean" ||
      s.percentageLines === null ||
      "line" in s.percentageLines ||
      "fill" in s.percentageLines
    ) {
      s.percentageLines = {};
    }
    (s.percentageLines as any).price = show;
    this.draw();
    return this;
  }

  public showVolumePercentageLines(show: PercentageLinesShow): this {
    if (!this.config.show) this.config.show = {};
    const s = this.config.show;
    if (
      typeof s.percentageLines !== "object" ||
      typeof s.percentageLines === "boolean" ||
      s.percentageLines === null ||
      "line" in s.percentageLines ||
      "fill" in s.percentageLines
    ) {
      s.percentageLines = {};
    }
    (s.percentageLines as any).volume = show;
    this.draw();
    return this;
  }

  public showOBVPercentageLines(show: PercentageLinesShow): this {
    if (!this.config.show) this.config.show = {};
    const s = this.config.show;
    if (
      typeof s.percentageLines !== "object" ||
      typeof s.percentageLines === "boolean" ||
      s.percentageLines === null ||
      "line" in s.percentageLines ||
      "fill" in s.percentageLines
    ) {
      s.percentageLines = {};
    }
    (s.percentageLines as any).obv = show;
    this.draw();
    return this;
  }

  public showVOSCPercentageLines(show: PercentageLinesShow): this {
    if (!this.config.show) this.config.show = {};
    const s = this.config.show;
    if (
      typeof s.percentageLines !== "object" ||
      typeof s.percentageLines === "boolean" ||
      s.percentageLines === null ||
      "line" in s.percentageLines ||
      "fill" in s.percentageLines
    ) {
      s.percentageLines = {};
    }
    (s.percentageLines as any).vosc = show;
    this.draw();
    return this;
  }

  public showRSIPercentageLines(show: PercentageLinesShow): this {
    if (!this.config.show) this.config.show = {};
    const s = this.config.show;
    if (
      typeof s.percentageLines !== "object" ||
      typeof s.percentageLines === "boolean" ||
      s.percentageLines === null ||
      "line" in s.percentageLines ||
      "fill" in s.percentageLines
    ) {
      s.percentageLines = {};
    }
    (s.percentageLines as any).rsi = show;
    this.draw();
    return this;
  }

  public showMACDPercentageLines(show: PercentageLinesShow): this {
    if (!this.config.show) this.config.show = {};
    const s = this.config.show;
    if (
      typeof s.percentageLines !== "object" ||
      typeof s.percentageLines === "boolean" ||
      s.percentageLines === null ||
      "line" in s.percentageLines ||
      "fill" in s.percentageLines
    ) {
      s.percentageLines = {};
    }
    (s.percentageLines as any).macd = show;
    this.draw();
    return this;
  }

  public showMovingAverages(
    show:
      | boolean
      | {
          price?: boolean | null;
          volume?: boolean | null;
          obv?: boolean | null;
          vosc?: boolean | null;
        },
  ): this {
    if (!this.config.show) this.config.show = {};
    const s = this.config.show;
    s.movingAverages = show;
    this.draw();
    return this;
  }

  public showPriceMovingAverages(show: boolean): this {
    if (!this.config.show) this.config.show = {};
    const s = this.config.show;
    if (typeof s.movingAverages !== "object" || s.movingAverages === null) {
      s.movingAverages = {};
    }
    (s.movingAverages as any).price = show;
    this.draw();
    return this;
  }

  public showVolumeMovingAverages(show: boolean): this {
    if (!this.config.show) this.config.show = {};
    const s = this.config.show;
    if (typeof s.movingAverages !== "object" || s.movingAverages === null) {
      s.movingAverages = {};
    }
    (s.movingAverages as any).volume = show;
    this.draw();
    return this;
  }

  public showOBVMovingAverages(show: boolean): this {
    if (!this.config.show) this.config.show = {};
    const s = this.config.show;
    if (typeof s.movingAverages !== "object" || s.movingAverages === null) {
      s.movingAverages = {};
    }
    (s.movingAverages as any).obv = show;
    this.draw();
    return this;
  }

  public showVOSCMovingAverages(show: boolean): this {
    if (!this.config.show) this.config.show = {};
    const s = this.config.show;
    if (typeof s.movingAverages !== "object" || s.movingAverages === null) {
      s.movingAverages = {};
    }
    (s.movingAverages as any).vosc = show;
    this.draw();
    return this;
  }

  public showRSIMovingAverages(show: boolean): this {
    if (!this.config.show) this.config.show = {};
    const s = this.config.show;
    if (typeof s.movingAverages !== "object" || s.movingAverages === null) {
      s.movingAverages = {};
    }
    (s.movingAverages as any).rsi = show;
    this.draw();
    return this;
  }

  public showMACDMovingAverages(show: boolean): this {
    if (!this.config.show) this.config.show = {};
    const s = this.config.show;
    if (typeof s.movingAverages !== "object" || s.movingAverages === null) {
      s.movingAverages = {};
    }
    (s.movingAverages as any).macd = show;
    this.draw();
    return this;
  }

  public showBollingerBands(
    show:
      | boolean
      | BollingerBandsConfig
      | {
          price?: boolean | BollingerBandsConfig | null;
          volume?: boolean | BollingerBandsConfig | null;
          obv?: boolean | BollingerBandsConfig | null;
          vosc?: boolean | BollingerBandsConfig | null;
        },
  ): this {
    if (!this.config.show) this.config.show = {};
    const s = this.config.show;
    s.bollingerBands = show;
    this.draw();
    return this;
  }

  public showPriceBollingerBands(show: boolean | BollingerBandsConfig): this {
    if (!this.config.show) this.config.show = {};
    const s = this.config.show;
    if (
      typeof s.bollingerBands !== "object" ||
      s.bollingerBands === null ||
      "period" in s.bollingerBands ||
      "stdDev" in s.bollingerBands
    ) {
      s.bollingerBands = {};
    }
    (s.bollingerBands as any).price = show;
    this.draw();
    return this;
  }

  public showVolumeBollingerBands(show: boolean | BollingerBandsConfig): this {
    if (!this.config.show) this.config.show = {};
    const s = this.config.show;
    if (
      typeof s.bollingerBands !== "object" ||
      s.bollingerBands === null ||
      "period" in s.bollingerBands ||
      "stdDev" in s.bollingerBands
    ) {
      s.bollingerBands = {};
    }
    (s.bollingerBands as any).volume = show;
    this.draw();
    return this;
  }

  public showOBVBollingerBands(show: boolean | BollingerBandsConfig): this {
    if (!this.config.show) this.config.show = {};
    const s = this.config.show;
    if (
      typeof s.bollingerBands !== "object" ||
      s.bollingerBands === null ||
      "period" in s.bollingerBands ||
      "stdDev" in s.bollingerBands
    ) {
      s.bollingerBands = {};
    }
    (s.bollingerBands as any).obv = show;
    this.draw();
    return this;
  }

  public showVOSCBollingerBands(show: boolean | BollingerBandsConfig): this {
    if (!this.config.show) this.config.show = {};
    const s = this.config.show;
    if (
      typeof s.bollingerBands !== "object" ||
      s.bollingerBands === null ||
      "period" in s.bollingerBands ||
      "stdDev" in s.bollingerBands
    ) {
      s.bollingerBands = {};
    }
    (s.bollingerBands as any).vosc = show;
    this.draw();
    return this;
  }

  public showRSIBollingerBands(show: boolean | BollingerBandsConfig): this {
    if (!this.config.show) this.config.show = {};
    const s = this.config.show;
    if (
      typeof s.bollingerBands !== "object" ||
      s.bollingerBands === null ||
      "period" in s.bollingerBands ||
      "stdDev" in s.bollingerBands
    ) {
      s.bollingerBands = {};
    }
    (s.bollingerBands as any).rsi = show;
    this.draw();
    return this;
  }

  public showMACDBollingerBands(show: boolean | BollingerBandsConfig): this {
    if (!this.config.show) this.config.show = {};
    const s = this.config.show;
    if (
      typeof s.bollingerBands !== "object" ||
      s.bollingerBands === null ||
      "period" in s.bollingerBands ||
      "stdDev" in s.bollingerBands
    ) {
      s.bollingerBands = {};
    }
    (s.bollingerBands as any).macd = show;
    this.draw();
    return this;
  }

  public showSellMarkers(show: boolean): this {
    if (!this.config.show) this.config.show = {};
    const s = this.config.show;
    s.sellMarkers = show;
    this.draw();
    return this;
  }

  private getRenderData(): ChartDataPoint[] {
    if (this.data.length === 0) return [];
    // 항상 startIndex와 visibleDataCount를 기반으로 데이터 범위를 결정
    const start = Math.max(0, Math.floor(this.visibleStartIndex));
    const end = Math.min(
      this.data.length,
      Math.ceil(this.visibleStartIndex + this.visibleDataCount),
    );
    return this.data.slice(start, end);
  }

  private shouldShowPercentageLines(
    chartType?: "price" | "volume" | "obv" | "vosc" | "rsi" | "macd",
  ): boolean {
    const config = this.config.show?.percentageLines;

    // 차트별 설정이 있는 경우
    if (
      chartType &&
      typeof config === "object" &&
      config !== null &&
      !("line" in config || "fill" in config)
    ) {
      const chartConfig = (config as any)[chartType];
      if (chartConfig !== undefined) {
        if (typeof chartConfig === "boolean") {
          return chartConfig;
        }
        if (typeof chartConfig === "object" && chartConfig !== null) {
          return chartConfig.line !== false || chartConfig.fill !== false;
        }
      }
    }

    // 전역 설정
    if (typeof config === "boolean") {
      return config;
    }
    if (
      typeof config === "object" &&
      config !== null &&
      ("line" in config || "fill" in config)
    ) {
      return config.line !== false || config.fill !== false;
    }
    return false; // 기본값: false
  }

  private shouldShowPercentageLineFill(
    chartType?: "price" | "volume" | "obv" | "vosc" | "rsi" | "macd",
  ): boolean {
    const config = this.config.show?.percentageLines;

    // 차트별 설정이 있는 경우
    if (
      chartType &&
      typeof config === "object" &&
      config !== null &&
      !("line" in config || "fill" in config)
    ) {
      const chartConfig = (config as any)[chartType];
      if (chartConfig !== undefined) {
        if (typeof chartConfig === "boolean") {
          return chartConfig;
        }
        if (typeof chartConfig === "object" && chartConfig !== null) {
          return chartConfig.fill !== false;
        }
      }
    }

    // 전역 설정
    if (typeof config === "boolean") {
      return config;
    }
    if (
      typeof config === "object" &&
      config !== null &&
      ("line" in config || "fill" in config)
    ) {
      return config.fill !== false;
    }
    return false; // 기본값: false
  }

  private shouldShowPercentageLineLines(
    chartType?: "price" | "volume" | "obv" | "vosc" | "rsi" | "macd",
  ): boolean {
    const config = this.config.show?.percentageLines;

    // 차트별 설정이 있는 경우
    if (
      chartType &&
      typeof config === "object" &&
      config !== null &&
      !("line" in config || "fill" in config)
    ) {
      const chartConfig = (config as any)[chartType];
      if (chartConfig !== undefined) {
        if (typeof chartConfig === "boolean") {
          return chartConfig;
        }
        if (typeof chartConfig === "object" && chartConfig !== null) {
          return chartConfig.line !== false;
        }
      }
    }

    // 전역 설정
    if (typeof config === "boolean") {
      return config;
    }
    if (
      typeof config === "object" &&
      config !== null &&
      ("line" in config || "fill" in config)
    ) {
      return config.line !== false;
    }
    return false; // 기본값: false
  }

  private shouldShowBollingerBands(
    chartType?: "price" | "volume" | "obv" | "vosc" | "rsi" | "macd",
  ): boolean | BollingerBandsConfig {
    const config = this.config.show?.bollingerBands;

    // 차트별 설정이 있는 경우
    if (
      chartType &&
      typeof config === "object" &&
      config !== null &&
      !("period" in config || "stdDev" in config)
    ) {
      const chartConfig = (config as any)[chartType];
      if (chartConfig !== undefined) {
        return chartConfig;
      }
      // chartConfig가 undefined인 경우 전역 설정으로 fallback
    }

    // 전역 설정
    if (typeof config === "boolean") {
      return config;
    }
    if (
      typeof config === "object" &&
      config !== null &&
      ("period" in config || "stdDev" in config)
    ) {
      return config;
    }

    return false; // 기본값: 볼린저 밴드 숨김
  }

  private shouldShowMovingAverages(
    type: "price" | "volume" | "obv" | "vosc" | "rsi" | "macd",
  ): boolean {
    const maConfig = this.config.show?.movingAverages;

    // movingAverages가 객체인 경우 - 차트별 설정 확인
    if (typeof maConfig === "object" && maConfig !== null) {
      const typeConfig = maConfig[type];
      if (typeof typeConfig === "boolean") {
        return typeConfig;
      }
    }

    // movingAverages가 boolean인 경우 - 전역 설정
    if (typeof maConfig === "boolean") {
      return maConfig;
    }

    // 기본값: false (이동평균선 미표시)
    return false;
  }

  private getMAValue(
    index: number,
    period: number,
    type: keyof OHLCV = "volume",
  ): number | null {
    const d = this.data[index];
    if (!d) return null;
    if (d.ma && d.ma.has(period)) {
      const maData = d.ma.get(period)!;
      return maData[type] ?? null;
    }
    if (index < period - 1) return null;
    let sum = 0;
    for (let i = 0; i < period; i++) {
      const value =
        type === "volume"
          ? this.data[index - i].volume
          : type === "open"
            ? this.data[index - i].open
            : type === "high"
              ? this.data[index - i].high
              : type === "low"
                ? this.data[index - i].low
                : type === "close"
                  ? this.data[index - i].close
                  : (this.data[index - i] as any).adjclose || 0;
      sum += value;
    }
    return sum / period;
  }

  private getVOSCParams(): { sp: number; lp: number } {
    const { config, maPeriods } = this;
    const voscConfig =
      typeof config.show?.vosc === "object" ? config.show.vosc : {};
    let sp = voscConfig?.shortPeriod ?? 5;
    let lp = voscConfig?.longPeriod ?? 10;
    if (maPeriods.length >= 2) {
      const sorted = [...maPeriods].sort((a, b) => a - b);
      if (!voscConfig?.shortPeriod) sp = sorted[0];
      if (!voscConfig?.longPeriod) lp = sorted[sorted.length - 1];
    }
    return { sp, lp };
  }

  private calculateVOSCValue(
    index: number,
    sp: number,
    lp: number,
  ): number | null {
    const sv = this.getMAValue(index, sp, "volume");
    const lv = this.getMAValue(index, lp, "volume");
    if (sv !== null && lv !== null && lv !== 0) {
      return ((sv - lv) / lv) * 100;
    }
    return null;
  }

  private calculateRSI(period: number, signalPeriod: number): void {
    if (this.data.length <= period) return;

    // Check if we need to recalculate
    if (
      this.lastRSIParams &&
      this.lastRSIParams.period === period &&
      this.lastRSIParams.signalPeriod === signalPeriod
    ) {
      // Check if data has been updated (simplified check: last point has RSI)
      if (
        this.data.length > 0 &&
        this.data[this.data.length - 1].rsi?.value !== undefined
      ) {
        return;
      }
    }

    TradeChart.computeRSI(this.data, period, signalPeriod);
    this.lastRSIParams = { period, signalPeriod };
  }

  private calculateMACD(
    fastPeriod: number,
    slowPeriod: number,
    signalPeriod: number,
  ): void {
    if (this.data.length === 0) return;
    if (
      this.lastMACDParams &&
      this.lastMACDParams.fast === fastPeriod &&
      this.lastMACDParams.slow === slowPeriod &&
      this.lastMACDParams.signal === signalPeriod
    ) {
      // Check if data has been updated (simplified check: last point has MACD)
      if (
        this.data.length > 0 &&
        this.data[this.data.length - 1].macd !== undefined
      ) {
        return;
      }
    }

    TradeChart.computeMACD(this.data, fastPeriod, slowPeriod, signalPeriod);

    this.lastMACDParams = {
      fast: fastPeriod,
      slow: slowPeriod,
      signal: signalPeriod,
    };
  }

  private calculateOBV(): void {
    if (this.data.length === 0) return;
    if (
      this.data.length > 1 &&
      this.data[this.data.length - 1].obv?.value !== undefined
    ) {
      return;
    }
    TradeChart.computeOBV(this.data);
  }

  private calculateOBVSignal(signalPeriod: number): void {
    if (this.data.length === 0) return;
    if (this.lastOBVParams && this.lastOBVParams.signal === signalPeriod) {
      if (
        this.data.length > 0 &&
        this.data[this.data.length - 1].obv?.signal !== undefined
      ) {
        return;
      }
    }

    TradeChart.computeOBVSignal(this.data, signalPeriod);
    this.lastOBVParams = { signal: signalPeriod };
  }

  private formatPrice(price: number): string {
    if (price >= 1000000) return (price / 1000000).toFixed(2) + "M";
    if (price >= 1000) return Math.round(price).toLocaleString();
    return price.toFixed(2);
  }

  private formatVolume(volume: number): string {
    if (volume >= 1000000000) return (volume / 1000000000).toFixed(1) + "B";
    if (volume >= 1000000) return (volume / 1000000).toFixed(1) + "M";
    if (volume >= 1000) return (volume / 1000).toFixed(0) + "K";
    return volume.toFixed(0);
  }

  draw(): this {
    if (this.data.length === 0) return this;
    const renderData = this.getRenderData();
    if (renderData.length === 0) return this;

    const { ctx, width, height, padding, gap, config } = this;
    const chartWidth = width - padding.left - padding.right;

    // 활성화된 서브차트 목록 생성
    const subCharts: Array<"volume" | "obv" | "vosc" | "rsi" | "macd"> = [];
    if (config.show?.volume) subCharts.push("volume");
    if (config.show?.obv) subCharts.push("obv");
    if (config.show?.vosc) subCharts.push("vosc");
    if (config.show?.rsi) subCharts.push("rsi");
    if (config.show?.macd) subCharts.push("macd");

    const subChartCount = subCharts.length;
    const totalChartHeight =
      height - padding.top - padding.bottom - gap * subChartCount;
    const priceChartHeight =
      totalChartHeight *
      (subChartCount === 0 ? 1 : subChartCount === 1 ? 0.7 : 0.55);
    const subChartHeight =
      subChartCount > 0
        ? (totalChartHeight - priceChartHeight) / subChartCount
        : 0;
    const priceChartTop = padding.top;

    let currentTop = priceChartTop + priceChartHeight + gap;
    const chartPositions: {
      type: "volume" | "obv" | "vosc" | "rsi" | "macd";
      top: number;
      height: number;
    }[] = [];
    subCharts.forEach((type) => {
      chartPositions.push({ type, top: currentTop, height: subChartHeight });
      currentTop += subChartHeight + gap;
    });

    const lb =
      chartPositions.length > 0
        ? chartPositions[chartPositions.length - 1].top + subChartHeight
        : priceChartTop + priceChartHeight;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    const basePriceVisible = renderData[0].close;
    let priceMin = Infinity,
      priceMax = -Infinity;
    renderData.forEach((d) => {
      // 캔들의 High, Low 포함
      priceMin = Math.min(priceMin, d.low);
      priceMax = Math.max(priceMax, d.high);
      d.ma.forEach((maData) => {
        if (maData.close !== undefined && isFinite(maData.close)) {
          priceMin = Math.min(priceMin, maData.close);
          priceMax = Math.max(priceMax, maData.close);
        }
      });
    });

    let bbData: { upper: (number | null)[]; lower: (number | null)[] } | null =
      null;
    const priceBBConfig = this.shouldShowBollingerBands("price");
    if (priceBBConfig) {
      bbData = this.calculateBollingerBands(renderData, "price", priceBBConfig);
      bbData.upper.forEach((v) => {
        if (v !== null && isFinite(v)) priceMax = Math.max(priceMax, v);
      });
      bbData.lower.forEach((v) => {
        if (v !== null && isFinite(v)) priceMin = Math.min(priceMin, v);
      });
    }

    // 패딩 적용 전 순수 데이터 범위 (분모용)
    const priceDataRange = priceMax - priceMin || 1;

    const priceRange = priceMax - priceMin || 1;
    priceMin -= priceRange * 0.1;
    priceMax += priceRange * 0.1;

    let volMax = 0;
    renderData.forEach((d) => {
      if (d.volume > volMax) volMax = d.volume;
    });
    volMax = volMax || 1;

    let obvMin = Infinity,
      obvMax = -Infinity;
    renderData.forEach((d) => {
      if (d.obv?.value !== undefined) {
        obvMin = Math.min(obvMin, d.obv.value);
        obvMax = Math.max(obvMax, d.obv.value);
      }
    });
    if (!isFinite(obvMin)) {
      obvMin = 0;
      obvMax = 1;
    }
    const obvRange = obvMax - obvMin || 1;
    obvMin -= obvRange * 0.1;
    obvMax += obvRange * 0.1;

    const startOffset =
      this.visibleStartIndex - Math.floor(this.visibleStartIndex);
    const effectiveDataCount = this.visibleDataCount;
    const xScale = (i: number) =>
      padding.left +
      ((i - startOffset + 0.5) / effectiveDataCount) * chartWidth;
    const priceYScale = (v: number) =>
      priceChartTop +
      priceChartHeight -
      ((v - priceMin) / (priceMax - priceMin)) * priceChartHeight;

    // --- 차트 테두리 ---
    ctx.strokeStyle = "#aaaaaa";
    ctx.lineWidth = 1;
    ctx.strokeRect(padding.left, priceChartTop, chartWidth, priceChartHeight);
    chartPositions.forEach(({ top, height: ch }) => {
      ctx.strokeRect(padding.left, top, chartWidth, ch);
    });

    // --- 차트 영역별 크롭 시작 (전체 차트 영역 가로 크롭은 유지하면서 세로 크롭 추가) ---
    // 1. Price 차트 영역
    ctx.save();
    ctx.beginPath();
    ctx.rect(padding.left, priceChartTop, chartWidth, priceChartHeight);
    ctx.clip();

    this.drawCombinedGrid(priceMin, priceMax, basePriceVisible, priceYScale);

    if (priceBBConfig && bbData) {
      this.drawBollingerBands(xScale, priceYScale, bbData);
    }

    const candleWidth = (chartWidth / this.visibleDataCount) * 0.7;
    renderData.forEach((d, i) => {
      const x = xScale(i);
      const isUp = d.close >= d.open,
        color = isUp ? "#D32F2F" : "#1976D2";
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, priceYScale(d.high));
      ctx.lineTo(x, priceYScale(d.low));
      ctx.stroke();
      const bt = priceYScale(Math.max(d.open, d.close)),
        bb = priceYScale(Math.min(d.open, d.close));
      ctx.fillStyle = color;
      ctx.fillRect(x - candleWidth / 2, bt, candleWidth, Math.max(1, bb - bt));
    });

    // Price 차트에 close 이동평균선 그리기
    const showPriceMA = this.shouldShowMovingAverages("price");
    if (showPriceMA) {
      this.maPeriods.forEach((period) => {
        ctx.strokeStyle = MA_COLORS[period] || "#888888";
        ctx.lineWidth = 1;
        ctx.beginPath();
        let started = false;
        renderData.forEach((d, i) => {
          const maData = d.ma.get(period);
          const v = maData?.close; // close 이평선 사용
          if (v !== undefined && v !== null) {
            const x = xScale(i),
              y = priceYScale(v);
            if (!started) {
              ctx.moveTo(x, y);
              started = true;
            } else ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      });
    }
    ctx.restore();

    // 2. 각 서브차트 영역별 크롭
    chartPositions.forEach(({ type, top, height: ch }) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(padding.left, top, chartWidth, ch);
      ctx.clip();

      if (type === "volume") {
        // 볼륨 차트에 상단 여백 추가 (10%)
        const volumeChartPadding = 0.1;
        const vYScale = (p: number) =>
          top + ch - (p / (100 * (1 + volumeChartPadding))) * ch;
        this.drawVolumeGrid(volMax, vYScale);

        // Volume 볼린저 밴드 그리기
        const volumeBBConfig = this.shouldShowBollingerBands("volume");
        if (volumeBBConfig) {
          const volumeBBData = this.calculateBollingerBands(
            renderData,
            "volume",
            volumeBBConfig,
          );
          this.drawBollingerBands(
            xScale,
            (v: number) =>
              top + ch - (v / (volMax * (1 + volumeChartPadding))) * ch,
            volumeBBData,
          );
        }

        // Volume 막대 그리기
        renderData.forEach((d, i) => {
          const x = xScale(i),
            p = (d.volume / volMax) * 100;
          ctx.fillStyle =
            d.close >= d.open
              ? "rgba(211, 47, 47, 0.6)"
              : "rgba(25, 118, 210, 0.6)";
          ctx.fillRect(
            x - candleWidth / 2,
            vYScale(p),
            candleWidth,
            vYScale(0) - vYScale(p),
          );
        });

        // Volume 이동평균선 그리기
        const showVolumeMA = this.shouldShowMovingAverages("volume");
        if (showVolumeMA) {
          this.maPeriods.forEach((period) => {
            ctx.strokeStyle = MA_COLORS[period] || "#888888";
            ctx.lineWidth = 1;
            ctx.beginPath();
            let started = false;
            renderData.forEach((d, i) => {
              const maData = d.ma.get(period);
              const volumeMA = maData?.volume;
              if (volumeMA !== undefined && volumeMA !== null) {
                const x = xScale(i);
                const p = (volumeMA / volMax) * 100;
                const y = vYScale(p);
                if (!started) {
                  ctx.moveTo(x, y);
                  started = true;
                } else {
                  ctx.lineTo(x, y);
                }
              }
            });
            ctx.stroke();
          });
        }
      } else if (type === "obv") {
        const obvConfig =
          typeof config.show?.obv === "object" ? config.show.obv : {};
        const signalPeriod = obvConfig?.signalPeriod ?? 9;

        this.calculateOBVSignal(signalPeriod);

        const oYScale = (v: number) =>
          top + ch - ((v - obvMin) / (obvMax - obvMin)) * ch;
        this.drawOBVGrid(obvMin, obvMax, oYScale);

        // OBV 볼린저 밴드 그리기
        const obvBBConfig = this.shouldShowBollingerBands("obv");
        if (obvBBConfig) {
          const obvBBData = this.calculateBollingerBands(
            renderData,
            "obv",
            obvBBConfig,
          );
          this.drawBollingerBands(xScale, oYScale, obvBBData);
        }

        // OBV 라인 그리기
        ctx.strokeStyle = "#9C27B0";
        ctx.lineWidth = 2;
        ctx.beginPath();
        let os = false;
        renderData.forEach((d, i) => {
          if (d.obv?.value === undefined || d.obv?.value === null) return;
          const x = xScale(i),
            y = oYScale(d.obv.value);
          if (!os) {
            ctx.moveTo(x, y);
            os = true;
          } else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // OBV Signal Line
        ctx.strokeStyle = "#FF9800"; // Orange for signal
        ctx.lineWidth = 1;
        ctx.beginPath();
        let oss = false;
        renderData.forEach((d, i) => {
          if (d.obv?.signal === undefined || d.obv?.signal === null) return;
          const x = xScale(i),
            y = oYScale(d.obv.signal);
          if (!oss) {
            ctx.moveTo(x, y);
            oss = true;
          } else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // OBV 이동평균선 그리기
        const showOBVMA = this.shouldShowMovingAverages("obv");
        if (showOBVMA) {
          this.maPeriods.forEach((period) => {
            ctx.strokeStyle = MA_COLORS[period] || "#888888";
            ctx.lineWidth = 1;
            ctx.beginPath();
            let started = false;

            renderData.forEach((d, i) => {
              const dataIndex = Math.floor(this.visibleStartIndex) + i;
              if (dataIndex < period - 1) return;

              // OBV 이동평균 계산
              let sum = 0;
              let count = 0;
              for (let j = 0; j < period; j++) {
                const obvValue = this.data[dataIndex - j]?.obv?.value;
                if (obvValue !== undefined && obvValue !== null) {
                  sum += obvValue;
                  count++;
                }
              }

              if (count === period) {
                const obvMA = sum / period;
                const x = xScale(i);
                const y = oYScale(obvMA);
                if (!started) {
                  ctx.moveTo(x, y);
                  started = true;
                } else {
                  ctx.lineTo(x, y);
                }
              }
            });
            ctx.stroke();
          });
        }
      } else if (type === "vosc") {
        const { sp, lp } = this.getVOSCParams();

        const voscValues: (number | null)[] = [];
        let vMin = Infinity,
          vMax = -Infinity;
        const sIdx = Math.floor(this.visibleStartIndex);
        renderData.forEach((_, i) => {
          const val = this.calculateVOSCValue(sIdx + i, sp, lp);
          voscValues.push(val);
          if (val !== null) {
            vMin = Math.min(vMin, val);
            vMax = Math.max(vMax, val);
          }
        });
        const absMax =
          Math.max(
            Math.abs(vMin === Infinity ? 0 : vMin),
            Math.abs(vMax === -Infinity ? 0 : vMax),
          ) || 1;
        const voscYScale = (v: number) =>
          top + ch / 2 - (v / absMax) * ((ch / 2) * 0.8);

        // VOSC 볼린저 밴드 그리기
        const voscBBConfig = this.shouldShowBollingerBands("vosc");
        if (voscBBConfig) {
          const voscBBData = this.calculateBollingerBands(
            renderData,
            "vosc",
            voscBBConfig,
            { sp, lp },
          );
          this.drawBollingerBands(xScale, voscYScale, voscBBData);
        }

        // 0선 그리기
        ctx.strokeStyle = "#dddddd";
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(padding.left, top + ch / 2);
        ctx.lineTo(padding.left + chartWidth, top + ch / 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // VOSC 막대그래프 그리기
        renderData.forEach((_, i) => {
          const val = voscValues[i];
          if (val === null) return;

          const x = xScale(i);
          const y = voscYScale(val);
          const zeroY = top + ch / 2;

          // 0 이상이면 빨강, 이하면 파랑
          ctx.fillStyle =
            val >= 0 ? "rgba(211, 47, 47, 0.7)" : "rgba(25, 118, 210, 0.7)";

          const barHeight = Math.abs(y - zeroY);
          ctx.fillRect(
            x - candleWidth / 2,
            Math.min(y, zeroY),
            candleWidth,
            barHeight,
          );
        });

        // VOSC 이동평균선 그리기
        const showVOSCMA = this.shouldShowMovingAverages("vosc");
        if (showVOSCMA) {
          this.maPeriods.forEach((period) => {
            ctx.strokeStyle = MA_COLORS[period] || "#888888";
            ctx.lineWidth = 1;
            ctx.beginPath();
            let started = false;

            // VOSC 이동평균 계산을 위한 배열
            const voscMAValues: number[] = [];

            renderData.forEach((_, i) => {
              const dataIndex = sIdx + i;
              if (dataIndex < period - 1) return;

              // VOSC 이동평균 계산
              let sum = 0;
              let count = 0;
              for (let j = 0; j < period; j++) {
                const voscVal = this.calculateVOSCValue(dataIndex - j, sp, lp);
                if (voscVal !== null) {
                  sum += voscVal;
                  count++;
                }
              }

              if (count === period) {
                const voscMA = sum / period;
                const x = xScale(i);
                const y = voscYScale(voscMA);
                if (!started) {
                  ctx.moveTo(x, y);
                  started = true;
                } else {
                  ctx.lineTo(x, y);
                }
              }
            });
            ctx.stroke();
          });
        }
      } else if (type === "rsi") {
        const rsiConfig =
          typeof config.show?.rsi === "object" ? config.show.rsi : {};
        const period = rsiConfig?.period ?? 14;
        const signalPeriod = rsiConfig?.signalPeriod ?? 14; // Default to 14 if not set? Or typically same as period or 9? SMA on RSI often uses 14.
        const overbought = rsiConfig?.overbought ?? 70;
        const oversold = rsiConfig?.oversold ?? 30;

        this.calculateRSI(period, signalPeriod);

        const rsiYScale = (v: number) => top + ch - (v / 100) * ch;

        // RSI Grid (30/70 lines)
        ctx.strokeStyle = "#dddddd";
        ctx.setLineDash([2, 2]);

        const y70 = rsiYScale(overbought);
        ctx.beginPath();
        ctx.moveTo(padding.left, y70);
        ctx.lineTo(padding.left + chartWidth, y70);
        ctx.stroke();

        const y30 = rsiYScale(oversold);
        ctx.beginPath();
        ctx.moveTo(padding.left, y30);
        ctx.lineTo(padding.left + chartWidth, y30);
        ctx.stroke();

        ctx.setLineDash([]);

        // RSI Line
        ctx.strokeStyle = "#9C27B0";
        ctx.lineWidth = 1;
        ctx.beginPath();
        let started = false;

        renderData.forEach((d, i) => {
          if (d.rsi?.value === undefined || d.rsi?.value === null) return;
          const x = xScale(i);
          const y = rsiYScale(d.rsi.value);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();

        // RSI Signal Line
        ctx.strokeStyle = "#FF9800"; // Orange for signal
        ctx.lineWidth = 1;
        ctx.beginPath();
        let rss = false;
        renderData.forEach((d, i) => {
          if (d.rsi?.signal === undefined || d.rsi?.signal === null) return;
          const x = xScale(i);
          const y = rsiYScale(d.rsi.signal);
          if (!rss) {
            ctx.moveTo(x, y);
            rss = true;
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();

        // RSI Bollinger Bands
        const rsiBBConfig = this.shouldShowBollingerBands("rsi");
        if (rsiBBConfig) {
          const rsiBBData = this.calculateBollingerBands(
            renderData,
            "rsi",
            rsiBBConfig,
          );
          this.drawBollingerBands(xScale, rsiYScale, rsiBBData);
        }

        // RSI Moving Averages
        const showRSIMA = this.shouldShowMovingAverages("rsi");
        if (showRSIMA) {
          this.maPeriods.forEach((period) => {
            ctx.strokeStyle = MA_COLORS[period] || "#888888";
            ctx.lineWidth = 1;
            ctx.beginPath();
            let started = false;

            renderData.forEach((d, i) => {
              const dataIndex = Math.floor(this.visibleStartIndex) + i;
              if (dataIndex < period - 1) return;

              let sum = 0;
              let count = 0;
              for (let j = 0; j < period; j++) {
                const rsiVal = this.data[dataIndex - j]?.rsi?.value;
                if (rsiVal !== undefined && rsiVal !== null) {
                  sum += rsiVal;
                  count++;
                }
              }

              if (count === period) {
                const rsiMA = sum / period;
                const x = xScale(i);
                const y = rsiYScale(rsiMA);
                if (!started) {
                  ctx.moveTo(x, y);
                  started = true;
                } else {
                  ctx.lineTo(x, y);
                }
              }
            });
            ctx.stroke();
          });
        }
      } else if (type === "macd") {
        const macdConfig =
          typeof config.show?.macd === "object" ? config.show.macd : {};
        const fast = macdConfig?.fastPeriod ?? 12;
        const slow = macdConfig?.slowPeriod ?? 26;
        const signal = macdConfig?.signalPeriod ?? 9;

        this.calculateMACD(fast, slow, signal);

        // Calculate min/max for MACD scale (considering histogram, macd line, signal line)
        let mMin = Infinity,
          mMax = -Infinity;
        renderData.forEach((d) => {
          if (d.macd) {
            mMin = Math.min(mMin, d.macd.histogram, d.macd.macd, d.macd.signal);
            mMax = Math.max(mMax, d.macd.histogram, d.macd.macd, d.macd.signal);
          }
        });

        if (mMin === Infinity) {
          mMin = -1;
          mMax = 1;
        }
        // Add some padding
        const range = mMax - mMin || 1;
        mMin -= range * 0.1;
        mMax += range * 0.1;

        // Zero-centered if possible, or just standard range?
        // Standard MACD usually just fits data. But zero line is important.
        // Let's ensure 0 is in range if it's close? No, standard range is fine, just draw 0 line.

        const macdYScale = (v: number) =>
          top + ch - ((v - mMin) / (mMax - mMin)) * ch;

        // Zero Line
        const zeroY = macdYScale(0);
        ctx.strokeStyle = "#aaaaaa";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding.left, zeroY);
        ctx.lineTo(padding.left + chartWidth, zeroY);
        ctx.stroke();

        // Histogram
        renderData.forEach((d, i) => {
          if (!d.macd) return;
          const x = xScale(i);
          const h = d.macd.histogram;
          const y = macdYScale(h);

          // Color: Green if increasing/positive, Red if decreasing/negative?
          // Simple: Positive = Green, Negative = Red
          ctx.fillStyle =
            h >= 0 ? "rgba(76, 175, 80, 0.5)" : "rgba(244, 67, 54, 0.5)";

          const barHeight = Math.abs(y - zeroY);
          // Prevent zero-height bars drawing weirdly
          if (barHeight > 0) {
            ctx.fillRect(
              x - candleWidth / 2,
              Math.min(y, zeroY),
              candleWidth,
              barHeight,
            );
          }
        });

        // MACD Line (Fast line) - Usually Blue
        ctx.strokeStyle = "#2196F3";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        let started = false;
        renderData.forEach((d, i) => {
          if (!d.macd) return;
          const x = xScale(i);
          const y = macdYScale(d.macd.macd);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Signal Line (Slow line) - Usually Orange/Red
        ctx.strokeStyle = "#FF9800";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        started = false;
        renderData.forEach((d, i) => {
          if (!d.macd) return;
          const x = xScale(i);
          const y = macdYScale(d.macd.signal);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else ctx.lineTo(x, y);
        });
        ctx.stroke();
      }
      ctx.restore();
    });

    // 3. 마커 및 기타 공통 요소용 전체 차트 영역 크롭
    ctx.save();
    ctx.beginPath();
    ctx.rect(padding.left, priceChartTop, chartWidth, lb - priceChartTop);
    ctx.clip();
    this.drawCrossMarkersDynamic(renderData, xScale, priceChartTop, lb);
    this.drawTradeMarkersDynamic(renderData, xScale, priceChartTop, lb);
    ctx.restore();

    ctx.fillStyle = "#000000";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(this.title, width / 2, 30);
    this.drawLegend();
    this.drawSummary();
    this.drawVerticalTitle("PRICE", priceChartTop + priceChartHeight / 2);
    chartPositions.forEach(({ type, top, height: ch }) => {
      this.drawVerticalTitle(type, top + ch / 2);
    });

    this.drawXAxisLabelsDynamic(renderData, xScale, priceChartTop, lb);
    this.drawLabelsOnly(
      priceMin,
      priceMax,
      basePriceVisible,
      priceYScale,
      volMax,
      obvMin,
      obvMax,
      chartPositions,
      priceDataRange,
    );

    if (this.mouseX !== null && this.mouseY !== null) {
      this.drawCrosshair(
        renderData,
        xScale,
        priceYScale,
        priceChartTop,
        priceChartHeight,
        lb,
        priceMin,
        priceMax,
        basePriceVisible,
        chartPositions,
        volMax,
        obvMin,
        obvMax,
        priceDataRange,
      );
      const cw = width - padding.left - padding.right;
      const mouseRatio = (this.mouseX - padding.left) / cw;
      const absIdx =
        this.visibleStartIndex + mouseRatio * this.visibleDataCount;
      const rIdx = Math.floor(absIdx - Math.floor(this.visibleStartIndex));
      const idx = Math.max(0, Math.min(renderData.length - 1, rIdx));

      if (renderData[idx]) {
        // Price Info
        this.drawCandleInfo(renderData[idx], "price", priceChartTop + 5);

        // Sub-charts Info
        chartPositions.forEach(({ type, top }) => {
          this.drawCandleInfo(renderData[idx], type, top + 5);
        });
      }
    }
    return this;
  }

  private drawVerticalTitle(text: string, y: number) {
    const { ctx, padding } = this;
    ctx.save();
    ctx.fillStyle = "#666666";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.translate(padding.left - 65, y);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  private drawLabelsOnly(
    pMin: number,
    pMax: number,
    bPrice: number,
    pyScale: (v: number) => number,
    vMax: number,
    oMin: number,
    oMax: number,
    chartPositions: Array<{
      type: "volume" | "obv" | "vosc" | "rsi" | "macd";
      top: number;
      height: number;
    }>,
    priceDataRange: number,
  ) {
    const { ctx, width, padding } = this;

    ctx.fillStyle = "#666666";

    const priceRange = pMax - pMin || 1;

    // Price 차트의 Y축 라벨 개수 설정 가져오기
    const priceLabels = this.getYAxisLabelCount("price");

    for (let i = 0; i < priceLabels.left; i++) {
      const divisor = Math.max(1, priceLabels.left - 1);
      const p = pMin + (pMax - pMin) * (i / divisor),
        y = pyScale(p);

      const mainCr = bPrice > 0 ? ((p - bPrice) / bPrice) * 100 : 0;

      const subCr = ((p - bPrice) / priceDataRange) * 100;

      ctx.textAlign = "right";

      ctx.font = "10px Arial";

      ctx.fillText(this.formatPrice(p), padding.left - 8, y + 3);

      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left - 4, y);
      ctx.stroke();
    }

    for (let i = 0; i < priceLabels.right; i++) {
      const divisor = Math.max(1, priceLabels.right - 1);
      const p = pMin + (pMax - pMin) * (i / divisor),
        y = pyScale(p);

      // 현재 보이는 데이터의 첫 번째 틱 close를 0% 기준으로 하고, close 가격만으로 범위 계산
      const renderData = this.getRenderData();
      const firstTickPrice = renderData.length > 0 ? renderData[0].close : p;

      // close 가격만으로 min, max 찾기
      let closeMin = Infinity,
        closeMax = -Infinity;
      renderData.forEach((d) => {
        closeMin = Math.min(closeMin, d.close);
        closeMax = Math.max(closeMax, d.close);
      });

      // 최대값을 +100%, 최소값을 -100%로 고정
      let percentage;
      if (p >= firstTickPrice) {
        const maxDistance = closeMax - firstTickPrice || 1;
        percentage = ((p - firstTickPrice) / maxDistance) * 100;
      } else {
        const minDistance = firstTickPrice - closeMin || 1;
        percentage = -((firstTickPrice - p) / minDistance) * 100;
      }

      // 절대적 변화율 계산
      const absChange =
        firstTickPrice !== 0
          ? ((p - firstTickPrice) / firstTickPrice) * 100
          : 0;

      ctx.textAlign = "left";
      ctx.font = "10px Arial";
      ctx.fillText(
        `${percentage >= 0 ? "+" : ""}${percentage.toFixed(1)}%`,
        width - padding.right + 8,
        y - 2,
      );
      ctx.font = "8px Arial";
      ctx.fillText(
        `(${absChange >= 0 ? "+" : ""}${absChange.toFixed(1)}%)`,
        width - padding.right + 8,
        y + 8,
      );

      ctx.beginPath();
      ctx.moveTo(width - padding.right, y);
      ctx.lineTo(width - padding.right + 4, y);
      ctx.stroke();
    }

    chartPositions.forEach(({ type, top, height: ch }) => {
      const renderData = this.getRenderData();

      const chartLabels = this.getYAxisLabelCount(type);

      if (type === "volume") {
        // 볼륨 차트 여백을 고려한 라벨 계산
        const volumeChartPadding = 0.1;
        const vYScale = (p: number) =>
          top + ch - (p / (100 * (1 + volumeChartPadding))) * ch;

        const baseVol = renderData.length > 0 ? renderData[0].volume || 1 : 1;

        // 현재 보이는 데이터의 volume min, max 찾기
        let volMin = Infinity,
          maxVolLocal = -Infinity;
        renderData.forEach((d) => {
          volMin = Math.min(volMin, d.volume);
          maxVolLocal = Math.max(maxVolLocal, d.volume);
        });

        for (let i = 0; i < chartLabels.left; i++) {
          const divisor = Math.max(1, chartLabels.left - 1);
          const p = i * (100 / divisor),
            y = vYScale(p);

          const val = (p / 100) * vMax;

          ctx.textAlign = "right";
          ctx.font = "10px Arial";
          ctx.fillText(this.formatVolume(val), padding.left - 8, y + 3);
          ctx.beginPath();
          ctx.moveTo(padding.left, y);
          ctx.lineTo(padding.left - 4, y);
          ctx.stroke();
        }

        for (let i = 0; i < chartLabels.right; i++) {
          const divisor = Math.max(1, chartLabels.right - 1);
          const p = i * (100 / divisor),
            y = vYScale(p);

          const val = (p / 100) * vMax;

          // 최대값을 +100%, 최소값을 -100%로 고정
          let percentage;
          if (val >= baseVol) {
            const maxDistance = maxVolLocal - baseVol || 1;
            percentage = ((val - baseVol) / maxDistance) * 100;
          } else {
            const minDistance = baseVol - volMin || 1;
            percentage = -((baseVol - val) / minDistance) * 100;
          }

          // 절대적 변화율 계산
          const absChange =
            baseVol !== 0 ? ((val - baseVol) / baseVol) * 100 : 0;

          ctx.textAlign = "left";
          ctx.font = "10px Arial";
          ctx.fillText(
            `${percentage >= 0 ? "+" : ""}${percentage.toFixed(1)}%`,
            width - padding.right + 8,
            y - 2,
          );
          ctx.font = "8px Arial";
          ctx.fillText(
            `(${absChange >= 0 ? "+" : ""}${absChange.toFixed(1)}%)`,
            width - padding.right + 8,
            y + 8,
          );
          ctx.beginPath();
          ctx.moveTo(width - padding.right, y);
          ctx.lineTo(width - padding.right + 4, y);
          ctx.stroke();
        }
      } else if (type === "obv") {
        const baseOBV =
          renderData.length > 0 ? renderData[0].obv?.value || 1 : 1;

        // 현재 보이는 데이터의 OBV min, max 찾기 (패딩 제외한 원본 값)
        let obvMin = Infinity,
          obvMax = -Infinity;
        renderData.forEach((d) => {
          if (d.obv?.value !== undefined) {
            obvMin = Math.min(obvMin, d.obv.value);
            obvMax = Math.max(obvMax, d.obv.value);
          }
        });

        for (let i = 0; i < chartLabels.left; i++) {
          const divisor = Math.max(1, chartLabels.left - 1);
          const v = oMin + (oMax - oMin) * (i / divisor),
            y = top + ch - ((v - oMin) / (oMax - oMin)) * ch;

          ctx.textAlign = "right";
          ctx.font = "10px Arial";
          ctx.fillText(this.formatVolume(v), padding.left - 8, y + 3);
          ctx.beginPath();
          ctx.moveTo(padding.left, y);
          ctx.lineTo(padding.left - 4, y);
          ctx.stroke();
        }

        for (let i = 0; i < chartLabels.right; i++) {
          const divisor = Math.max(1, chartLabels.right - 1);
          const v = oMin + (oMax - oMin) * (i / divisor),
            y = top + ch - ((v - oMin) / (oMax - oMin)) * ch;

          // 최대값을 +100%, 최소값을 -100%로 고정
          let percentage;
          if (v >= baseOBV) {
            const maxDistance = obvMax - baseOBV || 1;
            percentage = ((v - baseOBV) / maxDistance) * 100;
          } else {
            const minDistance = baseOBV - obvMin || 1;
            percentage = -((baseOBV - v) / minDistance) * 100;
          }

          // 절대적 변화율 계산
          const absChange =
            baseOBV !== 0 ? ((v - baseOBV) / Math.abs(baseOBV)) * 100 : 0;

          ctx.textAlign = "left";
          ctx.font = "10px Arial";
          ctx.fillText(
            `${percentage >= 0 ? "+" : ""}${percentage.toFixed(1)}%`,
            width - padding.right + 8,
            y - 2,
          );
          ctx.font = "8px Arial";
          ctx.fillText(
            `(${absChange >= 0 ? "+" : ""}${absChange.toFixed(1)}%)`,
            width - padding.right + 8,
            y + 8,
          );
          ctx.beginPath();
          ctx.moveTo(width - padding.right, y);
          ctx.lineTo(width - padding.right + 4, y);
          ctx.stroke();
        }
      } else if (type === "vosc") {
        const { sp, lp } = this.getVOSCParams();

        let vMin = Infinity,
          vMax = -Infinity;
        let firstValidVOSC: number | null = null;

        renderData.forEach((_, i) => {
          const sIdx = Math.floor(this.visibleStartIndex) + i;
          const val = this.calculateVOSCValue(sIdx, sp, lp);
          if (val !== null) {
            if (firstValidVOSC === null) firstValidVOSC = val;
            vMin = Math.min(vMin, val);
            vMax = Math.max(vMax, val);
          }
        });

        const absMax =
          Math.max(
            Math.abs(vMin === Infinity ? 0 : vMin),
            Math.abs(vMax === -Infinity ? 0 : vMax),
          ) || 1;
        const voscYScale = (v: number) =>
          top + ch / 2 - (v / absMax) * ((ch / 2) * 0.8);
        const baseVOSC = firstValidVOSC !== null ? firstValidVOSC : 0;

        const pts = [
          { v: absMax, y: voscYScale(absMax) },
          { v: 0, y: voscYScale(0) },
          { v: -absMax, y: voscYScale(-absMax) },
        ];
        pts.forEach((p) => {
          // 최대값을 +100%, 최소값을 -100%로 고정
          let percentage;
          if (p.v >= baseVOSC) {
            const maxDistance = vMax - baseVOSC || 1;
            percentage = ((p.v - baseVOSC) / maxDistance) * 100;
          } else {
            const minDistance = baseVOSC - vMin || 1;
            percentage = -((baseVOSC - p.v) / minDistance) * 100;
          }

          // 절대적 변화율 계산 (VOSC는 이미 백분율이므로 차이만 계산하거나 상황에 맞게 처리)
          const absChange = p.v - baseVOSC;

          ctx.textAlign = "right";
          ctx.font = "10px Arial";
          ctx.fillText(`${p.v.toFixed(1)}%`, padding.left - 8, p.y + 3);
          ctx.beginPath();
          ctx.moveTo(padding.left, p.y);
          ctx.lineTo(padding.left - 4, p.y);
          ctx.stroke();

          ctx.textAlign = "left";
          ctx.font = "10px Arial";
          ctx.fillText(
            `${percentage >= 0 ? "+" : ""}${percentage.toFixed(1)}%`,
            width - padding.right + 8,
            p.y - 2,
          );
          ctx.font = "8px Arial";
          ctx.fillText(
            `(${absChange >= 0 ? "+" : ""}${absChange.toFixed(1)}%)`,
            width - padding.right + 8,
            p.y + 8,
          );
          ctx.beginPath();
          ctx.moveTo(width - padding.right, p.y);
          ctx.lineTo(width - padding.right + 4, p.y);
          ctx.stroke();
        });
      } else if (type === "rsi") {
        const rsiYScale = (v: number) => top + ch - (v / 100) * ch;
        const chartLabels = this.getYAxisLabelCount(type);

        for (let i = 0; i < chartLabels.left; i++) {
          const divisor = Math.max(1, chartLabels.left - 1);
          const v = i * (100 / divisor);
          const y = rsiYScale(v);

          ctx.textAlign = "right";
          ctx.font = "10px Arial";
          ctx.fillText(v.toFixed(0), padding.left - 8, y + 3);
          ctx.beginPath();
          ctx.moveTo(padding.left, y);
          ctx.lineTo(padding.left - 4, y);
          ctx.stroke();
        }

        const baseRSI =
          renderData.length > 0 ? renderData[0].rsi?.value || 50 : 50;

        for (let i = 0; i < chartLabels.right; i++) {
          const divisor = Math.max(1, chartLabels.right - 1);
          const v = i * (100 / divisor);
          const y = rsiYScale(v);

          const diff = v - baseRSI;

          ctx.textAlign = "left";
          ctx.font = "10px Arial";
          ctx.fillText(v.toFixed(0), width - padding.right + 8, y - 2);
          ctx.font = "8px Arial";
          ctx.fillText(
            `(${diff >= 0 ? "+" : ""}${diff.toFixed(1)})`,
            width - padding.right + 8,
            y + 8,
          );

          ctx.beginPath();
          ctx.moveTo(width - padding.right, y);
          ctx.lineTo(width - padding.right + 4, y);
          ctx.stroke();
        }
      } else if (type === "macd") {
        const renderData = this.getRenderData();
        let mMin = Infinity,
          mMax = -Infinity;
        renderData.forEach((d) => {
          if (d.macd) {
            mMin = Math.min(mMin, d.macd.histogram, d.macd.macd, d.macd.signal);
            mMax = Math.max(mMax, d.macd.histogram, d.macd.macd, d.macd.signal);
          }
        });
        if (mMin === Infinity) {
          mMin = -1;
          mMax = 1;
        }
        const range = mMax - mMin || 1;
        mMin -= range * 0.1;
        mMax += range * 0.1;

        const macdYScale = (v: number) =>
          top + ch - ((v - mMin) / (mMax - mMin)) * ch;
        const chartLabels = this.getYAxisLabelCount(type);

        for (let i = 0; i < chartLabels.left; i++) {
          const divisor = Math.max(1, chartLabels.left - 1);
          const v = mMin + (mMax - mMin) * (i / divisor);
          const y = macdYScale(v);

          ctx.textAlign = "right";
          ctx.font = "10px Arial";
          ctx.fillText(v.toFixed(2), padding.left - 8, y + 3);
          ctx.beginPath();
          ctx.moveTo(padding.left, y);
          ctx.lineTo(padding.left - 4, y);
          ctx.stroke();
        }

        // Right side labels (optional, maybe just mirror left)
        for (let i = 0; i < chartLabels.right; i++) {
          const divisor = Math.max(1, chartLabels.right - 1);
          const v = mMin + (mMax - mMin) * (i / divisor);
          const y = macdYScale(v);

          ctx.textAlign = "left";
          ctx.font = "10px Arial";
          ctx.fillText(v.toFixed(2), width - padding.right + 8, y + 3);
          ctx.beginPath();
          ctx.moveTo(width - padding.right, y);
          ctx.lineTo(width - padding.right + 4, y);
          ctx.stroke();
        }
      }
    });

    ctx.font = "10px Arial";

    // 간단한 3개 점선 그리기: 첫번째값, 최대값, 최소값 (config로 제어)
    const renderData = this.getRenderData();
    if (renderData.length > 0) {
      if (this.shouldShowPercentageLines("price")) {
        // Price 차트 점선
        const firstPrice = renderData[0].close;
        let minPrice = Infinity,
          maxPrice = -Infinity;
        renderData.forEach((d) => {
          minPrice = Math.min(minPrice, d.close);
          maxPrice = Math.max(maxPrice, d.close);
        });

        const firstY = pyScale(firstPrice);
        const maxY = pyScale(maxPrice);
        const minY = pyScale(minPrice);

        // 영역 채우기 (볼린저 밴드 스타일)
        if (this.shouldShowPercentageLineFill("price")) {
          ctx.save();

          // 첫번째틱에서 최대값까지 영역 (빨강)
          ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
          ctx.fillRect(
            padding.left,
            Math.min(firstY, maxY),
            width - padding.left - padding.right,
            Math.abs(maxY - firstY),
          );

          // 첫번째틱에서 최소값까지 영역 (파랑)
          ctx.fillStyle = "rgba(0, 0, 255, 0.1)";
          ctx.fillRect(
            padding.left,
            Math.min(firstY, minY),
            width - padding.left - padding.right,
            Math.abs(minY - firstY),
          );

          ctx.restore();
        }

        // 점선 그리기
        if (this.shouldShowPercentageLineLines("price")) {
          // 첫번째값 점선 (0%)
          ctx.save();
          ctx.strokeStyle = "#FF00FF";
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(padding.left, firstY);
          ctx.lineTo(width - padding.right, firstY);
          ctx.stroke();
          ctx.restore();

          // 최대값 점선 (+100%)
          ctx.save();
          ctx.strokeStyle = "#FF00FF";
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(padding.left, maxY);
          ctx.lineTo(width - padding.right, maxY);
          ctx.stroke();
          ctx.restore();

          // 최소값 점선 (-100%)
          ctx.save();
          ctx.strokeStyle = "#FF00FF";
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(padding.left, minY);
          ctx.lineTo(width - padding.right, minY);
          ctx.stroke();
          ctx.restore();
        }
      }

      // 각 서브차트에도 동일하게 적용
      chartPositions.forEach(({ type, top, height: ch }) => {
        if (!this.shouldShowPercentageLines(type)) return;

        if (type === "volume") {
          const volumeChartPadding = 0.1;
          const vYScale = (p: number) =>
            top + ch - (p / (100 * (1 + volumeChartPadding))) * ch;

          const firstVol = renderData[0].volume;
          let minVol = Infinity,
            maxVol = -Infinity;
          renderData.forEach((d) => {
            minVol = Math.min(minVol, d.volume);
            maxVol = Math.max(maxVol, d.volume);
          });

          // Volume 차트 영역 채우기
          const firstVolY = vYScale((firstVol / maxVol) * 100);
          const maxVolY = vYScale((maxVol / maxVol) * 100);
          const minVolY = vYScale((minVol / maxVol) * 100);

          // 영역 채우기
          if (this.shouldShowPercentageLineFill("volume")) {
            ctx.save();
            // 첫번째틱에서 최대값까지 영역 (빨강)
            ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
            ctx.fillRect(
              padding.left,
              Math.min(firstVolY, maxVolY),
              width - padding.left - padding.right,
              Math.abs(maxVolY - firstVolY),
            );

            // 첫번째틱에서 최소값까지 영역 (파랑)
            ctx.fillStyle = "rgba(0, 0, 255, 0.1)";
            ctx.fillRect(
              padding.left,
              Math.min(firstVolY, minVolY),
              width - padding.left - padding.right,
              Math.abs(minVolY - firstVolY),
            );
            ctx.restore();
          }

          // Volume 차트 점선들
          if (this.shouldShowPercentageLineLines("volume")) {
            [firstVolY, maxVolY, minVolY].forEach((y) => {
              ctx.save();
              ctx.strokeStyle = "#FF00FF";
              ctx.setLineDash([4, 4]);
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(padding.left, y);
              ctx.lineTo(width - padding.right, y);
              ctx.stroke();
              ctx.restore();
            });
          }
        } else if (type === "obv") {
          const oYScale = (v: number) =>
            top + ch - ((v - oMin) / (oMax - oMin)) * ch;
          const firstOBV = renderData[0].obv?.value || 0;
          let minOBV = Infinity,
            maxOBV = -Infinity;
          renderData.forEach((d) => {
            if (d.obv?.value !== undefined) {
              minOBV = Math.min(minOBV, d.obv.value);
              maxOBV = Math.max(maxOBV, d.obv.value);
            }
          });

          // OBV 차트 영역 채우기
          const firstOBVY = oYScale(firstOBV);
          const maxOBVY = oYScale(maxOBV);
          const minOBVY = oYScale(minOBV);

          // 영역 채우기
          if (this.shouldShowPercentageLineFill("obv")) {
            ctx.save();
            // 첫번째틱에서 최대값까지 영역 (빨강)
            ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
            ctx.fillRect(
              padding.left,
              Math.min(firstOBVY, maxOBVY),
              width - padding.left - padding.right,
              Math.abs(maxOBVY - firstOBVY),
            );

            // 첫번째틱에서 최소값까지 영역 (파랑)
            ctx.fillStyle = "rgba(0, 0, 255, 0.1)";
            ctx.fillRect(
              padding.left,
              Math.min(firstOBVY, minOBVY),
              width - padding.left - padding.right,
              Math.abs(minOBVY - firstOBVY),
            );
            ctx.restore();
          }

          // OBV 차트 점선들
          if (this.shouldShowPercentageLineLines("obv")) {
            [firstOBVY, maxOBVY, minOBVY].forEach((y) => {
              ctx.save();
              ctx.strokeStyle = "#FF00FF";
              ctx.setLineDash([4, 4]);
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(padding.left, y);
              ctx.lineTo(width - padding.right, y);
              ctx.stroke();
              ctx.restore();
            });
          }
        } else if (type === "vosc") {
          // VOSC 값들 계산
          let sp = 5,
            lp = 10;
          if (this.maPeriods.length >= 2) {
            const s = [...this.maPeriods].sort((a, b) => a - b);
            sp = s[0];
            lp = s[s.length - 1];
          }

          const voscValues: number[] = [];
          renderData.forEach((_, i) => {
            const sIdx = Math.floor(this.visibleStartIndex) + i;
            const sv = this.getMAValue(sIdx, sp, "volume");
            const lv = this.getMAValue(sIdx, lp, "volume");
            const val =
              sv !== null && lv !== null && lv !== 0
                ? ((sv - lv) / lv) * 100
                : 0;
            voscValues.push(val);
          });

          if (voscValues.length > 0) {
            const minVOSC = Math.min(...voscValues);
            const maxVOSC = Math.max(...voscValues);
            const absMax = Math.max(Math.abs(minVOSC), Math.abs(maxVOSC)) || 1;
            const voscYScale = (v: number) =>
              top + ch / 2 - (v / absMax) * ((ch / 2) * 0.8);

            const firstVOSC = voscValues[0];

            // VOSC 차트 영역 채우기
            const firstVOSCY = voscYScale(firstVOSC);
            const maxVOSCY = voscYScale(maxVOSC);
            const minVOSCY = voscYScale(minVOSC);

            // 영역 채우기
            if (this.shouldShowPercentageLineFill("vosc")) {
              ctx.save();
              // 첫번째틱에서 최대값까지 영역 (빨강)
              ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
              ctx.fillRect(
                padding.left,
                Math.min(firstVOSCY, maxVOSCY),
                width - padding.left - padding.right,
                Math.abs(maxVOSCY - firstVOSCY),
              );

              // 첫번째틱에서 최소값까지 영역 (파랑)
              ctx.fillStyle = "rgba(0, 0, 255, 0.1)";
              ctx.fillRect(
                padding.left,
                Math.min(firstVOSCY, minVOSCY),
                width - padding.left - padding.right,
                Math.abs(minVOSCY - firstVOSCY),
              );
              ctx.restore();
            }

            // VOSC 차트 점선들 (중앙 기준)
            if (this.shouldShowPercentageLineLines("vosc")) {
              [firstVOSCY, maxVOSCY, minVOSCY].forEach((y) => {
                ctx.save();
                ctx.strokeStyle = "#FF00FF";
                ctx.setLineDash([4, 4]);
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(padding.left, y);
                ctx.lineTo(width - padding.right, y);
                ctx.stroke();
                ctx.restore();
              });
            }
          }
        }
      });
    }
  }

  private getYAxisLabelCount(
    chartType: "price" | "volume" | "obv" | "vosc" | "rsi" | "macd",
  ): { left: number; right: number } {
    const { config } = this;
    const yAxisConfig = config.yAxisLabelCount ?? 5;

    // 기본값 설정
    let defaultConfig: YAxisLabelConfig = 5;

    // 차트별 설정이 있는지 확인
    if (typeof yAxisConfig === "object" && "price" in yAxisConfig) {
      // ChartYAxisConfig 타입인 경우
      const chartSpecificConfig = (yAxisConfig as ChartYAxisConfig)[chartType];
      if (chartSpecificConfig !== undefined) {
        defaultConfig = chartSpecificConfig;
      } else if ((yAxisConfig as ChartYAxisConfig).price !== undefined) {
        // 해당 차트 설정이 없으면 price 설정을 기본으로 사용
        defaultConfig = (yAxisConfig as ChartYAxisConfig).price!;
      }
    } else {
      // YAxisLabelConfig 타입인 경우 (전체 공통 설정)
      defaultConfig = yAxisConfig as YAxisLabelConfig;
    }

    // 최종 left, right 값 반환
    if (typeof defaultConfig === "number") {
      return { left: defaultConfig, right: defaultConfig };
    } else if (defaultConfig !== null) {
      return { left: defaultConfig.left ?? 5, right: defaultConfig.right ?? 5 };
    }
    return { left: 5, right: 5 };
  }

  private drawCombinedGrid(
    minPrice: number,
    maxPrice: number,
    basePrice: number,
    yScale: (v: number) => number,
  ) {
    // const { ctx, width, padding } = this;
    // ctx.strokeStyle = '#eeeeee';
    //
    // // Price 차트의 Y축 라벨 개수 설정 가져오기
    // const { left, right } = this.getYAxisLabelCount('price');
    // const maxLabelCount = Math.max(left, right);
    //
    // for (let i = 0; i < maxLabelCount; i++) {
    //   const divisor = Math.max(1, maxLabelCount - 1);
    //   const price = minPrice + (maxPrice - minPrice) * (i / divisor), y = yScale(price);
    //   ctx.beginPath(); ctx.moveTo(padding.left, y); ctx.lineTo(padding.left + (width - padding.left - padding.right), y); ctx.stroke();
    // }
  }

  private drawVolumeGrid(maxVol: number, yScale: (p: number) => number) {
    // const { ctx, width, padding } = this; ctx.strokeStyle = '#eeeeee';
    // for (let i = 0; i <= 4; i++) {
    //     const p = i * 25, y = yScale(p);
    //     ctx.beginPath(); ctx.moveTo(padding.left, y); ctx.lineTo(padding.left + (width - padding.left - padding.right), y); ctx.stroke();
    // }
  }

  private drawOBVGrid(
    minVal: number,
    maxVal: number,
    yScale: (v: number) => number,
  ) {
    // const { ctx, width, padding } = this; ctx.strokeStyle = '#eeeeee';
    // for (let i = 0; i <= 3; i++) {
    //   const value = minVal + (maxVal - minVal) * (i / 3), y = yScale(value);
    //   ctx.beginPath(); ctx.moveTo(padding.left, y); ctx.lineTo(padding.left + (width - padding.left - padding.right), y); ctx.stroke();
    // }
  }

  private drawCandleInfo(
    candle: ChartDataPoint,
    type: "price" | "volume" | "obv" | "vosc" | "rsi" | "macd",
    y: number,
  ): void {
    const { ctx, padding } = this;
    ctx.font = "8px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    let x = padding.left + 1;

    // Background for text to make it readable over grid/chart?
    // Maybe semi-transparent white box behind?
    // For now, just text with shadow or simple text.

    if (type === "price") {
      const candleChange = candle.close - candle.open;
      const cr = candle.open > 0 ? (candleChange / candle.open) * 100 : 0;
      const isUp = candle.close >= candle.open;

      const parts = [
        {
          l: "O",
          v: this.formatPrice(candle.open),
          c: isUp ? "#D32F2F" : "#1976D2",
        },
        { l: "H", v: this.formatPrice(candle.high), c: "#D32F2F" },
        { l: "L", v: this.formatPrice(candle.low), c: "#1976D2" },
        {
          l: "C",
          v: this.formatPrice(candle.close),
          c: isUp ? "#D32F2F" : "#1976D2",
        },
        {
          l: "",
          v: `${candleChange >= 0 ? "+" : ""}${cr.toFixed(2)}%`,
          c: candleChange >= 0 ? "#D32F2F" : "#1976D2",
        },
      ];

      parts.forEach((p) => {
        ctx.fillStyle = "#666";
        if (p.l) {
          ctx.fillText(p.l, x, y);
          x += ctx.measureText(p.l).width + 1;
          ctx.fillText(":", x, y);
          x += 2;
        }
        ctx.fillStyle = p.c;
        ctx.fillText(p.v, x, y);
        x += ctx.measureText(p.v).width + 2;
      });
    } else if (type === "volume") {
      const isUp = candle.close >= candle.open;
      ctx.fillStyle = "#666";
      ctx.fillText("Vol", x, y);
      x += ctx.measureText("Vol").width + 1;
      ctx.fillText(":", x, y);
      x += 2;
      ctx.fillStyle = isUp ? "#D32F2F" : "#1976D2";
      ctx.fillText(this.formatVolume(candle.volume), x, y);
    } else if (type === "obv") {
      if (candle.obv?.value !== undefined) {
        ctx.fillStyle = "#666";
        ctx.fillText("OBV", x, y);
        x += ctx.measureText("OBV").width + 1;
        ctx.fillText(":", x, y);
        x += 2;
        ctx.fillStyle = "#9C27B0";
        ctx.fillText(this.formatVolume(candle.obv.value), x, y);

        if (candle.obv.signal !== undefined) {
          x += ctx.measureText(this.formatVolume(candle.obv.value)).width + 1;
          ctx.fillStyle = "#666";
          ctx.fillText("Sig", x, y);
          x += ctx.measureText("Sig").width + 3;
          ctx.fillText(":", x, y);
          x += 2;
          ctx.fillStyle = "#FF9800";
          ctx.fillText(this.formatVolume(candle.obv.signal), x, y);
        }

        x += 80; // Add spacing
      }
    } else if (type === "vosc") {
      const { sp, lp } = this.getVOSCParams();
      // We need the index of the candle in the full data array to calculate VOSC
      const candleIndex = this.data.indexOf(candle);
      if (candleIndex !== -1) {
        const voscVal = this.calculateVOSCValue(candleIndex, sp, lp);

        if (voscVal !== null) {
          ctx.fillStyle = "#666";
          ctx.fillText("VOSC", x, y);
          x += ctx.measureText("VOSC").width + 1;
          ctx.fillText(":", x, y);
          x += 2;

          ctx.fillStyle = voscVal >= 0 ? "#D32F2F" : "#1976D2";
          ctx.fillText(`${voscVal.toFixed(2)}%`, x, y);
        }
      }
    } else if (type === "rsi") {
      if (candle.rsi?.value !== undefined && candle.rsi?.value !== null) {
        ctx.fillStyle = "#666";
        ctx.fillText("RSI", x, y);
        x += ctx.measureText("RSI").width + 1;
        ctx.fillText(":", x, y);
        x += 2;
        ctx.fillStyle = "#9C27B0";
        ctx.fillText(candle.rsi.value.toFixed(2), x, y);

        if (candle.rsi.signal !== undefined) {
          x += ctx.measureText(candle.rsi.value.toFixed(2)).width + 1;
          ctx.fillStyle = "#666";
          ctx.fillText("Sig", x, y);
          x += ctx.measureText("Sig").width + 3;
          ctx.fillText(":", x, y);
          x += 2;
          ctx.fillStyle = "#FF9800";
          ctx.fillText(candle.rsi.signal.toFixed(2), x, y);
        }

        x += 60;
      }
    } else if (type === "macd") {
      if (candle.macd) {
        ctx.fillStyle = "#666";
        ctx.fillText("MACD", x, y);
        x += ctx.measureText("MACD").width + 1;
        ctx.fillText(":", x, y);
        x += 2;

        ctx.fillStyle = "#2196F3";
        const mVal = candle.macd.macd.toFixed(2);
        ctx.fillText(mVal, x, y);
        x += ctx.measureText(mVal).width + 1;

        ctx.fillStyle = "#666";
        ctx.fillText("Sig", x, y);
        x += ctx.measureText("Sig").width + 1;
        ctx.fillText(":", x, y);
        x += 2;

        ctx.fillStyle = "#FF9800";
        const sVal = candle.macd.signal.toFixed(2);
        ctx.fillText(sVal, x, y);
        x += ctx.measureText(sVal).width + 1;

        ctx.fillStyle = "#666";
        ctx.fillText("Hist", x, y);
        x += ctx.measureText("Hist").width + 1;
        ctx.fillText(":", x, y);
        x += 2;

        ctx.fillStyle = candle.macd.histogram >= 0 ? "#4CAF50" : "#F44336";
        ctx.fillText(candle.macd.histogram.toFixed(2), x, y);
      }
    }

    ctx.textBaseline = "alphabetic"; // Reset
  }

  private drawLegend(): void {
    const { ctx, padding } = this;
    let x = padding.left;
    const y = padding.top - 25;
    ctx.font = "11px Arial";
    ctx.textAlign = "left";

    // Price 이동평균선이 표시되는 경우에만 범례 표시
    const showPriceMA = this.shouldShowMovingAverages("price");
    if (showPriceMA) {
      this.maPeriods.forEach((period) => {
        ctx.strokeStyle = MA_COLORS[period] || "#888888";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y - 4);
        ctx.lineTo(x + 20, y - 4);
        ctx.stroke();
        ctx.fillStyle = "#000000";
        ctx.fillText(`MA${period}`, x + 24, y);
        x += 65;
      });
    }
  }

  private drawSummary(): void {
    if (!this.summary) return;
    const { ctx, width, padding } = this;
    const { totalHolding, totalProfitRate, totalProfit } = this.summary;
    const x = width - padding.right,
      y = padding.top - 25;
    ctx.font = "10px Arial";
    ctx.textAlign = "right";
    ctx.fillStyle = "#000000";
    ctx.fillText(`보유: ${totalHolding.toLocaleString()}주`, x, y - 12);
    ctx.fillStyle = totalProfitRate >= 0 ? "#D32F2F" : "#1976D2";
    ctx.fillText(
      `수익률: ${totalProfitRate >= 0 ? "+" : ""}${totalProfitRate.toFixed(2)}%`,
      x,
      y,
    );
    ctx.fillText(
      `수익: ${totalProfit >= 0 ? "+" : ""}${totalProfit.toLocaleString()}원`,
      x,
      y + 12,
    );
  }

  private drawXAxisLabelsDynamic(
    renderData: ChartDataPoint[],
    xScale: (i: number) => number,
    pt: number,
    lb: number,
  ): void {
    const { ctx, width, padding, config } = this;
    ctx.strokeStyle = "#cccccc";
    ctx.fillStyle = "#666666";
    ctx.font = "10px Arial";
    const chartWidth = width - padding.left - padding.right;
    ctx.beginPath();
    ctx.moveTo(padding.left, lb);
    ctx.lineTo(padding.left + chartWidth, lb);
    ctx.stroke();

    let count = config.xAxisLabelCount ?? 5;
    if (count <= 0 || renderData.length === 0) return;

    // 데이터 개수가 라벨 개수보다 적으면 데이터 개수만큼만 표시
    if (renderData.length < count) {
      count = renderData.length;
    }

    const startTime = renderData[0].time.getTime();
    const endTime = renderData[renderData.length - 1].time.getTime();
    const isIntraday = endTime - startTime < 24 * 60 * 60 * 1000;

    const divisor = count > 1 ? count - 1 : 1;
    for (let j = 0; j < count; j++) {
      const i = Math.round((j * (renderData.length - 1)) / divisor);
      if (i < 0 || i >= renderData.length) continue;

      const d = renderData[i];
      const x = xScale(i);

      if (x < padding.left || x > padding.left + chartWidth) continue;

      if (config.showDateLine) {
        ctx.save();
        ctx.strokeStyle = "#eeeeee";
        ctx.beginPath();
        ctx.moveTo(x, pt);
        ctx.lineTo(x, lb);
        ctx.stroke();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.moveTo(x, lb);
      ctx.lineTo(x, lb + 5);
      ctx.stroke();

      if (j === 0) ctx.textAlign = "left";
      else if (j === count - 1) ctx.textAlign = "right";
      else ctx.textAlign = "center";

      let label = "";
      if (isIntraday) {
        const h = d.time.getHours().toString().padStart(2, "0");
        const m = d.time.getMinutes().toString().padStart(2, "0");
        label = `${h}:${m}`;
      } else {
        label = `${d.time.getMonth() + 1}/${d.time.getDate()}`;
      }
      ctx.fillText(label, x, lb + 18);
    }
  }

  private drawCrossMarkersDynamic(
    renderData: ChartDataPoint[],
    xScale: (i: number) => number,
    pt: number,
    lb: number,
  ): void {
    const { ctx, config } = this;
    if (renderData.length === 0) return;

    const showGolden = config.show?.goldenCross !== false; // 기본값 true
    const showDead = config.show?.deadCross !== false; // 기본값 true
    const showNormal = config.show?.normalCross !== false; // 기본값 true

    let lastStatus: "GOLDEN" | "DEAD" | "NORMAL" | undefined;
    const startIdx = Math.floor(this.visibleStartIndex);
    for (let j = startIdx - 1; j >= 0; j--) {
      if (this.data[j].crossEvent) {
        lastStatus = this.data[j].crossEvent;
        break;
      }
    }

    renderData.forEach((d, i) => {
      const currentStatus = d.crossEvent;
      if (!currentStatus) return;

      if (currentStatus === lastStatus) return;
      lastStatus = currentStatus;

      if (currentStatus === "GOLDEN" && !showGolden) return;
      if (currentStatus === "DEAD" && !showDead) return;
      if (currentStatus === "NORMAL" && !showNormal) return;

      const x = xScale(i);
      let c: string, l: string;

      if (currentStatus === "GOLDEN") {
        c = "#FFD700";
        l = "G";
      } else if (currentStatus === "DEAD") {
        c = "#F44336";
        l = "D";
      } else {
        // NORMAL
        c = "#888888";
        l = "N";
      }

      ctx.strokeStyle = c;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x, pt);
      ctx.lineTo(x, lb);
      ctx.stroke();
      ctx.setLineDash([]);
      const ay = lb,
        as = 14;
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(x, ay - as);
      ctx.lineTo(x - as * 0.6, ay);
      ctx.lineTo(x + as * 0.6, ay);
      ctx.closePath();
      ctx.fill();

      // 텍스트 색상 설정
      const textColor = currentStatus === "GOLDEN" ? "#000000" : "#FFFFFF";

      ctx.fillStyle = textColor;
      ctx.font = "bold 9px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(l, x, ay - as / 3);
      ctx.textBaseline = "alphabetic";
    });
  }

  private drawTradeMarkersDynamic(
    renderData: ChartDataPoint[],
    xScale: (i: number) => number,
    pt: number,
    lb: number,
  ): void {
    const { ctx, config } = this;
    if (renderData.length === 0) return;

    const showBuy = config.show?.buyMarkers !== false; // 기본값 true
    const showSell = config.show?.sellMarkers !== false; // 기본값 true

    renderData.forEach((d, i) => {
      if (!d.transactions || d.transactions.length === 0) return;

      d.transactions.forEach((tx) => {
        if (tx.type === "BUY" && !showBuy) return;
        if (tx.type === "SELL" && !showSell) return;

        const x = xScale(i),
          isB = tx.type === "BUY",
          c = isB ? "#1976D2" : "#D32F2F";
        let l = isB
          ? tx.isGoldenCrossEntry
            ? "B"
            : tx.isPyramiding
              ? "+"
              : "B"
          : tx.reason === "STOP_LOSS"
            ? "!"
            : tx.reason?.toString().startsWith("TAKE_PROFIT")
              ? "$"
              : "S";
        ctx.strokeStyle = c;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(x, pt);
        ctx.lineTo(x, lb);
        ctx.stroke();
        ctx.setLineDash([]);
        const as = 16,
          ay = pt;
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.moveTo(x, ay + as);
        ctx.lineTo(x - as * 0.6, ay);
        ctx.lineTo(x + as * 0.6, ay);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 9px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(l, x, ay + as * 0.4);
        ctx.textBaseline = "alphabetic";
        ctx.save();
        ctx.translate(x, ay - 5);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = c;
        ctx.font = "bold 8px Arial";
        ctx.textAlign = "left";
        ctx.fillText(`${tx.holdingAfter}(${tx.quantity})`, 0, 0);
        ctx.restore();
      });
    });
  }

  private drawCrosshair(
    renderData: ChartDataPoint[],
    xScale: (i: number) => number,
    priceYScale: (v: number) => number,
    pt: number,
    ph: number,
    lb: number,
    priceMin: number,
    priceMax: number,
    basePrice: number,
    chartPositions: Array<{
      type: "volume" | "obv" | "vosc" | "rsi" | "macd";
      top: number;
      height: number;
    }>,
    volMax: number,
    obvMin: number,
    obvMax: number,
    priceDataRange: number,
  ) {
    if (this.mouseX === null || this.mouseY === null) return;
    const { ctx, width, height, padding } = this;
    const cw = width - padding.left - padding.right;
    const mouseRatio = (this.mouseX - padding.left) / cw;
    const absIdx = this.visibleStartIndex + mouseRatio * this.visibleDataCount;
    let idx = Math.floor(absIdx - Math.floor(this.visibleStartIndex));
    idx = Math.max(0, Math.min(renderData.length - 1, idx));
    const sx = xScale(idx);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(sx, pt);
    ctx.lineTo(sx, lb);
    ctx.stroke();

    let showHLine = false;
    if (this.mouseY >= pt && this.mouseY <= pt + ph) {
      showHLine = true;
    } else {
      for (const pos of chartPositions) {
        if (this.mouseY >= pos.top && this.mouseY <= pos.top + pos.height) {
          showHLine = true;
          break;
        }
      }
    }

    if (showHLine) {
      ctx.beginPath();
      ctx.moveTo(padding.left, this.mouseY);
      ctx.lineTo(width - padding.right, this.mouseY);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    const bc = "#333333",
      tc = "#ffffff";
    ctx.font = "11px Arial";
    const tt = this.formatTime(renderData[idx].time),
      tw = ctx.measureText(tt).width + 10;
    ctx.fillStyle = bc;
    ctx.fillRect(sx - tw / 2, lb + 5, tw, 20);
    ctx.fillStyle = tc;
    ctx.textAlign = "center";
    ctx.fillText(tt, sx, lb + 19);
    if (this.mouseY >= pt && this.mouseY <= pt + ph) {
      const p = priceMax - ((this.mouseY - pt) / ph) * (priceMax - priceMin);
      const lt = this.formatPrice(p),
        lw = ctx.measureText(lt).width + 10;
      ctx.fillStyle = bc;
      ctx.fillRect(padding.left - lw, this.mouseY - 10, lw, 20);
      ctx.fillStyle = tc;
      ctx.textAlign = "right";
      ctx.fillText(lt, padding.left - 5, this.mouseY + 4);

      // 현재 보이는 데이터의 첫 번째 틱 close를 0% 기준으로 하고, close 가격만으로 범위 계산
      const firstTickPrice = renderData.length > 0 ? renderData[0].close : p;

      // close 가격만으로 min, max 찾기
      let closeMin = Infinity,
        closeMax = -Infinity;
      renderData.forEach((d) => {
        closeMin = Math.min(closeMin, d.close);
        closeMax = Math.max(closeMax, d.close);
      });

      // 최대값을 +100%, 최소값을 -100%로 고정
      let percentage;
      if (p >= firstTickPrice) {
        const maxDistance = closeMax - firstTickPrice || 1;
        percentage = ((p - firstTickPrice) / maxDistance) * 100;
      } else {
        const minDistance = firstTickPrice - closeMin || 1;
        percentage = -((firstTickPrice - p) / minDistance) * 100;
      }

      const absChange =
        firstTickPrice !== 0
          ? ((p - firstTickPrice) / firstTickPrice) * 100
          : 0;

      const rt1 = `${percentage >= 0 ? "+" : ""}${percentage.toFixed(2)}%`;
      const rt2 = `(${absChange >= 0 ? "+" : ""}${absChange.toFixed(2)}%)`;

      ctx.fillStyle = bc;
      const boxWidth =
        Math.max(ctx.measureText(rt1).width, ctx.measureText(rt2).width) + 10;
      ctx.fillRect(width - padding.right, this.mouseY - 12, boxWidth, 24);

      ctx.fillStyle = tc;
      ctx.textAlign = "left";
      ctx.font = "bold 9px Arial";
      ctx.fillText(rt1, width - padding.right + 5, this.mouseY - 1);
      ctx.font = "8px Arial";
      ctx.fillText(rt2, width - padding.right + 5, this.mouseY + 9);
    }
    chartPositions.forEach(({ type, top, height: ch }) => {
      if (this.mouseY && this.mouseY >= top && this.mouseY <= top + ch) {
        if (type === "volume") {
          // 볼륨 차트 여백을 고려한 값 계산
          const volumeChartPadding = 0.1;
          const vp =
              ((top + ch - this.mouseY) / ch) * 100 * (1 + volumeChartPadding),
            vol = (vp / 100) * volMax;
          const baseVol = renderData[0].volume || 1;

          // 현재 보이는 데이터의 volume min, max 찾기
          let volMin = Infinity,
            maxVolLocal = -Infinity;
          renderData.forEach((d) => {
            volMin = Math.min(volMin, d.volume);
            maxVolLocal = Math.max(maxVolLocal, d.volume);
          });

          // 최대값을 +100%, 최소값을 -100%로 고정
          let percentage;
          if (vol >= baseVol) {
            const maxDistance = maxVolLocal - baseVol || 1;
            percentage = ((vol - baseVol) / maxDistance) * 100;
          } else {
            const minDistance = baseVol - volMin || 1;
            percentage = -((baseVol - vol) / minDistance) * 100;
          }

          const absChange =
            baseVol !== 0 ? ((vol - baseVol) / baseVol) * 100 : 0;

          const lt = this.formatVolume(vol),
            lw = ctx.measureText(lt).width + 10;
          ctx.fillStyle = bc;
          ctx.fillRect(padding.left - lw, this.mouseY - 10, lw, 20);
          ctx.fillStyle = tc;
          ctx.textAlign = "right";
          ctx.fillText(lt, padding.left - 5, this.mouseY + 4);

          const rt1 = `${percentage >= 0 ? "+" : ""}${percentage.toFixed(1)}%`;
          const rt2 = `(${absChange >= 0 ? "+" : ""}${absChange.toFixed(1)}%)`;
          ctx.fillStyle = bc;
          const boxWidth =
            Math.max(ctx.measureText(rt1).width, ctx.measureText(rt2).width) +
            10;
          ctx.fillRect(width - padding.right, this.mouseY - 12, boxWidth, 24);
          ctx.fillStyle = tc;
          ctx.textAlign = "left";
          ctx.font = "bold 9px Arial";
          ctx.fillText(rt1, width - padding.right + 5, this.mouseY - 1);
          ctx.font = "8px Arial";
          ctx.fillText(rt2, width - padding.right + 5, this.mouseY + 9);
        } else if (type === "obv") {
          const val = obvMax - ((this.mouseY - top) / ch) * (obvMax - obvMin);
          const baseOBV = renderData[0].obv?.value || 1;

          // 현재 보이는 데이터의 OBV min, max 찾기 (패딩 제외한 원본 값)
          let obvMinData = Infinity,
            obvMaxData = -Infinity;
          renderData.forEach((d) => {
            if (d.obv?.value !== undefined) {
              obvMinData = Math.min(obvMinData, d.obv.value);
              obvMaxData = Math.max(obvMaxData, d.obv.value);
            }
          });

          // 최대값을 +100%, 최소값을 -100%로 고정
          let percentage;
          if (val >= baseOBV) {
            const maxDistance = obvMaxData - baseOBV || 1;
            percentage = ((val - baseOBV) / maxDistance) * 100;
          } else {
            const minDistance = baseOBV - obvMinData || 1;
            percentage = -((baseOBV - val) / minDistance) * 100;
          }

          const absChange =
            baseOBV !== 0 ? ((val - baseOBV) / Math.abs(baseOBV)) * 100 : 0;

          const lt = this.formatVolume(val),
            lw = ctx.measureText(lt).width + 10;
          ctx.fillStyle = bc;
          ctx.fillRect(padding.left - lw, this.mouseY - 10, lw, 20);
          ctx.fillStyle = tc;
          ctx.textAlign = "right";
          ctx.fillText(lt, padding.left - 5, this.mouseY + 4);

          const rt1 = `${percentage >= 0 ? "+" : ""}${percentage.toFixed(1)}%`;
          const rt2 = `(${absChange >= 0 ? "+" : ""}${absChange.toFixed(1)}%)`;
          ctx.fillStyle = bc;
          const boxWidth =
            Math.max(ctx.measureText(rt1).width, ctx.measureText(rt2).width) +
            10;
          ctx.fillRect(width - padding.right, this.mouseY - 12, boxWidth, 24);
          ctx.fillStyle = tc;
          ctx.textAlign = "left";
          ctx.font = "bold 9px Arial";
          ctx.fillText(rt1, width - padding.right + 5, this.mouseY - 1);
          ctx.font = "8px Arial";
          ctx.fillText(rt2, width - padding.right + 5, this.mouseY + 9);
        } else if (type === "vosc") {
          const { sp, lp } = this.getVOSCParams();
          const sIdx = Math.floor(this.visibleStartIndex);

          let vMin = Infinity,
            vMax = -Infinity;
          let firstValidVOSC: number | null = null;
          renderData.forEach((_, i) => {
            const si = Math.floor(this.visibleStartIndex) + i;
            const v = this.calculateVOSCValue(si, sp, lp);
            if (v !== null) {
              if (firstValidVOSC === null) firstValidVOSC = v;
              vMin = Math.min(vMin, v);
              vMax = Math.max(vMax, v);
            }
          });
          const absMax =
            Math.max(
              Math.abs(vMin === Infinity ? 0 : vMin),
              Math.abs(vMax === -Infinity ? 0 : vMax),
            ) || 1;
          const valAtMouseY =
            (-(this.mouseY - top - ch / 2) * absMax) / ((ch / 2) * 0.8);

          const lt = `${valAtMouseY.toFixed(1)}%`,
            lw = ctx.measureText(lt).width + 10;
          ctx.fillStyle = bc;
          ctx.fillRect(padding.left - lw, this.mouseY - 10, lw, 20);
          ctx.fillStyle = tc;
          ctx.textAlign = "right";
          ctx.fillText(lt, padding.left - 5, this.mouseY + 4);

          const baseVOSC = firstValidVOSC !== null ? firstValidVOSC : 0;

          // 최대값을 +100%, 최소값을 -100%로 고정
          let percentage;
          if (valAtMouseY >= baseVOSC) {
            const maxDistance = vMax - baseVOSC || 1;
            percentage = ((valAtMouseY - baseVOSC) / maxDistance) * 100;
          } else {
            const minDistance = baseVOSC - vMin || 1;
            percentage = -((baseVOSC - valAtMouseY) / minDistance) * 100;
          }

          const absChange = valAtMouseY - baseVOSC;

          const rt1 = `${percentage >= 0 ? "+" : ""}${percentage.toFixed(1)}%`;
          const rt2 = `(${absChange >= 0 ? "+" : ""}${absChange.toFixed(1)}%)`;
          ctx.fillStyle = bc;
          const boxWidth =
            Math.max(ctx.measureText(rt1).width, ctx.measureText(rt2).width) +
            10;
          ctx.fillRect(width - padding.right, this.mouseY - 12, boxWidth, 24);
          ctx.fillStyle = tc;
          ctx.textAlign = "left";
          ctx.font = "bold 9px Arial";
          ctx.fillText(rt1, width - padding.right + 5, this.mouseY - 1);
          ctx.font = "8px Arial";
          ctx.fillText(rt2, width - padding.right + 5, this.mouseY + 9);
        } else if (type === "rsi") {
          const valAtMouseY = 100 - ((this.mouseY - top) / ch) * 100;

          const lt = `${valAtMouseY.toFixed(1)}`,
            lw = ctx.measureText(lt).width + 10;
          ctx.fillStyle = bc;
          ctx.fillRect(padding.left - lw, this.mouseY - 10, lw, 20);
          ctx.fillStyle = tc;
          ctx.textAlign = "right";
          ctx.fillText(lt, padding.left - 5, this.mouseY + 4);

          const baseRSI =
            renderData.length > 0 ? renderData[0].rsi?.value || 50 : 50;

          const diff = valAtMouseY - baseRSI;

          const rt1 = `${valAtMouseY.toFixed(1)}`;
          const rt2 = `(${diff >= 0 ? "+" : ""}${diff.toFixed(1)})`;

          ctx.fillStyle = bc;
          const boxWidth =
            Math.max(ctx.measureText(rt1).width, ctx.measureText(rt2).width) +
            10;
          ctx.fillRect(width - padding.right, this.mouseY - 12, boxWidth, 24);

          ctx.fillStyle = tc;
          ctx.textAlign = "left";
          ctx.font = "bold 9px Arial";
          ctx.fillText(rt1, width - padding.right + 5, this.mouseY - 1);
          ctx.font = "8px Arial";
          ctx.fillText(rt2, width - padding.right + 5, this.mouseY + 9);
        } else if (type === "macd") {
          let mMin = Infinity,
            mMax = -Infinity;
          renderData.forEach((d) => {
            if (d.macd) {
              mMin = Math.min(
                mMin,
                d.macd.histogram,
                d.macd.macd,
                d.macd.signal,
              );
              mMax = Math.max(
                mMax,
                d.macd.histogram,
                d.macd.macd,
                d.macd.signal,
              );
            }
          });
          if (mMin === Infinity) {
            mMin = -1;
            mMax = 1;
          }
          const range = mMax - mMin || 1;
          mMin -= range * 0.1;
          mMax += range * 0.1;

          const valAtMouseY = mMax - ((this.mouseY - top) / ch) * (mMax - mMin);

          const lt = `${valAtMouseY.toFixed(2)}`,
            lw = ctx.measureText(lt).width + 10;
          ctx.fillStyle = bc;
          ctx.fillRect(padding.left - lw, this.mouseY - 10, lw, 20);
          ctx.fillStyle = tc;
          ctx.textAlign = "right";
          ctx.fillText(lt, padding.left - 5, this.mouseY + 4);

          // For MACD, percentage change isn't very meaningful relative to a base value like Price or Volume start.
          // Just showing value is enough. Or maybe difference from 0?
          // Let's just show value on right too for consistency.

          ctx.fillStyle = bc;
          const boxWidth = ctx.measureText(lt).width + 10;
          ctx.fillRect(width - padding.right, this.mouseY - 12, boxWidth, 24);
          ctx.fillStyle = tc;
          ctx.textAlign = "left";
          ctx.font = "bold 9px Arial";
          ctx.fillText(lt, width - padding.right + 5, this.mouseY + 4);
        }
      }
    });
  }

  private formatTime(d: Date): string {
    const year = d.getFullYear().toString().slice(-2),
      month = d.getMonth() + 1,
      date = d.getDate(),
      h = d.getHours(),
      m = d.getMinutes().toString().padStart(2, "0");
    return `${year}-${month}/${date} ${h}:${m}`;
  }

  private getStandardDeviation(
    index: number,
    period: number,
    mean: number,
    dataType: "price" | "volume" | "obv" | "vosc" | "rsi" | "macd" = "price",
    voscParams?: { sp: number; lp: number },
  ): number | null {
    if (index < period - 1) return null;
    let sumSqDiff = 0;

    for (let i = 0; i < period; i++) {
      let value: number;

      if (dataType === "price") {
        value = this.data[index - i].close;
      } else if (dataType === "volume") {
        value = this.data[index - i].volume;
      } else if (dataType === "obv") {
        const obvValue = this.data[index - i]?.obv?.value;
        if (obvValue === undefined || obvValue === null) continue;
        value = obvValue;
      } else if (dataType === "rsi") {
        const rsiValue = this.data[index - i]?.rsi?.value;
        if (rsiValue === undefined || rsiValue === null) continue;
        value = rsiValue;
      } else if (dataType === "macd") {
        // Use MACD Line or Histogram? Usually Bollinger Bands on MACD are on the MACD line.
        const macdValue = this.data[index - i]?.macd?.macd;
        if (macdValue === undefined || macdValue === null) continue;
        value = macdValue;
      } else if (dataType === "vosc" && voscParams) {
        const voscVal = this.calculateVOSCValue(
          index - i,
          voscParams.sp,
          voscParams.lp,
        );
        if (voscVal === null) continue;
        value = voscVal;
      } else {
        continue;
      }

      const diff = value - mean;
      sumSqDiff += diff * diff;
    }
    return Math.sqrt(sumSqDiff / period);
  }

  private calculateBollingerBands(
    renderData: ChartDataPoint[],
    dataType: "price" | "volume" | "obv" | "vosc" | "rsi" | "macd" = "price",
    bbConfig: boolean | BollingerBandsConfig = true,
    voscParams?: { sp: number; lp: number },
  ): { upper: (number | null)[]; lower: (number | null)[] } {
    const { maPeriods, config } = this;

    // 설정에서 기간과 표준편차 배수 가져오기
    const configObj = typeof bbConfig === "object" ? bbConfig : {};
    const period = configObj.period ?? 20;
    const k = configObj.stdDev ?? 2;

    const startIdx = Math.floor(this.visibleStartIndex);
    const upper: (number | null)[] = [];
    const lower: (number | null)[] = [];

    renderData.forEach((d, i) => {
      const dataIndex = startIdx + i;
      let middle: number | undefined;

      // 데이터 타입에 따른 중간값 계산
      if (dataType === "price") {
        const maData = d.ma.get(period);
        middle = maData?.close;
        if (middle === undefined && dataIndex >= period - 1) {
          let sum = 0;
          for (let j = 0; j < period; j++)
            sum += this.data[dataIndex - j].close;
          middle = sum / period;
        }
      } else if (dataType === "volume") {
        const maData = d.ma.get(period);
        middle = maData?.volume;
        if (middle === undefined && dataIndex >= period - 1) {
          let sum = 0;
          for (let j = 0; j < period; j++)
            sum += this.data[dataIndex - j].volume;
          middle = sum / period;
        }
      } else if (dataType === "obv") {
        // OBV 이동평균 계산
        if (dataIndex >= period - 1) {
          let sum = 0;
          let count = 0;
          for (let j = 0; j < period; j++) {
            const obvValue = this.data[dataIndex - j]?.obv?.value;
            if (obvValue !== undefined && obvValue !== null) {
              sum += obvValue;
              count++;
            }
          }
          if (count === period) {
            middle = sum / period;
          }
        }
      } else if (dataType === "rsi") {
        // RSI 이동평균 계산
        if (dataIndex >= period - 1) {
          let sum = 0;
          let count = 0;
          for (let j = 0; j < period; j++) {
            const rsiValue = this.data[dataIndex - j]?.rsi?.value;
            if (rsiValue !== undefined && rsiValue !== null) {
              sum += rsiValue;
              count++;
            }
          }
          if (count === period) {
            middle = sum / period;
          }
        }
      } else if (dataType === "macd") {
        // MACD Bollinger Bands (on MACD Line)
        if (dataIndex >= period - 1) {
          let sum = 0;
          let count = 0;
          for (let j = 0; j < period; j++) {
            const macdValue = this.data[dataIndex - j]?.macd?.macd;
            if (macdValue !== undefined && macdValue !== null) {
              sum += macdValue;
              count++;
            }
          }
          if (count === period) {
            middle = sum / period;
          }
        }
      } else if (dataType === "vosc" && voscParams) {
        // VOSC 이동평균 계산
        if (dataIndex >= period - 1) {
          let sum = 0;
          let count = 0;
          for (let j = 0; j < period; j++) {
            const voscVal = this.calculateVOSCValue(
              dataIndex - j,
              voscParams.sp,
              voscParams.lp,
            );
            if (voscVal !== null) {
              sum += voscVal;
              count++;
            }
          }
          if (count === period) {
            middle = sum / period;
          }
        }
      }

      if (middle !== undefined && middle !== null) {
        const sd = this.getStandardDeviation(
          dataIndex,
          period,
          middle,
          dataType,
          voscParams,
        );
        if (sd !== null) {
          upper.push(middle + k * sd);
          lower.push(middle - k * sd);
        } else {
          upper.push(null);
          lower.push(null);
        }
      } else {
        upper.push(null);
        lower.push(null);
      }
    });
    return { upper, lower };
  }

  private drawBollingerBands(
    xScale: (i: number) => number,
    yScale: (v: number) => number,
    bbData: { upper: (number | null)[]; lower: (number | null)[] },
  ) {
    const { ctx } = this;
    const { upper, lower } = bbData;
    const upperPoints: { x: number; y: number }[] = [];
    const lowerPoints: { x: number; y: number }[] = [];

    upper.forEach((u, i) => {
      const l = lower[i];
      if (u !== null && l !== null) {
        const x = xScale(i);
        upperPoints.push({ x, y: yScale(u) });
        lowerPoints.push({ x, y: yScale(l) });
      }
    });

    if (upperPoints.length === 0) return;

    ctx.save();
    ctx.fillStyle = "rgba(156, 39, 176, 0.1)";
    ctx.beginPath();
    if (upperPoints.length > 0) {
      ctx.moveTo(upperPoints[0].x, upperPoints[0].y);
      for (let i = 1; i < upperPoints.length; i++)
        ctx.lineTo(upperPoints[i].x, upperPoints[i].y);
      for (let i = lowerPoints.length - 1; i >= 0; i--)
        ctx.lineTo(lowerPoints[i].x, lowerPoints[i].y);
      ctx.closePath();
      ctx.fill();
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(156, 39, 176, 0.5)";
    ctx.beginPath();
    upperPoints.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    ctx.beginPath();
    lowerPoints.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    ctx.restore();
  }
}
