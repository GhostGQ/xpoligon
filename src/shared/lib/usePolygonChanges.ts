import { useEffect, useRef } from 'react';
import type { Polygon } from '../../entities/polygon';
import type { PolygonEditorSaveData } from '../types';

interface UsePolygonChangesProps {
  polygons: Polygon[];
  cameraId: string;
  imageWidth?: number;
  imageHeight?: number;
  onChange?: (polygons: Polygon[]) => void;
  onSave?: (data: PolygonEditorSaveData) => void | Promise<void>;
  autoSaveDelay?: number;
}

export const usePolygonChanges = ({
  polygons,
  cameraId,
  imageWidth,
  imageHeight,
  onChange,
  onSave,
  autoSaveDelay = 1000
}: UsePolygonChangesProps) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoad = useRef(true);

  // Вызываем onChange при любом изменении полигонов
  useEffect(() => {
    if (!isInitialLoad.current) {
      onChange?.(polygons);
    }
  }, [polygons, onChange]);

  // Автосохранение с задержкой
  useEffect(() => {
    // Пропускаем первую загрузку
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    // Очищаем предыдущий таймер
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Устанавливаем новый таймер для автосохранения
    timeoutRef.current = setTimeout(() => {
      if (onSave && imageWidth && imageHeight) {
        const saveData: PolygonEditorSaveData = {
          cameraId,
          imageSize: {
            width: imageWidth,
            height: imageHeight,
          },
          regions: polygons.map(p => ({
            id: p.id,
            linkedWorkplace: p.linkedWorkplace,
            relativeCoordinates: p.points,
            pixelCoordinates: p.points.map(point => ({
              x: Math.round(point.x * imageWidth),
              y: Math.round(point.y * imageHeight),
            })),
            closed: p.closed,
          })),
          timestamp: new Date().toISOString(),
        };

        try {
          onSave(saveData);
        } catch (error) {
          console.error('Auto-save error:', error);
        }
      }
    }, autoSaveDelay);

    // Очистка при размонтировании
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [polygons, cameraId, imageWidth, imageHeight, onSave, autoSaveDelay]);

  // Сброс флага при изменении камеры
  useEffect(() => {
    isInitialLoad.current = true;
  }, [cameraId]);
};
