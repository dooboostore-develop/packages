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

  export const fontSize =(ctx:CanvasUtilsContext, config:{text: string, maxWidth:number, maxHeight: number, fontOption?: {fontWeight?: string, fontFamily?: string}}) => {
    const { text, maxWidth, maxHeight, fontOption } = config;

    if (!text || maxWidth <= 0 || maxHeight <= 0) {
      return 0;
    }

    // 기존 줄바꿈(\n)을 기준으로 텍스트를 나눕니다. 자동 줄바꿈은 수행하지 않습니다.
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    if (lines.length === 0) {
      return 0;
    }

    const lineHeightMultiplier = 1.2; // 줄 높이 배율

    // 1. 높이 제약 조건에 기반한 최대 폰트 크기 계산
    // (전체 텍스트 높이 = 줄 수 * 폰트 크기 * 줄 높이 배율)
    const maxFontSizeByHeight = Math.floor(maxHeight / (lines.length * lineHeightMultiplier));
    if (maxFontSizeByHeight <= 0) {
        return 0; // 1px 폰트도 높이에 맞지 않으면 0 반환
    }

    // 2. 너비 제약 조건에 기반한 최대 폰트 크기 계산 (이진 탐색)
    // 텍스트의 각 줄이 maxWidth를 넘지 않도록 하는 최대 폰트 크기를 찾습니다.
    let minSizeForWidth = 1;
    // 이진 탐색의 상한선은 높이 제약으로 얻은 값으로 설정하여 불필요한 탐색을 줄입니다.
    let maxSizeForWidth = maxFontSizeByHeight;
    let bestSizeForWidth = 0;

    const maxIterations = 100; // 무한 루프 방지
    let iteration = 0;

    while (minSizeForWidth <= maxSizeForWidth && iteration < maxIterations) {
      const midSize = Math.floor((minSizeForWidth + maxSizeForWidth) / 2);
      if (midSize === 0) break; // 폰트 크기가 0이 되면 중단

      ctx.font = `${fontOption?.fontWeight || 'normal'} ${midSize}px ${fontOption?.fontFamily || 'sans-serif'}`;

      // 가장 긴 줄의 너비를 측정합니다. (자동 줄바꿈 없음)
      const maxLineWidth = Math.max(...lines.map(line => ctx.measureText(line).width));

      if (maxLineWidth <= maxWidth) {
        // 현재 폰트 크기로 가장 긴 줄이 너비 제약을 만족하면, 더 큰 크기를 시도
        bestSizeForWidth = midSize;
        minSizeForWidth = midSize + 1;
      } else {
        // 현재 폰트 크기로 가장 긴 줄이 너비 제약을 초과하면, 더 작은 크기를 시도
        maxSizeForWidth = midSize - 1;
      }
      iteration++;
    }

    // 3. 높이 제약과 너비 제약 중 더 엄격한(작은) 폰트 크기를 반환합니다.
    return Math.min(bestSizeForWidth, maxFontSizeByHeight);
  }
  export const textMetrics =(context: CanvasUtilsContext, text: string):TextMetrics => {
    return context.measureText( text )
  }

}