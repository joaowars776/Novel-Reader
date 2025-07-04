/**
 * Drag and Drop Controller
 * Manages drag and drop behavior to prevent unwanted popups while maintaining functionality
 */

interface DragDropConfig {
  enableDragOverlay?: boolean;
  allowedFileTypes?: string[];
  preventDefaultDragBehavior?: boolean;
}

class DragDropController {
  private config: DragDropConfig;
  private isDragActive: boolean = false;
  private dragCounter: number = 0;
  private originalDragHandlers: Map<Element, any> = new Map();

  constructor(config: DragDropConfig = {}) {
    this.config = {
      enableDragOverlay: false,
      allowedFileTypes: ['.epub'],
      preventDefaultDragBehavior: true,
      ...config
    };
  }

  /**
   * Initialize the drag drop controller
   */
  public init(): void {
    this.attachGlobalListeners();
    this.disableDefaultDragBehavior();
  }

  /**
   * Destroy the controller and cleanup listeners
   */
  public destroy(): void {
    this.removeGlobalListeners();
    this.restoreDefaultDragBehavior();
  }

  /**
   * Attach global drag and drop event listeners
   */
  private attachGlobalListeners(): void {
    // Prevent default drag behavior on document level
    document.addEventListener('dragover', this.handleDocumentDragOver, { passive: false });
    document.addEventListener('drop', this.handleDocumentDrop, { passive: false });
    document.addEventListener('dragenter', this.handleDocumentDragEnter, { passive: false });
    document.addEventListener('dragleave', this.handleDocumentDragLeave, { passive: false });

    // Prevent drag start on images and other elements
    document.addEventListener('dragstart', this.handleDragStart, { passive: false });
  }

  /**
   * Remove global event listeners
   */
  private removeGlobalListeners(): void {
    document.removeEventListener('dragover', this.handleDocumentDragOver);
    document.removeEventListener('drop', this.handleDocumentDrop);
    document.removeEventListener('dragenter', this.handleDocumentDragEnter);
    document.removeEventListener('dragleave', this.handleDocumentDragLeave);
    document.removeEventListener('dragstart', this.handleDragStart);
  }

  /**
   * Handle document-level drag over events
   */
  private handleDocumentDragOver = (e: DragEvent): void => {
    if (this.config.preventDefaultDragBehavior) {
      // Only prevent default if not over a designated drop zone
      const target = e.target as Element;
      if (!this.isValidDropZone(target)) {
        e.preventDefault();
        e.stopPropagation();
        
        // Set dropEffect to none to show "not allowed" cursor
        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = 'none';
        }
      }
    }
  };

  /**
   * Handle document-level drop events
   */
  private handleDocumentDrop = (e: DragEvent): void => {
    const target = e.target as Element;
    
    // Only prevent default if not over a designated drop zone
    if (!this.isValidDropZone(target)) {
      e.preventDefault();
      e.stopPropagation();
    }

    this.resetDragState();
  };

  /**
   * Handle document-level drag enter events
   */
  private handleDocumentDragEnter = (e: DragEvent): void => {
    e.preventDefault();
    this.dragCounter++;
    
    const target = e.target as Element;
    if (!this.isValidDropZone(target) && this.config.preventDefaultDragBehavior) {
      e.stopPropagation();
    }
  };

  /**
   * Handle document-level drag leave events
   */
  private handleDocumentDragLeave = (e: DragEvent): void => {
    e.preventDefault();
    this.dragCounter--;
    
    if (this.dragCounter <= 0) {
      this.resetDragState();
    }
  };

  /**
   * Handle drag start events to prevent unwanted dragging
   */
  private handleDragStart = (e: DragEvent): void => {
    const target = e.target as Element;
    
    // Prevent dragging of images, text, and other elements unless explicitly allowed
    if (target.tagName === 'IMG' || 
        target.tagName === 'A' || 
        target.hasAttribute('draggable') === false ||
        target.closest('[data-no-drag]')) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  /**
   * Check if the target is a valid drop zone
   */
  private isValidDropZone(target: Element): boolean {
    // Check if target or any parent has drag-drop related classes or attributes
    const dropZoneSelectors = [
      '[data-drop-zone]',
      '.drop-zone',
      '.book-uploader',
      '.drag-drop-area',
      '[onDrop]',
      '[onDragOver]'
    ];

    return dropZoneSelectors.some(selector => 
      target.matches?.(selector) || target.closest?.(selector)
    );
  }

  /**
   * Reset drag state
   */
  private resetDragState(): void {
    this.isDragActive = false;
    this.dragCounter = 0;
  }

  /**
   * Disable default browser drag and drop behavior
   */
  private disableDefaultDragBehavior(): void {
    // Disable drag and drop on the entire document
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    
    // Add CSS to prevent text selection during drag
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-user-drag: none;
        -khtml-user-drag: none;
        -moz-user-drag: none;
        -o-user-drag: none;
        user-drag: none;
      }
      
      [data-drop-zone] {
        -webkit-user-drag: auto !important;
        -khtml-user-drag: auto !important;
        -moz-user-drag: auto !important;
        -o-user-drag: auto !important;
        user-drag: auto !important;
      }
      
      .no-drag-overlay::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: transparent;
        z-index: 9999;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Restore default drag behavior
   */
  private restoreDefaultDragBehavior(): void {
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
    
    // Remove custom styles
    const customStyles = document.head.querySelectorAll('style[data-drag-controller]');
    customStyles.forEach(style => style.remove());
  }

  /**
   * Enable drag and drop for specific elements
   */
  public enableDragForElement(element: Element): void {
    element.setAttribute('data-drop-zone', 'true');
    (element as HTMLElement).style.webkitUserDrag = 'auto';
    (element as HTMLElement).style.userDrag = 'auto';
  }

  /**
   * Disable drag and drop for specific elements
   */
  public disableDragForElement(element: Element): void {
    element.removeAttribute('data-drop-zone');
    element.setAttribute('data-no-drag', 'true');
    (element as HTMLElement).style.webkitUserDrag = 'none';
    (element as HTMLElement).style.userDrag = 'none';
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<DragDropConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export singleton instance
export const dragDropController = new DragDropController({
  enableDragOverlay: false,
  allowedFileTypes: ['.epub'],
  preventDefaultDragBehavior: true
});

// Export class for custom instances
export { DragDropController };
export type { DragDropConfig };