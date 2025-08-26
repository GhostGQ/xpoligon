# Polygon Editor Library

A library for creating and editing polygonal regions on images with workplace linking.

## Features

- ✅ Draw polygons on images
- ✅ Link polygons to workplaces  
- ✅ Relative coordinate system (0-1)
- ✅ Pixel coordinates for server
- ✅ Auto-save functionality
- ✅ Loading states support
- ✅ TypeScript support
- ✅ Feature-Sliced Design architecture

## Installation

```bash
npm install polygon-editor
```

## Usage

### Basic usage

```tsx
import { PolygonEditorPage } from 'polygon-editor';
import type { PolygonEditorData } from 'polygon-editor';

const MyApp = () => {
  const data: PolygonEditorData = {
    camera: {
      id: 'cam1',
      name: 'Main camera',
      screenshot: '/path/to/image.jpg',
      isActive: true,
    },
    workplaces: [
      { id: 'wp1', name: 'Table #1' },
      { id: 'wp2', name: 'Table #2' },
    ],
    polygons: [], // Existing polygons
  };

  const handleSave = (saveData) => {
    console.log('Save data:', saveData);
    // Send to server
  };

  const handleChange = (polygons) => {
    console.log('Polygons changed:', polygons);
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

### Usage with loading state

```tsx
import { useState, useEffect } from 'react';
import { PolygonEditorPage } from 'polygon-editor';
import type { PolygonEditorData } from 'polygon-editor';

const CameraEditor = ({ cameraId }) => {
  const [data, setData] = useState<PolygonEditorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load data from your server
        const response = await fetch(`/api/cameras/${cameraId}/editor-data`);
        const editorData = await response.json();
        setData(editorData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [cameraId]);

  if (!data) return <div>Loading...</div>;

  return (
    <PolygonEditorPage
      data={data}
      loading={loading}
      onSave={async (saveData) => {
        // Send data to your server
        await fetch(`/api/cameras/${saveData.cameraId}/polygons`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(saveData),
        });
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
  data: PolygonEditorData;           // Camera, workplaces, and polygons data
  loading?: boolean;                 // Loading state
  onSave?: (data: SaveData) => void; // Save callback
  onChange?: (polygons: Polygon[]) => void; // Change callback
  onError?: (error: string) => void; // Error callback
  autoSaveDelay?: number;            // Autosave delay (ms)
}
```

### PolygonEditorData

```typescript
interface PolygonEditorData {
  camera: Camera;           // Camera data with image
  workplaces: Workplace[];  // List of workplaces
  polygons: Polygon[];      // Existing polygons
}
```

### Data types

```typescript
interface Camera {
  id: string;
  name: string;
  screenshot: string;  // Image URL
  isActive: boolean;
}

interface Workplace {
  id: string;
  name: string;
}

interface Polygon {
  id: string;
  points: Point[];          // Relative coordinates (0-1)
  linkedWorkplace?: string; // Linked workplace ID
  closed: boolean;
}

interface Point {
  x: number; // 0-1
  y: number; // 0-1
}
```

### SaveData

When saving, data is passed in the following format:

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
    pixelCoordinates: Point[];     // pixels
    closed: boolean;
  }>;
  timestamp: string;
}
```

## Hotkeys

- `Delete` / `Backspace` - Delete selected polygon
- `Escape` - Cancel drawing
- `Click` - Add point
- `Double Click` - Finish polygon

## Features

### Coordinate system

The library uses two coordinate systems:

1. **Relative coordinates (0-1)** - for internal work and scaling
2. **Pixel coordinates** - for sending to the server

### Autosave

Changes are automatically saved after the specified delay. Default is 1000ms.

### Workplace linking

Polygons can be linked to workplaces from the list. The link is shown by color and label.

## Architecture

The library is built using Feature-Sliced Design principles:

```
src/
├── app/           # App configuration
├── pages/         # Pages (main component)
├── widgets/       # Composite UI blocks
├── features/      # Business logic
├── entities/      # Data models
└── shared/        # Reusable code
```

## Customization

### Styles

The library uses Tailwind CSS. You can override styles via CSS classes.

### Components

All internal components are exported and can be used separately:

```tsx
import { PolygonCanvas, ItemsPanel } from 'polygon-editor';
```

### Utilities

Hooks and utilities are exported:

```tsx
import { 
  useImageProcessing,
  useCanvasDimensions,
  usePolygonChanges,
  generateId 
} from 'polygon-editor';
```

## License

MIT
