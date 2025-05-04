import { Point3D } from '../entity/Point3D';
import { Vector } from '../entity/Vector';
import { Obj } from '../entity/object/obj/Obj';
import { Point2D } from '../entity/Point2D';

export namespace MathUtil {
  export type BezierConfig = { p1x: number | 'random', p1y: number | 'random', p2x: number | 'random', p2y: number | 'random' } | [number | 'random', number | 'random', number | 'random', number | 'random'];
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

  export const hypot = (...data: number[]) => {
    // 2차원 예시
    // Math.hypot(3, 4);  // 결과: 5 (3² + 4² = 9 + 16 = 25, √25 = 5)

// 3차원 예시
//     Math.hypot(3, 4, 5);  // 결과: 7.0710678118654755

    return Math.hypot(...data);
  }

  // 피타고라스 정리 함수
  export const pythagorean = (a: number, b: number): number => {
    /*
    피타고라스 정리
    a^2 + b^2 = c^2
    c = √(a^2 + b^2)
     */
    // return Math.sqrt(start * start + end * end);
    return Math.sqrt(a * a + b * b);
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

  export const sum = (array: number[]) => {
    return array.reduce((acc, curr) => acc + curr, 0);
  }

  export const avg = (array: number[]) => {
    return array.length > 0 ? MathUtil.sum(array) / array.length : 0;
  }

  export const minMax = (data: number, minMax: { min: number, max: number }) => {
    return Math.min(Math.max(data, minMax.min), minMax.max);
  }
  export const max = (array: number[]) => {
    return array.length > 0 ? Math.max(...array) : undefined;
  };

  export const min = (array: number[]) => {
    return array.length > 0 ? Math.min(...array) : undefined;
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


  export type AngleUnitType = 'degreeAngle' | 'ratio' | 'percent';
  /**
   * Converts value to radians based on given type.
   * @param data - The value to convert to radians
   * @param option - Conversion type configuration
   * @param option.type - Type of conversion:
   *                      'degreeAngle' - Converts from degrees to radians
   *                      'ratio' - Multiplies value by 2π (input range 0-1)
   *                      'percent' - Converts percentage to 2π ratio (input range 0-100)
   * @returns The converted value in radians
   * @example
   * // Convert 180 degrees to radians (3.14...)
   * radians(180, {type: 'degreeAngle'})
   *
   * // Convert 0.5 ratio to radians (3.14...)
   * radians(0.5, {type: 'ratio'})
   *
   * // Convert 50% to radians (3.14...)
   * radians(50, {type: 'percent'})
   */
  export const radians = (data: number, {type = 'degreeAngle'}: {type?: AngleUnitType}): number => {
    /*
     radian
     * 1.57..: 90도, PI/2
     * 3.14..: 180도, PI
     * 4.71..: 270도, PI + PI/2
     * 6.28..: 360도, PI * 2
     */
    if (type === 'ratio') {
      return (data * 2) * Math.PI;
    } else if (type === 'percent') {
      return ((data / 100) * 2) * Math.PI;
    } else {
      // return data * Math.PI / 180;
      return data / 180 * Math.PI;
    }
  };

  export const degrees = (data: number, {type = 'degreeAngle'}: {type?: AngleUnitType}): number => {
    if (type === 'ratio') {
      return data * 360;
    } else if (type === 'percent') {
      return (data / 100) * 360;
    } else {
      return data * 180 / Math.PI;
    }
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

  /**
   1. 비율의 개념
   비율(Ratio): 두 양의 상대적인 크기를 비교한 값으로, 일반적으로 분수나 소수로 표현됩니다. 예를 들어, "2:3" 비율은 두 수의 비가 2 대 3이라는 뜻이며, 이는 2/3로도 나타낼 수 있습니다.
   단위 비율(Normalized Ratio): 한 값을 기준으로 다른 값을 조정한 비율을 의미합니다. 여기서는 너비(w)를 1로 정규화(normalize)하여 높이(h)의 상대적 값을 구하는 것이 목표입니다.
   이미지 비율: 이미지의 너비와 높이 비율은 보통 "w:h" 형식으로 표현되며, 이 비율을 유지하면서 크기를 조정할 때 유용합니다.
   2. 계산 방법
   주어진 데이터:

   너비(w) = 1652 픽셀
   높이(h) = 421 픽셀
   목표: 너비를 1로 보았을 때 높이의 값 구하기
   단계별 계산
   원래 비율 구하기:
   이미지의 비율은 w:h = 1652:421입니다.
   이를 분수로 표현하면 1652 / 421입니다.
   너비를 1로 정규화:
   너비를 1로 만들기 위해, 원래 너비(1652)를 1로 나누고, 이를 높이에도 동일하게 적용합니다.
   정규화된 높이 = 원래 높이(h) ÷ 원래 너비(w)
   수식: h' = h / w (여기서 h'는 정규화된 높이)
   계산 적용:
   정규화된 높이 = 421 / 1652
   계산: 421 ÷ 1652 ≈ 0.25485 (소수점 약 5자리까지)
   결과 해석:
   너비가 1일 때 높이는 약 0.25485입니다. 이는 높이가 너비의 약 25.485%에 해당함을 의미합니다.
   검증
   원래 비율을 유지하려면, 정규화된 값을 역으로 적용해 원래 값을 복원할 수 있어야 합니다.
   정규화된 비율(0.25485)을 1652에 곱하면: 1652 * 0.25485 ≈ 421, 이는 원래 높이와 일치하므로 계산이 올바름.
   3. 수식 정리
   일반적인 정규화 수식:
   정규화된 높이(h') = h / w
   정규화된 너비(w') = w / w = 1 (기준값)
   이 문제 적용:
   h' = 421 / 1652 ≈ 0.25485
   4. 대안: 비율로 표현
   비율을 "1:비율값" 형식으로 표현하려면, 높이를 너비로 나눈 값을 그대로 사용.
   결과: 1 : 0.25485 또는 약 1 : 0.255 (소수점 반올림).
   5. 추가 개념
   비례식: 이미지 크기를 조정할 때 비율을 유지하려면, w1 / h1 = w2 / h2를 만족해야 합니다. 여기서 w2 = 1로 설정한 경우, h2 = h1 / w1이 됩니다.
   실제 적용: 웹 디자인이나 그래픽에서 이미지를 리사이징할 때, 원본 비율(1652:421)을 유지하려면 이 정규화된 값을 사용해 높이를 계산.
   <script>
   const w = 1652;
   const h = 421;
   const normalizedHeight = h / w;
   console.log(`정규화된 높이: ${normalizedHeight.toFixed(5)}`); // 0.25485
   console.log(`원래 비율 확인: ${w * normalizedHeight} ≈ ${h}`); // 약 421
   </script>
   */
  export const ratio = (numerator: number, denominator: number, multiplier: number = 1): number => {
    // numerator(분자) : denominator(분모) = multiplier : x
    // x = multiplier * denominator / numerator
    return  multiplier * (denominator / numerator)
  // a:b = c:x 비례식을 이용해 x 값을 구함
    // ax = bc
    // x = bc/a
  }
  //end - start    끝과 시작의 사이길이를 취득한다.
  export const getBetweenLength = (start: number, end: number) => {
    return end - start;
  };

  //전체값에서 일부값은 몇 퍼센트? 계산법 공식    tot에서  data는 몇%인가.
  export const getPercentByTotal = (tot: number, data: number) => {
    /*
    전체값에서 일부값은 몇 퍼센트? 계산법 공식
    일부값 ÷ 전체값 X 100
    예제) 300에서 105는 몇퍼센트?
    답: 35%
    */
    return (data / tot) * 100;
  };
  export const getRatioByTotal = (tot: number, data: number) => {
    return (data / tot)
  };

  //전체값의 몇 퍼센트는 얼마? 계산법 공식    tot에서  wantPercent는 몇인가?
  export const getValueByTotalInPercent = (tot: number, wantPercent: number) => {
    /*
    전체값 X 퍼센트 ÷ 100
    예제) 300의 35퍼센트는 얼마?
    답) 105
     */
    return (tot * wantPercent) / 100;
  };
  export const getValueByTotalInRatio = (tot: number, ratio: number) => {
    return (tot * ratio);
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

  export const getValueRatioUp = (tot: number, ratio: number) => {
    return tot * (1 + ratio);
  }

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

  export const getValueRatioDown = (tot: number, ratio: number) => {
    return tot * (1 - ratio);
  }


  //바례식
  // A:B = C:X    => 30:50 = 33 : x
  // 30X = 50*33
  // X = BC / 30


  // Bezier
  // https://cubic-bezier.com/#.17,.67,.83,.67
  // https://matthewlein.com/tools/ceaser
  // https://easings.net/ko#
  // (0.250, 0.250, 0.750, 0.750); /* linear */
  export const beziers = (points: (Point3D | { x: number; y: number, z: number })[], frame: number) => {
    const datas = new Array(frame).fill(undefined);
    for (let i = 0; i < datas.length; i++) {
      datas[i] = MathUtil.bezier(points, frame, i);
    }
    return datas;
  };

  // 처음점은 포함되지 않는다, 끝점은 포함된다.
  export const bezier = (points: (Point3D | { x: number; y: number, z: number })[], frame: number, idx: number): Vector => {
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
      const x = MathUtil.cubicBezier({start: position.start.x, end: position.end.x}, frameConfig, bezierConfig);
      const y = MathUtil.cubicBezier({start: position.start.y, end: position.end.y}, frameConfig, bezierConfig);
      const z = MathUtil.cubicBezier({start: position.start.z, end: position.end.z}, frameConfig, bezierConfig);
      const v = MathUtil.cubicBezier({start: position.start.volume, end: position.end.volume}, frameConfig, bezierConfig);
      const m = MathUtil.cubicBezier({start: position.start.mass, end: position.end.mass}, frameConfig, bezierConfig);
      const e = MathUtil.cubicBezier({start: position.start.e, end: position.end.e}, frameConfig, bezierConfig);
      const r = MathUtil.cubicBezier({start: position.start.rotate, end: position.end.rotate}, frameConfig, bezierConfig);
      const w = MathUtil.cubicBezier({start: position.start.width, end: position.end.width}, frameConfig, bezierConfig);
      const h = MathUtil.cubicBezier({start: position.start.height, end: position.end.height}, frameConfig, bezierConfig);
      const t0 = MathUtil.cubicBezier({start: position.start.transform[0], end: position.end.transform[0]}, frameConfig, bezierConfig);
      const t1 = MathUtil.cubicBezier({start: position.start.transform[1], end: position.end.transform[1]}, frameConfig, bezierConfig);
      const t2 = MathUtil.cubicBezier({start: position.start.transform[2], end: position.end.transform[2]}, frameConfig, bezierConfig);
      const t3 = MathUtil.cubicBezier({start: position.start.transform[3], end: position.end.transform[3]}, frameConfig, bezierConfig);
      const t4 = MathUtil.cubicBezier({start: position.start.transform[4], end: position.end.transform[4]}, frameConfig, bezierConfig);
      const t5 = MathUtil.cubicBezier({start: position.start.transform[5], end: position.end.transform[5]}, frameConfig, bezierConfig);
      const colorR = MathUtil.cubicBezier({start: position.start.color.r ?? 0, end: position.end.color.r ?? 0}, frameConfig, bezierConfig);
      const colorG = MathUtil.cubicBezier({start: position.start.color.g ?? 0, end: position.end.color.g ?? 0}, frameConfig, bezierConfig);
      const colorB = MathUtil.cubicBezier({start: position.start.color.b ?? 0, end: position.end.color.b ?? 0}, frameConfig, bezierConfig);
      const colorA = MathUtil.cubicBezier({start: position.start.color.a ?? 255, end: position.end.color.a ?? 255}, frameConfig, bezierConfig);
      const objs = x.map((x, idx) => {
        const obj = new Obj({x, y: y[idx], z: z[idx]});
        obj.volume = v[idx];
        obj.mass = m[idx];
        obj.e = e[idx];
        obj.rotate = r[idx];
        obj.width = w[idx];
        obj.height = h[idx];
        obj.transform = [t0[idx], t1[idx], t2[idx], t3[idx], t4[idx], t5[idx]];
        obj.color = {r: colorR[idx], g: colorG[idx], b: colorB[idx], a: colorA[idx]};
        return obj;
      });
      return objs;
    } else if (position.start instanceof Point3D && position.end instanceof Point3D) {
      const x = MathUtil.cubicBezier({start: position.start.x, end: position.end.x}, frameConfig, bezierConfig);
      const y = MathUtil.cubicBezier({start: position.start.y, end: position.end.y}, frameConfig, bezierConfig);
      const z = MathUtil.cubicBezier({start: position.start.z, end: position.end.z}, frameConfig, bezierConfig);
      return x.map((x, idx) => new Point3D(x, y[idx], z[idx]));
    }


    const {start, end} = position as { start: number, end: number };

    // ----

    const {frame} = frameConfig;
    let {p1x, p1y, p2x, p2y} = Array.isArray(bezierConfig) ? {p1x: bezierConfig[0], p1y: bezierConfig[1], p2x: bezierConfig[2], p2y: bezierConfig[3]} : bezierConfig;
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
      const mt3 = Number(mt2 * mt);

      return mt3 * 0 + 3 * mt2 * t * Number(p1y) + 3 * mt * t2 * Number(p2y) + t3 * 1;
    };

    // frame 수만큼 계산, 시작점, 끝점 제외
    const targetFrame = frame + 1;
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

  /*
  > 투영부분? 저부분 핵심부분 더  자세하게 알려줄래

✦ 네, 그럼요. 이 부분이 기하학적으로 어떤 의미를 가지는지 그림과 함께 머릿속으로 상상하며 이해하면
  쉽습니다.

  핵심 아이디어: 그림자 내리기 (Projection)

  가장 간단한 비유는 그림자입니다.


   * `선분 vw`: 땅에 놓여있는 막대기라고 상상해 보세요. (v는 시작점, w는 끝점)
   * `점 p`: 공중에 떠 있는 마우스 커서라고 상상해 보세요.
   * 목표: 마우스 커서(p)에서 막대기(vw)까지 가장 가까운 지점을 찾는 것.


  가장 가까운 지점은 p에서 막대기로 수직으로 선을 내렸을 때 만나는 점입니다. 마치 p 바로 위에 손전등을
  켜서 막대기에 그림자를 만드는 것과 같습니다. 이 그림자가 떨어지는 지점이 바로 투영(projection)입니다.

  ---

  코드 상세 분석


  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;

  이 한 줄의 코드는 바로 그 '그림자가 막대기의 어디에 떨어지는가'를 계산하는 과정입니다. 여기서 t는
  비율을 의미합니다.

  1. 벡터(Vector)로 생각하기


  코드를 이해하기 위해 두 개의 벡터를 생각해야 합니다.


   * 벡터 1 (`vw`): 막대기 자체의 방향과 길이를 나타내는 벡터입니다.
       * w.x - v.x (x방향)
       * w.y - v.y (y방향)
   * 벡터 2 (`vp`): 막대기 시작점에서 마우스 커서까지의 벡터입니다.
       * p.x - v.x (x방향)
       * p.y - v.y (y방향)


  2. 분자: 벡터 내적 (Dot Product)

  ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y))


  이 부분은 두 벡터 vp와 vw의 내적(dot product)을 계산하는 공식입니다. 벡터 내적은 두 벡터가 얼마나
  "같은 방향을 바라보고 있는지"를 나타내는 수치입니다.


   * 두 벡터가 서로 수직이면 내적은 0입니다.
   * 두 벡터가 같은 방향을 볼수록 내적 값은 커집니다.

  기하학적으로, `vp` 벡터를 `vw` 벡터 위로 투영(그림자)시켰을 때의 길이와 관련이 있습니다.

  3. 분모: l2


  l2는 앞에서 계산했듯이 막대기 벡터 vw의 길이의 제곱입니다.

  4. t의 의미: 비율

  결국 t는 다음과 같이 계산됩니다.

  t = (벡터 vp와 vw의 내적) / (벡터 vw의 길이 제곱)


  이 t 값이 바로 투영된 그림자 지점이 막대기 시작점 `v`로부터 얼마나 떨어져 있는지를 나타내는 비율이
  됩니다.


   * `t = 0`: 그림자가 정확히 막대기 시작점 v에 떨어집니다.
   * `t = 1`: 그림자가 정확히 막대기 끝점 w에 떨어집니다.
   * `t = 0.5`: 그림자가 정확히 막대기 한가운데에 떨어집니다.
   * `t < 0` (예: `t = -0.2`): p가 v의 "뒤쪽"에 있어서, 그림자가 막대기 시작점 이전에 떨어집니다.
     (막대기를 무한한 직선으로 봤을 때)
   * `t > 1` (예: `t = 1.5`): p가 w의 "앞쪽"에 있어서, 그림자가 막대기 끝점을 지나서 떨어집니다.
     (막대기를 무한한 직선으로 봤을 때)

  결론


  이 t 값을 계산하는 것이 핵심인 이유는, 마우스 포인터(p)와 가장 가까운 점이 막대기 내부에 있는지,
  아니면 양쪽 끝점 중 하나인지 판단할 수 있는 기준을 제공하기 때문입니다.


   * t가 0과 1 사이에 있다면, 가장 가까운 점은 막대기 위의 '그림자' 지점입니다.
   * t가 0보다 작다면, 가장 가까운 점은 막대기의 시작점 v입니다.
   * t가 1보다 크다면, 가장 가까운 점은 막대기의 끝점 w입니다.


  이것이 바로 다음 코드 라인 t = Math.max(0, Math.min(1, t));가 t를 0과 1 사이로 제한하는 이유입니다.
  이로써 가장 가까운 점이 항상 선분 위(양 끝점 포함)에 있도록 보장할 수 있습니다.
   */
export const distSqToLineSegment = (p: Point2D, v: Point2D, w: Point2D): number => {
    const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
    if (l2 === 0) return (p.x - v.x) ** 2 + (p.y - v.y) ** 2;
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    const projection = { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) };
    return (p.x - projection.x) ** 2 + (p.y - projection.y) ** 2;
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

  export const rotatePoint = (point: Point2D, center: Point2D, angleInRadians: number): Point2D => {
    // Translate point to origin so that center is the origin
    const translatedX = point.x - center.x;
    const translatedY = point.y - center.y;

    // Rotate point
    const rotatedX = translatedX * Math.cos(angleInRadians) - translatedY * Math.sin(angleInRadians);
    const rotatedY = translatedX * Math.sin(angleInRadians) + translatedY * Math.cos(angleInRadians);

    // Translate point back
    return new Point2D(rotatedX + center.x, rotatedY + center.y);
  }
}
