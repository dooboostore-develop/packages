type ChartData = {
  x: number;
  yOpen?: number | null;
  yHigh?: number | null;
  yLow?: number | null;
  y: number;
};

// 라인 타입 정의
export type LineType = 'line' | 'line-smooth' | 'line-smooth-open' | 'line-smooth-high' | 'line-smooth-low' | 'line-smooth-middle' | 'step-to' | 'step-from' | 'step-center';

// 차트 키별 데이터 타입
export type ChartKeyData = {
  datas: ChartData[];
  events?: EventMarker[];
  lineMode?: LineType;
  movingAverageXwidth?: number[]; // 차트 키별 이동평균선 xWidth 배열 (예: [432000000 (5일), 864000000 (10일)])
};

// 티커 데이터 타입 (단일 또는 다중 차트 키 지원)
export type TickerData = {
  color?: string;
  lineMode?: LineType;
  data: ChartKeyData | {
    [key: string]: ChartKeyData;
  };
};

// 공통 이벤트 속성
export interface EventBase {
  label: string;
  color?: string;
}

// X축 포인트 이벤트 (세로 라인)
export interface XPointEvent {
  x: number; // X축 값 (Unix timestamp in seconds)
}

// Y축 포인트 이벤트 (가로 라인)
interface YPointEvent {
  y: number; // Y축 값
}

// XY 포인트 이벤트 (화살표 마커)
interface XYPointEvent {
  x: number; // X축 값 (Unix timestamp in seconds)
  y: number; // Y축 값
  type?: 'tag' | 'arrow' | 'dot'; // 마커 타입 (기본값: 'tag')
}

// X축 범위 이벤트 (시간 범위 영역)
interface XRangeEvent {
  startX: number; // 시작 X축 값 (Unix timestamp in seconds)
  endX: number; // 종료 X축 값 (Unix timestamp in seconds)
}

// Y축 범위 이벤트 (가격 범위 영역)
interface YRangeEvent {
  startY: number; // 시작 Y축 값
  endY: number; // 종료 Y축 값
}

// XY 범위 이벤트 (시간 + 가격 범위 영역)
interface XYRangeEvent {
  startX: number; // 시작 X축 값 (Unix timestamp in seconds)
  startY: number; // 시작 Y축 값
  endX: number; // 종료 X축 값 (Unix timestamp in seconds)
  endY: number; // 종료 Y축 값
}

// 포인트 타입 (화살표 방향 등)
type PointType = 'dot' | 'leftArrow' | 'rightArrow' | 'leftArrowDot' | 'rightArrowDot' | 'leftArrowLine' | 'rightArrowLine';

// 다중 포인트 이벤트 (여러 점을 연결하여 도형 그리기)
interface PointEvent {
  points: {
    x: number; // X축 값 (Unix timestamp in milliseconds)
    y: number; // Y축 값
    xPointType?: PointType; // X축 포인트 타입
    yPointType?: PointType; // Y축 포인트 타입
  }[];
  fillStyle?: string; // 채우기 색상 (있으면 closePath + fill 처리)
  strokeStyle?: string; // 선 색상
  smooth?: boolean; // 부드러운 곡선 여부
}

type EventMarker = 
  | (XPointEvent & EventBase)
  | (YPointEvent & EventBase)
  | (XYPointEvent & EventBase)
  | (XRangeEvent & EventBase)
  | (YRangeEvent & EventBase)
  | (XYRangeEvent & EventBase)
  | (PointEvent & EventBase);

// 타입 가드 함수
export const isChartKeyData = (data: ChartKeyData | { [key: string]: ChartKeyData }): data is ChartKeyData => 'datas' in data && Array.isArray(data.datas);

export const isXPointEvent = (event: EventMarker): event is XPointEvent & EventBase => 'x' in event && !('y' in event) && !('startX' in event) && !('startY' in event);

export const isYPointEvent = (event: EventMarker): event is YPointEvent & EventBase => 'y' in event && !('x' in event) && !('startX' in event) && !('startY' in event);

export const isXYPointEvent = (event: EventMarker): event is XYPointEvent & EventBase => 'x' in event && 'y' in event && !('startX' in event) && !('startY' in event) && !('points' in event);

export const isXRangeEvent = (event: EventMarker): event is XRangeEvent & EventBase => 'startX' in event && 'endX' in event && !('startY' in event) && !('endY' in event) && !('points' in event);

export const isYRangeEvent = (event: EventMarker): event is YRangeEvent & EventBase => 'startY' in event && 'endY' in event && !('startX' in event) && !('endX' in event) && !('points' in event);

export const isXYRangeEvent = (event: EventMarker): event is XYRangeEvent & EventBase => 'startX' in event && 'endX' in event && 'startY' in event && 'endY' in event && !('points' in event);

export const isRangeEvent = (event: EventMarker): event is (XRangeEvent | YRangeEvent | XYRangeEvent) & EventBase => isXRangeEvent(event) || isYRangeEvent(event) || isXYRangeEvent(event);

export const isMultiPointEvent = (event: EventMarker): event is PointEvent & EventBase => 'points' in event && Array.isArray((event as any).points);

export const isPointEvent = (event: EventMarker): event is (XPointEvent | YPointEvent | XYPointEvent) & EventBase => !isRangeEvent(event) && !isMultiPointEvent(event);

// 그리기 영역 정의
interface DrawArea {
  x: number;      // 시작 X 좌표
  y: number;      // 시작 Y 좌표
  width: number;  // 너비
  height: number; // 높이
}

// 공통 이벤트 타입 정의
type CommonEvents = {
  x?: (XPointEvent & EventBase)[]; // 모든 차트의 X축에 표시될 공통 세로선 이벤트
  chart?: { [key: string]: EventMarker[] } | EventMarker[]; // 차트별 이벤트 (배열이면 첫 번째 차트에 적용)
};

interface ChartOptions {
  showEvents?: boolean;
  showCandles?: boolean;
  fillGaps?: boolean;
  lineMode?: LineType;
  showAverage?: ShowAverageType;
  hideValues?: boolean;
  hideLines?: boolean;
  showGrid?: boolean;
  displayMinTime?: number;
  displayMaxTime?: number;
}

interface FormatResult {
  value: string;
  font?: string;
  fillStyle?: string;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
}

type FormatReturn = string | FormatResult;

interface ChartConfig {
  xFormat?: (xValue: number, index: number, total: number, chartKey?: string) => FormatReturn; // X축 레이블 포맷
  yFormat?: (yValue: number, index: number, total: number, chartKey?: string) => FormatReturn; // Y축 레이블 포맷
  labelFormat?: (chartKey: string) => FormatReturn; // 차트 키별 Y축 타이틀 포맷
  crosshairXFormat?: (xValue: number) => FormatReturn; // 크로스헤어 X축 값 포맷
  crosshairYFormat?: (yValue: number, chartKey: string, isNormalized: boolean) => FormatReturn; // 크로스헤어 Y축 값 포맷
  tooltipLabelFormat?: (symbol: string, chartKey: string, value: number, time: number) => FormatReturn; // 툴팁 메인 텍스트 포맷 (전체)
  tooltipXFormat?: (xValue: number, symbol: string, chartKey: string) => FormatReturn; // 툴팁 서브 텍스트 포맷
  tooltipYFormat?: (yValue: number, chartKey: string, symbol: string) => FormatReturn; // 툴팁 Y축 값 포맷 (tooltipLabelFormat 없을 때)
  zoomRangeFormat?: (minTime: number, maxTime: number) => FormatReturn; // 줌 버튼 위 날짜 범위 포맷
  eventLabelFormat?: (event: EventMarker) => FormatReturn; // 이벤트 레이블 포맷 (X-only, Y-only 세로/가로 라인)
  eventTooltipLabelFormat?: (event: EventMarker) => FormatReturn; // 이벤트 툴팁 레이블 포맷 (XY 포인트 마커 툴팁)
  eventMarkerTextFormat?: (event: EventMarker) => FormatReturn; // 이벤트 마커 내부 텍스트 포맷 (XY 포인트 마커 안의 글자)
  
  // 테마 설정
  theme?: 'light' | 'dark' | 'auto'; // 테마 모드 ('auto'는 브라우저 설정 따름, 기본값: 'auto')
  
  // 스타일 설정
  lineStrokeStyle?: string | ((symbol: string, chartKey: string) => string); // 라인 그래프 색상
  lineWidth?: number | ((symbol: string, chartKey: string) => number); // 라인 두께
  averageStrokeStyle?: string; // 평균선 색상
  averageLineWidth?: number; // 평균선 두께
  averageLineDash?: number[]; // 평균선 대시 패턴
  crosshairStrokeStyle?: string; // 크로스헤어 색상
  crosshairLineWidth?: number; // 크로스헤어 두께
  crosshairLineDash?: number[]; // 크로스헤어 대시 패턴
  candleUpColor?: string | ((symbol: string, chartKey: string) => string); // 상승 캔들 색상
  candleDownColor?: string | ((symbol: string, chartKey: string) => string); // 하락 캔들 색상
  candleBorderColor?: string | ((symbol: string, chartKey: string) => string); // 캔들 테두리 색상
  gridStrokeStyle?: string; // 그리드 색상
  gridLineWidth?: number; // 그리드 두께
  eventXStrokeStyle?: string | ((event: EventMarker) => string); // X-only 이벤트 세로 라인 색상
  eventXLineWidth?: number | ((event: EventMarker) => number); // X-only 이벤트 세로 라인 두께
  eventXLineDash?: number[] | ((event: EventMarker) => number[]); // X-only 이벤트 세로 라인 대시 패턴
  eventYStrokeStyle?: string | ((event: EventMarker) => string); // Y-only 이벤트 가로 라인 색상
  eventYLineWidth?: number | ((event: EventMarker) => number); // Y-only 이벤트 가로 라인 두께
  eventYLineDash?: number[] | ((event: EventMarker) => number[]); // Y-only 이벤트 가로 라인 대시 패턴
  eventArrowFillStyle?: string | ((event: EventMarker, isHovered: boolean) => string); // XY 포인트 마커 화살표 채우기 색상
  eventArrowStrokeStyle?: string | ((event: EventMarker) => string); // XY 포인트 마커 화살표 테두리 색상
  eventArrowLineWidth?: number | ((event: EventMarker) => number); // XY 포인트 마커 화살표 테두리 두께
  eventArrowSize?: number | ((event: EventMarker) => number); // XY 포인트 마커 화살표 크기
  
  // 범위 이벤트 스타일
  eventRangeFillStyle?: string | ((event: EventMarker, isHovered: boolean) => string); // 범위 이벤트 영역 채우기 색상
  eventRangeStrokeStyle?: string | ((event: EventMarker) => string); // 범위 이벤트 영역 테두리 색상
  eventRangeLineWidth?: number | ((event: EventMarker) => number); // 범위 이벤트 영역 테두리 두께
  eventRangeLabelFont?: string | ((event: EventMarker) => string); // 범위 이벤트 라벨 폰트
  eventRangeLabelFillStyle?: string | ((event: EventMarker) => string); // 범위 이벤트 라벨 색상
  eventRangeLabelBackgroundStyle?: string | ((event: EventMarker) => string); // 범위 이벤트 라벨 배경 색상
  
  // 배경 색상 설정
  backgroundColor?: string; // 전체 배경 색상 (기본값: 테마에 따라 자동 설정)
  
  // 레이아웃 설정
  paddingLeft?: number; // 왼쪽 여백 (Y축 레이블 영역)
  paddingRight?: number; // 오른쪽 여백
  paddingTop?: number; // 위쪽 여백
  paddingBottom?: number; // 아래쪽 여백 (X축 레이블 영역)
  
  // 레이블 개수 설정
  xLabelCount?: number; // X축 최대 레이블 개수 (기본값: 12)
  yLabelCount?: number; // Y축 레이블 개수 (기본값: 6)
  
  // UI 표시 설정
  showZoomButtons?: boolean; // 줌 버튼 표시 여부 (기본값: false)
  hideLegend?: boolean; // 범례 숨기기 여부 (기본값: false, 즉 기본적으로 표시)
  hideXAxisLabels?: boolean; // X축 레이블 숨기기 여부 (기본값: false, 즉 기본적으로 표시)
  hideYAxisLabels?: boolean; // Y축 레이블 숨기기 여부 (기본값: false, 즉 기본적으로 표시)
  
  // 축 범위 설정
  xMin?: number | ((chartKey: string) => undefined | number); // X축 최소값 (timestamp)
  xMax?: number | ((chartKey: string) => undefined | number); // X축 최대값 (timestamp)
  yMin?: number | ((chartKey: string) => undefined | number); // Y축 최소값
  yMax?: number | ((chartKey: string) => undefined | number); // Y축 최대값
  
  // 콜백
  onLegendClick?: (symbol: string, isVisible: boolean) => void; // 범례 클릭 콜백
  onZoomButtonClick?: (type: 'zoomIn' | 'zoomOut' | 'reset', zoomStart: number, zoomEnd: number) => void; // 줌 버튼 클릭 콜백
  onPointTooltip?: (point: { symbol: string; chartType: string; value: number; time: number; x: number; y: number } | null) => void; // 포인트 툴팁 열림/닫힘 콜백
}
// 평균선 타입 정의
type ShowAverageBase = {
  label: string;
  color?: string;
  visible?: boolean; // 활성/비활성 상태 (기본값: true)
  opacity?: number; // 투명도 (0.0 ~ 1.0, 기본값: 1.0)
};

export type ShowAverageItem = 
  | ({ type: 'average' } & ShowAverageBase) // 전체 평균선
  | ({ type: 'moving'; xWidth: number } & ShowAverageBase); // 이동평균선 (xWidth: 데이터 포인트 개수)

export type ShowAverageType = ShowAverageItem[]; // 여러 평균선을 배열로 지원

// 정규화 타입 정의
export type NormalizeType = 'none' | 'rangeNormalize' | 'normalize';

interface RenderState {
  enabledTickers: Set<string>;
  visibleTickers: Set<string>;
  showEvents: boolean;
  showCandles: boolean;
  showGaps: boolean;
  visibleChartKeys: string[]; // 표시할 차트 키 목록 (순서대로)
  lineMode: LineType; // 전체 기본 라인 모드
  showAverage: ShowAverageType;
  hideValues: boolean;
  hideLines: boolean;
  showGrid: boolean;
  showPoints: boolean;
  normalize: NormalizeType; // 'none': 정규화 안함, 'rangeNormalize': 현재 범위 정규화, 'normalize': 전체 데이터 정규화
  rangeMin?: number; // timestamp 또는 퍼센트 (0-100), undefined면 전체 범위
  rangeMax?: number; // timestamp 또는 퍼센트 (0-100), undefined면 전체 범위
}

// OverlayStockChart 옵션 인터페이스
interface OverlayStockChartOptions {
  commonEvents?: CommonEvents; // 공통 이벤트
  initialState?: Partial<RenderState>; // 초기 상태 (부분 설정 가능)
  config?: ChartConfig; // 차트 설정
}

// 공통 이벤트 타입 export
export type { CommonEvents };

export class OverlayStockChart {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private width: number;
  private height: number;
  private padding = 50; // 기본값, config로 오버라이드 가능
  private paddingLeft = 50;
  private paddingRight = 50;
  private paddingTop = 50;
  private paddingBottom = 50;
  private chartAreaWidth = 0; // 실제 차트 그리는 영역의 고정 너비
  private chartAreaLeft = 50; // 차트 영역 시작 X 좌표
  
  // 라이트 모드 색상 팔레트
  private lightColors = [
    '#0000FF', // Blue
    '#FF0000', // Red
    '#00AA00', // Green
    '#FF00FF', // Magenta
    '#FF8C00', // Dark Orange
    '#8B00FF', // Violet
    '#00CED1', // Dark Turquoise
    '#FF1493', // Deep Pink
    '#32CD32', // Lime Green
    '#FFD700', // Gold
    '#4169E1', // Royal Blue
    '#DC143C', // Crimson
    '#00FA9A', // Medium Spring Green
    '#FF69B4', // Hot Pink
    '#1E90FF', // Dodger Blue
    '#FF4500', // Orange Red
    '#9370DB', // Medium Purple
    '#00BFFF', // Deep Sky Blue
    '#FF6347', // Tomato
    '#48D1CC'  // Medium Turquoise
  ];
  
  // 다크 모드 색상 팔레트 (더 밝고 선명한 색상)
  private darkColors = [
    '#5C9EFF', // Bright Blue
    '#FF5C5C', // Bright Red
    '#5CFF5C', // Bright Green
    '#FF5CFF', // Bright Magenta
    '#FFB85C', // Bright Orange
    '#B85CFF', // Bright Violet
    '#5CFFFF', // Bright Cyan
    '#FF5CB8', // Bright Pink
    '#B8FF5C', // Bright Lime
    '#FFE55C', // Bright Yellow
    '#5CB8FF', // Sky Blue
    '#FF5C85', // Bright Crimson
    '#5CFFB8', // Bright Spring Green
    '#FFB8FF', // Light Pink
    '#5CE5FF', // Light Blue
    '#FF855C', // Bright Coral
    '#B8B8FF', // Light Purple
    '#5CDBFF', // Bright Sky Blue
    '#FF9C5C', // Light Tomato
    '#85FFFF'  // Bright Turquoise
  ];
  
  private colors = this.lightColors; // 기본값
  
  private chartMarginTop = 0.05;
  private chartMarginBottom = 0.05;
  private dataMap: Map<string, { 
    color?: string;
    lineMode?: LineType;
    data: { 
      [key: string]: ChartKeyData;
    }
  }>;
  private originalDataMap: Map<string, { 
    color?: string;
    lineMode?: LineType;
    data: { 
      [key: string]: ChartKeyData;
    }
  }>; // 확대/축소와 무관한 원본 데이터
  
  // 전체 데이터의 min/max 캐시 (chartKey별, symbol별)
  private globalMinMaxCache: Map<string, Map<string, { min: number; max: number }>> = new Map();
  private commonEvents: CommonEvents;
  private tickerColors: Map<string, string> = new Map();
  private config: ChartConfig;
  
  // 내부 상태
  private state: RenderState;
  private mouseX: number | null = null;
  private mouseY: number | null = null;
  private canvasWidth = 0;
  private canvasHeight = 0;
  private legendItems: { symbol: string; x: number; y: number; width: number; height: number }[] = [];
  private dataPoints: { symbol: string; x: number; y: number; value: number; time: number; chartType: string }[] = [];
  private hoveredPoint: { symbol: string; x: number; y: number; value: number; time: number; chartType: string } | null = null;
  private zoomStart = 0;
  private zoomEnd = 100;
  private isDragging = false;
  private dragStartX: number | null = null;
  private dragCurrentX: number | null = null;
  private isPanning = false;
  private panStartX: number | null = null;
  private zoomButtons: { type: string; x: number; y: number; width: number; height: number }[] = [];
  private sortedTimes: number[] = [];
  private eventMarkers: { event: EventMarker; x: number; y: number; radius: number }[] = [];
  private hoveredEventMarker: EventMarker | null = null;
  private eventTooltipsToRender: Array<{ event: EventMarker; x: number; y: number; pointsDown: boolean }> = [];
  
  // 터치 관련
  private touchStartX: number | null = null;
  private touchStartY: number | null = null;
  private lastPinchDistance: number | null = null;
  private isTouchDragging = false;
  private isTouchPanning = false;
  private resizeObserver: ResizeObserver | null = null;
  
  // 더블탭 감지
  private lastTapTime = 0;
  private lastTapX = 0;
  private lastTapY = 0;
  
  // 평균선 캐시 (성능 최적화)
  private averageLineCache: Map<string, { time: number; avgValue: number }[]> = new Map();
  private averageLineCacheKey: string = '';
  
  // 더블클릭 감지 (PC)
  private clickTimer: number | null = null;
  private clickDelay = 250; // 250ms 내에 더블클릭 감지

  constructor(
    canvas: HTMLCanvasElement,
    dataMap: Map<string, TickerData>,
    options: OverlayStockChartOptions = {}
  ) {
    const {
      commonEvents = {},
      initialState = {},
      config = {}
    } = options;
    
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.width = 0;
    this.height = 0;
    this.dataMap = this.normalizeDataMap(dataMap);
    this.originalDataMap = this.dataMap; // 원본 데이터 저장
    this.commonEvents = this.normalizeCommonEvents(commonEvents);
    
    // initialState 기본값 설정
    const defaultState: RenderState = {
      enabledTickers: new Set<string>(),
      visibleTickers: new Set<string>(),
      showEvents: false,
      showCandles: false,
      showGaps: true,
      visibleChartKeys: [],
      lineMode: 'line',
      showAverage: [],
      hideValues: false,
      hideLines: false,
      showGrid: false,
      showPoints: false,
      normalize: 'none',
      rangeMin: undefined, // undefined면 전체 범위 사용
      rangeMax: undefined  // undefined면 전체 범위 사용
    };
    
    this.state = { ...defaultState, ...initialState };
    
    // 테마 감지 및 기본 색상 설정
    const isDarkMode = this.detectDarkMode(config.theme);
    
    // 테마에 따라 색상 팔레트 선택
    this.colors = isDarkMode ? this.darkColors : this.lightColors;
    
    // config 기본값 설정 (테마에 따라)
    // 사용자 config를 먼저 적용하고, 없는 값만 기본값으로 채움
    this.config = {
      ...config,
      theme: config.theme ?? 'auto',
      backgroundColor: config.backgroundColor ?? (isDarkMode ? '#1E1E1E' : '#FFFFFF'),
      gridStrokeStyle: config.gridStrokeStyle ?? (isDarkMode ? '#444444' : '#CCCCCC'),
      crosshairStrokeStyle: config.crosshairStrokeStyle ?? (isDarkMode ? '#888888' : '#666666')
    };
    
    // config 설정 후 전체 min/max 계산 (config.xMin/xMax를 참조하므로)
    this.calculateGlobalMinMax();
    
    // padding 설정 - hide 옵션이 true면 명시적 padding 값도 무시하고 10으로 설정
    this.paddingLeft = this.config.hideYAxisLabels ? 10 : (this.config.paddingLeft ?? 50);
    this.paddingRight = this.config.hideYAxisLabels ? 10 : (this.config.paddingRight ?? 50);
    this.paddingTop = this.config.hideLegend ? 10 : (this.config.paddingTop ?? 50);
    this.paddingBottom = this.config.hideXAxisLabels ? 10 : (this.config.paddingBottom ?? 50);
    this.padding = 50; // 기본 padding (차트 영역 계산용)
    
    // 차트 영역은 paddingLeft 기준으로 설정
    this.chartAreaLeft = this.paddingLeft;
    this.chartAreaWidth = 0; // render에서 계산됨
    
    // visibleChartKeys가 비어있으면 첫 번째 티커의 첫 번째 키를 기본값으로
    if (!this.state.visibleChartKeys || this.state.visibleChartKeys.length === 0) {
      const firstTicker = Array.from(dataMap.values())[0];
      if (firstTicker && firstTicker.data) {
        const firstKey = Object.keys(firstTicker.data)[0];
        if (firstKey) {
          this.state.visibleChartKeys = [firstKey];
        }
      }
    }
    
    // 티커별 색상 초기화
    let colorIndex = 0;
    dataMap.forEach((value, symbol) => {
      const color = value.color || this.colors[colorIndex % this.colors.length];
      this.tickerColors.set(symbol, color);
      colorIndex++;
    });
    
    this.setupEventListeners();
    this.setupResizeObserver();
  }

  // main.ts에서 받은 데이터를 내부 형식으로 변환
  private normalizeDataMap(
    inputMap: Map<string, TickerData>
  ): Map<string, { 
    color?: string;
    lineMode?: LineType;
    data: { 
      [key: string]: ChartKeyData;
    }
  }> {
    const normalizedMap = new Map<string, { 
      color?: string;
      lineMode?: LineType;
      data: { 
        [key: string]: ChartKeyData;
      }
    }>();
    
    inputMap.forEach((value, symbol) => {
      // 타입 가드를 사용하여 단일 객체인지 chartKey별 객체인지 확인
      const data = value.data;
      
      if (isChartKeyData(data)) {
        // 단일 객체 형식: ChartKeyData -> { 'default': {...} }로 변환
        normalizedMap.set(symbol, {
          color: value.color,
          lineMode: value.lineMode,
          data: { 
            'default': {
              datas: data.datas,
              events: data.events,
              lineMode: data.lineMode,
              movingAverageXwidth: data.movingAverageXwidth
            }
          }
        });
      } else {
        // 이미 chartKey별 객체 형식
        normalizedMap.set(symbol, {
          color: value.color,
          lineMode: value.lineMode,
          data: data
        });
      }
    });
    
    return normalizedMap;
  }
  
  // 전체 데이터의 min/max 계산 및 캐싱
  private calculateGlobalMinMax(): void {
    this.globalMinMaxCache.clear();
    
    // config.xMin/xMax가 설정되어 있으면 해당 범위의 데이터만 사용
    let filterMinTime: number | undefined = undefined;
    let filterMaxTime: number | undefined = undefined;
    
    if (this.config.xMin !== undefined) {
      filterMinTime = typeof this.config.xMin === 'function' ? this.config.xMin('default') : this.config.xMin;
    }
    if (this.config.xMax !== undefined) {
      filterMaxTime = typeof this.config.xMax === 'function' ? this.config.xMax('default') : this.config.xMax;
    }
    
    this.originalDataMap.forEach((value, symbol) => {
      Object.keys(value.data).forEach(chartKey => {
        const chartDataObj = value.data[chartKey];
        if (!chartDataObj) return;
        
        // config.yMin/yMax 가져오기 (chartKey별로 다를 수 있음)
        let filterMinY: number | undefined = undefined;
        let filterMaxY: number | undefined = undefined;
        
        if (this.config.yMin !== undefined) {
          filterMinY = typeof this.config.yMin === 'function' ? this.config.yMin(chartKey) : this.config.yMin;
        }
        if (this.config.yMax !== undefined) {
          filterMaxY = typeof this.config.yMax === 'function' ? this.config.yMax(chartKey) : this.config.yMax;
        }
        
        // xMin/xMax 범위로 필터링
        let filteredDatas = chartDataObj.datas;
        if (filterMinTime !== undefined || filterMaxTime !== undefined) {
          filteredDatas = chartDataObj.datas.filter(d => {
            if (filterMinTime !== undefined && d.x < filterMinTime) return false;
            if (filterMaxTime !== undefined && d.x > filterMaxTime) return false;
            return true;
          });
        }
        
        // yMin/yMax 범위로 필터링 (값이 있는 경우만)
        if (filterMinY !== undefined || filterMaxY !== undefined) {
          filteredDatas = filteredDatas.filter(d => {
            if (d.y === null || d.y === undefined) return false;
            if (filterMinY !== undefined && d.y < filterMinY) return false;
            if (filterMaxY !== undefined && d.y > filterMaxY) return false;
            return true;
          });
        }
        
        const allValues = filteredDatas
          .filter(d => d.y !== null && d.y !== undefined)
          .map(d => d.y);
        
        if (allValues.length > 0) {
          // yMin/yMax가 설정되어 있으면 그 값을 min/max로 사용
          let min = Math.min(...allValues);
          let max = Math.max(...allValues);
          
          if (filterMinY !== undefined) {
            min = Math.max(min, filterMinY); // 실제 데이터 min과 설정된 yMin 중 큰 값
          }
          if (filterMaxY !== undefined) {
            max = Math.min(max, filterMaxY); // 실제 데이터 max와 설정된 yMax 중 작은 값
          }
          
          if (!this.globalMinMaxCache.has(chartKey)) {
            this.globalMinMaxCache.set(chartKey, new Map());
          }
          
          this.globalMinMaxCache.get(chartKey)!.set(symbol, { min, max });
        }
      });
    });
  }

  // commonEvents를 내부 형식으로 변환
  private normalizeCommonEvents(
    input: CommonEvents
  ): CommonEvents {
    // 이미 올바른 형식이면 그대로 반환
    return input;
  }

  // 다크모드 감지
  private detectDarkMode(theme?: 'light' | 'dark' | 'auto'): boolean {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    
    // 'auto' 또는 undefined: 브라우저 설정 확인
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    return false; // 기본값: 라이트 모드
  }

  // 테마에 따른 텍스트/축 색상 가져오기
  private getTextColor(): string {
    const isDarkMode = this.detectDarkMode(this.config.theme);
    return isDarkMode ? '#E0E0E0' : '#000000';
  }

  // 테마에 따른 축 색상 가져오기
  private getAxisColor(): string {
    const isDarkMode = this.detectDarkMode(this.config.theme);
    return isDarkMode ? '#666666' : '#000000';
  }

  // 테마에 따른 이벤트 기본 색상 가져오기
  private getDefaultEventColor(transparent: boolean = false): string {
    const isDarkMode = this.detectDarkMode(this.config.theme);
    if (transparent) {
      return isDarkMode ? 'rgba(255, 180, 92, 0.3)' : 'rgba(255, 102, 0, 0.2)';
    }
    return isDarkMode ? '#FFB85C' : '#FF6600';
  }

  destroy() {
    // 리소스 정리
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    
    // 캔버스 이벤트 리스너 제거
    // 서버사이드 환경에서는 이벤트 리스너가 없으므로 스킵
    if (typeof window !== 'undefined' && this.canvas.removeEventListener) {
      // 모든 이벤트 리스너를 제거하기 위해 canvas를 복제하여 교체
      // (개별 리스너 참조를 저장하지 않았으므로 이 방법이 가장 확실함)
      const newCanvas = this.canvas.cloneNode(true) as HTMLCanvasElement;
      this.canvas.parentNode?.replaceChild(newCanvas, this.canvas);
    }
  }

  private setupResizeObserver() {
    // 서버사이드 환경에서는 ResizeObserver가 없으므로 스킵
    if (typeof ResizeObserver === 'undefined') {
      return;
    }
    
    this.resizeObserver = new ResizeObserver(() => {
      this.render();
    });
    this.resizeObserver.observe(this.canvas);
  }

  setData(dataMap: Map<string, TickerData>, commonEvents: CommonEvents = {}) {
    this.dataMap = this.normalizeDataMap(dataMap);
    this.originalDataMap = this.dataMap; // 원본 데이터 저장
    this.calculateGlobalMinMax(); // 전체 min/max 계산
    this.commonEvents = this.normalizeCommonEvents(commonEvents);
    
    // 평균선 캐시 초기화
    this.averageLineCache.clear();
    
    // 티커별 색상 재초기화
    this.tickerColors.clear();
    let colorIndex = 0;
    dataMap.forEach((value, symbol) => {
      const color = value.color || this.colors[colorIndex % this.colors.length];
      this.tickerColors.set(symbol, color);
      colorIndex++;
    });
  }

  updateState(partialState: Partial<RenderState>) {
    this.state = { ...this.state, ...partialState };
    
    // visibleTickers나 showAverage가 변경되면 캐시 초기화
    if (partialState.visibleTickers || partialState.showAverage) {
      this.averageLineCache.clear();
    }
    this.render();
  }

  updateTickerMovingAverages(widths: number[]) {
    console.log('[updateTickerMovingAverages] called with widths:', widths);
    console.log('[updateTickerMovingAverages] dataMap size:', this.dataMap.size);
    
    // 각 티커의 모든 chartKey에 movingAverageXwidth 업데이트
    this.dataMap.forEach((tickerData, symbol) => {
      console.log(`[updateTickerMovingAverages] Processing symbol: ${symbol}`);
      
      if (isChartKeyData(tickerData.data)) {
        // 단일 차트 키
        tickerData.data.movingAverageXwidth = widths.length > 0 ? widths : undefined;
        console.log(`  Single chart key, set movingAverageXwidth:`, tickerData.data.movingAverageXwidth);
      } else {
        // 다중 차트 키
        Object.keys(tickerData.data).forEach((chartKey) => {
          const chartKeyData = tickerData.data[chartKey];
          chartKeyData.movingAverageXwidth = widths.length > 0 ? widths : undefined;
          console.log(`  Chart key: ${chartKey}, set movingAverageXwidth:`, chartKeyData.movingAverageXwidth);
        });
      }
    });
    
    // 캐시 초기화 및 재렌더링
    this.averageLineCache.clear();
    this.render();
  }

  getState(): RenderState {
    return { ...this.state };
  }

  getSortedTimes(): number[] {
    return this.sortedTimes;
  }

  private getTickerColor(symbol: string): string {
    return this.tickerColors.get(symbol) || this.colors[0];
  }

  private applyFormatResult(result: FormatReturn): string {
    if (typeof result === 'string') {
      return result;
    }
    
    // 스타일 적용
    if (result.font) this.ctx.font = result.font;
    if (result.fillStyle) this.ctx.fillStyle = result.fillStyle;
    if (result.textAlign) this.ctx.textAlign = result.textAlign;
    if (result.textBaseline) this.ctx.textBaseline = result.textBaseline;
    
    return result.value;
  }

  private getChartRight(): number {
    return this.chartAreaLeft + this.chartAreaWidth;
  }



  private getX(time: number, minTime: number, maxTime: number): number {
    const timeRange = maxTime - minTime || 1;
    // 차트 영역 너비는 고정 (기본 padding 기준)
    const chartWidth = this.chartAreaWidth;
    const normalizedTime = (time - minTime) / timeRange;
    // 차트 시작 위치는 paddingLeft 사용
    return this.paddingLeft + normalizedTime * chartWidth;
  }

  private getY(value: number, minVal: number, maxVal: number, topY: number, height: number): number {
    const range = maxVal - minVal || 1;
    const normalizedValue = (value - minVal) / range;
    // 위 11%, 아래 5% 여백
    const totalMargin = this.chartMarginTop + this.chartMarginBottom;
    const scaledValue = this.chartMarginBottom + normalizedValue * (1 - totalMargin);
    return topY + (1 - scaledValue) * height;
  }

  drawChartKey(
    chartKey: string,
    area: DrawArea,
    visibleTickers: Set<string>,
    sortedTimes: number[],
    options: ChartOptions = {}
  ) {
    const {
      showCandles = false,
      fillGaps = false,
      lineMode = 'line',
      showAverage = false,
      hideValues = false,
      hideLines = false,
      showGrid = false,
      displayMinTime,
      displayMaxTime
    } = options;

    if (sortedTimes.length === 0) return;
    
    // area에서 위치와 크기 추출
    const chartTopY = area.y;
    const chartHeight = area.height;
    
    // 데이터 준비 - 항상 originalDataMap 사용 (시간 필터링은 displayMinTime/displayMaxTime으로 처리)
    const dataBySymbol = new Map<string, { time: number; open: number; high: number; low: number; close: number }[]>();
    
    // 차트 키별 movingAverageXwidth 수집 (각 티커의 차트 키마다 다를 수 있음)
    const tickerMovingAverages = new Map<string, number[]>();
    
    this.originalDataMap.forEach((value, symbol) => {
      const points: { time: number; open: number; high: number; low: number; close: number }[] = [];
      const chartDataObj = value.data[chartKey];
      if (!chartDataObj) return;
      
      // 차트 키의 movingAverageXwidth 저장 (ChartKeyData에서 읽기)
      if (chartDataObj.movingAverageXwidth && chartDataObj.movingAverageXwidth.length > 0) {
        tickerMovingAverages.set(symbol, chartDataObj.movingAverageXwidth);
        console.log(`[drawChartKey] ${symbol} - ${chartKey}: movingAverageXwidth =`, chartDataObj.movingAverageXwidth);
      }
      
      const chartData = chartDataObj.datas || [];
      chartData.forEach(d => {
        const time = d.x;
        if (d.y !== null && d.y !== undefined) {
          // yOpen, yHigh, yLow가 모두 유효한 경우에만 OHLC 데이터로 추가
          const hasOHLC = d.yOpen !== null && d.yOpen !== undefined &&
                          d.yHigh !== null && d.yHigh !== undefined &&
                          d.yLow !== null && d.yLow !== undefined;
          
          points.push({
            time,
            open: hasOHLC ? d.yOpen! : d.y,
            high: hasOHLC ? d.yHigh! : d.y,
            low: hasOHLC ? d.yLow! : d.y,
            close: d.y
          });
        }
      });
      dataBySymbol.set(symbol, points);
    });

    // X축 범위 설정
    // displayMinTime/displayMaxTime이 있으면 우선 사용 (zoom 적용된 범위)
    // 없으면 config.xMin/xMax 사용 (초기 범위)
    // 둘 다 없으면 전체 데이터 범위 사용
    let minTime: number;
    let maxTime: number;
    
    if (displayMinTime !== undefined && displayMaxTime !== undefined) {
      // zoom이 적용된 경우 displayMinTime/displayMaxTime 사용
      minTime = displayMinTime;
      maxTime = displayMaxTime;
    } else if (this.config.xMin !== undefined && this.config.xMax !== undefined) {
      // zoom이 없고 config에 설정이 있으면 config 사용
      minTime = typeof this.config.xMin === 'function' ? this.config.xMin(chartKey) : this.config.xMin;
      maxTime = typeof this.config.xMax === 'function' ? this.config.xMax(chartKey) : this.config.xMax;
    } else {
      // 둘 다 없으면 전체 데이터 범위 사용
      minTime = sortedTimes[0];
      maxTime = sortedTimes[sortedTimes.length - 1];
    }
    
    const timeRange = maxTime - minTime || 1;

    const minMaxBySymbol = new Map<string, { min: number; max: number }>();
    
    if (this.state.normalize === 'rangeNormalize') {
      // 범위 정규화: 현재 보이는 시간 범위(displayMinTime~displayMaxTime)의 데이터만 사용
      // 확대하면 Y축이 변함
      dataBySymbol.forEach((points, symbol) => {
        // 현재 보이는 시간 범위의 데이터만 필터링
        const visiblePoints = points.filter(p => 
          p.time >= (displayMinTime ?? minTime) && 
          p.time <= (displayMaxTime ?? maxTime)
        );
        
        const closes = visiblePoints.map(p => p.close);
        if (closes.length > 0) {
          let min = Math.min(...closes);
          let max = Math.max(...closes);
          
          // config에서 yMin/yMax 설정이 있으면 적용
          if (this.config.yMin !== undefined) {
            const configMin = typeof this.config.yMin === 'function' ? this.config.yMin(chartKey) : this.config.yMin;
            if (configMin !== undefined) {
              min = configMin;
            }
          }
          if (this.config.yMax !== undefined) {
            const configMax = typeof this.config.yMax === 'function' ? this.config.yMax(chartKey) : this.config.yMax;
            if (configMax !== undefined) {
              max = configMax;
            }
          }
          
          minMaxBySymbol.set(symbol, { min, max });
        }
      });
    } else if (this.state.normalize === 'normalize') {
      // 전체 데이터 정규화: 캐시된 전체 데이터의 min/max 사용
      // 확대해도 Y축이 고정됨
      const chartMinMaxCache = this.globalMinMaxCache.get(chartKey);
      if (chartMinMaxCache) {
        dataBySymbol.forEach((points, symbol) => {
          const cachedMinMax = chartMinMaxCache.get(symbol);
          if (cachedMinMax) {
            let min = cachedMinMax.min;
            let max = cachedMinMax.max;
            
            // config에서 yMin/yMax 설정이 있으면 적용
            if (this.config.yMin !== undefined) {
              const configMin = typeof this.config.yMin === 'function' ? this.config.yMin(chartKey) : this.config.yMin;
              if (configMin !== undefined) {
                min = configMin;
              }
            }
            if (this.config.yMax !== undefined) {
              const configMax = typeof this.config.yMax === 'function' ? this.config.yMax(chartKey) : this.config.yMax;
              if (configMax !== undefined) {
                max = configMax;
              }
            }
            
            minMaxBySymbol.set(symbol, { min, max });
          }
        });
      }
    } else {
      // 정규화 안함 ('none'): 현재 보이는 시간 범위의 실제 값 범위 사용
      let globalMin = Infinity;
      let globalMax = -Infinity;
      
      dataBySymbol.forEach((points) => {
        // 현재 보이는 시간 범위의 데이터만 필터링
        const visiblePoints = points.filter(p => 
          p.time >= (displayMinTime ?? minTime) && 
          p.time <= (displayMaxTime ?? maxTime)
        );
        
        const closes = visiblePoints.map(p => p.close);
        if (closes.length > 0) {
          globalMin = Math.min(globalMin, ...closes);
          globalMax = Math.max(globalMax, ...closes);
        }
      });
      
      // config에서 yMin/yMax 설정이 있으면 적용
      if (this.config.yMin !== undefined) {
        const configMin = typeof this.config.yMin === 'function' ? this.config.yMin(chartKey) : this.config.yMin;
        if (configMin !== undefined) {
          globalMin = configMin;
        }
      }
      if (this.config.yMax !== undefined) {
        const configMax = typeof this.config.yMax === 'function' ? this.config.yMax(chartKey) : this.config.yMax;
        if (configMax !== undefined) {
          globalMax = configMax;
        }
      }
      
      // 모든 티커에 동일한 min/max 적용
      dataBySymbol.forEach((_, symbol) => {
        minMaxBySymbol.set(symbol, {
          min: globalMin,
          max: globalMax
        });
      });
    }

    const graphTop = chartTopY;
    const graphBottom = chartTopY + chartHeight;
    const graphHeight = chartHeight;

    // 배경
    this.ctx.fillStyle = this.config.backgroundColor || '#FFFFFF';
    this.ctx.fillRect(0, chartTopY, this.width, chartHeight);

    // 그리드
    if (showGrid) {
      this.drawGrid(graphTop, graphHeight);
    }

    // Y축
    this.drawYAxis(graphTop, graphBottom);

    // Y축 레이블
    if (!hideValues && !this.config.hideYAxisLabels) {
      // 전체 min/max 계산 (비정규화 모드용)
      let globalMin = Infinity;
      let globalMax = -Infinity;
      minMaxBySymbol.forEach((minMax) => {
        globalMin = Math.min(globalMin, minMax.min);
        globalMax = Math.max(globalMax, minMax.max);
      });
      this.drawYAxisLabels(graphTop, graphHeight, graphBottom, globalMin, globalMax, chartKey);
    }

    // Y축 타이틀
    if (!this.config.hideYAxisLabels) {
      const labelFormatted = this.config.labelFormat ? this.config.labelFormat(chartKey) : chartKey;
      const yAxisLabel = this.applyFormatResult(labelFormatted);
      this.drawYAxisTitle(yAxisLabel, graphTop, graphBottom);
    }

    // 심볼별 렌더링
    dataBySymbol.forEach((points, symbol) => {
      if (!visibleTickers.has(symbol)) {
        return;
      }

      const color = this.getTickerColor(symbol);
      const minMax = minMaxBySymbol.get(symbol)!;
      const sortedPoints = points.sort((a, b) => a.time - b.time);
      
      // lineMode 우선순위: chartKey > ticker > RenderState
      const tickerData = this.dataMap.get(symbol);
      const chartKeyData = tickerData?.data[chartKey];
      const effectiveLineMode = chartKeyData?.lineMode || tickerData?.lineMode || lineMode;

      // 캔들 (OHLC 값이 모두 있는 포인트만)
      if (showCandles) {
        const candlePoints = sortedPoints.filter(p => {
          // open, high, low, close가 모두 다른 값이어야 함 (OHLC 데이터가 있는 경우)
          // 모두 같은 값이면 OHLC가 없어서 close로 대체된 것
          return !(p.open === p.close && p.high === p.close && p.low === p.close);
        });
        if (candlePoints.length > 0) {
          this.drawCandles(candlePoints, minMax, color, minTime, maxTime, graphTop, graphHeight, symbol, chartKey);
        }
      }

      // 라인
      if (!hideLines) {
        this.drawLine(sortedPoints, minMax, color, minTime, maxTime, timeRange, sortedTimes.length, graphTop, graphHeight, fillGaps, effectiveLineMode, symbol, chartKey);
      }
    });

    // 평균선들 - 전역 showAverage와 티커별 movingAverageXwidth 모두 지원
    // 1. 전역 평균선/이동평균선 그리기 (평균선 체크박스가 켜져있을 때만)
    if (showAverage && showAverage.length > 0 && dataBySymbol.size > 0) {
      // 평균선 체크박스가 켜져있는지 확인
      const hasAverageEnabled = showAverage.some(cfg => cfg.type === 'average' && cfg.visible !== false);
      
      if (hasAverageEnabled) {
        // 평균선이 켜져있으면 전역 평균선과 이동평균선 모두 그림
        showAverage.forEach(avgConfig => {
          // visible이 false면 그리지 않음
          if (avgConfig.visible === false) {
            return;
          }
          this.drawAverageLine(dataBySymbol, minMaxBySymbol, sortedTimes, minTime, maxTime, graphTop, graphHeight, lineMode, avgConfig, chartKey);
        });
      }
    }
    
    // 2. 티커별 movingAverageXwidth 그리기 (각 티커마다 독립적)
    // tickerMovingAverages에 있는 xWidth만 그림
    console.log(`[drawChartKey] tickerMovingAverages size: ${tickerMovingAverages.size}`);
    
    if (tickerMovingAverages.size > 0) {
      // showAverage에서 활성화된 xWidth 목록 추출 (평균선 체크박스가 켜져있을 때만)
      const activeXWidths = new Set<number>();
      
      if (showAverage && showAverage.length > 0) {
        showAverage.forEach(avgConfig => {
          if (avgConfig.type === 'moving' && avgConfig.visible !== false) {
            activeXWidths.add(avgConfig.xWidth);
          }
        });
      }
      
      // tickerMovingAverages의 모든 xWidth를 activeXWidths에 추가
      tickerMovingAverages.forEach((xWidths) => {
        xWidths.forEach(xWidth => {
          activeXWidths.add(xWidth);
        });
      });
      
      console.log(`[drawChartKey] activeXWidths:`, Array.from(activeXWidths));
      
      // 활성화된 xWidth가 있을 때만 그림
      if (activeXWidths.size > 0) {
        console.log(`[drawChartKey] Drawing ticker moving averages...`);
        
        tickerMovingAverages.forEach((xWidths, symbol) => {
          console.log(`[drawChartKey] Processing ticker: ${symbol}, xWidths:`, xWidths);
          
          // 해당 티커의 데이터만 사용
          const tickerDataBySymbol = new Map<string, { time: number; close: number }[]>();
          const tickerData = dataBySymbol.get(symbol);
          if (!tickerData) {
            console.log(`[drawChartKey] No data for ${symbol}`);
            return;
          }
          
          tickerDataBySymbol.set(symbol, tickerData.map(p => ({ time: p.time, close: p.close })));
          
          const tickerMinMax = minMaxBySymbol.get(symbol);
          if (!tickerMinMax) {
            console.log(`[drawChartKey] No minMax for ${symbol}`);
            return;
          }
          
          const tickerMinMaxBySymbol = new Map<string, { min: number; max: number }>();
          tickerMinMaxBySymbol.set(symbol, tickerMinMax);
          
          // 티커 색상 가져오기
          const tickerColor = this.getTickerColor(symbol);
          
          // activeXWidths에 포함된 xWidth만 그리기
          const filteredXWidths = xWidths.filter(xWidth => activeXWidths.has(xWidth));
          const totalLines = filteredXWidths.length;
          
          console.log(`[drawChartKey] ${symbol} filteredXWidths:`, filteredXWidths);
          
          filteredXWidths.forEach((xWidth, index) => {
            // 첫 번째 선은 불투명(1.0), 마지막 선은 투명(0.3)
            const opacity = totalLines === 1 ? 1.0 : 1.0 - (index / (totalLines - 1)) * 0.7;
            
            console.log(`[drawChartKey] Drawing MA for ${symbol}, xWidth: ${xWidth}, opacity: ${opacity}`);
            
            const avgConfig: ShowAverageItem = {
              type: 'moving',
              xWidth,
              label: `${symbol}-MA${Math.round(xWidth / (60 * 1000 * 60 * 24))}`,
              color: tickerColor, // 티커 색상 사용
              visible: true,
              opacity // opacity 추가
            };
            this.drawAverageLine(tickerDataBySymbol, tickerMinMaxBySymbol, sortedTimes, minTime, maxTime, graphTop, graphHeight, lineMode, avgConfig, chartKey, symbol);
          });
        });
      }
    }

    return { dataBySymbol, minMaxBySymbol, sortedTimes };
  }

  private drawGrid(topY: number, height: number) {
    const gridDivisions = 10;
    const gridWidth = this.chartAreaWidth;
    const gridStepX = gridWidth / gridDivisions;
    const gridStepY = height / gridDivisions;
    
    this.ctx.strokeStyle = this.config.gridStrokeStyle || '#CCCCCC';
    this.ctx.lineWidth = this.config.gridLineWidth || 1;
    
    for (let i = 0; i <= gridDivisions; i++) {
      const x = this.chartAreaLeft + gridStepX * i;
      this.ctx.beginPath();
      this.ctx.moveTo(x, topY);
      this.ctx.lineTo(x, topY + height);
      this.ctx.stroke();
    }
    
    for (let i = 0; i <= gridDivisions; i++) {
      const y = topY + gridStepY * i;
      this.ctx.beginPath();
      this.ctx.moveTo(this.chartAreaLeft, y);
      this.ctx.lineTo(this.getChartRight(), y);
      this.ctx.stroke();
    }
  }

  private drawYAxis(topY: number, bottomY: number) {
    this.ctx.strokeStyle = this.getAxisColor();
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(this.paddingLeft, topY);
    this.ctx.lineTo(this.paddingLeft, bottomY);
    this.ctx.stroke();
  }

  private drawYAxisLabels(topY: number, height: number, bottomY: number, minValue?: number, maxValue?: number, chartKey?: string) {
    const yLabelCount = this.config.yLabelCount ?? 6;
    
    // yLabelCount가 0이면 레이블을 그리지 않음
    if (yLabelCount === 0) {
      return;
    }
    
    this.ctx.fillStyle = this.getTextColor();
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'middle';
    this.ctx.strokeStyle = this.getAxisColor();
    this.ctx.lineWidth = 1;
    
    const labelCount = Math.max(2, yLabelCount); // 최소 2개 (시작과 끝)
    const totalLabels = labelCount;
    const step = 100 / (labelCount - 1); // 0부터 100까지를 labelCount-1 구간으로 나눔
    
    for (let i = 0; i < labelCount; i++) {
      const normalizedValue = (100 - i * step) / 100;
      const totalMargin = this.chartMarginTop + this.chartMarginBottom;
      const scaledValue = this.chartMarginBottom + normalizedValue * (1 - totalMargin);
      const y = bottomY - scaledValue * height;
      
      let labelText: string;
      if (this.state.normalize !== 'none' || minValue === undefined || maxValue === undefined) {
        // 정규화 모드 (rangeNormalize 또는 normalize): % 표시
        const value = 100 - i * step;
        labelText = `${Math.round(value)}%`;
      } else {
        // 비정규화 모드 (none): 실제 값 표시
        const actualValue = minValue + normalizedValue * (maxValue - minValue);
        const formatted = this.config.yFormat ? this.config.yFormat(actualValue, i, totalLabels, chartKey) : actualValue.toLocaleString(undefined, { maximumFractionDigits: 2 });
        labelText = this.applyFormatResult(formatted);
      }
      
      this.ctx.fillText(labelText, this.paddingLeft - 5, y);
      
      this.ctx.beginPath();
      this.ctx.moveTo(this.paddingLeft - 5, y);
      this.ctx.lineTo(this.paddingLeft, y);
      this.ctx.stroke();
    }
  }

  private drawYAxisTitle(title: string, topY: number, bottomY: number) {
    this.ctx.save();
    const labelY = (topY + bottomY) / 2;
    // paddingLeft가 작을 때는 타이틀을 왼쪽 끝에, 클 때는 적절한 위치에
    const titleX = Math.min(this.paddingLeft / 2, 8);
    this.ctx.translate(titleX, labelY);
    this.ctx.rotate(-Math.PI / 2);
    this.ctx.fillStyle = this.getTextColor();
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(title, 0, 0);
    this.ctx.restore();
  }

  private drawCandles(
    points: { time: number; open: number; high: number; low: number; close: number }[],
    minMax: { min: number; max: number },
    color: string,
    minTime: number,
    maxTime: number,
    topY: number,
    height: number,
    symbol?: string,
    chartKey?: string
  ) {
    if (points.length === 0) return;
    
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(this.chartAreaLeft, topY, this.chartAreaWidth, height);
    this.ctx.clip();
    
    points.forEach(point => {
      const x = this.getX(point.time, minTime, maxTime);
      const yHigh = this.getY(point.high, minMax.min, minMax.max, topY, height);
      const yLow = this.getY(point.low, minMax.min, minMax.max, topY, height);
      const yOpen = this.getY(point.open, minMax.min, minMax.max, topY, height);
      const yClose = this.getY(point.close, minMax.min, minMax.max, topY, height);

      const isUp = point.close >= point.open;
      
      // 캔들 색상 결정
      let upColor = color;
      let downColor = color;
      let borderColor = color;
      
      if (symbol && chartKey) {
        if (this.config.candleUpColor) {
          upColor = typeof this.config.candleUpColor === 'function' 
            ? this.config.candleUpColor(symbol, chartKey) 
            : this.config.candleUpColor;
        }
        if (this.config.candleDownColor) {
          downColor = typeof this.config.candleDownColor === 'function' 
            ? this.config.candleDownColor(symbol, chartKey) 
            : this.config.candleDownColor;
        }
        if (this.config.candleBorderColor) {
          borderColor = typeof this.config.candleBorderColor === 'function' 
            ? this.config.candleBorderColor(symbol, chartKey) 
            : this.config.candleBorderColor;
        }
      }

      // High-Low 라인
      // this.ctx.globalAlpha = 0.6; // 0.3
      this.ctx.globalAlpha = 0.3; // 0.3
      this.ctx.strokeStyle = borderColor;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(x, yHigh);
      this.ctx.lineTo(x, yLow);
      this.ctx.stroke();

      // Open-Close 캔들 바디
      const candleWidth = 2;
      this.ctx.strokeStyle = borderColor;
      this.ctx.fillStyle = isUp ? upColor : downColor;
      
      const rectY = Math.min(yOpen, yClose);
      const rectHeight = Math.max(Math.abs(yOpen - yClose), 1);
      this.ctx.fillRect(x - candleWidth / 2, rectY, candleWidth, rectHeight);
      this.ctx.strokeRect(x - candleWidth / 2, rectY, candleWidth, rectHeight);
      this.ctx.globalAlpha = 1;
    });
    
    this.ctx.restore();
  }

  private drawLine(
    points: { time: number; open: number; high: number; low: number; close: number }[],
    minMax: { min: number; max: number },
    color: string,
    minTime: number,
    maxTime: number,
    timeRange: number,
    totalPoints: number,
    topY: number,
    height: number,
    fillGaps: boolean,
    lineMode: LineType,
    symbol?: string,
    chartKey?: string
  ) {
    if (points.length === 0) return;
    
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(this.chartAreaLeft, topY, this.chartAreaWidth, height);
    this.ctx.clip();
    
    // 라인 스타일 적용
    let lineColor = color;
    let lineWidth = 1;
    
    if (symbol && chartKey) {
      if (this.config.lineStrokeStyle) {
        lineColor = typeof this.config.lineStrokeStyle === 'function'
          ? this.config.lineStrokeStyle(symbol, chartKey)
          : this.config.lineStrokeStyle;
      }
      if (this.config.lineWidth) {
        lineWidth = typeof this.config.lineWidth === 'function'
          ? this.config.lineWidth(symbol, chartKey)
          : this.config.lineWidth;
      }
    }
    
    this.ctx.strokeStyle = lineColor;
    this.ctx.lineWidth = lineWidth;
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    
    const firstX = this.getX(points[0].time, minTime, maxTime);
    const firstY = this.getY(points[0].close, minMax.min, minMax.max, topY, height);
    this.ctx.moveTo(firstX, firstY);

    const avgTimeDiff = timeRange / totalPoints;

    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      const prevPoint = points[i - 1];
      const x = this.getX(point.time, minTime, maxTime);
      const y = this.getY(point.close, minMax.min, minMax.max, topY, height);
      const timeDiff = point.time - prevPoint.time;

      if (timeDiff > avgTimeDiff * 2) {
        this.ctx.stroke();
        if (!fillGaps) {
          this.ctx.setLineDash([5, 5]);
        }
        this.ctx.beginPath();
        const prevX = this.getX(prevPoint.time, minTime, maxTime);
        const prevY = this.getY(prevPoint.close, minMax.min, minMax.max, topY, height);
        this.ctx.moveTo(prevX, prevY);
        
        if (lineMode.startsWith('line-smooth')) {
          this.drawBezierCurve(prevX, prevY, x, y, point, minMax, topY, height, lineMode);
        } else if (lineMode === 'step-to') {
          // step-to: 수평선 -> 수직선
          this.ctx.lineTo(x, prevY); // 수평선
          this.ctx.lineTo(x, y);     // 수직선
        } else if (lineMode === 'step-from') {
          // step-from: 수직선 -> 수평선
          this.ctx.lineTo(prevX, y); // 수직선
          this.ctx.lineTo(x, y);     // 수평선
        } else if (lineMode === 'step-center') {
          // step-center: 수평선 -> 중간에서 수직선 -> 수평선
          const midX = (prevX + x) / 2;
          this.ctx.lineTo(midX, prevY); // 수평선 (중간까지)
          this.ctx.lineTo(midX, y);     // 수직선 (중간에서)
          this.ctx.lineTo(x, y);        // 수평선 (끝까지)
        } else {
          // line: 직선
          this.ctx.lineTo(x, y);
        }
        
        this.ctx.stroke();
        if (!fillGaps) {
          this.ctx.setLineDash([]);
        }
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
      } else {
        if (lineMode.startsWith('line-smooth')) {
          const prevX = this.getX(prevPoint.time, minTime, maxTime);
          const prevY = this.getY(prevPoint.close, minMax.min, minMax.max, topY, height);
          this.drawBezierCurve(prevX, prevY, x, y, point, minMax, topY, height, lineMode);
        } else if (lineMode === 'step-to') {
          // step-to: 수평선 -> 수직선
          this.ctx.lineTo(x, this.getY(prevPoint.close, minMax.min, minMax.max, topY, height)); // 수평선
          this.ctx.lineTo(x, y);     // 수직선
        } else if (lineMode === 'step-from') {
          // step-from: 수직선 -> 수평선
          const prevX = this.getX(prevPoint.time, minTime, maxTime);
          this.ctx.lineTo(prevX, y); // 수직선
          this.ctx.lineTo(x, y);     // 수평선
        } else if (lineMode === 'step-center') {
          // step-center: 수평선 -> 중간에서 수직선 -> 수평선
          const prevX = this.getX(prevPoint.time, minTime, maxTime);
          const prevY = this.getY(prevPoint.close, minMax.min, minMax.max, topY, height);
          const midX = (prevX + x) / 2;
          this.ctx.lineTo(midX, prevY); // 수평선 (중간까지)
          this.ctx.lineTo(midX, y);     // 수직선 (중간에서)
          this.ctx.lineTo(x, y);        // 수평선 (끝까지)
          this.ctx.lineTo(x, y);     // 수평선
        } else {
          // line: 직선
          this.ctx.lineTo(x, y);
        }
      }
    }
    
    this.ctx.stroke();
    this.ctx.restore();
  }

  private drawBezierCurve(
    prevX: number,
    prevY: number,
    x: number,
    y: number,
    point: { open: number; high: number; low: number; close: number },
    minMax: { min: number; max: number },
    topY: number,
    height: number,
    lineMode: string
  ) {
    const cp1x = prevX + (x - prevX) / 3;
    const cp1y = prevY;
    const cp2x = prevX + (x - prevX) * 2 / 3;
    let cp2y: number;
    
    if (lineMode === 'line-smooth-open' && point.open && point.open > 0) {
      cp2y = this.getY(point.open, minMax.min, minMax.max, topY, height);
    } else if (lineMode === 'line-smooth-high' && point.high && point.high > 0) {
      cp2y = this.getY(point.high, minMax.min, minMax.max, topY, height);
    } else if (lineMode === 'line-smooth-low' && point.low && point.low > 0) {
      cp2y = this.getY(point.low, minMax.min, minMax.max, topY, height);
    } else if (lineMode === 'line-smooth-middle' && point.high && point.low) {
      cp2y = this.getY((point.high + point.low) / 2, minMax.min, minMax.max, topY, height);
    } else {
      cp2y = y;
    }
    
    this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
  }

  private drawAverageLine(
    dataBySymbol: Map<string, { time: number; close: number }[]>,
    minMaxBySymbol: Map<string, { min: number; max: number }>,
    sortedTimes: number[],
    minTime: number,
    maxTime: number,
    topY: number,
    height: number,
    lineMode: string,
    averageConfig: ShowAverageItem,
    chartKey: string,
    filterSymbol?: string // 특정 티커만 처리 (티커별 이동평균선용)
  ) {
    
    // 캐시 키 생성 (visibleTickers, chartKey, averageConfig, normalize 모드로 구분)
    const visibleTickersKey = Array.from(this.state.visibleTickers).sort().join(',');
    
    // 범위 정규화 모드에서는 현재 화면 범위도 캐시 키에 포함
    let cacheKey = `${chartKey}-${averageConfig.type}-${averageConfig.type === 'moving' ? averageConfig.xWidth : 'full'}-${averageConfig.label}-${visibleTickersKey}-${this.state.normalize}`;
    
    if (this.state.normalize === 'rangeNormalize') {
      // 범위 정규화 모드: 현재 화면 범위를 캐시 키에 포함
      cacheKey += `-${minTime}-${maxTime}`;
    }
    
    // 평균선 계산을 위해 원본 데이터(this.originalDataMap) 사용 - 확대와 무관하게 전체 데이터 사용
    const fullDataBySymbol = new Map<string, { time: number; close: number }[]>();
    
    // 정규화를 위한 min/max 결정
    // rangeNormalize: 현재 화면 범위의 min/max 사용
    // normalize: 전체 데이터의 min/max 사용 (globalMinMaxCache)
    const normalizationMinMaxBySymbol = new Map<string, { min: number; max: number }>();
    
    this.originalDataMap.forEach((value, symbol) => {
      // filterSymbol이 있으면 해당 티커만 처리
      if (filterSymbol && symbol !== filterSymbol) {
        return;
      }
      
      // visibleTickers에 있는 티커만 사용
      if (!this.state.visibleTickers.has(symbol)) return;
      
      const points: { time: number; close: number }[] = [];
      
      // 현재 chartKey의 데이터 사용 (price, volume, obv 등)
      const chartDataObj = value.data[chartKey];
      if (!chartDataObj) return;
      
      const chartData = chartDataObj.datas || [];
      chartData.forEach(d => {
        if (d.y !== null && d.y !== undefined) {
          points.push({
            time: d.x,
            close: d.y
          });
        }
      });
      
      if (points.length > 0) {
        fullDataBySymbol.set(symbol, points);
        
        // 정규화용 min/max 설정
        if (this.state.normalize === 'normalize') {
          // 전체 정규화: globalMinMaxCache 사용
          const globalMinMax = this.globalMinMaxCache.get(chartKey)?.get(symbol);
          if (globalMinMax) {
            normalizationMinMaxBySymbol.set(symbol, globalMinMax);
          }
        } else if (this.state.normalize === 'rangeNormalize') {
          // 범위 정규화: 현재 화면 범위의 min/max 사용
          const rangeMinMax = minMaxBySymbol.get(symbol);
          if (rangeMinMax) {
            normalizationMinMaxBySymbol.set(symbol, rangeMinMax);
          }
        } else {
          // 정규화 안함: 전체 데이터의 min/max 사용
          const globalMinMax = this.globalMinMaxCache.get(chartKey)?.get(symbol);
          if (globalMinMax) {
            normalizationMinMaxBySymbol.set(symbol, globalMinMax);
          }
        }
      }
    });
    
    // 디버깅: normalizationMinMaxBySymbol 확인
    console.log(`[drawAverageLine] chartKey: ${chartKey}, normalize: ${this.state.normalize}`);
    console.log(`[drawAverageLine] fullDataBySymbol size: ${fullDataBySymbol.size}`);
    console.log(`[drawAverageLine] normalizationMinMaxBySymbol size: ${normalizationMinMaxBySymbol.size}`);
    
    if (normalizationMinMaxBySymbol.size === 0) {
      console.warn(`[drawAverageLine] normalizationMinMaxBySymbol is empty for chartKey: ${chartKey}, normalize: ${this.state.normalize}`);
      console.warn(`globalMinMaxCache has chartKey:`, this.globalMinMaxCache.has(chartKey));
      console.warn(`minMaxBySymbol size:`, minMaxBySymbol.size);
      return; // 데이터가 없으면 그리지 않음
    }
    
    // 전체 데이터의 모든 시간 포인트 수집
    const allTimesSet = new Set<number>();
    fullDataBySymbol.forEach((sortedPoints) => {
      sortedPoints.forEach(point => {
        allTimesSet.add(point.time);
      });
    });
    const allTimes = Array.from(allTimesSet).sort((a, b) => a - b);
    
    if (averageConfig.type === 'average') {
      // 캐시 확인
      let avgPoints: { time: number; avgValue: number }[] = [];
      
      if (this.averageLineCache.has(cacheKey)) {
        avgPoints = this.averageLineCache.get(cacheKey)!;
      } else {
        // 전체 평균선: 모든 티커의 평균을 하나의 선으로
        
        // 전체 시간에 대해 평균 계산
        allTimes.forEach(time => {
          const normalizedValues: number[] = [];
          
          fullDataBySymbol.forEach((sortedPoints, symbol) => {
            const minMax = normalizationMinMaxBySymbol.get(symbol);
            if (!minMax) return;
            
            let closeValue: number | null = null;
            const exactPoint = sortedPoints.find(p => p.time === time);
            
          if (exactPoint) {
            closeValue = exactPoint.close;
          } else {
            let prevPoint = null;
            let nextPoint = null;
            
            for (let i = 0; i < sortedPoints.length; i++) {
              if (sortedPoints[i].time < time) {
                prevPoint = sortedPoints[i];
              } else if (sortedPoints[i].time > time) {
                nextPoint = sortedPoints[i];
                break;
              }
            }
            
            if (prevPoint && nextPoint) {
              const ratio = (time - prevPoint.time) / (nextPoint.time - prevPoint.time);
              closeValue = prevPoint.close + (nextPoint.close - prevPoint.close) * ratio;
            } else if (prevPoint) {
              closeValue = prevPoint.close;
            } else if (nextPoint) {
              closeValue = nextPoint.close;
            }
          }
          
          if (closeValue !== null) {
            // 정규화 모드에서는 각 심볼의 값을 정규화한 후 평균
            if (this.state.normalize === 'rangeNormalize' || this.state.normalize === 'normalize') {
              const normalizedValue = ((closeValue - minMax.min) / (minMax.max - minMax.min || 1)) * 100;
              normalizedValues.push(normalizedValue);
            } else {
              // 비정규화 모드에서는 원본 값 사용
              normalizedValues.push(closeValue);
            }
          }
        });
        
        if (normalizedValues.length > 0) {
          const avgValue = normalizedValues.reduce((sum, v) => sum + v, 0) / normalizedValues.length;
          avgPoints.push({ time, avgValue });
        }
      });
        
        // 캐시에 저장
        this.averageLineCache.set(cacheKey, avgPoints);
      }
      
      // Y 좌표로 변환
      const avgPointsWithY = avgPoints.map(p => ({
        time: p.time,
        avgY: (this.state.normalize === 'rangeNormalize' || this.state.normalize === 'normalize')
          ? this.getY(p.avgValue, 0, 100, topY, height) // 정규화 모드: 0-100% 범위
          : (() => {
              // 비정규화 모드: 전체 데이터의 min/max 사용
              let globalMin = Infinity;
              let globalMax = -Infinity;
              minMaxBySymbol.forEach((minMax) => {
                globalMin = Math.min(globalMin, minMax.min);
                globalMax = Math.max(globalMax, minMax.max);
              });
              return this.getY(p.avgValue, globalMin, globalMax, topY, height);
            })()
      }));
      
      // 화면에 보이는 영역 + 바로 이전/이후 포인트 포함 (선이 화면 경계까지 연결되도록)
      const visibleAvgPoints: { time: number; avgY: number }[] = [];
      let foundFirstVisible = false;
      
      for (let i = 0; i < avgPointsWithY.length; i++) {
        const point = avgPointsWithY[i];
        
        // 화면 안에 있는 포인트
        if (point.time >= minTime && point.time <= maxTime) {
          // 첫 번째 화면 내 포인트를 찾았고, 이전 포인트가 있으면 추가
          if (!foundFirstVisible && i > 0) {
            visibleAvgPoints.push(avgPointsWithY[i - 1]);
          }
          foundFirstVisible = true;
          visibleAvgPoints.push(point);
        }
        // 화면 이후 첫 포인트 (마지막 연결용)
        else if (point.time > maxTime && foundFirstVisible) {
          visibleAvgPoints.push(point);
          break;
        }
      }
      
      this.drawSingleAverageLine(visibleAvgPoints, minTime, maxTime, topY, height, lineMode, averageConfig);
      
    } else if (averageConfig.type === 'moving') {
      // 캐시 확인
      let movingAvgPoints: { time: number; avgY: number }[] = [];
      
      if (this.averageLineCache.has(cacheKey)) {
        // 캐시된 데이터를 avgValue 형태로 가져와서 Y 좌표로 변환
        const cachedAvgValues = this.averageLineCache.get(cacheKey)!;
        
        // Y 좌표 계산 (정규화 고려)
        cachedAvgValues.forEach(item => {
          let yCoord: number;
          if (this.state.normalize === 'rangeNormalize' || this.state.normalize === 'normalize') {
            // 정규화 모드: 0-100% 범위
            yCoord = this.getY(item.avgValue, 0, 100, topY, height);
          } else {
            // 비정규화 모드: 전체 데이터의 min/max 사용
            let globalMin = Infinity;
            let globalMax = -Infinity;
            minMaxBySymbol.forEach((minMax) => {
              globalMin = Math.min(globalMin, minMax.min);
              globalMax = Math.max(globalMax, minMax.max);
            });
            yCoord = this.getY(item.avgValue, globalMin, globalMax, topY, height);
          }
          
          movingAvgPoints.push({ time: item.time, avgY: yCoord });
        });
      } else {
        // 이동평균선: 전체 평균에 대한 이동평균 (하나의 선)
        const xWidth = averageConfig.xWidth; // 시간 범위 (밀리초)
        
        // 먼저 전체 평균 계산 (모든 시간에 대해)
        const avgValues: { time: number; avgValue: number }[] = [];
        
        allTimes.forEach(time => {
        const normalizedValues: number[] = [];
        
        fullDataBySymbol.forEach((sortedPoints, symbol) => {
          const minMax = normalizationMinMaxBySymbol.get(symbol);
          if (!minMax) return;
          
          let closeValue: number | null = null;
          const exactPoint = sortedPoints.find(p => p.time === time);
          
          if (exactPoint) {
            closeValue = exactPoint.close;
          } else {
            let prevPoint = null;
            let nextPoint = null;
            
            for (let i = 0; i < sortedPoints.length; i++) {
              if (sortedPoints[i].time < time) {
                prevPoint = sortedPoints[i];
              } else if (sortedPoints[i].time > time) {
                nextPoint = sortedPoints[i];
                break;
              }
            }
            
            if (prevPoint && nextPoint) {
              const ratio = (time - prevPoint.time) / (nextPoint.time - prevPoint.time);
              closeValue = prevPoint.close + (nextPoint.close - prevPoint.close) * ratio;
            } else if (prevPoint) {
              closeValue = prevPoint.close;
            } else if (nextPoint) {
              closeValue = nextPoint.close;
            }
          }
          
          if (closeValue !== null) {
            // 정규화 모드에서는 각 심볼의 값을 정규화한 후 평균
            if (this.state.normalize === 'rangeNormalize' || this.state.normalize === 'normalize') {
              const normalizedValue = ((closeValue - minMax.min) / (minMax.max - minMax.min || 1)) * 100;
              normalizedValues.push(normalizedValue);
            } else {
              // 비정규화 모드에서는 원본 값 사용
              normalizedValues.push(closeValue);
            }
          }
        });
        
        if (normalizedValues.length > 0) {
          const avgValue = normalizedValues.reduce((sum, y) => sum + y, 0) / normalizedValues.length;
          avgValues.push({ time, avgValue });
        }
      });
      
      // 전체 평균값에 대해 이동평균 계산
      let movingAvgPointsTemp: { time: number; avgY: number }[] = [];
      const firstDataTime = avgValues.length > 0 ? avgValues[0].time : 0;
      
      avgValues.forEach((item, index) => {
        const time = item.time;
        
        // xWidth 기간이 지나기 전에는 그리지 않음
        if (time < firstDataTime + xWidth) {
          return;
        }
        
        // 현재 시간에서 xWidth 이전 시간까지의 범위
        const startTime = time - xWidth;
        
        // 해당 시간 범위 내의 평균값들 수집
        const rangeValues: number[] = [];
        avgValues.forEach(v => {
          if (v.time > startTime && v.time <= time) {
            rangeValues.push(v.avgValue);
          }
        });
        
        // 데이터가 있을 때만 계산
        if (rangeValues.length > 0) {
          const movingAvg = rangeValues.reduce((sum, v) => sum + v, 0) / rangeValues.length;
          movingAvgPointsTemp.push({ time, avgY: movingAvg }); // avgY에 일단 avgValue 저장
        }
      });
        
        // 캐시에 저장 (avgY를 avgValue로 변환)
        const cacheData = movingAvgPointsTemp.map(p => ({ time: p.time, avgValue: p.avgY }));
        this.averageLineCache.set(cacheKey, cacheData);
        
        // Y 좌표로 변환
        movingAvgPoints = movingAvgPointsTemp.map(item => {
          let yCoord: number;
          if (this.state.normalize === 'rangeNormalize' || this.state.normalize === 'normalize') {
            // 정규화 모드: 0-100% 범위
            yCoord = this.getY(item.avgY, 0, 100, topY, height);
          } else {
            // 비정규화 모드: 전체 데이터의 min/max 사용
            let globalMin = Infinity;
            let globalMax = -Infinity;
            minMaxBySymbol.forEach((minMax) => {
              globalMin = Math.min(globalMin, minMax.min);
              globalMax = Math.max(globalMax, minMax.max);
            });
            yCoord = this.getY(item.avgY, globalMin, globalMax, topY, height);
          }
          return { time: item.time, avgY: yCoord };
        });
      }
      
      // 화면에 보이는 영역 + 바로 이전/이후 포인트 포함 (선이 화면 경계까지 연결되도록)
      const visibleMovingAvgPoints: { time: number; avgY: number }[] = [];
      let foundFirstVisible = false;
      
      for (let i = 0; i < movingAvgPoints.length; i++) {
        const point = movingAvgPoints[i];
        
        // 화면 안에 있는 포인트
        if (point.time >= minTime && point.time <= maxTime) {
          // 첫 번째 화면 내 포인트를 찾았고, 이전 포인트가 있으면 추가
          if (!foundFirstVisible && i > 0) {
            visibleMovingAvgPoints.push(movingAvgPoints[i - 1]);
          }
          foundFirstVisible = true;
          visibleMovingAvgPoints.push(point);
        }
        // 화면 이후 첫 포인트 (마지막 연결용)
        else if (point.time > maxTime && foundFirstVisible) {
          visibleMovingAvgPoints.push(point);
          break;
        }
      }
      
      this.drawSingleAverageLine(visibleMovingAvgPoints, minTime, maxTime, topY, height, lineMode, averageConfig);
    }
  }

  private drawSingleAverageLine(
    avgPoints: { time: number; avgY: number }[],
    minTime: number,
    maxTime: number,
    topY: number,
    height: number,
    lineMode: string,
    averageConfig: ShowAverageItem
  ) {
    if (avgPoints.length === 0) return;
    
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(this.chartAreaLeft, topY, this.chartAreaWidth, height);
    this.ctx.clip();
    
    // 색상 설정 (config 우선, 없으면 averageConfig.color, 없으면 기본값)
    const strokeStyle = averageConfig.color || this.config.averageStrokeStyle || '#000000';
    this.ctx.strokeStyle = strokeStyle;
    
    // 티커별 이동평균선인지 확인 (label에 '-MA'가 포함되어 있으면 티커별)
    const isTickerMA = averageConfig.label.includes('-MA');
    
    if (isTickerMA) {
      // 티커별 이동평균선: lineWidth 1, 점선
      this.ctx.lineWidth = 1;
      this.ctx.setLineDash([5, 3]);
    } else {
      // 전역 평균선: config 설정 사용
      this.ctx.lineWidth = this.config.averageLineWidth || 2;
      this.ctx.setLineDash(this.config.averageLineDash || [3, 2]);
    }
    
    // opacity 설정 (averageConfig에 있으면 사용, 없으면 1.0)
    this.ctx.globalAlpha = averageConfig.opacity !== undefined ? averageConfig.opacity : 1.0;
    
    this.ctx.beginPath();
    avgPoints.forEach((point, i) => {
      const x = this.getX(point.time, minTime, maxTime);
      const y = point.avgY;
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else if (lineMode.startsWith('line-smooth') && i > 0) {
        const prevPoint = avgPoints[i - 1];
        const prevX = this.getX(prevPoint.time, minTime, maxTime);
        const prevY = prevPoint.avgY;
        const cp1x = prevX + (x - prevX) / 3;
        const cp1y = prevY;
        const cp2x = prevX + (x - prevX) * 2 / 3;
        const cp2y = y;
        this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    });
    this.ctx.stroke();
    
    this.ctx.setLineDash([]);
    this.ctx.globalAlpha = 1.0;
    this.ctx.restore();
  }

  drawLegend(
    area: DrawArea,
    dataBySymbol: Map<string, any>,
    visibleTickers: Set<string>
  ): { symbol: string; x: number; y: number; width: number; height: number }[] {
    const legendBoxSize = 10; // 정사각형 크기
    const legendHeight = 16;
    const lineSpacing = -5; // 라인 간격
    const itemSpacing = 10; // 아이템 간 간격
    const textMargin = 5; // 정사각형과 텍스트 사이 간격
    const newLegendItems: { symbol: string; x: number; y: number; width: number; height: number }[] = [];
    
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';
    this.ctx.font = '11px Arial';
    
    let currentX = area.x;
    let currentY = area.y;
    let currentLineMaxHeight = legendHeight;
    const maxWidth = area.x + area.width;
    
    // 티커 범례
    dataBySymbol.forEach((_, symbol) => {
      const color = this.getTickerColor(symbol);
      const isVisible = visibleTickers.has(symbol);
      
      // 텍스트 너비 측정
      const textWidth = this.ctx.measureText(symbol).width;
      const itemWidth = legendBoxSize + textMargin + textWidth + itemSpacing; // 정사각형 + 간격 + 텍스트 + 아이템 간격
      
      // 현재 줄에 공간이 부족하면 다음 줄로
      if (currentX + itemWidth > maxWidth && currentX > area.x) {
        currentX = area.x;
        currentY += currentLineMaxHeight + lineSpacing;
        currentLineMaxHeight = legendHeight;
      }
      
      const itemX = currentX;
      
      newLegendItems.push({
        symbol,
        x: itemX - 5,
        y: currentY - legendHeight / 2,
        width: itemWidth,
        height: legendHeight
      });
      
      this.ctx.globalAlpha = isVisible ? 1.0 : 0.3;
      
      // 정사각형 그리기 (채우기)
      this.ctx.fillStyle = color;
      this.ctx.fillRect(
        itemX, 
        currentY - legendBoxSize / 2, 
        legendBoxSize, 
        legendBoxSize
      );
      
      // 텍스트 그리기
      this.ctx.fillStyle = isVisible ? this.getTextColor() : (this.detectDarkMode(this.config.theme) ? '#666666' : '#999999');
      this.ctx.fillText(symbol, itemX + legendBoxSize + textMargin, currentY);
      this.ctx.globalAlpha = 1.0;
      
      currentX += itemWidth;
    });
    
    // 평균선 범례 추가 (클릭 가능하도록 legendItems에 포함)
    if (this.state.showAverage && this.state.showAverage.length > 0) {
      this.state.showAverage.forEach(avgConfig => {
        const label = avgConfig.label;
        const color = avgConfig.color || this.config.averageStrokeStyle || '#000000';
        const isVisible = avgConfig.visible !== false; // 기본값은 true
        
        // 평균선 식별자 생성 (average: 또는 moving:xWidth 형식)
        const avgSymbol = avgConfig.type === 'average' 
          ? 'average:' 
          : `moving:${avgConfig.xWidth}`;
        
        // 텍스트 너비 측정
        const textWidth = this.ctx.measureText(label).width;
        const itemWidth = legendBoxSize + textMargin + textWidth + itemSpacing;
        
        // 현재 줄에 공간이 부족하면 다음 줄로
        if (currentX + itemWidth > maxWidth && currentX > area.x) {
          currentX = area.x;
          currentY += currentLineMaxHeight + lineSpacing;
          currentLineMaxHeight = legendHeight;
        }
        
        const itemX = currentX;
        
        // 평균선도 legendItems에 추가 (클릭 가능하도록)
        newLegendItems.push({
          symbol: avgSymbol,
          x: itemX - 5,
          y: currentY - legendHeight / 2,
          width: itemWidth,
          height: legendHeight
        });
        
        // 활성/비활성 상태에 따라 투명도 조절
        this.ctx.globalAlpha = isVisible ? 1.0 : 0.3;
        
        // 정사각형 그리기
        this.ctx.fillStyle = color;
        this.ctx.fillRect(
          itemX, 
          currentY - legendBoxSize / 2, 
          legendBoxSize, 
          legendBoxSize
        );
        
        // 텍스트 그리기
        this.ctx.fillStyle = isVisible ? this.getTextColor() : (this.detectDarkMode(this.config.theme) ? '#666666' : '#999999');
        this.ctx.fillText(label, itemX + legendBoxSize + textMargin, currentY);
        this.ctx.globalAlpha = 1.0;
        
        currentX += itemWidth;
      });
    }
    
    return newLegendItems;
  }

  private drawRangeEventLabel(event: EventMarker, x: number, y: number, color: string, align: 'center' | 'left' = 'center', baseline: CanvasTextBaseline = 'top') {
    this.ctx.save();
    
    // 폰트 스타일 적용
    const font = this.config.eventRangeLabelFont
      ? (typeof this.config.eventRangeLabelFont === 'function'
        ? this.config.eventRangeLabelFont(event)
        : this.config.eventRangeLabelFont)
      : 'bold 11px Arial';
    
    this.ctx.font = font;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = baseline;
    
    const textMetrics = this.ctx.measureText(event.label);
    const textWidth = textMetrics.width;
    const textHeight = 12; // 대략적인 텍스트 높이
    
    // 배경 스타일 적용 (설정된 경우에만)
    const bgStyle = this.config.eventRangeLabelBackgroundStyle
      ? (typeof this.config.eventRangeLabelBackgroundStyle === 'function'
        ? this.config.eventRangeLabelBackgroundStyle(event)
        : this.config.eventRangeLabelBackgroundStyle)
      : undefined;
    
    if (bgStyle) {
      const bgX = align === 'center' ? x - textWidth / 2 - 4 : x - 4;
      this.ctx.fillStyle = bgStyle;
      this.ctx.fillRect(bgX, y - 2, textWidth + 8, 16);
    }
    
    // 텍스트 색상 적용
    const textColor = this.config.eventRangeLabelFillStyle
      ? (typeof this.config.eventRangeLabelFillStyle === 'function'
        ? this.config.eventRangeLabelFillStyle(event)
        : this.config.eventRangeLabelFillStyle)
      : (color.includes('rgba') ? color.replace(/[\d.]+\)$/g, '1)') : color);
    
    this.ctx.fillStyle = textColor;
    this.ctx.fillText(event.label, align === 'center' ? x : x, y);
    this.ctx.restore();
    
    // 라벨 영역을 사각형으로 저장 (Range 이벤트 전용)
    const labelX = align === 'center' ? x : x + textWidth / 2;
    const labelY = y + textHeight / 2;
    
    // Range 이벤트임을 표시하는 특별한 마커 등록
    const rangeEvent = {
      ...event,
      isRangeLabel: true,
      labelRect: {
        x: align === 'center' ? x - textWidth / 2 : x,
        y: y,
        width: textWidth,
        height: textHeight
      }
    } as any;
    
    this.eventMarkers.push({ 
      event: rangeEvent, 
      x: labelX, 
      y: labelY, 
      radius: Math.max(textWidth / 2, 10)
    });
  }

  private checkRangeEventHover(event: EventMarker, x: number, y: number) {
    const isHovered = this.hoveredEventMarker !== null && 
      this.hoveredEventMarker.label === event.label &&
      isRangeEvent(this.hoveredEventMarker);
    
    if (isHovered) {
      this.eventTooltipsToRender.push({ event, x, y: y + 20, pointsDown: true });
    }
  }

  drawEventMarkers(
    sortedTimes: number[],
    chartBottom: number,
    showEvents: boolean,
    chartAreas: Array<DrawArea & { key: string }>,
    displayMinTime?: number,
    displayMaxTime?: number,
    minMaxByChartKey?: Map<string, Map<string, { min: number; max: number }>>
  ) {
    if (!showEvents || sortedTimes.length === 0) return;

    const minTime = displayMinTime ?? sortedTimes[0];
    const maxTime = displayMaxTime ?? sortedTimes[sortedTimes.length - 1];

    // 모든 이벤트 수집 (티커별 + 공통) - 심볼 및 차트 키 정보와 함께
    const allEvents: Array<EventMarker & { symbol?: string; chartKey?: string; isCommonX?: boolean }> = [];
    
    // 1. X축 공통 이벤트 추가 (모든 차트에 세로선으로 표시)
    if (this.commonEvents.x && this.commonEvents.x.length > 0) {
      // 각 visible 차트에 대해 X축 공통 이벤트 추가
      for (const chartKey of this.state.visibleChartKeys) {
        allEvents.push(...this.commonEvents.x.map(e => ({ 
          ...e, 
          symbol: undefined, 
          chartKey, 
          isCommonX: true // X축 공통 이벤트 표시
        })));
      }
    }
    
    // 2. 차트별 공통 이벤트 추가
    if (this.commonEvents.chart) {
      if (Array.isArray(this.commonEvents.chart)) {
        // 배열 형식: EventMarker[] -> 첫 번째 visibleChartKey를 기본값으로 사용
        const defaultChartKey = this.state.visibleChartKeys[0];
        if (defaultChartKey) {
          allEvents.push(...this.commonEvents.chart.map(e => ({ 
            ...e, 
            chartKey: defaultChartKey, 
            symbol: undefined 
          })));
        }
      } else {
        // 객체 형식: { [key: string]: EventMarker[] }
        // 현재 표시 중인 차트 키에 해당하는 이벤트만 추가
        for (const chartKey of this.state.visibleChartKeys) {
          const events = this.commonEvents.chart[chartKey];
          if (events && events.length > 0) {
            allEvents.push(...events.map(e => ({ ...e, chartKey, symbol: undefined })));
          }
        }
      }
    }
    
    // 3. 활성화된 티커의 이벤트 추가 (심볼 정보 포함)
    // 티커별 이벤트는 각 chartKey별로 수집
    this.dataMap.forEach((value, symbol) => {
      if (!this.state.enabledTickers.has(symbol)) return;
      
      // 각 chartKey별로 이벤트 수집
      for (const chartKey of this.state.visibleChartKeys) {
        const chartDataObj = value.data[chartKey];
        if (chartDataObj && chartDataObj.events && chartDataObj.events.length > 0) {
          // symbol을 명시적으로 덮어쓰기 (이벤트에 이미 symbol이 있어도 티커의 symbol로 설정)
          allEvents.push(...chartDataObj.events.map(e => {
            const eventWithSymbol = { ...e, chartKey };
            (eventWithSymbol as any).symbol = symbol; // 명시적으로 symbol 설정
            return eventWithSymbol;
          }));
        }
      }
    });

    if (allEvents.length === 0) return;

    // 클릭 가능한 이벤트 마커 초기화
    this.eventMarkers = [];

    // 툴팁 그리기 정보 초기화 (render 함수에서 나중에 그림)
    this.eventTooltipsToRender = [];

    // 이벤트를 타입별로 분리
    const rangeEvents: Array<EventMarker & { symbol?: string; chartKey?: string }> = [];
    const xOnlyEvents: Array<(XPointEvent & EventBase) & { symbol?: string; chartKey?: string }> = [];
    const yOnlyEvents: Array<(YPointEvent & EventBase) & { symbol?: string; chartKey?: string }> = [];
    const xyEvents: Array<(XYPointEvent & EventBase) & { symbol?: string; chartKey?: string }> = [];
    const multiPointEvents: Array<(PointEvent & EventBase) & { symbol?: string; chartKey?: string }> = [];
    
    allEvents.forEach(event => {
      if (isRangeEvent(event)) {
        rangeEvents.push(event);
      } else if (isMultiPointEvent(event)) {
        multiPointEvents.push(event);
      } else if (isXPointEvent(event)) {
        xOnlyEvents.push(event);
      } else if (isYPointEvent(event)) {
        yOnlyEvents.push(event);
      } else if (isXYPointEvent(event)) {
        xyEvents.push(event);
      }
    });

    // 0단계: 범위 이벤트 그리기 (배경 영역, 맨 먼저 그려서 다른 요소들 뒤에 표시)
    rangeEvents.forEach(event => {
      if (!isRangeEvent(event)) return;
      
      // 색상 우선순위
      let eventColor = event.color;
      if (!eventColor && event.symbol) {
        const symbolData = this.dataMap.get(event.symbol);
        if (symbolData?.color) {
          eventColor = symbolData.color;
        } else {
          eventColor = this.getTickerColor(event.symbol);
        }
      }
      if (!eventColor) {
        eventColor = this.getDefaultEventColor(true); // 기본 색상 (반투명)
      }
      
      // XY 범위 이벤트 (시간 + 가격 범위)
      if (isXYRangeEvent(event)) {
        const startX = event.startX;
        const endX = event.endX;
        const startY = event.startY;
        const endY = event.endY;
        
        if (startX >= minTime && startX <= maxTime || endX >= minTime && endX <= maxTime || (startX <= minTime && endX >= maxTime)) {
          const x1 = this.getX(Math.max(startX, minTime), minTime, maxTime);
          const x2 = this.getX(Math.min(endX, maxTime), minTime, maxTime);
          
          const chartKey = event.chartKey || this.state.visibleChartKeys[0];
          
          // 해당 차트가 보이지 않으면 그리지 않음
          if (!this.state.visibleChartKeys.includes(chartKey)) {
            return;
          }
          
          const area = chartAreas.find(a => a.key === chartKey);
          
          if (area) {
            // minMaxByChartKey는 drawChartKey에서 계산된 값으로, normalize 모드에 따라 이미 올바른 값을 가짐
            let globalMin = Infinity, globalMax = -Infinity;
            let usedChartKeyRange = false;
            
            // 먼저 minMaxByChartKey에서 찾기 (normalize 모드와 상관없이)
            if (minMaxByChartKey && event.symbol) {
              const chartMinMax = minMaxByChartKey.get(chartKey);
              if (chartMinMax) {
                const symbolMinMax = chartMinMax.get(event.symbol);
                if (symbolMinMax) {
                  globalMin = symbolMinMax.min;
                  globalMax = symbolMinMax.max;
                  usedChartKeyRange = true;
                }
              }
            }
            
            // minMaxByChartKey에서 못 찾은 경우 fallback
            if (!usedChartKeyRange && event.symbol) {
              const symbolData = this.dataMap.get(event.symbol);
              if (symbolData) {
                const chartDataObj = symbolData.data[chartKey];
                if (chartDataObj) {
                  const values = chartDataObj.datas.map(d => d.y).filter(v => v !== null && v !== undefined);
                  if (values.length > 0) {
                    globalMin = Math.min(...values);
                    globalMax = Math.max(...values);
                    usedChartKeyRange = true;
                  }
                }
              }
            }
            
            // symbol이 없거나 데이터를 못 찾은 경우: 전체 범위 사용
            if (!usedChartKeyRange) {
              this.dataMap.forEach((value) => {
                const chartDataObj = value.data[chartKey];
                if (chartDataObj) {
                  const values = chartDataObj.datas.map(d => d.y).filter(v => v !== null && v !== undefined);
                  if (values.length > 0) {
                    globalMin = Math.min(globalMin, ...values);
                    globalMax = Math.max(globalMax, ...values);
                  }
                }
              });
            }
            
            if (globalMin !== Infinity && globalMax !== -Infinity) {
              // 정규화 모드에서는 Y 값을 0-100% 범위로 변환
              let normalizedStartY = startY;
              let normalizedEndY = endY;
              
              if (this.state.normalize === 'rangeNormalize' || this.state.normalize === 'normalize') {
                // startY, endY를 globalMin~globalMax 범위에서 0~100 범위로 변환
                normalizedStartY = ((startY - globalMin) / (globalMax - globalMin)) * 100;
                normalizedEndY = ((endY - globalMin) / (globalMax - globalMin)) * 100;
                // 변환된 값을 다시 0~100 범위의 min/max로 사용
                globalMin = 0;
                globalMax = 100;
              }
              
              // Y 범위가 차트 데이터 범위와 겹치는지 확인
              const rangeMin = Math.min(normalizedStartY, normalizedEndY);
              const rangeMax = Math.max(normalizedStartY, normalizedEndY);
              
              // 범위가 차트 범위와 전혀 겹치지 않으면 그리지 않음
              if (rangeMax < globalMin || rangeMin > globalMax) {
                return;
              }
              
              const y1Raw = this.getY(normalizedStartY, globalMin, globalMax, area.y, area.height);
              const y2Raw = this.getY(normalizedEndY, globalMin, globalMax, area.y, area.height);
              
              // Y 좌표를 차트 영역 내로 제한
              const y1 = Math.max(area.y, Math.min(area.y + area.height, y1Raw));
              const y2 = Math.max(area.y, Math.min(area.y + area.height, y2Raw));
              
              const rectY = Math.min(y1, y2);
              const rectHeight = Math.abs(y2 - y1);
              
              // 호버 체크
              const isHovered = this.hoveredEventMarker !== null && 
                this.hoveredEventMarker.label === event.label &&
                isRangeEvent(this.hoveredEventMarker);
              
              // 스타일 적용
              const fillStyle = this.config.eventRangeFillStyle
                ? (typeof this.config.eventRangeFillStyle === 'function'
                  ? this.config.eventRangeFillStyle(event, isHovered)
                  : this.config.eventRangeFillStyle)
                : (eventColor.includes('rgba') ? eventColor : eventColor + '33');
              
              const strokeStyle = this.config.eventRangeStrokeStyle
                ? (typeof this.config.eventRangeStrokeStyle === 'function'
                  ? this.config.eventRangeStrokeStyle(event)
                  : this.config.eventRangeStrokeStyle)
                : (eventColor.includes('rgba') ? eventColor.replace(/[\d.]+\)$/g, '0.5)') : eventColor);
              
              const lineWidth = this.config.eventRangeLineWidth
                ? (typeof this.config.eventRangeLineWidth === 'function'
                  ? this.config.eventRangeLineWidth(event)
                  : this.config.eventRangeLineWidth)
                : 1;
              
              // 클리핑 적용 (차트 영역 내에만 그리기)
              this.ctx.save();
              this.ctx.beginPath();
              this.ctx.rect(this.chartAreaLeft, area.y, this.chartAreaWidth, area.height);
              this.ctx.clip();
              
              this.ctx.fillStyle = fillStyle;
              this.ctx.fillRect(x1, rectY, x2 - x1, rectHeight);
              
              this.ctx.strokeStyle = strokeStyle;
              this.ctx.lineWidth = lineWidth;
              this.ctx.strokeRect(x1, rectY, x2 - x1, rectHeight);
              
              this.ctx.restore();
              
              // 라벨 (startX, startY 위치 밖에 표시)
              const labelX = x1;
              const labelY = y1; // startY의 실제 화면 위치
              const baseline = startY < endY ? 'top' : 'bottom'; // startY가 작으면 아래쪽이므로 top으로 영역 밖에 표시
              this.drawRangeEventLabel(event, labelX, labelY, eventColor, 'left', baseline);
              
              // 호버 체크
              this.checkRangeEventHover(event, labelX, labelY);
            }
          }
        }
      }
      // X 범위 이벤트 (시간 범위만)
      else if (isXRangeEvent(event)) {
        const startX = event.startX;
        const endX = event.endX;
        
        if (startX >= minTime && startX <= maxTime || endX >= minTime && endX <= maxTime || (startX <= minTime && endX >= maxTime)) {
          const x1 = this.getX(Math.max(startX, minTime), minTime, maxTime);
          const x2 = this.getX(Math.min(endX, maxTime), minTime, maxTime);
          
          // 호버 체크
          const isHovered = this.hoveredEventMarker !== null && 
            this.hoveredEventMarker.label === event.label &&
            isRangeEvent(this.hoveredEventMarker);
          
          // 스타일 적용
          const fillStyle = this.config.eventRangeFillStyle
            ? (typeof this.config.eventRangeFillStyle === 'function'
              ? this.config.eventRangeFillStyle(event, isHovered)
              : this.config.eventRangeFillStyle)
            : (eventColor.includes('rgba') ? eventColor : eventColor + '33');
          
          const strokeStyle = this.config.eventRangeStrokeStyle
            ? (typeof this.config.eventRangeStrokeStyle === 'function'
              ? this.config.eventRangeStrokeStyle(event)
              : this.config.eventRangeStrokeStyle)
            : (eventColor.includes('rgba') ? eventColor.replace(/[\d.]+\)$/g, '0.5)') : eventColor);
          
          const lineWidth = this.config.eventRangeLineWidth
            ? (typeof this.config.eventRangeLineWidth === 'function'
              ? this.config.eventRangeLineWidth(event)
              : this.config.eventRangeLineWidth)
            : 1;
          
          // 전체 차트 높이에 걸쳐 표시
          chartAreas.forEach(area => {
            // 클리핑 적용 (차트 영역 내에만 그리기)
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.rect(this.chartAreaLeft, area.y, this.chartAreaWidth, area.height);
            this.ctx.clip();
            
            this.ctx.fillStyle = fillStyle;
            this.ctx.fillRect(x1, area.y, x2 - x1, area.height);
            
            this.ctx.strokeStyle = strokeStyle;
            this.ctx.lineWidth = lineWidth;
            this.ctx.strokeRect(x1, area.y, x2 - x1, area.height);
            
            this.ctx.restore();
          });
          
          // 라벨 (startX 위치, 차트 안쪽에 표시)
          const labelX = x1;
          const labelY = chartAreas[0].y;
          this.drawRangeEventLabel(event, labelX, labelY, eventColor, 'left');
          
          // 호버 체크
          this.checkRangeEventHover(event, labelX, labelY);
        }
      }
      // Y 범위 이벤트 (가격 범위만)
      else if (isYRangeEvent(event)) {
        const startY = event.startY;
        const endY = event.endY;
        
        const chartKey = event.chartKey || this.state.visibleChartKeys[0];
        
        // 해당 차트가 보이지 않으면 그리지 않음
        if (!this.state.visibleChartKeys.includes(chartKey)) {
          return;
        }
        
        const area = chartAreas.find(a => a.key === chartKey);
        
        if (area) {
          // minMaxByChartKey는 drawChartKey에서 계산된 값으로, normalize 모드에 따라 이미 올바른 값을 가짐
          let globalMin = Infinity, globalMax = -Infinity;
          let usedChartKeyRange = false;
          
          // 먼저 minMaxByChartKey에서 찾기 (normalize 모드와 상관없이)
          if (minMaxByChartKey && event.symbol) {
            const chartMinMax = minMaxByChartKey.get(chartKey);
            if (chartMinMax) {
              const symbolMinMax = chartMinMax.get(event.symbol);
              if (symbolMinMax) {
                globalMin = symbolMinMax.min;
                globalMax = symbolMinMax.max;
                usedChartKeyRange = true;
              }
            }
          }
          
          // minMaxByChartKey에서 못 찾은 경우 fallback
          if (!usedChartKeyRange && event.symbol) {
            const symbolData = this.dataMap.get(event.symbol);
            if (symbolData) {
              const chartDataObj = symbolData.data[chartKey];
              if (chartDataObj) {
                const values = chartDataObj.datas.map(d => d.y).filter(v => v !== null && v !== undefined);
                if (values.length > 0) {
                  globalMin = Math.min(...values);
                  globalMax = Math.max(...values);
                  usedChartKeyRange = true;
                }
              }
            }
          }
          
          // symbol이 없거나 데이터를 못 찾은 경우: 전체 범위 사용
          if (!usedChartKeyRange) {
            this.dataMap.forEach((value) => {
              const chartDataObj = value.data[chartKey];
              if (chartDataObj) {
                const values = chartDataObj.datas.map(d => d.y).filter(v => v !== null && v !== undefined);
                if (values.length > 0) {
                  globalMin = Math.min(globalMin, ...values);
                  globalMax = Math.max(globalMax, ...values);
                }
              }
            });
          }
          
          if (globalMin !== Infinity && globalMax !== -Infinity) {
            // 정규화 모드에서는 Y 값을 0-100% 범위로 변환
            let normalizedStartY = startY;
            let normalizedEndY = endY;
            
            if (this.state.normalize === 'rangeNormalize' || this.state.normalize === 'normalize') {
              // startY, endY를 globalMin~globalMax 범위에서 0~100 범위로 변환
              normalizedStartY = ((startY - globalMin) / (globalMax - globalMin)) * 100;
              normalizedEndY = ((endY - globalMin) / (globalMax - globalMin)) * 100;
              // 변환된 값을 다시 0~100 범위의 min/max로 사용
              globalMin = 0;
              globalMax = 100;
            }
            
            // Y 범위가 차트 데이터 범위와 겹치는지 확인
            const rangeMin = Math.min(normalizedStartY, normalizedEndY);
            const rangeMax = Math.max(normalizedStartY, normalizedEndY);
            
            // 범위가 차트 범위와 전혀 겹치지 않으면 그리지 않음
            if (rangeMax < globalMin || rangeMin > globalMax) {
              return;
            }
            
            const y1Raw = this.getY(normalizedStartY, globalMin, globalMax, area.y, area.height);
            const y2Raw = this.getY(normalizedEndY, globalMin, globalMax, area.y, area.height);
            
            // Y 좌표를 차트 영역 내로 제한
            const y1 = Math.max(area.y, Math.min(area.y + area.height, y1Raw));
            const y2 = Math.max(area.y, Math.min(area.y + area.height, y2Raw));
            
            const rectY = Math.min(y1, y2);
            const rectHeight = Math.abs(y2 - y1);
            
            // 호버 체크
            const isHovered = this.hoveredEventMarker !== null && 
              this.hoveredEventMarker.label === event.label &&
              isRangeEvent(this.hoveredEventMarker);
            
            // 스타일 적용
            const fillStyle = this.config.eventRangeFillStyle
              ? (typeof this.config.eventRangeFillStyle === 'function'
                ? this.config.eventRangeFillStyle(event, isHovered)
                : this.config.eventRangeFillStyle)
              : (eventColor.includes('rgba') ? eventColor : eventColor + '33');
            
            const strokeStyle = this.config.eventRangeStrokeStyle
              ? (typeof this.config.eventRangeStrokeStyle === 'function'
                ? this.config.eventRangeStrokeStyle(event)
                : this.config.eventRangeStrokeStyle)
              : (eventColor.includes('rgba') ? eventColor.replace(/[\d.]+\)$/g, '0.5)') : eventColor);
            
            const lineWidth = this.config.eventRangeLineWidth
              ? (typeof this.config.eventRangeLineWidth === 'function'
                ? this.config.eventRangeLineWidth(event)
                : this.config.eventRangeLineWidth)
              : 1;
            
            // 클리핑 적용 (차트 영역 내에만 그리기)
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.rect(this.chartAreaLeft, area.y, this.chartAreaWidth, area.height);
            this.ctx.clip();
            
            // 전체 X 범위에 걸쳐 표시
            this.ctx.fillStyle = fillStyle;
            this.ctx.fillRect(this.chartAreaLeft, rectY, this.chartAreaWidth, rectHeight);
            
            this.ctx.strokeStyle = strokeStyle;
            this.ctx.lineWidth = lineWidth;
            this.ctx.strokeRect(this.chartAreaLeft, rectY, this.chartAreaWidth, rectHeight);
            
            this.ctx.restore();
            
            // 라벨 (startY 위치 밖에 표시)
            const labelX = this.chartAreaLeft;
            const labelY = y1; // startY의 실제 화면 위치 (클램핑됨)
            
            // baseline 결정: 클램핑 여부와 startY/endY 관계를 고려
            let baseline: CanvasTextBaseline;
            if (y1Raw < area.y) {
              // startY가 차트 위로 벗어남 → 텍스트를 아래로
              baseline = 'top';
            } else if (y1Raw > area.y + area.height) {
              // startY가 차트 아래로 벗어남 → 텍스트를 위로
              baseline = 'bottom';
            } else {
              // startY가 차트 내부 → 원래 로직대로
              baseline = startY < endY ? 'top' : 'bottom';
            }
            
            this.drawRangeEventLabel(event, labelX, labelY, eventColor, 'left', baseline);
            
            // 호버 체크
            this.checkRangeEventHover(event, labelX, labelY);
          }
        }
      }
    });

    // 0.5단계: 다중 포인트 이벤트 그리기 (PointEvent - 여러 점을 연결한 도형/선)
    multiPointEvents.forEach(event => {
      if (!isMultiPointEvent(event)) return;
      
      // 색상 우선순위
      let eventColor = event.color;
      if (!eventColor && event.symbol) {
        const symbolData = this.dataMap.get(event.symbol);
        if (symbolData?.color) {
          eventColor = symbolData.color;
        } else {
          eventColor = this.getTickerColor(event.symbol);
        }
      }
      if (!eventColor) {
        eventColor = this.getDefaultEventColor();
      }
      
      const chartKey = event.chartKey || this.state.visibleChartKeys[0];
      
      // 해당 차트가 보이지 않으면 그리지 않음
      if (!this.state.visibleChartKeys.includes(chartKey)) {
        return;
      }
      
      const area = chartAreas.find(a => a.key === chartKey);
      if (!area) return;
      
      // 차트 데이터 범위 계산
      // minMaxByChartKey는 drawChartKey에서 계산된 값으로, normalize 모드에 따라 이미 올바른 값을 가짐
      let globalMin = Infinity, globalMax = -Infinity;
      let usedChartKeyRange = false;
      
      // 먼저 minMaxByChartKey에서 찾기 (normalize 모드와 상관없이)
      if (minMaxByChartKey && event.symbol) {
        const chartMinMax = minMaxByChartKey.get(chartKey);
        if (chartMinMax) {
          const symbolMinMax = chartMinMax.get(event.symbol);
          if (symbolMinMax) {
            globalMin = symbolMinMax.min;
            globalMax = symbolMinMax.max;
            usedChartKeyRange = true;
          }
        }
      }
      
      // minMaxByChartKey에서 못 찾은 경우 fallback
      if (!usedChartKeyRange && event.symbol) {
        const symbolData = this.dataMap.get(event.symbol);
        if (symbolData) {
          const chartDataObj = symbolData.data[chartKey];
          if (chartDataObj) {
            const values = chartDataObj.datas.map(d => d.y).filter(v => v !== null && v !== undefined);
            if (values.length > 0) {
              globalMin = Math.min(...values);
              globalMax = Math.max(...values);
              usedChartKeyRange = true;
            }
          }
        }
      }
      
      // symbol이 없거나 데이터를 못 찾은 경우: 전체 범위 사용
      if (!usedChartKeyRange) {
        this.dataMap.forEach((value) => {
          const chartDataObj = value.data[chartKey];
          if (chartDataObj) {
            const values = chartDataObj.datas.map(d => d.y).filter(v => v !== null && v !== undefined);
            if (values.length > 0) {
              globalMin = Math.min(globalMin, ...values);
              globalMax = Math.max(globalMax, ...values);
            }
          }
        });
      }
      
      if (globalMin === Infinity || globalMax === -Infinity) return;
      
      // 정규화 모드에서는 Y 값을 0-100% 범위로 변환
      const originalMin = globalMin;
      const originalMax = globalMax;
      
      if (this.state.normalize === 'rangeNormalize' || this.state.normalize === 'normalize') {
        globalMin = 0;
        globalMax = 100;
      }
      
      // 클리핑 적용
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.rect(this.chartAreaLeft, area.y, this.chartAreaWidth, area.height);
      this.ctx.clip();
      
      // 스타일 설정
      const strokeStyle = event.strokeStyle || eventColor;
      const fillStyle = event.fillStyle;
      
      this.ctx.strokeStyle = strokeStyle;
      this.ctx.lineWidth = 2;
      this.ctx.lineJoin = 'round';
      this.ctx.lineCap = 'round';
      
      // 경로 그리기
      this.ctx.beginPath();
      
      event.points.forEach((point, index) => {
        const x = this.getX(point.x, minTime, maxTime);
        
        // 정규화 모드에서는 Y 값을 변환
        let normalizedY = point.y;
        if (this.state.normalize === 'rangeNormalize' || this.state.normalize === 'normalize') {
          normalizedY = ((point.y - originalMin) / (originalMax - originalMin)) * 100;
        }
        
        const y = this.getY(normalizedY, globalMin, globalMax, area.y, area.height);
        
        if (index === 0) {
          this.ctx.moveTo(x, y);
        } else {
          if (event.smooth) {
            // 부드러운 베지에 곡선
            const prevPoint = event.points[index - 1];
            const prevX = this.getX(prevPoint.x, minTime, maxTime);
            
            // 정규화 모드에서는 Y 값을 변환
            let prevNormalizedY = prevPoint.y;
            if (this.state.normalize === 'rangeNormalize' || this.state.normalize === 'normalize') {
              prevNormalizedY = ((prevPoint.y - originalMin) / (originalMax - originalMin)) * 100;
            }
            
            const prevY = this.getY(prevNormalizedY, globalMin, globalMax, area.y, area.height);
            
            // 제어점 계산 (라인 그래프와 동일한 방식)
            const cp1x = prevX + (x - prevX) / 3;
            const cp1y = prevY;
            const cp2x = prevX + (x - prevX) * 2 / 3;
            const cp2y = y;
            
            this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
          } else {
            this.ctx.lineTo(x, y);
          }
        }
      });
      
      // 채우기 (fillStyle이 있으면)
      if (fillStyle) {
        this.ctx.closePath();
        this.ctx.fillStyle = fillStyle;
        this.ctx.fill();
      }
      
      // 선 그리기
      if (strokeStyle) {
        this.ctx.stroke();
      }
      
      // 포인트 마커 그리기 및 호버 영역 등록
      // fillStyle이 없는 경우에만 개별 포인트를 호버 영역으로 등록
      if (!fillStyle) {
        event.points.forEach((point, index) => {
          const x = this.getX(point.x, minTime, maxTime);
          
          // 정규화 모드에서는 Y 값을 변환
          let normalizedY = point.y;
          if (this.state.normalize === 'rangeNormalize' || this.state.normalize === 'normalize') {
            normalizedY = ((point.y - originalMin) / (originalMax - originalMin)) * 100;
          }
          
          const y = this.getY(normalizedY, globalMin, globalMax, area.y, area.height);
          
          const pointEvent = { 
            ...event, 
            x: point.x, 
            y: point.y,
            pointIndex: index 
          } as any;
          
          this.eventMarkers.push({
            event: pointEvent,
            x,
            y,
            radius: 8
          });
          
          // 호버 시 툴팁 정보 저장
          const isHovered = this.hoveredEventMarker !== null && 
            this.hoveredEventMarker.label === event.label &&
            (this.hoveredEventMarker as any).x === point.x &&
            (this.hoveredEventMarker as any).y === point.y;
          
          if (isHovered) {
            this.eventTooltipsToRender.push({ 
              event: pointEvent, 
              x, 
              y: y - 10, 
              pointsDown: false 
            });
          }
        });
      }
      
      // 포인트 타입 마커 그리기
      event.points.forEach((point, index) => {
        const x = this.getX(point.x, minTime, maxTime);
        
        // 정규화 모드에서는 Y 값을 변환
        let normalizedY = point.y;
        if (this.state.normalize === 'rangeNormalize' || this.state.normalize === 'normalize') {
          normalizedY = ((point.y - originalMin) / (originalMax - originalMin)) * 100;
        }
        
        const y = this.getY(normalizedY, globalMin, globalMax, area.y, area.height);
        
        if (point.xPointType || point.yPointType) {
          const pointType = point.xPointType || point.yPointType || 'dot';
          
          if (pointType === 'dot') {
            this.ctx.fillStyle = strokeStyle;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fill();
          } else if (pointType === 'rightArrow') {
            // 오른쪽 화살표: 끝이 x, y를 가리킴
            this.ctx.fillStyle = strokeStyle;
            this.ctx.beginPath();
            this.ctx.moveTo(x - 8, y - 4);
            this.ctx.lineTo(x, y);
            this.ctx.lineTo(x - 8, y + 4);
            this.ctx.closePath();
            this.ctx.fill();
          } else if (pointType === 'leftArrow') {
            // 왼쪽 화살표: 끝이 x, y를 가리킴
            this.ctx.fillStyle = strokeStyle;
            this.ctx.beginPath();
            this.ctx.moveTo(x + 8, y - 4);
            this.ctx.lineTo(x, y);
            this.ctx.lineTo(x + 8, y + 4);
            this.ctx.closePath();
            this.ctx.fill();
          } else if (pointType === 'rightArrowDot') {
            // 오른쪽 화살표 + 점 (►•): 화살표 끝이 x, y를 가리킴
            this.ctx.fillStyle = strokeStyle;
            this.ctx.beginPath();
            this.ctx.moveTo(x - 6, y - 4);
            this.ctx.lineTo(x, y);
            this.ctx.lineTo(x - 6, y + 4);
            this.ctx.closePath();
            this.ctx.fill();
            // 점 (화살표 오른쪽에)
            this.ctx.beginPath();
            this.ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            this.ctx.fill();
          } else if (pointType === 'leftArrowDot') {
            // 왼쪽 화살표 + 점 (•◄): 화살표 끝이 x, y를 가리킴
            this.ctx.fillStyle = strokeStyle;
            this.ctx.beginPath();
            this.ctx.moveTo(x + 6, y - 4);
            this.ctx.lineTo(x, y);
            this.ctx.lineTo(x + 6, y + 4);
            this.ctx.closePath();
            this.ctx.fill();
            // 점 (화살표 왼쪽에)
            this.ctx.beginPath();
            this.ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            this.ctx.fill();
          } else if (pointType === 'rightArrowLine') {
            // 오른쪽 화살표 + 선 (►|): 화살표 끝이 x, y를 가리킴
            this.ctx.fillStyle = strokeStyle;
            this.ctx.beginPath();
            this.ctx.moveTo(x - 6, y - 4);
            this.ctx.lineTo(x, y);
            this.ctx.lineTo(x - 6, y + 4);
            this.ctx.closePath();
            this.ctx.fill();
            // 세로선 (화살표 오른쪽에)
            this.ctx.strokeStyle = strokeStyle;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y - 5);
            this.ctx.lineTo(x, y + 5);
            this.ctx.stroke();
          } else if (pointType === 'leftArrowLine') {
            // 왼쪽 화살표 + 선 (|◄): 화살표 끝이 x, y를 가리킴
            this.ctx.fillStyle = strokeStyle;
            this.ctx.beginPath();
            this.ctx.moveTo(x + 6, y - 4);
            this.ctx.lineTo(x, y);
            this.ctx.lineTo(x + 6, y + 4);
            this.ctx.closePath();
            this.ctx.fill();
            // 세로선 (화살표 왼쪽에)
            this.ctx.strokeStyle = strokeStyle;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y - 5);
            this.ctx.lineTo(x, y + 5);
            this.ctx.stroke();
          }
        }
      });
      
      this.ctx.restore();
      
      // fillStyle이 있는 경우: 라벨 영역만 호버/클릭 가능
      // fillStyle이 없는 경우: 개별 포인트 호버/클릭 가능 (이미 위에서 등록됨)
      if (fillStyle && event.points.length > 0) {
        const firstPoint = event.points[0];
        const labelX = this.getX(firstPoint.x, minTime, maxTime);
        
        // 정규화 모드에서는 Y 값을 변환
        let normalizedY = firstPoint.y;
        if (this.state.normalize === 'rangeNormalize' || this.state.normalize === 'normalize') {
          normalizedY = ((firstPoint.y - originalMin) / (originalMax - originalMin)) * 100;
        }
        
        const labelY = this.getY(normalizedY, globalMin, globalMax, area.y, area.height);
        
        // 라벨 포맷 적용
        const labelFormatted = this.config.eventLabelFormat 
          ? this.config.eventLabelFormat(event)
          : event.label;
        const labelText = this.applyFormatResult(labelFormatted);
        
        this.ctx.fillStyle = strokeStyle;
        this.ctx.font = 'bold 11px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'bottom';
        const textMetrics = this.ctx.measureText(labelText);
        this.ctx.fillText(labelText, labelX + 5, labelY - 5);
        
        // 라벨 영역을 호버 영역으로 등록
        this.eventMarkers.push({
          event,
          x: labelX + 5 + textMetrics.width / 2,
          y: labelY - 5 - 6, // 텍스트 높이 고려
          radius: Math.max(textMetrics.width / 2, 10)
        });
        
        // 호버 시 툴팁 정보 저장
        const isHovered = this.hoveredEventMarker !== null && 
          this.hoveredEventMarker.label === event.label;
        
        if (isHovered) {
          this.eventTooltipsToRender.push({ 
            event, 
            x: labelX + 5 + textMetrics.width / 2, 
            y: labelY - 20, 
            pointsDown: false 
          });
        }
      } else if (event.points.length > 0) {
        // fillStyle이 없는 경우에도 라벨 그리기
        const firstPoint = event.points[0];
        const labelX = this.getX(firstPoint.x, minTime, maxTime);
        
        // 정규화 모드에서는 Y 값을 변환
        let normalizedY = firstPoint.y;
        if (this.state.normalize === 'rangeNormalize' || this.state.normalize === 'normalize') {
          normalizedY = ((firstPoint.y - originalMin) / (originalMax - originalMin)) * 100;
        }
        
        const labelY = this.getY(normalizedY, globalMin, globalMax, area.y, area.height);
        
        // 라벨 포맷 적용
        const labelFormatted = this.config.eventLabelFormat 
          ? this.config.eventLabelFormat(event)
          : event.label;
        const labelText = this.applyFormatResult(labelFormatted);
        
        this.ctx.fillStyle = strokeStyle;
        this.ctx.font = 'bold 11px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'bottom';
        this.ctx.fillText(labelText, labelX + 5, labelY - 5);
      }
    });

    // 1단계: X-only 이벤트 그리기 (세로 라인)
    xOnlyEvents.forEach(event => {
      // 색상 우선순위: 1. 이벤트 자체 color, 2. 심볼 color, 3. 심볼 할당 색상, 4. 기본 색상
      let eventColor = event.color;
      if (!eventColor && event.symbol) {
        const symbolData = this.dataMap.get(event.symbol);
        if (symbolData?.color) {
          eventColor = symbolData.color;
        } else {
          eventColor = this.getTickerColor(event.symbol);
        }
      }
      if (!eventColor) {
        eventColor = this.getDefaultEventColor(); // 최종 기본 색상
      }

      // X 값 계산
      const xTime = event.x;
      const eventChartKey = event.chartKey;
      const isCommonX = (event as any).isCommonX; // 공통 X 이벤트 여부

      // X만 있음 (세로 라인)
      if (xTime >= minTime && xTime <= maxTime) {
          // 공통 X 이벤트인 경우: 모든 차트에 세로선, 라벨은 첫 번째 차트에만
          // 일반 X 이벤트인 경우: 해당 차트에만 세로선과 라벨
          
          if (isCommonX) {
            // 공통 X 이벤트: 모든 visible 차트에 세로선 그리기
            const x = this.getX(xTime, minTime, maxTime);
            
            // 스타일 적용
            const strokeStyle = this.config.eventXStrokeStyle
              ? (typeof this.config.eventXStrokeStyle === 'function' 
                ? this.config.eventXStrokeStyle(event) 
                : this.config.eventXStrokeStyle)
              : eventColor;
            const lineWidth = this.config.eventXLineWidth
              ? (typeof this.config.eventXLineWidth === 'function' 
                ? this.config.eventXLineWidth(event) 
                : this.config.eventXLineWidth)
              : 2;
            const lineDash = this.config.eventXLineDash
              ? (typeof this.config.eventXLineDash === 'function' 
                ? this.config.eventXLineDash(event) 
                : this.config.eventXLineDash)
              : [];
            
            this.ctx.strokeStyle = strokeStyle;
            this.ctx.lineWidth = lineWidth;
            this.ctx.setLineDash(lineDash);
            
            // 모든 차트 영역에 세로선 그리기
            chartAreas.forEach(area => {
              this.ctx.beginPath();
              this.ctx.moveTo(x, area.y);
              this.ctx.lineTo(x, area.y + area.height);
              this.ctx.stroke();
            });
            
            this.ctx.setLineDash([]);

            // 라벨은 첫 번째 차트에만 표시
            const firstArea = chartAreas[0];
            if (firstArea && eventChartKey === firstArea.key) {
              // 레이블 포맷 적용 (X-only 세로 라인)
              const labelFormatted = this.config.eventLabelFormat 
                ? this.config.eventLabelFormat(event)
                : event.label;
              const labelText = this.applyFormatResult(labelFormatted);

              // 레이블 위치 계산 (90도 회전하여 가로로 눕힘, 차트 안쪽에 표시)
              const labelY = firstArea.y; // 첫 번째 차트 영역 안쪽
              this.ctx.save();
              this.ctx.translate(x, labelY);
              this.ctx.rotate(Math.PI / 2); // 90도 시계방향 회전 (가로로 눕힘)
              this.ctx.fillStyle = strokeStyle;
              this.ctx.font = 'bold 11px Arial';
              this.ctx.textAlign = 'left'; // 왼쪽 정렬로 텍스트가 차트 안쪽에 위치
              this.ctx.textBaseline = 'top'; // 위쪽 정렬
              const textMetrics = this.ctx.measureText(labelText);
              this.ctx.fillText(labelText, 5, 0); // 양수 오프셋으로 선에서 떨어뜨림
              this.ctx.restore();
              
              // 호버 가능한 영역 저장 (전체 차트 높이)
              const lineHitWidth = 10;
              this.eventMarkers.push({ 
                event,
                x: x, 
                y: (chartAreas[0].y + chartAreas[chartAreas.length - 1].y + chartAreas[chartAreas.length - 1].height) / 2, // 전체 차트 중앙
                radius: lineHitWidth / 2
              });
              
              // 호버 시 툴팁 정보 저장
              const isHovered = this.hoveredEventMarker !== null && 
                this.hoveredEventMarker.label === event.label &&
                isXPointEvent(this.hoveredEventMarker) &&
                this.hoveredEventMarker.x === event.x;
              if (isHovered) {
                this.eventTooltipsToRender.push({ event, x, y: labelY + 20, pointsDown: true });
              }
            }
          } else {
            // 일반 X 이벤트: 해당 차트에만 세로선과 라벨
            const chartKey = eventChartKey || this.state.visibleChartKeys[0];
            
            // 해당 차트가 보이지 않으면 그리지 않음
            if (!this.state.visibleChartKeys.includes(chartKey)) {
              return;
            }
            
            const area = chartAreas.find(a => a.key === chartKey);
            if (!area) {
              return;
            }
            
            const x = this.getX(xTime, minTime, maxTime);
            
            // 스타일 적용
            const strokeStyle = this.config.eventXStrokeStyle
              ? (typeof this.config.eventXStrokeStyle === 'function' 
                ? this.config.eventXStrokeStyle(event) 
                : this.config.eventXStrokeStyle)
              : eventColor;
            const lineWidth = this.config.eventXLineWidth
              ? (typeof this.config.eventXLineWidth === 'function' 
                ? this.config.eventXLineWidth(event) 
                : this.config.eventXLineWidth)
              : 2;
            const lineDash = this.config.eventXLineDash
              ? (typeof this.config.eventXLineDash === 'function' 
                ? this.config.eventXLineDash(event) 
                : this.config.eventXLineDash)
              : [];
            
            // 해당 차트 영역에만 세로선 그리기
            this.ctx.strokeStyle = strokeStyle;
            this.ctx.lineWidth = lineWidth;
            this.ctx.setLineDash(lineDash);
            this.ctx.beginPath();
            this.ctx.moveTo(x, area.y);
            this.ctx.lineTo(x, area.y + area.height);
            this.ctx.stroke();
            this.ctx.setLineDash([]);

            // 레이블 포맷 적용 (X-only 세로 라인)
            const labelFormatted = this.config.eventLabelFormat 
              ? this.config.eventLabelFormat(event)
              : event.label;
            const labelText = this.applyFormatResult(labelFormatted);

            // 레이블 위치 계산 (90도 회전하여 가로로 눕힘, 차트 안쪽에 표시)
            const labelY = area.y; // 해당 차트 영역 안쪽
            this.ctx.save();
            this.ctx.translate(x, labelY);
            this.ctx.rotate(Math.PI / 2); // 90도 시계방향 회전 (가로로 눕힘)
            this.ctx.fillStyle = strokeStyle;
            this.ctx.font = 'bold 11px Arial';
            this.ctx.textAlign = 'left'; // 왼쪽 정렬로 텍스트가 차트 안쪽에 위치
            this.ctx.textBaseline = 'top'; // 위쪽 정렬
            const textMetrics = this.ctx.measureText(labelText);
            this.ctx.fillText(labelText, 5, 0); // 양수 오프셋으로 선에서 떨어뜨림
            this.ctx.restore();
            
            // 호버 가능한 영역 저장 (세로 라인 영역 - 좁은 폭)
            const lineHitWidth = 10;
            this.eventMarkers.push({ 
              event,
              x: x, 
              y: area.y + area.height / 2, // 해당 차트 중앙
              radius: lineHitWidth / 2
            });
            
            // 호버 시 툴팁 정보 저장
            const isHovered = this.hoveredEventMarker !== null && 
              this.hoveredEventMarker.label === event.label &&
              isXPointEvent(this.hoveredEventMarker) &&
              this.hoveredEventMarker.x === event.x;
            if (isHovered) {
              this.eventTooltipsToRender.push({ event, x, y: labelY + 20, pointsDown: true });
            }
          }
      }
    });

    // 2단계: Y-only 이벤트 그리기 (가로 라인)
    yOnlyEvents.forEach(event => {
      // 색상 우선순위
      let eventColor = event.color;
      if (!eventColor && event.symbol) {
        const symbolData = this.dataMap.get(event.symbol);
        if (symbolData?.color) {
          eventColor = symbolData.color;
        } else {
          eventColor = this.getTickerColor(event.symbol);
        }
      }
      if (!eventColor) {
        eventColor = this.getDefaultEventColor();
      }

      const yValue = event.y;
      const eventChartKey = event.chartKey;

      // Y만 있음 (가로 라인)
      if (yValue !== undefined) {
        const chartKey = event.chartKey || this.state.visibleChartKeys[0];
        const area = chartAreas.find(a => a.key === chartKey);
        
        if (area) {
          // Y 값을 화면 좌표로 변환
          // minMaxByChartKey는 drawChartKey에서 계산된 값으로, normalize 모드에 따라 이미 올바른 값을 가짐
          let globalMin = Infinity, globalMax = -Infinity;
          let usedChartKeyRange = false;
          
          // 먼저 minMaxByChartKey에서 찾기 (normalize 모드와 상관없이)
          if (minMaxByChartKey && event.symbol) {
            const chartMinMax = minMaxByChartKey.get(chartKey);
            if (chartMinMax) {
              const symbolMinMax = chartMinMax.get(event.symbol);
              if (symbolMinMax) {
                globalMin = symbolMinMax.min;
                globalMax = symbolMinMax.max;
                usedChartKeyRange = true;
              }
            }
          }
          
          // minMaxByChartKey에서 못 찾은 경우 fallback
          if (!usedChartKeyRange && event.symbol) {
            const symbolData = this.dataMap.get(event.symbol);
            if (symbolData) {
              const chartDataObj = symbolData.data[chartKey];
              if (chartDataObj) {
                const values = chartDataObj.datas.map(d => d.y).filter(v => v !== null && v !== undefined);
                if (values.length > 0) {
                  globalMin = Math.min(...values);
                  globalMax = Math.max(...values);
                  usedChartKeyRange = true;
                }
              }
            }
          }
          
          // symbol이 없거나 데이터를 못 찾은 경우: 전체 범위 사용
          if (!usedChartKeyRange) {
            this.dataMap.forEach((value) => {
              const chartDataObj = value.data[chartKey];
              if (chartDataObj) {
                const values = chartDataObj.datas.map(d => d.y).filter(v => v !== null && v !== undefined);
                if (values.length > 0) {
                  globalMin = Math.min(globalMin, ...values);
                  globalMax = Math.max(globalMax, ...values);
                }
              }
            });
          }
          
          if (globalMin !== Infinity && globalMax !== -Infinity) {
            // 정규화 모드에서는 Y 값을 0-100% 범위로 변환
            let normalizedYValue = yValue;
            if (this.state.normalize === 'rangeNormalize' || this.state.normalize === 'normalize') {
              // yValue를 globalMin~globalMax 범위에서 0~100 범위로 변환
              normalizedYValue = ((yValue - globalMin) / (globalMax - globalMin)) * 100;
              // 변환된 값을 다시 0~100 범위의 min/max로 사용
              globalMin = 0;
              globalMax = 100;
            }
            
            // Y 값이 범위를 벗어나도 표시 (가로선은 항상 보이는 것이 유용)
            const y = this.getY(normalizedYValue, globalMin, globalMax, area.y, area.height);
            
            // 스타일 적용
            const strokeStyle = this.config.eventYStrokeStyle
              ? (typeof this.config.eventYStrokeStyle === 'function' 
                ? this.config.eventYStrokeStyle(event) 
                : this.config.eventYStrokeStyle)
              : eventColor;
            const lineWidth = this.config.eventYLineWidth
              ? (typeof this.config.eventYLineWidth === 'function' 
                ? this.config.eventYLineWidth(event) 
                : this.config.eventYLineWidth)
              : 2;
            const lineDash = this.config.eventYLineDash
              ? (typeof this.config.eventYLineDash === 'function' 
                ? this.config.eventYLineDash(event) 
                : this.config.eventYLineDash)
              : [5, 5];
            
            this.ctx.strokeStyle = strokeStyle;
            this.ctx.lineWidth = lineWidth;
            this.ctx.setLineDash(lineDash);
            this.ctx.beginPath();
            this.ctx.moveTo(this.chartAreaLeft, y);
            this.ctx.lineTo(this.getChartRight(), y);
            this.ctx.stroke();
            this.ctx.setLineDash([]);

            // 레이블 포맷 적용 (Y-only 가로 라인)
            const labelFormatted = this.config.eventLabelFormat 
              ? this.config.eventLabelFormat(event)
              : event.label;
            const labelText = this.applyFormatResult(labelFormatted);

            this.ctx.fillStyle = strokeStyle;
            this.ctx.font = 'bold 11px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'middle';
            const labelX = this.chartAreaLeft;
            const textMetrics = this.ctx.measureText(labelText);
            this.ctx.fillText(labelText, labelX, y);
            
            // 호버 가능한 영역 저장 (가로 라인 영역 - 좁은 높이)
            // 가로 라인이므로 Y축 방향으로는 좁게, X축 방향으로는 차트 전체 너비로 설정
            const lineHitHeight = 10; // 가로 라인 클릭 가능 영역 높이 (상하 5px씩)
            this.eventMarkers.push({ 
              event, 
              x: (this.chartAreaLeft + this.getChartRight()) / 2, // 차트 중앙
              y: y, 
              radius: lineHitHeight / 2 // 좁은 높이로 설정
            });
            
            // 호버 시 툴팁 표시
            const isHovered = this.hoveredEventMarker !== null && 
              this.hoveredEventMarker.label === event.label &&
              isYPointEvent(this.hoveredEventMarker) &&
              this.hoveredEventMarker.y === event.y;
            if (isHovered) {
              this.eventTooltipsToRender.push({ event, x: labelX + textMetrics.width / 2, y, pointsDown: true });
            }
          }
        }
      }
    });

    // 3단계: XY 포인트 마커 그리기 (맨 나중에 그려서 툴팁이 위에 표시되도록)
    xyEvents.forEach(event => {
      // 색상 우선순위
      let eventColor = event.color;
      if (!eventColor && event.symbol) {
        const symbolData = this.dataMap.get(event.symbol);
        if (symbolData?.color) {
          eventColor = symbolData.color;
        } else {
          eventColor = this.getTickerColor(event.symbol);
        }
      }
      if (!eventColor) {
        eventColor = this.getDefaultEventColor();
      }

      const xTime = event.x;
      const yValue = event.y;
      const eventChartKey = event.chartKey;

      // X와 Y 모두 있음 (포인트 마커)
      if (xTime !== undefined && yValue !== undefined) {
        if (xTime >= minTime && xTime <= maxTime) {
          const chartKey = event.chartKey || this.state.visibleChartKeys[0];
          const area = chartAreas.find(a => a.key === chartKey);
          
          if (area) {
            // Y 값을 화면 좌표로 변환
            // minMaxByChartKey는 drawChartKey에서 계산된 값으로, normalize 모드에 따라 이미 올바른 값을 가짐
            // - normalize OFF: 모든 티커의 global min/max
            // - normalize ON: 각 티커의 개별 min/max
            let globalMin = Infinity, globalMax = -Infinity;
            let usedChartKeyRange = false;
            
            // 먼저 minMaxByChartKey에서 찾기 (normalize 모드와 상관없이)
            if (minMaxByChartKey && event.symbol) {
              const chartMinMax = minMaxByChartKey.get(chartKey);
              if (chartMinMax) {
                const symbolMinMax = chartMinMax.get(event.symbol);
                if (symbolMinMax) {
                  globalMin = symbolMinMax.min;
                  globalMax = symbolMinMax.max;
                  usedChartKeyRange = true;
                }
              }
            }
            
            // minMaxByChartKey에서 못 찾은 경우 fallback
            if (!usedChartKeyRange && event.symbol) {
              const symbolData = this.dataMap.get(event.symbol);
              if (symbolData) {
                const chartDataObj = symbolData.data[chartKey];
                if (chartDataObj) {
                  const values = chartDataObj.datas.map(d => d.y).filter(v => v !== null && v !== undefined);
                  if (values.length > 0) {
                    globalMin = Math.min(...values);
                    globalMax = Math.max(...values);
                    usedChartKeyRange = true;
                  }
                }
              }
            }
            
            // symbol이 없거나 데이터를 못 찾은 경우: 전체 범위 사용
            if (!usedChartKeyRange) {
              globalMin = Infinity;
              globalMax = -Infinity;
              this.dataMap.forEach((value) => {
                const chartDataObj = value.data[chartKey];
                if (chartDataObj) {
                  const values = chartDataObj.datas.map(d => d.y).filter(v => v !== null && v !== undefined);
                  if (values.length > 0) {
                    globalMin = Math.min(globalMin, ...values);
                    globalMax = Math.max(globalMax, ...values);
                  }
                }
              });
            }
            
            if (globalMin !== Infinity && globalMax !== -Infinity) {
              // Y 값이 범위를 벗어나도 차트 영역 경계에 클램핑해서 표시
              const x = this.getX(xTime, minTime, maxTime);
              
              // Y 값을 차트 범위 내로 클램핑
              const clampedYValue = Math.max(globalMin, Math.min(globalMax, yValue));
              const y = this.getY(clampedYValue, globalMin, globalMax, area.y, area.height);
              
              // Y 값이 범위를 벗어났는지 확인 (경계에 표시됨을 나타내기 위해)
              const isOutOfRange = yValue < globalMin || yValue > globalMax;
              
              // 이벤트 비교: label과 x, y 값으로 비교 (객체 참조가 다를 수 있음)
                const isHovered = this.hoveredEventMarker !== null && 
                  this.hoveredEventMarker.label === event.label &&
                  isXYPointEvent(this.hoveredEventMarker) &&
                  this.hoveredEventMarker.x === event.x &&
                  this.hoveredEventMarker.y === event.y;
                
                // 스타일 적용
                const arrowSize = this.config.eventArrowSize
                  ? (typeof this.config.eventArrowSize === 'function' 
                    ? this.config.eventArrowSize(event) 
                    : this.config.eventArrowSize)
                  : 16;
                const arrowFillStyle = this.config.eventArrowFillStyle
                  ? (typeof this.config.eventArrowFillStyle === 'function' 
                    ? this.config.eventArrowFillStyle(event, isHovered) 
                    : this.config.eventArrowFillStyle)
                  : (isHovered ? eventColor : '#FFFFFF');
                const arrowStrokeStyle = this.config.eventArrowStrokeStyle
                  ? (typeof this.config.eventArrowStrokeStyle === 'function' 
                    ? this.config.eventArrowStrokeStyle(event) 
                    : this.config.eventArrowStrokeStyle)
                  : eventColor;
                const arrowLineWidth = this.config.eventArrowLineWidth
                  ? (typeof this.config.eventArrowLineWidth === 'function' 
                    ? this.config.eventArrowLineWidth(event) 
                    : this.config.eventArrowLineWidth)
                  : 2;
                
                // 마커 타입 결정 (기본값: 'tag')
                const markerType = event.type || 'tag';
                
                // Y 위치가 차트의 상위 50%에 있으면 위쪽에 마커 배치 (아래를 가리킴)
                // Y 위치가 차트의 하위 50%에 있으면 아래쪽에 마커 배치 (위를 가리킴)
                const chartMidY = area.y + area.height / 2;
                const pointsDown = y < chartMidY; // y가 작을수록 화면 상단 (상위 50%)
                
                // 라벨 포맷 적용
                const labelFormatted = this.config.eventLabelFormat 
                  ? this.config.eventLabelFormat(event)
                  : event.label;
                const labelText = this.applyFormatResult(labelFormatted);
                
                if (markerType === 'dot') {
                  // === DOT 타입: 단순 점 ===
                  this.ctx.beginPath();
                  this.ctx.arc(x, y, 5, 0, Math.PI * 2);
                  this.ctx.fillStyle = arrowFillStyle;
                  this.ctx.fill();
                  this.ctx.strokeStyle = arrowStrokeStyle;
                  this.ctx.lineWidth = arrowLineWidth;
                  this.ctx.stroke();
                  
                  // 라벨 표시 (점 옆에)
                  this.ctx.fillStyle = arrowStrokeStyle;
                  this.ctx.font = 'bold 11px Arial';
                  this.ctx.textAlign = 'left';
                  this.ctx.textBaseline = 'middle';
                  this.ctx.fillText(labelText, x + 8, y);
                  
                  // 클릭 가능한 영역 저장
                  this.eventMarkers.push({ event, x, y, radius: 8 });
                  
                  // 호버 시 툴팁
                  if (isHovered) {
                    const tooltipY = pointsDown ? y + 15 : y - 15;
                    this.eventTooltipsToRender.push({ event, x, y: tooltipY, pointsDown });
                  }
                  
                } else if (markerType === 'arrow') {
                  // === ARROW 타입: PointEvent처럼 단순한 화살표 (►) ===
                  const arrowDirection = pointsDown ? 'down' : 'up';
                  
                  this.ctx.fillStyle = arrowStrokeStyle;
                  this.ctx.beginPath();
                  
                  if (arrowDirection === 'down') {
                    // 아래를 가리키는 화살표 ▼
                    this.ctx.moveTo(x - 6, y - 8);
                    this.ctx.lineTo(x, y);
                    this.ctx.lineTo(x + 6, y - 8);
                  } else {
                    // 위를 가리키는 화살표 ▲
                    this.ctx.moveTo(x - 6, y + 8);
                    this.ctx.lineTo(x, y);
                    this.ctx.lineTo(x + 6, y + 8);
                  }
                  
                  this.ctx.closePath();
                  this.ctx.fill();
                  
                  // 라벨 표시 (화살표 옆에)
                  this.ctx.fillStyle = arrowStrokeStyle;
                  this.ctx.font = 'bold 11px Arial';
                  this.ctx.textAlign = 'left';
                  this.ctx.textBaseline = 'middle';
                  const labelX = x + 10;
                  const labelY = arrowDirection === 'down' ? y - 4 : y + 4;
                  this.ctx.fillText(labelText, labelX, labelY);
                  
                  // 클릭 가능한 영역 저장
                  this.eventMarkers.push({ event, x, y, radius: 10 });
                  
                  // 호버 시 툴팁
                  if (isHovered) {
                    const tooltipY = pointsDown ? y + 15 : y - 15;
                    this.eventTooltipsToRender.push({ event, x, y: tooltipY, pointsDown });
                  }
                  
                } else {
                  // === TAG 타입: 화살표 + 텍스트 (기본) ===
                  const arrowOffsetY = pointsDown ? -arrowSize * 0.8 : arrowSize * 0.8;
                  const arrowY = y + arrowOffsetY;
                  
                  this.ctx.save();
                  this.ctx.translate(x, arrowY);
                  
                  if (pointsDown) {
                    // 아래를 가리키는 화살표
                    this.ctx.beginPath();
                    this.ctx.moveTo(-arrowSize / 2, -arrowSize * 0.6);
                    this.ctx.lineTo(arrowSize / 2, -arrowSize * 0.6);
                    this.ctx.lineTo(arrowSize / 2, 0);
                    this.ctx.lineTo(0, arrowSize * 0.8);
                    this.ctx.lineTo(-arrowSize / 2, 0);
                    this.ctx.closePath();
                  } else {
                    // 위를 가리키는 화살표
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, -arrowSize * 0.8);
                    this.ctx.lineTo(-arrowSize / 2, 0);
                    this.ctx.lineTo(-arrowSize / 2, arrowSize * 0.6);
                    this.ctx.lineTo(arrowSize / 2, arrowSize * 0.6);
                    this.ctx.lineTo(arrowSize / 2, 0);
                    this.ctx.closePath();
                  }
                  
                  this.ctx.fillStyle = arrowFillStyle;
                  this.ctx.strokeStyle = arrowStrokeStyle;
                  this.ctx.lineWidth = arrowLineWidth;
                  this.ctx.fill();
                  this.ctx.stroke();
                  
                  // 마커 내부 텍스트 표시 (첫 글자)
                  const markerTextFormatted = this.config.eventMarkerTextFormat 
                    ? this.config.eventMarkerTextFormat(event)
                    : event.label.charAt(0).toUpperCase();
                  const markerText = this.applyFormatResult(markerTextFormatted);
                  
                  const textFillStyle = isHovered ? '#FFFFFF' : arrowStrokeStyle;
                  this.ctx.fillStyle = textFillStyle;
                  this.ctx.font = 'bold 11px Arial';
                  this.ctx.textAlign = 'center';
                  this.ctx.textBaseline = 'middle';
                  const textY = pointsDown ? -arrowSize * 0.15 : arrowSize * 0.15;
                  this.ctx.fillText(markerText, 0, textY);
                  
                  this.ctx.restore();
                  
                  // 데이터 포인트에 작은 원
                  const pointRadius = 3;
                  this.ctx.beginPath();
                  this.ctx.arc(x, y, pointRadius, 0, Math.PI * 2);
                  this.ctx.fillStyle = arrowStrokeStyle;
                  this.ctx.fill();
                  this.ctx.strokeStyle = '#FFFFFF';
                  this.ctx.lineWidth = 1;
                  this.ctx.stroke();
                  
                  // 라벨 표시 (태그 옆에)
                  this.ctx.fillStyle = arrowStrokeStyle;
                  this.ctx.font = 'bold 11px Arial';
                  this.ctx.textAlign = 'left';
                  this.ctx.textBaseline = 'middle';
                  const labelX = x + arrowSize / 2 + 5;
                  const labelY = arrowY;
                  this.ctx.fillText(labelText, labelX, labelY);
                  
                  // 클릭 가능한 영역 저장
                  this.eventMarkers.push({ event, x, y: arrowY, radius: arrowSize * 1.2 });
                  
                  // 호버 시 툴팁
                  if (isHovered) {
                    const tooltipY = pointsDown ? arrowY + arrowSize * 0.8 : arrowY - arrowSize * 0.8;
                    this.eventTooltipsToRender.push({ event, x, y: tooltipY, pointsDown });
                  }
                }
            }
          }
        }
      }
    });

    // 툴팁은 render 함수에서 포인트 툴팁 이후에 그려짐
  }

  private drawEventTooltip(event: EventMarker & { chartKey?: string }, x: number, y: number, pointsDown: boolean = true) {
    // 컨텍스트 상태 저장 (다른 이벤트 그리기에 영향 주지 않도록)
    this.ctx.save();
    
    // 메인 텍스트 (레이블)
    let mainText: string;
    if (this.config.eventTooltipLabelFormat) {
      const formatted = this.config.eventTooltipLabelFormat(event);
      mainText = this.applyFormatResult(formatted);
    } else {
      mainText = event.label;
    }
    
    // 서브 텍스트 (상세 정보) - X, Y 값 모두 표시
    const subTextParts: string[] = [];
    
    if (isXYRangeEvent(event)) {
      // XY 범위 이벤트
      const startXFormatted = this.config.tooltipXFormat
        ? this.config.tooltipXFormat(event.startX, '', event.chartKey || '')
        : (this.config.xFormat 
          ? this.config.xFormat(event.startX, 0, 1, event.chartKey)
          : new Date(event.startX).toLocaleString());
      const endXFormatted = this.config.tooltipXFormat
        ? this.config.tooltipXFormat(event.endX, '', event.chartKey || '')
        : (this.config.xFormat 
          ? this.config.xFormat(event.endX, 0, 1, event.chartKey)
          : new Date(event.endX).toLocaleString());
      
      subTextParts.push(`Period: ${this.applyFormatResult(startXFormatted)} ~ ${this.applyFormatResult(endXFormatted)}`);
      
      const startYFormatted = this.config.tooltipYFormat
        ? this.config.tooltipYFormat(event.startY, event.chartKey || '', '')
        : (this.config.yFormat 
          ? this.config.yFormat(event.startY, 0, 1, event.chartKey)
          : event.startY.toLocaleString());
      const endYFormatted = this.config.tooltipYFormat
        ? this.config.tooltipYFormat(event.endY, event.chartKey || '', '')
        : (this.config.yFormat 
          ? this.config.yFormat(event.endY, 0, 1, event.chartKey)
          : event.endY.toLocaleString());
      
      subTextParts.push(`Range: ${this.applyFormatResult(startYFormatted)} ~ ${this.applyFormatResult(endYFormatted)}`);
    } else if (isXRangeEvent(event)) {
      // X 범위 이벤트
      const startXFormatted = this.config.tooltipXFormat
        ? this.config.tooltipXFormat(event.startX, '', event.chartKey || '')
        : (this.config.xFormat 
          ? this.config.xFormat(event.startX, 0, 1, event.chartKey)
          : new Date(event.startX).toLocaleString());
      const endXFormatted = this.config.tooltipXFormat
        ? this.config.tooltipXFormat(event.endX, '', event.chartKey || '')
        : (this.config.xFormat 
          ? this.config.xFormat(event.endX, 0, 1, event.chartKey)
          : new Date(event.endX).toLocaleString());
      
      subTextParts.push(`Period: ${this.applyFormatResult(startXFormatted)} ~ ${this.applyFormatResult(endXFormatted)}`);
    } else if (isYRangeEvent(event)) {
      // Y 범위 이벤트
      const startYFormatted = this.config.tooltipYFormat
        ? this.config.tooltipYFormat(event.startY, event.chartKey || '', '')
        : (this.config.yFormat 
          ? this.config.yFormat(event.startY, 0, 1, event.chartKey)
          : event.startY.toLocaleString());
      const endYFormatted = this.config.tooltipYFormat
        ? this.config.tooltipYFormat(event.endY, event.chartKey || '', '')
        : (this.config.yFormat 
          ? this.config.yFormat(event.endY, 0, 1, event.chartKey)
          : event.endY.toLocaleString());
      
      subTextParts.push(`Range: ${this.applyFormatResult(startYFormatted)} ~ ${this.applyFormatResult(endYFormatted)}`);
    } else {
      // 포인트 이벤트
      // chartKey를 먼저 추출 (타입 가드 전에)
      const eventWithMeta = event as EventMarker & { chartKey?: string; pointIndex?: number };
      const chartKey = eventWithMeta.chartKey;
      const pointIndex = eventWithMeta.pointIndex;
      
      // PointEvent의 개별 포인트인 경우
      if (pointIndex !== undefined) {
        subTextParts.push(`Point ${pointIndex + 1}`);
      }
      
      // X 값 (시간) - 직접 x 속성 체크
      if ('x' in event && event.x !== undefined) {
        const xTime = (event as any).x;
        const xFormatted = this.config.tooltipXFormat
          ? this.config.tooltipXFormat(xTime, '', chartKey || '')
          : (this.config.xFormat 
            ? this.config.xFormat(xTime, 0, 1, chartKey)
            : new Date(xTime).toLocaleString());
        subTextParts.push(`Time: ${this.applyFormatResult(xFormatted)}`);
      }
      
      // Y 값 - 직접 y 속성 체크
      if ('y' in event && event.y !== undefined) {
        const yValue = (event as any).y;
        const yFormatted = this.config.tooltipYFormat
          ? this.config.tooltipYFormat(yValue, chartKey || '', '')
          : (this.config.yFormat 
            ? this.config.yFormat(yValue, 0, 1, chartKey)
            : yValue.toLocaleString());
        subTextParts.push(`Value: ${this.applyFormatResult(yFormatted)}`);
      }
      
      // Chart Key
      if (chartKey) {
        const chartLabel = this.config.labelFormat
          ? this.applyFormatResult(this.config.labelFormat(chartKey))
          : chartKey;
        subTextParts.push(`Chart: ${chartLabel}`);
      }
    }
    
    const subText = subTextParts.length > 0 ? subTextParts.join(' | ') : '';
    
    // 툴팁 크기 계산
    this.ctx.font = 'bold 11px Arial';
    const mainTextWidth = this.ctx.measureText(mainText).width;
    this.ctx.font = '10px Arial';
    const subTextWidth = this.ctx.measureText(subText).width;
    const textWidth = Math.max(mainTextWidth, subTextWidth);
    const tooltipWidth = textWidth + 16;
    const tooltipHeight = subText ? 36 : 28;
    
    // 툴팁 위치 결정
    let tooltipX = x - tooltipWidth / 2; // 중앙 정렬
    let tooltipY = pointsDown ? y + 5 : y - tooltipHeight - 5;
    
    // 화면 경계 체크
    if (tooltipX < this.padding) {
      tooltipX = this.padding;
    }
    if (tooltipX + tooltipWidth > this.canvasWidth - this.padding) {
      tooltipX = this.canvasWidth - this.padding - tooltipWidth;
    }
    if (tooltipY < this.padding) {
      tooltipY = y + 5;
    }
    if (tooltipY + tooltipHeight > this.canvasHeight - this.padding) {
      tooltipY = y - tooltipHeight - 5;
    }
    
    // 툴팁 배경
    const isDarkMode = this.detectDarkMode(this.config.theme);
    this.ctx.fillStyle = isDarkMode ? 'rgba(50, 50, 50, 0.95)' : 'rgba(0, 0, 0, 0.85)';
    this.ctx.beginPath();
    this.ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 4);
    this.ctx.fill();
    
    // 메인 텍스트
    this.ctx.fillStyle = isDarkMode ? '#FFFFFF' : '#FFFFFF';
    this.ctx.font = 'bold 11px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(mainText, tooltipX + 8, tooltipY + 6);
    
    // 서브 텍스트
    if (subText) {
      this.ctx.font = '10px Arial';
      this.ctx.fillStyle = isDarkMode ? '#CCCCCC' : '#AAAAAA';
      this.ctx.fillText(subText, tooltipX + 8, tooltipY + 20);
    }
    
    // 컨텍스트 상태 복원
    this.ctx.restore();
  }

  drawXAxisLabels(
    area: DrawArea,
    sortedTimes: number[],
    displayMinTime?: number,
    displayMaxTime?: number
  ) {
    if (sortedTimes.length === 0) return;

    // X축 레이블 영역 배경색 그리기
    // X축 레이블 영역 배경색은 전체 배경색으로 이미 채워져 있음 (별도 그리기 불필요)

    const minTime = displayMinTime ?? sortedTimes[0];
    const maxTime = displayMaxTime ?? sortedTimes[sortedTimes.length - 1];

    const baselineY = area.y;
    
    this.ctx.fillStyle = this.getTextColor();
    this.ctx.font = '12px Arial';
    
    const tickYStart = baselineY;
    const tickYEnd = baselineY + 6;
    const labelY = baselineY + 13;
    
    const visibleTimes = sortedTimes.filter(t => t >= minTime && t <= maxTime);
    if (visibleTimes.length === 0) return;
    
    const dayStartTimes: number[] = [];
    const seenDays = new Set<string>();
    
    visibleTimes.forEach(time => {
      const date = new Date(time);
      const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      if (!seenDays.has(dayKey)) {
        seenDays.add(dayKey);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
        const dayStartTime = dayStart.getTime();
        if (dayStartTime >= minTime && dayStartTime <= maxTime) {
          dayStartTimes.push(dayStartTime);
        }
      }
    });
    
    if (dayStartTimes.length === 0) return;
    
    const maxLabels = this.config.xLabelCount ?? 12;
    
    // 0이면 레이블을 그리지 않음
    if (maxLabels === 0) return;
    
    // 실제로 그려질 레이블 선택 (정확히 maxLabels 개수만큼)
    const labelsToRender: number[] = [];
    
    if (dayStartTimes.length <= maxLabels) {
      // 데이터가 적으면 모두 표시
      labelsToRender.push(...dayStartTimes);
    } else {
      // 데이터가 많으면 균등하게 분배
      // 첫 번째와 마지막은 무조건 포함, 나머지는 균등 간격으로
      labelsToRender.push(dayStartTimes[0]); // 첫 번째
      
      // 중간 레이블들 (maxLabels - 2개)
      const middleCount = maxLabels - 2;
      if (middleCount > 0) {
        const step = (dayStartTimes.length - 1) / (maxLabels - 1);
        for (let i = 1; i < maxLabels - 1; i++) {
          const index = Math.round(i * step);
          labelsToRender.push(dayStartTimes[index]);
        }
      }
      
      labelsToRender.push(dayStartTimes[dayStartTimes.length - 1]); // 마지막
    }
    
    const totalLabels = labelsToRender.length;
    
    this.ctx.textAlign = 'center';
    labelsToRender.forEach((time, index) => {
      const x = this.getX(time, minTime, maxTime);
      
      const formatted = this.config.xFormat ? this.config.xFormat(time, index, totalLabels) : time.toString();
      const labelText = this.applyFormatResult(formatted);
      this.ctx.fillText(labelText, x, labelY);
      this.ctx.beginPath();
      this.ctx.moveTo(x, tickYStart);
      this.ctx.lineTo(x, tickYEnd);
      this.ctx.stroke();
    });
  }

  drawZoomButtons(
    area: DrawArea,
    zoomStart: number, 
    zoomEnd: number, 
    displayMinTime?: number, 
    displayMaxTime?: number
  ): { type: string; x: number; y: number; width: number; height: number }[] {
    const buttonSize = 25;
    const buttonGap = 10;
    const startX = area.x;
    const startY = area.y;
    
    const zoomButtons: { type: string; x: number; y: number; width: number; height: number }[] = [];
    
    const buttons = [
      { type: 'zoomIn', label: '+' },
      { type: 'zoomOut', label: '−' },
      { type: 'reset', label: '↺' }
    ];
    
    buttons.forEach((btn, i) => {
      const x = startX + i * (buttonSize + buttonGap);
      const y = startY;
      
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      this.ctx.strokeStyle = '#999';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.roundRect(x, y, buttonSize, buttonSize, 4);
      this.ctx.fill();
      this.ctx.stroke();
      
      this.ctx.fillStyle = '#333';
      this.ctx.font = 'bold 13px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(btn.label, x + buttonSize / 2, y + buttonSize / 2);
      
      zoomButtons.push({ type: btn.type, x, y, width: buttonSize, height: buttonSize });
    });
    
    // 현재 보고 있는 시간 범위를 항상 버튼 위에 표시
    if (displayMinTime !== undefined && displayMaxTime !== undefined) {
      let dateRangeText: string;
      
      if (this.config.zoomRangeFormat) {
        // zoomRangeFormat 콜백이 있으면 사용
        const formatted = this.config.zoomRangeFormat(displayMinTime, displayMaxTime);
        dateRangeText = this.applyFormatResult(formatted);
      } else {
        // 기본 포맷: xFormat 사용하거나 timestamp 그대로
        const formatDateTime = (timestamp: number, index: number): string => {
          if (this.config.xFormat) {
            const formatted = this.config.xFormat(timestamp, index, 2);
            return this.applyFormatResult(formatted);
          } else {
            return timestamp.toString();
          }
        };
        
        const fromDate = formatDateTime(displayMinTime, 0);
        const toDate = formatDateTime(displayMaxTime, 1);
        dateRangeText = `${fromDate} ~ ${toDate}`;
      }
      
      // 날짜 범위를 버튼 위에 중앙 정렬로 표시
      this.ctx.font = '10px Arial';
      this.ctx.fillStyle = '#333';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(dateRangeText, this.width / 2, startY - 5);
    }
    
    // 줌 모드일 때 퍼센트를 버튼 아래에 중앙 정렬로 표시
    if (zoomStart > 0 || zoomEnd < 100) {
      this.ctx.font = '10px Arial';
      this.ctx.fillStyle = '#666';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`${zoomStart.toFixed(0)}%-${zoomEnd.toFixed(0)}%`, this.width / 2, startY + buttonSize + 5);
    }
    
    return zoomButtons;
  }

  drawDragSelection(
    isDragging: boolean,
    dragStartX: number | null,
    dragCurrentX: number | null,
    chartBottom: number
  ) {
    if (!isDragging || dragStartX === null || dragCurrentX === null) return;
    
    const selectionLeft = Math.min(dragStartX, dragCurrentX);
    const selectionWidth = Math.abs(dragCurrentX - dragStartX);
    
    this.ctx.fillStyle = 'rgba(74, 144, 217, 0.2)';
    this.ctx.fillRect(selectionLeft, this.padding, selectionWidth, chartBottom - this.padding);
    
    this.ctx.strokeStyle = '#4a90d9';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([4, 4]);
    this.ctx.strokeRect(selectionLeft, this.padding, selectionWidth, chartBottom - this.padding);
    this.ctx.setLineDash([]);
  }

  drawCrosshair(
    mouseX: number,
    mouseY: number,
    chartAreas: Array<DrawArea & { key: string }>,
    sortedTimes: number[],
    displayMinTime?: number,
    displayMaxTime?: number
  ) {
    // 마우스가 차트 영역 내에 있는지 확인 (X축)
    if (mouseX < this.chartAreaLeft || mouseX > this.getChartRight()) return;
    
    // 마우스가 어느 차트 영역에 있는지 확인
    let isInChartArea = false;
    for (const area of chartAreas) {
      if (mouseY >= area.y && mouseY <= area.y + area.height) {
        isInChartArea = true;
        break;
      }
    }
    
    if (!isInChartArea) return;
    
    const chartTop = chartAreas.length > 0 ? chartAreas[0].y : this.paddingTop;
    const chartBottom = chartAreas.length > 0 
      ? chartAreas[chartAreas.length - 1].y + chartAreas[chartAreas.length - 1].height
      : this.height - this.paddingBottom;
    
    this.ctx.strokeStyle = this.config.crosshairStrokeStyle || '#666666';
    this.ctx.lineWidth = this.config.crosshairLineWidth || 1;
    this.ctx.setLineDash(this.config.crosshairLineDash || [4, 4]);
    
    // 세로선: 차트 영역 내에서만 그리기
    this.ctx.beginPath();
    this.ctx.moveTo(mouseX, chartTop);
    this.ctx.lineTo(mouseX, chartBottom);
    this.ctx.stroke();

    // 가로선: 차트 영역 내에서만 그리기
    this.ctx.beginPath();
    this.ctx.moveTo(this.chartAreaLeft, mouseY);
    this.ctx.lineTo(this.getChartRight(), mouseY);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    const timePercent = (mouseX - this.chartAreaLeft) / this.chartAreaWidth;
    
    if (sortedTimes.length > 0) {
      const minTime = displayMinTime ?? sortedTimes[0];
      const maxTime = displayMaxTime ?? sortedTimes[sortedTimes.length - 1];
      const timeRange = maxTime - minTime || 1;
      const currentTime = minTime + timePercent * timeRange;
      const date = new Date(currentTime);
      this.ctx.fillStyle = '#333333';
      this.ctx.font = 'bold 12px Arial';
      this.ctx.textAlign = 'center';
      
      const formatted = this.config.crosshairXFormat 
        ? this.config.crosshairXFormat(currentTime)
        : (this.config.xFormat 
          ? this.config.xFormat(currentTime, 0, 1)
          : currentTime.toString());
      const dateStr = this.applyFormatResult(formatted);
      
      this.ctx.fillStyle = this.getTextColor();
      this.ctx.fillText(dateStr, mouseX, this.height - this.padding + 35);
    }

    let valueStr = '';
    
    // 마우스가 있는 차트 영역 찾기
    for (const area of chartAreas) {
      if (mouseY >= area.y && mouseY <= area.y + area.height) {
        const scaledValue = 1 - (mouseY - area.y) / area.height;
        const totalMargin = this.chartMarginTop + this.chartMarginBottom;
        const normalizedValue = (scaledValue - this.chartMarginBottom) / (1 - totalMargin);
        
        if (this.state.normalize === 'rangeNormalize' || this.state.normalize === 'normalize') {
          // 정규화 모드: 퍼센트 표시
          const valuePercent = normalizedValue * 100;
          const formatted = this.config.crosshairYFormat
            ? this.config.crosshairYFormat(valuePercent, area.key, true)
            : `${valuePercent.toFixed(1)}%`;
          valueStr = this.applyFormatResult(formatted);
        } else {
          // 비정규화 모드: 실제 값 계산 및 포맷 적용
          // 해당 차트의 전체 min/max 범위 계산
          let globalMin = Infinity;
          let globalMax = -Infinity;
          
          this.dataMap.forEach((value) => {
            const chartDataObj = value.data[area.key];
            if (chartDataObj) {
              const values = chartDataObj.datas.map((d: ChartData) => d.y).filter((v: number | null | undefined) => v !== null && v !== undefined);
              if (values.length > 0) {
                globalMin = Math.min(globalMin, ...values);
                globalMax = Math.max(globalMax, ...values);
              }
            }
          });
          
          if (globalMin !== Infinity && globalMax !== -Infinity) {
            const actualValue = globalMin + normalizedValue * (globalMax - globalMin);
            const formatted = this.config.crosshairYFormat
              ? this.config.crosshairYFormat(actualValue, area.key, false)
              : (this.config.yFormat 
                ? this.config.yFormat(actualValue, 0, 1, area.key) 
                : actualValue.toLocaleString(undefined, { maximumFractionDigits: 2 }));
            valueStr = this.applyFormatResult(formatted);
          }
        }
        break;
      }
    }
    
    if (valueStr) {
      this.ctx.fillStyle = this.getTextColor();
      this.ctx.font = 'bold 12px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(valueStr, this.paddingLeft + this.chartAreaWidth + 5, mouseY);
    }
  }

  drawDataPoints(
    visibleTickers: Set<string>,
    chartAreas: Array<DrawArea & { key: string }>,
    sortedTimes: number[],
    displayMinTime?: number,
    displayMaxTime?: number
  ): { symbol: string; x: number; y: number; value: number; time: number; chartType: string }[] {
    const dataPoints: { symbol: string; x: number; y: number; value: number; time: number; chartType: string }[] = [];
    
    if (sortedTimes.length === 0) return dataPoints;

    const minTime = displayMinTime ?? sortedTimes[0];
    const maxTime = displayMaxTime ?? sortedTimes[sortedTimes.length - 1];

    const pointRadius = 3;
    const clipLeft = this.chartAreaLeft;
    const clipRight = this.getChartRight();

    // 각 차트 레이아웃에 대해 포인트 그리기
    chartAreas.forEach(area => {
      const chartKey = area.key;
      const graphTop = area.y;
      const graphHeight = area.height;

      // 각 티커별 min/max 계산
      const minMaxBySymbol = new Map<string, { min: number; max: number }>();

      if (this.state.normalize === 'rangeNormalize') {
        // 범위 정규화: 현재 보이는 범위의 데이터로 min/max 계산
        this.dataMap.forEach((value, symbol) => {
          const chartDataObj = value.data[chartKey];
          if (chartDataObj) {
            const visibleValues = chartDataObj.datas
              .filter(d => d.x >= minTime && d.x <= maxTime && d.y !== null && d.y !== undefined)
              .map(d => d.y);
            if (visibleValues.length > 0) {
              minMaxBySymbol.set(symbol, { min: Math.min(...visibleValues), max: Math.max(...visibleValues) });
            }
          }
        });
      } else if (this.state.normalize === 'normalize') {
        // 전체 정규화: 캐시된 전체 데이터의 min/max 사용
        const chartMinMaxCache = this.globalMinMaxCache.get(chartKey);
        if (chartMinMaxCache) {
          this.dataMap.forEach((value, symbol) => {
            const cachedMinMax = chartMinMaxCache.get(symbol);
            if (cachedMinMax) {
              minMaxBySymbol.set(symbol, cachedMinMax);
            }
          });
        }
      } else {
        // 정규화 안함: 모든 티커의 전체 min/max 사용
        let globalMin = Infinity, globalMax = -Infinity;
        
        this.dataMap.forEach((value) => {
          const chartDataObj = value.data[chartKey];
          if (chartDataObj) {
            const values = chartDataObj.datas.map(d => d.y).filter(v => v !== null && v !== undefined);
            if (values.length > 0) {
              globalMin = Math.min(globalMin, ...values);
              globalMax = Math.max(globalMax, ...values);
            }
          }
        });
        
        // 모든 티커에 동일한 min/max 적용
        this.dataMap.forEach((value, symbol) => {
          minMaxBySymbol.set(symbol, { min: globalMin, max: globalMax });
        });
      }

      // 각 티커의 포인트 그리기
      this.dataMap.forEach((value, symbol) => {
        if (!visibleTickers.has(symbol)) return;

        const color = this.getTickerColor(symbol);
        const minMax = minMaxBySymbol.get(symbol);
        if (!minMax) return;

        const chartDataObj = value.data[chartKey];
        if (!chartDataObj) return;
        
        chartDataObj.datas.forEach(d => {
          if (d.y === null || d.y === undefined) return;
          const time = d.x;
          if (time < minTime || time > maxTime) return;

          const x = this.getX(time, minTime, maxTime);
          if (x < clipLeft || x > clipRight) return;
          
          const normalizedValue = (d.y - minMax.min) / (minMax.max - minMax.min || 1);
          const totalMargin = this.chartMarginTop + this.chartMarginBottom;
          const scaledValue = this.chartMarginBottom + normalizedValue * (1 - totalMargin);
          const y = graphTop + (1 - scaledValue) * graphHeight;

          this.ctx.fillStyle = color;
          this.ctx.beginPath();
          this.ctx.arc(x, y, pointRadius, 0, Math.PI * 2);
          this.ctx.fill();

          dataPoints.push({ symbol, x, y, value: d.y, time, chartType: chartKey });
        });
      });
    });
    
    return dataPoints;
  }

  drawPointTooltip(
    point: { symbol: string; x: number; y: number; value: number; time: number; chartType: string },
    canvasArea: DrawArea
  ) {
    const xFormatted = this.config.tooltipXFormat
      ? this.config.tooltipXFormat(point.time, point.symbol, point.chartType)
      : (this.config.xFormat 
        ? this.config.xFormat(point.time, 0, 1, point.chartType)
        : point.time.toString());
    const dateStr = this.applyFormatResult(xFormatted);
    
    let text: string;
    if (this.config.tooltipLabelFormat) {
      const formatted = this.config.tooltipLabelFormat(point.symbol, point.chartType, point.value, point.time);
      text = this.applyFormatResult(formatted);
    } else {
      let valueStr: string;
      if (this.config.tooltipYFormat) {
        const formatted = this.config.tooltipYFormat(point.value, point.chartType, point.symbol);
        valueStr = this.applyFormatResult(formatted);
      } else if (this.config.yFormat) {
        const formatted = this.config.yFormat(point.value, 0, 1, point.chartType);
        valueStr = this.applyFormatResult(formatted);
      } else {
        // 기본 포맷: 소수점 2자리 또는 정수 (값이 크면 천단위 구분)
        valueStr = point.value.toLocaleString(undefined, { maximumFractionDigits: 2 });
      }
      
      const labelFormatted = this.config.labelFormat
        ? this.config.labelFormat(point.chartType)
        : point.chartType;
      const chartLabel = this.applyFormatResult(labelFormatted);
      
      text = `${point.symbol} (${chartLabel}): ${valueStr}`;
    }
    
    const subText = dateStr;
    
    this.ctx.font = 'bold 11px Arial';
    const textWidth = Math.max(this.ctx.measureText(text).width, this.ctx.measureText(subText).width);
    const tooltipWidth = textWidth + 16;
    const tooltipHeight = 36;
    
    let tooltipX = point.x + 10;
    let tooltipY = point.y - tooltipHeight - 5;
    
    if (tooltipX + tooltipWidth > canvasArea.width - this.padding) {
      tooltipX = point.x - tooltipWidth - 10;
    }
    if (tooltipY < this.padding) {
      tooltipY = point.y + 10;
    }
    
    const isDarkMode = this.detectDarkMode(this.config.theme);
    this.ctx.fillStyle = isDarkMode ? 'rgba(50, 50, 50, 0.95)' : 'rgba(0, 0, 0, 0.85)';
    this.ctx.beginPath();
    this.ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 4);
    this.ctx.fill();
    
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(text, tooltipX + 8, tooltipY + 6);
    this.ctx.font = '10px Arial';
    this.ctx.fillStyle = isDarkMode ? '#CCCCCC' : '#AAAAAA';
    this.ctx.fillText(subText, tooltipX + 8, tooltipY + 20);
  }

  private isInChartArea(x: number, y: number): boolean {
    return x >= this.padding && x <= this.canvasWidth - this.padding && y >= this.padding;
  }

  private xToZoomPercent(x: number): number {
    const chartWidth = this.canvasWidth - this.padding * 2;
    const xInChart = x - this.padding;
    const percentInView = xInChart / chartWidth;
    return this.zoomStart + percentInView * (this.zoomEnd - this.zoomStart);
  }

  private zoomIn(focusX?: number) {
    const range = this.zoomEnd - this.zoomStart;
    if (range <= 1) return; // 최소 1%까지 확대 가능 (기존 10%에서 변경)
    
    let focusPercent: number;
    if (focusX !== undefined) {
      focusPercent = this.xToZoomPercent(focusX);
    } else {
      focusPercent = (this.zoomStart + this.zoomEnd) / 2;
    }
    
    const newRange = range * 0.7;
    const focusRatio = (focusPercent - this.zoomStart) / range;
    this.zoomStart = Math.max(0, focusPercent - newRange * focusRatio);
    this.zoomEnd = Math.min(100, focusPercent + newRange * (1 - focusRatio));
    
    if (this.zoomStart < 0) {
      this.zoomEnd -= this.zoomStart;
      this.zoomStart = 0;
    }
    if (this.zoomEnd > 100) {
      this.zoomStart -= (this.zoomEnd - 100);
      this.zoomEnd = 100;
    }
    
    this.zoomStart = Math.round(this.zoomStart * 100) / 100;
    this.zoomEnd = Math.round(this.zoomEnd * 100) / 100;
    
    if (Math.abs(this.zoomStart) < 0.5 && Math.abs(this.zoomEnd - 100) < 0.5) {
      this.zoomStart = 0;
      this.zoomEnd = 100;
      this.isPanning = false;
      this.panStartX = null;
      this.isTouchPanning = false;
    }
    
    this.render();
  }

  private zoomOut(focusX?: number) {
    const range = this.zoomEnd - this.zoomStart;
    if (range >= 100) return;
    
    let focusPercent: number;
    if (focusX !== undefined) {
      focusPercent = this.xToZoomPercent(focusX);
    } else {
      focusPercent = (this.zoomStart + this.zoomEnd) / 2;
    }
    
    const newRange = Math.min(100, range * 1.4);
    const focusRatio = (focusPercent - this.zoomStart) / range;
    this.zoomStart = Math.max(0, focusPercent - newRange * focusRatio);
    this.zoomEnd = Math.min(100, focusPercent + newRange * (1 - focusRatio));
    
    if (this.zoomStart < 0) {
      this.zoomEnd -= this.zoomStart;
      this.zoomStart = 0;
    }
    if (this.zoomEnd > 100) {
      this.zoomStart -= (this.zoomEnd - 100);
      this.zoomEnd = 100;
    }
    
    this.zoomStart = Math.round(this.zoomStart * 100) / 100;
    this.zoomEnd = Math.round(this.zoomEnd * 100) / 100;
    
    if (Math.abs(this.zoomStart) < 0.5 && Math.abs(this.zoomEnd - 100) < 0.5) {
      this.zoomStart = 0;
      this.zoomEnd = 100;
      this.isPanning = false;
      this.panStartX = null;
      this.isTouchPanning = false;
    }
    
    this.render();
  }

  private zoomReset() {
    this.zoomStart = 0;
    this.zoomEnd = 100;
    this.isPanning = false;
    this.panStartX = null;
    this.isTouchPanning = false;
    this.isDragging = false;
    this.dragStartX = null;
    this.dragCurrentX = null;
    this.isTouchDragging = false;
    this.render();
  }

  private getPinchDistance(touches: TouchList): number {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private setupEventListeners() {
    // 서버사이드 환경에서는 이벤트 리스너가 필요없으므로 스킵
    if (typeof window === 'undefined' || !this.canvas.addEventListener) {
      return;
    }
    
    // 마우스 이동
    this.canvas.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
      
      if (this.isDragging && this.dragStartX !== null) {
        // 드래그 현재 위치를 차트 영역 내로 제한
        this.dragCurrentX = Math.max(this.chartAreaLeft, Math.min(this.getChartRight(), this.mouseX));
        this.render();
        return;
      }
      
      if (this.isPanning && this.panStartX !== null) {
        const dx = this.mouseX - this.panStartX;
        const pixelRange = this.canvasWidth - this.padding * 2;
        const percentDelta = (dx / pixelRange) * (this.zoomEnd - this.zoomStart);
        
        let newStart = this.zoomStart - percentDelta;
        let newEnd = this.zoomEnd - percentDelta;
        
        if (newStart < 0) {
          newEnd -= newStart;
          newStart = 0;
        }
        if (newEnd > 100) {
          newStart -= (newEnd - 100);
          newEnd = 100;
        }
        
        this.zoomStart = Math.max(0, newStart);
        this.zoomEnd = Math.min(100, newEnd);
        this.panStartX = this.mouseX;
        
        this.zoomStart = Math.round(this.zoomStart * 100) / 100;
        this.zoomEnd = Math.round(this.zoomEnd * 100) / 100;
        
        if (Math.abs(this.zoomStart) < 0.5 && Math.abs(this.zoomEnd - 100) < 0.5) {
          this.zoomStart = 0;
          this.zoomEnd = 100;
          this.isPanning = false;
          this.panStartX = null;
        }
        
        this.render();
        return;
      }
      
      // 이벤트 마커 호버 감지
      let foundEventMarker: EventMarker | null = null;
      for (const marker of this.eventMarkers) {
        // Range 이벤트 라벨 (사각형 영역 체크)
        if ((marker.event as any).isRangeLabel && (marker.event as any).labelRect) {
          const rect = (marker.event as any).labelRect;
          if (this.mouseX >= rect.x && this.mouseX <= rect.x + rect.width &&
              this.mouseY >= rect.y && this.mouseY <= rect.y + rect.height) {
            foundEventMarker = marker.event;
            break;
          }
        }
        // X-only 이벤트 (세로 라인)는 X축 거리만 체크
        else if (isXPointEvent(marker.event)) {
          const dx = Math.abs(this.mouseX - marker.x);
          if (dx <= marker.radius) {
            foundEventMarker = marker.event;
            break;
          }
        }
        // Y-only 이벤트 (가로 라인)는 Y축 거리만 체크
        else if (isYPointEvent(marker.event)) {
          const dy = Math.abs(this.mouseY - marker.y);
          if (dy <= marker.radius) {
            foundEventMarker = marker.event;
            break;
          }
        }
        // 다른 이벤트는 원형 영역으로 체크
        else {
          const dx = this.mouseX - marker.x;
          const dy = this.mouseY - marker.y;
          if (Math.sqrt(dx * dx + dy * dy) <= marker.radius) {
            foundEventMarker = marker.event;
            break;
          }
        }
      }
      this.hoveredEventMarker = foundEventMarker;
      
      if (this.state.showPoints && this.dataPoints.length > 0) {
        const hoverRadius = 6;
        let foundPoint = null;
        for (const point of this.dataPoints) {
          const dx = this.mouseX - point.x;
          const dy = this.mouseY - point.y;
          if (Math.sqrt(dx * dx + dy * dy) <= hoverRadius) {
            foundPoint = point;
            break;
          }
        }
        this.hoveredPoint = foundPoint;
      }
      
      let cursor = 'pointer'; // 'crosshair';
      
      for (const btn of this.zoomButtons) {
        if (this.mouseX >= btn.x && this.mouseX <= btn.x + btn.width &&
            this.mouseY >= btn.y && this.mouseY <= btn.y + btn.height) {
          cursor = 'pointer';
          break;
        }
      }
      
      for (const item of this.legendItems) {
        if (this.mouseX >= item.x && this.mouseX <= item.x + item.width &&
            this.mouseY >= item.y && this.mouseY <= item.y + item.height) {
          cursor = 'pointer';
          break;
        }
      }
      
      if ((this.zoomStart > 0 || this.zoomEnd < 100) && this.isInChartArea(this.mouseX, this.mouseY) && cursor === 'crosshair') {
        cursor = 'grab';
      }
      
      this.canvas.style.cursor = cursor;
      this.render();
    });

    // 마우스 나감
    this.canvas.addEventListener('mouseleave', () => {
      this.mouseX = null;
      this.mouseY = null;
      
      // 툴팁이 열려있었다면 닫힘 콜백 호출
      if (this.hoveredPoint !== null && this.config.onPointTooltip) {
        this.config.onPointTooltip(null);
      }
      
      this.hoveredPoint = null;
      this.hoveredEventMarker = null;
      this.isDragging = false;
      this.dragStartX = null;
      this.dragCurrentX = null;
      this.isPanning = false;
      this.panStartX = null;
      this.render();
    });

    // 마우스 다운
    this.canvas.addEventListener('mousedown', (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      for (const btn of this.zoomButtons) {
        if (x >= btn.x && x <= btn.x + btn.width &&
            y >= btn.y && y <= btn.y + btn.height) {
          return;
        }
      }
      
      for (const item of this.legendItems) {
        if (x >= item.x && x <= item.x + item.width &&
            y >= item.y && y <= item.y + item.height) {
          return;
        }
      }
      
      if (this.isInChartArea(x, y)) {
        if (this.zoomStart === 0 && this.zoomEnd === 100) {
          this.isDragging = true;
          // 드래그 시작 위치를 차트 영역 내로 제한
          this.dragStartX = Math.max(this.chartAreaLeft, Math.min(this.getChartRight(), x));
          this.dragCurrentX = this.dragStartX;
        } else {
          this.isPanning = true;
          this.panStartX = x;
        }
      }
    });

    // 마우스 업
    this.canvas.addEventListener('mouseup', (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // 줌 버튼 클릭 시 조기 반환 (클릭 이벤트에서 처리)
      for (const btn of this.zoomButtons) {
        if (x >= btn.x && x <= btn.x + btn.width &&
            y >= btn.y && y <= btn.y + btn.height) {
          return;
        }
      }
      
      if (this.isDragging && this.dragStartX !== null && this.dragCurrentX !== null) {
        const startX = Math.min(this.dragStartX, this.dragCurrentX);
        const endX = Math.max(this.dragStartX, this.dragCurrentX);
        const selectionWidth = endX - startX;
        
        if (selectionWidth > 10) {
          const chartWidth = this.canvasWidth - this.padding * 2;
          const startPercent = ((startX - this.padding) / chartWidth) * 100;
          const endPercent = ((endX - this.padding) / chartWidth) * 100;
          
          if (this.zoomStart === 0 && this.zoomEnd === 100) {
            this.zoomStart = startPercent;
            this.zoomEnd = endPercent;
          } else {
            const currentRange = this.zoomEnd - this.zoomStart;
            this.zoomStart = this.zoomStart + (startPercent / 100) * currentRange;
            this.zoomEnd = this.zoomStart + ((endPercent - startPercent) / 100) * currentRange;
          }
          this.zoomStart = Math.max(0, this.zoomStart);
          this.zoomEnd = Math.min(100, this.zoomEnd);
        }
        
        this.isDragging = false;
        this.dragStartX = null;
        this.dragCurrentX = null;
        this.render();
        return;
      }
      
      if (this.isPanning) {
        this.isPanning = false;
        this.panStartX = null;
        this.canvas.style.cursor = 'grab';
        this.render();
      }
    });

    // 클릭
    this.canvas.addEventListener('click', (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      // 더블클릭 감지 (click 이벤트 기반)
      const currentTime = Date.now();
      const timeDiff = currentTime - this.lastTapTime;
      const dx = clickX - this.lastTapX;
      const dy = clickY - this.lastTapY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const tapThreshold = 300; // 300ms 이내
      const distanceThreshold = 30; // 30px 이내
      
      if (timeDiff < tapThreshold && distance < distanceThreshold) {
        // 더블클릭 감지됨
        
        // 줌 버튼 영역이면 무시
        let isZoomButton = false;
        for (const btn of this.zoomButtons) {
          if (clickX >= btn.x && clickX <= btn.x + btn.width &&
              clickY >= btn.y && clickY <= btn.y + btn.height) {
            isZoomButton = true;
            break;
          }
        }
        
        // 범례 영역이면 무시
        let isLegend = false;
        for (const item of this.legendItems) {
          if (clickX >= item.x && clickX <= item.x + item.width &&
              clickY >= item.y && clickY <= item.y + item.height) {
            isLegend = true;
            break;
          }
        }
        
        if (!isZoomButton && !isLegend && this.isInChartArea(clickX, clickY) && (this.zoomStart > 0 || this.zoomEnd < 100)) {
          this.lastTapTime = 0; // 초기화
          this.zoomReset();
          return;
        }
      }
      
      // 마지막 클릭 정보 저장
      this.lastTapTime = currentTime;
      this.lastTapX = clickX;
      this.lastTapY = clickY;

      // 줌 버튼은 즉시 처리 (더블클릭 대기 없음)
      for (const btn of this.zoomButtons) {
        if (clickX >= btn.x && clickX <= btn.x + btn.width &&
            clickY >= btn.y && clickY <= btn.y + btn.height) {
          if (btn.type === 'zoomIn') {
            this.zoomIn();
            if (this.config.onZoomButtonClick) {
              this.config.onZoomButtonClick('zoomIn', this.zoomStart, this.zoomEnd);
            }
          } else if (btn.type === 'zoomOut') {
            this.zoomOut();
            if (this.config.onZoomButtonClick) {
              this.config.onZoomButtonClick('zoomOut', this.zoomStart, this.zoomEnd);
            }
          } else if (btn.type === 'reset') {
            this.zoomReset();
            if (this.config.onZoomButtonClick) {
              this.config.onZoomButtonClick('reset', this.zoomStart, this.zoomEnd);
            }
          }
          return;
        }
      }

      // 차트 영역 클릭은 더블클릭과 구분하기 위해 지연 처리
      if (this.clickTimer !== null) {
        clearTimeout(this.clickTimer);
        this.clickTimer = null;
      }
      
      this.clickTimer = window.setTimeout(() => {
        this.clickTimer = null;
        
        // 이벤트 마커 클릭 확인
        for (const marker of this.eventMarkers) {
          let isInside = false;
          
          // Range 이벤트 라벨 (사각형 영역 체크)
          if ((marker.event as any).isRangeLabel && (marker.event as any).labelRect) {
            const rect = (marker.event as any).labelRect;
            isInside = clickX >= rect.x && clickX <= rect.x + rect.width &&
                       clickY >= rect.y && clickY <= rect.y + rect.height;
          }
          // X-only 이벤트 (세로 라인)는 X축 거리만 체크
          else if (isXPointEvent(marker.event)) {
            const dx = Math.abs(clickX - marker.x);
            isInside = dx <= marker.radius;
          }
          // Y-only 이벤트 (가로 라인)는 Y축 거리만 체크
          else if (isYPointEvent(marker.event)) {
            const dy = Math.abs(clickY - marker.y);
            isInside = dy <= marker.radius;
          }
          // 다른 이벤트는 원형 영역으로 체크
          else {
            const dx = clickX - marker.x;
            const dy = clickY - marker.y;
            isInside = Math.sqrt(dx * dx + dy * dy) <= marker.radius;
          }
          
          if (isInside) {
            // 토글: 같은 마커를 클릭하면 닫기, 다른 마커를 클릭하면 열기
            this.hoveredEventMarker = this.hoveredEventMarker === marker.event ? null : marker.event;
            this.render();
            return;
          }
        }
        
        if (this.state.showPoints && this.dataPoints.length > 0) {
          const clickRadius = 12;
          for (const point of this.dataPoints) {
            const dx = clickX - point.x;
            const dy = clickY - point.y;
            if (Math.sqrt(dx * dx + dy * dy) <= clickRadius) {
              const newHoveredPoint = this.hoveredPoint === point ? null : point;
              this.hoveredPoint = newHoveredPoint;
              
              // 콜백 호출
              if (this.config.onPointTooltip) {
                this.config.onPointTooltip(newHoveredPoint);
              }
              
              this.render();
              return;
            }
          }
        }
        
        for (const item of this.legendItems) {
          if (clickX >= item.x && clickX <= item.x + item.width &&
              clickY >= item.y && clickY <= item.y + item.height) {
            
            // 평균선 범례인지 확인 (average: 또는 moving:로 시작)
            if (item.symbol.startsWith('average:') || item.symbol.startsWith('moving:')) {
              // 평균선 토글 (visible 속성만 변경)
              if (item.symbol === 'average:') {
                // 전체 평균선 토글
                const avgItem = this.state.showAverage.find(avg => avg.type === 'average');
                if (avgItem) {
                  avgItem.visible = !avgItem.visible;
                }
              } else if (item.symbol.startsWith('moving:')) {
                // 이동평균선 토글
                const xWidth = parseInt(item.symbol.split(':')[1]);
                const avgItem = this.state.showAverage.find(avg => avg.type === 'moving' && avg.xWidth === xWidth);
                if (avgItem) {
                  avgItem.visible = !avgItem.visible;
                }
              }
            } else {
              // 티커 토글
              const wasVisible = this.state.visibleTickers.has(item.symbol);
              if (wasVisible) {
                this.state.visibleTickers.delete(item.symbol);
              } else {
                this.state.visibleTickers.add(item.symbol);
              }
              
              // 콜백 호출
              if (this.config.onLegendClick) {
                this.config.onLegendClick(item.symbol, !wasVisible);
              }
            }
            
            this.render();
            return;
          }
        }
      }, this.clickDelay);
    });

    // 더블클릭 (PC 및 모바일 모드)
    this.canvas.addEventListener('dblclick', (e: MouseEvent) => {
      e.preventDefault(); // 기본 동작 방지
      
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 클릭 타이머 취소 (더블클릭이 감지되면 단일 클릭 처리 안함)
      if (this.clickTimer !== null) {
        clearTimeout(this.clickTimer);
        this.clickTimer = null;
      }

      // 줌 버튼 영역이면 무시
      for (const btn of this.zoomButtons) {
        if (x >= btn.x && x <= btn.x + btn.width &&
            y >= btn.y && y <= btn.y + btn.height) {
          return;
        }
      }

      // 범례 영역이면 무시
      for (const item of this.legendItems) {
        if (x >= item.x && x <= item.x + item.width &&
            y >= item.y && y <= item.y + item.height) {
          return;
        }
      }

      // 확대 상태에서 차트 영역을 더블클릭하면 초기화
      if (this.isInChartArea(x, y) && (this.zoomStart > 0 || this.zoomEnd < 100)) {
        this.zoomReset();
      }
    });

    // 휠
    this.canvas.addEventListener('wheel', (e: WheelEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      if (this.isInChartArea(x, y)) {
        e.preventDefault();
        if (e.deltaY < 0) {
          this.zoomIn(x);
        } else {
          this.zoomOut(x);
        }
      }
    }, { passive: false });

    // 터치 시작
    this.canvas.addEventListener('touchstart', (e: TouchEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      if (e.touches.length === 2) {
        this.lastPinchDistance = this.getPinchDistance(e.touches);
        this.isTouchDragging = false;
        this.isTouchPanning = false;
        return;
      }

      for (const btn of this.zoomButtons) {
        if (x >= btn.x && x <= btn.x + btn.width &&
            y >= btn.y && y <= btn.y + btn.height) {
          return;
        }
      }

      if (this.isInChartArea(x, y)) {
        this.touchStartX = x;
        this.touchStartY = y;
        
        if (this.zoomStart === 0 && this.zoomEnd === 100) {
          this.isTouchDragging = true;
          // 드래그 시작 위치를 차트 영역 내로 제한
          this.dragStartX = Math.max(this.chartAreaLeft, Math.min(this.getChartRight(), x));
          this.dragCurrentX = this.dragStartX;
        } else {
          this.isTouchPanning = true;
          this.panStartX = x;
        }
      }
    }, { passive: true });

    // 터치 이동
    this.canvas.addEventListener('touchmove', (e: TouchEvent) => {
      const rect = this.canvas.getBoundingClientRect();

      if (e.touches.length === 2 && this.lastPinchDistance !== null) {
        e.preventDefault();
        const newDistance = this.getPinchDistance(e.touches);
        const delta = newDistance - this.lastPinchDistance;
        
        const pinchCenterX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
        
        if (Math.abs(delta) > 10) {
          if (delta > 0) {
            this.zoomIn(pinchCenterX);
          } else {
            this.zoomOut(pinchCenterX);
          }
          this.lastPinchDistance = newDistance;
        }
        return;
      }

      if (e.touches.length !== 1) return;
      
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      if (this.isTouchDragging && this.dragStartX !== null) {
        e.preventDefault();
        // 드래그 현재 위치를 차트 영역 내로 제한
        this.dragCurrentX = Math.max(this.chartAreaLeft, Math.min(this.getChartRight(), x));
        this.isDragging = true;
        this.render();
        return;
      }

      if (this.isTouchPanning && this.panStartX !== null) {
        e.preventDefault();
        const dx = x - this.panStartX;
        const pixelRange = this.canvasWidth - this.padding * 2;
        const percentDelta = (dx / pixelRange) * (this.zoomEnd - this.zoomStart);
        
        let newStart = this.zoomStart - percentDelta;
        let newEnd = this.zoomEnd - percentDelta;
        
        if (newStart < 0) {
          newEnd -= newStart;
          newStart = 0;
        }
        if (newEnd > 100) {
          newStart -= (newEnd - 100);
          newEnd = 100;
        }
        
        this.zoomStart = Math.max(0, newStart);
        this.zoomEnd = Math.min(100, newEnd);
        this.panStartX = x;
        
        this.zoomStart = Math.round(this.zoomStart * 100) / 100;
        this.zoomEnd = Math.round(this.zoomEnd * 100) / 100;
        
        if (Math.abs(this.zoomStart) < 0.5 && Math.abs(this.zoomEnd - 100) < 0.5) {
          this.zoomStart = 0;
          this.zoomEnd = 100;
          this.isTouchPanning = false;
          this.panStartX = null;
        }
        
        this.render();
        return;
      }
    }, { passive: false });

    // 터치 종료
    this.canvas.addEventListener('touchend', (e: TouchEvent) => {
      const rect = this.canvas.getBoundingClientRect();

      if (this.lastPinchDistance !== null) {
        this.lastPinchDistance = null;
        return;
      }

      if (this.isTouchDragging && this.dragStartX !== null && this.dragCurrentX !== null) {
        const startX = Math.min(this.dragStartX, this.dragCurrentX);
        const endX = Math.max(this.dragStartX, this.dragCurrentX);
        const selectionWidth = endX - startX;
        
        if (selectionWidth > 20) {
          const chartWidth = this.canvasWidth - this.padding * 2;
          const startPercent = ((startX - this.padding) / chartWidth) * 100;
          const endPercent = ((endX - this.padding) / chartWidth) * 100;
          
          if (this.zoomStart === 0 && this.zoomEnd === 100) {
            this.zoomStart = startPercent;
            this.zoomEnd = endPercent;
          } else {
            const currentRange = this.zoomEnd - this.zoomStart;
            this.zoomStart = this.zoomStart + (startPercent / 100) * currentRange;
            this.zoomEnd = this.zoomStart + ((endPercent - startPercent) / 100) * currentRange;
          }
          this.zoomStart = Math.max(0, this.zoomStart);
          this.zoomEnd = Math.min(100, this.zoomEnd);
        } else if (selectionWidth < 10 && this.touchStartX !== null && this.touchStartY !== null) {
          const tapX = this.touchStartX;
          const tapY = this.touchStartY;
          const currentTime = Date.now();
          const tapThreshold = 300; // 300ms 이내
          const distanceThreshold = 30; // 30px 이내
          
          // 더블탭 감지
          const timeDiff = currentTime - this.lastTapTime;
          const dx = tapX - this.lastTapX;
          const dy = tapY - this.lastTapY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (timeDiff < tapThreshold && distance < distanceThreshold) {
            // 더블탭 감지됨 - 확대 상태에서 차트 영역이면 초기화
            if (this.isInChartArea(tapX, tapY) && (this.zoomStart > 0 || this.zoomEnd < 100)) {
              this.zoomReset();
              this.lastTapTime = 0; // 초기화
              this.isTouchDragging = false;
              this.isDragging = false;
              this.dragStartX = null;
              this.dragCurrentX = null;
              this.touchStartX = null;
              this.touchStartY = null;
              return;
            }
          }
          
          // 마지막 탭 정보 저장
          this.lastTapTime = currentTime;
          this.lastTapX = tapX;
          this.lastTapY = tapY;
          
          for (const btn of this.zoomButtons) {
            if (tapX >= btn.x && tapX <= btn.x + btn.width &&
                tapY >= btn.y && tapY <= btn.y + btn.height) {
              if (btn.type === 'zoomIn') {
                this.zoomIn();
                if (this.config.onZoomButtonClick) {
                  this.config.onZoomButtonClick('zoomIn', this.zoomStart, this.zoomEnd);
                }
              } else if (btn.type === 'zoomOut') {
                this.zoomOut();
                if (this.config.onZoomButtonClick) {
                  this.config.onZoomButtonClick('zoomOut', this.zoomStart, this.zoomEnd);
                }
              } else if (btn.type === 'reset') {
                this.zoomReset();
                if (this.config.onZoomButtonClick) {
                  this.config.onZoomButtonClick('reset', this.zoomStart, this.zoomEnd);
                }
              }
              break;
            }
          }
          
          // 이벤트 마커 탭 확인
          for (const marker of this.eventMarkers) {
            let isInside = false;
            
            // Range 이벤트 라벨 (사각형 영역 체크)
            if ((marker.event as any).isRangeLabel && (marker.event as any).labelRect) {
              const rect = (marker.event as any).labelRect;
              isInside = tapX >= rect.x && tapX <= rect.x + rect.width &&
                         tapY >= rect.y && tapY <= rect.y + rect.height;
            }
            // X-only 이벤트 (세로 라인)는 X축 거리만 체크
            else if (isXPointEvent(marker.event)) {
              const dx = Math.abs(tapX - marker.x);
              isInside = dx <= marker.radius;
            }
            // Y-only 이벤트 (가로 라인)는 Y축 거리만 체크
            else if (isYPointEvent(marker.event)) {
              const dy = Math.abs(tapY - marker.y);
              isInside = dy <= marker.radius;
            }
            // 다른 이벤트는 원형 영역으로 체크
            else {
              const dx = tapX - marker.x;
              const dy = tapY - marker.y;
              isInside = Math.sqrt(dx * dx + dy * dy) <= marker.radius;
            }
            
            if (isInside) {
              // 토글: 같은 마커를 탭하면 닫기, 다른 마커를 탭하면 열기
              this.hoveredEventMarker = this.hoveredEventMarker === marker.event ? null : marker.event;
              break;
            }
          }
          
          if (this.state.showPoints && this.dataPoints.length > 0) {
            const tapRadius = 20;
            for (const point of this.dataPoints) {
              const dx = tapX - point.x;
              const dy = tapY - point.y;
              if (Math.sqrt(dx * dx + dy * dy) <= tapRadius) {
                const newHoveredPoint = this.hoveredPoint === point ? null : point;
                this.hoveredPoint = newHoveredPoint;
                
                // 콜백 호출
                if (this.config.onPointTooltip) {
                  this.config.onPointTooltip(newHoveredPoint);
                }
                
                break;
              }
            }
          }
          
          for (const item of this.legendItems) {
            if (tapX >= item.x && tapX <= item.x + item.width &&
                tapY >= item.y && tapY <= item.y + item.height) {
              
              // 평균선 범례인지 확인 (average: 또는 moving:로 시작)
              if (item.symbol.startsWith('average:') || item.symbol.startsWith('moving:')) {
                // 평균선 토글 (visible 속성만 변경)
                if (item.symbol === 'average:') {
                  // 전체 평균선 토글
                  const avgItem = this.state.showAverage.find(avg => avg.type === 'average');
                  if (avgItem) {
                    avgItem.visible = !avgItem.visible;
                  }
                } else if (item.symbol.startsWith('moving:')) {
                  // 이동평균선 토글
                  const xWidth = parseInt(item.symbol.split(':')[1]);
                  const avgItem = this.state.showAverage.find(avg => avg.type === 'moving' && avg.xWidth === xWidth);
                  if (avgItem) {
                    avgItem.visible = !avgItem.visible;
                  }
                }
              } else {
                // 티커 토글
                const wasVisible = this.state.visibleTickers.has(item.symbol);
                if (wasVisible) {
                  this.state.visibleTickers.delete(item.symbol);
                } else {
                  this.state.visibleTickers.add(item.symbol);
                }
                
                // 콜백 호출
                if (this.config.onLegendClick) {
                  this.config.onLegendClick(item.symbol, !wasVisible);
                }
              }
              
              break;
            }
          }
        }
        
        this.isTouchDragging = false;
        this.isDragging = false;
        this.dragStartX = null;
        this.dragCurrentX = null;
        this.render();
        return;
      }

      if (this.isTouchPanning) {
        this.isTouchPanning = false;
        this.panStartX = null;
        this.render();
      }

      this.touchStartX = null;
      this.touchStartY = null;
    }, { passive: true });

    // 터치 취소
    this.canvas.addEventListener('touchcancel', () => {
      this.isTouchDragging = false;
      this.isTouchPanning = false;
      this.isDragging = false;
      this.dragStartX = null;
      this.dragCurrentX = null;
      this.panStartX = null;
      this.touchStartX = null;
      this.touchStartY = null;
      this.lastPinchDistance = null;
      this.render();
    }, { passive: true });
  }

  render() {
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    
    // 서버사이드 환경에서는 canvas의 width/height 속성 사용
    let cssW: number, cssH: number;
    if (this.canvas.getBoundingClientRect) {
      const rect = this.canvas.getBoundingClientRect();
      cssW = rect.width;
      cssH = rect.height;
    } else {
      // getBoundingClientRect가 없으면 canvas의 width/height 속성 사용
      cssW = this.canvas.width;
      cssH = this.canvas.height;
    }
    
    const width = Math.max(300, cssW);
    let totalHeight = Math.max(200, cssH);
    
    // 캔버스 크기 설정 전에 전체 배경색 먼저 그리기
    this.canvas.width = width * dpr;
    this.canvas.height = totalHeight * dpr;
    this.width = width;
    this.height = totalHeight;
    this.canvasWidth = width;
    this.canvasHeight = totalHeight;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    
    // 전체 캔버스 배경색 그리기
    const bgColor = this.config.backgroundColor || '#FFFFFF';
    this.ctx.fillStyle = bgColor;
    this.ctx.fillRect(0, 0, width, totalHeight);
    
    // 차트 영역 계산: 캔버스에서 padding을 뺀 영역
    // chartAreaLeft는 paddingLeft, chartAreaWidth는 전체에서 좌우 padding을 뺀 값
    this.chartAreaLeft = this.paddingLeft;
    this.chartAreaWidth = width - this.paddingLeft - this.paddingRight;
    
    // 기본 padding은 차트 레이아웃 계산용 (상하 여백)
    this.padding = this.paddingTop;
    
    // 차트 레이아웃 계산
    const chartCount = this.state.visibleChartKeys.length;
    const xAxisLabelHeight = this.paddingBottom;
    const availableHeight = totalHeight - this.paddingTop - xAxisLabelHeight;
    const heightPerChart = availableHeight / chartCount;
    
    // 각 차트의 DrawArea 계산
    const chartAreas: Array<DrawArea & { key: string }> = [];
    this.state.visibleChartKeys.forEach((key, index) => {
      chartAreas.push({
        key,
        x: this.paddingLeft,
        y: this.paddingTop + index * heightPerChart,
        width: this.chartAreaWidth,
        height: heightPerChart
      });
    });
    
    // 활성화된 티커만 필터링
    let filteredDataMap = new Map<string, { color?: string; lineMode?: LineType; movingAverageXwidth?: number[]; data: { [key: string]: { datas: ChartData[]; events?: EventMarker[]; lineMode?: LineType } } }>();
    this.dataMap.forEach((value, symbol) => {
      if (this.state.enabledTickers.has(symbol)) {
        filteredDataMap.set(symbol, value);
      }
    });
    
    // 전체 시간 범위 계산 (실제 데이터에서 계산)
    let globalMinTime = Infinity;
    let globalMaxTime = -Infinity;
    
    // 실제 데이터에서 시간 범위 계산 (config.xMin/xMax는 여기서 사용하지 않음)
    filteredDataMap.forEach((value) => {
      Object.values(value.data).forEach(chartDataObj => {
        chartDataObj.datas.forEach(d => {
          const time = d.x;
          if (time < globalMinTime) globalMinTime = time;
          if (time > globalMaxTime) globalMaxTime = time;
        });
      });
    });
    
    const globalTimeRange = globalMaxTime - globalMinTime || 1;
    
    // rangeSlider로 시간 범위 계산
    let targetMinTime = globalMinTime;
    let targetMaxTime = globalMaxTime;
    
    // 1. config.xMin/xMax 우선 적용 (초기 범위 설정)
    if (this.config.xMin !== undefined || this.config.xMax !== undefined) {
      if (this.config.xMin !== undefined) {
        const configMin = typeof this.config.xMin === 'function' ? this.config.xMin('default') : this.config.xMin;
        if (configMin !== undefined) {
          targetMinTime = configMin;
        }
      }
      if (this.config.xMax !== undefined) {
        const configMax = typeof this.config.xMax === 'function' ? this.config.xMax('default') : this.config.xMax;
        if (configMax !== undefined) {
          targetMaxTime = configMax;
        }
      }
    }
    
    // 2. rangeMin/rangeMax가 설정되어 있으면 추가 적용
    if (this.state.rangeMin !== undefined && this.state.rangeMax !== undefined) {
      // rangeMin/rangeMax가 timestamp인지 퍼센트인지 판단
      // timestamp는 보통 매우 큰 값 (1000000000000 이상)
      // 퍼센트는 0-100 범위
      const isRangeTimestamp = this.state.rangeMin > 1000 || this.state.rangeMax > 1000;
      
      if (isRangeTimestamp) {
        // timestamp로 직접 사용
        targetMinTime = this.state.rangeMin;
        targetMaxTime = this.state.rangeMax;
      } else if (this.state.rangeMin > 0 || this.state.rangeMax < 100) {
        // 퍼센트로 계산 (config.xMin/xMax 기준으로)
        const baseMinTime = targetMinTime;
        const baseMaxTime = targetMaxTime;
        const baseTimeRange = baseMaxTime - baseMinTime || 1;
        targetMinTime = baseMinTime + baseTimeRange * this.state.rangeMin / 100;
        targetMaxTime = baseMinTime + baseTimeRange * this.state.rangeMax / 100;
      }
    }
    
    // zoom 범위 적용
    if (this.zoomStart > 0 || this.zoomEnd < 100) {
      const rangeTimeSpan = targetMaxTime - targetMinTime;
      const zoomMinTime = targetMinTime + rangeTimeSpan * this.zoomStart / 100;
      const zoomMaxTime = targetMinTime + rangeTimeSpan * this.zoomEnd / 100;
      targetMinTime = zoomMinTime;
      targetMaxTime = zoomMaxTime;
    }
    
    // 시간 기반으로 각 티커 필터링
    const hasRangeSet = this.state.rangeMin !== undefined && this.state.rangeMax !== undefined;
    const isRangeTimestamp = hasRangeSet && (this.state.rangeMin! > 1000 || this.state.rangeMax! > 1000);
    const isRangePercent = hasRangeSet && !isRangeTimestamp && (this.state.rangeMin! > 0 || this.state.rangeMax! < 100);
    const needsTimeFiltering = isRangeTimestamp || 
                                isRangePercent ||
                                this.zoomStart > 0 || 
                                this.zoomEnd < 100;
    
    if (needsTimeFiltering) {
      const timeFilteredMap = new Map<string, { color?: string; lineMode?: LineType; movingAverageXwidth?: number[]; data: { [key: string]: { datas: ChartData[]; events?: EventMarker[]; lineMode?: LineType } } }>();
      filteredDataMap.forEach((value, symbol) => {
        const filteredData: { [key: string]: { datas: ChartData[]; events?: EventMarker[]; lineMode?: LineType } } = {};
        
        Object.keys(value.data).forEach(dataType => {
          const chartDataObj = value.data[dataType];
          const data = chartDataObj.datas;
          if (data.length === 0) {
            filteredData[dataType] = { 
              datas: [], 
              events: chartDataObj.events,
              lineMode: chartDataObj.lineMode // lineMode 보존
            };
            return;
          }
          
          let startIdx = -1;
          let endIdx = -1;
          for (let i = 0; i < data.length; i++) {
            const time = data[i].x;
            if (time >= targetMinTime && startIdx === -1) {
              startIdx = i;
            }
            if (time <= targetMaxTime) {
              endIdx = i;
            }
          }
          
          if (startIdx === -1 || endIdx === -1) {
            filteredData[dataType] = { 
              datas: [], 
              events: chartDataObj.events,
              lineMode: chartDataObj.lineMode // lineMode 보존
            };
            return;
          }
          
          const actualStartIdx = Math.max(0, startIdx - 1);
          const actualEndIdx = Math.min(data.length - 1, endIdx + 1);
          filteredData[dataType] = { 
            datas: data.slice(actualStartIdx, actualEndIdx + 1), 
            events: chartDataObj.events,
            lineMode: chartDataObj.lineMode // lineMode 보존
          };
        });
        
        timeFilteredMap.set(symbol, { 
          color: value.color, 
          lineMode: value.lineMode, // 티커별 lineMode 보존
          movingAverageXwidth: value.movingAverageXwidth, // 이동평균선 설정 보존
          data: filteredData 
        });
      });
      filteredDataMap = timeFilteredMap;
    }
    
    // 시간 포인트 수집
    const allTimePoints = new Set<number>();
    filteredDataMap.forEach((value) => {
      Object.values(value.data).forEach(chartDataObj => {
        chartDataObj.datas.forEach(d => {
          const time = d.x;
          allTimePoints.add(time);
        });
      });
    });
    this.sortedTimes = Array.from(allTimePoints).sort((a, b) => a - b);
    
    const displayMinTime = targetMinTime;
    const displayMaxTime = targetMaxTime;
    
    // 데이터 업데이트
    const oldDataMap = this.dataMap;
    this.dataMap = filteredDataMap;
    
    // Chart options
    const chartOptions: ChartOptions = {
      showCandles: this.state.showCandles,
      fillGaps: this.state.showGaps,
      lineMode: this.state.lineMode,
      showAverage: this.state.showAverage,
      hideValues: this.state.hideValues,
      hideLines: this.state.hideLines,
      showGrid: this.state.showGrid,
      displayMinTime,
      displayMaxTime
    };
    
    // 각 차트 그리기 (DrawArea 전달)
    let firstChartResult: any = null;
    const allMinMaxBySymbol = new Map<string, Map<string, { min: number; max: number }>>();
    
    chartAreas.forEach((area, index) => {
      const result = this.drawChartKey(
        area.key,
        area,
        this.state.visibleTickers,
        this.sortedTimes,
        chartOptions
      );
      
      // 각 chartKey별 minMaxBySymbol 저장
      if (result && result.minMaxBySymbol) {
        allMinMaxBySymbol.set(area.key, result.minMaxBySymbol);
      }
      
      // 첫 번째 차트의 결과를 legend에 사용
      if (index === 0 && result) {
        firstChartResult = result;
      }
    });
    
    // 범례 영역 계산 (캔버스 왼쪽 끝부터 시작, 여러 줄 지원)
    const legendArea: DrawArea = {
      x: 10, // 캔버스 왼쪽 끝에서 10px 여백
      y: this.paddingTop - 25,
      width: this.canvasWidth - 20, // 캔버스 전체 너비 사용
      height: 60 // 최대 3줄 정도 표시 가능하도록 충분한 높이
    };
    
    // 범례 영역 배경색 먼저 그리기 (Y축 타이틀 영역 제외)
    // 범례 배경을 그리지 않음 - 차트 영역과 겹치는 문제 방지
    /*
    const legendBgColor = this.config.legendBackgroundColor || this.config.backgroundColor;
    if (legendBgColor) {
      this.ctx.fillStyle = legendBgColor;
      // Y축 타이틀이 그려지는 영역(paddingLeft)을 제외하고 범례 배경 그리기
      // legendArea.y부터 시작하여 Y축 레이블을 덮지 않도록 함
      const legendBottomY = legendArea.y + legendArea.height;
      this.ctx.fillRect(this.paddingLeft, legendArea.y, this.canvasWidth - this.paddingLeft, legendArea.height);
    }
    */
    
    // Draw legend (DrawArea 전달)
    if (firstChartResult && !this.config.hideLegend) {
      this.legendItems = this.drawLegend(legendArea, firstChartResult.dataBySymbol, this.state.visibleTickers);
    }

    // 차트 간 구분선 그리기
    chartAreas.forEach((area, index) => {
      if (index > 0) {
        this.ctx.strokeStyle = this.getAxisColor();
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(area.x, area.y);
        this.ctx.lineTo(area.x + area.width, area.y);
        this.ctx.stroke();
      }
    });

    // 차트 영역의 실제 하단 계산
    const chartBottom = chartAreas.length > 0 
      ? chartAreas[chartAreas.length - 1].y + chartAreas[chartAreas.length - 1].height
      : totalHeight - xAxisLabelHeight;
    
    // X축 영역
    const xAxisArea: DrawArea = {
      x: this.paddingLeft,
      y: chartBottom,
      width: this.chartAreaWidth,
      height: xAxisLabelHeight
    };
    
    // X축 선 (항상 그림)
    const baselineY = xAxisArea.y;
    this.ctx.strokeStyle = this.getAxisColor();
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(xAxisArea.x, baselineY);
    this.ctx.lineTo(xAxisArea.x + xAxisArea.width, baselineY);
    this.ctx.stroke();
    
    // X축 레이블 (DrawArea 전달)
    if (!this.config.hideXAxisLabels) {
      this.drawXAxisLabels(xAxisArea, this.sortedTimes, displayMinTime, displayMaxTime);
    }

    // 포인트 그리기
    if (this.state.showPoints) {
      this.dataPoints = this.drawDataPoints(this.state.visibleTickers, chartAreas, this.sortedTimes, displayMinTime, displayMaxTime);
    } else {
      this.dataPoints = [];
    }

    // 이벤트 마커 (포인트 위에 그려지도록)
    this.drawEventMarkers(this.sortedTimes, chartBottom, this.state.showEvents, chartAreas, displayMinTime, displayMaxTime, allMinMaxBySymbol);

    // 캔버스 전체 영역
    const canvasArea: DrawArea = {
      x: 0,
      y: 0,
      width: width,
      height: totalHeight
    };

    // 호버된 포인트 툴팁 표시
    if (this.state.showPoints && this.hoveredPoint) {
      this.drawPointTooltip(this.hoveredPoint, canvasArea);
    }

    // 이벤트 툴팁 표시 (포인트 툴팁보다 나중에 그려서 맨 위에 표시)
    this.eventTooltipsToRender.forEach(tooltip => {
      this.drawEventTooltip(tooltip.event, tooltip.x, tooltip.y, tooltip.pointsDown);
    });

    // 줌 버튼 영역
    const buttonSize = 25;
    const buttonGap = 10;
    const totalButtonWidth = buttonSize * 3 + buttonGap * 2;
    const zoomButtonArea: DrawArea = {
      x: (width - totalButtonWidth) / 2,
      y: this.paddingTop + 5,
      width: totalButtonWidth,
      height: buttonSize
    };

    // 줌 버튼 그리기 (showZoomButtons 옵션이 true일 때만)
    if (this.config.showZoomButtons) {
      this.zoomButtons = this.drawZoomButtons(zoomButtonArea, this.zoomStart, this.zoomEnd, displayMinTime, displayMaxTime);
    } else {
      this.zoomButtons = [];
    }

    // 드래그 선택 영역 그리기
    this.drawDragSelection(this.isDragging, this.dragStartX, this.dragCurrentX, chartBottom);

    // 크로스헤어 그리기
    if (this.mouseX !== null && this.mouseY !== null && !this.isDragging && !this.isPanning) {
      this.drawCrosshair(this.mouseX, this.mouseY, chartAreas, this.sortedTimes, displayMinTime, displayMaxTime);
    }
    
    // 데이터 복원
    this.dataMap = oldDataMap;
  }
}

export type { ChartData, EventMarker, ChartOptions, RenderState };
