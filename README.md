# XPoligon React Library

Interactive polygon editor for surveillance cameras

![XPoligon Demo](https://img.shields.io/badge/demo-live-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)

## 🚀 Demo

### [Try it online](https://ghostgq.github.io/xpoligon/)

## 📋 Description

XPoligon Demo is an interactive web application showcasing the capabilities of the XPoligon library. It allows you to create and edit polygons on surveillance camera images.

### ✨ Key Features

- 📐 **Precise positioning** - Relative coordinate system (0-1)
- 🏢 **Workplace linking** - Connect polygons to specific workplaces
- 💾 **Auto-save** - All changes are automatically saved to localStorage
- 🎨 **TypeScript support** - Full API type safety
- 📱 **Responsive design** - Works on all devices
- ⚡ **High performance** - Optimized Canvas rendering

## Installation

```bash
npm install xpoligon
```

### Styles Setup

The library uses Tailwind CSS for styling. You need to import the compiled CSS file:

```tsx
// Import the library styles
import 'xpoligon/dist/index.css';

// Then use the component
import { PolygonEditorPage } from 'xpoligon';
```

**Important:** The library includes its own compiled CSS with all necessary Tailwind styles. You don't need to have Tailwind CSS installed in your project unless you want to customize the styles.

## Usage

### Basic usage

```tsx
// Import styles and component
import 'xpoligon/dist/index.css';
import { PolygonEditorPage } from 'xpoligon';
import type { PolygonEditorData } from 'xpoligon';

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
// Import styles first
import 'xpoligon/dist/index.css';
import { useState, useEffect } from 'react';
import { PolygonEditorPage } from 'xpoligon';
import type { PolygonEditorData } from 'xpoligon';

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

The library comes with compiled Tailwind CSS styles. To customize the appearance:

1. **Override CSS classes**: The library uses CSS classes like `.polygon-editor-button`, `.polygon-editor-canvas`, etc. You can override them in your own CSS:

```css
/* Override button styles */
.polygon-editor-button-primary {
  background-color: #your-color !important;
}

/* Override canvas border */
.polygon-editor-canvas {
  border-color: #your-border-color !important;
}
```

2. **Custom CSS file**: Import your custom styles after the library styles:

```tsx
import 'xpoligon/dist/index.css';
import './my-custom-styles.css'; // Your overrides
```

### Components

All internal components are exported and can be used separately:

```tsx
import { PolygonCanvas, ItemsPanel } from 'xpoligon';
```

### Utilities

Hooks and utilities are exported:

```tsx
import { 
  useImageProcessing,
  useCanvasDimensions,
  usePolygonChanges,
  generateId 
} from 'xpoligon';
```

## License

MIT
