import { Rect } from '../Rect';

export type DrawData<T = any> = {
    canvas: HTMLCanvasElement | OffscreenCanvas;
    context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D ;
    reset?: () => Rect;
    data?: T;
}
// export class Draw<T> {
//
//     constructor(public canvas: HTMLCanvasElement, public context: CanvasRenderingContext2D, public data?: T) {
//     }
// }
