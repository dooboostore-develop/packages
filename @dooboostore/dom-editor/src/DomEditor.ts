/**
 * DOM Editor - Visual drag-and-drop HTML editor
 * 
 * A comprehensive visual editor for creating and manipulating HTML structures
 * with real-time drag-and-drop functionality, property editing, and mobile support.
 */

export interface DomEditorOptions {
  /** Initial content to load - can be HTML string or structured ElementData */
  initialContent?: string | ElementData;
  /** Enable debug mode */
  debug?: boolean;
  /** Custom CSS styles to inject */
  customStyles?: string;
  /** Drag activation delay in milliseconds (default: 500) */
  dragDelay?: number;
  /** Enable mobile touch support */
  enableMobileSupport?: boolean;
}

export interface ElementData {
  tagName: string;
  id?: string;
  className?: string;
  attributes?: Record<string, string>;
  textContent?: string;
  children?: ElementData[];
}

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

      .dom-editor .draggable {
        background: white;
        border: 2px solid #ddd;
        border-radius: 8px;
        padding: 15px;
        margin: 10px;
        cursor: move;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        min-height: 50px;
        position: relative;
      }

      .dom-editor body.drag-preparing {
        user-select: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
      }
      
      .dom-editor body.drag-preparing .draggable {
        touch-action: none !important;
      }

      .dom-editor .draggable:hover {
        border-color: #007bff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .dom-editor .draggable.selected {
        border-color: #ff6b35;
        background-color: #fff5f0;
        box-shadow: 0 0 15px rgba(255, 107, 53, 0.3);
      }

      .dom-editor .draggable.dragging {
        opacity: 0.5;
        transform: rotate(5deg);
        z-index: 1000;
      }

      .dom-editor .draggable.drag-over {
        border-color: #28a745;
        background-color: #d4edda;
        box-shadow: 0 0 15px rgba(40, 167, 69, 0.4);
      }

      .dom-editor .draggable.drag-over-before {
        border-top: 6px solid #28a745;
        background-color: #d4edda;
        position: relative;
      }

      .dom-editor .draggable.drag-over-before::before {
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

      .dom-editor .draggable.drag-over-after {
        border-bottom: 6px solid #28a745;
        background-color: #d4edda;
        position: relative;
      }

      .dom-editor .draggable.drag-over-after::after {
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

      .dom-editor .draggable.drag-over-child {
        border: 3px solid #007bff;
        background-color: #e7f3ff;
        box-shadow: inset 0 0 15px rgba(0, 123, 255, 0.4);
        position: relative;
      }

      .dom-editor .draggable.drag-over-child::before {
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
        gap: 5px;
        z-index: 1002;
        background: rgba(255, 255, 255, 0.95);
        padding: 4px;
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        backdrop-filter: blur(4px);
      }

      .dom-editor .draggable.selected .action-buttons {
        background: rgba(255, 107, 53, 0.1);
        border: 1px solid rgba(255, 107, 53, 0.3);
      }

      .dom-editor .action-btn {
        background: #ff6b35;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 5px 8px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 30px;
      }

      .dom-editor .action-btn:hover {
        background: #e55a2b;
        transform: scale(1.05);
      }

      .dom-editor .property-panel {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 320px;
        max-height: 80vh;
        overflow-y: auto;
        background: white;
        border: 2px solid #dee2e6;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        display: none;
        backdrop-filter: blur(10px);
        background: rgba(255, 255, 255, 0.95);
      }

      .dom-editor .property-panel.active {
        display: block;
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

      .dom-editor .property-panel .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid #e9ecef;
      }

      .dom-editor .property-panel .panel-header h4 {
        margin: 0;
        color: #495057;
        font-size: 18px;
        font-weight: 600;
      }

      .dom-editor .property-panel .close-btn {
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

      .dom-editor .property-panel .close-btn:hover {
        background: #c82333;
        transform: scale(1.1);
      }

      /* 모바일 대응 */
      @media (max-width: 768px) {
        .dom-editor .property-panel {
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
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px;
        border-radius: 4px;
        font-size: 12px;
        max-width: 250px;
        z-index: 2000;
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

    // Property panel을 body에 직접 추가 (floating)
    document.body.appendChild(this.propertyPanel);

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

    // Background click handler
    document.body.addEventListener('click', (e) => {
      if (!this.container.contains(e.target as Node)) {
        this.deselectElement();
      }
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
    const draggableElements = this.container.querySelectorAll('.draggable');

    draggableElements.forEach(element => {
      const el = element as HTMLElement;
      el.draggable = false; // Will be activated after delay

      // Drag activation events
      el.addEventListener('mousedown', this.handleDragActivationStart.bind(this));
      el.addEventListener('mouseup', this.handleDragActivationEnd.bind(this));
      el.addEventListener('mouseleave', this.handleDragActivationEnd.bind(this));

      if (this.options.enableMobileSupport) {
        el.addEventListener('touchstart', this.handleDragActivationStart.bind(this), { passive: false });
        el.addEventListener('touchend', this.handleDragActivationEnd.bind(this), { passive: false });
        el.addEventListener('touchcancel', this.handleDragActivationEnd.bind(this), { passive: false });
        el.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
      }

      // Actual drag events
      el.addEventListener('dragstart', this.handleDragStart.bind(this));
      el.addEventListener('dragend', this.handleDragEnd.bind(this));

      // Drop events
      el.addEventListener('dragover', this.handleDragOver.bind(this));
      el.addEventListener('dragleave', this.handleDragLeave.bind(this));
      el.addEventListener('drop', this.handleDrop.bind(this));

      // Click events
      el.addEventListener('click', this.handleElementClick.bind(this));
    });

    this.updateDebug(`Event listeners registered: ${draggableElements.length} elements`);
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
    if (!this.draggedElement.classList.contains('draggable')) {
      this.draggedElement = this.draggedElement.closest('.draggable') as HTMLElement;
    }

    if (!this.draggedElement) return;

    this.deselectElement();
    this.draggedElement.classList.add('dragging');
    this.draggedElement.style.cursor = 'grabbing';

    e.dataTransfer!.effectAllowed = 'move';
    e.dataTransfer!.setData('text/html', this.draggedElement.outerHTML);

    this.updateDebug(`Drag start: ${this.draggedElement.id || 'unnamed'}`);
  }

  private handleDragEnd(e: DragEvent): void {
    if (this.draggedElement) {
      this.draggedElement.classList.remove('dragging');
      this.draggedElement.style.cursor = '';
      this.draggedElement.style.opacity = '';
      this.draggedElement.draggable = false;
    }

    this.clearHighlights();
    this.draggedElement = null;
    this.isDragReady = false;
    this.updateDebug('Drag end');
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

    // draggable 요소에 드롭하는 경우 - 위치에 따른 가이드 표시
    if (target.classList.contains('draggable')) {
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

    if (dropZone.classList.contains('draggable')) {
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
    e.stopPropagation();
    const target = e.target as HTMLElement;
    const draggable = target.closest('.draggable') as HTMLElement;

    if (draggable) {
      if (this.selectedElement === draggable) {
        this.deselectElement();
      } else {
        this.selectElement(draggable);
      }
    } else if (target === this.container) {
      if (this.selectedElement === this.container) {
        this.deselectElement();
      } else {
        this.selectElement(this.container);
      }
    }
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

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'action-btn delete';
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.title = '삭제';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      this.deleteSelectedElement();
    };

    // Add child button
    const addChildBtn = document.createElement('button');
    addChildBtn.className = 'action-btn add-child';
    addChildBtn.innerHTML = '➕';
    addChildBtn.title = '자식 요소 추가';
    addChildBtn.onclick = (e) => {
      e.stopPropagation();
      this.addChildElement();
    };

    buttonsContainer.appendChild(deleteBtn);
    buttonsContainer.appendChild(addChildBtn);
    element.appendChild(buttonsContainer);
  }

  private addContainerButtons(element: HTMLElement): void {
    this.removeActionButtons(element);

    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'action-buttons';

    // Add item button
    const addItemBtn = document.createElement('button');
    addItemBtn.className = 'action-btn root-add';
    addItemBtn.innerHTML = '➕';
    addItemBtn.title = '새 요소 추가';
    addItemBtn.onclick = (e) => {
      e.stopPropagation();
      this.addNewItem();
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

    const title = this.propertyPanel.querySelector('#selectedElementTitle') as HTMLElement;
    title.innerHTML = `🎯 <${element.tagName.toLowerCase()}> ${element.id ? `#${element.id}` : ''}`;

    const tagNameInput = this.propertyPanel.querySelector('#tagNameInput') as HTMLInputElement;
    tagNameInput.value = element.tagName.toLowerCase();

    this.updateAttributesList(element);
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
    newItem.className = 'draggable';
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
    newChild.className = 'draggable';
    newChild.id = newId;
    newChild.textContent = `📄 새 자식 ${this.itemCounter - 1000}`;

    this.selectedElement.appendChild(newChild);
    this.reinitializeDragAndDrop();
    this.updateDebug(`Added child: ${newId}`);
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
        document.body.appendChild(this.propertyPanel);
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
      // container 내부의 편집 가능한 요소들만 제거 (debug element 제외)
      const elementsToRemove = Array.from(this.container.children).filter(
        child => !child.classList.contains('debug')
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
      element.className = 'draggable';
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
  public loadContent(content: string | ElementData): void {
    // debug element를 제외한 모든 요소 제거
    const elementsToRemove = Array.from(this.container.children).filter(
      child => !child.classList.contains('debug')
    );
    elementsToRemove.forEach(el => el.remove());

    if (typeof content === 'string') {
      // HTML 문자열을 임시 div에 파싱한 후 요소들을 추가
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      Array.from(tempDiv.children).forEach(child => {
        this.container.appendChild(child);
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
    // container의 편집 가능한 내용만 반환 (debug element 제외)
    const tempDiv = document.createElement('div');
    Array.from(this.container.children).forEach(child => {
      if (!child.classList.contains('debug')) {
        tempDiv.appendChild(child.cloneNode(true));
      }
    });
    return tempDiv.innerHTML;
  }

  public exportData(): ElementData {
    // container 자체를 export (debug element 제외)
    const containerData = this.elementToData(this.container);

    // children에서 debug element 제거
    if (containerData.children) {
      containerData.children = containerData.children.filter(child =>
        child.className !== 'debug'
      );
    }

    return containerData;
  }

  public importData(data: ElementData): void {
    // debug element 백업
    const debugElement = this.container.querySelector('.debug');

    // container 내용 교체
    this.container.innerHTML = '';

    // 새로운 내용 추가
    if (data.children) {
      data.children.forEach(childData => {
        const element = this.dataToElement(childData);
        this.container.appendChild(element);
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

  private elementToData(element: HTMLElement): ElementData {
    const data: ElementData = {
      tagName: element.tagName.toLowerCase(),
      id: element.id || undefined,
      className: element.className || undefined,
      textContent: element.textContent || undefined,
      attributes: {},
      children: []
    };

    // Get attributes
    for (let attr of element.attributes) {
      if (attr.name !== 'class' && attr.name !== 'id') {
        data.attributes![attr.name] = attr.value;
      }
    }

    // Get children
    const children = Array.from(element.children) as HTMLElement[];
    data.children = children.map(child => this.elementToData(child));

    return data;
  }

  private dataToElement(data: ElementData): HTMLElement {
    const element = document.createElement(data.tagName);

    if (data.id) element.id = data.id;
    if (data.className) element.className = data.className;
    if (data.textContent) element.textContent = data.textContent;

    // Set attributes
    if (data.attributes) {
      Object.entries(data.attributes).forEach(([name, value]) => {
        element.setAttribute(name, value);
      });
    }

    // Add children
    if (data.children) {
      data.children.forEach(childData => {
        const childElement = this.dataToElement(childData);
        element.appendChild(childElement);
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