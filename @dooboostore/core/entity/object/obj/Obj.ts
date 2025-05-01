import { Vector } from '../../Vector';
import { Rect } from '../../Rect';

type Transaform = [number, number, number, number, number, number];

type Color = {
  r?: number,
  g?: number,
  b?: number,
  a?: number
};

export class Obj extends Vector {

  public volume = 0; // 부피
  public mass = 0; // 질량
  public e = 0; // 탄성
  public rotate = 0; // 회전
  public width = 0; // 너비
  public height = 0; // 높이
  // public age = 0; // 생성된 시간 가중치
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/transform
  /*
  a, d: 가로/세로 스케일
  b, c: 기울이기(skew)
  e, f: 이동(translate)
  --------------
  a, b, c, d, e, f
 */
  public transform: Transaform = [1, 0, 0, 1, 0, 0];
  public color: Color = {
    r: 0,
    g: 0,
    b: 0,
    a: 255
  };
  public id?: string;

  // public data?: T;


  constructor(data?: {
    x?: number,
    y?: number,
    z?: number,
    volume?: number,
    mass?: number,
    e?: number,
    rotate?: number,
    width?: number,
    height?: number,
    transform?: Transaform,
    color?: Color,
  }) {
    super();
    this.updateObjWithDefaults(data);
  }


  copyObj() {
    return new Obj({
      x: this.x,
      y: this.y,
      z: this.z,
      volume: this.volume,
      mass: this.mass,
      e: this.e,
      rotate: this.rotate,
      width: this.width,
      height: this.height,
      transform: this.transform,
      color: this.color
    });
  }

  updateObjWithDefaults(data?: {
    x?: number,
    y?: number,
    z?: number,
    volume?: number,
    mass?: number,
    e?: number,
    rotate?: number,
    width?: number,
    height?: number,
    transform?: Transaform,
    color?: Color,
  }) {
    if (data) {
      this.x = data.x ?? this.x;
      this.y = data.y ?? this.y;
      this.z = data.z ?? this.z;
      this.volume = data.volume ?? this.volume;
      this.mass = data.mass ?? this.mass;
      this.e = data.e ?? this.e;
      this.rotate = data.rotate ?? this.rotate;
      this.width = data.width ?? this.width;
      this.height = data.height ?? this.height;
      this.transform = data.transform ?? this.transform;
      this.color = data.color ?? this.color;
    }
  }

  setObj(data?: {
    x?: number,
    y?: number,
    z?: number,
    volume?: number,
    mass?: number,
    e?: number,
    rotate?: number,
    width?: number,
    height?: number,
    transform?: Transaform,
    color?: Color,
  }) {
    if (data) {
      this.x = data.x??0;
      this.y = data.y??0;
      this.z = data.z??0;
      this.volume = data.volume??0;
      this.mass = data.mass??0;
      this.e = data.e??0;
      this.rotate = data.rotate??0;
      this.width = data.width??0;
      this.height = data.height??0;
      this.transform = data.transform??[1, 0, 0, 1, 0, 0];
      this.color = data.color??{r:0,g:0,b:0,a:255};
    }
  }

  toRect(): Rect {
    return new Rect(this.x, this.y, this.width, this.height);
  }

  // constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, public avaliablePlace: Rectangle = new Rectangle(new Point(0, 0), new Point(0, 0))) {
  //     super(canvas, context);
  // }


  // get centerPoint(): Point {
  //     return new Point();
  // }
}
