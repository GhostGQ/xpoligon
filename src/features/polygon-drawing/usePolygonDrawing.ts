import React, { useCallback } from 'react';
import type { Point } from '../../shared/types';
import type { Polygon, DragState } from '../../entities/polygon';
import { findPointAt, findEdgeAt, findPolygonAt } from '../../entities/polygon';
import { getDistance, generateId } from '../../shared/lib';
import { DRAWING_CONFIG } from '../../shared/config';

export interface UsePolygonDrawingProps {
  polygons: Polygon[];
  setPolygons: React.Dispatch<React.SetStateAction<Polygon[]>>;
  isDrawing: boolean;
  setIsDrawing: React.Dispatch<React.SetStateAction<boolean>>;
  selectedPolygon: string | null;
  setSelectedPolygon: React.Dispatch<React.SetStateAction<string | null>>;
  dragState: DragState;
  setDragState: React.Dispatch<React.SetStateAction<DragState>>;
  mousePos: Point;
}

export const usePolygonDrawing = ({
  polygons,
  setPolygons,
  isDrawing,
  setIsDrawing,
  selectedPolygon,
  setSelectedPolygon,
  dragState,
  setDragState,
  mousePos,
}: UsePolygonDrawingProps) => {
  const getCanvasPos = useCallback((e: MouseEvent): Point => {
    const canvas = e.target as HTMLCanvasElement;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();

      if (e.button === 2) return; // Правый клик обрабатывается отдельно

      const pos = getCanvasPos(e.nativeEvent);
      const currentTime = Date.now();

      // Проверяем клик по точке
      const pointHit = findPointAt(pos, polygons);
      if (pointHit && polygons[pointHit.polygonIndex].closed) {
        setDragState({
          isDragging: true,
          dragType: 'point',
          polygonIndex: pointHit.polygonIndex,
          pointIndex: pointHit.pointIndex,
          startPos: pos,
          startTime: currentTime,
        });
        return;
      }

      // Проверяем клик по грани (добавление точки)
      const edgeHit = findEdgeAt(pos, polygons);
      if (edgeHit && polygons[edgeHit.polygonIndex].closed) {
        const updated = [...polygons];
        updated[edgeHit.polygonIndex].points.splice(
          edgeHit.edgeIndex + 1,
          0,
          edgeHit.insertPos
        );
        setPolygons(updated);
        return;
      }

      // Проверяем клик по полигону
      const polygonHit = findPolygonAt(pos, polygons);
      if (polygonHit !== null && !isDrawing) {
        const polygon = polygons[polygonHit];
        setSelectedPolygon(polygon.id);

        setDragState({
          isDragging: true,
          dragType: 'polygon',
          polygonIndex: polygonHit,
          pointIndex: -1,
          startPos: pos,
          startTime: currentTime,
        });
        return;
      }

      // Сброс выделения при клике в пустое место
      setSelectedPolygon(null);

      // Логика создания полигона
      if (polygons.length === 0 || polygons[polygons.length - 1].closed) {
        const newPolygon: Polygon = {
          points: [pos, pos],
          closed: false,
          linkedItem: null,
          id: generateId(),
        };
        setPolygons([...polygons, newPolygon]);
        setIsDrawing(true);
      } else {
        const updated = [...polygons];
        const current = updated[updated.length - 1];
        const first = current.points[0];

        if (getDistance(first, pos) < DRAWING_CONFIG.SNAP_DISTANCE && current.points.length > 2) {
          current.closed = true;
          current.points.pop();
          setPolygons(updated);
          setIsDrawing(false);
        } else {
          current.points.splice(current.points.length - 1, 0, pos);
          setPolygons(updated);
        }
      }
    },
    [polygons, isDrawing, setPolygons, setIsDrawing, setSelectedPolygon, setDragState, getCanvasPos]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const pos = getCanvasPos(e.nativeEvent);

      if (dragState.isDragging) {
        const timeDiff = Date.now() - dragState.startTime;
        const moveDist = getDistance(pos, dragState.startPos);

        if (timeDiff > DRAWING_CONFIG.DOUBLE_CLICK_TIME || moveDist > DRAWING_CONFIG.MIN_DRAG_DISTANCE) {
          const updated = [...polygons];

          if (dragState.dragType === 'point') {
            updated[dragState.polygonIndex].points[dragState.pointIndex] = pos;
          } else if (dragState.dragType === 'polygon') {
            const dx = pos.x - dragState.startPos.x;
            const dy = pos.y - dragState.startPos.y;

            updated[dragState.polygonIndex].points = updated[
              dragState.polygonIndex
            ].points.map(p => ({
              x: p.x + dx,
              y: p.y + dy,
            }));

            setDragState({ ...dragState, startPos: pos });
          }

          setPolygons(updated);
        }
        return;
      }

      if (isDrawing && polygons.length > 0) {
        const updated = [...polygons];
        const current = updated[updated.length - 1];
        current.points[current.points.length - 1] = pos;
        setPolygons(updated);
      }
    },
    [dragState, polygons, isDrawing, setPolygons, setDragState, getCanvasPos]
  );

  const handleMouseUp = useCallback(
    () => {
      const timeDiff = Date.now() - dragState.startTime;
      const moveDist = getDistance(mousePos, dragState.startPos);

      if (
        dragState.isDragging &&
        dragState.dragType === 'polygon' &&
        timeDiff < DRAWING_CONFIG.DOUBLE_CLICK_TIME &&
        moveDist < DRAWING_CONFIG.MIN_DRAG_DISTANCE
      ) {
        const polygon = polygons[dragState.polygonIndex];
        setSelectedPolygon(polygon.id);
      }

      setDragState({
        isDragging: false,
        dragType: null,
        polygonIndex: -1,
        pointIndex: -1,
        startPos: { x: 0, y: 0 },
        startTime: 0,
      });
    },
    [dragState, mousePos, polygons, setSelectedPolygon, setDragState]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const pos = getCanvasPos(e.nativeEvent);

      if (isDrawing && polygons.length > 0) {
        const updated = [...polygons];
        const current = updated[updated.length - 1];

        if (current.points.length > 2) {
          current.points.splice(current.points.length - 2, 1);
        } else {
          updated.pop();
          setIsDrawing(false);
        }
        setPolygons(updated);
        return;
      }

      const pointHit = findPointAt(pos, polygons);
      if (pointHit && polygons[pointHit.polygonIndex].closed) {
        const updated = [...polygons];
        const polygon = updated[pointHit.polygonIndex];

        if (polygon.points.length > DRAWING_CONFIG.MIN_POLYGON_POINTS) {
          polygon.points.splice(pointHit.pointIndex, 1);
          setPolygons(updated);
        }
        return;
      }

      if (selectedPolygon) {
        const polygonHit = findPolygonAt(pos, polygons);
        if (polygonHit === null) {
          setSelectedPolygon(null);
        }
      }
    },
    [isDrawing, polygons, selectedPolygon, setPolygons, setIsDrawing, setSelectedPolygon, getCanvasPos]
  );

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleContextMenu,
  };
};
