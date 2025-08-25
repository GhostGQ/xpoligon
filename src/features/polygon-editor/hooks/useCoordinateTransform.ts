import { useCallback } from 'react';
import type { Point, RelativePoint, ImageInfo, CanvasDimensions } from '../../../shared/types';

interface UseCoordinateTransformProps {
  imageInfo: ImageInfo | null;
  canvasDimensions: CanvasDimensions;
}

export const useCoordinateTransform = ({ imageInfo, canvasDimensions }: UseCoordinateTransformProps) => {
  const absoluteToRelative = useCallback((point: Point): RelativePoint => {
    if (!imageInfo) {
      // Если нет изображения, используем координаты canvas как есть
      return { 
        x: point.x / canvasDimensions.width, 
        y: point.y / canvasDimensions.height 
      };
    }
    
    const scaledWidth = imageInfo.width * imageInfo.scale;
    const scaledHeight = imageInfo.height * imageInfo.scale;
    
    const relativeX = (point.x - imageInfo.offsetX) / scaledWidth;
    const relativeY = (point.y - imageInfo.offsetY) / scaledHeight;
    
    return {
      x: Math.max(0, Math.min(1, relativeX)),
      y: Math.max(0, Math.min(1, relativeY))
    };
  }, [imageInfo, canvasDimensions]);

  const relativeToAbsolute = useCallback((point: RelativePoint): Point => {
    if (!imageInfo) {
      // Если нет изображения, используем координаты canvas как есть
      return { 
        x: point.x * canvasDimensions.width, 
        y: point.y * canvasDimensions.height 
      };
    }
    
    const scaledWidth = imageInfo.width * imageInfo.scale;
    const scaledHeight = imageInfo.height * imageInfo.scale;
    
    return {
      x: imageInfo.offsetX + point.x * scaledWidth,
      y: imageInfo.offsetY + point.y * scaledHeight
    };
  }, [imageInfo, canvasDimensions]);

  const isPointInImageBounds = useCallback((point: Point): boolean => {
    if (!imageInfo) return true; // Если нет изображения, разрешаем везде
    
    const scaledWidth = imageInfo.width * imageInfo.scale;
    const scaledHeight = imageInfo.height * imageInfo.scale;
    
    return point.x >= imageInfo.offsetX && 
           point.x <= imageInfo.offsetX + scaledWidth &&
           point.y >= imageInfo.offsetY && 
           point.y <= imageInfo.offsetY + scaledHeight;
  }, [imageInfo]);

  return {
    absoluteToRelative,
    relativeToAbsolute,
    isPointInImageBounds
  };
};
