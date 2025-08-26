# Polygon Editor Library

Библиотека для создания и редактирования полигональных областей на изображениях с привязкой к рабочим местам.

## Основные возможности

- ✅ Рисование полигонов на изображении
- ✅ Привязка полигонов к рабочим местам  
- ✅ Относительная система координат (0-1)
- ✅ Пиксельные координаты для сервера
- ✅ Автосохранение изменений
- ✅ TypeScript поддержка
- ✅ Feature-Sliced Design архитектура

## Установка

```bash
npm install polygon-editor
```

## Использование

### Базовое использование

```tsx
import { PolygonEditorPage } from 'polygon-editor';
import type { PolygonEditorData } from 'polygon-editor';

const MyApp = () => {
  const data: PolygonEditorData = {
    camera: {
      id: 'cam1',
      name: 'Основная камера',
      screenshot: '/path/to/image.jpg',
      isActive: true,
    },
    workplaces: [
      { id: 'wp1', name: 'Стол №1' },
      { id: 'wp2', name: 'Стол №2' },
    ],
    polygons: [], // Существующие полигоны
  };

  const handleSave = (saveData) => {
    console.log('Сохранение данных:', saveData);
    // Отправить на сервер
  };

  const handleChange = (polygons) => {
    console.log('Полигоны изменились:', polygons);
  };

  return (
    <PolygonEditorPage
      data={data}
      onSave={handleSave}
      onChange={handleChange}
      autoSaveDelay={1500}
    />
  );
};
```

### Продвинутое использование с API

```tsx
import React, { useState, useEffect } from 'react';
import { PolygonEditorPage, cameraApi } from 'polygon-editor';
import type { PolygonEditorData } from 'polygon-editor';

const CameraEditor = ({ cameraId }) => {
  const [data, setData] = useState<PolygonEditorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [camera, workplaces, polygons] = await Promise.all([
        cameraApi.getCameraById(cameraId),
        cameraApi.getWorkplacesByCamera(cameraId),
        cameraApi.getPolygonsByCamera(cameraId),
      ]);
      
      setData({ camera, workplaces, polygons });
      setLoading(false);
    };

    loadData();
  }, [cameraId]);

  if (!data) return <div>Loading...</div>;

  return (
    <PolygonEditorPage
      data={data}
      loading={loading}
      onSave={async (saveData) => {
        await cameraApi.savePolygonsForCamera(
          saveData.cameraId,
          saveData.regions
        );
      }}
      onError={(error) => console.error(error)}
    />
  );
};
```

## API

### PolygonEditorProps

```typescript
interface PolygonEditorProps {
  data: PolygonEditorData;           // Данные камеры, рабочих мест и полигонов
  loading?: boolean;                 // Состояние загрузки
  onSave?: (data: SaveData) => void; // Callback для сохранения
  onChange?: (polygons: Polygon[]) => void; // Callback при изменении
  onError?: (error: string) => void; // Callback при ошибках
  autoSaveDelay?: number;           // Задержка автосохранения (мс)
}
```

### PolygonEditorData

```typescript
interface PolygonEditorData {
  camera: Camera;           // Данные камеры с изображением
  workplaces: Workplace[];  // Список рабочих мест
  polygons: Polygon[];      // Существующие полигоны
}
```

### Типы данных

```typescript
interface Camera {
  id: string;
  name: string;
  screenshot: string;  // URL изображения
  isActive: boolean;
}

interface Workplace {
  id: string;
  name: string;
}

interface Polygon {
  id: string;
  points: Point[];          // Относительные координаты (0-1)
  linkedWorkplace?: string; // ID связанного рабочего места
  closed: boolean;
}

interface Point {
  x: number; // 0-1
  y: number; // 0-1
}
```

### SaveData

При сохранении передаются данные в формате:

```typescript
interface SaveData {
  cameraId: string;
  imageSize: {
    width: number;
    height: number;
  };
  regions: Array<{
    id: string;
    linkedWorkplace?: string;
    relativeCoordinates: Point[];  // 0-1
    pixelCoordinates: Point[];     // пиксели
    closed: boolean;
  }>;
  timestamp: string;
}
```

## Горячие клавиши

- `Delete` / `Backspace` - Удалить выбранный полигон
- `Escape` - Отменить рисование
- `Click` - Добавить точку
- `Double Click` - Завершить полигон

## Особенности

### Система координат

Библиотека использует две системы координат:

1. **Относительные координаты (0-1)** - для внутренней работы и масштабирования
2. **Пиксельные координаты** - для отправки на сервер

### Автосохранение

Изменения автоматически сохраняются через заданную задержку. По умолчанию - 1000мс.

### Привязка к рабочим местам

Полигоны можно связывать с рабочими местами из списка. Связь отображается цветом и подписью.

## Архитектура

Библиотека построена по принципам Feature-Sliced Design:

```
src/
├── app/           # Конфигурация приложения
├── pages/         # Страницы (главный компонент)
├── widgets/       # Композитные UI блоки
├── features/      # Бизнес-логика
├── entities/      # Модели данных
└── shared/        # Переиспользуемый код
```

## Кастомизация

### Стили

Библиотека использует Tailwind CSS. Можно переопределить стили через CSS классы.

### Компоненты

Все внутренние компоненты экспортируются и могут использоваться отдельно:

```tsx
import { PolygonCanvas, ItemsPanel } from 'polygon-editor';
```

### Утилиты

Экспортируются хуки и утилиты:

```tsx
import { 
  useImageProcessing,
  useCanvasDimensions,
  usePolygonChanges,
  generateId 
} from 'polygon-editor';
```

## Лицензия

MIT
