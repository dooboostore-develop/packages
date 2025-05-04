import { CropCanvas } from '../src/canvas/CropCanvas';

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');

  // --- DOM Elements ---
  const inputFileElement = document.querySelector('#crop-canvas-file-input') as HTMLInputElement;

  // Unified Shape Controls
  const shapeStyleController = document.querySelector('#shape-style-controller') as HTMLFieldSetElement;
  const shapeFillColorInput = document.querySelector('#shape-fill-color-input') as HTMLInputElement;
  const shapeFillAlphaInput = document.querySelector('#shape-fill-alpha-input') as HTMLInputElement;
  const shapeStrokeColorInput = document.querySelector('#shape-stroke-color-input') as HTMLInputElement;
  const shapeStrokeAlphaInput = document.querySelector('#shape-stroke-alpha-input') as HTMLInputElement;
  const shapeStrokeWidthInput = document.querySelector('#shape-stroke-width-input') as HTMLInputElement;

  // Add Shape Buttons
  const addRectButton = document.querySelector('#crop-canvas-add-rect-button') as HTMLButtonElement;
  const addCircleButton = document.querySelector('#crop-canvas-add-circle-button') as HTMLButtonElement;
  const addTriangleButton = document.querySelector('#crop-canvas-add-triangle-button') as HTMLButtonElement;
  const addStarButton = document.querySelector('#crop-canvas-add-star-button') as HTMLButtonElement;
  const addHeartButton = document.querySelector('#crop-canvas-add-heart-button') as HTMLButtonElement;
  const addSpeechBubbleButton = document.querySelector('#crop-canvas-add-speechBubble-button') as HTMLButtonElement;
  const addPentagonButton = document.querySelector('#crop-canvas-add-pentagon-button') as HTMLButtonElement;
  const addOctagonButton = document.querySelector('#crop-canvas-add-octagon-button') as HTMLButtonElement;
  const addSemicircleButton = document.querySelector('#crop-canvas-add-semicircle-button') as HTMLButtonElement;
  const addCrossButton = document.querySelector('#crop-canvas-add-cross-button') as HTMLButtonElement;

  // Text Controls
  const textControllerContainer = document.querySelector('#text-controller-container') as HTMLFieldSetElement;
  const inputTextElement = document.querySelector('#crop-canvas-text-input') as HTMLTextAreaElement;
  const textSizeInput = document.querySelector('#crop-canvas-text-size-input') as HTMLInputElement;
  const addTextButton = document.querySelector('#crop-canvas-add-text-button') as HTMLButtonElement;

  const layerOrderControlsFieldset = document.querySelector('#layer-order-controls') as HTMLFieldSetElement;
  const toFrontButton = document.querySelector('#layer-to-front-button') as HTMLButtonElement;
  const toBackButton = document.querySelector('#layer-to-back-button') as HTMLButtonElement;
  const cropButton = document.querySelector('#crop-canvas-crop-button') as HTMLButtonElement;

  const historyUndoButton = document.querySelector('#history-back-button') as HTMLButtonElement;
  const historyRedoButton = document.querySelector('#history-next-button') as HTMLButtonElement;

  // --- App State ---
  let isCuttingMode = false;
  let previousShapeState: {
      fillColor: string;
      fillAlpha: string;
      strokeColor: string;
      strokeAlpha: string;
      strokeWidth: string;
  } | null = null;

  // --- Helper Functions ---
  function combineColorAndAlpha(colorInput: HTMLInputElement, alphaInput: HTMLInputElement): string {
      const color = colorInput.value; // #rrggbb
      const alpha = parseFloat(alphaInput.value); // 0-1
      if (alpha === 0) return '#00000000';
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function parseRgba(rgba: string | undefined): { color: string, alpha: number } {
      if (!rgba || rgba === '#00000000') return { color: '#000000', alpha: 0 };
      const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (!match) { // It might be a hex color
          return { color: rgba, alpha: 1 };
      }
      const [, r, g, b, a] = match;
      const toHex = (c: string) => parseInt(c, 10).toString(16).padStart(2, '0');
      return {
          color: `#${toHex(r)}${toHex(g)}${toHex(b)}`,
          alpha: a !== undefined ? parseFloat(a) : 1
      };
  }

  function getShapeOptionsFromUI() {
    return {
        fillColor: combineColorAndAlpha(shapeFillColorInput, shapeFillAlphaInput),
        strokeColor: combineColorAndAlpha(shapeStrokeColorInput, shapeStrokeAlphaInput),
        strokeWidth: parseInt(shapeStrokeWidthInput.value, 10)
    };
  }

  // --- Canvas Initialization with UI Sync Callback ---
  const cropCanvas = new CropCanvas(window, {
    canvas: '#crop-canvas',
    handle: {
        option: {}, // Add missing 'option' property
        callback: (img: ImageBitmap) => {
            console.log('Exported image received in callback:', img);
        }
    },
    onHistoryChange: (canUndo, canRedo) => {
        historyUndoButton.disabled = !canUndo;
        historyRedoButton.disabled = !canRedo;
    },
    onSelectionChange: (layer) => {
      const isLayerSelected = !!layer;
      layerOrderControlsFieldset.disabled = !isLayerSelected;

      const isShapeSelected = isLayerSelected && layer.type !== 'image';

      // Unified Text Controller Logic
      const isTextSelected = isLayerSelected && layer.type === 'text';
      textControllerContainer.disabled = false;


      if (layer) {
        if (layer.type === 'text') {
          inputTextElement.value = layer.text;
          textSizeInput.value = (layer.options.size || 100).toString();
          const fill = parseRgba(layer.options.fillColor);
          shapeFillColorInput.value = fill.color;
          shapeFillAlphaInput.value = fill.alpha.toString();
          const stroke = parseRgba(layer.options.strokeColor);
          shapeStrokeColorInput.value = stroke.color;
          shapeStrokeAlphaInput.value = stroke.alpha.toString();
          shapeStrokeWidthInput.value = (layer.options.strokeWidth || 0).toString();
        } else if (isShapeSelected) {
            const fill = parseRgba(layer.options.fillColor);
            shapeFillColorInput.value = fill.color;
            shapeFillAlphaInput.value = fill.alpha.toString();
            const stroke = parseRgba(layer.options.strokeColor);
            shapeStrokeColorInput.value = stroke.color;
            shapeStrokeAlphaInput.value = stroke.alpha.toString();
            shapeStrokeWidthInput.value = (layer.options.strokeWidth || 0).toString();
        }
      } else {
          // Clear text input when no layer is selected
          inputTextElement.value = '';
      }
    },
    onCuttingModeChange: (isActive, targetLayer) => {
        isCuttingMode = isActive;
        const currentMode = cropCanvas.getMode();
        shapeStyleController.disabled = currentMode === 'erase';

        if (isActive) {
            if (currentMode === 'crop' && !previousShapeState) {
                previousShapeState = {
                    fillColor: shapeFillColorInput.value,
                    fillAlpha: shapeFillAlphaInput.value,
                    strokeColor: shapeStrokeColorInput.value,
                    strokeAlpha: shapeStrokeAlphaInput.value,
                    strokeWidth: shapeStrokeWidthInput.value
                };
                shapeFillColorInput.value = '#ffffff';
                shapeFillAlphaInput.value = '1';
                shapeStrokeColorInput.value = '#000000';
                shapeStrokeAlphaInput.value = '1';
                cropCanvas.updateCropTargetLayerStroke(getShapeOptionsFromUI());
            }
        } else {
            if (previousShapeState) {
                shapeFillColorInput.value = previousShapeState.fillColor;
                shapeFillAlphaInput.value = previousShapeState.fillAlpha;
                shapeStrokeColorInput.value = previousShapeState.strokeColor;
                shapeStrokeAlphaInput.value = previousShapeState.strokeAlpha;
                shapeStrokeWidthInput.value = previousShapeState.strokeWidth;
                previousShapeState = null;
            }
            shapeStyleController.disabled = false;
        }
    }
  });

  // --- Event Listeners ---

  inputFileElement.addEventListener('change', (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      cropCanvas.addImage(file, getShapeOptionsFromUI());
      (event.target as HTMLInputElement).value = '';
    }
  });

  const cropStrokeOptions = getShapeOptionsFromUI();

  addRectButton.addEventListener('click', () => cropCanvas.addRect(getShapeOptionsFromUI(), cropStrokeOptions));
  addCircleButton.addEventListener('click', () => cropCanvas.addCircle(getShapeOptionsFromUI(), cropStrokeOptions));
  addTriangleButton.addEventListener('click', () => cropCanvas.addTriangle(getShapeOptionsFromUI(), cropStrokeOptions));
  addStarButton.addEventListener('click', () => cropCanvas.addStar(getShapeOptionsFromUI(), cropStrokeOptions));
  addHeartButton.addEventListener('click', () => cropCanvas.addHeart(getShapeOptionsFromUI(), cropStrokeOptions));
  addSpeechBubbleButton.addEventListener('click', () => cropCanvas.addSpeechBubble(getShapeOptionsFromUI(), cropStrokeOptions));
  addPentagonButton.addEventListener('click', () => cropCanvas.addPentagon(getShapeOptionsFromUI(), cropStrokeOptions));
  addOctagonButton.addEventListener('click', () => cropCanvas.addOctagon(getShapeOptionsFromUI(), cropStrokeOptions));
  addSemicircleButton.addEventListener('click', () => cropCanvas.addSemicircle(getShapeOptionsFromUI(), cropStrokeOptions));
  addCrossButton.addEventListener('click', () => cropCanvas.addCross(getShapeOptionsFromUI(), cropStrokeOptions));

  addTextButton.addEventListener('click', () => {
    const text = inputTextElement.value;
    if (text) {
      cropCanvas.addText(
        text,
        {
          ...getShapeOptionsFromUI(),
          size: parseInt(textSizeInput.value, 10)
        },
        getShapeOptionsFromUI()
      );
      inputTextElement.value = '';
    }
  });

  // --- Real-time updates for selected layer ---
  inputTextElement.addEventListener('input', () => cropCanvas.updateSelectedText(inputTextElement.value));
  textSizeInput.addEventListener('input', () => {
    const layer = cropCanvas.getSelectedLayer();
    if (layer?.type === 'text') {
      cropCanvas.updateSelectedTextOptions({ size: parseInt(textSizeInput.value, 10) });
    }
  });

  function updateSelectedShape() {
      if (isCuttingMode) {
          cropCanvas.updateCropTargetLayerStroke(getShapeOptionsFromUI());
          return;
      }

      if (!cropCanvas.isSelectedMode()) return;
      const options = getShapeOptionsFromUI();
      const layer = cropCanvas.getSelectedLayer();
      if (!layer || layer.type === 'image') return;

      if (layer.type === 'text') {
        cropCanvas.updateSelectedTextOptions(options);
        return;
      }

      switch (layer.type) {
          case 'rect':       cropCanvas.updateSelectedRect(options); break;
          case 'circle':     cropCanvas.updateSelectedCircle(options); break;
          case 'triangle':   cropCanvas.updateSelectedTriangle(options); break;
          case 'star':       cropCanvas.updateSelectedStar(options); break;
          case 'heart':      cropCanvas.updateSelectedHeart(options); break;
          case 'speechBubble': cropCanvas.updateSelectedSpeechBubble(options); break;
          case 'pentagon':   cropCanvas.updateSelectedPentagon(options); break;
          case 'octagon':    cropCanvas.updateSelectedOctagon(options); break;
          case 'semicircle': cropCanvas.updateSelectedSemicircle(options); break;
          case 'cross':      cropCanvas.updateSelectedCross(options); break;
      }
  }

  shapeFillColorInput.addEventListener('input', updateSelectedShape);
  shapeFillAlphaInput.addEventListener('input', updateSelectedShape);
  shapeStrokeColorInput.addEventListener('input', updateSelectedShape);
  shapeStrokeAlphaInput.addEventListener('input', updateSelectedShape);
  shapeStrokeWidthInput.addEventListener('input', updateSelectedShape);

  toFrontButton.addEventListener('click', () => cropCanvas.bringSelectedLayerToFront());
  toBackButton.addEventListener('click', () => cropCanvas.sendSelectedLayerToBack());
  cropButton.addEventListener('click', () => cropCanvas.exportFinalImage());

  historyUndoButton.addEventListener('click', () => cropCanvas.undo());
  historyRedoButton.addEventListener('click', () => cropCanvas.redo());

  window.addEventListener('resize', () => {
      const canvasElement = document.querySelector('#crop-canvas') as HTMLCanvasElement;
      if (canvasElement) {
          cropCanvas.resize(canvasElement.clientWidth, canvasElement.clientHeight);
      }
  });
});