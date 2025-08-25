import type { Point, ImageInfo, CanvasDimensions } from '../../../shared/types';
import type { Polygon } from '../../../entities/polygon';
import type { Workplace } from '../../../entities/workplace';

interface DrawBackgroundParams {
  ctx: CanvasRenderingContext2D;
  canvasDimensions: CanvasDimensions;
  backgroundImage?: HTMLImageElement | null;
  imageInfo?: ImageInfo | null;
}

export const drawBackground = ({ ctx, canvasDimensions, backgroundImage, imageInfo }: DrawBackgroundParams) => {
  ctx.clearRect(0, 0, canvasDimensions.width, canvasDimensions.height);

  if (backgroundImage && imageInfo) {
    ctx.drawImage(backgroundImage, 0, 0, canvasDimensions.width, canvasDimensions.height);
    
    // Рисуем границы области изображения
    const scaledWidth = imageInfo.width * imageInfo.scale;
    const scaledHeight = imageInfo.height * imageInfo.scale;
    
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(
      imageInfo.offsetX, 
      imageInfo.offsetY, 
      scaledWidth, 
      scaledHeight
    );
    ctx.setLineDash([]);
  } else {
    // Фон с сеткой как fallback
    const gradient = ctx.createLinearGradient(0, 0, canvasDimensions.width, canvasDimensions.height);
    gradient.addColorStop(0, '#e3f2fd');
    gradient.addColorStop(1, '#bbdefb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasDimensions.width, canvasDimensions.height);

    ctx.strokeStyle = '#90caf9';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvasDimensions.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvasDimensions.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvasDimensions.height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvasDimensions.width, i);
      ctx.stroke();
    }

    // Инструкции
    ctx.fillStyle = '#1976d2';
    ctx.font = '14px Arial';
    ctx.fillText('ЛКМ - создать/выбрать полигон', 10, 20);
    ctx.fillText('ПКМ по точке - удалить точку', 10, 40);
    ctx.fillText('ЛКМ по грани - добавить точку', 10, 60);
    ctx.fillText('Delete/Backspace - удалить выбранный полигон', 10, 80);
  }
};

interface DrawPolygonsParams {
  ctx: CanvasRenderingContext2D;
  polygons: Array<Polygon & { points: Point[] }>; // абсолютные координаты
  originalPolygons: Polygon[]; // оригинальные полигоны с относительными координатами
  selectedPolygonId: string | null;
  workplaces: Workplace[];
}

export const drawPolygons = ({ ctx, polygons, originalPolygons, selectedPolygonId, workplaces }: DrawPolygonsParams) => {
  polygons.forEach((polygon, index) => {
    if (polygon.points.length < 2) return;

    const originalPolygon = originalPolygons[index];
    const isSelected = selectedPolygonId === originalPolygon.id;
    const isLinked = originalPolygon.linkedWorkplace !== null;

    // Цвета в зависимости от состояния
    let strokeColor = 'blue';
    let fillColor = 'rgba(0,0,255,0.2)';
    let lineWidth = 2;

    if (isSelected) {
      strokeColor = '#ff9800';
      fillColor = 'rgba(255,152,0,0.3)';
      lineWidth = 3;
    } else if (isLinked) {
      strokeColor = '#4caf50';
      fillColor = 'rgba(76,175,80,0.2)';
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
    polygon.points.forEach((point) => {
      ctx.fillStyle = isSelected ? '#ff5722' : 'red';
      ctx.beginPath();
      ctx.arc(point.x, point.y, isSelected ? 6 : 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Показываем название связанного элемента
    if (isLinked && originalPolygon.linkedWorkplace) {
      const linkedWorkplace = workplaces.find(workplace => workplace.id === originalPolygon.linkedWorkplace);
      if (linkedWorkplace) {
        const centerX = polygon.points.reduce((sum, p) => sum + p.x, 0) / polygon.points.length;
        const centerY = polygon.points.reduce((sum, p) => sum + p.y, 0) / polygon.points.length;
        
        ctx.fillStyle = 'white';
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.font = 'bold 12px Arial';
        const textWidth = ctx.measureText(linkedWorkplace.name).width;
        const padding = 4;
        
        ctx.fillRect(centerX - textWidth/2 - padding, centerY - 8, textWidth + padding*2, 16);
        ctx.strokeRect(centerX - textWidth/2 - padding, centerY - 8, textWidth + padding*2, 16);
        
        ctx.fillStyle = strokeColor;
        ctx.fillText(linkedWorkplace.name, centerX - textWidth/2, centerY + 3);
      }
    }
  });
};

interface DrawPreviewLineParams {
  ctx: CanvasRenderingContext2D;
  polygons: Array<Polygon & { points: Point[] }>;
  mousePos: Point;
  isDrawing: boolean;
}

export const drawPreviewLine = ({ ctx, polygons, mousePos, isDrawing }: DrawPreviewLineParams) => {
  if (isDrawing && polygons.length > 0) {
    const currentPoly = polygons[polygons.length - 1];
    if (currentPoly.points.length > 0) {
      const lastPoint = currentPoly.points[currentPoly.points.length - 2] || currentPoly.points[0];
      ctx.strokeStyle = 'rgba(0,0,255,0.5)';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(mousePos.x, mousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
};
