import { DrawData } from '../../draw/DrawData';
import { RenderConfig, RenderDrawObj } from './RenderDrawObj';
import { MathUtil } from '../../../math/MathUtil';
import { Point3D } from '../../Point3D';
import { WithRequiredProperty } from '../../../types';
import { Obj } from './Obj';
import BezierConfig = MathUtil.BezierConfig;
import { ConvertUtils } from '../../../convert/ConvertUtils';
import { ObjectUtils } from '../../../object/ObjectUtils';

// export type Calc = { name: string, start: number; end: number };
// export type CalcResult = Calc & { value: number };

export type TargetPointType = { obj: Obj, bezierConfig?: MathUtil.BezierConfig; };
export type Calc = { value: number | number[], bezierConfig?: MathUtil.BezierConfig };
export type TransactionConfig = {
  // startPoint?: Point,
  targetPoint: TargetPointType | TargetPointType[];
  drawFps: number;
  deferTransaction?: boolean;
  animationIterationCount?: number | 'infinite';
  animationDirection?: 'normal' | 'reverse';
  startPoint?: Obj;
  startCalcs?: { [key: string]: number  | number[]};
  calcs?: { [key: string]: Calc | Calc[] } //{name: string, value: number, bezierConfig?: MathUtil.BezierConfig}[][];
  // calcs?: Calc[];
  // fillMode?:  'backwards' ;

};

type RequiredTransactionConfig = WithRequiredProperty<TransactionConfig, 'animationIterationCount' | 'animationDirection'>;

type TransactionControllConfig = {
  points: Obj[];
  calcs?: { [key: string]: number[] | number[][] };
  pointPositionIndex: number;
  transactionStartCalcs: { [key: string]: number  | number[]};
  transactionStartPoint: Obj;
  config: RequiredTransactionConfig;
};


// TODO: 나중에 force로 위치이동하는거 함수필요할수도.. transaction 취소와함께
export abstract class RenderTransactionDrawObj<T = any> extends RenderDrawObj<T> {
  private static readonly DEFAULT_BEZIER: BezierConfig = { p1x: 0.61, p1y: 1, p2x: 0.88, p2y: 1 };
  private _currentTransactionControllConfig: TransactionControllConfig;
  private _waitTransactionConfig: TransactionConfig;
  private _calc: { [key: string]: number  | number[]} = {};
  private _beforeObj: Obj;
  private _transactionDoneSubscribers: ((config: TransactionConfig) => Obj|undefined)[] = [];
  // private _transactionConfigQueue: TransactionControllConfig[] = [];


  constructor(data?: Point3D);
  constructor(data?: { x?: number, y?: number, z?: number });
  constructor(x?: number, y?: number, z?: number);
  constructor(x?: number | { x?: number, y?: number, z?: number } | Point3D, y?: number, z?: number) {
    if (x instanceof Point3D) {
      // @ts-ignore
      super(x);
    } else if (typeof x === 'object') {
      super(x);
    } else {
      super({ x, y, z });
    }
    this._beforeObj = this.copyObj();
    this._currentTransactionControllConfig = this.makeTransactionControllConfig({ targetPoint: { obj: this }, drawFps: 1 });
    // console.log('----!@@@@@@', this.x, this.y,this.z, this._currentTransactionConfig);
  }

  get beforeObj() {
    return this._beforeObj;
  }

  get calc() {
    return this._calc;
  }

  getCalc(key: string): number | number[] | undefined {
    return this._calc[key];
  }

  setCalc(key: string, value: number | number[]) {
    // if ((this as any).syncSubLayer?.name === 'normalSpin_template' || (this as any).syncSubLayer?.name === 'normalSpin_slot'){
    //  debugger;
    // }
    this._calc[key] = value;
  }

  getTransactionStartPoint() {
    return this._currentTransactionControllConfig.transactionStartPoint;
  }
  getTransactionFrames() {
    return {points: this._currentTransactionControllConfig.points, calcs: this._currentTransactionControllConfig.calcs};
  }
  setTransactionIndex(index: number){
    this._currentTransactionControllConfig.pointPositionIndex = index;
  }
  getTransactionIndex() {
    return this._currentTransactionControllConfig.pointPositionIndex;
  }
  getTransactionIndexRate() {
    return MathUtil.getPercentByTot(this._currentTransactionControllConfig.points.length, this._currentTransactionControllConfig.pointPositionIndex+1) /100;
  }
  remainingFrameCountTransaction() {
    return (this._currentTransactionControllConfig.points.length - 1) - this._currentTransactionControllConfig.pointPositionIndex;
  }

  isDoneTransaction() {
    return this._currentTransactionControllConfig.pointPositionIndex >= this._currentTransactionControllConfig.points.length - 1;
  }

  makeTransactionControllConfig(transactionConfig: TransactionConfig) {
    // if ((this as any).syncSubLayer?.name === '영역-정면-몸-group') {
    //   console.log('-11-----', transactionConfig)
    // }
    // if ((this as any).syncSubLayer?.name === 'normalSpin_template' || (this as any).syncSubLayer?.name === 'normalSpin_slot'){
    //  console.log('mmmmmmmmm')
    // }
    // console.log('-------------', this)
    // if ((this as any)._syncSubLayer?.name === "normalBounce_template" ) {
    //  console.log('mmmmmmmmm', this.transform, this._currentTransactionControllConfig.transactionStartPoint.transform)
    // }
    if (transactionConfig.startPoint) {
      this.updateObjWithDefaults(transactionConfig.startPoint);
    }
    const transactionStartCalc = ObjectUtils.deepCopy(this._calc);

    if (transactionConfig.startCalcs) {
      Object.entries(transactionConfig.startCalcs).forEach(([k,v])=> {
        transactionStartCalc[k] = v;
      })
    }
    const requiredConfig = this.defaultTransactionConfig(transactionConfig);

    const targetPoints = requiredConfig.targetPoint = Array.isArray(requiredConfig.targetPoint) ? requiredConfig.targetPoint : [requiredConfig.targetPoint];
    const points: Obj[] = [];
    // 남은게 있음 트랜젝션 시작했을떄 시작점 기준으로
    // let startPoint = this.remainingCntTransaction() > 0 ? this._transactionConfig.points[0] : this.toPoint3D();
    // console.log('---->',(this as any)._syncData?.name)
    // if ((this as any)._syncData?.name === 'mcdonalds-event_item_issue' || (this as any).syncSu_syncDatabLayer?.name === 'mcdonalds-event_item_issue'){
    //   console.log('make!!!', transactionStartCalc)
    // }
    const currentPoint = this.copyObj();
    let startPoint: TargetPointType = { obj: currentPoint, bezierConfig: RenderTransactionDrawObj.DEFAULT_BEZIER };
    const drawFps = requiredConfig.drawFps;
    const size = Math.ceil(drawFps / targetPoints.length);
    // if (targetPoints.length === 1) {
    //   points.push(targetPoints[0].obj);
    // } else {
      for (let i = 0; i < targetPoints.length; i++) {
        const point = MathUtil.cubicBezier({start: startPoint.obj, end: targetPoints[i].obj}, {frame: size}, targetPoints[i].bezierConfig ?? RenderTransactionDrawObj.DEFAULT_BEZIER);
        points.push(startPoint.obj, ...point, targetPoints[i].obj);
        startPoint = targetPoints[i];
      }
    // }


    // if ((this as any)) {
    //   // console.log('worldEngine Sync', layerDrawObject?.syncData?.name, layers)
    //   console.log(requiredConfig)
    // }
    // const data = points.map(it => Math.floor(it.y*100)/100);
    //   const data1 = targetPoints.map(it =>Math.floor(it.obj.y * 1000)/1000);
    // if (data[data.length-1] === 0) {
    //   console.group('start', currentPoint)
    //   console.log('1---@@@----', data1);
    //   console.log('2---@@@----', data);
    //   console.groupEnd()
    // }
    // 하나도없을때 또는 0으로 셋팅시 바로 셋
    if (drawFps <= 0 && targetPoints.length > 0) {
      // console.log('!@!!!!!!!!!!!!!!!!!!!!!!!!!!!!', transactionConfig.startPoint, targetPoints[targetPoints.length - 1].obj)
      const lastPoint = targetPoints[targetPoints.length - 1].obj;
      points.length = 0;
      points.push(lastPoint);
      this.updateObjWithDefaults(lastPoint);
    }

    const calcs: { [key: string]: number[] | number[][] } = {};
    Object.entries(requiredConfig.calcs ?? {})?.forEach(([key, value], index) => {
      const values = Array.isArray(value) ? value : [value];
      let startPoint = transactionStartCalc[key];
      const points: number[] | number[][] = [];
      for (let i = 0; i < values.length; i++) {
        const end = values[i];
        if (Array.isArray(end.value)) {
          const point: number[][] = [];
          const cstart = (startPoint??[]) as number[];
          const cend = end.value as number[];
          const rpoints = cend.map((it,index) => {
            const b = MathUtil.cubicBezier({ start: cstart[index] ?? 0, end: cend[index] ?? 0 }, { frame: size }, end.bezierConfig ?? RenderTransactionDrawObj.DEFAULT_BEZIER)
            // console.log('----------22>', index, cstart[index], cend[index], size, b);
            return b;
          });
          const ss = ConvertUtils.toArrayDirectionChange(rpoints) as number[][]
          (points as number[][]).push(cstart, ...ss, cend);
        } else {
          const cstart = startPoint as number ??0;
          const point = MathUtil.cubicBezier({ start: cstart, end: end.value }, { frame: size }, end.bezierConfig ?? RenderTransactionDrawObj.DEFAULT_BEZIER);
          (points as number[]).push(cstart, ...point, end.value);
        }
        startPoint = end.value;
      }
      // 하나도없을때 또는 0으로 셋팅시 바로 셋
      if (drawFps <= 0 && points.length > 0) {
        transactionStartCalc[key]=points[points.length - 1];
      }
      calcs[key] = points;
    });
    // console.log('calc------->', calcs);
    // if ((this as any).syncSubLayer?.name === 'normalSpin_template' || (this as any).syncSubLayer?.name === 'normalSpin_slot'){
    //   console.log('make!!!', transactionStartCalc)
    // }
    const transactionControllConfig: TransactionControllConfig = {
      points: points,
      calcs: calcs,
      pointPositionIndex: 0,
      transactionStartCalcs: transactionStartCalc,
      transactionStartPoint: currentPoint,
      config: requiredConfig
    };
    // if (drawFps <= 0 && targetPoints.length > 0) {
    //   console.log('!!!!!', transactionControllConfig)
    // }
    // if ((this as any).syncSubLayer?.name === '영역-정면-몸-group') {
    //   console.log('------', transactionControllConfig)
    // }
    return transactionControllConfig;
  }

  // setPosition(position: {x:number, y:number, z: number}, config?:{deferTransaction?:boolean}) {
  //
  //
  // }
  transaction(transactionConfig: TransactionConfig) {
    if ((this as any).syncSubLayer?.name === 'normalBounce_template') {
      // console.log('------', transactionControllConfig)
      // console.log('!!!!!!!!!', this.isDoneTransaction(), transactionConfig.deferTransaction);
    }
    if (this.isDoneTransaction() && transactionConfig.deferTransaction) {
      // this.rotate = 0;
      this._currentTransactionControllConfig = this.makeTransactionControllConfig(transactionConfig);
    } else if (transactionConfig.deferTransaction) {
      this._waitTransactionConfig = transactionConfig;
    } else {
      this._currentTransactionControllConfig = this.makeTransactionControllConfig(transactionConfig);
    }
  }


  private defaultTransactionConfig(transactionConfig: TransactionConfig): RequiredTransactionConfig {
    // const targetPoint = [...(Array.isArray(transactionConfig.targetPoint) ? transactionConfig.targetPoint : [transactionConfig.targetPoint])];
    // if (transactionConfig.animationDirection === 'reverse') {
    //   targetPoint.u
    // }
    const requiredConfig: RequiredTransactionConfig = {
      ...transactionConfig,
      // targetPoint: targetPoint,
      animationIterationCount: transactionConfig.animationIterationCount ?? 1,
      animationDirection: transactionConfig.animationDirection ?? 'normal'
      // fillMode: transactionConfig.fillMode ?? 'backwards',
    };
    return requiredConfig;
  }

  render(draw: DrawData<T>, config?:RenderConfig) {


    this._beforeObj.setObj(this.copyObj());

    // console.log('-!!!!!!!!!!!', this);
    this.x = this._currentTransactionControllConfig.points[this._currentTransactionControllConfig.pointPositionIndex]?.x ?? this.x;
    this.y = this._currentTransactionControllConfig.points[this._currentTransactionControllConfig.pointPositionIndex]?.y ?? this.y;
    this.z = this._currentTransactionControllConfig.points[this._currentTransactionControllConfig.pointPositionIndex]?.z ?? this.z;
    this.volume = this._currentTransactionControllConfig.points[this._currentTransactionControllConfig.pointPositionIndex]?.volume ?? this.volume;
    this.mass = this._currentTransactionControllConfig.points[this._currentTransactionControllConfig.pointPositionIndex]?.mass ?? this.mass;
    this.e = this._currentTransactionControllConfig.points[this._currentTransactionControllConfig.pointPositionIndex]?.e ?? this.e;
    this.rotate = this._currentTransactionControllConfig.points[this._currentTransactionControllConfig.pointPositionIndex]?.rotate ?? this.rotate;
    this.width = this._currentTransactionControllConfig.points[this._currentTransactionControllConfig.pointPositionIndex]?.width ?? this.width;
    this.height = this._currentTransactionControllConfig.points[this._currentTransactionControllConfig.pointPositionIndex]?.height ?? this.height;
    this.transform[0] = this._currentTransactionControllConfig.points[this._currentTransactionControllConfig.pointPositionIndex]?.transform[0] ?? this.transform[0];
    this.transform[1] = this._currentTransactionControllConfig.points[this._currentTransactionControllConfig.pointPositionIndex]?.transform[1] ?? this.transform[1];
    this.transform[2] = this._currentTransactionControllConfig.points[this._currentTransactionControllConfig.pointPositionIndex]?.transform[2] ?? this.transform[2];
    this.transform[3] = this._currentTransactionControllConfig.points[this._currentTransactionControllConfig.pointPositionIndex]?.transform[3] ?? this.transform[3];
    this.transform[4] = this._currentTransactionControllConfig.points[this._currentTransactionControllConfig.pointPositionIndex]?.transform[4] ?? this.transform[4];
    this.transform[5] = this._currentTransactionControllConfig.points[this._currentTransactionControllConfig.pointPositionIndex]?.transform[5] ?? this.transform[5];
    this.color.r = this._currentTransactionControllConfig.points[this._currentTransactionControllConfig.pointPositionIndex]?.color?.r ?? this.color.r;
    this.color.g = this._currentTransactionControllConfig.points[this._currentTransactionControllConfig.pointPositionIndex]?.color?.g ?? this.color.g;
    this.color.b = this._currentTransactionControllConfig.points[this._currentTransactionControllConfig.pointPositionIndex]?.color?.b ?? this.color.b;
    this.color.a = this._currentTransactionControllConfig.points[this._currentTransactionControllConfig.pointPositionIndex]?.color?.a ?? this.color.a;

    // if (this._currentTransactionControllConfig.points.length === 1) {
    //   console.log('-!!!!!!!!!!!', this.x, this.y,this.z, this._currentTransactionControllConfig);
    // }

    // calcs
    Object.entries(this._currentTransactionControllConfig.calcs ?? {}).forEach(([key, value]) => {
      this._calc[key] = value[this._currentTransactionControllConfig.pointPositionIndex];
    });

    this._currentTransactionControllConfig.pointPositionIndex = Math.min(this._currentTransactionControllConfig.pointPositionIndex + 1, this._currentTransactionControllConfig.points.length - 1);
    // super.render(draw, {calcs, transaction: this._currentTransactionConfig});
    super.render(draw, config);


    // if (this.syncSubLayer.name === 'normalSpin_template' || this.syncSubLayer.name === 'normalSpin_slot')
    // if (this['syncSubLayer']?.name==='normalSpin_template') {
    //   console.log('is???Doen', this.isDoneTransaction(), this);
    //   if (this.isDoneTransaction()) {
    //     // debugger;
    //   }
    // }
    if (this.isDoneTransaction()) {
      // this._transactionDoneSubscribers.forEach(it => {
      //
      // })
      // console.log('done?-----', this._currentTransactionConfig.config.direction);

      const targetPoints = Array.isArray(this._currentTransactionControllConfig.config.targetPoint) ? [...this._currentTransactionControllConfig.config.targetPoint] : [this._currentTransactionControllConfig.config.targetPoint];
      // console.log('----------->',targetPoints)
      const targetCalcs: {[key: string]: Calc[]} = {}
      Object.entries(this._currentTransactionControllConfig?.config?.calcs??{}).forEach(([k,v]) => targetCalcs[k] = Array.isArray(v) ? v : [v]);



      // next transaction?
      if (this._waitTransactionConfig && this._waitTransactionConfig.deferTransaction) {
        // alert(1)
        // console.log('dddddddon')

        // this._currentTransactionControllConfig.pointPositionIndex=0;

        // this.transaction({
        //   ...this._currentTransactionConfig.config,
        //   targetPoint: targetPoints,
        //   calcs: targetCalcs
        // });
        // this._waitTransactionConfig.startPoint = this._currentTransactionControllConfig.transactionStartPoint;
        this.transaction(this._waitTransactionConfig);
        this._waitTransactionConfig = undefined;
        return;
      }



      let startPoint = this._currentTransactionControllConfig.config.startPoint;
      let startCalcs = this._currentTransactionControllConfig.transactionStartCalcs;
      if (this._currentTransactionControllConfig.config.animationDirection === 'reverse') {
        if (targetPoints.length>0) {
          // console.log('start-->1', (this as any).syncSubLayer?.name, this._currentTransactionControllConfig,JSON.stringify(startPoint.transform), JSON.stringify(targetPoints[0].obj.transform))
          const targetStartPoint = targetPoints.pop();
          targetPoints.reverse();
          targetPoints.push({obj: startPoint });
          Object.entries(targetCalcs).forEach(([k,v]) => {
            const targetCalc = v.pop();
            v.reverse();
            v.push({value:startCalcs[k]});
            startCalcs[k] = targetCalc.value;
          });
          startPoint = targetStartPoint.obj;
        }
      }

      if (this._currentTransactionControllConfig.config.animationIterationCount === 'infinite') {
        // return;
        // console.log('----infinite?',targetCalcs, targetPoints);
        // Object.entries(this._calc).forEach(([k,v]) => {
        //   this._calc[k] = 0;
        // })
        // if ((this as any).syncSubLayer?.name === 'normalSpin_template' || (this as any).syncSubLayer?.name === 'normalSpin_slot'){
        //   console.log('iiiiiiiiiiiiiiiiiiii', this._currentTransactionControllConfig.transactionStartCalcs)
        // }
        // Object.entries(targetCalcs).forEach(([k,v]) => v.reverse());
        // this._calc = this._currentTransactionControllConfig.transactionStartCalcs;
        // 이걸넣어야될지 말아야될지.. 이거 계속고민인데.. 이거 계속 걸리네.
        this.transaction({
          ...this._currentTransactionControllConfig.config,
          startPoint: startPoint,
          targetPoint: targetPoints,
          startCalcs: startCalcs,
          calcs: targetCalcs
        });
      } else if (this._currentTransactionControllConfig.config.animationIterationCount > 1) {
        // console.log('iterationCount', targetPoints);
        this.transaction({
          ...this._currentTransactionControllConfig.config,
          startPoint: startPoint,
          targetPoint: targetPoints,
          startCalcs: startCalcs,
          calcs: targetCalcs,
          animationIterationCount: this._currentTransactionControllConfig.config.animationIterationCount - 1
        });
      }
    }


  }

  abstract draw(draw: DrawData<T>): void ;

  // constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, public avaliablePlace: Rectangle = new Rectangle(new Point(0, 0), new Point(0, 0))) {
  //     super(canvas, context);
  // }


  // get centerPoint(): Point {
  //     return new Point();
  // }
}
