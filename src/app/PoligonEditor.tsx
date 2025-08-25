import React, { useState, useRef, useEffect, useCallback } from "react";

type Point = { x: number; y: number };
// Добавляем тип для относительных координат (от 0 до 1)
type RelativePoint = { x: number; y: number };
type Polygon = { 
  points: RelativePoint[]; // Теперь храним относительные координаты
  closed: boolean; 
  linkedItem: string | null;
  id: string;
};

type TableItem = {
  id: string;
  name: string;
  linkedPolygon: string | null;
};

// Тип для информации об изображении
type ImageInfo = {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  scale: number;
};

interface PolygonEditorProps {
  cameraImage?: string;
}

export default function PolygonEditor({ cameraImage }: PolygonEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 600 });
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedPolygon, setSelectedPolygon] = useState<string | null>(null);
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    dragType: 'polygon' | 'point' | null;
    polygonIndex: number;
    pointIndex: number;
    startPos: Point;
    startTime: number;
  }>({
    isDragging: false,
    dragType: null,
    polygonIndex: -1,
    pointIndex: -1,
    startPos: { x: 0, y: 0 },
    startTime: 0
  });
  const [mousePos, setMousePos] = useState<Point>({ x: 0, y: 0 });

  // Список столов (моковые данные)
  const [tableItems, setTableItems] = useState<TableItem[]>([
    { id: '1', name: 'Стол № 1', linkedPolygon: null },
    { id: '2', name: 'Стол № 2', linkedPolygon: null },
    { id: '3', name: 'Стол № 3', linkedPolygon: null },
    { id: '4', name: 'Стол № 4', linkedPolygon: null },
    { id: '5', name: 'Стол № 5', linkedPolygon: null },
    { id: '6', name: 'Стол № 6', linkedPolygon: null },
  ]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Функции преобразования координат
  const absoluteToRelative = useCallback((point: Point): RelativePoint => {
    if (!imageInfo) {
      // Если нет изображения, используем координаты canvas как есть
      return { 
        x: point.x / canvasDimensions.width, 
        y: point.y / canvasDimensions.height 
      };
    }
    
    const scaledWidth = imageInfo.width * imageInfo.scale;
    const scaledHeight = imageInfo.height * imageInfo.scale;
    
    const relativeX = (point.x - imageInfo.offsetX) / scaledWidth;
    const relativeY = (point.y - imageInfo.offsetY) / scaledHeight;
    
    return {
      x: Math.max(0, Math.min(1, relativeX)),
      y: Math.max(0, Math.min(1, relativeY))
    };
  }, [imageInfo, canvasDimensions]);

  const relativeToAbsolute = useCallback((point: RelativePoint): Point => {
    if (!imageInfo) {
      // Если нет изображения, используем координаты canvas как есть
      return { 
        x: point.x * canvasDimensions.width, 
        y: point.y * canvasDimensions.height 
      };
    }
    
    const scaledWidth = imageInfo.width * imageInfo.scale;
    const scaledHeight = imageInfo.height * imageInfo.scale;
    
    return {
      x: imageInfo.offsetX + point.x * scaledWidth,
      y: imageInfo.offsetY + point.y * scaledHeight
    };
  }, [imageInfo, canvasDimensions]);

  // Проверяем, находится ли точка в области изображения
  const isPointInImageBounds = useCallback((point: Point): boolean => {
    if (!imageInfo) return true; // Если нет изображения, разрешаем везде
    
    const scaledWidth = imageInfo.width * imageInfo.scale;
    const scaledHeight = imageInfo.height * imageInfo.scale;
    
    return point.x >= imageInfo.offsetX && 
           point.x <= imageInfo.offsetX + scaledWidth &&
           point.y >= imageInfo.offsetY && 
           point.y <= imageInfo.offsetY + scaledHeight;
  }, [imageInfo]);

  // Обработка изменения размеров окна
  useEffect(() => {
    const updateCanvasSize = () => {
      const sidebar = 320; // ширина боковой панели + отступы
      const padding = 32; // общие отступы
      const availableWidth = window.innerWidth - sidebar - padding;
      const availableHeight = window.innerHeight - 150; // оставляем место для заголовка и статуса
      
      setCanvasDimensions({
        width: Math.max(640, availableWidth),
        height: Math.max(480, availableHeight)
      });
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Загрузка и обработка фонового изображения
  useEffect(() => {
    if (cameraImage) {
      const img = new window.Image();
      img.onload = () => {
        // Вычисляем масштаб для сохранения пропорций
        const scaleX = canvasDimensions.width / img.width;
        const scaleY = canvasDimensions.height / img.height;
        const scale = Math.min(scaleX, scaleY);
        
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const offsetX = (canvasDimensions.width - scaledWidth) / 2;
        const offsetY = (canvasDimensions.height - scaledHeight) / 2;

        // Сохраняем информацию об изображении
        setImageInfo({
          width: img.width,
          height: img.height,
          offsetX,
          offsetY,
          scale
        });

        // Масштабируем изображение под размер canvas
        const canvas = document.createElement('canvas');
        canvas.width = canvasDimensions.width;
        canvas.height = canvasDimensions.height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Заливаем фон
          ctx.fillStyle = '#f0f0f0';
          ctx.fillRect(0, 0, canvasDimensions.width, canvasDimensions.height);
          
          // Рисуем изображение с сохранением пропорций
          ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
        }
        
        const processedImg = new window.Image();
        processedImg.src = canvas.toDataURL();
        processedImg.onload = () => setBackgroundImage(processedImg);
      };
      img.src = cameraImage;
    } else {
      setBackgroundImage(null);
      setImageInfo(null);
    }
  }, [cameraImage, canvasDimensions]);

  const getDistance = (p1: Point, p2: Point) => {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
  };

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

  // Преобразуем относительные координаты полигонов в абсолютные для работы с ними
  const getAbsolutePolygons = useCallback(() => {
    return polygons.map(polygon => ({
      ...polygon,
      points: polygon.points.map(point => relativeToAbsolute(point))
    }));
  }, [polygons, relativeToAbsolute]);

  const findPointAt = (pos: Point): { polygonIndex: number; pointIndex: number } | null => {
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
  };

  const findEdgeAt = (pos: Point): { polygonIndex: number; edgeIndex: number; insertPos: Point } | null => {
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
  };

  const findPolygonAt = (pos: Point): number | null => {
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
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем фоновое изображение или сетку
    if (backgroundImage) {
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
      
      // Рисуем границы области изображения
      if (imageInfo) {
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
      }
    } else {
      // Фон с сеткой как fallback
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#e3f2fd');
      gradient.addColorStop(1, '#bbdefb');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#90caf9';
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

    // Получаем абсолютные координаты для рисования
    const absolutePolygons = getAbsolutePolygons();

    // Рисуем полигоны
    absolutePolygons.forEach((polygon, index) => {
      if (polygon.points.length < 2) return;

      const originalPolygon = polygons[index];
      const isSelected = selectedPolygon === originalPolygon.id;
      const isLinked = originalPolygon.linkedItem !== null;

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
      if (isLinked && originalPolygon.linkedItem) {
        const linkedTable = tableItems.find(item => item.id === originalPolygon.linkedItem);
        if (linkedTable) {
          const centerX = polygon.points.reduce((sum, p) => sum + p.x, 0) / polygon.points.length;
          const centerY = polygon.points.reduce((sum, p) => sum + p.y, 0) / polygon.points.length;
          
          ctx.fillStyle = 'white';
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = 2;
          ctx.font = 'bold 12px Arial';
          const textWidth = ctx.measureText(linkedTable.name).width;
          const padding = 4;
          
          ctx.fillRect(centerX - textWidth/2 - padding, centerY - 8, textWidth + padding*2, 16);
          ctx.strokeRect(centerX - textWidth/2 - padding, centerY - 8, textWidth + padding*2, 16);
          
          ctx.fillStyle = strokeColor;
          ctx.fillText(linkedTable.name, centerX - textWidth/2, centerY + 3);
        }
      }
    });

    // Рисуем линию к курсору при рисовании
    if (isDrawing && polygons.length > 0) {
      const absolutePolygons = getAbsolutePolygons();
      const currentPoly = absolutePolygons[absolutePolygons.length - 1];
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
  }, [polygons, isDrawing, mousePos, selectedPolygon, tableItems, backgroundImage, imageInfo, getAbsolutePolygons]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Обработка клавиш Delete и Backspace
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedPolygon) {
        e.preventDefault();
        deletePolygon(selectedPolygon);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedPolygon]);

  const deletePolygon = (polygonId: string) => {
    setPolygons(prev => prev.filter(p => p.id !== polygonId));
    
    // Отвязываем от элементов списка
    setTableItems(prev => prev.map(item => 
      item.linkedPolygon === polygonId 
        ? { ...item, linkedPolygon: null }
        : item
    ));
    
    setSelectedPolygon(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (e.button === 2) return; // Правый клик обрабатывается отдельно
    
    const pos = getCanvasPos(e.nativeEvent);
    const currentTime = Date.now();

    // Если есть изображение, проверяем, что клик в его границах
    if (imageInfo && !isPointInImageBounds(pos)) {
      // Если клик вне изображения, не делаем ничего
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
        linkedItem: null,
        id: generateId()
      };
      setPolygons([...polygons, newPolygon]);
      setIsDrawing(true);
    } else {
      const updated = [...polygons];
      const current = updated[updated.length - 1];
      const absolutePoints = current.points.map(p => relativeToAbsolute(p));
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
          
          const absolutePoints = updated[dragState.polygonIndex].points.map(p => relativeToAbsolute(p));
          const newAbsolutePoints = absolutePoints.map(p => ({
            x: p.x + dx,
            y: p.y + dy
          }));
          
          // Проверяем, что все точки остаются в границах изображения
          const allPointsValid = !imageInfo || newAbsolutePoints.every(p => isPointInImageBounds(p));
          
          if (allPointsValid) {
            updated[dragState.polygonIndex].points = newAbsolutePoints.map(p => absoluteToRelative(p));
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
      // Убираем ограничение на границы изображения для курсора мыши
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

  const linkPolygonToItem = (itemId: string) => {
    if (!selectedPolygon) return;

    // Отвязываем предыдущие связи
    setTableItems(prev => prev.map(item => ({
      ...item,
      linkedPolygon: item.linkedPolygon === selectedPolygon ? null : item.linkedPolygon
    })));

    setPolygons(prev => prev.map(polygon => ({
      ...polygon,
      linkedItem: polygon.id === selectedPolygon ? null : polygon.linkedItem
    })));

    // Создаем новую связь
    setTableItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, linkedPolygon: selectedPolygon }
        : item
    ));

    setPolygons(prev => prev.map(polygon => 
      polygon.id === selectedPolygon 
        ? { ...polygon, linkedItem: itemId }
        : polygon
    ));
  };

  const unlinkItem = (itemId: string) => {
    const item = tableItems.find(t => t.id === itemId);
    if (!item || !item.linkedPolygon) return;

    setTableItems(prev => prev.map(t => 
      t.id === itemId ? { ...t, linkedPolygon: null } : t
    ));

    setPolygons(prev => prev.map(polygon => 
      polygon.id === item.linkedPolygon ? { ...polygon, linkedItem: null } : polygon
    ));
  };

  const clearAll = () => {
    setPolygons([]);
    setIsDrawing(false);
    setSelectedPolygon(null);
    setTableItems(prev => prev.map(item => ({ ...item, linkedPolygon: null })));
    setDragState({
      isDragging: false,
      dragType: null,
      polygonIndex: -1,
      pointIndex: -1,
      startPos: { x: 0, y: 0 },
      startTime: 0
    });
  };

  return (
    <div className="flex gap-4 p-4 h-screen overflow-hidden">
      {/* Основная область с canvas */}
      <div className="flex flex-col gap-4 flex-1">
        <div className="bg-gray-100 p-3 rounded-lg flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold mb-1">Редактор полигонов (относительные координаты)</h2>
            <div className="text-sm text-gray-600">
              {backgroundImage ? 
                `Загружено изображение ${imageInfo?.width}×${imageInfo?.height}px` : 
                'Режим сетки (нет изображения)'
              }
              {imageInfo && (
                <span className="ml-2 text-blue-600">
                  Масштаб: {(imageInfo.scale * 100).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {selectedPolygon && (
              <button 
                onClick={() => deletePolygon(selectedPolygon)}
                className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
                title="Delete/Backspace"
              >
                Удалить выбранный
              </button>
            )}
            <button 
              onClick={clearAll}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Очистить все
            </button>
          </div>
        </div>
        
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden flex-1">
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
        </div>
        
        <div className="text-sm text-gray-600 bg-white p-2 rounded border">
          Полигонов: {polygons.filter(p => p.closed).length} | 
          В процессе: {isDrawing ? '1' : '0'} | 
          Выбран: {selectedPolygon ? 'Да' : 'Нет'} |
          Размер: {canvasDimensions.width}×{canvasDimensions.height}
          {imageInfo && (
            <span className="ml-2 text-green-600">
              | Координаты относительные ✓
            </span>
          )}
        </div>
      </div>

      {/* Боковая панель со списком */}
      <div className="w-80 bg-gray-50 p-4 rounded-lg flex flex-col">
        <h3 className="text-lg font-bold mb-4">Элементы для привязки</h3>
        
        {selectedPolygon && (
          <div className="mb-4 p-3 bg-orange-100 rounded border-l-4 border-orange-500">
            <div className="text-sm font-medium text-orange-800">
              Полигон выбран
            </div>
            <div className="text-xs text-orange-600">
              Кликните по элементу для привязки, Delete для удаления или ПКМ вне полигона для отмены выделения
            </div>
          </div>
        )}

        {imageInfo && (
          <div className="mb-4 p-3 bg-green-100 rounded border-l-4 border-green-500">
            <div className="text-sm font-medium text-green-800">
              Режим относительных координат
            </div>
            <div className="text-xs text-green-600">
              Полигоны масштабируются вместе с изображением. Рисование ограничено границами изображения.
            </div>
          </div>
        )}

        <div className="space-y-2 flex-1 overflow-y-auto">
          {tableItems.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                item.linkedPolygon
                  ? 'bg-green-100 border-green-300 hover:bg-green-200'
                  : selectedPolygon
                    ? 'bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-400'
                    : 'bg-white border-gray-200'
              }`}
              onClick={() => {
                if (selectedPolygon && !item.linkedPolygon) {
                  linkPolygonToItem(item.id);
                }
              }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{item.name}</div>
                  {item.linkedPolygon && (
                    <div className="text-sm text-green-600 flex items-center gap-2">
                      <span>✓ Привязан к полигону</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          unlinkItem(item.id);
                        }}
                        className="text-red-500 hover:text-red-700"
                        title="Отвязать"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
                
                {item.linkedPolygon && (
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t text-xs text-gray-500">
          <div className="space-y-1">
            <div>🟠 Оранжевый - выбранный полигон</div>
            <div>🟢 Зеленый - привязанный полигон</div>
            <div>🔵 Синий - обычный полигон</div>
          </div>
          <div className="mt-2 pt-2 border-t">
            <div><strong>Управление:</strong></div>
            <div>• ЛКМ - создать/выбрать/редактировать</div>
            <div>• ПКМ по точке - удалить точку</div>
            <div>• ПКМ вне полигона - снять выделение</div>
            <div>• Delete/Backspace - удалить полигон</div>
          </div>
          {imageInfo && (
            <div className="mt-2 pt-2 border-t">
              <div><strong>Относительные координаты:</strong></div>
              <div>• Полигоны привязаны к изображению</div>
              <div>• Автомасштабирование при изменении размера</div>
              <div>• Рисование только в границах изображения</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}