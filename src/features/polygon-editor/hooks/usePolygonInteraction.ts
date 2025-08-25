import { useCallback } from 'react';
import type { Point } from '../../../shared/types';
import type { Polygon } from '../../../entities/polygon';
import { getDistance } from '../../../shared/lib';

interface UsePolygonInteractionProps {
  polygons: Polygon[];
  relativeToAbsolute: (point: { x: number; y: number }) => Point;
}

export const usePolygonInteraction = ({ polygons, relativeToAbsolute }: UsePolygonInteractionProps) => {
  // Преобразуем относительные координаты полигонов в абсолютные для работы с ними
  const getAbsolutePolygons = useCallback(() => {
    return polygons.map(polygon => ({
      ...polygon,
      points: polygon.points.map(point => relativeToAbsolute(point))
    }));
  }, [polygons, relativeToAbsolute]);

  const findPointAt = useCallback((pos: Point): { polygonIndex: number; pointIndex: number } | null => {
    const absolutePolygons = getAbsolutePolygons();
    
    for (let i = 0; i < absolutePolygons.length; i++) {
      if (!absolutePolygons[i].closed) continue;
      for (let j = 0; j < absolutePolygons[i].points.length; j++) {
        if (getDistance(pos, absolutePolygons[i].points[j]) < 8) {
          return { polygonIndex: i, pointIndex: j };
        }
      }
    }
    return null;
  }, [getAbsolutePolygons]);

  const findEdgeAt = useCallback((pos: Point): { polygonIndex: number; edgeIndex: number; insertPos: Point } | null => {
    const absolutePolygons = getAbsolutePolygons();
    
    for (let i = 0; i < absolutePolygons.length; i++) {
      if (!absolutePolygons[i].closed) continue;
      const points = absolutePolygons[i].points;
      
      for (let j = 0; j < points.length; j++) {
        const p1 = points[j];
        const p2 = points[(j + 1) % points.length];
        
        // Проверяем расстояние до линии
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
            y: p1.y + param * D
          };
        }
        
        if (getDistance(pos, closestPoint) < 5 && param >= 0 && param <= 1) {
          return { 
            polygonIndex: i, 
            edgeIndex: j, 
            insertPos: closestPoint 
          };
        }
      }
    }
    return null;
  }, [getAbsolutePolygons]);

  const findPolygonAt = useCallback((pos: Point): number | null => {
    const absolutePolygons = getAbsolutePolygons();
    
    for (let i = 0; i < absolutePolygons.length; i++) {
      if (!absolutePolygons[i].closed) continue;
      const points = absolutePolygons[i].points;
      let inside = false;
      for (let j = 0, k = points.length - 1; j < points.length; k = j++) {
        if (((points[j].y > pos.y) !== (points[k].y > pos.y)) &&
            (pos.x < (points[k].x - points[j].x) * (pos.y - points[j].y) / (points[k].y - points[j].y) + points[j].x)) {
          inside = !inside;
        }
      }
      if (inside) return i;
    }
    return null;
  }, [getAbsolutePolygons]);

  return {
    getAbsolutePolygons,
    findPointAt,
    findEdgeAt,
    findPolygonAt
  };
};
