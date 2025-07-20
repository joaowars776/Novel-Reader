import { useEffect, useRef } from 'react';
import { dragDropController, DragDropController, type DragDropConfig } from '../utils/dragDropController';

/**
 * Hook to manage drag and drop behavior in React components
 */
export const useDragDropController = (config?: DragDropConfig) => {
  const controllerRef = useRef<DragDropController | null>(null);

  useEffect(() => {
    // Use singleton instance or create new one with custom config
    const controller = config ? new DragDropController(config) : dragDropController;
    controllerRef.current = controller;

    // Initialize the controller
    controller.init();

    // Cleanup on unmount
    return () => {
      if (config) {
        // Only destroy if we created a custom instance
        controller.destroy();
      }
    };
  }, [config]);

  return {
    enableDragForElement: (element: Element) => {
      controllerRef.current?.enableDragForElement(element);
    },
    disableDragForElement: (element: Element) => {
      controllerRef.current?.disableDragForElement(element);
    },
    updateConfig: (newConfig: Partial<DragDropConfig>) => {
      controllerRef.current?.updateConfig(newConfig);
    }
  };
};
