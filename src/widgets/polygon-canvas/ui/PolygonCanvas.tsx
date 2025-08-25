import React, { useRef, useEffect, useCallback, useState } from 'react';
import type { Point, ImageInfo, CanvasDimensions } from '../../../shared/types';
import type { Polygon } from '../../../entities/polygon';
import type { Workplace } from '../../../entities/workplace';
import { getDistance } from '../../../shared/lib';
import { 
  useCoordinateTransform, 
  usePolygonInteraction,
  drawBackground,
  drawPolygons,
  drawPreviewLine
} from '../../../features/polygon-editor';

interface PolygonCanvasProps {
  canvasDimensions: CanvasDimensions;
  backgroundImage: HTMLImageElement | null;
  imageInfo: ImageInfo | null;
  polygons: Polygon[];
  setPolygons: React.Dispatch<React.SetStateAction<Polygon[]>>;
  isDrawing: boolean;
  setIsDrawing: React.Dispatch<React.SetStateAction<boolean>>;
  selectedPolygon: string | null;
  setSelectedPolygon: React.Dispatch<React.SetStateAction<string | null>>;
  workplaces: Workplace[];
  generateId: () => string;
  cameraId: string;
}

interface DragState {
  isDragging: boolean;
  dragType: 'polygon' | 'point' | null;
  polygonIndex: number;
  pointIndex: number;
  startPos: Point;
  startTime: number;
}

export const PolygonCanvas: React.FC<PolygonCanvasProps> = ({
  canvasDimensions,
  backgroundImage,
  imageInfo,
  polygons,
  setPolygons,
  isDrawing,
  setIsDrawing,
  selectedPolygon,
  setSelectedPolygon,
  workplaces,
  generateId,
  cameraId
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState<Point>({ x: 0, y: 0 });
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragType: null,
    polygonIndex: -1,
    pointIndex: -1,
    startPos: { x: 0, y: 0 },
    startTime: 0
  });

  const { absoluteToRelative, relativeToAbsolute, isPointInImageBounds } = useCoordinateTransform({
    imageInfo,
    canvasDimensions
  });

  const { getAbsolutePolygons, findPointAt, findEdgeAt, findPolygonAt } = usePolygonInteraction({
    polygons,
    relativeToAbsolute
  });

  const getCanvasPos = useCallback((e: MouseEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Рисуем фон
    drawBackground({ ctx, canvasDimensions, backgroundImage, imageInfo });

    // Получаем абсолютные координаты для рисования
    const absolutePolygons = getAbsolutePolygons();

    // Рисуем полигоны
    drawPolygons({
      ctx,
      polygons: absolutePolygons,
      originalPolygons: polygons,
      selectedPolygonId: selectedPolygon,
      workplaces
    });

    // Рисуем линию к курсору при рисовании
    drawPreviewLine({
      ctx,
      polygons: absolutePolygons,
      mousePos,
      isDrawing
    });
  }, [polygons, isDrawing, mousePos, selectedPolygon, workplaces, backgroundImage, imageInfo, getAbsolutePolygons, canvasDimensions]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (e.button === 2) return; // Правый клик обрабатывается отдельно
    
    const pos = getCanvasPos(e.nativeEvent);
    const currentTime = Date.now();

    // Если есть изображение, проверяем, что клик в его границах
    if (imageInfo && !isPointInImageBounds(pos)) {
      return;
    }

    // Проверяем клик по точке
    const pointHit = findPointAt(pos);
    if (pointHit && polygons[pointHit.polygonIndex].closed) {
      setDragState({
        isDragging: true,
        dragType: 'point',
        polygonIndex: pointHit.polygonIndex,
        pointIndex: pointHit.pointIndex,
        startPos: pos,
        startTime: currentTime
      });
      return;
    }

    // Проверяем клик по грани (добавление точки)
    const edgeHit = findEdgeAt(pos);
    if (edgeHit && polygons[edgeHit.polygonIndex].closed) {
      const updated = [...polygons];
      const relativeInsertPos = absoluteToRelative(edgeHit.insertPos);
      updated[edgeHit.polygonIndex].points.splice(
        edgeHit.edgeIndex + 1, 
        0, 
        relativeInsertPos
      );
      setPolygons(updated);
      return;
    }

    // Проверяем клик по полигону
    const polygonHit = findPolygonAt(pos);
    if (polygonHit !== null && !isDrawing) {
      const polygon = polygons[polygonHit];
      setSelectedPolygon(polygon.id);
      
      setDragState({
        isDragging: true,
        dragType: 'polygon',
        polygonIndex: polygonHit,
        pointIndex: -1,
        startPos: pos,
        startTime: currentTime
      });
      return;
    }

    // Сброс выделения при клике в пустое место
    setSelectedPolygon(null);

    // Логика создания полигона
    if (polygons.length === 0 || polygons[polygons.length - 1].closed) {
      const relativePos = absoluteToRelative(pos);
      const newPolygon: Polygon = {
        points: [relativePos, relativePos],
        closed: false,
        linkedWorkplace: null,
        id: generateId(),
        cameraId
      };
      setPolygons([...polygons, newPolygon]);
      setIsDrawing(true);
    } else {
      const updated = [...polygons];
      const current = updated[updated.length - 1];
      const absolutePoints = current.points.map((p: any) => relativeToAbsolute(p));
      const first = absolutePoints[0];

      if (getDistance(first, pos) < 10 && current.points.length > 2) {
        current.closed = true;
        current.points.pop();
        setPolygons(updated);
        setIsDrawing(false);
      } else {
        const relativePos = absoluteToRelative(pos);
        current.points.splice(current.points.length - 1, 0, relativePos);
        setPolygons(updated);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = getCanvasPos(e.nativeEvent);
    setMousePos(pos);

    if (dragState.isDragging) {
      const timeDiff = Date.now() - dragState.startTime;
      const moveDist = getDistance(pos, dragState.startPos);
      
      // Начинаем drag только если прошло время или мышь сдвинулась достаточно
      if (timeDiff > 150 || moveDist > 5) {
        const updated = [...polygons];
        
        if (dragState.dragType === 'point') {
          // Ограничиваем точку границами изображения
          let constrainedPos = pos;
          if (imageInfo && !isPointInImageBounds(pos)) {
            const scaledWidth = imageInfo.width * imageInfo.scale;
            const scaledHeight = imageInfo.height * imageInfo.scale;
            constrainedPos = {
              x: Math.max(imageInfo.offsetX, Math.min(pos.x, imageInfo.offsetX + scaledWidth)),
              y: Math.max(imageInfo.offsetY, Math.min(pos.y, imageInfo.offsetY + scaledHeight))
            };
          }
          updated[dragState.polygonIndex].points[dragState.pointIndex] = absoluteToRelative(constrainedPos);
        } else if (dragState.dragType === 'polygon') {
          const dx = pos.x - dragState.startPos.x;
          const dy = pos.y - dragState.startPos.y;
          
          const absolutePoints = updated[dragState.polygonIndex].points.map((p: any) => relativeToAbsolute(p));
          const newAbsolutePoints = absolutePoints.map((p: any) => ({
            x: p.x + dx,
            y: p.y + dy
          }));
          
          // Проверяем, что все точки остаются в границах изображения
          const allPointsValid = !imageInfo || newAbsolutePoints.every((p: any) => isPointInImageBounds(p));
          
          if (allPointsValid) {
            updated[dragState.polygonIndex].points = newAbsolutePoints.map((p: any) => absoluteToRelative(p));
            setDragState({ ...dragState, startPos: pos });
          }
        }
        
        setPolygons(updated);
      }
      return;
    }

    if (isDrawing && polygons.length > 0) {
      const updated = [...polygons];
      const current = updated[updated.length - 1];
      current.points[current.points.length - 1] = absoluteToRelative(pos);
      setPolygons(updated);
    }
  };

  const handleMouseUp = () => {
    const timeDiff = Date.now() - dragState.startTime;
    const moveDist = getDistance(mousePos, dragState.startPos);
    
    // Если это был короткий клик без перемещения - выделяем полигон
    if (dragState.isDragging && dragState.dragType === 'polygon' && timeDiff < 150 && moveDist < 5) {
      const polygon = polygons[dragState.polygonIndex];
      setSelectedPolygon(polygon.id);
    }

    setDragState({
      isDragging: false,
      dragType: null,
      polygonIndex: -1,
      pointIndex: -1,
      startPos: { x: 0, y: 0 },
      startTime: 0
    });
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const pos = getCanvasPos(e.nativeEvent);

    // Если рисуем - отменяем точку
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

    // Удаление точки у завершенного полигона
    const pointHit = findPointAt(pos);
    if (pointHit && polygons[pointHit.polygonIndex].closed) {
      const updated = [...polygons];
      const polygon = updated[pointHit.polygonIndex];
      
      if (polygon.points.length > 3) { // Минимум 3 точки для полигона
        polygon.points.splice(pointHit.pointIndex, 1);
        setPolygons(updated);
      }
      return;
    }

    // Если есть выбранный полигон и клик вне всех полигонов - снимаем выделение
    if (selectedPolygon) {
      const polygonHit = findPolygonAt(pos);
      if (polygonHit === null) {
        setSelectedPolygon(null);
      }
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={canvasDimensions.width}
      height={canvasDimensions.height}
      className="block cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={handleContextMenu}
      style={{ 
        userSelect: 'none',
        width: '100%',
        height: '100%',
        maxWidth: `${canvasDimensions.width}px`,
        maxHeight: `${canvasDimensions.height}px`
      }}
    />
  );
};
