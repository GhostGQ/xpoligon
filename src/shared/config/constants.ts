export const CANVAS_CONFIG = {
  MIN_WIDTH: 640,
  MIN_HEIGHT: 480,
  SIDEBAR_WIDTH: 320,
  PADDING: 32,
  HEADER_HEIGHT: 150,
} as const;

export const DRAWING_CONFIG = {
  POINT_RADIUS: 5,
  SELECTED_POINT_RADIUS: 6,
  LINE_WIDTH: 2,
  SELECTED_LINE_WIDTH: 3,
  CLICK_TOLERANCE: 8,
  EDGE_TOLERANCE: 5,
  SNAP_DISTANCE: 10,
  MIN_POLYGON_POINTS: 3,
  DOUBLE_CLICK_TIME: 150,
  MIN_DRAG_DISTANCE: 5,
} as const;

export const COLORS = {
  POLYGON: {
    DEFAULT: {
      STROKE: 'blue',
      FILL: 'rgba(0,0,255,0.2)',
    },
    SELECTED: {
      STROKE: '#ff9800',
      FILL: 'rgba(255,152,0,0.3)',
    },
    LINKED: {
      STROKE: '#4caf50',
      FILL: 'rgba(76,175,80,0.2)',
    },
  },
  POINT: {
    DEFAULT: 'red',
    SELECTED: '#ff5722',
  },
  BACKGROUND: {
    GRADIENT_START: '#e3f2fd',
    GRADIENT_END: '#bbdefb',
    GRID: '#90caf9',
  },
} as const;
