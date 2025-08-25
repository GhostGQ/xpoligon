import { useEffect, useRef } from 'react';
import type { Polygon } from '../../entities';

interface UseAutoSaveProps {
  polygons: Polygon[];
  cameraId: string;
  savePolygons: (polygons: Polygon[], imageWidth?: number, imageHeight?: number) => Promise<any>;
  imageWidth?: number;
  imageHeight?: number;
  delay?: number;
}

export const useAutoSave = ({ polygons, cameraId, savePolygons, imageWidth, imageHeight, delay = 500 }: UseAutoSaveProps) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    // Пропускаем первую загрузку (когда полигоны загружаются из API)
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
      if (cameraId) {
        savePolygons(polygons, imageWidth, imageHeight).catch(error => {
          console.error('Auto-save error:', error);
        });
      }
    }, delay);

    // Очистка при размонтировании
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [polygons, cameraId, savePolygons, imageWidth, imageHeight, delay]);

  // Сброс флага при изменении камеры
  useEffect(() => {
    isInitialLoad.current = true;
  }, [cameraId]);
};
