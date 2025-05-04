import { Obj } from '../../object/obj/Obj';
import { Drawable } from '../../draw/Drawable';
import { DrawData } from '../../draw/DrawData';

export type RenderConfig = { disableReset?: boolean };

export abstract class RenderDrawObj<T = any> extends Obj implements Drawable {
    render(draw: DrawData<T>, config?:RenderConfig):void {
        try {
            // draw.reset();
            this.beforeDraw(draw);
            draw.context.save();
            if (!config?.disableReset) {
                draw.reset?.();
            }
            this.draw(draw);
            draw.context.restore();
            this.afterDraw(draw);
        } catch (e) {
            console.error('error!!',e);
            this.error(e);
        }
    }
    protected beforeDraw(draw: DrawData<T>): void {};
    abstract draw(draw: DrawData<T>): void ;
    protected afterDraw(draw: DrawData<T>): void {};
    protected error(e: any): void {

    };

    // constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, public avaliablePlace: Rectangle = new Rectangle(new Point(0, 0), new Point(0, 0))) {
    //     super(canvas, context);
    // }


    // get centerPoint(): Point {
    //     return new Point();
    // }
}
