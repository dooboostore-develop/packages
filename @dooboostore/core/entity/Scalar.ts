export class Scalar {
  private _value: number;

  constructor(value: number = 0) {
    this._value = value;
  }

  // 값 가져오기
  get value(): number {
    return this._value;
  }

  // 값 설정하기
  set value(value: number) {
    this._value = value;
  }

  // 값 직접 설정
  public set(value: number): Scalar {
    this._value = value;
    return this;
  }

  // 값 복사해서 새 인스턴스 반환
  public get(): Scalar {
    return new Scalar(this._value);
  }

  // 덧셈
  public add(value: number | Scalar): Scalar {
    if (value instanceof Scalar) {
      this._value += value.value;
    } else {
      this._value += value;
    }
    return this;
  }

  public static add(s1: Scalar, s2: Scalar): Scalar {
    return new Scalar(s1.value + s2.value);
  }

  // 뺄셈
  public sub(value: number | Scalar): Scalar {
    if (value instanceof Scalar) {
      this._value -= value.value;
    } else {
      this._value -= value;
    }
    return this;
  }

  public static sub(s1: Scalar, s2: Scalar): Scalar {
    return new Scalar(s1.value - s2.value);
  }

  // 곱셈
  public mult(value: number | Scalar): Scalar {
    if (value instanceof Scalar) {
      this._value *= value.value;
    } else {
      this._value *= value;
    }
    return this;
  }

  public static mult(s1: Scalar, s2: Scalar): Scalar {
    return new Scalar(s1.value * s2.value);
  }

  // 나눗셈
  public div(value: number | Scalar): Scalar {
    if (value instanceof Scalar) {
      if (value.value === 0) throw new Error("Division by zero");
      this._value /= value.value;
    } else {
      if (value === 0) throw new Error("Division by zero");
      this._value /= value;
    }
    return this;
  }

  public static div(s1: Scalar, s2: Scalar): Scalar {
    if (s2.value === 0) throw new Error("Division by zero");
    return new Scalar(s1.value / s2.value);
  }

  // 절댓값
  public abs(): Scalar {
    this._value = Math.abs(this._value);
    return this;
  }

  public static abs(s: Scalar): Scalar {
    return new Scalar(Math.abs(s.value));
  }

  // 문자열로 변환
  public toString(): string {
    return `${this._value}`;
  }

  // 숫자로 변환
  public toNumber(): number {
    return this._value;
  }
}