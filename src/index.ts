// Основные экспорты библиотеки полигонального редактора
export { PolygonEditorPage } from './pages/polygon-editor';

// Экспорт типов для использования библиотеки
export type {
  PolygonEditorProps,
  PolygonEditorData,
  Camera,
  Workplace,
  Polygon,
  Point,
  ImageInfo,
} from './shared/types';

// Экспорт утилит
export {
  generateId,
  useImageProcessing,
  useCanvasDimensions,
  usePolygonChanges,
} from './shared/lib';

// Экспорт UI компонентов
export {
  Button,
  Loading,
} from './shared/ui';

// Экспорт фич
export { usePolygonLinking } from './features/polygon-linking';

// Экспорт виджетов (если нужно кастомизировать)
export { PolygonCanvas } from './widgets/polygon-canvas';
export { ItemsPanel } from './widgets/items-panel';
