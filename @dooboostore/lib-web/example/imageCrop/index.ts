import { ImageCropCanvas, CropResult } from '../../src/canvas/ImageCropCanvas';

document.addEventListener('DOMContentLoaded', () => {
    const canvasEl = document.getElementById('crop-canvas') as HTMLCanvasElement;
    const fileInputEl = document.getElementById('file-input') as HTMLInputElement;
    const imageUrlInputEl = document.getElementById('image-url-input') as HTMLInputElement;
    const loadUrlButtonEl = document.getElementById('load-url-button') as HTMLButtonElement;
    const doneButtonEl = document.getElementById('done-button') as HTMLButtonElement;
    const cancelButtonEl = document.getElementById('cancel-button') as HTMLButtonElement;
    const croppedImageEl = document.getElementById('cropped-image') as HTMLImageElement;

    if (!canvasEl || !fileInputEl || !imageUrlInputEl || !loadUrlButtonEl || !doneButtonEl || !cancelButtonEl || !croppedImageEl) {
        console.error('One or more required elements are missing from the DOM.');
        return;
    }

    const handleCropDone = (result: CropResult) => {
        if (result.dataUrl) {
            croppedImageEl.src = result.dataUrl;
            croppedImageEl.style.display = 'block';
            console.log('Cropped points (relative to original image):', result.points);
        } else {
            croppedImageEl.src = '';
            croppedImageEl.style.display = 'none';
        }
    };

    const imageCropCanvas = new ImageCropCanvas({ canvas: canvasEl, onDone: handleCropDone });

    // --- Event Listeners ---

    // Load image from file input
    fileInputEl.addEventListener('change', (event) => {
        const files = (event.target as HTMLInputElement).files;
        if (files && files.length > 0) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    imageCropCanvas.loadImage(e.target.result as string);
                }
            };
            reader.readAsDataURL(files[0]);
        }
    });

    // Load image from URL
    loadUrlButtonEl.addEventListener('click', () => {
        const url = imageUrlInputEl.value.trim();
        if (url) {
            imageCropCanvas.loadImage(url);
        }
    });

    // Cancel cropping
    cancelButtonEl.addEventListener('click', () => {
        imageCropCanvas.cancel();
    });

    // Finish cropping
    doneButtonEl.addEventListener('click', () => {
        imageCropCanvas.done();
    });

    // --- Initial Image ---
    // Load a default image for demonstration purposes
    const defaultImageUrl = 'https://i.imgur.com/g6t3sP3.jpeg';
    imageCropCanvas.loadImage(defaultImageUrl);
});
