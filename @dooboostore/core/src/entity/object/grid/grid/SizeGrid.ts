import {Drawable} from "../../../draw/Drawable";
import { DrawData } from '../../../../entity/draw/DrawData';

export class SizeGrid implements Drawable {


    constructor(public size = 10) {
    }

    draw(draw: DrawData) {
        let splitSize = draw.canvas.width / this.size;
        let wUnit = splitSize;
        let hUnit = splitSize;
        draw.context.strokeStyle = '#373737';
        draw.context.lineWidth = 0.5;
        draw.context.setLineDash([4, 2]);
        for (let i = 0; wUnit * i <= draw.canvas.width; i++) {
            draw.context.beginPath();
            draw.context.moveTo(wUnit * i, 0);
            draw.context.lineTo(wUnit * i, draw.canvas.height);
            draw.context.stroke();
        }
        for (let i = 0; hUnit * i <= draw.canvas.height; i++) {
            draw.context.beginPath();
            draw.context.moveTo(0, hUnit * i);
            draw.context.lineTo(draw.canvas.width, hUnit * i);
            draw.context.stroke();
        }
    }

}
