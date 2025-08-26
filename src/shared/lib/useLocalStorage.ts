import { useEffect, useRef } from 'react';
import type { Polygon } from '../../entities/polygon';

interface UseLocalStorageProps {
  polygons: Polygon[];
  setPolygons: React.Dispatch<React.SetStateAction<Polygon[]>>;
  cameraId: string;
  enabled?: boolean;
  storageKey?: string;
  autoSaveDelay?: number;
}

export const useLocalStorage = ({
  polygons,
  setPolygons,
  cameraId,
  enabled = true,
  storageKey = 'polygon-editor',
  autoSaveDelay = 1000
}: UseLocalStorageProps) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoad = useRef(true);
  const hasLoaded = useRef(false);

  // Функция для сохранения в localStorage
  const saveToLocalStorage = (polygonsToSave: Polygon[]) => {
    if (!enabled) return;
    
    try {
      const key = `${storageKey}-${cameraId}`;
      const dataToSave = {
        cameraId,
        polygons: polygonsToSave,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify(dataToSave));
      console.debug(`Saved ${polygonsToSave.length} polygons to localStorage for camera ${cameraId}`);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  };

  // Функция для загрузки из localStorage
  const loadFromLocalStorage = (): Polygon[] | null => {
    if (!enabled) return null;
    
    try {
      const key = `${storageKey}-${cameraId}`;
      const saved = localStorage.getItem(key);
      
      if (!saved) return null;
      
      const data = JSON.parse(saved);
      
      // Проверяем структуру данных
      if (data && Array.isArray(data.polygons) && data.cameraId === cameraId) {
        console.debug(`Loaded ${data.polygons.length} polygons from localStorage for camera ${cameraId}`);
        return data.polygons;
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
    
    return null;
  };

  // Функция для очистки localStorage для текущей камеры
  const clearLocalStorage = () => {
    if (!enabled) return;
    
    try {
      const key = `${storageKey}-${cameraId}`;
      localStorage.removeItem(key);
      console.debug(`Cleared localStorage for camera ${cameraId}`);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  };

  // Загрузка данных при первом рендере или смене камеры
  useEffect(() => {
    if (!cameraId || hasLoaded.current) return;
    
    const savedPolygons = loadFromLocalStorage();
    if (savedPolygons && savedPolygons.length > 0) {
      setPolygons(savedPolygons);
    }
    
    hasLoaded.current = true;
    isInitialLoad.current = false;
  }, [cameraId, enabled, setPolygons, storageKey]);

  // Автосохранение с задержкой
  useEffect(() => {
    // Пропускаем первую загрузку (когда полигоны загружаются из localStorage или props)
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
      saveToLocalStorage(polygons);
    }, autoSaveDelay);

    // Очистка при размонтировании
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [polygons, cameraId, enabled, storageKey, autoSaveDelay]);

  // Сброс состояния при изменении камеры
  useEffect(() => {
    hasLoaded.current = false;
    isInitialLoad.current = true;
  }, [cameraId]);

  return {
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorage,
  };
};
