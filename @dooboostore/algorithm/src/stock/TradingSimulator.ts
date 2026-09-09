/** 트레이딩 조건 탐색 — 입력(FindBestOptions) 스펙만 유지, 구현은 갈아엎기 예정 */

export namespace TradingSimulator {
  /** findBestConfig 입력 — 조건 탐색 설정값만. 출력은 조건(maConfigs/exitConfigs/maResolveMode/exitResolveMode) */
  export interface FindBestOptions {
    trend?: number; riskAversion?: number;
    /** 매수 적용률 0~1 (기본 1) — 반환되는 MA 매수 percent에 곱함 */
    buyPctRate?: number;
    /** 매도 적용률 0~1 (기본 1) — 반환되는 MA 매도 percent·실현 sellPercent에 곱함 */
    sellPctRate?: number;
    /** 랜덤 탐색 후보 수 (기본 100). hill-climb·베이스라인은 별도라 1이어도 0이 되진 않음 */
    trials?: number;
  }
}
