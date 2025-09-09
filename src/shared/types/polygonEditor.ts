import type { Camera } from '../../entities/camera';
import type { Workplace } from '../../entities/workplace';
import type { Polygon } from '../../entities/polygon';

// Данные, которые редактор принимает извне
// polygons: Polygon[] — точки должны быть в абсолютных координатах (пиксели относительно изображения)
export interface PolygonEditorData {
  camera: Camera;
  workplaces: Workplace[];
  polygons: Polygon[]; // абсолютные координаты (pixels)
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
  onSave?: (data: PolygonEditorSaveData) => void | Promise<void>; // ручное сохранение по кнопке
  onChange?: (polygons: Polygon[]) => void; // отслеживание изменений полигонов
  onError?: (error: string) => void;

  // Debug mode
  debug?: boolean; // если true, активен console.log
}
