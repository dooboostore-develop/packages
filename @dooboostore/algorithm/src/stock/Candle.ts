/** OHLCV 봉 1개 — 엔진·차트·페이지 공통 입력 타입 */
export interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
