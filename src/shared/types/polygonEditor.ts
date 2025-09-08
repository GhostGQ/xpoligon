import type { Camera } from '../../entities/camera';
import type { Workplace } from '../../entities/workplace';
import type { Polygon } from '../../entities/polygon';

// Данные, которые редактор принимает извне
export interface PolygonEditorData {
  camera: Camera;
  workplaces: Workplace[];
  polygons: Polygon[];
}

// Данные, которые редактор возвращает при сохранении
export interface PolygonEditorSaveData {
  cameraId: string;
  imageSize: {
    width: number;
    height: number;
  };
  regions: Array<{
    id: string;
    linkedWorkplace: string | null;
    relativeCoordinates: Array<{ x: number; y: number }>; // 0-1
    pixelCoordinates: Array<{ x: number; y: number }>; // пиксели относительно оригинального изображения
    closed: boolean;
  }>;
  timestamp: string;
}

// Пропсы для редактора полигонов
export interface PolygonEditorProps {
  data: PolygonEditorData;
  loading?: boolean;
  onSave?: (data: PolygonEditorSaveData) => void | Promise<void>;
  onChange?: (polygons: Polygon[]) => void; // вызывается при любом изменении полигонов
  onError?: (error: string) => void;
  autoSaveDelay?: number; // задержка автосохранения в мс, по умолчанию 1000

  // Настройки localStorage
  enableLocalStorage?: boolean; // включить сохранение в localStorage, по умолчанию true
  localStorageKey?: string; // ключ для localStorage, по умолчанию 'polygon-editor'
  localStorageDelay?: number; // задержка сохранения в localStorage в мс, по умолчанию 500

  // Debug mode
  debug?: boolean; // если true, активен console.log
}
