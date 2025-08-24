import React, { useRef, useEffect, useCallback } from 'react';
import type { Point, Dimensions } from '../../shared/types';
import type { Polygon } from '../../entities/polygon';
import type { TableItem } from '../../entities/table';
import { COLORS, DRAWING_CONFIG } from '../../shared/config';

export interface PolygonCanvasProps {
  dimensions: Dimensions;
  backgroundImage: HTMLImageElement | null;
  polygons: Polygon[];
  isDrawing: boolean;
  selectedPolygon: string | null;
  tableItems: TableItem[];
  mousePos: Point;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

const PolygonCanvas: React.FC<PolygonCanvasProps> = ({
  dimensions,
  backgroundImage,
  polygons,
  isDrawing,
  selectedPolygon,
  tableItems,
  mousePos,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onContextMenu,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем фоновое изображение или сетку
    if (backgroundImage) {
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    } else {
      // Фон с сеткой как fallback
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      gradient.addColorStop(0, COLORS.BACKGROUND.GRADIENT_START);
      gradient.addColorStop(1, COLORS.BACKGROUND.GRADIENT_END);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = COLORS.BACKGROUND.GRID;
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }
    }

    // Инструкции (только если нет фонового изображения)
    if (!backgroundImage) {
      ctx.fillStyle = '#1976d2';
      ctx.font = '14px Arial';
      ctx.fillText('ЛКМ - создать/выбрать полигон', 10, 20);
      ctx.fillText('ПКМ по точке - удалить точку', 10, 40);
      ctx.fillText('ЛКМ по грани - добавить точку', 10, 60);
      ctx.fillText('Delete/Backspace - удалить выбранный полигон', 10, 80);
    }

    // Рисуем полигоны
    polygons.forEach(polygon => {
      if (polygon.points.length < 2) return;

      const isSelected = selectedPolygon === polygon.id;
      const isLinked = polygon.linkedItem !== null;

      // Цвета в зависимости от состояния
      let strokeColor: string = COLORS.POLYGON.DEFAULT.STROKE;
      let fillColor: string = COLORS.POLYGON.DEFAULT.FILL;
      let lineWidth: number = DRAWING_CONFIG.LINE_WIDTH;

      if (isSelected) {
        strokeColor = COLORS.POLYGON.SELECTED.STROKE;
        fillColor = COLORS.POLYGON.SELECTED.FILL;
        lineWidth = DRAWING_CONFIG.SELECTED_LINE_WIDTH;
      } else if (isLinked) {
        strokeColor = COLORS.POLYGON.LINKED.STROKE;
        fillColor = COLORS.POLYGON.LINKED.FILL;
      }

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(polygon.points[0].x, polygon.points[0].y);

      for (let i = 1; i < polygon.points.length; i++) {
        ctx.lineTo(polygon.points[i].x, polygon.points[i].y);
      }

      if (polygon.closed) {
        ctx.closePath();
        ctx.fillStyle = fillColor;
        ctx.fill();
      }
      ctx.stroke();

      // Рисуем точки
      polygon.points.forEach(point => {
        ctx.fillStyle = isSelected
          ? COLORS.POINT.SELECTED
          : COLORS.POINT.DEFAULT;
        ctx.beginPath();
        ctx.arc(
          point.x,
          point.y,
          isSelected
            ? DRAWING_CONFIG.SELECTED_POINT_RADIUS
            : DRAWING_CONFIG.POINT_RADIUS,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });

      // Показываем название связанного элемента
      if (isLinked && polygon.linkedItem) {
        const linkedTable = tableItems.find(
          item => item.id === polygon.linkedItem
        );
        if (linkedTable) {
          const centerX =
            polygon.points.reduce((sum, p) => sum + p.x, 0) /
            polygon.points.length;
          const centerY =
            polygon.points.reduce((sum, p) => sum + p.y, 0) /
            polygon.points.length;

          ctx.fillStyle = 'white';
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = 2;
          ctx.font = 'bold 12px Arial';
          const textWidth = ctx.measureText(linkedTable.name).width;
          const padding = 4;

          ctx.fillRect(
            centerX - textWidth / 2 - padding,
            centerY - 8,
            textWidth + padding * 2,
            16
          );
          ctx.strokeRect(
            centerX - textWidth / 2 - padding,
            centerY - 8,
            textWidth + padding * 2,
            16
          );

          ctx.fillStyle = strokeColor;
          ctx.fillText(linkedTable.name, centerX - textWidth / 2, centerY + 3);
        }
      }
    });

    // Рисуем линию к курсору при рисовании
    if (isDrawing && polygons.length > 0) {
      const currentPoly = polygons[polygons.length - 1];
      if (currentPoly.points.length > 0) {
        const lastPoint =
          currentPoly.points[currentPoly.points.length - 2] ||
          currentPoly.points[0];
        ctx.strokeStyle = 'rgba(0,0,255,0.5)';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }, [
    polygons,
    isDrawing,
    mousePos,
    selectedPolygon,
    tableItems,
    backgroundImage,
  ]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      className='block cursor-crosshair'
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onContextMenu={onContextMenu}
      style={{
        userSelect: 'none',
        width: '100%',
        height: '100%',
        maxWidth: `${dimensions.width}px`,
        maxHeight: `${dimensions.height}px`,
      }}
    />
  );
};

export default PolygonCanvas;
