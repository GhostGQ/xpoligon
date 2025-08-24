import type { Point } from '../../shared/types';
import type { Polygon } from './types';
import { getDistance } from '../../shared/lib';
import { DRAWING_CONFIG } from '../../shared/config';

export const findPointAt = (
  pos: Point,
  polygons: Polygon[]
): { polygonIndex: number; pointIndex: number } | null => {
  for (let i = 0; i < polygons.length; i++) {
    if (!polygons[i].closed) continue;
    for (let j = 0; j < polygons[i].points.length; j++) {
      if (getDistance(pos, polygons[i].points[j]) < DRAWING_CONFIG.CLICK_TOLERANCE) {
        return { polygonIndex: i, pointIndex: j };
      }
    }
  }
  return null;
};

export const findEdgeAt = (
  pos: Point,
  polygons: Polygon[]
): { polygonIndex: number; edgeIndex: number; insertPos: Point } | null => {
  for (let i = 0; i < polygons.length; i++) {
    if (!polygons[i].closed) continue;
    const points = polygons[i].points;

    for (let j = 0; j < points.length; j++) {
      const p1 = points[j];
      const p2 = points[(j + 1) % points.length];

      const A = pos.x - p1.x;
      const B = pos.y - p1.y;
      const C = p2.x - p1.x;
      const D = p2.y - p1.y;

      const dot = A * C + B * D;
      const lenSq = C * C + D * D;

      if (lenSq === 0) continue;

      const param = dot / lenSq;

      let closestPoint: Point;
      if (param < 0) {
        closestPoint = p1;
      } else if (param > 1) {
        closestPoint = p2;
      } else {
        closestPoint = {
          x: p1.x + param * C,
          y: p1.y + param * D,
        };
      }

      if (getDistance(pos, closestPoint) < DRAWING_CONFIG.EDGE_TOLERANCE && param >= 0 && param <= 1) {
        return {
          polygonIndex: i,
          edgeIndex: j,
          insertPos: closestPoint,
        };
      }
    }
  }
  return null;
};

export const findPolygonAt = (pos: Point, polygons: Polygon[]): number | null => {
  for (let i = 0; i < polygons.length; i++) {
    if (!polygons[i].closed) continue;
    const points = polygons[i].points;
    let inside = false;
    for (let j = 0, k = points.length - 1; j < points.length; k = j++) {
      if (
        points[j].y > pos.y !== points[k].y > pos.y &&
        pos.x <
          ((points[k].x - points[j].x) * (pos.y - points[j].y)) /
            (points[k].y - points[j].y) +
            points[j].x
      ) {
        inside = !inside;
      }
    }
    if (inside) return i;
  }
  return null;
};
