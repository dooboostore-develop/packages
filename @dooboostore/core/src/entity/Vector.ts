// https://p5js.org/ko/
import { Point3D } from './Point3D';
import { Point2D } from './Point2D';

/**
 * 2D/3D 벡터 (p5.js Vector 기반).
 * - 벡터: 크기(magnitude)와 방향을 가진 양. 위치가 아닌 "이동"을 나타냄.
 * - `to*` 메서드는 새 Vector를 반환(비파괴), 그 외(add/sub/mult/div/normalize 등)는 자신을 변경(파괴적).
 * @example
 * const a = new Vector(3, 4); // |a| = 5
 * const b = a.get();          // 복사본
 * b.add(new Vector(1, 1));    // b = (4, 5), a는 그대로 (3, 4)
 */
export class Vector {
  public x: number;
  public y: number;
  public z: number;

  /**
   * 벡터 생성. 인자 없이 호출하면 영벡터 (0, 0, 0).
   * @example
   * new Vector(3, 4)       // (3, 4, 0)
   * new Vector({x: 1})     // (1, 0, 0)
   * new Vector(new Point3D(1, 2, 3)) // (1, 2, 3)
   */
  constructor(data: Point3D);
  constructor(data: {x?: number, y?: number, z?: number});
  constructor(x?: number, y?: number, z?: number);
  constructor(x?: number | {x?: number, y?: number, z?: number} | Point3D, y?: number, z?: number) {
    if (x instanceof Point3D) {
      this.x = x.x;
      this.y = x.y;
      this.z = x.z;
    } else if (typeof x === 'object') {
      this.x = x.x ?? 0;
      this.y = x.y ?? 0;
      this.z = x.z ?? 0;
    } else {
      this.x = x ?? 0;
      this.y = y ?? 0;
      this.z = z ?? 0;
    }
  }


  /**
   * 성분 대입 (파괴적). 벡터 전달 시 그 성분을 복사.
   * @example
   * v.set(1, 2, 3);          // v = (1, 2, 3)
   * v.set(otherVector);      // v = other와 동일 성분
   */
  public set(v: number | Vector | Point3D, y: number = 0, z: number = 0) {
    if (v instanceof Vector || v instanceof Point3D) {
      this.set(v.x || 0, v.y || 0, v.z || 0);
    } else {
      this.x = v;
      this.y = y;
      this.z = z;
    }
    return this;
  }

  /**
   * 복사본 반환 (비파괴). 파괴적 메서드와 조합해 원본 보존용.
   * @example
   * const s = a.get(); s.add(b); // s = a+b, a는 그대로
   */
  public get() {
    return new Vector(this.x, this.y, this.z);
  }

  /**
   * 노름(norm). 평평한 공간(유클리드 공간)에서의 직선 거리.
   * - 수식: ‖v‖ = √(x² + y² + z²)
   * - 2D에서는 피타고라스 정리 그 자체. 3D는 두 번 적용한 것과 같음.
   *   (바닥 대각선 √(x²+y²) → 공간 대각선 √((바닥)²+z²))
   * - "유클리드"는 평평한 공간의 기하학을 말함 (좌표계는 데카르트의 것, 유클리드는 좌표 없이 기하학을 세움).
   *   휘어진 공간(구면·쌍곡)에서는 이 공식이 성립하지 않음.
   * @example
   * new Vector(3, 4, 0).norm(); // 5
   * new Vector(6, 8, 0).norm(); // 10
   */
  public norm(): number {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    // 같은 벡터와의 내적 제곱근으로도 구할 수 있음: ‖v‖ = √(v·v)
    // return Math.sqrt(this.dot(this));
    return Math.sqrt(x * x + y * y + z * z); // 의 제곱근을 리턴하면 길이가 반환된다.
  }

  /**
   * norm()의 별칭 (p5.js 호환).
   * @example
   * new Vector(3, 4, 0).mag(); // 5
   */
  public mag(): number {
    return this.norm();
  }

  /**
   * 덧셈 (파괴적). 성분별 합. 기하학적으로 평행사변형의 대각선.
   * - 수식: a + b = (ax+bx, ay+by, az+bz)
   * @example
   * const a = new Vector(4, 2); a.add(new Vector(-2, 3)); // a = (2, 5)
   */
  public add(v: number | Vector | Point3D, y: number = 0, z: number = 0) {
    if (v instanceof Vector || v instanceof Point3D) {
      this.x += v.x;
      this.y += v.y;
      this.z += v.z;
    } else {
      this.x += v;
      this.y += y;
      this.z += z;
    }
  }

  /**
   * 덧셈 결과의 새 벡터 반환 (비파괴).
   * - 수식: a + b = (ax+bx, ay+by, az+bz)
   * @example
   * const s = a.toAdd(a, b); // s = a+b, a·b는 그대로
   */
  public toAdd(v1: Vector|Point3D, v2: Vector|Point3D): Vector {
    return new Vector(v1.x + v2.x, v1.y + v2.y, v1.x + v2.y);
  }

  // public static add(v1: Vector, v2: Vector): Vector {
  //   return new Vector(v1.x + v2.x, v1.y + v2.y, v1.x + v2.y);
  // }

  /**
   * 뺄셈 (파괴적). a - b는 "a에서 b를 되돌리는" 벡터.
   * - 수식: a - b = (ax-bx, ay-by, az-bz)
   * @example
   * const a = new Vector(4, 2); a.sub(new Vector(1, 1)); // a = (3, 1)
   */
  public sub(v: number | Vector |Point3D, y = 0, z = 0) {
    if (v instanceof Vector || v instanceof Point3D) {
      this.x -= v.x;
      this.y -= v.y;
      this.z -= v.z;
    } else {
      this.x -= v;
      this.y -= y;
      this.z -= z;
    }
  }

  /**
   * 뺄셈 결과의 새 벡터 반환 (비파괴).
   * - 수식: a - b = (ax-bx, ay-by, az-bz)
   * @example
   * const d = a.toSub(b); // d = a-b, a·b는 그대로
   */
  public toSub(v2: Vector | Point3D): Vector {
    const v1 = this;
    return new Vector(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
  }

  //
  // public static sub(v1: Vector, v2: Vector): Vector {
  //     return new Vector(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
  // }

  /**
   * 스칼라배 또는 성분별 곱 (파괴적). 스칼라 k>1이면 늘어나고, 0<k<1이면 줄어듦. k<0이면 반대 방향.
   * - 수식(스칼라): k·v = (k·x, k·y, k·z)
   * @example
   * const v = new Vector(1, 2); v.mult(3); // v = (3, 6)
   */
  public mult(v: number | Vector | Point3D) {
    if (v instanceof Vector || v instanceof Point3D) {
      this.x *= v.x;
      this.y *= v.y;
      this.z *= v.z;
    } else {
      this.x *= v;
      this.y *= v;
      this.z *= v;
    }
    return this;
  }

  /**
   * 성분별 곱 결과의 새 벡터 반환 (비파괴).
   * - 수식: (ax·bx, ay·by, az·bz)
   * @example
   * const m = a.toMult(b); // m = 성분별 곱, a·b는 그대로
   */
  public toMult(v2: Vector | Point3D): Vector {
    const v1 = this;
    return new Vector(v1.x *= v2.x, v1.y *= v2.y, v1.z *= v2.z);
  }

  // public static mult(v1: Vector, v2: Vector) {
  //   return new Vector(v1.x *= v2.x, v1.y *= v2.y, v1.z *= v2.z);
  // }

  /**
   * 스칼라 나눗셈 또는 성분별 나눗셈 (파괴적). 정규화의 핵심 연산.
   * - 수식(스칼라): v/k = (x/k, y/k, z/k)
   * @example
   * const v = new Vector(6, 8); v.div(2); // v = (3, 4)
   */
  public div(v: number | Vector | Point3D) {
    if (v instanceof Vector || v instanceof Point3D) {
      this.x /= v.x;
      this.y /= v.y;
      this.z /= v.z;
    } else {
      this.x /= v;
      this.y /= v;
      this.z /= v;
    }
    return this;
  }

  /**
   * 스칼라 나눗셈 결과의 새 벡터 반환 (비파괴).
   * - 수식: v/k = (x/k, y/k, z/k)
   * @example
   * const h = v.toDiv(2); // h = v/2, v는 그대로
   */
  public toDiv( d: number): Vector {
    const v = this;
    const rv = v.get();
    rv.x /= d;
    rv.y /= d;
    rv.z /= d;
    return rv;
  }

  // public static div(v: Vector, d: number): Vector {
  //   const rv = v.get();
  //   rv.x /= d;
  //   rv.y /= d;
  //   rv.z /= d;
  //   return rv;
  // }

  /**
   * 두 점(벡터) 사이 거리. 차 벡터의 크기.
   * - 수식: d = √((dx)² + (dy)² + (dz)²)
   * @example
   * new Vector(0, 0).dist(new Vector(3, 4)); // 5
   */
  public dist(v: Vector | Point3D): number {
    const dx = this.x - v.x,
      dy = this.y - v.y,
      dz = this.z - v.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * 두 점(벡터) 사이 거리 (toDist는 dist와 동일, 비파괴).
   * - 수식: d = √((dx)² + (dy)² + (dz)²)
   * @example
   * a.toDist(b); // a와 b 사이 거리
   */
  public toDist(v2: Vector | Point3D): number {
    const v1 = this;
    const dx = v1.x - v2.x,
      dy = v1.y - v2.y,
      dz = v1.z - v2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  // public static dist(v1: Vector, v2: Vector): number {
  //   const dx = v1.x - v2.x,
  //     dy = v1.y - v2.y,
  //     dz = v1.z - v2.z;
  //   return Math.sqrt(dx * dx + dy * dy + dz * dz);
  // }

  /**
   * 내적(dot product). 두 벡터가 같은 방향을 향하는 정도.
   * - 수식: a·b = ax·bx + ay·by + az·bz = |a||b|cosθ
   * - θ=90°면 0(직교), 0°면 최대(같은 방향).
   * - 벡터 전달 시 y·z 생략 가능, 스칼라(x) 전달 시 y·z와 함께 사용.
   * @example
   * new Vector(5, 12).dot(new Vector(-5, 12)); // -25+144 = 119
   * new Vector(1, 0).dot(new Vector(0, 1));    // 0 (직각)
   * new Vector(1, 2).dot(3, 4);                // 1*3+2*4 = 11
   */
  public dot(v: number | Vector | Point3D, y = 0, z = 0): number {
    if (v instanceof Vector || v instanceof Point3D) {
      return this.x * v.x + this.y * v.y + this.z * v.z;
    }
    ;
    return this.x * v + this.y * y + this.z * z;
  }

  /**
   * 외적(cross product). 두 벡터에 수직인 벡터. 오른손 법칙 방향.
   * - 수식: a×b = (ay·bz − az·by, az·bx − ax·bz, ax·by − ay·bx)
   * - 2D에서는 z값 = ax·by − ay·bx (부호 있는 면적, 회전 방향 판정용).
   * @example
   * new Vector(1, 0, 0).cross(new Vector(0, 1, 0)); // (0, 0, 1)
   */
  public cross(v: Vector | Point3D): Vector {
    const x = this.x,
      y = this.y,
      z = this.z;
    return new Vector(y * v.z - v.y * z, z * v.x - v.z * x, x * v.y - v.x * y);
  }

  /**
   * 정규화 (파괴적). 방향은 그대로, 크기를 1로. 단위벡터 v̂ 생성.
   * - 수식: v̂ = v / |v|
   * - 영벡터(|v|=0)는 0으로 나누지 않고 그대로 둠.
   * @example
   * const v = new Vector(6, 8); v.normalize(); // v = (0.6, 0.8), |v| = 1
   */
  public normalize() {
    const m = this.norm();
    if (m > 0) this.div(m);
  }

  /**
   * 크기 상한 (파괴적). 속도가 high를 넘으면 방향 유지한 채 high로 자름. 물리 시뮬레이션 최고속도용.
   * - 수식: |v| > high → v = v̂ · high
   * @example
   * const v = new Vector(6, 8); v.limit(5); // |v|=10 → 5, v = (3, 4)
   */
  public limit(high: number) {
    if (this.norm() > high) {
      this.normalize();
      this.mult(high);
    }
  }

  /**
   * 2D 방향각. +x축 기준 반시계 방향 라디안 (-π ~ π).
   * - 수식: θ = atan2(y, x)
   * @example
   * new Vector(1, 1).heading2D();  // π/4 (45°)
   * new Vector(-1, 0).heading2D(); // π (180°)
   */
  public heading2D() {
    return -Math.atan2(-this.y, this.x);
  }

  /**
   * 무작위 방향 단위벡터 반환 (새 Vector, 자신은 변경 안 함).
   * @example
   * const r = new Vector().random2D(); // |r| = 1, 방향 랜덤
   */
  public random2D() {
    return this.fromAngle(Math.random() * (2 * Math.PI));
  }

  /**
   * 각도→벡터. 각도 θ, 길이 L인 2D 벡터 반환 (새 Vector).
   * - 수식: (L·cosθ, L·sinθ, 0)
   * @example
   * new Vector().fromAngle(Math.PI / 3, 2); // (1, 1.73, 0)
   */
  public fromAngle(angle: number, length = 1) {
    return new Vector(length * Math.cos(angle), length * Math.sin(angle), 0);
  };

  /**
   * 구면좌표→3D 벡터 (새 Vector 반환, p5.js 컨벤션).
   * - 수식: (L·sinθ·sinφ, −L·cosθ, L·sinθ·cosφ)
   * @example
   * new Vector().fromAngles(Math.PI / 2, Math.PI / 2, 1); // (1, 0, 0)
   */
  public fromAngles(theta: number, phi: number, length = 1) {
    const cosPhi = Math.cos(phi);
    const sinPhi = Math.sin(phi);
    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);

    return new Vector(
      length * sinTheta * sinPhi,
      -length * cosTheta,
      length * sinTheta * cosPhi
    );
  };

  /**
   * 성분 배열 반환. [x, y, z] 순서.
   * @example
   * new Vector(1, 2, 3).array(); // [1, 2, 3]
   */
  public array(): number[] {
    return [this.x, this.y, this.z];
  }

  /**
   * Point3D로 변환 (위치 의미로 바꿀 때).
   * @example
   * new Vector(1, 2, 3).toPoint3D(); // Point3D(1, 2, 3)
   */
  public toPoint3D(): Point3D {
    return new Point3D(this.x, this.y, this.z);
  }

  /**
   * Point2D로 변환 (z 버림).
   * @example
   * new Vector(1, 2, 3).toPoint2D(); // Point2D(1, 2)
   */
  public toPoint2D(): Point2D {
    return new Point2D(this.x, this.y);
  }

  /**
   * 복사본 반환 (get()과 동일, 비파괴).
   * @example
   * const c = v.copy(); // v와 같은 성분의 새 벡터
   */
  public copy(): Vector {
    return new Vector(this.x, this.y, this.z);
  }

  /**
   * 문자열 표현. "[x, y, z]" 형식.
   * @example
   * new Vector(1, 2).toString(); // "[1, 2, 0]"
   */
  public toString(): string {
    return '[' + this.x + ', ' + this.y + ', ' + this.z + ']';
  }

}
