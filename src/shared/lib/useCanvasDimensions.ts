import { useState, useEffect } from 'react';
import type { CanvasDimensions } from '../../shared/types';

export const useCanvasDimensions = (): CanvasDimensions => {
  const [canvasDimensions, setCanvasDimensions] = useState<CanvasDimensions>({ width: 800, height: 600 });

  useEffect(() => {
    const updateCanvasSize = () => {
      const sidebar = 320; // ширина боковой панели + отступы
      const padding = 32; // общие отступы
      const availableWidth = window.innerWidth - sidebar - padding;
      const availableHeight = window.innerHeight - 150; // оставляем место для заголовка и статуса
      
      setCanvasDimensions({
        width: Math.max(640, availableWidth),
        height: Math.max(480, availableHeight)
      });
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  return canvasDimensions;
};
