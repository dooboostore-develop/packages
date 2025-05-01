import { Point3D } from '../entity/Point3D';
import { Vector } from '../entity/Vector';
import { Obj } from '../entity/object/obj/Obj';

export namespace MathUtil {
  export type BezierConfig = { p1x: number|'random', p1y: number|'random', p2x: number|'random', p2y: number|'random' } | [number|'random', number|'random', number|'random', number|'random'];
  export const getMinByObjectArray = (objectArray: Array<any>, varName: string) => {
    let min;
    if (varName && objectArray && objectArray.length > 0) {
      min = objectArray[0][varName];
      for (let i = 1; i < objectArray.length; i++) {
        min = Math.min(min, objectArray[i][varName]);
      }
    }
    return min;
  };

  export const getMaxByObjectArray = (objectArray: Array<any>, varName: string) => {
    let max;
    if (varName && objectArray && objectArray.length > 0) {
      max = objectArray[0][varName];
      for (let i = 1; i < objectArray.length; i++) {
        max = Math.max(max, objectArray[i][varName]);
      }
    }
    return max;
  };

  export const getSumByObjectArray = (objectArray: Array<any>, varName: string) => {
    let sum = 0;
    if (varName && objectArray && objectArray.length > 0) {
      for (let i = 0; i < objectArray.length; i++) {
        sum += objectArray[i][varName];
      }
    }
    return sum;
  };

  export const radians = (aAngle: number): number => {
    return aAngle / 180 * Math.PI;
  };

  // static createCanvas(w, h) {
  //     let canvas = document.createElement('canvas');
  //     canvas.width = w;
  //     canvas.height = h;
  //     return canvas;
  // }
  //
  // static copyCanvas(canvas) {
  //     let newCanvas = document.createElement('canvas');
  //     newCanvas.width = canvas.width;
  //     newCanvas.height = canvas.height;
  //     context = newCanvas.getContext('2d');
  //     context.drawImage(canvas, 0, 0);
  //     return newCanvas;
  // }

  //end - start    끝과 시작의 사이길이를 취득한다.
  export const getBetweenLength = (start: number, end: number) => {
    return end - start;
  };

  //전체값에서 일부값은 몇 퍼센트? 계산법 공식    tot에서  data는 몇%인가.
  export const getPercentByTot = (tot: number, data: number) => {
    /*
    전체값에서 일부값은 몇 퍼센트? 계산법 공식
    일부값 ÷ 전체값 X 100
    예제) 300에서 105는 몇퍼센트?
    답: 35%
    */
    return (data / tot) * 100;
  };

  //전체값의 몇 퍼센트는 얼마? 계산법 공식    tot에서  wantPercent는 몇인가?
  export const getValueByTotInPercent = (tot: number, wantPercent: number) => {
    /*
    전체값 X 퍼센트 ÷ 100
    예제) 300의 35퍼센트는 얼마?
    답) 105
     */
    return (tot * wantPercent) / 100;
  };

  //숫자를 몇 퍼센트 증가시키는 공식    tot에서  wantPercent을 증가 시킨다
  export const getValuePercentUp = (tot: number, wantPercent: number) => {
    /*
    숫자를 몇 퍼센트 증가시키는 공식
    숫자 X (1 + 퍼센트 ÷ 100)
    예제) 1548을 66퍼센트 증가하면?
    답) 2569.68
     */
    return tot * (1 + wantPercent / 100);
  };

  //숫자를 몇 퍼센트 감소하는 공식    tot에서  wantPercent을 증감 시킨다
  export const getValuePercentDown = (tot: number, wantPercent: number) => {
    /*
    숫자를 몇 퍼센트 감소하는 공식
    숫자 X (1 - 퍼센트 ÷ 100)
    예제) 1548을 66퍼센트 감소하면?
    답) 526.32
     */
    return tot * (1 - wantPercent / 100);
  };

  //바례식
  // A:B = C:X    => 30:50 = 33 : x
  // 30X = 50*33
  // X = BC / 30


  // Bezier
  // https://cubic-bezier.com/#.17,.67,.83,.67
  // https://matthewlein.com/tools/ceaser
  // https://easings.net/ko#
  // (0.250, 0.250, 0.750, 0.750); /* linear */
  export const beziers = (points: (Point3D | {x:number; y: number, z:number})[], frame: number) => {
    const datas = new Array(frame).fill(undefined);
    for (let i = 0; i < datas.length; i++) {
      datas[i] = MathUtil.bezier(points, frame, i);
    }
    return datas;
  };

  // 처음점은 포함되지 않는다, 끝점은 포함된다.
  export const bezier = (points: (Point3D | {x:number; y: number, z:number})[], frame: number, idx: number): Vector => {
    if (points && points.length > 0) {
      const pv = points.map(it => new Vector(it.x, it.y, it.z));
      const steps: Vector[] = [];
      pv.reduce((a, b) => {
        const step = a.toSub(b).div(frame).mult(idx + 1);
        steps.push(a.toSub(step));
        return b;
      });

      if (steps.length <= 1) {
        return steps[0];
      }
      return MathUtil.bezier(steps.map(it => new Point3D(it)), frame, idx);
    } else {
      return new Vector();
    }
  };

  // 시작점과 끝점은 포함하지 않는다.
  export function cubicBezier(position: { start: number; end: number; }, frameConfig: { frame: number; }, bezierConfig: BezierConfig): number[];
  export function cubicBezier(position: { start: Obj; end: Obj; }, frameConfig: { frame: number; }, bezierConfig: BezierConfig): Obj[];
  export function cubicBezier(position: { start: Point3D; end: Point3D; }, frameConfig: { frame: number; }, bezierConfig: BezierConfig): Point3D[];
  export function cubicBezier(
    position: {
      start: number; // 시작 값
      end: number;   // 끝 값
    } | {
      start: Point3D; // 시작 값
      end: Point3D;   // 끝 값
    } | {
      start: Obj; // 시작 값
      end: Obj;   // 끝 값
    },
    frameConfig: {
      // includeStartEnd?: boolean,
      frame: number; // 프레임 수 (배열 크기)
    },
    bezierConfig: BezierConfig
  ): number[] | Point3D[] | Obj[] {


    if (position.start instanceof Obj && position.end instanceof Obj) {
      const x = MathUtil.cubicBezier({ start: position.start.x, end: position.end.x }, frameConfig, bezierConfig);
      const y = MathUtil.cubicBezier({ start: position.start.y, end: position.end.y }, frameConfig, bezierConfig);
      const z = MathUtil.cubicBezier({ start: position.start.z, end: position.end.z }, frameConfig, bezierConfig);
      const v = MathUtil.cubicBezier({ start: position.start.volume, end: position.end.volume }, frameConfig, bezierConfig);
      const m = MathUtil.cubicBezier({ start: position.start.mass, end: position.end.mass }, frameConfig, bezierConfig);
      const e = MathUtil.cubicBezier({ start: position.start.e, end: position.end.e }, frameConfig, bezierConfig);
      const r = MathUtil.cubicBezier({ start: position.start.rotate, end: position.end.rotate }, frameConfig, bezierConfig);
      const w = MathUtil.cubicBezier({ start: position.start.width, end: position.end.width }, frameConfig, bezierConfig);
      const h = MathUtil.cubicBezier({ start: position.start.height, end: position.end.height }, frameConfig, bezierConfig);
      const t0 = MathUtil.cubicBezier({ start: position.start.transform[0], end: position.end.transform[0] }, frameConfig, bezierConfig);
      const t1 = MathUtil.cubicBezier({ start: position.start.transform[1], end: position.end.transform[1] }, frameConfig, bezierConfig);
      const t2 = MathUtil.cubicBezier({ start: position.start.transform[2], end: position.end.transform[2] }, frameConfig, bezierConfig);
      const t3 = MathUtil.cubicBezier({ start: position.start.transform[3], end: position.end.transform[3] }, frameConfig, bezierConfig);
      const t4 = MathUtil.cubicBezier({ start: position.start.transform[4], end: position.end.transform[4] }, frameConfig, bezierConfig);
      const t5 = MathUtil.cubicBezier({ start: position.start.transform[5], end: position.end.transform[5] }, frameConfig, bezierConfig);
      const colorR = MathUtil.cubicBezier({ start: position.start.color.r, end: position.end.color.r }, frameConfig, bezierConfig);
      const colorG = MathUtil.cubicBezier({ start: position.start.color.g, end: position.end.color.g }, frameConfig, bezierConfig);
      const colorB = MathUtil.cubicBezier({ start: position.start.color.b, end: position.end.color.b }, frameConfig, bezierConfig);
      const colorA = MathUtil.cubicBezier({ start: position.start.color.a, end: position.end.color.a }, frameConfig, bezierConfig);
      const objs = x.map((x, idx) => {
        const obj = new Obj({x, y:y[idx], z:z[idx]});
        obj.volume = v[idx];
        obj.mass = m[idx];
        obj.e = e[idx];
        obj.rotate = r[idx];
        obj.width = w[idx];
        obj.height = h[idx];
        obj.transform = [t0[idx], t1[idx], t2[idx], t3[idx], t4[idx], t5[idx]];
        obj.color = { r: colorR[idx], g: colorG[idx], b: colorB[idx], a: colorA[idx] };
        return obj;
      });
      return objs;
    } else if (position.start instanceof Point3D && position.end instanceof Point3D) {
      const x = MathUtil.cubicBezier({ start: position.start.x, end: position.end.x }, frameConfig, bezierConfig);
      const y = MathUtil.cubicBezier({ start: position.start.y, end: position.end.y }, frameConfig, bezierConfig);
      const z = MathUtil.cubicBezier({ start: position.start.z, end: position.end.z }, frameConfig, bezierConfig);
      return x.map((x, idx) => new Point3D(x, y[idx], z[idx]));
    }


    const { start, end } = position as { start: number, end: number };

    // ----

    const { frame } = frameConfig;
    let { p1x, p1y, p2x, p2y } = Array.isArray(bezierConfig) ? {p1x: bezierConfig[0], p1y: bezierConfig[1], p2x: bezierConfig[2], p2y: bezierConfig[3]} : bezierConfig;
    p1x = p1x === 'random' ? Math.random() : p1x;
    p1y = p1y === 'random' ? Math.random() : p1y;
    p2x = p2x === 'random' ? Math.random() : p2x;
    p2y = p2y === 'random' ? Math.random() : p2y;

    const result: number[] = [];
    const totalChange = end - start;

    // console.log('----222->',totalChange);

    // 3차 베지어 곡선 공식
    const bezier = (t: number): number => {
      const t2 = Number(t * t);
      const t3 = Number(t2 * t);
      const mt = Number(1 - t);
      const mt2 = Number(mt * mt);
      const mt3 =Number(mt2 * mt);

      return mt3 * 0 + 3 * mt2 * t * Number(p1y) + 3 * mt * t2 * Number(p2y) + t3 * 1;
    };

    // frame 수만큼 계산, 시작점, 끝점 제외
    const targetFrame = frame +1;
    for (let i = 1; i < targetFrame; i++) {
      // const t = frame <= 1 ? 1 : (i + 1) / frame;
      // const t = frame <= 1 ? 1 : (i + 1) / frame;
      const t = i / targetFrame;
      const progress = bezier(t);
      // console.log('pppppppp', progress);
      const value = start + totalChange * progress;
      result.push(value);
    }

    return result;

  }

  export const diff = (a: number, b: number) => {
    return Math.abs(a - b);
  };

  // static bezirePointToPointVector(point: {point1: Point, point2?: Point, point3?: Point, point4?: Point}) {
  //     if (!point.point2) {
  //         point.point2 = point.point1;
  //     }
  //     if (!point.point3) {
  //         point.point3 = point.point2;
  //     }
  //     if (!point.point4) {
  //         point.point4 = point.point3;
  //     }
  //     return {
  //         point1: new PointVector(point.point1.x, point.point1.y, point.point1.z),
  //         point2: new PointVector(point.point2.x, point.point2.y, point.point2.z),
  //         point3: new PointVector(point.point3.x, point.point3.y, point.point3.z),
  //         point4: new PointVector(point.point4.x, point.point4.y, point.point4.z),
  //     }
  // }
  // static bezier(point: {point1: Point, point2?: Point, point3?: Point, point4?: Point}, frame: number, idx: number) {
  //     const pointVector = MathUtil.bezirePointToPointVector(point);
  //
  //     const point12Step = PointVector.sub(pointVector.point1, pointVector.point2).div(frame).mult(idx + 1);
  //     const point23Step = PointVector.sub(pointVector.point2, pointVector.point3).div(frame).mult(idx + 1);
  //     const point34Step = PointVector.sub(pointVector.point3, pointVector.point4).div(frame).mult(idx + 1);
  //
  //     pointVector.point1.sub(point12Step);
  //     pointVector.point2.sub(point23Step);
  //     pointVector.point3.sub(point34Step);
  //
  //     const point12MoveStep = PointVector.sub(pointVector.point1, pointVector.point2).div(frame);
  //     const point23MoveStep = PointVector.sub(pointVector.point2, pointVector.point3).div(frame);
  //     // const point34MoveStep = PointVector.sub(point3, point4).div(frame); // 더이상갈곳없음
  //
  //     const cnt = idx + 1;
  //     const point12MovePoint = point12MoveStep.mult(cnt)
  //     const point23MovePoint = point23MoveStep.mult(cnt);
  //     const combinationPoint1MovePoint = PointVector.sub(pointVector.point1, point12MovePoint); //new PointVector(point1.x - point12MovePoint.x, point1.y - point12MovePoint.y);
  //     const combinationPoint2MovePoint = PointVector.sub(pointVector.point2, point23MovePoint); // new PointVector(point2.x - point23MovePoint.x, point2.y - point23MovePoint.y);
  //
  //     const finalPointMoveStep =  PointVector.sub(combinationPoint1MovePoint, combinationPoint2MovePoint).div(frame);
  //     const finalPointMovePoint = finalPointMoveStep.mult(cnt);
  //     const final = PointVector.sub(combinationPoint1MovePoint, finalPointMovePoint);
  //     return final;
  // }
  //
  // static beziers(point: {point1: Point, point2?: Point, point3?: Point, point4?: Point}, frame: number) {
  //     const pointVector = MathUtil.bezirePointToPointVector(point);
  //     const frames = new Array(frame).fill(undefined) as PointVector[];
  //     for (let i = 0; i < frame; i++) {
  //         frames[i] = MathUtil.bezier(point, frame, i);
  //         // pointVector.point1.sub(point12Step);
  //         // pointVector.point2.sub(point23Step);
  //         // pointVector.point3.sub(point34Step);
  //         //
  //         // const point12MoveStep = PointVector.sub(pointVector.point1, pointVector.point2).div(frame);
  //         // const point23MoveStep = PointVector.sub(pointVector.point2, pointVector.point3).div(frame);
  //         // // const point34MoveStep = PointVector.sub(point3, point4).div(frame); // 더이상갈곳없음
  //         //
  //         // const cnt = i + 1;
  //         // const point12MovePoint = point12MoveStep.mult(cnt)
  //         // const point23MovePoint = point23MoveStep.mult(cnt);
  //         // const combinationPoint1MovePoint = PointVector.sub(pointVector.point1, point12MovePoint); //new PointVector(point1.x - point12MovePoint.x, point1.y - point12MovePoint.y);
  //         // const combinationPoint2MovePoint = PointVector.sub(pointVector.point2, point23MovePoint); // new PointVector(point2.x - point23MovePoint.x, point2.y - point23MovePoint.y);
  //         //
  //         // const finalPointMoveStep =  PointVector.sub(combinationPoint1MovePoint, combinationPoint2MovePoint).div(frame);
  //         // const finalPointMovePoint = finalPointMoveStep.mult(cnt);
  //         // const final = PointVector.sub(combinationPoint1MovePoint, finalPointMovePoint);
  //     }
  //     return frames;
  // }



//   interface Point {
//     x: number;
//     y: number;
//   }
//
//   interface BezierPathOptions {
//     /**
//      * 제어점을 얼마나 멀리 둘지 결정하는 값입니다. (기본값: 0.25)
//      * 0 이면 거의 직선에 가깝고, 값이 커질수록 곡선의 휘어짐이 커집니다.
//      * 음수 값을 주면 반대 방향으로 휩니다.
//      */
//     controlPointOffsetFactor?: number;
//
//     /**
//      * 점들의 분포를 조절하는 가속도 계수입니다. (기본값: 1)
//      * 1: 등간격 (선형)
//      * > 1: 시작 부분에 점들이 모이고 끝으로 갈수록 간격이 넓어짐 (가속, ease-in)
//      * < 1: 끝 부분에 점들이 모이고 시작 부분의 간격이 넓어짐 (감속, ease-out)
//      * 예: 2는 제곱 가속, 0.5는 제곱근 감속.
//      */
//     accelerationFactor?: number;
//   }
//
//   /**
//    * 2차 베지에 곡선 위의 특정 t 값에서의 점 좌표를 계산합니다.
//    * B(t) = (1-t)^2 * P0 + 2 * (1-t) * t * P1 + t^2 * P2
//    * @param t 매개변수 (0에서 1 사이)
//    * @param p0 시작점
//    * @param p1 제어점
//    * @param p2 끝점
//    * @returns 계산된 점의 좌표
//    */
//   function quadraticBezier(t: number, p0: Point, p1: Point, p2: Point): Point {
//     const mt = 1 - t; // (1-t)
//     const mt2 = mt * mt; // (1-t)^2
//     const t2 = t * t; // t^2
//
//     const x = mt2 * p0.x + 2 * mt * t * p1.x + t2 * p2.x;
//     const y = mt2 * p0.y + 2 * mt * t * p1.y + t2 * p2.y;
//
//     return { x, y };
//   }
//
//   /**
//    * 출발점과 도착점 사이를 잇는 2차 베지에 곡선을 따라 이동할 좌표들을 계산합니다.
//    * @param startPoint 출발점 좌표 { x, y }
//    * @param endPoint 도착점 좌표 { x, y }
//    * @param options 베지에 곡선 및 점 분포 옵션
//    * @param numberOfSteps 생성할 중간 이동 좌표의 개수 (이동 경로상의 점 개수)
//    * @returns 계산된 좌표들의 배열 (startPoint는 포함하지 않고, endPoint는 포함)
//    */
//   function getPointsOnBezierPath(
//     startPoint: Point,
//     endPoint: Point,
//     options: BezierPathOptions = {}, // 기본값 빈 객체
//     numberOfSteps: number
//   ): Point[] {
//     // --- 옵션 기본값 설정 ---
//     const controlPointOffsetFactor = options.controlPointOffsetFactor ?? 0.25; // 기본값 0.25
//     const accelerationFactor = options.accelerationFactor ?? 1; // 기본값 1 (선형)
//
//     // --- 입력값 유효성 검사 ---
//     if (numberOfSteps <= 0) {
//       console.warn("numberOfSteps는 0보다 커야 합니다.");
//       return []; // 빈 배열 반환 또는 에러 처리
//     }
//
//     const points: Point[] = [];
//     const p0 = startPoint;
//     const p2 = endPoint;
//
//     // --- 제어점(P1) 자동 계산 ---
//     const midX = (p0.x + p2.x) / 2;
//     const midY = (p0.y + p2.y) / 2;
//
//     const deltaX = p2.x - p0.x;
//     const deltaY = p2.y - p0.y;
//
//     const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
//
//     let p1: Point;
//
//     if (distance === 0) {
//       // 시작점과 끝점이 같으면 제어점도 같은 위치로 설정 (직선 이동 없음)
//       p1 = { ...p0 };
//       // 이 경우, 모든 계산된 점은 시작/끝 점과 동일하게 됩니다.
//       // 요청에 따라 빈 배열을 반환하거나, 끝점을 numberOfSteps만큼 반환할 수도 있습니다.
//       // 여기서는 계산 로직을 그대로 두어 동일한 점이 반복 생성되도록 합니다.
//     } else {
//       // 시작점에서 끝점으로의 벡터에 수직인 방향 벡터 계산 (시계 반대 방향 90도 회전)
//       const perpX = -deltaY / distance;
//       const perpY = deltaX / distance;
//
//       // 중간 지점에서 수직 방향으로 옵션에 따라 제어점 위치 계산
//       const offset = distance * controlPointOffsetFactor;
//       p1 = {
//         x: midX + perpX * offset,
//         y: midY + perpY * offset,
//       };
//     }
//
//     // --- 곡선 상의 점 계산 ---
//     for (let i = 1; i <= numberOfSteps; i++) {
//       // 1. 기본 파라미터 u 계산 (0 < u <= 1)
//       const u = i / numberOfSteps;
//       // 2. 가속도 적용된 파라미터 t 계산
//       const t = Math.pow(u, accelerationFactor);
//       // 3. 베지에 곡선 위의 점 계산
//       const pointOnCurve = quadraticBezier(t, p0, p1, p2);
//       points.push(pointOnCurve);
//     }
//
//     return points; // 계산된 중간 좌표들의 배열 반환
//   }
//
// // --- 사용 예시 ---
//   const start: Point = { x: 4, y: 10 };
//   const end: Point = { x: 50, y: 20 };
//   const steps = 10; // 10개의 중간 지점 계산
//
// // 예시 1: 기본 옵션 (약간의 곡선, 등간격)
//   const path1 = getPointsOnBezierPath(start, end, {}, steps);
//   console.log("기본 옵션 경로:", path1.map(p => `(${p.x.toFixed(1)}, ${p.y.toFixed(1)})`).join(" -> "));
//
// // 예시 2: 더 많이 휘어지게 (offset 증가), 가속 효과 추가 (acceleration > 1)
//   const path2 = getPointsOnBezierPath(start, end, { controlPointOffsetFactor: 0.6, accelerationFactor: 2 }, steps);
//   console.log("강한 곡선 + 가속 경로:", path2.map(p => `(${p.x.toFixed(1)}, ${p.y.toFixed(1)})`).join(" -> "));
//
// // 예시 3: 반대 방향으로 휘게 (offset 음수), 감속 효과 추가 (acceleration < 1)
//   const path3 = getPointsOnBezierPath(start, end, { controlPointOffsetFactor: -0.3, accelerationFactor: 0.5 }, steps);
//   console.log("반대 곡선 + 감속 경로:", path3.map(p => `(${p.x.toFixed(1)}, ${p.y.toFixed(1)})`).join(" -> "));
}
