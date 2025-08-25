import type { Camera } from '../../entities/camera';
import type { Workplace } from '../../entities/workplace';
import type { Polygon } from '../../entities/polygon';

// Моковые данные камер
const mockCameras: Camera[] = [
  {
    id: 'cam1',
    name: 'Камера 1 - Основной зал',
    screenshot: '/src/shared/assets/camera-test.jpg',
    isActive: true,
  },
  {
    id: 'cam2',
    name: 'Камера 2 - VIP зона',
    screenshot: '/src/shared/assets/camera-test.jpg',
    isActive: false,
  },
  {
    id: 'cam3',
    name: 'Камера 3 - Терраса',
    screenshot: '/src/shared/assets/camera-test.jpg',
    isActive: true,
  },
];

// Моковые данные рабочих мест для разных камер
const mockWorkplaces: Record<string, Workplace[]> = {
  cam1: [
    { id: 'wp1-1', name: 'Стол № 1' },
    { id: 'wp1-2', name: 'Стол № 2' },
    { id: 'wp1-3', name: 'Стол № 3' },
    { id: 'wp1-4', name: 'Стол № 4' },
    { id: 'wp1-5', name: 'Стол № 5' },
    { id: 'wp1-6', name: 'Стол № 6' },
    { id: 'wp1-7', name: 'Стол № 7' },
    { id: 'wp1-8', name: 'Стол № 8' },
  ],
  cam2: [
    { id: 'wp2-1', name: 'VIP стол № 1' },
    { id: 'wp2-2', name: 'VIP стол № 2' },
  ],
  cam3: [
    { id: 'wp3-1', name: 'Терраса стол № 1' },
    { id: 'wp3-2', name: 'Терраса стол № 2' },
    { id: 'wp3-3', name: 'Терраса стол № 3' },
  ],
};

// Функции для работы с localStorage
const STORAGE_KEY_PREFIX = 'polygon_editor_';

const getPolygonsFromStorage = (cameraId: string): Polygon[] => {
  try {
    const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}${cameraId}`);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading polygons from localStorage:', error);
    return [];
  }
};

const savePolygonsToStorage = (cameraId: string, polygons: Polygon[]): void => {
  try {
    if (polygons.length === 0) {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${cameraId}`);
    } else {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${cameraId}`, JSON.stringify(polygons));
    }
  } catch (error) {
    console.error('Error saving polygons to localStorage:', error);
  }
};

// API функции
export const cameraApi = {
  // Получить список всех камер
  getCameras: async (): Promise<Camera[]> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // имитация запроса
    return mockCameras;
  },

  // Получить данные конкретной камеры
  getCameraById: async (cameraId: string): Promise<Camera | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCameras.find(cam => cam.id === cameraId) || null;
  },

  // Получить рабочие места для камеры
  getWorkplacesByCamera: async (cameraId: string): Promise<Workplace[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockWorkplaces[cameraId] || [];
  },

  // Получить полигоны для камеры
  getPolygonsByCamera: async (cameraId: string): Promise<Polygon[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return getPolygonsFromStorage(cameraId);
  },

  // Сохранить полигоны для камеры
  savePolygonsForCamera: async (
    cameraId: string, 
    polygons: Polygon[], 
    imageWidth?: number, 
    imageHeight?: number
  ): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // имитация запроса на сервер
    
    // Сохраняем в localStorage
    savePolygonsToStorage(cameraId, polygons);
    
    // Функция для преобразования относительных координат в пиксельные
    const convertToPixels = (relativePoints: Array<{x: number, y: number}>) => {
      if (!imageWidth || !imageHeight) {
        return relativePoints; // Если нет размеров изображения, возвращаем как есть
      }
      
      return relativePoints.map(point => ({
        x: Math.round(point.x * imageWidth),
        y: Math.round(point.y * imageHeight)
      }));
    };
    
    console.log(`Сохранение полигонов для камеры ${cameraId}:`, {
      cameraId,
      imageSize: imageWidth && imageHeight ? `${imageWidth}x${imageHeight}px` : 'unknown',
      regions: polygons.map(p => ({
        id: p.id,
        linkedWorkplace: p.linkedWorkplace,
        pixelCoordinates: convertToPixels(p.points),
        closed: p.closed,
      })),
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      message: `Полигоны для камеры ${cameraId} успешно сохранены`
    };
  },
};
