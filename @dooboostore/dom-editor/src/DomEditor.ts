/**
 * DOM Editor - Visual drag-and-drop HTML editor
 * 
 * A comprehensive visual editor for creating and manipulating HTML structures
 * with real-time drag-and-drop functionality, property editing, and mobile support.
 */

export interface DomEditorOptions {
  /** Initial content to load - can be HTML string or structured NodeData */
  initialContent?: string | NodeData;
  /** Enable debug mode */
  debug?: boolean;
  /** Custom CSS styles to inject */
  customStyles?: string;
  /** Drag activation delay in milliseconds (default: 500) */
  dragDelay?: number;
  /** Enable mobile touch support */
  enableMobileSupport?: boolean;
}

export interface ElementNodeData {
  nodeType: 'element';
  tagName: string;
  id?: string;
  className?: string;
  attributes?: Record<string, string>;
  children?: NodeData[];
}

export interface TextNodeData {
  nodeType: 'text';
  textContent: string;
}

export type NodeData = ElementNodeData | TextNodeData;

// 하위 호환성을 위한 타입 별칭
export type ElementData = ElementNodeData;

export class DomEditor {
  private container: HTMLElement;
  private propertyPanel: HTMLElement;
  private debugElement: HTMLElement;
  private selectedElement: HTMLElement | null = null;
  private selectedTextNode: Text | null = null;

  // Drag and drop state
  private draggedElement: HTMLElement | null = null;
  private isDragging = false;
  private isDragReady = false;
  private dragStartElement: HTMLElement | null = null;
  private customDragElement: HTMLElement | null = null;
  private isCustomDragging = false;
  private isHTML5Dragging = false;
  private dragActivationTimer: number | null = null;
  private dragStartPos = { x: 0, y: 0 };
  private dragOffset = { x: 0, y: 0 };

  // Configuration
  private options: DomEditorOptions & {
    debug: boolean;
    customStyles: string;
    dragDelay: number;
    enableMobileSupport: boolean;
  };
  private itemCounter = 1000;

  constructor(target: string | HTMLElement, options: DomEditorOptions = {}) {
    this.options = {
      debug: false,
      customStyles: '',
      dragDelay: 500,
      enableMobileSupport: true,
      ...options
    };

    // Handle target selector or element
    if (typeof target === 'string') {
      const element = document.querySelector(target);
      if (!element) {
        throw new Error(`Element not found: ${target}`);
      }
      this.container = element as HTMLElement;
    } else {
      this.container = target;
    }

    this.init();
  }

  private init(): void {
    this.injectStyles();
    this.createEditorStructure();
    this.initializeEventListeners();

    if (this.options.initialContent) {
      // string이면 HTML로, object면 ElementData로 처리
      if (typeof this.options.initialContent === 'string') {
        this.loadContent(this.options.initialContent);
      } else {
        this.importData(this.options.initialContent);
      }
    } else {
      this.loadSampleData();
    }

    this.updateDebug('DOM Editor initialized');
  }

  private injectStyles(): void {
    const styleId = 'dom-editor-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = this.getDefaultStyles() + (this.options.customStyles || '');
    document.head.appendChild(style);
  }

  private getDefaultStyles(): string {
    return `
      .dom-editor {
        font-family: Arial, sans-serif;
        position: relative;
      }

      .dom-editor *:not([data-editor-ignore]):not([data-editor-ignore] *) {
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
      }
      


      .dom-editor body.drag-preparing {
        user-select: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
      }

      .dom-editor *:not([data-editor-ignore]):not([data-editor-ignore] *):hover {
        outline: 2px solid #007bff;
        outline-offset: 2px;
      }

      .dom-editor .selected {
        outline: 3px solid #ff6b35 !important;
        outline-offset: 2px;
        background-color: rgba(255, 107, 53, 0.1) !important;
      }
      


      .dom-editor .dragging {
        opacity: 0.5;
        transform: rotate(5deg);
        z-index: 1000;
      }

      .dom-editor .drag-over {
        outline: 3px solid #28a745;
        outline-offset: 2px;
        background-color: rgba(40, 167, 69, 0.1);
      }

      .dom-editor .drag-over-before {
        border-top: 6px solid #28a745;
        background-color: rgba(40, 167, 69, 0.1);
        position: relative;
      }

      .dom-editor .drag-over-before::before {
        content: "↑ 앞에 삽입";
        position: absolute;
        top: -25px;
        left: 10px;
        background: #28a745;
        color: white;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 1001;
      }

      .dom-editor .drag-over-after {
        border-bottom: 6px solid #28a745;
        background-color: rgba(40, 167, 69, 0.1);
        position: relative;
      }

      .dom-editor .drag-over-after::after {
        content: "↓ 뒤에 삽입";
        position: absolute;
        bottom: -25px;
        left: 10px;
        background: #28a745;
        color: white;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 1001;
      }

      .dom-editor .drag-over-child {
        outline: 3px solid #007bff;
        outline-offset: 2px;
        background-color: rgba(0, 123, 255, 0.1);
        position: relative;
      }

      .dom-editor .drag-over-child::before {
        content: "📁 자식으로 삽입";
        position: absolute;
        top: 5px;
        right: 10px;
        background: #007bff;
        color: white;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 1001;
      }

      .dom-editor {
        min-height: 400px;
        padding: 20px;
        border: 2px dashed #ccc;
        border-radius: 8px;
        background-color: #fafafa;
        position: relative;
        overflow: visible;
      }

      .dom-editor.drag-over {
        border-color: #007bff;
        background-color: #e7f3ff;
      }

      .dom-editor .editor-content {
        min-height: 300px;
        padding: 15px;
        border: 2px dashed #ccc;
        border-radius: 6px;
        background: white;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .dom-editor .editor-content:hover {
        border-color: #007bff;
        background-color: #f8f9ff;
      }

      .dom-editor .editor-content.selected {
        border-color: #ff6b35;
        background-color: #fff5f0;
        border-style: solid;
      }

      .dom-editor .editor-content:empty::before {
        content: "클릭하여 루트 컨테이너를 편집하거나 요소를 드래그하여 추가하세요";
        color: #6c757d;
        font-style: italic;
        display: block;
        text-align: center;
        padding: 50px 20px;
      }

      .dom-editor .action-buttons {
        position: absolute;
        top: 8px;
        right: 8px;
        display: flex;
        flex-wrap: wrap;
        gap: 3px;
        max-width: 200px;
        z-index: 1002;
        background: rgba(255, 255, 255, 0.95);
        padding: 4px;
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        backdrop-filter: blur(4px);
      }

      .dom-editor .selected .action-buttons {
        background: rgba(255, 107, 53, 0.1);
        border: 1px solid rgba(255, 107, 53, 0.3);
      }

      .dom-editor .action-btn {
        background: #ff6b35;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 4px 6px;
        font-size: 11px;
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .dom-editor .action-btn.root-export {
        background: #28a745;
      }

      .dom-editor .action-btn.root-import {
        background: #007bff;
      }

      .dom-editor .action-btn.root-add {
        background: #17a2b8;
      }

      .dom-editor .action-btn.root-clear {
        background: #dc3545;
      }

      .dom-editor .action-btn:hover {
        background: #e55a2b;
        transform: scale(1.05);
      }

      .property-panel {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 300px;
        max-height: calc(100% - 20px);
        overflow-y: auto;
        background: white;
        border: 2px solid #dee2e6;
        border-radius: 12px;
        padding: 15px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        display: none;
        backdrop-filter: blur(8px);
        background: rgba(255, 255, 255, 0.98);
      }

      .property-panel.active {
        display: block !important;
        animation: slideInRight 0.3s ease-out;
      }

      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      .property-panel .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid #e9ecef;
      }

      .property-panel .panel-header h4 {
        margin: 0;
        color: #495057;
        font-size: 18px;
        font-weight: 600;
      }

      .property-panel .close-btn {
        background: #dc3545;
        color: white;
        border: none;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }

      .property-panel .close-btn:hover {
        background: #c82333;
        transform: scale(1.1);
      }

      /* 모바일 대응 */
      @media (max-width: 768px) {
        .property-panel {
          position: fixed;
          top: 0;
          right: 0;
          left: 0;
          bottom: 0;
          width: 100%;
          max-height: 100vh;
          border-radius: 0;
          margin: 0;
        }
        
        @keyframes slideInRight {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      }

      .dom-editor .debug {
        position: absolute;
        bottom: 10px;
        left: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 11px;
        max-width: 200px;
        z-index: 1000;
        display: ${this.options.debug ? 'block' : 'none'};
      }
    `;
  }

  private createEditorStructure(): void {
    // container에 dom-editor 클래스 추가
    this.container.classList.add('dom-editor');

    // Create debug element
    this.debugElement = document.createElement('div');
    this.debugElement.className = 'debug';
    this.debugElement.setAttribute('data-editor-ignore', 'true');
    this.debugElement.textContent = 'DOM Editor Ready';
    this.container.appendChild(this.debugElement);

    // Create property panel
    this.createPropertyPanel();

    // container 자체를 편집 가능한 영역으로 설정
    this.container.classList.add('editor-content');
  }

  private createPropertyPanel(): void {
    this.propertyPanel = document.createElement('div');
    this.propertyPanel.id = 'propertyPanel';
    this.propertyPanel.className = 'property-panel';
    this.propertyPanel.setAttribute('data-editor-ignore', 'true');

    this.propertyPanel.innerHTML = `
      <div class="panel-header">
        <h4 id="selectedElementTitle">🎯 속성 편집기</h4>
        <button class="close-btn" title="닫기">×</button>
      </div>
      
      <div class="property-row" id="tagNameRow">
        <label>TagName:</label>
        <input type="text" id="tagNameInput" placeholder="태그명 입력">
        <button class="btn-primary">변경</button>
      </div>
      
      <div class="property-row">
        <label>새 속성:</label>
        <input type="text" id="newAttrName" placeholder="속성명">
        <input type="text" id="newAttrValue" placeholder="속성값">
        <button class="btn-success">추가</button>
      </div>
      
      <div class="property-row">
        <label>속성 목록:</label>
      </div>
      <div id="attributesList" class="attributes-list">
        <div style="text-align: center; color: #6c757d; padding: 20px;">
          요소를 선택하면 속성이 표시됩니다
        </div>
      </div>
    `;

    // Property panel을 container에 추가 (absolute positioning)
    this.container.appendChild(this.propertyPanel);

    // 이벤트 리스너 추가
    const closeBtn = this.propertyPanel.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hidePropertyPanel();
      });
    }

    // 태그명 변경 버튼
    const tagNameBtn = this.propertyPanel.querySelector('.btn-primary');
    if (tagNameBtn) {
      tagNameBtn.addEventListener('click', () => {
        this.updateTagName();
      });
    }

    // 새 속성 추가 버튼
    const addAttrBtn = this.propertyPanel.querySelector('.btn-success');
    if (addAttrBtn) {
      addAttrBtn.addEventListener('click', () => {
        this.addAttribute();
      });
    }
  }

  private initializeEventListeners(): void {
    this.initDragAndDrop();

    // Background click handler - 지연 실행으로 요소 클릭 이벤트 후에 실행
    document.body.addEventListener('click', (e) => {
      // 약간의 지연을 두어 요소 클릭 이벤트가 먼저 처리되도록 함
      setTimeout(() => {
        const target = e.target as Node;
        // 컨테이너 외부 클릭이고, property panel이나 action buttons가 아닌 경우에만 선택 해제
        if (!this.container.contains(target)) {
          const element = target as HTMLElement;
          if (element.closest &&
            !element.closest('.property-panel') &&
            !element.closest('.action-buttons')) {
            this.deselectElement();
          } else if (!element.closest) {
            // Node가 Element가 아닌 경우 (예: TextNode)
            this.deselectElement();
          }
        }
      }, 0);
    });
  }

  private initDragAndDrop(): void {
    // Add event listeners to container
    this.container.addEventListener('dragover', this.handleDragOver.bind(this));
    this.container.addEventListener('dragleave', this.handleDragLeave.bind(this));
    this.container.addEventListener('drop', this.handleDrop.bind(this));
    this.container.addEventListener('click', this.handleElementClick.bind(this));

    // Initialize draggable elements
    this.reinitializeDragAndDrop();
  }

  private reinitializeDragAndDrop(): void {
    // 모든 요소를 편집 가능하게 (editor UI 요소 제외)
    const editableElements = this.container.querySelectorAll('*:not([data-editor-ignore]):not([data-editor-ignore] *)');

    editableElements.forEach(element => {
      const el = element as HTMLElement;
      
      // editor UI 요소는 제외
      if (el.hasAttribute('data-editor-ignore')) return;

      // 드래그는 이동 버튼으로만 가능하도록 변경
      el.draggable = false;

      // Drop events (다른 요소가 이 요소 위에 드롭될 수 있도록)
      el.addEventListener('dragover', this.handleDragOver.bind(this));
      el.addEventListener('dragleave', this.handleDragLeave.bind(this));
      el.addEventListener('drop', this.handleDrop.bind(this));

      // Click events (선택용)
      el.addEventListener('click', this.handleElementClick.bind(this));
    });

    this.updateDebug(`Event listeners registered: ${editableElements.length} elements`);
  }

  private handleDragActivationStart(e: MouseEvent | TouchEvent): void {
    e.stopPropagation();

    if (e.target && (e.target as HTMLElement).closest('.action-buttons')) {
      return;
    }

    if (this.dragStartElement && this.dragStartElement !== e.currentTarget) {
      return;
    }

    this.dragStartElement = e.currentTarget as HTMLElement;
    this.isDragReady = false;

    if (e.type === 'mousedown') {
      const mouseEvent = e as MouseEvent;
      this.dragStartPos = { x: mouseEvent.clientX, y: mouseEvent.clientY };
      const rect = this.dragStartElement.getBoundingClientRect();
      this.dragOffset = {
        x: mouseEvent.clientX - rect.left,
        y: mouseEvent.clientY - rect.top
      };
    } else if (e.type === 'touchstart') {
      const touchEvent = e as TouchEvent;
      const touch = touchEvent.touches[0];
      this.dragStartPos = { x: touch.clientX, y: touch.clientY };
      const rect = this.dragStartElement.getBoundingClientRect();
      this.dragOffset = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    }

    this.dragActivationTimer = window.setTimeout(() => {
      if (this.dragStartElement) {
        this.isDragReady = true;
        this.dragStartElement.draggable = true;
        this.dragStartElement.style.cursor = 'grab';
        this.dragStartElement.style.opacity = '0.8';

        if (navigator.vibrate) {
          navigator.vibrate(50);
        }

        this.updateDebug(`Drag mode activated (${this.options.dragDelay}ms delay)`);
      }
    }, this.options.dragDelay);
  }

  private handleDragActivationEnd(e: MouseEvent | TouchEvent): void {
    e.stopPropagation();

    if (this.dragActivationTimer) {
      clearTimeout(this.dragActivationTimer);
      this.dragActivationTimer = null;
    }

    if (this.dragStartElement) {
      this.dragStartElement.draggable = false;
      this.dragStartElement.style.cursor = '';
      this.dragStartElement.style.opacity = '';
    }

    this.dragStartElement = null;
    this.isDragReady = false;
  }

  private handleDragStart(e: DragEvent): void {
    this.draggedElement = e.target as HTMLElement;
    
    // editor UI 요소는 드래그 불가
    if (this.draggedElement.hasAttribute('data-editor-ignore')) {
      e.preventDefault();
      return;
    }

    if (!this.draggedElement) return;

    this.deselectElement();
    this.draggedElement.classList.add('dragging');
    this.draggedElement.style.cursor = 'grabbing';

    e.dataTransfer!.effectAllowed = 'move';
    e.dataTransfer!.setData('text/html', this.draggedElement.outerHTML);

    this.updateDebug(`Drag start: ${this.draggedElement.id || 'unnamed'}`);
  }



  private handleDragOver(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();

    const target = e.currentTarget as HTMLElement;
    if (!this.draggedElement || !this.canDrop(this.draggedElement, target)) {
      return;
    }

    this.clearHighlights();

    // container에 드롭하는 경우
    if (target === this.container) {
      target.classList.add('drag-over');
      return;
    }

    // 편집 가능한 요소에 드롭하는 경우 - 위치에 따른 가이드 표시
    if (target !== this.container && !target.hasAttribute('data-editor-ignore')) {
      const rect = target.getBoundingClientRect();
      const mouseY = e.clientY;
      const elementTop = rect.top;
      const elementBottom = rect.bottom;
      const elementHeight = rect.height;

      // 요소의 상단 1/3 영역
      if (mouseY < elementTop + elementHeight / 3) {
        target.classList.add('drag-over-before');
        this.updateDebug(`Drag over: BEFORE (${mouseY} < ${elementTop + elementHeight / 3})`);
      }
      // 요소의 하단 1/3 영역
      else if (mouseY > elementBottom - elementHeight / 3) {
        target.classList.add('drag-over-after');
        this.updateDebug(`Drag over: AFTER (${mouseY} > ${elementBottom - elementHeight / 3})`);
      }
      // 요소의 중간 영역 (자식으로 삽입)
      else {
        target.classList.add('drag-over-child');
        this.updateDebug(`Drag over: CHILD (middle area)`);
      }
    }
  }

  private handleDragLeave(e: DragEvent): void {
    e.stopPropagation();
    this.clearHighlights();
  }

  private handleDrop(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();

    const dropZone = e.currentTarget as HTMLElement;

    if (!this.draggedElement || !this.canDrop(this.draggedElement, dropZone)) {
      this.clearHighlights();
      return;
    }

    if (!this.isDragReady) {
      this.clearHighlights();
      this.updateDebug('Drop cancelled: drag not ready');
      return;
    }

    // 드래그 오버 클래스 확인 후 삽입 위치 결정
    let insertionType = 'child'; // 기본값
    if (dropZone.classList.contains('drag-over-before')) {
      insertionType = 'before';
    } else if (dropZone.classList.contains('drag-over-after')) {
      insertionType = 'after';
    }

    // 하이라이트 제거
    this.clearHighlights();

    if (dropZone !== this.container && !dropZone.hasAttribute('data-editor-ignore')) {
      if (insertionType === 'before') {
        // 앞에 삽입
        dropZone.parentNode?.insertBefore(this.draggedElement, dropZone);
        this.updateDebug(`Dropped before: ${dropZone.id || 'unnamed'}`);
      } else if (insertionType === 'after') {
        // 뒤에 삽입
        const parent = dropZone.parentNode;
        if (parent) {
          if (dropZone.nextSibling) {
            parent.insertBefore(this.draggedElement, dropZone.nextSibling);
          } else {
            // 마지막 요소인 경우 appendChild 사용
            parent.appendChild(this.draggedElement);
          }
        }
        this.updateDebug(`Dropped after: ${dropZone.id || 'unnamed'}`);
      } else {
        // 자식으로 삽입
        dropZone.appendChild(this.draggedElement);
        this.updateDebug(`Dropped into: ${dropZone.id || 'unnamed'}`);
      }
    } else if (dropZone === this.container) {
      dropZone.appendChild(this.draggedElement);
      this.updateDebug('Dropped into container');
    }

    const droppedElement = this.draggedElement;
    this.reinitializeDragAndDrop();

    // 드래그된 요소를 다시 선택하여 툴버튼 표시
    if (droppedElement) {
      this.selectElement(droppedElement);
    }
  }

  private handleTouchMove(e: TouchEvent): void {
    if (!this.draggedElement || !this.isDragReady) return;

    e.preventDefault();
    const touch = e.touches[0];

    this.draggedElement.style.position = 'fixed';
    this.draggedElement.style.left = `${touch.clientX - this.dragOffset.x}px`;
    this.draggedElement.style.top = `${touch.clientY - this.dragOffset.y}px`;
    this.draggedElement.style.zIndex = '1000';
    this.draggedElement.style.pointerEvents = 'none';
  }

  private handleElementClick(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const target = e.target as HTMLElement;

    // action buttons 클릭은 무시
    if (target.closest('.action-buttons')) {
      return;
    }



    // editor UI 요소가 아닌 모든 요소 선택 가능
    let targetElement = target;
    
    // editor UI 요소인지 확인
    while (targetElement && targetElement !== this.container) {
      if (targetElement.hasAttribute('data-editor-ignore')) {
        return; // editor UI 요소는 선택 불가
      }
      targetElement = targetElement.parentElement;
    }

    if (target === this.container) {
      if (this.selectedElement === this.container) {
        this.deselectElement();
      } else {
        this.selectElement(this.container);
      }
    } else {
      if (this.selectedElement === target) {
        this.deselectElement();
      } else {
        this.selectElement(target);
      }
    }
  }

  private handleTextNodeEdit(e: MouseEvent): void {
    const target = e.target as HTMLElement;

    // 텍스트가 있는 요소인지 확인
    if (target.childNodes.length === 1 && target.childNodes[0].nodeType === Node.TEXT_NODE) {
      const textNode = target.childNodes[0] as Text;
      this.selectedTextNode = textNode;
      this.showTextNodeEditor(target, textNode);
    } else if (target.textContent && target.textContent.trim()) {
      // 혼합 콘텐츠가 있는 경우 전체 텍스트 편집
      this.showTextContentEditor(target);
    }
  }

  private showTextNodeEditor(element: HTMLElement, textNode: Text): void {
    // 기존 선택 해제
    this.deselectElement();

    // 텍스트 편집을 위한 input 생성
    const input = document.createElement('input');
    input.type = 'text';
    input.value = textNode.textContent || '';
    input.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: 2px solid #007bff;
      background: white;
      font-size: inherit;
      font-family: inherit;
      padding: 4px;
      box-sizing: border-box;
      z-index: 1001;
    `;

    // 요소를 상대 위치로 설정
    const originalPosition = element.style.position;
    element.style.position = 'relative';

    // input 추가
    element.appendChild(input);
    input.focus();
    input.select();

    // 저장/취소 이벤트
    const saveText = () => {
      textNode.textContent = input.value;
      // input이 아직 DOM에 있는지 확인
      if (input.parentNode === element) {
        element.removeChild(input);
      }
      element.style.position = originalPosition;
      this.selectedTextNode = null;
      this.updateDebug(`Text updated: "${input.value}"`);
    };

    const cancelEdit = () => {
      // input이 아직 DOM에 있는지 확인
      if (input.parentNode === element) {
        element.removeChild(input);
      }
      element.style.position = originalPosition;
      this.selectedTextNode = null;
      this.updateDebug('Text edit cancelled');
    };

    input.addEventListener('blur', saveText);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveText();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelEdit();
      }
    });
  }

  private showTextContentEditor(element: HTMLElement): void {
    // 기존 선택 해제
    this.deselectElement();

    // 텍스트 편집을 위한 textarea 생성 (여러 줄 지원)
    const textarea = document.createElement('textarea');
    textarea.value = element.textContent || '';
    textarea.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: 2px solid #007bff;
      background: white;
      font-size: inherit;
      font-family: inherit;
      padding: 4px;
      box-sizing: border-box;
      z-index: 1001;
      resize: none;
    `;

    // 요소를 상대 위치로 설정
    const originalPosition = element.style.position;
    element.style.position = 'relative';

    // textarea 추가
    element.appendChild(textarea);
    textarea.focus();
    textarea.select();

    // 저장/취소 이벤트
    const saveText = () => {
      // textarea가 아직 DOM에 있는지 확인
      if (textarea.parentNode === element) {
        element.removeChild(textarea);
      }
      element.textContent = textarea.value;
      element.style.position = originalPosition;
      this.updateDebug(`Text content updated: "${textarea.value}"`);
    };

    const cancelEdit = () => {
      // textarea가 아직 DOM에 있는지 확인
      if (textarea.parentNode === element) {
        element.removeChild(textarea);
      }
      element.style.position = originalPosition;
      this.updateDebug('Text edit cancelled');
    };

    textarea.addEventListener('blur', saveText);
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        saveText();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelEdit();
      }
    });
  }

  private selectElement(element: HTMLElement): void {
    if (this.selectedElement) {
      this.selectedElement.classList.remove('selected');
      this.removeActionButtons(this.selectedElement);
    }

    this.selectedElement = element;
    element.classList.add('selected');

    if (element === this.container) {
      this.addContainerButtons(element);
      this.showPropertyPanel(element);
    } else {
      this.addActionButtons(element);
      this.showPropertyPanel(element);
    }

    this.updateDebug(`Selected: ${element.id || element.tagName}`);
  }

  private deselectElement(): void {
    if (this.selectedElement) {
      this.selectedElement.classList.remove('selected');
      this.removeActionButtons(this.selectedElement);
      this.selectedElement = null;
      this.hidePropertyPanel();
      this.updateDebug('Deselected');
    }
  }

  private addActionButtons(element: HTMLElement): void {
    this.removeActionButtons(element);

    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'action-buttons';
    buttonsContainer.setAttribute('data-editor-ignore', 'true');

    // Move button (drag handle)
    const moveBtn = document.createElement('button');
    moveBtn.className = 'action-btn move';
    moveBtn.innerHTML = '↔️';
    moveBtn.title = '이동 (드래그)';
    moveBtn.draggable = true;
    moveBtn.onmousedown = (e) => {
      e.stopPropagation();
      this.startElementDrag(element, e);
    };
    moveBtn.ontouchstart = (e) => {
      e.stopPropagation();
      this.startElementDrag(element, e);
    };

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'action-btn delete';
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.title = '삭제';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      this.deleteSelectedElement();
    };

    // Text edit button (텍스트가 있는 경우에만 표시)
    const hasText = element.textContent && element.textContent.trim();
    let textEditBtn: HTMLButtonElement | null = null;

    if (hasText) {
      textEditBtn = document.createElement('button');
      textEditBtn.className = 'action-btn text-edit';
      textEditBtn.innerHTML = '📝';
      textEditBtn.title = '텍스트 편집';
      textEditBtn.onclick = (e) => {
        e.stopPropagation();
        this.handleTextNodeEdit({ target: element } as any);
      };
    }

    // Add child button
    const addChildBtn = document.createElement('button');
    addChildBtn.className = 'action-btn add-child';
    addChildBtn.innerHTML = '➕';
    addChildBtn.title = '자식 요소 추가';
    addChildBtn.onclick = (e) => {
      e.stopPropagation();
      this.addChildElement();
    };

    buttonsContainer.appendChild(moveBtn);
    if (textEditBtn) {
      buttonsContainer.appendChild(textEditBtn);
    }
    buttonsContainer.appendChild(deleteBtn);
    buttonsContainer.appendChild(addChildBtn);
    element.appendChild(buttonsContainer);
  }

  private addContainerButtons(element: HTMLElement): void {
    this.removeActionButtons(element);

    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'action-buttons';
    buttonsContainer.setAttribute('data-editor-ignore', 'true');

    // Add item button
    const addItemBtn = document.createElement('button');
    addItemBtn.className = 'action-btn root-add';
    addItemBtn.innerHTML = '➕';
    addItemBtn.title = '새 요소 추가';
    addItemBtn.onclick = (e) => {
      e.stopPropagation();
      this.addNewItem();
    };

    // Export button
    const exportBtn = document.createElement('button');
    exportBtn.className = 'action-btn root-export';
    exportBtn.innerHTML = '📤';
    exportBtn.title = '데이터 내보내기';
    exportBtn.onclick = (e) => {
      e.stopPropagation();
      this.exportToFile();
    };

    // Import button
    const importBtn = document.createElement('button');
    importBtn.className = 'action-btn root-import';
    importBtn.innerHTML = '📥';
    importBtn.title = '데이터 가져오기';
    importBtn.onclick = (e) => {
      e.stopPropagation();
      this.importFromFile();
    };

    // Clear all button
    const clearAllBtn = document.createElement('button');
    clearAllBtn.className = 'action-btn root-clear';
    clearAllBtn.innerHTML = '🗑️';
    clearAllBtn.title = '모두 지우기';
    clearAllBtn.onclick = (e) => {
      e.stopPropagation();
      this.clearAll();
    };

    buttonsContainer.appendChild(addItemBtn);
    buttonsContainer.appendChild(exportBtn);
    buttonsContainer.appendChild(importBtn);
    buttonsContainer.appendChild(clearAllBtn);
    element.appendChild(buttonsContainer);
  }

  private removeActionButtons(element: HTMLElement): void {
    const existingButtons = element.querySelector('.action-buttons');
    if (existingButtons) {
      existingButtons.remove();
    }
  }

  private showPropertyPanel(element: HTMLElement): void {
    this.propertyPanel.classList.add('active');

    // 디버깅용 로그
    this.updateDebug(`Property panel shown for: ${element.tagName.toLowerCase()}`);
    console.log('Property panel element:', this.propertyPanel);
    console.log('Property panel classes:', this.propertyPanel.className);

    const title = this.propertyPanel.querySelector('#selectedElementTitle') as HTMLElement;
    if (title) {
      title.innerHTML = `🎯 <${element.tagName.toLowerCase()}> ${element.id ? `#${element.id}` : ''}`;
    }

    const tagNameInput = this.propertyPanel.querySelector('#tagNameInput') as HTMLInputElement;
    if (tagNameInput) {
      tagNameInput.value = element.tagName.toLowerCase();
    }

    this.updateAttributesList(element);
    this.updateChildrenList(element);
  }

  private updateChildrenList(element: HTMLElement): void {
    const attributesList = this.propertyPanel.querySelector('#attributesList') as HTMLElement;



    // 자식 요소 섹션 추가
    const childrenSection = document.createElement('div');
    childrenSection.style.cssText = 'margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6;';

    const childrenTitle = document.createElement('h5');
    childrenTitle.textContent = '👶 자식 요소';
    childrenTitle.style.cssText = 'margin: 0 0 10px 0; color: #495057; font-size: 14px;';
    childrenSection.appendChild(childrenTitle);

    // 자식 요소 찾기 (editor UI 요소 제외)
    const children = Array.from(element.children).filter(child =>
      !(child as HTMLElement).hasAttribute('data-editor-ignore')
    ) as HTMLElement[];

    // 텍스트 노드 찾기 (직접 자식만)
    const textNodes: Text[] = [];
    for (let i = 0; i < element.childNodes.length; i++) {
      const node = element.childNodes[i];
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        textNodes.push(node as Text);
      }
    }

    if (children.length === 0 && textNodes.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.style.cssText = 'text-align: center; color: #6c757d; padding: 10px; font-style: italic;';
      emptyDiv.textContent = '자식 요소가 없습니다';
      childrenSection.appendChild(emptyDiv);
    } else {
      // 자식 요소들 표시
      children.forEach((child, index) => {
        const childItem = document.createElement('div');
        childItem.style.cssText = 'background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 8px; margin-bottom: 8px;';

        const childInfo = document.createElement('div');
        childInfo.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;';

        const childLabel = document.createElement('div');
        childLabel.style.cssText = 'font-size: 12px; color: #495057; flex: 1;';
        childLabel.innerHTML = `🏷️ &lt;${child.tagName.toLowerCase()}&gt; ${child.id ? `#${child.id}` : ''} ${child.className ? `.${child.className.split(' ').join('.')}` : ''}`;

        const selectButton = document.createElement('button');
        selectButton.style.cssText = 'background: #007bff; color: white; border: none; border-radius: 3px; padding: 3px 8px; font-size: 11px; cursor: pointer;';
        selectButton.textContent = '선택';
        selectButton.onclick = () => {
          this.selectElement(child);
        };

        childInfo.appendChild(childLabel);
        childInfo.appendChild(selectButton);

        // 이동 버튼들
        const moveButtons = document.createElement('div');
        moveButtons.style.cssText = 'display: flex; gap: 4px;';

        const moveUpBtn = document.createElement('button');
        moveUpBtn.style.cssText = 'background: #28a745; color: white; border: none; border-radius: 3px; padding: 2px 6px; font-size: 10px; cursor: pointer;';
        moveUpBtn.textContent = '⬆️';
        moveUpBtn.title = '위로 이동';
        moveUpBtn.disabled = index === 0;
        if (moveUpBtn.disabled) {
          moveUpBtn.style.background = '#6c757d';
          moveUpBtn.style.cursor = 'not-allowed';
        }
        moveUpBtn.onclick = () => {
          this.moveChildUp(element, child);
        };

        const moveDownBtn = document.createElement('button');
        moveDownBtn.style.cssText = 'background: #28a745; color: white; border: none; border-radius: 3px; padding: 2px 6px; font-size: 10px; cursor: pointer;';
        moveDownBtn.textContent = '⬇️';
        moveDownBtn.title = '아래로 이동';
        moveDownBtn.disabled = index === children.length - 1;
        if (moveDownBtn.disabled) {
          moveDownBtn.style.background = '#6c757d';
          moveDownBtn.style.cursor = 'not-allowed';
        }
        moveDownBtn.onclick = () => {
          this.moveChildDown(element, child);
        };

        moveButtons.appendChild(moveUpBtn);
        moveButtons.appendChild(moveDownBtn);

        childItem.appendChild(childInfo);
        childItem.appendChild(moveButtons);
        childrenSection.appendChild(childItem);
      });

      // 텍스트 노드들 표시
      textNodes.forEach((textNode, index) => {
        const textItem = document.createElement('div');
        textItem.style.cssText = 'background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 8px; margin-bottom: 8px;';

        const textInfo = document.createElement('div');
        textInfo.style.cssText = 'display: flex; justify-content: space-between; align-items: center;';

        const textLabel = document.createElement('div');
        textLabel.style.cssText = 'font-size: 12px; color: #856404; flex: 1; margin-right: 8px;';
        const preview = textNode.textContent?.substring(0, 30) || '';
        textLabel.innerHTML = `📝 "${preview}${textNode.textContent && textNode.textContent.length > 30 ? '...' : ''}"`;

        const editButton = document.createElement('button');
        editButton.style.cssText = 'background: #ffc107; color: #212529; border: none; border-radius: 3px; padding: 3px 8px; font-size: 11px; cursor: pointer;';
        editButton.textContent = '편집';
        editButton.onclick = () => {
          this.selectedTextNode = textNode;
          this.showTextNodeEditor(element, textNode);
        };

        textInfo.appendChild(textLabel);
        textInfo.appendChild(editButton);
        textItem.appendChild(textInfo);
        childrenSection.appendChild(textItem);
      });
    }

    attributesList.appendChild(childrenSection);
  }

  private moveChildUp(parent: HTMLElement, child: HTMLElement): void {
    const siblings = Array.from(parent.children).filter(sibling =>
      !(sibling as HTMLElement).hasAttribute('data-editor-ignore')
    );
    const currentIndex = siblings.indexOf(child);

    if (currentIndex > 0) {
      const previousSibling = siblings[currentIndex - 1];
      parent.insertBefore(child, previousSibling);
      this.updateDebug(`Moved child up: ${child.tagName.toLowerCase()}`);
      // 부모 요소의 패널 새로고침 (자식 목록 업데이트)
      this.showPropertyPanel(parent);
    }
  }

  private moveChildDown(parent: HTMLElement, child: HTMLElement): void {
    const siblings = Array.from(parent.children).filter(sibling =>
      !(sibling as HTMLElement).hasAttribute('data-editor-ignore')
    );
    const currentIndex = siblings.indexOf(child);

    if (currentIndex < siblings.length - 1) {
      const nextSibling = siblings[currentIndex + 1];
      parent.insertBefore(child, nextSibling.nextSibling);
      this.updateDebug(`Moved child down: ${child.tagName.toLowerCase()}`);
      // 부모 요소의 패널 새로고침 (자식 목록 업데이트)
      this.showPropertyPanel(parent);
    }
  }

  private hidePropertyPanel(): void {
    this.propertyPanel.classList.remove('active');
  }

  private updateAttributesList(element: HTMLElement): void {
    const attributesList = this.propertyPanel.querySelector('#attributesList') as HTMLElement;
    attributesList.innerHTML = '';

    if (element.attributes.length === 0) {
      attributesList.innerHTML = '<div style="text-align: center; color: #6c757d; padding: 20px;">속성이 없습니다</div>';
      return;
    }

    for (let attr of element.attributes) {
      const attrItem = document.createElement('div');
      attrItem.className = 'attribute-item';

      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.value = attr.name;
      nameInput.placeholder = '속성명';

      const valueInput = document.createElement('input');
      valueInput.type = 'text';
      valueInput.value = attr.value;
      valueInput.placeholder = '속성값';

      const updateBtn = document.createElement('button');
      updateBtn.className = 'btn-primary';
      updateBtn.textContent = '수정';
      updateBtn.addEventListener('click', () => {
        this.updateAttribute(element, attr.name, nameInput.value, valueInput.value);
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-danger';
      deleteBtn.textContent = '삭제';
      deleteBtn.addEventListener('click', () => {
        this.deleteAttribute(element, attr.name);
      });

      attrItem.appendChild(nameInput);
      attrItem.appendChild(valueInput);
      attrItem.appendChild(updateBtn);
      attrItem.appendChild(deleteBtn);
      attributesList.appendChild(attrItem);
    }
  }

  private addNewItem(): void {
    const newId = `item-${this.itemCounter++}`;
    const newItem = document.createElement('div');
    newItem.id = newId;
    newItem.textContent = `📄 새 아이템 ${this.itemCounter - 1000}`;

    this.container.appendChild(newItem);
    this.reinitializeDragAndDrop();
    this.updateDebug(`Added new item: ${newId}`);
  }

  private addChildElement(): void {
    if (!this.selectedElement) return;

    const newId = `child-${this.itemCounter++}`;
    const newChild = document.createElement('div');
    newChild.id = newId;
    newChild.textContent = `📄 새 자식 ${this.itemCounter - 1000}`;

    this.selectedElement.appendChild(newChild);
    this.reinitializeDragAndDrop();
    this.updateDebug(`Added child: ${newId}`);
  }

  private startElementDrag(element: HTMLElement, e: MouseEvent | TouchEvent): void {
    e.preventDefault();

    this.draggedElement = element;
    this.isDragReady = true;
    this.isDragging = true;

    // 드래그 중 시각적 효과
    element.classList.add('dragging');

    // 마우스/터치 이벤트에 따른 처리
    if (e instanceof MouseEvent) {
      document.addEventListener('mousemove', this.handleDragMove.bind(this));
      document.addEventListener('mouseup', this.handleElementDragEnd.bind(this));
    } else {
      document.addEventListener('touchmove', this.handleDragMove.bind(this));
      document.addEventListener('touchend', this.handleElementDragEnd.bind(this));
    }

    this.updateDebug(`Started dragging: ${element.id || 'unnamed'}`);
  }

  private handleDragMove(e: MouseEvent | TouchEvent): void {
    if (!this.isDragging || !this.draggedElement) return;

    e.preventDefault();

    // 마우스/터치 위치 가져오기
    const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
    const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;

    // 현재 위치의 요소 찾기
    const elementBelow = document.elementFromPoint(clientX, clientY) as HTMLElement;
    if (!elementBelow) return;

    // 드래그 오버 효과 적용 (editor UI 요소가 아닌 경우)
    let target = elementBelow;
    while (target && target.hasAttribute('data-editor-ignore')) {
      target = target.parentElement;
    }
    if (!target) target = elementBelow;
    if (target && target !== this.draggedElement && this.canDrop(this.draggedElement, target)) {
      this.clearHighlights();
      this.applyDragOverEffect(target, clientY);
    }
  }

  private handleElementDragEnd(e: MouseEvent | TouchEvent): void {
    if (!this.isDragging || !this.draggedElement) return;

    // 이벤트 리스너 제거
    document.removeEventListener('mousemove', this.handleDragMove.bind(this));
    document.removeEventListener('mouseup', this.handleElementDragEnd.bind(this));
    document.removeEventListener('touchmove', this.handleDragMove.bind(this));
    document.removeEventListener('touchend', this.handleElementDragEnd.bind(this));

    // 드롭 위치 확인
    const clientX = e instanceof MouseEvent ? e.clientX : e.changedTouches[0].clientX;
    const clientY = e instanceof MouseEvent ? e.clientY : e.changedTouches[0].clientY;

    const elementBelow = document.elementFromPoint(clientX, clientY) as HTMLElement;
    if (elementBelow) {
      let dropTarget = elementBelow;
      while (dropTarget && dropTarget.hasAttribute('data-editor-ignore')) {
        dropTarget = dropTarget.parentElement;
      }
      if (!dropTarget) dropTarget = elementBelow;
      if (dropTarget && this.canDrop(this.draggedElement, dropTarget)) {
        this.performDrop(dropTarget);
      }
    }

    // 정리
    this.draggedElement.classList.remove('dragging');
    this.clearHighlights();
    this.isDragging = false;
    this.isDragReady = false;

    const droppedElement = this.draggedElement;
    this.draggedElement = null;

    this.reinitializeDragAndDrop();

    // 드래그된 요소 다시 선택
    if (droppedElement) {
      this.selectElement(droppedElement);
    }
  }

  private applyDragOverEffect(target: HTMLElement, mouseY: number): void {
    if (target !== this.container && !target.hasAttribute('data-editor-ignore')) {
      const rect = target.getBoundingClientRect();
      const elementTop = rect.top;
      const elementBottom = rect.bottom;
      const elementHeight = rect.height;

      // 요소의 상단 1/3 영역
      if (mouseY < elementTop + elementHeight / 3) {
        target.classList.add('drag-over-before');
      }
      // 요소의 하단 1/3 영역
      else if (mouseY > elementBottom - elementHeight / 3) {
        target.classList.add('drag-over-after');
      }
      // 요소의 중간 영역 (자식으로 삽입)
      else {
        target.classList.add('drag-over-child');
      }
    } else if (target === this.container) {
      target.classList.add('drag-over');
    }
  }

  private performDrop(dropTarget: HTMLElement): void {
    if (!this.draggedElement) return;

    // 드래그 오버 클래스 확인 후 삽입 위치 결정
    let insertionType = 'child'; // 기본값
    if (dropTarget.classList.contains('drag-over-before')) {
      insertionType = 'before';
    } else if (dropTarget.classList.contains('drag-over-after')) {
      insertionType = 'after';
    }

    if (dropTarget !== this.container && !dropTarget.hasAttribute('data-editor-ignore')) {
      if (insertionType === 'before') {
        // 앞에 삽입
        dropTarget.parentNode?.insertBefore(this.draggedElement, dropTarget);
        this.updateDebug(`Dropped before: ${dropTarget.id || 'unnamed'}`);
      } else if (insertionType === 'after') {
        // 뒤에 삽입
        const parent = dropTarget.parentNode;
        if (parent) {
          if (dropTarget.nextSibling) {
            parent.insertBefore(this.draggedElement, dropTarget.nextSibling);
          } else {
            parent.appendChild(this.draggedElement);
          }
        }
        this.updateDebug(`Dropped after: ${dropTarget.id || 'unnamed'}`);
      } else {
        // 자식으로 삽입
        dropTarget.appendChild(this.draggedElement);
        this.updateDebug(`Dropped into: ${dropTarget.id || 'unnamed'}`);
      }
    } else if (dropTarget === this.container) {
      dropTarget.appendChild(this.draggedElement);
      this.updateDebug('Dropped into container');
    }
  }

  private updateAttribute(element: HTMLElement, oldName: string, newName: string, newValue: string): void {
    if (!newName.trim()) {
      alert('속성명을 입력해주세요.');
      return;
    }

    // 기존 속성 제거
    if (oldName !== newName) {
      element.removeAttribute(oldName);
    }

    // 새 속성 설정
    element.setAttribute(newName, newValue);

    // Property panel 업데이트
    this.updateAttributesList(element);

    this.updateDebug(`Updated attribute: ${oldName} → ${newName}="${newValue}"`);
  }

  private deleteAttribute(element: HTMLElement, attributeName: string): void {
    if (confirm(`"${attributeName}" 속성을 삭제하시겠습니까?`)) {
      element.removeAttribute(attributeName);
      this.updateAttributesList(element);
      this.updateDebug(`Deleted attribute: ${attributeName}`);
    }
  }

  private addAttribute(): void {
    if (!this.selectedElement) return;

    const nameInput = this.propertyPanel.querySelector('#newAttrName') as HTMLInputElement;
    const valueInput = this.propertyPanel.querySelector('#newAttrValue') as HTMLInputElement;

    const name = nameInput.value.trim();
    const value = valueInput.value.trim();

    if (!name) {
      alert('속성명을 입력해주세요.');
      return;
    }

    // 속성 추가
    this.selectedElement.setAttribute(name, value);

    // 입력 필드 초기화
    nameInput.value = '';
    valueInput.value = '';

    // Property panel 업데이트
    this.updateAttributesList(this.selectedElement);

    this.updateDebug(`Added attribute: ${name}="${value}"`);
  }

  private updateTagName(): void {
    if (!this.selectedElement) return;



    const tagNameInput = this.propertyPanel.querySelector('#tagNameInput') as HTMLInputElement;
    const newTagName = tagNameInput.value.trim().toLowerCase();

    if (!newTagName) {
      alert('태그명을 입력해주세요.');
      return;
    }

    if (!/^[a-z][a-z0-9]*$/i.test(newTagName)) {
      alert('유효한 HTML 태그명을 입력해주세요.');
      return;
    }

    // 새 요소 생성
    const newElement = document.createElement(newTagName);

    // 모든 속성 복사
    for (let attr of this.selectedElement.attributes) {
      newElement.setAttribute(attr.name, attr.value);
    }

    // 내용 복사
    newElement.innerHTML = this.selectedElement.innerHTML;

    // 부모에서 교체
    const parent = this.selectedElement.parentNode;
    if (parent) {
      parent.replaceChild(newElement, this.selectedElement);

      // 새 요소를 선택된 요소로 설정
      this.selectedElement = newElement;

      // 드래그 앤 드롭 재초기화
      this.reinitializeDragAndDrop();

      // Property panel 업데이트
      this.showPropertyPanel(newElement);

      this.updateDebug(`Changed tag: ${this.selectedElement.tagName.toLowerCase()} → ${newTagName}`);
    }
  }

  private deleteSelectedElement(): void {
    if (!this.selectedElement) {
      this.updateDebug('No element selected');
      return;
    }

    if (confirm('선택된 요소를 삭제하시겠습니까?')) {
      const elementId = this.selectedElement.id || 'unnamed';
      const isContainer = this.selectedElement === this.container;

      if (isContainer) {
        // container 삭제 시 내용만 비우기
        this.container.innerHTML = '';
        // debug element와 property panel 다시 추가
        this.container.appendChild(this.debugElement);
        this.container.appendChild(this.propertyPanel);
      } else {
        this.selectedElement.remove();
      }

      this.selectedElement = null;
      this.hidePropertyPanel();
      this.reinitializeDragAndDrop();
      this.updateDebug(`Deleted: ${elementId}`);
    }
  }

  private clearAll(): void {
    if (confirm('모든 요소를 삭제하시겠습니까?')) {
      // container 내부의 편집 가능한 요소들만 제거 (editor UI 요소 제외)
      const elementsToRemove = Array.from(this.container.children).filter(
        child => !(child as HTMLElement).hasAttribute('data-editor-ignore')
      );
      elementsToRemove.forEach(el => el.remove());
      this.deselectElement();
      this.updateDebug('All elements cleared');
    }
  }

  private loadSampleData(): void {
    const sampleItems = [
      { id: 'item1', text: '📄 아이템 1' },
      { id: 'item2', text: '📄 아이템 2' },
      { id: 'item3', text: '📄 아이템 3' }
    ];

    sampleItems.forEach(item => {
      const element = document.createElement('div');
      element.id = item.id;
      element.textContent = item.text;
      this.container.appendChild(element);
    });

    this.reinitializeDragAndDrop();
    this.updateDebug('Sample data loaded');
  }

  private updateDebug(message: string): void {
    if (this.options.debug) {
      this.debugElement.textContent = message;
      console.log(`[DomEditor] ${message}`);
    }
  }

  // Public API methods
  public loadContent(content: string | NodeData): void {
    // editor UI 요소를 제외한 모든 요소 제거
    const elementsToRemove = Array.from(this.container.children).filter(
      child => !(child as HTMLElement).hasAttribute('data-editor-ignore')
    );
    elementsToRemove.forEach(el => el.remove());

    if (typeof content === 'string') {
      // HTML 문자열을 임시 div에 파싱한 후 요소들을 추가
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      Array.from(tempDiv.childNodes).forEach(node => {
        this.container.appendChild(node.cloneNode(true));
      });
      this.updateDebug('HTML content loaded');
    } else {
      this.importData(content);
      this.updateDebug('Structured data loaded');
      return; // importData already calls reinitializeDragAndDrop
    }

    this.reinitializeDragAndDrop();
  }

  public getContent(): string {
    // container의 편집 가능한 내용만 반환 (editor UI 요소 제외)
    const tempDiv = document.createElement('div');
    Array.from(this.container.children).forEach(child => {
      const element = child as HTMLElement;
      if (!element.hasAttribute('data-editor-ignore')) {
        tempDiv.appendChild(child.cloneNode(true));
      }
    });
    return tempDiv.innerHTML;
  }

  public exportData(): ElementNodeData {
    // container 자체를 export (debug element 제외)
    const containerData = this.elementToData(this.container);

    // children에서 debug element 제거
    if (containerData.children) {
      containerData.children = containerData.children.filter(child =>
        child.nodeType !== 'element' || child.className !== 'debug'
      );
    }

    return containerData;
  }

  public importData(data: NodeData): void {
    // NodeData가 ElementNodeData인지 확인
    if (data.nodeType !== 'element') {
      throw new Error('Root data must be an element node');
    }

    // debug element 백업
    const debugElement = this.container.querySelector('.debug');

    // container 내용 교체
    this.container.innerHTML = '';

    // 새로운 내용 추가
    if (data.children) {
      data.children.forEach(childData => {
        const node = this.dataToNode(childData);
        this.container.appendChild(node);
      });
    }

    // container 속성 적용
    if (data.className) this.container.className = data.className;
    if (data.id && data.id !== this.container.id) this.container.id = data.id;
    if (data.attributes) {
      Object.entries(data.attributes).forEach(([key, value]) => {
        this.container.setAttribute(key, value);
      });
    }

    // debug element 다시 추가
    if (debugElement) {
      this.container.appendChild(debugElement);
    }

    this.reinitializeDragAndDrop();
    this.updateDebug('Data imported');
  }

  private elementToData(element: HTMLElement): ElementNodeData {
    const data: ElementNodeData = {
      nodeType: 'element',
      tagName: element.tagName.toLowerCase(),
      id: element.id || undefined,
      className: element.className || undefined,
      attributes: {},
      children: []
    };

    // Get attributes
    for (let attr of element.attributes) {
      if (attr.name !== 'class' && attr.name !== 'id') {
        data.attributes![attr.name] = attr.value;
      }
    }

    // Get all child nodes (elements and text nodes)
    const childNodes = Array.from(element.childNodes);
    data.children = childNodes
      .filter(node => {
        // editor UI 요소 제외
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          return !el.hasAttribute('data-editor-ignore');
        }
        // 의미있는 텍스트 노드만 포함
        if (node.nodeType === Node.TEXT_NODE) {
          return node.textContent && node.textContent.trim().length > 0;
        }
        return false;
      })
      .map(node => this.nodeToData(node));

    return data;
  }

  private nodeToData(node: Node): NodeData {
    if (node.nodeType === Node.ELEMENT_NODE) {
      return this.elementToData(node as HTMLElement);
    } else if (node.nodeType === Node.TEXT_NODE) {
      return {
        nodeType: 'text',
        textContent: node.textContent || ''
      };
    } else {
      throw new Error(`Unsupported node type: ${node.nodeType}`);
    }
  }

  private dataToNode(data: NodeData): Node {
    if (data.nodeType === 'element') {
      return this.dataToElement(data);
    } else if (data.nodeType === 'text') {
      return document.createTextNode(data.textContent);
    } else {
      throw new Error(`Unsupported node type: ${(data as any).nodeType}`);
    }
  }

  private dataToElement(data: ElementNodeData): HTMLElement {
    const element = document.createElement(data.tagName);

    if (data.id) element.id = data.id;
    if (data.className) element.className = data.className;

    // Set attributes
    if (data.attributes) {
      Object.entries(data.attributes).forEach(([name, value]) => {
        element.setAttribute(name, value);
      });
    }

    // Add children
    if (data.children) {
      data.children.forEach(childData => {
        const childNode = this.dataToNode(childData);
        element.appendChild(childNode);
      });
    }

    return element;
  }

  private canDrop(draggedElement: HTMLElement, targetElement: HTMLElement): boolean {
    if (draggedElement === targetElement) return false;

    // Check if target is descendant of dragged element
    let node = targetElement.parentNode;
    while (node != null) {
      if (node === draggedElement) return false;
      node = node.parentNode;
    }

    return true;
  }

  private clearHighlights(): void {
    this.container.querySelectorAll('.drag-over, .drag-over-before, .drag-over-after, .drag-over-child')
      .forEach(el => {
        el.classList.remove('drag-over', 'drag-over-before', 'drag-over-after', 'drag-over-child');
      });
  }

  private exportToFile(): void {
    try {
      const data = this.exportData();
      const jsonString = JSON.stringify(data, null, 2);
      
      // Create blob and download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `dom-editor-export-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
      a.style.display = 'none';
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
      
      this.updateDebug('Data exported to file');
    } catch (error) {
      console.error('Export failed:', error);
      alert('데이터 내보내기에 실패했습니다.');
    }
  }

  private importFromFile(): void {
    // Create file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonString = event.target?.result as string;
          const data = JSON.parse(jsonString) as NodeData;
          
          // Validate data structure
          if (!data.nodeType) {
            throw new Error('Invalid data format: missing nodeType');
          }
          
          if (data.nodeType === 'element' && !data.tagName) {
            throw new Error('Invalid data format: element node missing tagName');
          }
          
          if (data.nodeType === 'text' && typeof data.textContent !== 'string') {
            throw new Error('Invalid data format: text node missing textContent');
          }
          
          this.importData(data);
          this.updateDebug('Data imported from file');
          alert('데이터를 성공적으로 가져왔습니다!');
        } catch (error) {
          console.error('Import failed:', error);
          alert('파일을 읽는데 실패했습니다. 올바른 JSON 파일인지 확인해주세요.');
        }
      };
      
      reader.onerror = () => {
        alert('파일을 읽는데 실패했습니다.');
      };
      
      reader.readAsText(file);
    };
    
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  }

  public destroy(): void {
    // Clean up timers
    if (this.dragActivationTimer) {
      clearTimeout(this.dragActivationTimer);
      this.dragActivationTimer = null;
    }

    // Clean up property panel from body
    if (this.propertyPanel && this.propertyPanel.parentNode) {
      this.propertyPanel.parentNode.removeChild(this.propertyPanel);
    }

    // Clean up event listeners and DOM
    this.container.innerHTML = '';
    this.selectedElement = null;
    this.draggedElement = null;
    this.dragStartElement = null;

    this.updateDebug('Editor destroyed');
  }
}