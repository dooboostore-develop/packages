export namespace  CanvasUtils {
  export type CanvasUtilsContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  export namespace Context2D {
    /*
     rotate, scale, transform
      rotate는 계속 누적된다
      ctx.rotate(1);
      ctx.rotate(1);
      ctx.rotate(1);
      rotate3이되는거다.
     */

    /* transform
    https://www.w3schools.com/jsref/canvas_transform.asp
     */

    /* scale
     https://developer.mozilla.org/en-US/play
     https://www.w3schools.com/jsref/canvas_scale.asp
     https://www.w3schools.com/jsref/tryit.asp?filename=tryhtml5_canvas_scale

     */
    /* rotate
    https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rotate


    const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  // Non-rotated rectangle
  ctx.fillStyle = "gray";
  ctx.fillRect(80, 60, 140, 30);

  // Matrix transformation
  ctx.translate(150, 75);
  ctx.rotate(Math.PI / 2);
  ctx.translate(-150, -75);

  // Rotated rectangle
  ctx.fillStyle = "red";
  ctx.fillRect(80, 60, 140, 30);


  rotate 할떄에는 먼저 판을 이동후 기준점잡고 돌리고 다시 되돌려놓고  해야된다
     */


    /* line
    * lineTo: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineTo
    * closePath: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/closePath
     */

    /* moveTo  펜이동
    moveTo의 역할: moveTo(x, y)는 펜(pen)의 위치를 새로운 좌표로 이동시키지만, 기존 경로와 연결하지 않습니다. 이는 새로운 서브패스를 시작하는 효과를 줍니다.
const ctx = canvas.getContext("2d");

ctx.beginPath();
ctx.moveTo(20, 140);   // 시작점
ctx.lineTo(120, 10);   // 첫 번째 선
ctx.lineTo(220, 140);  // 두 번째 선
ctx.closePath();       // (220, 140) -> (20, 140)으로 닫음
ctx.fill();
ctx.stroke();

/////////
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.fillStyle='pink'
ctx.beginPath(); // Start a new path
ctx.moveTo(50, 50); // Move the pen to (30, 50)
ctx.lineTo(150, 100); // Draw a line to (150, 100)
ctx.lineTo(250, 10); // Draw a line to (150, 100)
ctx.closePath();
ctx.fill()
ctx.stroke(); // Render the path
ctx.beginPath(); // Start a new path
ctx.moveTo(30, 50); // Move the pen to (30, 50)
ctx.lineTo(150, 100); // Draw a line to (150, 100)
ctx.lineTo(650, 100); // Draw a line to (150, 100)
ctx.closePath();
ctx.fill()
ctx.stroke(); // Render the path



     */
    export const resetTransform = (context: CanvasUtilsContext) => {
      context.setTransform(1, 0, 0, 1, 0, 0);
    }
  }

  export const textSize =(ctx:CanvasUtilsContext, config:{text: string, maxWidth:number, maxHeight: number, fontOption?: {fontWeight?: string, fontFamily?: string}}) => {
    const maxWidth = config.maxWidth;
    const maxHeight = config.maxHeight;
    const text = config.text;
    const fontOptions = config.fontOption;
    if (maxWidth <= 0 || maxHeight <= 0) {
      throw new Error('maxWidth and maxHeight must be positive numbers');
    }

    const lines = text.split('\n').filter(line => line.trim().length > 0);
    if (lines.length === 0) {
      return 0; // 빈 텍스트 처리
    }

    let minSize = 1;
    let maxSize = 1000;
    let bestSize = minSize;

    const lineHeightMultiplier = 1.2;
    const maxIterations = 100; // 무한 루프 방지

    let iteration = 0;
    while (minSize <= maxSize && iteration < maxIterations) {
      const midSize = Math.floor((minSize + maxSize) / 2);
      ctx.font = `${fontOptions.fontWeight || 'normal'} ${midSize}px ${fontOptions.fontFamily??''}`;

      const lineWidths = lines.map(line => ctx.measureText(line).width);
      const maxLineWidth = Math.max(...lineWidths);
      const totalHeight = midSize * lineHeightMultiplier * lines.length;

      if (maxLineWidth <= maxWidth && totalHeight <= maxHeight) {
        bestSize = midSize;
        minSize = midSize + 1;
      } else {
        maxSize = midSize - 1;
      }
      iteration++;
    }

    return bestSize;
  }
  export const textMetrics =(context: CanvasUtilsContext, text: string):TextMetrics => {
    return context.measureText( text )
  }

}