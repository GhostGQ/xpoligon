import { useState, useEffect, useCallback } from 'react';
import type { Polygon, TableItem, CameraResponse } from '../types';
import { createMockTableItems } from '../../entities/table';
import { CameraStorageService } from '../lib/camera-storage';

export interface UseCameraDataProps {
  cameraId: string;
  initialData?: CameraResponse;
}

export interface UseCameraDataReturn {
  polygons: Polygon[];
  setPolygons: React.Dispatch<React.SetStateAction<Polygon[]>>;
  tableItems: TableItem[];
  setTableItems: React.Dispatch<React.SetStateAction<TableItem[]>>;
  isLoading: boolean;
  lastSaved: string | null;
  saveToStorage: () => void;
  clearStorage: () => void;
}

export const useCameraData = ({ 
  cameraId, 
  initialData 
}: UseCameraDataProps): UseCameraDataReturn => {
  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const [tableItems, setTableItems] = useState<TableItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Загрузка данных при первом рендере
  useEffect(() => {
    const loadData = async () => {
      console.log(`🔄 Загрузка данных для камеры ${cameraId}...`);
      
      // Сначала пытаемся загрузить из localStorage
      const localData = CameraStorageService.loadCameraData(cameraId);
      
      if (localData) {
        setPolygons(localData.polygons);
        setTableItems(localData.tableItems);
        setLastSaved(localData.lastSaved);
        console.log(`✅ Данные загружены из localStorage для камеры ${cameraId}`);
      } else if (initialData) {
        // Если нет локальных данных, используем данные с сервера
        setPolygons(initialData.polygons || []);
        setTableItems(initialData.tableItems || createMockTableItems());
        console.log(`✅ Данные загружены с сервера для камеры ${cameraId}`);
      } else {
        // Если нет никаких данных, используем моковые данные
        setPolygons([]);
        setTableItems(createMockTableItems());
        console.log(`✅ Использованы моковые данные для камеры ${cameraId}`);
      }
      
      setIsLoading(false);
    };

    if (cameraId) {
      loadData();
    }
  }, [cameraId, initialData]);

  // Автоматическое сохранение при изменении данных
  useEffect(() => {
    if (!isLoading && polygons.length > 0 && cameraId) {
      const timeoutId = setTimeout(() => {
        CameraStorageService.saveCameraData(cameraId, polygons, tableItems);
        setLastSaved(new Date().toISOString());
      }, 1000); // Автосохранение через 1 секунду после изменения

      return () => clearTimeout(timeoutId);
    }
  }, [polygons, tableItems, cameraId, isLoading]);

  const saveToStorage = useCallback(() => {
    if (cameraId) {
      CameraStorageService.saveCameraData(cameraId, polygons, tableItems);
      setLastSaved(new Date().toISOString());
    }
  }, [cameraId, polygons, tableItems]);

  const clearStorage = useCallback(() => {
    if (cameraId) {
      CameraStorageService.clearCameraData(cameraId);
      setPolygons([]);
      setTableItems(createMockTableItems());
      setLastSaved(null);
    }
  }, [cameraId]);

  return {
    polygons,
    setPolygons,
    tableItems,
    setTableItems,
    isLoading,
    lastSaved,
    saveToStorage,
    clearStorage,
  };
};
