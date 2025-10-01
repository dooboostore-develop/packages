// --- Type Definitions ---
type Point = {
  x: number;
  y: number;
};

class InteractiveGrid {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private debugPanel: HTMLElement;

  // --- State Variables ---
  private debugMode: boolean = true;
  private isRotating: boolean = false;
  private isMoving: boolean = false;
  private readonly gridSize: number = 10;
  private anchorGridPos: Point = { x: 5, y: 5 };
  private readonly stickLengthInCells: number = 3;
  private currentAngle: number = 0;
  private dragStartOffset: Point = { x: 0, y: 0 };

  constructor(canvasElement: HTMLCanvasElement, debugPanelId: string) {
    this.canvas = canvasElement;
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('2D context not available');
    }
    this.ctx = context;

    const panel = document.getElementById(debugPanelId);
    if (!panel) {
      throw new Error(`Debug panel with id #${debugPanelId} not found`);
    }
    this.debugPanel = panel;
  }

  // --- Public Methods for Event Handling ---
  public handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'd') {
      this.debugMode = !this.debugMode;
      this.draw();
    }
  }

  public handleDragStart = (event: MouseEvent | TouchEvent): void => {
    const pos = this.getEventPos(event);
    if (!pos) return;

    const cellSize = this.getCellSize();
    const anchorPixelPos = this.getAnchorPixelPos(cellSize);
    const endPixelPos = this.getEndPixelPos(anchorPixelPos, cellSize);
    
    const headRadius = cellSize / 4;
    const dx = pos.x - endPixelPos.x;
    const dy = pos.y - endPixelPos.y;

    const isRotating = Math.sqrt(dx * dx + dy * dy) < headRadius;
    console.log('isRotating', isRotating)
    if (isRotating) {
      this.isRotating = true;
    } else {
      const stickHalfWidth = cellSize / 4;
      const distSqToLineSegment = this.distSqToLineSegment(pos, anchorPixelPos, endPixelPos);
      const size = stickHalfWidth * stickHalfWidth;
      const isMoving = distSqToLineSegment < size;
      console.log('isMoving', isMoving, size, distSqToLineSegment)
      if (isMoving) {
        this.isMoving = true;
        this.dragStartOffset = { x: pos.x - anchorPixelPos.x, y: pos.y - anchorPixelPos.y };
      }
    }
    this.draw();
  };

  public handleDragEnd = (): void => {
    if (this.isMoving) {
      const cellSize = this.getCellSize();
      const currentPixelX = (this.anchorGridPos.x + 0.5) * cellSize;
      const currentPixelY = (this.anchorGridPos.y + 0.5) * cellSize;
      
      this.anchorGridPos = {
        x: Math.round(currentPixelX / cellSize - 0.5),
        y: Math.round(currentPixelY / cellSize - 0.5)
      };
    }
    this.isRotating = false;
    this.isMoving = false;
    this.draw();
  };

  public handleDragMove = (event: MouseEvent | TouchEvent): void => {
    if (!this.isRotating && !this.isMoving) return;
    event.preventDefault();
    const pos = this.getEventPos(event);
    if (!pos) return;

    const cellSize = this.getCellSize();
    const anchorPixelPos = this.getAnchorPixelPos(cellSize);

    if (this.isRotating) {
      const dx = pos.x - anchorPixelPos.x;
      const dy = pos.y - anchorPixelPos.y;
      this.currentAngle = Math.atan2(dy, dx);
    } else if (this.isMoving) {
      const newAnchorPixelX = pos.x - this.dragStartOffset.x;
      const newAnchorPixelY = pos.y - this.dragStartOffset.y;
      this.anchorGridPos = {
        x: newAnchorPixelX / cellSize - 0.5,
        y: newAnchorPixelY / cellSize - 0.5
      };
    }
    this.draw();
  };

  public resizeCanvas = (): void => {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    this.draw();
  };

  // --- Private Helper & Drawing Methods ---
  private getCellSize = (): number => Math.min(this.canvas.width, this.canvas.height) / this.gridSize;
  
  private getAnchorPixelPos = (cellSize: number): Point => ({
      x: (this.anchorGridPos.x + 0.5) * cellSize,
      y: (this.anchorGridPos.y + 0.5) * cellSize,
  });

  private getEndPixelPos = (anchor: Point, cellSize: number): Point => {
      const stickPixelLength = this.stickLengthInCells * cellSize;
      return {
          x: anchor.x + stickPixelLength * Math.cos(this.currentAngle),
          y: anchor.y + stickPixelLength * Math.sin(this.currentAngle),
      };
  };

  private getEventPos = (evt: MouseEvent | TouchEvent): Point | null => {
    const rect = this.canvas.getBoundingClientRect();
    let clientX: number;
    let clientY: number;

    if (window.TouchEvent && evt instanceof TouchEvent) {
      const touch = evt.touches[0] || evt.changedTouches[0];
      if (!touch) return null;
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      const mouseEvent = evt as MouseEvent;
      clientX = mouseEvent.clientX;
      clientY = mouseEvent.clientY;
    }

    if (clientX === undefined || clientY === undefined) {
      return null;
    }

    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  private distSqToLineSegment = (p: Point, v: Point, w: Point): number => {
    const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
    if (l2 === 0) return (p.x - v.x) ** 2 + (p.y - v.y) ** 2;
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    const projection = { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) };
    return (p.x - projection.x) ** 2 + (p.y - projection.y) ** 2;
  };

  private draw = (): void => {
    const cellSize = this.getCellSize();
    const gridDimension = this.gridSize * cellSize;
    const anchorPixelPos = this.getAnchorPixelPos(cellSize);
    const endPixelPos = this.getEndPixelPos(anchorPixelPos, cellSize);

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const intersectedCells = this.getIntersectedCells(cellSize, anchorPixelPos, endPixelPos);
    this.drawHighlightedCells(cellSize, intersectedCells);

    this.drawTheGrid(gridDimension, cellSize);
    this.drawTheStick(anchorPixelPos, cellSize);
    this.drawStickHead(endPixelPos, cellSize);
    
    if (this.debugMode) {
      this.drawGridCoordinates(cellSize);
      this.drawSamplePoints(anchorPixelPos, endPixelPos);
      this.updateDebugPanel(intersectedCells);
    } else {
      this.debugPanel.innerHTML = 'Debug mode is OFF. Press "d" to toggle.';
    }
  };
  
  private getIntersectedCells = (cellSize: number, start: Point, end: Point): Set<string> => {
    const intersectedCells = new Set<string>();
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = start.x + t * (end.x - start.x);
      const y = start.y + t * (end.y - start.y);
      const gridX = Math.floor(x / cellSize);
      const gridY = Math.floor(y / cellSize);
      if (gridX >= 0 && gridX < this.gridSize && gridY >= 0 && gridY < this.gridSize) {
        intersectedCells.add(`${gridX},${gridY}`);
      }
    }
    return intersectedCells;
  }

  private drawHighlightedCells = (cellSize: number, intersectedCells: Set<string>): void => {
    this.ctx.fillStyle = '#90ee90'; // lightgreen
    intersectedCells.forEach(cellKey => {
      const [col, row] = cellKey.split(',').map(Number);
      this.ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
    });
  };

  private drawTheGrid = (gridDimension: number, cellSize: number): void => {
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#ccc';
    this.ctx.lineWidth = 1;
    for (let i = 0; i <= this.gridSize; i++) {
      const pos = i * cellSize;
      this.ctx.moveTo(pos, 0);
      this.ctx.lineTo(pos, gridDimension);
      this.ctx.moveTo(0, pos);
      this.ctx.lineTo(gridDimension, pos);
    }
    this.ctx.stroke();
  };

  private drawTheStick = (start: Point, cellSize: number): void => {
    const stickPixelLength = this.stickLengthInCells * cellSize;
    const stickWidth = cellSize / 2; // The thickness of the stick

    this.ctx.save(); // Save the current state (transformations, styles)
    
    // Move the canvas origin to the stick's anchor point and rotate
    this.ctx.translate(start.x, start.y);
    this.ctx.rotate(this.currentAngle);

    // Draw the rounded rectangle centered on the new (rotated) origin
    this.ctx.beginPath();
    this.ctx.roundRect(
      0,                // x-coordinate relative to the new origin
      -stickWidth / 2,  // y-coordinate, to center the stick vertically
      stickPixelLength, // The length of the stick
      stickWidth,       // The width (thickness) of the stick
      stickWidth / 4    // Corner radius for a nice rounded look
    );

    this.ctx.fillStyle = 'black';
    this.ctx.fill();

    this.ctx.restore(); // Restore the state to how it was before saving
  };

  private drawStickHead = (pos: Point, cellSize: number): void => {
    const headRadius = cellSize / 4;
    this.ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, headRadius, 0, 2 * Math.PI);
    this.ctx.fillStyle = this.isRotating ? 'red' : 'blue';
    this.ctx.fill();
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  };

  private drawGridCoordinates = (cellSize: number): void => {
    this.ctx.fillStyle = 'black';
    this.ctx.font = `${cellSize / 5}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const x = col * cellSize + cellSize / 2;
        const y = row * cellSize + cellSize / 2;
        this.ctx.fillText(`(${col},${row})`, x, y);
      }
    }
  };

  private drawSamplePoints = (start: Point, end: Point): void => {
    const steps = 100;
    this.ctx.fillStyle = 'orange';
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = start.x + t * (end.x - start.x);
      const y = start.y + t * (end.y - start.y);
      this.ctx.beginPath();
      this.ctx.arc(x, y, 2, 0, 2 * Math.PI); // 2px radius circle
      this.ctx.fill();
    }
  }

  private updateDebugPanel = (intersectedCells: Set<string>): void => {
    const angleInDegrees = this.currentAngle * (180 / Math.PI);
    const intersectedCoords = Array.from(intersectedCells).join('; ');

    this.debugPanel.innerHTML = `
Angle: ${angleInDegrees.toFixed(2)}°
Anchor (Grid): {x: ${this.anchorGridPos.x.toFixed(2)}, y: ${this.anchorGridPos.y.toFixed(2)}}
Intersected Cells (${intersectedCells.size}): ${intersectedCoords}
    `.trim();
  }
}

// --- NEW: Trigonometry Visualizer Class ---
class TrigVisualizer {
  private ctx: CanvasRenderingContext2D;
  private angle: number = 0;
  private readonly radius: number;

  constructor(private canvas: HTMLCanvasElement) {
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('2D context not available for angle visualizer');
    }
    this.ctx = context;
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    this.radius = Math.min(this.canvas.width, this.canvas.height) * 0.4;
    this.animate();
  }

  private animate = (): void => {
    this.angle += 0.01; // Increment angle for animation
    this.draw();
    requestAnimationFrame(this.animate);
  };

  private draw = (): void => {
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.save();
    this.ctx.translate(width / 2, height / 2); // Center the origin

    const x = this.radius * Math.cos(this.angle);
    const y = this.radius * Math.sin(this.angle);

    // 1. Draw axes and unit circle
    this.drawAxes();
    this.drawUnitCircle();

    // 2. Draw the triangle and lines
    this.drawCosLine(x);
    this.drawSinLine(x, y);
    this.drawRadiusLine(x, y);
    this.drawAngleArc();

    this.ctx.restore(); // Restore origin

    // 3. Draw text information
    this.drawTextInfo(x, y);
  };

  private drawAxes = (): void => {
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#ccc';
    this.ctx.lineWidth = 1;
    this.ctx.moveTo(-this.canvas.width / 2, 0);
    this.ctx.lineTo(this.canvas.width / 2, 0);
    this.ctx.moveTo(0, -this.canvas.height / 2);
    this.ctx.lineTo(0, this.canvas.height / 2);
    this.ctx.stroke();
  };

  private drawUnitCircle = (): void => {
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#e0e0e0';
    this.ctx.setLineDash([5, 5]);
    this.ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  };

  private drawCosLine = (x: number): void => {
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'blue';
    this.ctx.lineWidth = 2;
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(x, 0);
    this.ctx.stroke();
  };

  private drawSinLine = (x: number, y: number): void => {
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'red';
    this.ctx.lineWidth = 2;
    this.ctx.moveTo(x, 0);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  };

  private drawRadiusLine = (x: number, y: number): void => {
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 2;
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  };

  private drawAngleArc = (): void => {
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'orange';
    this.ctx.arc(0, 0, 20, 0, this.angle);
    this.ctx.stroke();
  };

  private drawTextInfo = (x: number, y: number): void => {
    const cosValue = Math.cos(this.angle);
    const sinValue = Math.sin(this.angle);
    const tanValue = Math.tan(this.angle);
    const angleDeg = this.angle * (180 / Math.PI);

    this.ctx.fillStyle = 'black';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Angle (θ): ${angleDeg.toFixed(1)}°`, 10, 20);
    
    this.ctx.fillStyle = 'blue';
    this.ctx.fillText(`cos(θ) = X = ${cosValue.toFixed(2)}`, 10, 40);

    this.ctx.fillStyle = 'red';
    this.ctx.fillText(`sin(θ) = Y = ${sinValue.toFixed(2)}`, 10, 60);
    
    this.ctx.fillStyle = 'green';
    this.ctx.fillText(`tan(θ) = Y/X = ${tanValue.toFixed(2)}`, 10, 80);
  };
}


// --- Entry Point ---
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Interactive Grid Canvas
    const gridCanvas = document.querySelector<HTMLCanvasElement>('#canvas');
    if (!gridCanvas) throw new Error('Canvas element with id #canvas not found');
    const grid = new InteractiveGrid(gridCanvas, 'debug-panel');
    grid.resizeCanvas();
    
    // Setup Event Listeners for Grid
    gridCanvas.addEventListener('mousedown', grid.handleDragStart);
    gridCanvas.addEventListener('mouseup', grid.handleDragEnd);
    gridCanvas.addEventListener('mouseleave', grid.handleDragEnd);
    gridCanvas.addEventListener('mousemove', grid.handleDragMove);

    gridCanvas.addEventListener('touchstart', grid.handleDragStart, { passive: false });
    gridCanvas.addEventListener('touchend', grid.handleDragEnd, { passive: false });
    gridCanvas.addEventListener('touchcancel', grid.handleDragEnd, { passive: false });
    gridCanvas.addEventListener('touchmove', grid.handleDragMove, { passive: false });

    window.addEventListener('resize', grid.resizeCanvas, false);
    document.addEventListener('keydown', (e) => grid.handleKeyDown(e));

    // --- NEW: Angle Visualizer Canvas ---
    const angleCanvas = document.querySelector<HTMLCanvasElement>('#canvas-angle');
    if (!angleCanvas) throw new Error('Canvas element with id #canvas-angle not found');
    new TrigVisualizer(angleCanvas);

  } catch (error) {
    console.error((error as Error).message);
  }
});
