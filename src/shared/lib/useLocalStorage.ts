import { useEffect, useRef } from 'react';
import type { Polygon } from '../../entities/polygon';

interface UseLocalStorageProps {
  polygons: Polygon[];
  setPolygons: React.Dispatch<React.SetStateAction<Polygon[]>>;
  initialPolygons: Polygon[]; // полигоны из пропсов
  cameraId: string;
  enabled?: boolean;
  storageKey?: string;
  autoSaveDelay?: number;
}

export const useLocalStorage = ({
  polygons,
  setPolygons,
  initialPolygons,
  cameraId,
  enabled = true,
  storageKey = 'polygon-editor',
  autoSaveDelay = 1000
}: UseLocalStorageProps) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoad = useRef(true);
  const hasLoadedFromStorage = useRef(false);
  const lastCameraId = useRef(cameraId);

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

  // Загрузка данных при смене камеры или первом рендере
  useEffect(() => {
    if (!cameraId) return;

    // Если камера изменилась, сбрасываем флаги
    if (lastCameraId.current !== cameraId) {
      hasLoadedFromStorage.current = false;
      isInitialLoad.current = true;
      lastCameraId.current = cameraId;
    }

    // Сначала сохраняем данные из пропсов в localStorage (если они есть)
    if (initialPolygons && initialPolygons.length > 0) {
      console.debug(`Saving ${initialPolygons.length} polygons from props to localStorage for camera ${cameraId}`);
      saveToLocalStorage(initialPolygons);
    }

    // Затем загружаем данные из localStorage в редактор
    if (!hasLoadedFromStorage.current) {
      const savedPolygons = loadFromLocalStorage();
      if (savedPolygons && savedPolygons.length > 0) {
        console.debug(`Loading ${savedPolygons.length} polygons from localStorage to editor for camera ${cameraId}`);
        setPolygons(savedPolygons);
      } else if (initialPolygons && initialPolygons.length > 0) {
        // Если в localStorage ничего нет, используем данные из пропсов
        console.debug(`No localStorage data, using ${initialPolygons.length} polygons from props for camera ${cameraId}`);
        setPolygons(initialPolygons);
      }

      hasLoadedFromStorage.current = true;
      isInitialLoad.current = false;
    }
  }, [cameraId, initialPolygons, enabled, setPolygons, storageKey]);

  // Отдельный эффект для синхронизации пропсов с localStorage
  useEffect(() => {
    if (!enabled || !cameraId || !initialPolygons) return;

    // Сохраняем данные из пропсов в localStorage при их изменении
    if (initialPolygons.length > 0) {
      console.debug(`Syncing ${initialPolygons.length} polygons from props to localStorage for camera ${cameraId}`);
      saveToLocalStorage(initialPolygons);
      
      // Также обновляем состояние редактора, если это новые данные
      setPolygons(initialPolygons);
    }
  }, [initialPolygons, cameraId, enabled, setPolygons, storageKey]);

  // Автосохранение изменений из редактора
  // Автосохранение изменений из редактора
  useEffect(() => {
    // Пропускаем первую загрузку
    if (isInitialLoad.current) {
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

  return {
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorage,
  };
};
