import { Runnable } from '@dooboostore/core/runs/Runnable';

// --- Type Definitions ---
type Point = { x: number; y: number };

enum HandlePosition {
    TopLeft, TopRight, BottomLeft, BottomRight, // Corner Resize
    MidTop, MidRight, MidBottom, MidLeft,      // Side Resize (Non-proportional)
    RotateTop, RotateRight, Bottom, RotateLeft // Rotation
}

type ShapeOptions = { fillColor?: string; strokeColor?: string; strokeWidth?: number; };
type CropStrokeOptions = ShapeOptions;
type TextOptions = ShapeOptions & { font?: string; size?: number; };

type RectOptions = ShapeOptions;
type CircleOptions = ShapeOptions;
type TriangleOptions = ShapeOptions;
type StarOptions = ShapeOptions;
type HeartOptions = ShapeOptions;
type SpeechBubbleOptions = ShapeOptions;
type PentagonOptions = ShapeOptions;
type OctagonOptions = ShapeOptions;
type SemicircleOptions = ShapeOptions;
type CrossOptions = ShapeOptions;


type BaseLayer = {
  id: string;
  type: 'image' | 'text' | 'rect' | 'circle' | 'triangle' | 'star' | 'heart' | 'speechBubble' | 'pentagon' | 'octagon' | 'semicircle' | 'cross';
  rect: { x: number; y: number; width: number; height: number };
  rotation: number;
  zIndex: number;
  image: ImageBitmap;
  cropStroke?: CropStrokeOptions;
  flipX?: boolean;
  flipY?: boolean;
};

type ImageLayer = BaseLayer & { type: 'image'; };
type TextLayer = BaseLayer & { type: 'text'; text: string; options: TextOptions; };
type RectLayer = BaseLayer & { type: 'rect'; options: RectOptions; };
type CircleLayer = BaseLayer & { type: 'circle'; options: CircleOptions; };
type TriangleLayer = BaseLayer & { type: 'triangle'; options: TriangleOptions; };
type StarLayer = BaseLayer & { type: 'star'; options: StarOptions; };
type HeartLayer = BaseLayer & { type: 'heart'; options: HeartOptions; };
type SpeechBubbleLayer = BaseLayer & { type: 'speechBubble'; options: SpeechBubbleOptions; };
type PentagonLayer = BaseLayer & { type: 'pentagon'; options: PentagonOptions; };
type OctagonLayer = BaseLayer & { type: 'octagon'; options: OctagonOptions; };
type SemicircleLayer = BaseLayer & { type: 'semicircle'; options: SemicircleOptions; };
type CrossLayer = BaseLayer & { type: 'cross'; options: CrossOptions; };

type CanvasLayer = ImageLayer | TextLayer | RectLayer | CircleLayer | TriangleLayer | StarLayer | HeartLayer | SpeechBubbleLayer | PentagonLayer | OctagonLayer | SemicircleLayer | CrossLayer;

export type CropCanvasConfig = {
    canvas: HTMLCanvasElement | string;
    onSelectionChange?: (layer: CanvasLayer | null) => void;
    onCuttingModeChange?: (isActive: boolean, targetLayer: CanvasLayer | null) => void;
    onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
    handle?: CropCanvasHandle;
};
export type CropCanvasHandle = { option: ImageBitmapOptions, callback: (img: ImageBitmap) => void };
export type CropCanvasRunParameter = { img: ImageBitmap | HTMLImageElement | Blob, handle?: CropCanvasHandle, cropStroke?: CropStrokeOptions };

export class ImageEditorCanvas implements Runnable<void, CropCanvasRunParameter> {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: CropCanvasConfig;

  private layers: CanvasLayer[] = [];
  private selectedLayerId?: string;
  private layerToCropId?: string;
  private nextZIndex = 1;

  private isMoving = false;
  private isResizing = false;
  private isRotating = false;
  private mode: 'none' | 'crop' | 'erase' = 'none';
  private activeHandle?: HandlePosition;
  private dragStartPos: Point = { x: 0, y: 0 };
  private resizePivot: Point = { x: 0, y: 0 };
  private initialRotation: number = 0;
  private initialAngle: number = 0;
  private initialFlipX = false;
  private initialFlipY = false;

  private polygonPoints: Point[] = [];
  private readonly pointHandleSize = 15;
  private readonly handleSize = 16;
  private readonly handleHitAreaSize = 40;
  private actionButtonSize = 35;
  private cropButtonPos: Point = { x: 0, y: 0 };
  private eraseButtonPos: Point = { x: 0, y: 0 };
  private deleteButtonPos: Point = { x: 0, y: 0 };
  private bringToFrontButtonPos: Point = { x: 0, y: 0 };
  private sendToBackButtonPos: Point = { x: 0, y: 0 };
  private doneButtonPos: Point = { x: 0, y: 0 };
  private cancelButtonPos: Point = { x: 0, y: 0 };
  private handle?: CropCanvasHandle;
  private debug = false;

  private history: CanvasLayer[][] = [];
  private historyPointer = -1;
  private isDirty = false;

  constructor(private w: Window, config: CropCanvasConfig) {
    this.config = config;
    this.canvas = typeof config.canvas === 'string' ? this.w.document.querySelector(config.canvas) as HTMLCanvasElement : config.canvas;
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    this.ctx = this.canvas.getContext('2d')!;
    this.handle = config.handle;
    this.addEventListeners();
    this.saveState(); // Save initial empty state
  }

  async run(data: CropCanvasRunParameter): Promise<void> {
    this.layers = [];
    this.handle = data.handle;
    await this.addImage(data.img, data.cropStroke);
  }

  public async addImage(imageSource: ImageBitmap | HTMLImageElement | Blob, cropStroke?: CropStrokeOptions) {
    try {
      const imageBitmap = imageSource instanceof ImageBitmap ? imageSource : await createImageBitmap(imageSource);
      const { x, y, width, height } = this.calculateInitialRect(imageBitmap);
      const newLayer: ImageLayer = {
        id: `layer_${Date.now()}`, type: 'image', image: imageBitmap,
        rect: { x, y, width, height }, rotation: 0, zIndex: this.nextZIndex++,
        cropStroke: cropStroke || { strokeColor: '#000000', strokeWidth: 2 },
        flipX: false, flipY: false
      };
      this.layers.push(newLayer);
      this.setSelectedLayer(newLayer.id);
      this.saveState();
    } catch (e) {
      console.error('Error adding image:', e);
      this.w.alert('Failed to load image. Please make sure it is a valid image file.');
    }
  }

  public async addText(text: string, options: Partial<TextOptions> = {}, cropStroke?: CropStrokeOptions) {
    const textLayer = await this.createTextLayer(text, options, cropStroke);
    const { x, y } = this.calculateInitialRect(textLayer.image);
    textLayer.rect.x = x;
    textLayer.rect.y = y;
    this.layers.push(textLayer);
    this.reindexLayers();
    this.setSelectedLayer(textLayer.id);
    this.saveState();
  }

  public async updateSelectedText(newText: string) {
      const layer = this.getSelectedLayer();
      if (layer?.type === 'text') {
          layer.text = newText;
          await this.regenerateTextLayer(layer);
          this.saveState();
      }
  }

  public async updateSelectedTextOptions(options: Partial<TextOptions>) {
    const layer = this.getSelectedLayer();
    if (layer?.type === 'text') {
      layer.options = { ...layer.options, ...options };
      await this.regenerateTextLayer(layer);
      this.saveState();
    }
  }

  public updateSelectedLayerCropStroke(stroke: CropStrokeOptions) {
      const layer = this.getSelectedLayer();
      if (layer) {
          layer.cropStroke = { ...layer.cropStroke, ...stroke };
          this.saveState();
      }
  }

  public updateCropTargetLayerStroke(stroke: CropStrokeOptions) {
      if (this.mode === 'erase') return;
      const layer = this.layers.find(l => l.id === this.layerToCropId);
      if (layer) {
          layer.cropStroke = { ...layer.cropStroke, ...stroke };
          if (this.mode !== 'none') {
              this.redraw();
          }
      }
  }

  public bringSelectedLayerToFront() {
      const selectedLayer = this.getSelectedLayer();
      if (!selectedLayer) return;
      this.layers = this.layers.filter(l => l.id !== selectedLayer.id);
      this.layers.push(selectedLayer);
      this.reindexLayers();
      this.redraw();
      this.saveState();
  }

  public sendSelectedLayerToBack() {
      const selectedLayer = this.getSelectedLayer();
      if (!selectedLayer) return;
      this.layers = this.layers.filter(l => l.id !== selectedLayer.id);
      this.layers.unshift(selectedLayer);
      this.reindexLayers();
      this.redraw();
      this.saveState();
  }

  private reindexLayers() {
      this.layers.forEach((layer, index) => {
          layer.zIndex = index;
      });
      this.nextZIndex = this.layers.length;
  }

  private setSelectedLayer(id: string | undefined) {
      if (this.selectedLayerId === id) return;
      this.selectedLayerId = id;
      this.config.onSelectionChange?.(this.getSelectedLayer() || null);
      this.redraw();
  }

  private setMode(mode: 'none' | 'crop' | 'erase') {
      if (this.mode === mode) return;
      this.mode = mode;
      const isActive = mode !== 'none';
      const targetLayer = this.layers.find(l => l.id === this.layerToCropId) || null;
      this.config.onCuttingModeChange?.(isActive, targetLayer);
      if (!isActive) {
          this.polygonPoints = [];
          this.layerToCropId = undefined;
      }
      this.redraw();
  }

  public enterEraseMode() {
      const selectedLayer = this.getSelectedLayer();
      if (selectedLayer) {
          this.layerToCropId = selectedLayer.id;
          this.setMode('erase');
          this.setSelectedLayer(undefined);
      }
  }

  private async regenerateTextLayer(layer: TextLayer, recalculateSize = false) {
      const oldRect = { ...layer.rect };
      if (recalculateSize) {
        layer.options.size = oldRect.height * 0.8; // Adjust font size based on rect height
      }
      layer.image = await this.createTextBitmap(layer.text, layer.options);
      const newWidth = layer.image.width;
      const newHeight = layer.image.height;
      // Recalculate position to keep center
      layer.rect.x = oldRect.x + (oldRect.width - newWidth) / 2;
      layer.rect.y = oldRect.y + (oldRect.height - newHeight) / 2;
      layer.rect.width = newWidth;
      layer.rect.height = newHeight;
      this.redraw();
  }

  private async createTextLayer(text: string, options: Partial<TextOptions>, cropStroke?: CropStrokeOptions): Promise<TextLayer> {
    const completeOptions: TextOptions = {
      font: options.font || 'sans-serif',
      size: options.size || 80,
      fillColor: options.fillColor || '#000000',
      strokeColor: options.strokeColor,
      strokeWidth: options.strokeWidth,
    };
    const imageBitmap = await this.createTextBitmap(text, completeOptions);
    return {
      id: `layer_${Date.now()}`, type: 'text', text, options: completeOptions, image: imageBitmap,
      rect: { x: 0, y: 0, width: imageBitmap.width, height: imageBitmap.height },
      rotation: 0, zIndex: 0,
      cropStroke: cropStroke || { strokeColor: '#000000', strokeWidth: 2 },
      flipX: false, flipY: false
    };
  }

  private async createTextBitmap(text: string, options: TextOptions): Promise<ImageBitmap> {
    const { font, size, fillColor, strokeColor, strokeWidth } = options;
    const lines = text.split('\n');
    const tempCtx = this.w.document.createElement('canvas').getContext('2d')!;
    tempCtx.font = `${size}px ${font}`;
    const maxWidth = Math.max(...lines.map(line => tempCtx.measureText(line).width));
    const strokePadding = (strokeWidth || 0) * 2;
    const emojiVerticalPadding = size! * 0.1;
    const lineHeight = size! + (size! * 0.05);
    const totalHeight = (lines.length * lineHeight) + strokePadding;
    const totalWidth = maxWidth + strokePadding;
    const canvas = this.w.document.createElement('canvas');
    canvas.width = Math.ceil(totalWidth) || 1;
    canvas.height = Math.ceil(totalHeight) || size!;
    const ctx = canvas.getContext('2d')!;
    ctx.font = `${size}px ${font}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const startX = strokePadding / 2;
    let currentY = (canvas.height - (lines.length - 1) * lineHeight) / 2 - emojiVerticalPadding / 2;
    // currentY+= (canvas.height*0.1)
    lines.forEach(line => {
      if (strokeWidth && strokeColor) {
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = strokeColor;
        ctx.strokeText(line, startX, currentY);
      }
      ctx.fillStyle = fillColor!;
      ctx.fillText(line, startX, currentY);
      currentY += lineHeight;
    });
    return createImageBitmap(canvas);
  }

  private addEventListeners() {
    this.canvas.addEventListener('mousedown', this.onPointerDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onPointerMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onPointerUp.bind(this));
    this.canvas.addEventListener('mouseleave', this.onPointerUp.bind(this));

    // Touch events for mobile devices
    this.canvas.addEventListener('touchstart', this.onPointerDown.bind(this));
    this.canvas.addEventListener('touchmove', this.onPointerMove.bind(this));
    this.canvas.addEventListener('touchend', this.onPointerUp.bind(this));
    this.canvas.addEventListener('touchcancel', this.onPointerUp.bind(this));
  }

  public resize(width: number, height: number) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.redraw();
  }

  private onPointerDown(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    const pointerPos = this.getPointerPos(event);
    this.dragStartPos = pointerPos;

    if (this.mode === 'crop' || this.mode === 'erase') {
        this.handleCuttingModePointerDown(pointerPos);
        return;
    }

    const selectedLayer = this.getSelectedLayer();
    if (selectedLayer) {
        // Check for action button clicks first to give them priority
        if (this.isPointInBringToFrontButton(pointerPos)) {
            this.bringSelectedLayerToFront();
            return;
        }
        if (this.isPointInSendToBackButton(pointerPos)) {
            this.sendSelectedLayerToBack();
            return;
        }
        if (this.isPointInCropButton(pointerPos)) {
            this.layerToCropId = selectedLayer.id;
            this.setMode('crop');
            this.setSelectedLayer(undefined);
            return;
        }
        if (this.isPointInEraseButton(pointerPos)) {
            this.enterEraseMode();
            return;
        }
        if (this.isPointInDeleteButton(pointerPos)) {
            this.deleteSelectedLayer();
            return;
        }

        // Then, check for handle clicks
        const handleIndex = this.getHandleAt(pointerPos, selectedLayer);
        if (handleIndex !== undefined) {
            this.activeHandle = handleIndex;
            this.isRotating = handleIndex >= HandlePosition.RotateTop;
            this.isResizing = handleIndex < HandlePosition.RotateTop;

            if (this.isResizing) {
                const oppositeHandleIndex = this.getOppositeHandle(handleIndex);
                const oppositeHandle = this.getHandles(selectedLayer.rect)[oppositeHandleIndex];
                this.resizePivot = this.rotatePoint(oppositeHandle, this.getCenter(selectedLayer.rect), selectedLayer.rotation);
                this.initialFlipX = selectedLayer.flipX || false;
                this.initialFlipY = selectedLayer.flipY || false;
            } else if (this.isRotating) {
                this.initialRotation = selectedLayer.rotation;
                const center = this.getCenter(selectedLayer.rect);
                this.initialAngle = Math.atan2(pointerPos.y - center.y, pointerPos.x - center.x);
            }
            this.redraw();
            return;
        }
    }

    const clickedLayer = this.getLayerAt(pointerPos);
    if (clickedLayer) {
        if (this.selectedLayerId !== clickedLayer.id) {
            this.setSelectedLayer(clickedLayer.id);
        }
        this.isMoving = true;
    } else {
        this.setSelectedLayer(undefined);
    }

    this.redraw();
  }


  private onPointerMove(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    const pointerPos = this.getPointerPos(event);
    const selectedLayer = this.getSelectedLayer();
    if (selectedLayer && (this.isMoving || this.isResizing || this.isRotating)) {
      this.isDirty = true;
      if (this.isMoving) {
        const dx = pointerPos.x - this.dragStartPos.x;
        const dy = pointerPos.y - this.dragStartPos.y;
        selectedLayer.rect.x += dx;
        selectedLayer.rect.y += dy;
      }
      else if (this.isResizing) { this.resizeLayer(pointerPos, selectedLayer); }
      else if (this.isRotating) { this.rotateLayer(pointerPos, selectedLayer); }
      this.dragStartPos = pointerPos;
      this.redraw();
    } else if (event instanceof MouseEvent) { this.updateCursor(pointerPos); }
  }

  private onPointerUp(event: MouseEvent | TouchEvent) {
    if (this.isDirty) {
        this.saveState();
        this.isDirty = false;
    }
    this.isMoving = false; this.isResizing = false; this.isRotating = false;
    this.activeHandle = undefined;
    if (event instanceof MouseEvent) this.canvas.style.cursor = 'default';
  }

  private redraw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.layers.sort((a, b) => a.zIndex - b.zIndex).forEach(layer => {
      this.ctx.save();
      const { x, y, width, height } = layer.rect;
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate(layer.rotation);
      const scaleX = layer.flipX ? -1 : 1;
      const scaleY = layer.flipY ? -1 : 1;
      this.ctx.scale(scaleX, scaleY);
      this.ctx.drawImage(layer.image, -width / 2, -height / 2, width, height);
      this.ctx.restore();
    });
    const selectedLayer = this.getSelectedLayer();
    if (selectedLayer && this.mode === 'none') {
      this.drawSelectionUI(selectedLayer);
      this.drawLayerActionButtons(selectedLayer);
    }
    if (this.mode === 'crop' || this.mode === 'erase') {
      this.drawCuttingOverlay();
      this.drawCuttingModeControls();
    }
  }

  private drawSelectionUI(layer: CanvasLayer) {
    this.ctx.save();
    const { x, y, width, height } = layer.rect;
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(layer.rotation);
    this.ctx.translate(-centerX, -centerY);

    this.ctx.strokeStyle = '#007bff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, width, height);

    const handles = this.getHandles(layer.rect);
    handles.forEach((handle, index) => {
        const isRotationHandle = index >= HandlePosition.RotateTop;
        const isSideHandle = index >= HandlePosition.MidTop && index < HandlePosition.RotateTop;

        this.ctx.save();
        this.ctx.translate(handle.x, handle.y);
        this.ctx.fillStyle = isRotationHandle ? '#ff8c00' : '#007bff';
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;

        if (isSideHandle) {
            const sideHandleWidth = this.handleSize * 1.2;
            const sideHandleHeight = this.handleSize * 0.6;
            if (index === HandlePosition.MidTop || index === HandlePosition.MidBottom) {
                this.ctx.fillRect(-sideHandleWidth / 2, -sideHandleHeight / 2, sideHandleWidth, sideHandleHeight);
                this.ctx.strokeRect(-sideHandleWidth / 2, -sideHandleHeight / 2, sideHandleWidth, sideHandleHeight);
            } else {
                this.ctx.fillRect(-sideHandleHeight / 2, -sideHandleWidth / 2, sideHandleHeight, sideHandleWidth);
                this.ctx.strokeRect(-sideHandleHeight / 2, -sideHandleWidth / 2, sideHandleHeight, sideHandleWidth);
            }
        } else {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, this.handleSize / 2, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.stroke();
        }

        if (isRotationHandle) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = `${this.handleSize * 0.8}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('↻', 0, 0);
        }
        this.ctx.restore();
    });
    this.ctx.restore();
  }

  public async addRect(options: RectOptions, cropStroke?: CropStrokeOptions) {
    const rectLayer = await this.createRectLayer(options, cropStroke);
    const { x, y } = this.calculateInitialRect(rectLayer.image);
    rectLayer.rect.x = x;
    rectLayer.rect.y = y;
    this.layers.push(rectLayer);
    this.reindexLayers();
    this.setSelectedLayer(rectLayer.id);
    this.saveState();
  }

  public async updateSelectedRect(options: RectOptions) {
      const layer = this.getSelectedLayer();
      if (layer?.type === 'rect') {
          layer.options = { ...layer.options, ...options };
          await this.regenerateRectLayer(layer);
          this.saveState();
      }
  }

  private async regenerateRectLayer(layer: RectLayer) {
      const oldRect = { ...layer.rect };
      layer.image = await this.createRectBitmap(layer.options, oldRect.width, oldRect.height);
      layer.rect.x = oldRect.x;
      layer.rect.y = oldRect.y;
      layer.rect.width = oldRect.width;
      layer.rect.height = oldRect.height;
      this.redraw();
  }

  private async createRectLayer(options: RectOptions, cropStroke?: CropStrokeOptions): Promise<RectLayer> {
    const width = 150; // Default width
    const height = 150; // Default height
    const imageBitmap = await this.createRectBitmap(options, width, height);
    return {
      id: `layer_${Date.now()}`, type: 'rect', options, image: imageBitmap,
      rect: { x: 0, y: 0, width, height },
      rotation: 0, zIndex: 0,
      cropStroke: cropStroke || { strokeColor: '#000000', strokeWidth: 2 },
      flipX: false, flipY: false
    };
  }

  private async createRectBitmap(options: RectOptions, width: number, height: number): Promise<ImageBitmap> {
    const canvas = this.w.document.createElement('canvas');
    const strokeWidth = options.strokeWidth || 0;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const drawX = strokeWidth / 2;
    const drawY = strokeWidth / 2;
    const drawWidth = width - strokeWidth;
    const drawHeight = height - strokeWidth;

    if (options.fillColor && options.fillColor !== '#00000000') {
        ctx.fillStyle = options.fillColor;
        ctx.fillRect(drawX, drawY, drawWidth, drawHeight);
    }

    if (strokeWidth > 0 && options.strokeColor && options.strokeColor !== '#00000000') {
        ctx.strokeStyle = options.strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.strokeRect(drawX, drawY, drawWidth, drawHeight);
    }

    return createImageBitmap(canvas);
  }

  public async addCircle(options: CircleOptions, cropStroke?: CropStrokeOptions) {
    const circleLayer = await this.createCircleLayer(options, cropStroke);
    const { x, y } = this.calculateInitialRect(circleLayer.image);
    circleLayer.rect.x = x;
    circleLayer.rect.y = y;
    this.layers.push(circleLayer);
    this.reindexLayers();
    this.setSelectedLayer(circleLayer.id);
    this.saveState();
  }

  public async updateSelectedCircle(options: CircleOptions) {
      const layer = this.getSelectedLayer();
      if (layer?.type === 'circle') {
          layer.options = { ...layer.options, ...options };
          await this.regenerateCircleLayer(layer);
          this.saveState();
      }
  }

  private async regenerateCircleLayer(layer: CircleLayer) {
      const oldRect = { ...layer.rect };
      layer.image = await this.createCircleBitmap(layer.options, oldRect.width, oldRect.height);
      layer.rect.x = oldRect.x;
      layer.rect.y = oldRect.y;
      layer.rect.width = oldRect.width;
      layer.rect.height = oldRect.height;
      this.redraw();
  }

  private async createCircleLayer(options: CircleOptions, cropStroke?: CropStrokeOptions): Promise<CircleLayer> {
    const diameter = 150; // Default diameter
    const imageBitmap = await this.createCircleBitmap(options, diameter, diameter);
    return {
      id: `layer_${Date.now()}`, type: 'circle', options, image: imageBitmap,
      rect: { x: 0, y: 0, width: diameter, height: diameter },
      rotation: 0, zIndex: 0,
      cropStroke: cropStroke || { strokeColor: '#000000', strokeWidth: 2 },
      flipX: false, flipY: false
    };
  }

  private async createCircleBitmap(options: CircleOptions, width: number, height: number): Promise<ImageBitmap> {
    const canvas = this.w.document.createElement('canvas');
    const strokeWidth = options.strokeWidth || 0;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    const radiusX = width / 2 - strokeWidth / 2;
    const radiusY = height / 2 - strokeWidth / 2;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);

    if (options.fillColor && options.fillColor !== '#00000000') {
        ctx.fillStyle = options.fillColor;
        ctx.fill();
    }

    if (strokeWidth > 0 && options.strokeColor && options.strokeColor !== '#00000000') {
        ctx.strokeStyle = options.strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
    }

    return createImageBitmap(canvas);
  }

  public async addTriangle(options: TriangleOptions, cropStroke?: CropStrokeOptions) {
    const triangleLayer = await this.createTriangleLayer(options, cropStroke);
    const { x, y } = this.calculateInitialRect(triangleLayer.image);
    triangleLayer.rect.x = x;
    triangleLayer.rect.y = y;
    this.layers.push(triangleLayer);
    this.reindexLayers();
    this.setSelectedLayer(triangleLayer.id);
    this.saveState();
  }

  public async updateSelectedTriangle(options: TriangleOptions) {
      const layer = this.getSelectedLayer();
      if (layer?.type === 'triangle') {
          layer.options = { ...layer.options, ...options };
          await this.regenerateTriangleLayer(layer);
          this.saveState();
      }
  }

  private async regenerateTriangleLayer(layer: TriangleLayer) {
      const oldRect = { ...layer.rect };
      layer.image = await this.createTriangleBitmap(layer.options, oldRect.width, oldRect.height);
      layer.rect.x = oldRect.x;
      layer.rect.y = oldRect.y;
      layer.rect.width = oldRect.width;
      layer.rect.height = oldRect.height;
      this.redraw();
  }

  private async createTriangleLayer(options: TriangleOptions, cropStroke?: CropStrokeOptions): Promise<TriangleLayer> {
    const width = 150;
    const height = 150;
    const imageBitmap = await this.createTriangleBitmap(options, width, height);
    return {
      id: `layer_${Date.now()}`, type: 'triangle', options, image: imageBitmap,
      rect: { x: 0, y: 0, width, height },
      rotation: 0, zIndex: 0,
      cropStroke: cropStroke || { strokeColor: '#000000', strokeWidth: 2 },
      flipX: false, flipY: false
    };
  }

  private async createTriangleBitmap(options: TriangleOptions, width: number, height: number): Promise<ImageBitmap> {
    const canvas = this.w.document.createElement('canvas');
    const strokeWidth = options.strokeWidth || 0;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const path = new Path2D();
    path.moveTo(strokeWidth / 2, height - strokeWidth / 2);
    path.lineTo(width / 2, strokeWidth / 2);
    path.lineTo(width - strokeWidth / 2, height - strokeWidth / 2);
    path.closePath();

    if (options.fillColor && options.fillColor !== '#00000000') {
        ctx.fillStyle = options.fillColor;
        ctx.fill(path);
    }

    if (strokeWidth > 0 && options.strokeColor && options.strokeColor !== '#00000000') {
        ctx.strokeStyle = options.strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.stroke(path);
    }

    return createImageBitmap(canvas);
  }

  private async createStarLayer(options: StarOptions, cropStroke?: CropStrokeOptions): Promise<StarLayer> {
    const width = 150;
    const height = 150;
    const imageBitmap = await this.createStarBitmap(options, width, height);
    return {
      id: `layer_${Date.now()}`, type: 'star', options, image: imageBitmap,
      rect: { x: 0, y: 0, width, height },
      rotation: 0, zIndex: 0,
      cropStroke: cropStroke || { strokeColor: '#000000', strokeWidth: 2 },
      flipX: false, flipY: false
    };
  }

  private async createStarBitmap(options: StarOptions, width: number, height: number): Promise<ImageBitmap> {
    const canvas = this.w.document.createElement('canvas');
    const strokeWidth = options.strokeWidth || 0;
    canvas.width = width + strokeWidth;
    canvas.height = height + strokeWidth;
    const ctx = canvas.getContext('2d')!;
    const x = strokeWidth / 2;
    const y = strokeWidth / 2;

    // Points for a 5-pointed star, normalized to a 0-1 range, then scaled by width and height
    const points = [
        { x: 0.5,   y: 0 },     // Top center
        { x: 0.618, y: 0.363 }, // Inner right-top
        { x: 1,     y: 0.363 }, // Outer right
        { x: 0.691, y: 0.623 }, // Inner right-bottom
        { x: 0.809, y: 1 },     // Outer bottom-right
        { x: 0.5,   y: 0.763 }, // Inner bottom
        { x: 0.191, y: 1 },     // Outer bottom-left
        { x: 0.309, y: 0.623 }, // Inner left-bottom
        { x: 0,     y: 0.363 }, // Outer left
        { x: 0.382, y: 0.363 }  // Inner left-top
    ];

    ctx.beginPath();
    points.forEach((p, i) => {
        const pointX = x + p.x * width;
        const pointY = y + p.y * height;
        if (i === 0) {
            ctx.moveTo(pointX, pointY);
        } else {
            ctx.lineTo(pointX, pointY);
        }
    });
    ctx.closePath();

    if (options.fillColor && options.fillColor !== '#00000000') {
        ctx.fillStyle = options.fillColor;
        ctx.fill();
    }

    if (strokeWidth > 0 && options.strokeColor && options.strokeColor !== '#00000000') {
        ctx.strokeStyle = options.strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
    }

    return createImageBitmap(canvas);
  }

  public async addStar(options: StarOptions, cropStroke?: CropStrokeOptions) {
    const starLayer = await this.createStarLayer(options, cropStroke);
    const { x, y } = this.calculateInitialRect(starLayer.image);
    starLayer.rect.x = x;
    starLayer.rect.y = y;
    this.layers.push(starLayer);
    this.reindexLayers();
    this.setSelectedLayer(starLayer.id);
    this.saveState();
  }

  public async updateSelectedStar(options: StarOptions) {
      const layer = this.getSelectedLayer();
      if (layer?.type === 'star') {
          layer.options = { ...layer.options, ...options };
          await this.regenerateStarLayer(layer);
          this.saveState();
      }
  }

  private async regenerateStarLayer(layer: StarLayer) {
      const oldRect = { ...layer.rect };
      layer.image = await this.createStarBitmap(layer.options, oldRect.width, oldRect.height);
      layer.rect.x = oldRect.x;
      layer.rect.y = oldRect.y;
      layer.rect.width = oldRect.width;
      layer.rect.height = oldRect.height;
      this.redraw();
  }

  public async addHeart(options: HeartOptions, cropStroke?: CropStrokeOptions) {
    const heartLayer = await this.createHeartLayer(options, cropStroke);
    const { x, y } = this.calculateInitialRect(heartLayer.image);
    heartLayer.rect.x = x;
    heartLayer.rect.y = y;
    this.layers.push(heartLayer);
    this.reindexLayers();
    this.setSelectedLayer(heartLayer.id);
    this.saveState();
  }

  public async updateSelectedHeart(options: HeartOptions) {
      const layer = this.getSelectedLayer();
      if (layer?.type === 'heart') {
          layer.options = { ...layer.options, ...options };
          await this.regenerateHeartLayer(layer);
          this.saveState();
      }
  }

  private async regenerateHeartLayer(layer: HeartLayer) {
      const oldRect = { ...layer.rect };
      layer.image = await this.createHeartBitmap(layer.options, oldRect.width, oldRect.height);
      layer.rect.x = oldRect.x;
      layer.rect.y = oldRect.y;
      layer.rect.width = oldRect.width;
      layer.rect.height = oldRect.height;
      this.redraw();
  }

  private async createHeartLayer(options: HeartOptions, cropStroke?: CropStrokeOptions): Promise<HeartLayer> {
    const width = 150;
    const height = 150;
    const imageBitmap = await this.createHeartBitmap(options, width, height);
    return {
      id: `layer_${Date.now()}`, type: 'heart', options, image: imageBitmap,
      rect: { x: 0, y: 0, width, height },
      rotation: 0, zIndex: 0,
      cropStroke: cropStroke || { strokeColor: '#000000', strokeWidth: 2 },
      flipX: false, flipY: false
    };
  }

  private async createHeartBitmap(options: HeartOptions, width: number, height: number): Promise<ImageBitmap> {
    const canvas = this.w.document.createElement('canvas');
    const strokeWidth = options.strokeWidth || 0;
    canvas.width = width + strokeWidth;
    canvas.height = height + strokeWidth;
    const ctx = canvas.getContext('2d')!;
    const x = strokeWidth / 2;
    const y = strokeWidth / 2;
    const w = width;
    const h = height;

    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + h); // bottom tip
    //ctx.bezierCurveTo(x - w * 0.1, y + h * 0.7, x, y, x + w / 2, y + h * 0.3);                    │
    //ctx.bezierCurveTo(x + w, y, x + w * 1.1, y + h * 0.7, x + w / 2, y + h);
    const start1_cp1X = x - w * (0.1);
    const start1_cp1Y = y + h * 0.7;
    const start1_cp2X = x-(w*0.2);
    const start1_cp2Y = y-(h*0.3);
    const start1_endX = x + w / 2;
    const start1_endY = y + h * 0.1;
    ctx.bezierCurveTo(start1_cp1X, start1_cp1Y, start1_cp2X, start1_cp2Y, start1_endX, start1_endY);
    const start2_cp1X = x + w + (w*0.2);
    const start2_cp1Y = y - (h*0.3);
    const start2_cp2X = x + w * 1.1;
    const start2_cp2Y = y + h * 0.7;
    const start2_endX = x + w / 2;
    const start2_endY = y + h;
    ctx.bezierCurveTo(start2_cp1X, start2_cp1Y, start2_cp2X, start2_cp2Y, start2_endX, start2_endY);
    ctx.closePath();

    if (options.fillColor && options.fillColor !== '#00000000') {
        ctx.fillStyle = options.fillColor;
        ctx.fill();
    }

    if (strokeWidth > 0 && options.strokeColor && options.strokeColor !== '#00000000') {
        ctx.strokeStyle = options.strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
    }

    return createImageBitmap(canvas);
  }

  public async addSpeechBubble(options: SpeechBubbleOptions, cropStroke?: CropStrokeOptions) {
    const speechBubbleLayer = await this.createSpeechBubbleLayer(options, cropStroke);
    const { x, y } = this.calculateInitialRect(speechBubbleLayer.image);
    speechBubbleLayer.rect.x = x;
    speechBubbleLayer.rect.y = y;
    this.layers.push(speechBubbleLayer);
    this.reindexLayers();
    this.setSelectedLayer(speechBubbleLayer.id);
    this.saveState();
  }

  public async updateSelectedSpeechBubble(options: SpeechBubbleOptions) {
      const layer = this.getSelectedLayer();
      if (layer?.type === 'speechBubble') {
          layer.options = { ...layer.options, ...options };
          await this.regenerateSpeechBubbleLayer(layer);
          this.saveState();
      }
  }

  private async regenerateSpeechBubbleLayer(layer: SpeechBubbleLayer) {
      const oldRect = { ...layer.rect };
      layer.image = await this.createSpeechBubbleBitmap(layer.options, oldRect.width, oldRect.height);
      layer.rect.x = oldRect.x;
      layer.rect.y = oldRect.y;
      layer.rect.width = oldRect.width;
      layer.rect.height = oldRect.height;
      this.redraw();
  }

  private async createSpeechBubbleLayer(options: SpeechBubbleOptions, cropStroke?: CropStrokeOptions): Promise<SpeechBubbleLayer> {
    const width = 200;
    const height = 150;
    const imageBitmap = await this.createSpeechBubbleBitmap(options, width, height);
    return {
      id: `layer_${Date.now()}`, type: 'speechBubble', options, image: imageBitmap,
      rect: { x: 0, y: 0, width, height },
      rotation: 0, zIndex: 0,
      cropStroke: cropStroke || { strokeColor: '#000000', strokeWidth: 2 },
      flipX: false, flipY: false
    };
  }

  private async createSpeechBubbleBitmap(options: SpeechBubbleOptions, width: number, height: number): Promise<ImageBitmap> {
    const canvas = this.w.document.createElement('canvas');
    const strokeWidth = options.strokeWidth || 0;
    canvas.width = width + strokeWidth;
    canvas.height = height + strokeWidth;
    const ctx = canvas.getContext('2d')!;
    const x = strokeWidth / 2;
    const y = strokeWidth / 2;
    const bubbleWidth = width - strokeWidth;
    const bubbleHeight = height - strokeWidth - (height * 0.1); // Make space for the tail
    const borderRadius = Math.min(width, height) * 0.1;

    ctx.beginPath();
    ctx.moveTo(x + borderRadius, y);
    ctx.lineTo(x + bubbleWidth - borderRadius, y);
    ctx.quadraticCurveTo(x + bubbleWidth, y, x + bubbleWidth, y + borderRadius);
    ctx.lineTo(x + bubbleWidth, y + bubbleHeight - borderRadius);
    ctx.quadraticCurveTo(x + bubbleWidth, y + bubbleHeight, x + bubbleWidth - borderRadius, y + bubbleHeight);
    ctx.lineTo(x + bubbleWidth / 2 + (width * 0.1), y + bubbleHeight); // Tail start
    ctx.lineTo(x + bubbleWidth / 2, y + bubbleHeight + (height * 0.1)); // Tail point
    ctx.lineTo(x + bubbleWidth / 2 - (width * 0.1), y + bubbleHeight); // Tail end
    ctx.lineTo(x + borderRadius, y + bubbleHeight);
    ctx.quadraticCurveTo(x, y + bubbleHeight, x, y + bubbleHeight - borderRadius);
    ctx.lineTo(x, y + borderRadius);
    ctx.quadraticCurveTo(x, y, x + borderRadius, y);
    ctx.closePath();

    if (options.fillColor && options.fillColor !== '#00000000') {
        ctx.fillStyle = options.fillColor;
        ctx.fill();
    }

    if (strokeWidth > 0 && options.strokeColor && options.strokeColor !== '#00000000') {
        ctx.strokeStyle = options.strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
    }

    return createImageBitmap(canvas);
  }

  public async addPentagon(options: PentagonOptions, cropStroke?: CropStrokeOptions) {
    const pentagonLayer = await this.createPentagonLayer(options, cropStroke);
    const { x, y } = this.calculateInitialRect(pentagonLayer.image);
    pentagonLayer.rect.x = x;
    pentagonLayer.rect.y = y;
    this.layers.push(pentagonLayer);
    this.reindexLayers();
    this.setSelectedLayer(pentagonLayer.id);
    this.saveState();
  }

  public async updateSelectedPentagon(options: PentagonOptions) {
      const layer = this.getSelectedLayer();
      if (layer?.type === 'pentagon') {
          layer.options = { ...layer.options, ...options };
          await this.regeneratePentagonLayer(layer);
          this.saveState();
      }
  }

  private async regeneratePentagonLayer(layer: PentagonLayer) {
      const oldRect = { ...layer.rect };
      layer.image = await this.createPentagonBitmap(layer.options, oldRect.width, oldRect.height);
      layer.rect.x = oldRect.x;
      layer.rect.y = oldRect.y;
      layer.rect.width = oldRect.width;
      layer.rect.height = oldRect.height;
      this.redraw();
  }

  private async createPentagonLayer(options: PentagonOptions, cropStroke?: CropStrokeOptions): Promise<PentagonLayer> {
    const width = 150;
    const height = 150;
    const imageBitmap = await this.createPentagonBitmap(options, width, height);
    return {
      id: `layer_${Date.now()}`, type: 'pentagon', options, image: imageBitmap,
      rect: { x: 0, y: 0, width, height },
      rotation: 0, zIndex: 0,
      cropStroke: cropStroke || { strokeColor: '#000000', strokeWidth: 2 },
      flipX: false, flipY: false
    };
  }

  private async createPentagonBitmap(options: PentagonOptions, width: number, height: number): Promise<ImageBitmap> {
    const canvas = this.w.document.createElement('canvas');
    const strokeWidth = options.strokeWidth || 0;
    canvas.width = width + strokeWidth;
    canvas.height = height + strokeWidth;
    const ctx = canvas.getContext('2d')!;
    const x = strokeWidth / 2;
    const y = strokeWidth / 2;

    // Points for a pentagon, normalized to a 0-1 range, then scaled
    const points = [
        { x: 0.5, y: 0 },      // Top center
        { x: 1,   y: 0.38 },   // Right
        { x: 0.8, y: 1 },      // Bottom right
        { x: 0.2, y: 1 },      // Bottom left
        { x: 0,   y: 0.38 }    // Left
    ];

    ctx.beginPath();
    points.forEach((p, i) => {
        const pointX = x + p.x * width;
        const pointY = y + p.y * height;
        if (i === 0) {
            ctx.moveTo(pointX, pointY);
        } else {
            ctx.lineTo(pointX, pointY);
        }
    });
    ctx.closePath();

    if (options.fillColor && options.fillColor !== '#00000000') {
        ctx.fillStyle = options.fillColor;
        ctx.fill();
    }

    if (strokeWidth > 0 && options.strokeColor && options.strokeColor !== '#00000000') {
        ctx.strokeStyle = options.strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
    }

    return createImageBitmap(canvas);
  }

  public async addOctagon(options: OctagonOptions, cropStroke?: CropStrokeOptions) {
    const octagonLayer = await this.createOctagonLayer(options, cropStroke);
    const { x, y } = this.calculateInitialRect(octagonLayer.image);
    octagonLayer.rect.x = x;
    octagonLayer.rect.y = y;
    this.layers.push(octagonLayer);
    this.reindexLayers();
    this.setSelectedLayer(octagonLayer.id);
    this.saveState();
  }

  public async updateSelectedOctagon(options: OctagonOptions) {
      const layer = this.getSelectedLayer();
      if (layer?.type === 'octagon') {
          layer.options = { ...layer.options, ...options };
          await this.regenerateOctagonLayer(layer);
          this.saveState();
      }
  }

  private async regenerateOctagonLayer(layer: OctagonLayer) {
      const oldRect = { ...layer.rect };
      layer.image = await this.createOctagonBitmap(layer.options, oldRect.width, oldRect.height);
      layer.rect.x = oldRect.x;
      layer.rect.y = oldRect.y;
      layer.rect.width = oldRect.width;
      layer.rect.height = oldRect.height;
      this.redraw();
  }

  private async createOctagonLayer(options: OctagonOptions, cropStroke?: CropStrokeOptions): Promise<OctagonLayer> {
    const width = 150;
    const height = 150;
    const imageBitmap = await this.createOctagonBitmap(options, width, height);
    return {
      id: `layer_${Date.now()}`, type: 'octagon', options, image: imageBitmap,
      rect: { x: 0, y: 0, width, height },
      rotation: 0, zIndex: 0,
      cropStroke: cropStroke || { strokeColor: '#000000', strokeWidth: 2 },
      flipX: false, flipY: false
    };
  }

  private async createOctagonBitmap(options: OctagonOptions, width: number, height: number): Promise<ImageBitmap> {
    const canvas = this.w.document.createElement('canvas');
    const strokeWidth = options.strokeWidth || 0;
    canvas.width = width + strokeWidth;
    canvas.height = height + strokeWidth;
    const ctx = canvas.getContext('2d')!;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radiusX = width / 2;
    const radiusY = height / 2;
    const sides = 8;

    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const angle = (2 * Math.PI / sides) * i - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radiusX;
        const y = centerY + Math.sin(angle) * radiusY;
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();

    if (options.fillColor && options.fillColor !== '#00000000') {
        ctx.fillStyle = options.fillColor;
        ctx.fill();
    }

    if (strokeWidth > 0 && options.strokeColor && options.strokeColor !== '#00000000') {
        ctx.strokeStyle = options.strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
    }

    return createImageBitmap(canvas);
  }

  public async addSemicircle(options: SemicircleOptions, cropStroke?: CropStrokeOptions) {
    const semicircleLayer = await this.createSemicircleLayer(options, cropStroke);
    const { x, y } = this.calculateInitialRect(semicircleLayer.image);
    semicircleLayer.rect.x = x;
    semicircleLayer.rect.y = y;
    this.layers.push(semicircleLayer);
    this.reindexLayers();
    this.setSelectedLayer(semicircleLayer.id);
    this.saveState();
  }

  public async updateSelectedSemicircle(options: SemicircleOptions) {
      const layer = this.getSelectedLayer();
      if (layer?.type === 'semicircle') {
          layer.options = { ...layer.options, ...options };
          await this.regenerateSemicircleLayer(layer);
          this.saveState();
      }
  }

  private async regenerateSemicircleLayer(layer: SemicircleLayer) {
      const oldRect = { ...layer.rect };
      layer.image = await this.createSemicircleBitmap(layer.options, oldRect.width, oldRect.height);
      layer.rect.x = oldRect.x;
      layer.rect.y = oldRect.y;
      layer.rect.width = oldRect.width;
      layer.rect.height = oldRect.height;
      this.redraw();
  }

  private async createSemicircleLayer(options: SemicircleOptions, cropStroke?: CropStrokeOptions): Promise<SemicircleLayer> {
    const width = 150;
    const height = 75;
    const imageBitmap = await this.createSemicircleBitmap(options, width, height);
    return {
      id: `layer_${Date.now()}`, type: 'semicircle', options, image: imageBitmap,
      rect: { x: 0, y: 0, width, height },
      rotation: 0, zIndex: 0,
      cropStroke: cropStroke || { strokeColor: '#000000', strokeWidth: 2 },
      flipX: false, flipY: false
    };
  }

  private async createSemicircleBitmap(options: SemicircleOptions, width: number, height: number): Promise<ImageBitmap> {
    const canvas = this.w.document.createElement('canvas');
    const strokeWidth = options.strokeWidth || 0;
    canvas.width = width + strokeWidth;
    canvas.height = height + strokeWidth;
    const ctx = canvas.getContext('2d')!;
    const centerX = canvas.width / 2;
    const centerY = canvas.height;
    const radiusX = width / 2;
    const radiusY = height;

    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, Math.PI, 2 * Math.PI);
    ctx.closePath();

    if (options.fillColor && options.fillColor !== '#00000000') {
        ctx.fillStyle = options.fillColor;
        ctx.fill();
    }

    if (strokeWidth > 0 && options.strokeColor && options.strokeColor !== '#00000000') {
        ctx.strokeStyle = options.strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
    }

    return createImageBitmap(canvas);
  }

  public async addCross(options: CrossOptions, cropStroke?: CropStrokeOptions) {
    const crossLayer = await this.createCrossLayer(options, cropStroke);
    const { x, y } = this.calculateInitialRect(crossLayer.image);
    crossLayer.rect.x = x;
    crossLayer.rect.y = y;
    this.layers.push(crossLayer);
    this.reindexLayers();
    this.setSelectedLayer(crossLayer.id);
    this.saveState();
  }

  public async updateSelectedCross(options: CrossOptions) {
      const layer = this.getSelectedLayer();
      if (layer?.type === 'cross') {
          layer.options = { ...layer.options, ...options };
          await this.regenerateCrossLayer(layer);
          this.saveState();
      }
  }

  private async regenerateCrossLayer(layer: CrossLayer) {
      const oldRect = { ...layer.rect };
      layer.image = await this.createCrossBitmap(layer.options, oldRect.width, oldRect.height);
      layer.rect.x = oldRect.x;
      layer.rect.y = oldRect.y;
      layer.rect.width = oldRect.width;
      layer.rect.height = oldRect.height;
      this.redraw();
  }

  private async createCrossLayer(options: CrossOptions, cropStroke?: CropStrokeOptions): Promise<CrossLayer> {
    const width = 150;
    const height = 150;
    const imageBitmap = await this.createCrossBitmap(options, width, height);
    return {
      id: `layer_${Date.now()}`, type: 'cross', options, image: imageBitmap,
      rect: { x: 0, y: 0, width, height },
      rotation: 0, zIndex: 0,
      cropStroke: cropStroke || { strokeColor: '#000000', strokeWidth: 2 },
      flipX: false, flipY: false
    };
  }

  private async createCrossBitmap(options: CrossOptions, width: number, height: number): Promise<ImageBitmap> {
    const canvas = this.w.document.createElement('canvas');
    const strokeWidth = options.strokeWidth || 0;
    canvas.width = width + strokeWidth;
    canvas.height = height + strokeWidth;
    const ctx = canvas.getContext('2d')!;
    const armThicknessX = width / 3;
    const armThicknessY = height / 3;

    ctx.beginPath();
    ctx.moveTo(strokeWidth / 2 + armThicknessX, strokeWidth / 2);
    ctx.lineTo(strokeWidth / 2 + armThicknessX * 2, strokeWidth / 2);
    ctx.lineTo(strokeWidth / 2 + armThicknessX * 2, strokeWidth / 2 + armThicknessY);
    ctx.lineTo(strokeWidth / 2 + width, strokeWidth / 2 + armThicknessY);
    ctx.lineTo(strokeWidth / 2 + width, strokeWidth / 2 + armThicknessY * 2);
    ctx.lineTo(strokeWidth / 2 + armThicknessX * 2, strokeWidth / 2 + armThicknessY * 2);
    ctx.lineTo(strokeWidth / 2 + armThicknessX * 2, strokeWidth / 2 + height);
    ctx.lineTo(strokeWidth / 2 + armThicknessX, strokeWidth / 2 + height);
    ctx.lineTo(strokeWidth / 2 + armThicknessX, strokeWidth / 2 + armThicknessY * 2);
    ctx.lineTo(strokeWidth / 2, strokeWidth / 2 + armThicknessY * 2);
    ctx.lineTo(strokeWidth / 2, strokeWidth / 2 + armThicknessY);
    ctx.lineTo(strokeWidth / 2 + armThicknessX, strokeWidth / 2 + armThicknessY);
    ctx.closePath();

    if (options.fillColor && options.fillColor !== '#00000000') {
        ctx.fillStyle = options.fillColor;
        ctx.fill();
    }

    if (strokeWidth > 0 && options.strokeColor && options.strokeColor !== '#00000000') {
        ctx.strokeStyle = options.strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
    }

    return createImageBitmap(canvas);
  }

  private deleteSelectedLayer() {
    if (!this.selectedLayerId) return;
    this.layers = this.layers.filter(l => l.id !== this.selectedLayerId);
    this.reindexLayers();
    this.setSelectedLayer(undefined);
    this.saveState();
  }

  public getSelectedLayer = () => this.layers.find(l => l.id === this.selectedLayerId);
  public getMode = () => this.mode;
  public isSelectedMode = () => !!this.selectedLayerId;
  private getLayerAt(point: Point): CanvasLayer | undefined {
    for (let i = this.layers.length - 1; i >= 0; i--) {
      if (this.isPointInLayer(point, this.layers[i])) return this.layers[i];
    }
    return undefined;
  }

  private isPointInLayer(point: Point, layer: CanvasLayer): boolean {
    const { x, y, width, height } = layer.rect;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const translatedX = point.x - centerX;
    const translatedY = point.y - centerY;
    const rotatedX = translatedX * Math.cos(-layer.rotation) - translatedY * Math.sin(-layer.rotation);
    const rotatedY = translatedX * Math.sin(-layer.rotation) + translatedY * Math.cos(-layer.rotation);

    if (layer.type === 'circle') {
        const radiusX = width / 2;
        const radiusY = height / 2;
        if (radiusX <= 0 || radiusY <= 0) return false;
        return (rotatedX ** 2) / (radiusX ** 2) + (rotatedY ** 2) / (radiusY ** 2) <= 1;
    } else if (layer.type === 'triangle') {
        // Check if point is inside the bounding box first for quick elimination
        if (Math.abs(rotatedX) > width / 2 || Math.abs(rotatedY) > height / 2) {
            return false;
        }
        // Barycentric coordinate system check for point in triangle
        const p = { x: rotatedX + width / 2, y: rotatedY + height / 2 };
        const p0 = { x: 0, y: height };
        const p1 = { x: width / 2, y: 0 };
        const p2 = { x: width, y: height };

        const dX = p.x - p2.x;
        const dY = p.y - p2.y;
        const dX21 = p2.x - p1.x;
        const dY12 = p1.y - p2.y;
        const D = dY12 * (p0.x - p2.x) + dX21 * (p0.y - p2.y);
        const s = dY12 * dX + dX21 * dY;
        const t = (p2.y - p0.y) * dX + (p0.x - p2.x) * dY;
        if (D < 0) return s <= 0 && t <= 0 && s + t >= D;
        return s >= 0 && t >= 0 && s + t <= D;
    }
    return Math.abs(rotatedX) <= width / 2 && Math.abs(rotatedY) <= height / 2;
  }

  private getHandleAt(point: Point, layer: CanvasLayer): HandlePosition | undefined {
    const handles = this.getHandles(layer.rect);
    for (let i = 0; i < handles.length; i++) {
      const handle = handles[i];

      const center = this.getCenter(layer.rect);
      const rotatedHandle = this.rotatePoint(handle, center, layer.rotation);

      if (Math.sqrt((point.x - rotatedHandle.x) ** 2 + (point.y - rotatedHandle.y) ** 2) <= this.handleHitAreaSize / 2) return i as HandlePosition;
    }
    return undefined;
  }

  private getHandles(rect: { x: number, y: number, width: number, height: number }): Point[] {
    const { x, y, width, height } = rect;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const handleOffset = this.handleSize * 1.8;
    return [
      { x: x, y: y }, { x: x + width, y: y },
      { x: x, y: y + height }, { x: x + width, y: y + height },
      { x: centerX, y: y }, { x: x + width, y: centerY },
      { x: centerX, y: y + height }, { x: x, y: centerY },
      { x: centerX, y: y - handleOffset },
      { x: x + width + handleOffset, y: centerY },
      { x: centerX, y: y + height + handleOffset },
      { x: x - handleOffset, y: centerY },
    ];
  }

  private getOppositeHandle(handle: HandlePosition): HandlePosition {
      const cornerOpposites = [HandlePosition.BottomRight, HandlePosition.BottomLeft, HandlePosition.TopRight, HandlePosition.TopLeft];
      const sideOpposites = [HandlePosition.MidBottom, HandlePosition.MidLeft, HandlePosition.MidTop, HandlePosition.MidRight];
      if (handle <= HandlePosition.BottomRight) return cornerOpposites[handle];
      return sideOpposites[handle - 4];
  }

  private rotateLayer(currentPos: Point, layer: CanvasLayer) {
    const center = this.getCenter(layer.rect);
    const currentAngle = Math.atan2(currentPos.y - center.y, currentPos.x - center.x);
    layer.rotation = this.initialRotation + (currentAngle - this.initialAngle);
  }

  private async resizeLayer(mousePos: Point, layer: CanvasLayer) {
    const { rotation } = layer;
    const oldRect = { ...layer.rect };
    const center = this.getCenter(oldRect);

    const localMouse = this.rotatePoint(mousePos, center, -rotation);
    const localPivot = this.rotatePoint(this.resizePivot, center, -rotation);

    const dx = localMouse.x - localPivot.x;
    const dy = localMouse.y - localPivot.y;

    const handle = this.activeHandle!;

    const isCornerHandle = handle <= HandlePosition.BottomRight;
    const isHorizontalHandle = handle === HandlePosition.MidLeft || handle === HandlePosition.MidRight;
    const isVerticalHandle = handle === HandlePosition.MidTop || handle === HandlePosition.MidBottom;

    if (isCornerHandle || isHorizontalHandle) {
        const isLeftHandle = handle === HandlePosition.TopLeft || handle === HandlePosition.MidLeft || handle === HandlePosition.BottomLeft;
        const hasFlippedX = isLeftHandle ? (dx > 0) : (dx < 0);
        layer.flipX = this.initialFlipX ? !hasFlippedX : hasFlippedX;
    }

    if (isCornerHandle || isVerticalHandle) {
        const isTopHandle = handle === HandlePosition.TopLeft || handle === HandlePosition.MidTop || handle === HandlePosition.TopRight;
        const hasFlippedY = isTopHandle ? (dy > 0) : (dy < 0);
        layer.flipY = this.initialFlipY ? !hasFlippedY : hasFlippedY;
    }

    let newLocalRect: { x: number, y: number, width: number, height: number };

    if (isCornerHandle) {
        newLocalRect = {
            x: Math.min(localPivot.x, localPivot.x + dx),
            y: Math.min(localPivot.y, localPivot.y + dy),
            width: Math.abs(dx),
            height: Math.abs(dy)
        };
    } else { // Side handles
        const oldLocalTopLeft = { x: center.x - oldRect.width / 2, y: center.y - oldRect.height / 2 };
        if (isVerticalHandle) {
            newLocalRect = {
                x: oldLocalTopLeft.x,
                y: Math.min(localMouse.y, localPivot.y),
                width: oldRect.width,
                height: Math.abs(localMouse.y - localPivot.y)
            };
        } else { // isHorizontalHandle
            newLocalRect = {
                x: Math.min(localMouse.x, localPivot.x),
                y: oldLocalTopLeft.y,
                width: Math.abs(localMouse.x - localPivot.x),
                height: oldRect.height
            };
        }
    }

    const newLocalCenter = { x: newLocalRect.x + newLocalRect.width / 2, y: newLocalRect.y + newLocalRect.height / 2 };
    const newWorldCenter = this.rotatePoint(newLocalCenter, center, rotation);

    layer.rect.width = newLocalRect.width;
    layer.rect.height = newLocalRect.height;
    layer.rect.x = newWorldCenter.x - newLocalRect.width / 2;
    layer.rect.y = newWorldCenter.y - newLocalRect.height / 2;

    if (layer.type === 'rect') await this.regenerateRectLayer(layer);
    else if (layer.type === 'circle') await this.regenerateCircleLayer(layer);
    else if (layer.type === 'triangle') await this.regenerateTriangleLayer(layer);
    else if (layer.type === 'star') await this.regenerateStarLayer(layer);
    else if (layer.type === 'heart') await this.regenerateHeartLayer(layer);
    else if (layer.type === 'speechBubble') await this.regenerateSpeechBubbleLayer(layer);
    else if (layer.type === 'pentagon') await this.regeneratePentagonLayer(layer);
    else if (layer.type === 'octagon') await this.regenerateOctagonLayer(layer);
    else if (layer.type === 'semicircle') await this.regenerateSemicircleLayer(layer);
    else if (layer.type === 'cross') await this.regenerateCrossLayer(layer);
    // else if (layer.type === 'text') await this.regenerateTextLayer(layer, true);
  }

  private rotatePoint(point: Point, center: Point, angle: number): Point {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const dx = point.x - center.x;
      const dy = point.y - center.y;
      return {
          x: dx * cos - dy * sin + center.x,
          y: dx * sin + dy * cos + center.y
      };
  }

  private getCenter = (rect: {x:number, y:number, width:number, height:number}) => ({ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });

  private calculateInitialRect = (image: ImageBitmap) => {
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
    const imageAspectRatio = image.width / image.height;
    const maxWidth = canvasWidth * 0.5;
    const maxHeight = canvasHeight * 0.5;
    let drawWidth = maxWidth;
    let drawHeight = drawWidth / imageAspectRatio;
    if (drawHeight > maxHeight) {
      drawHeight = maxHeight;
      drawWidth = drawHeight * imageAspectRatio;
    }
    const x = (canvasWidth - drawWidth) / 2;
    const y = (canvasHeight - drawHeight) / 2;
    return { x, y, width: drawWidth, height: drawHeight };
  };

  private getPointerPos = (event: MouseEvent | TouchEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = (event instanceof MouseEvent) ? event.clientX : event.touches[0].clientX;
    const clientY = (event instanceof MouseEvent) ? event.clientY : event.touches[0].clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  private updateCursor(mousePos: Point) {
    let cursor = 'default';
    const selectedLayer = this.getSelectedLayer();

    if (this.mode === 'none' && selectedLayer) {
        if (this.isPointInCropButton(mousePos) || this.isPointInEraseButton(mousePos) || this.isPointInDeleteButton(mousePos) || this.isPointInBringToFrontButton(mousePos) || this.isPointInSendToBackButton(mousePos)) {
            cursor = 'pointer';
        } else {
            const handle = this.getHandleAt(mousePos, selectedLayer);
            if (handle !== undefined) {
                if (handle >= HandlePosition.RotateTop) {
                    cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 512 512"><path fill="black" stroke="white" stroke-width="30" stroke-linejoin="round" d="M142.9 142.9c-17.5 17.5-30.1 38-37.8 59.8c-5.9 16.7-24.2 25.4-40.8 19.5s-25.4-24.2-19.5-40.8C55.6 150.7 73.2 122 97.6 97.6c87.2-87.2 228.3-87.5 315.8-1L455 55c6.9-6.9 17.2-8.9 26.2-5.2s14.8 12.5 14.8 22.2l0 128c0 13.3-10.7 24-24 24l-8.4 0c0 0 0 0 0 0L344 224c-9.7 0-18.5-5.8-22.2-14.8s-1.7-19.3 5.2-26.2l41.1-41.1c-62.6-61.5-163.1-61.2-225.3 1zM16 312c0-13.3 10.7-24 24-24l7.6 0 .7 0L168 288c9.7 0 18.5 5.8 22.2 14.8s1.7 19.3-5.2 26.2l-41.1 41.1c62.6 61.5 163.1 61.2 225.3-1c17.5-17.5 30.1-38 37.8-59.8c5.9-16.7 24.2-25.4 40.8-19.5s25.4 24.2 19.5 40.8c-10.8 30.6-28.4 59.3-52.9 83.8c-87.2 87.2-228.3 87.5-315.8 1L57 457c-6.9 6.9-17.2 8.9-26.2 5.2S16 449.7 16 440l0-119.6 0-.7 0-7.6z"/></svg>') 12 12, auto`;
                } else if (handle >= HandlePosition.MidTop) {
                    const angle = (selectedLayer.rotation * 180 / Math.PI + 360) % 360;
                    const isVerticalHandle = handle === HandlePosition.MidTop || handle === HandlePosition.MidBottom;
                    const baseCursor = isVerticalHandle ? 'ns-resize' : 'ew-resize';
                    const swappedCursor = isVerticalHandle ? 'ew-resize' : 'ns-resize';
                    if ((angle >= 45 && angle < 135) || (angle >= 225 && angle < 315)) {
                        cursor = swappedCursor;
                    } else {
                        cursor = baseCursor;
                    }
                } else {
                    const angle = (selectedLayer.rotation * 180 / Math.PI + 360) % 360;
                    if ((angle >= 45 && angle < 135) || (angle >= 225 && angle < 315)) {
                        cursor = (handle === HandlePosition.TopLeft || handle === HandlePosition.BottomRight) ? 'nesw-resize' : 'nwse-resize';
                    } else {
                        cursor = (handle === HandlePosition.TopLeft || handle === HandlePosition.BottomRight) ? 'nwse-resize' : 'nesw-resize';
                    }
                }
            } else if (this.isPointInLayer(mousePos, selectedLayer)) {
                cursor = 'move';
            }
        }
    } else if (this.mode === 'crop' || this.mode === 'erase') {
        if (this.isPointInDoneButton(mousePos) || this.isPointInCancelButton(mousePos)) {
            cursor = 'pointer';
        }
    }

    this.canvas.style.cursor = cursor;
  }

  private handleCuttingModePointerDown(pointerPos: Point) {
    if (this.isPointInDoneButton(pointerPos)) {
        if (this.mode === 'crop') {
            this.cutImageByPolygon();
        } else if (this.mode === 'erase') {
            this.eraseImageByPolygon();
        }
        return;
    }
    if (this.isPointInCancelButton(pointerPos)) { this.setMode('none'); return; }
    const removedIndex = this.polygonPoints.findIndex(pt => ((pointerPos.x - pt.x) ** 2 + (pointerPos.y - pt.y) ** 2) <= (this.pointHandleSize / 2) ** 2);
    if (removedIndex !== -1) this.polygonPoints.splice(removedIndex, 1);
    else this.polygonPoints.push(pointerPos);
    this.redraw();
  }

  private async cutImageByPolygon() {
    const layerToCrop = this.layers.find(l => l.id === this.layerToCropId);
    if (!layerToCrop || this.polygonPoints.length < 3) {
      this.setMode('none');
      return;
    }

    // Create a temporary canvas to hold the original, rotated and flipped image
    const tempCanvas = this.w.document.createElement('canvas');
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.save();
    const { x, y, width, height } = layerToCrop.rect;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    tempCtx.translate(centerX, centerY);
    tempCtx.rotate(layerToCrop.rotation);
    const scaleX = layerToCrop.flipX ? -1 : 1;
    const scaleY = layerToCrop.flipY ? -1 : 1;
    tempCtx.scale(scaleX, scaleY);
    tempCtx.drawImage(layerToCrop.image, -width / 2, -height / 2, width, height);
    tempCtx.restore();

    // Use the polygon path to clip the image on the temporary canvas
    tempCtx.globalCompositeOperation = 'destination-in';
    tempCtx.beginPath();
    this.polygonPoints.forEach((p, i) => tempCtx[i === 0 ? 'moveTo' : 'lineTo'](p.x, p.y));
    tempCtx.closePath();
    tempCtx.fill();

    // Calculate the bounds of the cropped area
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    this.polygonPoints.forEach(p => { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); });
    const cropWidth = maxX - minX;
    const cropHeight = maxY - minY;
    const strokeWidth = layerToCrop.cropStroke?.strokeWidth || 0;

    // Create the final canvas for the output
    const finalCanvas = this.w.document.createElement('canvas');
    finalCanvas.width = cropWidth + strokeWidth;
    finalCanvas.height = cropHeight + strokeWidth;
    const finalCtx = finalCanvas.getContext('2d')!;

    // Create a path for the polygon relative to the final canvas
    const finalPath = new Path2D();
    this.polygonPoints.forEach((p, i) => {
        const finalX = p.x - minX + strokeWidth / 2;
        const finalY = p.y - minY + strokeWidth / 2;
        if (i === 0) finalPath.moveTo(finalX, finalY);
        else finalPath.lineTo(finalX, finalY);
    });
    finalPath.closePath();

    // 1. Draw the clipped image content from the temporary canvas. This preserves transparency.
    finalCtx.drawImage(tempCanvas, minX, minY, cropWidth, cropHeight, strokeWidth / 2, strokeWidth / 2, cropWidth, cropHeight);

    // 2. Fill the background color *behind* the existing image content.
    if (layerToCrop.cropStroke?.fillColor && layerToCrop.cropStroke.fillColor !== '#00000000') {
        finalCtx.globalCompositeOperation = 'destination-over';
        finalCtx.fillStyle = layerToCrop.cropStroke.fillColor;
        finalCtx.fill(finalPath);
        finalCtx.globalCompositeOperation = 'source-over'; // Reset for subsequent operations
    }

    // 3. Draw the stroke over the image
    if (strokeWidth > 0 && layerToCrop.cropStroke?.strokeColor) {
        finalCtx.strokeStyle = layerToCrop.cropStroke.strokeColor;
        finalCtx.lineWidth = strokeWidth;
        finalCtx.stroke(finalPath);
    }

    const finalBitmap = await createImageBitmap(finalCanvas);
    const newLayer: ImageLayer = {
      id: `layer_${Date.now()}`, type: 'image', image: finalBitmap,
      rect: { x: minX - strokeWidth / 2, y: minY - strokeWidth / 2, width: finalCanvas.width, height: finalCanvas.height },
      rotation: 0, zIndex: layerToCrop.zIndex, cropStroke: layerToCrop.cropStroke,
      flipX: false, flipY: false
    };

    const layerIndex = this.layers.findIndex(l => l.id === this.layerToCropId);
    if (layerIndex !== -1) this.layers.splice(layerIndex, 1, newLayer);

    this.setMode('none');
    this.reindexLayers();
    this.setSelectedLayer(newLayer.id);
    this.saveState();
  }

  private async eraseImageByPolygon() {
    const layerToErase = this.layers.find(l => l.id === this.layerToCropId);
    if (!layerToErase || this.polygonPoints.length < 3) {
      this.setMode('none');
      return;
    }

    // Create a temporary canvas to hold the original, transformed image
    const tempCanvas = this.w.document.createElement('canvas');
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    const tempCtx = tempCanvas.getContext('2d')!;

    // 1. Draw the transformed layer onto this world-sized canvas
    tempCtx.save();
    const { x, y, width, height } = layerToErase.rect;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    tempCtx.translate(centerX, centerY);
    tempCtx.rotate(layerToErase.rotation);
    const scaleX = layerToErase.flipX ? -1 : 1;
    const scaleY = layerToErase.flipY ? -1 : 1;
    tempCtx.scale(scaleX, scaleY);
    tempCtx.drawImage(layerToErase.image, -width / 2, -height / 2, width, height);
    tempCtx.restore();

    // 2. Now erase the polygon area from this canvas
    tempCtx.globalCompositeOperation = 'destination-out';
    tempCtx.beginPath();
    this.polygonPoints.forEach((p, i) => tempCtx[i === 0 ? 'moveTo' : 'lineTo'](p.x, p.y));
    tempCtx.closePath();
    tempCtx.fill();

    // 3. Find the new bounding box of the remaining content on tempCanvas
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;
    let minX = tempCanvas.width, minY = tempCanvas.height, maxX = -1, maxY = -1;

    for (let j = 0; j < tempCanvas.height; j++) {
      for (let i = 0; i < tempCanvas.width; i++) {
        const alpha = data[(j * tempCanvas.width + i) * 4 + 3];
        if (alpha > 0) {
          minX = Math.min(minX, i);
          minY = Math.min(minY, j);
          maxX = Math.max(maxX, i);
          maxY = Math.max(maxY, j);
        }
      }
    }

    // 4. If the image is completely erased, remove the layer
    if (maxX === -1) {
      this.layers = this.layers.filter(l => l.id !== this.layerToCropId);
      this.setMode('none');
      this.setSelectedLayer(undefined);
      this.saveState();
      return;
    }

    // 5. Create a new packed image
    const newWidth = maxX - minX + 1;
    const newHeight = maxY - minY + 1;
    const packCanvas = this.w.document.createElement('canvas');
    packCanvas.width = newWidth;
    packCanvas.height = newHeight;
    const packCtx = packCanvas.getContext('2d')!;
    packCtx.drawImage(tempCanvas, minX, minY, newWidth, newHeight, 0, 0, newWidth, newHeight);
    const finalBitmap = await createImageBitmap(packCanvas);

    // 6. Update the layer. The new image has the transformation "baked in".
    // So, we must reset the layer's transformation.
    layerToErase.image = finalBitmap;
    layerToErase.rect.width = newWidth;
    layerToErase.rect.height = newHeight;
    layerToErase.rect.x = minX;
    layerToErase.rect.y = minY;
    layerToErase.rotation = 0;
    layerToErase.flipX = false;
    layerToErase.flipY = false;

    // 7. Exit erase mode and redraw
    this.setMode('none');
    this.setSelectedLayer(layerToErase.id);
    this.saveState();
  }

  private drawCuttingOverlay() {
    const layerToCrop = this.layers.find(l => l.id === this.layerToCropId);
    this.ctx.save();

    // 1. Draw semi-transparent overlay with a hole punched by the polygon.
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.beginPath();
    this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
    if (this.polygonPoints.length > 0) {
        this.polygonPoints.forEach((p, i) => this.ctx[i === 0 ? 'moveTo' : 'lineTo'](p.x, p.y));
        this.ctx.closePath();
    }
    this.ctx.fill('evenodd');

    // 2. & 3. Draw fill and stroke based on the current mode
    if (this.mode === 'crop') {
        // Draw the fill color UNDER the revealed image content.
        if (this.polygonPoints.length > 2 && layerToCrop?.cropStroke?.fillColor && layerToCrop.cropStroke.fillColor !== '#00000000') {
            this.ctx.save();
            this.ctx.beginPath();
            this.polygonPoints.forEach((p, i) => this.ctx[i === 0 ? 'moveTo' : 'lineTo'](p.x, p.y));
            this.ctx.closePath();
            this.ctx.clip();
            this.ctx.globalCompositeOperation = 'destination-over';
            this.ctx.fillStyle = layerToCrop.cropStroke.fillColor;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
        }

        // Draw the stroke on top of the preview.
        if (this.polygonPoints.length > 1 && layerToCrop?.cropStroke?.strokeWidth && layerToCrop.cropStroke.strokeWidth > 0) {
            this.ctx.beginPath();
            this.polygonPoints.forEach((p, i) => this.ctx[i === 0 ? 'moveTo' : 'lineTo'](p.x, p.y));
            if (this.polygonPoints.length > 2) {
                this.ctx.closePath();
            }
            this.ctx.strokeStyle = layerToCrop.cropStroke.strokeColor || '#000000';
            this.ctx.lineWidth = layerToCrop.cropStroke.strokeWidth;
            this.ctx.stroke();
        }
    } else if (this.mode === 'erase') {
        // For erase mode, draw a light blue stroke
        if (this.polygonPoints.length > 1) {
            this.ctx.beginPath();
            this.polygonPoints.forEach((p, i) => this.ctx[i === 0 ? 'moveTo' : 'lineTo'](p.x, p.y));
            if (this.polygonPoints.length > 2) {
                this.ctx.closePath();
            }
            this.ctx.strokeStyle = '#87CEFA'; // Light blue
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }

    // 4. Draw handles with 'x' for deletion for each point.
    this.polygonPoints.forEach(p => {
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.pointHandleSize / 2, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#87CEFA';
        this.ctx.fill();
        this.ctx.beginPath();
        const xSize = this.pointHandleSize / 3.5;
        this.ctx.moveTo(-xSize, -xSize);
        this.ctx.lineTo(xSize, xSize);
        this.ctx.moveTo(xSize, -xSize);
        this.ctx.lineTo(-xSize, xSize);
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.restore();
    });

    this.ctx.restore();
  }

  private getLayerWorldBoundingBox(layer: CanvasLayer): { minX: number, minY: number, maxX: number, maxY: number } {
    const { x, y, width, height } = layer.rect;
    const center = this.getCenter(layer.rect);
    const corners = [
        { x: x, y: y },
        { x: x + width, y: y },
        { x: x + width, y: y + height },
        { x: x, y: y + height }
    ];

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    corners.forEach(corner => {
        const rotatedCorner = this.rotatePoint(corner, center, layer.rotation);
        minX = Math.min(minX, rotatedCorner.x);
        minY = Math.min(minY, rotatedCorner.y);
        maxX = Math.max(maxX, rotatedCorner.x);
        maxY = Math.max(maxY, rotatedCorner.y);
    });

    return { minX, minY, maxX, maxY };
  }

  private drawLayerActionButtons(layer: CanvasLayer) {
    const { minX, maxX, maxY } = this.getLayerWorldBoundingBox(layer);
    const centerX = (minX + maxX) / 2;
    const buttonY = maxY + this.actionButtonSize / 2 + 10;
    const buttonSpacing = this.actionButtonSize + 10;
    const totalWidth = buttonSpacing * 4;
    const startX = centerX - totalWidth / 2;

    this.bringToFrontButtonPos = { x: startX, y: buttonY };
    this.sendToBackButtonPos = { x: startX + buttonSpacing, y: buttonY };
    this.cropButtonPos = { x: startX + buttonSpacing * 2, y: buttonY };
    this.eraseButtonPos = { x: startX + buttonSpacing * 3, y: buttonY };
    this.deleteButtonPos = { x: startX + buttonSpacing * 4, y: buttonY };

    this.drawButton(this.sendToBackButtonPos.x, this.sendToBackButtonPos.y, '⬇');
    this.drawButton(this.bringToFrontButtonPos.x, this.bringToFrontButtonPos.y, '⬆');
    this.drawButton(this.cropButtonPos.x, this.cropButtonPos.y, '✂');
    this.drawButton(this.eraseButtonPos.x, this.eraseButtonPos.y, '⌫');
    this.drawButton(this.deleteButtonPos.x, this.deleteButtonPos.y, '🗑️');
  }

  private drawCuttingModeControls() {
    const centerX = this.canvas.width / 2;
    const buttonY = this.canvas.height - this.actionButtonSize;
    this.doneButtonPos = { x: centerX - 60, y: buttonY };
    this.cancelButtonPos = { x: centerX + 60, y: buttonY };
    this.drawButton(this.doneButtonPos.x, this.doneButtonPos.y, '✔');
    this.drawButton(this.cancelButtonPos.x, this.cancelButtonPos.y, '❌');
  }

  private drawButton(x: number, y: number, text: string) {
    const size = this.actionButtonSize;
    const halfSize = size / 2;
    const borderRadius = size * 0.2;

    this.ctx.save();
    this.ctx.translate(x, y);

    // Shadow for depth
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    this.ctx.shadowBlur = 3;
    this.ctx.shadowOffsetY = 2;

    // Button Body
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.beginPath();
    this.ctx.roundRect(-halfSize, -halfSize, size, size, borderRadius);
    this.ctx.fill();

    // Reset shadow for text
    this.ctx.shadowColor = 'transparent';

    // Text
    this.ctx.fillStyle = '#333';
    this.ctx.font = `bold ${size * 0.5}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, 0, 1); // Slight offset for better visual centering

    this.ctx.restore();
  }

  private isPointInButton = (p: Point, b: Point) => {
    const halfSize = this.actionButtonSize / 2;
    return p.x >= b.x - halfSize && p.x <= b.x + halfSize &&
           p.y >= b.y - halfSize && p.y <= b.y + halfSize;
  };
  private isPointInCropButton = (p: Point) => this.isPointInButton(p, this.cropButtonPos);
  private isPointInEraseButton = (p: Point) => this.isPointInButton(p, this.eraseButtonPos);
  private isPointInDeleteButton = (p: Point) => this.isPointInButton(p, this.deleteButtonPos);
  private isPointInBringToFrontButton = (p: Point) => this.isPointInButton(p, this.bringToFrontButtonPos);
  private isPointInSendToBackButton = (p: Point) => this.isPointInButton(p, this.sendToBackButtonPos);
  private isPointInDoneButton = (p: Point) => this.isPointInButton(p, this.doneButtonPos);
  private isPointInCancelButton = (p: Point) => this.isPointInButton(p, this.cancelButtonPos);

  stop() { /* remove all event listeners */ }

  public async exportFinalImage() {
    if (this.layers.length === 0) {
        console.warn("No layers to export.");
        return;
    }
    const padding = 5; // 5px padding

    // 1. Calculate the bounding box of all layers combined
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    this.layers.forEach(layer => {
        const { minX: lMinX, minY: lMinY, maxX: lMaxX, maxY: lMaxY } = this.getLayerWorldBoundingBox(layer);
        minX = Math.min(minX, lMinX);
        minY = Math.min(minY, lMinY);
        maxX = Math.max(maxX, lMaxX);
        maxY = Math.max(maxY, lMaxY);
    });

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    if (contentWidth <= 0 || contentHeight <= 0) {
        console.warn("Invalid dimensions for export.");
        return;
    }

    // 2. Create a new canvas with the calculated dimensions plus padding
    const exportCanvas = this.w.document.createElement('canvas');
    exportCanvas.width = contentWidth + padding * 2;
    exportCanvas.height = contentHeight + padding * 2;
    const exportCtx = exportCanvas.getContext('2d')!;

    // 3. Draw all layers onto the new canvas, adjusting their positions
    this.layers.sort((a, b) => a.zIndex - b.zIndex).forEach(layer => {
        exportCtx.save();
        const { x, y, width, height } = layer.rect;
        // Adjust position to be relative to the bounding box's top-left corner, plus padding
        const adjustedX = x - minX + padding;
        const adjustedY = y - minY + padding;
        const centerX = adjustedX + width / 2;
        const centerY = adjustedY + height / 2;

        exportCtx.translate(centerX, centerY);
        exportCtx.rotate(layer.rotation);
        exportCtx.translate(-centerX, -centerY);
        exportCtx.drawImage(layer.image, adjustedX, adjustedY, width, height);
        exportCtx.restore();
    });

    // 4. Get the result and pass it to the callback
    const resultBitmap = await createImageBitmap(exportCanvas);

    if (this.handle?.callback) {
        this.handle.callback(resultBitmap);
    }

    // 5. Open in new window if in debug mode
    if (this.debug) {
        const dataUrl = exportCanvas.toDataURL('image/png');
        const newWindow = this.w.open();
        newWindow?.document.write(`<img src="${dataUrl}" alt="Exported Image">`);
    }
  }

  // --- History Management ---
  private cloneLayers(layers: CanvasLayer[]): CanvasLayer[] {
      return layers.map(layer => {
          const newLayer = { ...layer };
          newLayer.rect = { ...layer.rect };
          if (newLayer.type === 'text' || newLayer.type === 'rect' || newLayer.type === 'circle' || newLayer.type === 'triangle' || newLayer.type === 'star' || newLayer.type === 'heart' || newLayer.type === 'speechBubble' || newLayer.type === 'pentagon' || newLayer.type === 'octagon' || newLayer.type === 'semicircle' || newLayer.type === 'cross') {
              newLayer.options = { ...newLayer.options };
          }
          return newLayer;
      });
  }

  private saveState() {
      if (this.historyPointer < this.history.length - 1) {
          this.history = this.history.slice(0, this.historyPointer + 1);
      }
      this.history.push(this.cloneLayers(this.layers));
      this.historyPointer++;
      this.config.onHistoryChange?.(this.canUndo(), this.canRedo());
  }

  public undo() {
      if (!this.canUndo()) return;
      this.historyPointer--;
      this.layers = this.cloneLayers(this.history[this.historyPointer]);
      this.setSelectedLayer(undefined);
      this.redraw();
      this.config.onHistoryChange?.(this.canUndo(), this.canRedo());
  }

  public redo() {
      if (!this.canRedo()) return;
      this.historyPointer++;
      this.layers = this.cloneLayers(this.history[this.historyPointer]);
      this.setSelectedLayer(undefined);
      this.redraw();
      this.config.onHistoryChange?.(this.canUndo(), this.canRedo());
  }

  private canUndo(): boolean {
      return this.historyPointer > 0;
  }

  private canRedo(): boolean {
      return this.historyPointer < this.history.length - 1;
  }
}