import React, {useState, useEffect} from 'react';
import type {Point, CameraResponse} from '../../shared/types';
import type {DragState} from '../../entities/polygon';
import {useCameraData} from '../../shared/hooks';
import {usePolygonDrawing} from '../../features/polygon-drawing';
import {usePolygonLinking} from '../../features/polygon-linking';
import {PolygonEditorWidget} from '../../widgets/polygon-editor';
import {TableSidebar} from '../../widgets/table-sidebar';

export interface PolygonEditorPageProps {
  cameraId: string;
  cameraImage?: string;
  initialData?: CameraResponse;
}

const PolygonEditorPage: React.FC<PolygonEditorPageProps> = ({
  cameraId,
  cameraImage,
  initialData,
}) => {
  // Использование хука для работы с данными камеры
  const {
    polygons,
    setPolygons,
    tableItems,
    setTableItems,
    isLoading,
    lastSaved,
  } = useCameraData({cameraId, initialData});

  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedPolygon, setSelectedPolygon] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<Point>({x: 0, y: 0});

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragType: null,
    polygonIndex: -1,
    pointIndex: -1,
    startPos: {x: 0, y: 0},
    startTime: 0,
  });

  // Хуки для управления полигонами
  const {handleMouseDown, handleMouseMove, handleMouseUp, handleContextMenu} =
    usePolygonDrawing({
      polygons,
      setPolygons,
      isDrawing,
      setIsDrawing,
      selectedPolygon,
      setSelectedPolygon,
      dragState,
      setDragState,
      mousePos,
    });

  const {linkPolygonToItem, unlinkItem, deletePolygon, clearAll} =
    usePolygonLinking({
      polygons,
      setPolygons,
      tableItems,
      setTableItems,
      selectedPolygon,
      setSelectedPolygon,
      cameraId,
    });

  // Обработка клавиш Delete и Backspace
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedPolygon) {
        e.preventDefault();
        deletePolygon(cameraId, selectedPolygon);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedPolygon, deletePolygon]);

  // Обновление позиции мыши
  const handleMouseMoveWithPos = (e: React.MouseEvent) => {
    const canvas = e.target as HTMLCanvasElement;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      setMousePos({
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      });
    }
    handleMouseMove(e);
  };

  const handleDeleteSelected = () => {
    if (selectedPolygon) {
      deletePolygon(cameraId, selectedPolygon);
    }
  };

  return (
    <div className='flex gap-4 p-4 h-screen overflow-hidden'>
      <PolygonEditorWidget
        cameraId={cameraId}
        cameraImage={cameraImage}
        polygons={polygons}
        isDrawing={isDrawing}
        selectedPolygon={selectedPolygon}
        tableItems={tableItems}
        mousePos={mousePos}
        lastSaved={lastSaved}
        isLoading={isLoading}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMoveWithPos}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
        onDeleteSelected={handleDeleteSelected}
        onClearAll={clearAll}
      />

      <TableSidebar
        tableItems={tableItems}
        selectedPolygon={selectedPolygon}
        onLinkPolygon={linkPolygonToItem}
        onUnlinkItem={unlinkItem}
      />
    </div>
  );
};

export default PolygonEditorPage;
