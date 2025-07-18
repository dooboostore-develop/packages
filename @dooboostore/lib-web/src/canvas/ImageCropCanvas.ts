interface Point {
    x: number;
    y: number;
}

export type CropResult = {
    points: Point[];
    dataUrl: string | null;
};

export type ImageCropCanvasConfig = {
    canvas: HTMLCanvasElement;
    onDone?: (result: CropResult) => void;
};

export class ImageCropCanvas {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private onDoneCallback?: (result: CropResult) => void;
    private image: HTMLImageElement | null = null;
    private points: Point[] = [];

    private scale = 1;
    private offset = { x: 0, y: 0 };

    private draggingPointIndex: number | null = null;
    private isDragging = false;

    private readonly pointHandleSize = 10;
    private readonly deleteButtonSize = 16;
    private resizeObserver: ResizeObserver;

    constructor(config: ImageCropCanvasConfig) {
        this.canvas = config.canvas;
        this.onDoneCallback = config.onDone;
        const ctx = this.canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to get 2D context');
        }
        this.ctx = ctx;

        this.resizeObserver = new ResizeObserver(this.onResize.bind(this));
        this.resizeObserver.observe(this.canvas);

        this.addEventListeners();
        this.onResize(); // Initial setup
    }

    destroy() {
        this.resizeObserver.disconnect();
        this.removeEventListeners();
    }

    private onResize() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.calculateImageScaleAndOffset();
        this.draw();
    }

    private addEventListeners() {
        this.canvas.addEventListener('pointerdown', this.onPointerDown.bind(this));
        this.canvas.addEventListener('pointermove', this.onPointerMove.bind(this));
        this.canvas.addEventListener('pointerup', this.onPointerUp.bind(this));
    }

    private removeEventListeners() {
        this.canvas.removeEventListener('pointerdown', this.onPointerDown.bind(this));
        this.canvas.removeEventListener('pointermove', this.onPointerMove.bind(this));
        this.canvas.removeEventListener('pointerup', this.onPointerUp.bind(this));
    }

    public loadImage(src: string) {
        const image = new Image();
        image.crossOrigin = "Anonymous"; // Allow loading from other domains
        image.onload = () => {
            this.image = image;
            this.points = [];
            this.calculateImageScaleAndOffset();
            this.draw();
        };
        image.onerror = () => {
            console.error('Failed to load image from src:', src);
            alert('Failed to load image.');
        };
        image.src = src;
    }

    private calculateImageScaleAndOffset() {
        if (!this.image) return;

        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        const imageWidth = this.image.width;
        const imageHeight = this.image.height;

        const scaleX = canvasWidth / imageWidth;
        const scaleY = canvasHeight / imageHeight;
        this.scale = Math.min(scaleX, scaleY);

        const scaledWidth = imageWidth * this.scale;
        const scaledHeight = imageHeight * this.scale;

        this.offset.x = (canvasWidth - scaledWidth) / 2;
        this.offset.y = (canvasHeight - scaledHeight) / 2;
    }

    private getPointerPos(event: PointerEvent): Point {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    private onPointerDown(event: PointerEvent) {
        event.preventDefault();
        this.canvas.setPointerCapture(event.pointerId);
        const pos = this.getPointerPos(event);

        // Check if clicking a delete button
        for (let i = 0; i < this.points.length; i++) {
            const deleteHandlePos = this.getDeleteHandlePosition(this.points[i]);
            if (this.isPointInCircle(pos, deleteHandlePos, this.deleteButtonSize / 2)) {
                this.points.splice(i, 1);
                this.draw();
                return;
            }
        }

        // Check if clicking a point to drag
        for (let i = 0; i < this.points.length; i++) {
            if (this.isPointInCircle(pos, this.points[i], this.pointHandleSize)) {
                this.draggingPointIndex = i;
                this.isDragging = true;
                return;
            }
        }

        // If not clicking anything else, add a new point
        this.points.push(pos);
        this.draggingPointIndex = this.points.length - 1;
        this.isDragging = true;
        this.draw();
    }

    private onPointerMove(event: PointerEvent) {
        if (!this.isDragging || this.draggingPointIndex === null) return;
        event.preventDefault();
        const pos = this.getPointerPos(event);
        this.points[this.draggingPointIndex] = pos;
        this.draw();
    }

    private onPointerUp(event: PointerEvent) {
        this.canvas.releasePointerCapture(event.pointerId);
        this.isDragging = false;
        this.draggingPointIndex = null;
    }

    private draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (!this.image) return;

        this.drawImage();

        if (this.points.length > 0) {
            this.drawOverlay();
            this.drawPath();
            this.drawPoints();
        }
    }

    private drawImage() {
        if (!this.image) return;
        this.ctx.drawImage(
            this.image,
            this.offset.x,
            this.offset.y,
            this.image.width * this.scale,
            this.image.height * this.scale
        );
    }

    private drawOverlay() {
        if (!this.image) return;
        this.ctx.save();
        // Darken the entire canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Punch a hole in the overlay with the polygon
        if (this.points.length > 2) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.points[0].x, this.points[0].y);
            for (let i = 1; i < this.points.length; i++) {
                this.ctx.lineTo(this.points[i].x, this.points[i].y);
            }
            this.ctx.closePath();
            this.ctx.clip();
        }

        // Redraw the original image inside the clipped area
        this.drawImage();
        this.ctx.restore();
    }

    private drawPath() {
        if (this.points.length < 2) return;

        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            this.ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        if (this.points.length > 2) {
            this.ctx.closePath();
        }
        this.ctx.stroke();
    }

    private drawPoints() {
        this.ctx.save();
        this.points.forEach(point => {
            // Draw the point handle
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, this.pointHandleSize / 2, 0, 2 * Math.PI);
            this.ctx.fill();

            // Draw the delete button
            const deleteHandlePos = this.getDeleteHandlePosition(point);
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
            this.ctx.beginPath();
            this.ctx.arc(deleteHandlePos.x, deleteHandlePos.y, this.deleteButtonSize / 2, 0, 2 * Math.PI);
            this.ctx.fill();

            // Draw 'x' on the delete button
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();
            const xSize = this.deleteButtonSize / 4;
            this.ctx.moveTo(deleteHandlePos.x - xSize, deleteHandlePos.y - xSize);
            this.ctx.lineTo(deleteHandlePos.x + xSize, deleteHandlePos.y + xSize);
            this.ctx.moveTo(deleteHandlePos.x + xSize, deleteHandlePos.y - xSize);
            this.ctx.lineTo(deleteHandlePos.x - xSize, deleteHandlePos.y + xSize);
            this.ctx.stroke();
        });
        this.ctx.restore();
    }

    private getDeleteHandlePosition(point: Point): Point {
        return { x: point.x + 12, y: point.y - 12 };
    }

    private isPointInCircle(point: Point, circleCenter: Point, radius: number): boolean {
        const dx = point.x - circleCenter.x;
        const dy = point.y - circleCenter.y;
        return dx * dx + dy * dy <= radius * radius;
    }

    public cancel() {
        this.points = [];
        this.draw();
    }

    public done() {
        if (!this.image || this.points.length < 3) {
            console.warn("Cannot crop: requires an image and at least 3 points.");
            if (this.onDoneCallback) {
                this.onDoneCallback({ points: [], dataUrl: null });
            }
            return;
        }

        // Convert canvas points to image-relative points
        const relativePoints = this.points.map(p => ({
            x: (p.x - this.offset.x) / this.scale,
            y: (p.y - this.offset.y) / this.scale
        }));

        // Find bounding box of the polygon to size the new canvas
        const minX = Math.min(...relativePoints.map(p => p.x));
        const minY = Math.min(...relativePoints.map(p => p.y));
        const maxX = Math.max(...relativePoints.map(p => p.x));
        const maxY = Math.max(...relativePoints.map(p => p.y));

        const cropWidth = maxX - minX;
        const cropHeight = maxY - minY;

        if (cropWidth <= 0 || cropHeight <= 0) {
            if (this.onDoneCallback) {
                this.onDoneCallback({ points: [], dataUrl: null });
            }
            return;
        }

        // Create a temporary canvas to draw the cropped image
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = cropWidth;
        tempCanvas.height = cropHeight;
        const tempCtx = tempCanvas.getContext('2d')!;

        // Create clipping path on the temporary canvas, translating points to be relative to the crop area
        tempCtx.beginPath();
        tempCtx.moveTo(relativePoints[0].x - minX, relativePoints[0].y - minY);
        for (let i = 1; i < relativePoints.length; i++) {
            tempCtx.lineTo(relativePoints[i].x - minX, relativePoints[i].y - minY);
        }
        tempCtx.closePath();
        tempCtx.clip();

        // Draw the portion of the original image into the clipped area
        tempCtx.drawImage(this.image, -minX, -minY);

        const result: CropResult = {
            points: relativePoints,
            dataUrl: tempCanvas.toDataURL()
        };

        if (this.onDoneCallback) {
            this.onDoneCallback(result);
        }
    }
}