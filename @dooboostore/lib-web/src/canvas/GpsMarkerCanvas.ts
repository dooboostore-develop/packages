export interface GpsPoint {
    lat: number;
    lon: number;
}

export interface ImageMarker {
    type: 'image';
    url: string;
}

export interface ColorMarker {
    type: 'color';
    color: string;
}

export type Marker = ImageMarker | ColorMarker;

export interface MarkerPoint extends GpsPoint {
    marker?: Marker;
    label?: string;
}

export interface PathData {
    points: GpsPoint[];
    color: string;
    closePath?: boolean;
}

export interface GpsRect {
    minLat: number;
    minLon: number;
    maxLat: number;
    maxLon: number;
}

export interface GpsMarkerCanvasConfig {
    canvas: HTMLCanvasElement;
    useMercatorProjection?: boolean;
    markerColor?: string; // Default color if a marker has no color
    markerSize?: number;
    lineWidth?: number;
    padding?: number;
    labelFont?: string;
    labelColor?: string;
    labelOffset?: { x: number, y: number };
}

export class GpsMarkerCanvas {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private markers: MarkerPoint[] = [];
    private paths: PathData[] = [];

    // Style and view state
    private useMercatorProjection: boolean;
    private markerColor: string;
    private lineWidth: number;
    private padding: number;
    private zoom = 1;
    private viewOffset = { x: 0, y: 0 };
    private isDragging = false;
    private lastPointerPos = { x: 0, y: 0 };
    private labelFont: string;
    private labelColor: string;
    private labelOffset: { x: number, y: number };

    // Marker images
    private markerSize: number;
    private loadedMarkerImages = new Map<string, HTMLImageElement>();
    private resizeObserver: ResizeObserver;

    constructor(config: GpsMarkerCanvasConfig) {
        this.canvas = config.canvas;
        const ctx = this.canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to get 2D context');
        }
        this.ctx = ctx;

        this.useMercatorProjection = config.useMercatorProjection ?? false;
        this.markerColor = config.markerColor || 'red';
        this.lineWidth = config.lineWidth || 2;
        this.padding = config.padding || 20;
        this.markerSize = config.markerSize || 32;
        this.labelFont = config.labelFont || '12px Arial';
        this.labelColor = config.labelColor || 'black';
        this.labelOffset = config.labelOffset || { x: 0, y: -15 };

        this.addEventListeners();
        
        this.resizeObserver = new ResizeObserver(() => this.onResize());
        this.resizeObserver.observe(this.canvas);
        this.onResize(); // Initial setup and draw
    }

    private onResize() {
        const ratio = window.devicePixelRatio || 1;
        const newWidth = this.canvas.clientWidth;
        const newHeight = this.canvas.clientHeight;

        if (this.canvas.width !== newWidth * ratio || this.canvas.height !== newHeight * ratio) {
            this.canvas.width = newWidth * ratio;
            this.canvas.height = newHeight * ratio;
            this.draw();
        }
    }

    public destroy() {
        this.canvas.removeEventListener('wheel', this.onWheel.bind(this));
        this.canvas.removeEventListener('pointerdown', this.onPointerDown.bind(this));
        this.canvas.removeEventListener('pointermove', this.onPointerMove.bind(this));
        this.resizeObserver.disconnect();
    }

    private addEventListeners() {
        this.canvas.addEventListener('wheel', this.onWheel.bind(this));
        this.canvas.addEventListener('pointerdown', this.onPointerDown.bind(this));
        this.canvas.addEventListener('pointermove', this.onPointerMove.bind(this));
        this.canvas.addEventListener('pointerup', () => {
            this.isDragging = false;
            this.canvas.style.cursor = 'grab';
        });
        this.canvas.addEventListener('pointerleave', () => { this.isDragging = false; });
    }

    public setUseMercatorProjection(useMercator: boolean) {
        if (this.useMercatorProjection !== useMercator) {
            this.useMercatorProjection = useMercator;
            this.draw();
        }
    }

    public setMarkers(markers: MarkerPoint[]) {
        this.markers = markers;
        this.loadMarkerImages();
        this.resetViewAndFitData();
    }

    public setPaths(paths: PathData[]) {
        this.paths = paths;
        this.resetViewAndFitData();
    }

    public resetViewAndFitData() {
        this.zoom = 1;
        this.viewOffset = { x: 0, y: 0 };
        this.draw();
    }

    private loadMarkerImages() {
        this.markers.forEach(marker => {
            const markerDef = marker.marker;
            if (markerDef?.type === 'image' && markerDef.url && !this.loadedMarkerImages.has(markerDef.url)) {
                const imageUrl = markerDef.url;
                const img = new Image();
                img.crossOrigin = "Anonymous";
                img.onload = () => {
                    this.loadedMarkerImages.set(imageUrl, img);
                    this.draw();
                };
                img.onerror = () => console.error(`Failed to load marker image: ${imageUrl}`);
                img.src = imageUrl;
            }
        });
    }

    private projectGpsToWorld(p: GpsPoint): { x: number, y: number } {
        if (this.useMercatorProjection) {
            const lonRad = p.lon * Math.PI / 180;
            const latClamped = Math.max(-85.05112878, Math.min(85.05112878, p.lat));
            const latRadClamped = latClamped * Math.PI / 180;
            return {
                x: lonRad,
                y: Math.log(Math.tan((Math.PI / 4) + (latRadClamped / 2)))
            };
        } else {
            return { x: p.lon, y: p.lat };
        }
    }

    private onWheel(e: WheelEvent) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -1 : 1;
        this.zoomOnPoint(delta * 0.1, e.offsetX, e.offsetY);
    }

    private onPointerDown(e: PointerEvent) {
        this.isDragging = true;
        this.lastPointerPos = { x: e.offsetX, y: e.offsetY };
        this.canvas.style.cursor = 'grabbing';
    }

    private onPointerMove(e: PointerEvent) {
        if (!this.isDragging) return;
        const dx = e.offsetX - this.lastPointerPos.x;
        const dy = e.offsetY - this.lastPointerPos.y;
        this.viewOffset.x += dx;
        this.viewOffset.y += dy;
        this.lastPointerPos = { x: e.offsetX, y: e.offsetY };
        this.draw();
    }

    public zoomIn() {
        this.zoomOnPoint(0.2, this.canvas.width / 2, this.canvas.height / 2);
    }

    public zoomOut() {
        this.zoomOnPoint(-0.2, this.canvas.width / 2, this.canvas.height / 2);
    }

    private zoomOnPoint(zoomDelta: number, canvasX: number, canvasY: number) {
        const oldZoom = this.zoom;
        const newZoom = Math.max(0.1, Math.min(20, oldZoom * (1 + zoomDelta)));

        const screenX = (canvasX - this.viewOffset.x) / oldZoom;
        const screenY = (canvasY - this.viewOffset.y) / oldZoom;

        this.viewOffset.x = canvasX - screenX * newZoom;
        this.viewOffset.y = canvasY - screenY * newZoom;
        this.zoom = newZoom;

        this.draw();
    }

    public draw() {
        const ratio = window.devicePixelRatio || 1;
        const cssWidth = this.canvas.clientWidth;
        const cssHeight = this.canvas.clientHeight;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const allPoints = [...this.paths.flatMap(p => p.points), ...this.markers];
        if (allPoints.length === 0) return;

        const worldPoints = allPoints.map(p => this.projectGpsToWorld(p));
        const minX = Math.min(...worldPoints.map(p => p.x));
        const maxX = Math.max(...worldPoints.map(p => p.x));
        const minY = Math.min(...worldPoints.map(p => p.y));
        const maxY = Math.max(...worldPoints.map(p => p.y));

        let worldWidth = maxX - minX;
        const worldHeight = maxY - minY;

        if (!this.useMercatorProjection && allPoints.length > 0) {
            const avgLatRad = allPoints.reduce((sum, p) => sum + p.lat, 0) / allPoints.length * Math.PI / 180;
            worldWidth *= Math.cos(avgLatRad);
        }

        const paddedWidth = cssWidth - this.padding * 2;
        const paddedHeight = cssHeight - this.padding * 2;

        let fitScale = 1;
        if (worldWidth > 0 || worldHeight > 0) {
            fitScale = Math.min(paddedWidth / worldWidth, paddedHeight / worldHeight);
        }

        const scaledWidth = worldWidth * fitScale;
        const scaledHeight = worldHeight * fitScale;

        const fitOffsetX = this.padding - minX * fitScale + (paddedWidth - scaledWidth) / 2;
        const fitOffsetY = this.padding + (paddedHeight - scaledHeight) / 2 + maxY * fitScale;

        this.ctx.save();
        this.ctx.scale(ratio, ratio);
        this.ctx.translate(this.viewOffset.x, this.viewOffset.y);
        this.ctx.scale(this.zoom, this.zoom);
        this.ctx.translate(fitOffsetX, fitOffsetY);
        this.ctx.scale(fitScale, -fitScale);

        const totalScale = this.zoom * fitScale;

        // Draw Paths
        this.paths.forEach(path => {
            if (path.points.length < 2) return;
            const pathWorldPoints = path.points.map(p => this.projectGpsToWorld(p));
            this.ctx.beginPath();
            this.ctx.moveTo(pathWorldPoints[0].x, pathWorldPoints[0].y);
            for (let i = 1; i < pathWorldPoints.length; i++) {
                this.ctx.lineTo(pathWorldPoints[i].x, pathWorldPoints[i].y);
            }
            if (path.closePath) {
                this.ctx.closePath();
            }
            this.ctx.strokeStyle = path.color;
            this.ctx.lineWidth = this.lineWidth / totalScale;
            this.ctx.stroke();
        });

        // Draw Markers
        this.markers.forEach(marker => {
            const worldPoint = this.projectGpsToWorld(marker);
            const markerDef = marker.marker;
            let imageToDraw: HTMLImageElement | undefined;

            if (markerDef?.type === 'image') {
                imageToDraw = this.loadedMarkerImages.get(markerDef.url);
            }

            this.ctx.save();
            this.ctx.translate(worldPoint.x, worldPoint.y);
            this.ctx.scale(1 / fitScale, -1 / fitScale);
            this.ctx.scale(1 / this.zoom, 1 / this.zoom);

            if (imageToDraw?.complete) {
                const size = this.markerSize;
                this.ctx.drawImage(imageToDraw, -size / 2, -size / 2, size, size);
            } else {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, this.markerSize / 2, 0, 2 * Math.PI);
                this.ctx.fillStyle = (markerDef?.type === 'color') ? markerDef.color : this.markerColor;
                this.ctx.fill();
            }

            if (marker.label) {
                const fontSize = parseInt(this.labelFont.match(/(\d+)px/)?.[1] || '12');
                const fontName = this.labelFont.split(' ').pop() || 'Arial';
                this.ctx.font = `${fontSize}px ${fontName}`;
                this.ctx.fillStyle = this.labelColor;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'bottom';
                this.ctx.fillText(marker.label, this.labelOffset.x, this.labelOffset.y);
            }
            this.ctx.restore();
        });

        this.ctx.restore();
    }
}
