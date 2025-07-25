import {Drawable} from "../../../draw/Drawable";
import { DrawData } from '../../../../entity/draw/DrawData';

export class LenGrid implements Drawable {

    draw(draw: DrawData) {
        const splitSize = 10;
        let wUnit = draw.canvas.width / splitSize;
        let hUnit = draw.canvas.height / splitSize;
        draw.context.strokeStyle = '#c8c8c8';
        draw.context.lineWidth = 0.5;
        for (let i = 0; i < splitSize; i++) {
            draw.context.beginPath();
            draw.context.moveTo(wUnit * i, 0);
            draw.context.lineTo(wUnit * i, draw.canvas.height);
            draw.context.stroke();
        }
        for (let i = 0; i < splitSize; i++) {
            draw.context.beginPath();
            draw.context.moveTo(0, hUnit * i);
            draw.context.lineTo(draw.canvas.width, hUnit * i);
            draw.context.stroke();
        }
    }
}
