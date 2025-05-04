// https://p5js.org/ko/
import { Point3D } from './Point3D';
import { Point2D } from './Point2D';

export class Vector {
  public x: number;
  public y: number;
  public z: number;

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

  public get() {
    return new Vector(this.x, this.y, this.z);
  }

  // 피타고라스의 정리는 a의 제곱 더하기 b 의 제곱은 c 의 제곱과 같다는 것을 정의합니다.
  public mag(): number {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    return Math.sqrt(x * x + y * y + z * z); // 의 제곱근을 리턴하면 길이가 반환된다.
  }

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

  public toAdd(v1: Vector|Point3D, v2: Vector|Point3D): Vector {
    return new Vector(v1.x + v2.x, v1.y + v2.y, v1.x + v2.y);
  }

  // public static add(v1: Vector, v2: Vector): Vector {
  //   return new Vector(v1.x + v2.x, v1.y + v2.y, v1.x + v2.y);
  // }

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

  public toSub(v2: Vector | Point3D): Vector {
    const v1 = this;
    return new Vector(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
  }

  //
  // public static sub(v1: Vector, v2: Vector): Vector {
  //     return new Vector(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
  // }

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

  public toMult(v2: Vector | Point3D): Vector {
    const v1 = this;
    return new Vector(v1.x *= v2.x, v1.y *= v2.y, v1.z *= v2.z);
  }

  // public static mult(v1: Vector, v2: Vector) {
  //   return new Vector(v1.x *= v2.x, v1.y *= v2.y, v1.z *= v2.z);
  // }

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

  public dist(v: Vector | Point3D): number {
    const dx = this.x - v.x,
      dy = this.y - v.y,
      dz = this.z - v.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

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

  public dot(v: number | Vector | Point3D, y: number, z: number): number {
    if (v instanceof Vector || v instanceof Point3D) {
      return this.x * v.x + this.y * v.y + this.z * v.z;
    }
    ;
    return this.x * v + this.y * y + this.z * z;
  }

  public cross(v: Vector | Point3D): Vector {
    const x = this.x,
      y = this.y,
      z = this.z;
    return new Vector(y * v.z - v.y * z, z * v.x - v.z * x, x * v.y - v.x * y);
  }

  public normalize() {
    const m = this.mag();
    if (m > 0) this.div(m);
  }

  public limit(high: number) {
    if (this.mag() > high) {
      this.normalize();
      this.mult(high);
    }
  }

  public heading2D() {
    return -Math.atan2(-this.y, this.x);
  }

  public random2D() {
    return this.fromAngle(Math.random() * (2 * Math.PI));
  }

  public fromAngle(angle: number, length = 1) {
    return new Vector(length * Math.cos(angle), length * Math.sin(angle), 0);
  };

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

  public array(): number[] {
    return [this.x, this.y, this.z];
  }

  public toPoint3D(): Point3D {
    return new Point3D(this.x, this.y, this.z);
  }

  public toPoint2D(): Point2D {
    return new Point2D(this.x, this.y);
  }

  public copy(): Vector {
    return new Vector(this.x, this.y, this.z);
  }

  public toString(): string {
    return '[' + this.x + ', ' + this.y + ', ' + this.z + ']';
  }

}
