import { Observable, Subscription } from '@dooboostore/core/message';
import { InferPromise } from '@dooboostore/core/types';
import { Promises } from '@dooboostore/core/promise';

export namespace AnimationFrameUtils {
  export type FpsConfigParamType = { window: Window, second?: number };

  export type FpsCallBackData = { fpsConfigParam: FpsConfigParamType, fps: number, startTimestamp: number, timestamp: number };

// fps
  export function fps(params: FpsConfigParamType, callback: (value: FpsCallBackData) => void): Subscription {
    let startTimestamp: number | null = null;
    let stop = false;

    const animate = (currentTimestamp: number) => {
      if (startTimestamp !== null) {
        const delta = currentTimestamp - startTimestamp;
        const fps = ((params?.second??1) * 1000) / delta; // 밀리초를 초당 프레임으로 변환
        callback({ fpsConfigParam: params, fps, startTimestamp: startTimestamp, timestamp: currentTimestamp });
      }
      startTimestamp = currentTimestamp;

      if (!stop) {
        window.requestAnimationFrame(animate);
      }
    };

    window.requestAnimationFrame(animate);

    return {
      unsubscribe: () => {
        stop = true;
      }
    };
  }
  // export function fps(params: FpsConfigParamType): Promise<number>;
  // export function fps(params: FpsConfigParamType, callback?: (value: number) => void): Promise<number> | void {
  //   let targetCallback: (value: number) => void;
  //   let promise: Promise<number>;
  //   if (callback) {
  //     targetCallback = callback;
  //   } else {
  //     const promiseSet = Promises.withResolvers<number>();
  //     promise = promiseSet.promise;
  //     targetCallback = promiseSet.resolve;
  //   }
  //   // const second = 1;
  //   let startTime = null;
  //   let frameCount = 0;
  //   const mm = (params.second ?? 0) + 1000;
  //
  //   // timestamp는 애니메이션 요청이 시작된 이후 경과한 시간을 밀리초 단위로 나타냅니다.
  //   const animate = (timestamp: number) => {
  //     if (startTime === null) {
  //       startTime = timestamp;
  //     }
  //     frameCount++;
  //     // 1초 후에 FPS 계산
  //     if (timestamp - startTime >= mm) {
  //       const fps = frameCount / ((timestamp - startTime) / mm);
  //       targetCallback(fps); // frameCount
  //     } else {
  //       window.requestAnimationFrame(animate);
  //     }
  //   }
  //   window.requestAnimationFrame(animate);
  //   return promise;
  // }

  // export const fpsSubscribe = (config: FpsConfigParamType, callback: (value: number) => void): Subscription => {
  //   let stop = false;
  //   const data = () => {
  //     AnimationFrameUtils.fps(config, (v) => {
  //       if (stop) return;
  //       callback(v)
  //       data();
  //     })
  //   }
  //   data();
  //   return {
  //     unsubscribe: () => {
  //       stop = true;
  //     }
  //   }
  // }

  export const dividePerFpsObservable = ({fpsConfig,  divideSize}: { fpsConfig: FpsConfigParamType,  divideSize: number }): Observable<FpsCallBackData &{gapPosition: number, gapSize: number}> => {
    return {
      subscribe: (res) => {
        // 디스플레이마다 다르게 나올 수 있음 모니터 헤르츠
        let fps = 0;
        // 1초당 그리고 싶은 횟수 (이걸로 애니메이션을 그릴 때 몇번 그릴지 결정)  성능조절가능
        // private readonly drawCountPerSecond: number = 60;
        const getDrawFpsGap = () => {
          return Math.floor(fps / divideSize);
        }

        let gapPosition = 0;

        const fpsSubscription  = AnimationFrameUtils.fps(fpsConfig, (fpsConfig) => {
          fps = fpsConfig.fps;
            gapPosition++;
            const gapSize = getDrawFpsGap();
            if (gapPosition >= gapSize) {
              // console.log('dddddddddrrrrraaaww' , fpsConfig, divideSize, animationCount, drawFpsGap)
              res({...fpsConfig, ...{gapPosition, gapSize} });
              gapPosition = 0;
            }
        });
        return {
          unsubscribe: () => {
            fpsSubscription.unsubscribe();
          }
        };
      }
    }
  }

}
