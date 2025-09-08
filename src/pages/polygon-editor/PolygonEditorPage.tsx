import {useState, useEffect} from 'react';
import type {Polygon} from '../../entities/polygon';
import type {PolygonEditorProps} from '../../shared/types';
import {
  generateId,
  useImageProcessing,
  useCanvasDimensions,
  usePolygonChanges,
} from '../../shared/lib';
import {usePolygonLinking} from '../../features/polygon-linking';
import {PolygonCanvas} from '../../widgets/polygon-canvas';
import {ItemsPanel} from '../../widgets/items-panel';
import {Button, Loading} from '../../shared/ui';

export const PolygonEditorPage: React.FC<PolygonEditorProps> = ({
  data,
  loading = false,
  onSave,
  onChange,
  onError,
  debug = false,
}) => {
  const canvasDimensions = useCanvasDimensions();
  const {camera, workplaces, polygons: initialPolygons} = data;

  const {backgroundImage, imageInfo} = useImageProcessing({
    cameraImage: camera.screenshot,
    canvasDimensions,
  });

  const [polygons, setPolygons] = useState<Polygon[]>(initialPolygons);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedPolygon, setSelectedPolygon] = useState<string | null>(null);

  // Отслеживание изменений полигонов (без автосохранения)
  usePolygonChanges({
    polygons,
    cameraId: camera.id,
    imageWidth: imageInfo?.width,
    imageHeight: imageInfo?.height,
    onChange,
    onSave,
  });

  const {linkPolygonToItem, unlinkItem} = usePolygonLinking({
    polygons,
    workplaces,
    setPolygons,
  });

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
    const updatedPolygons = polygons.filter(p => p.id !== polygonId);
    setPolygons(updatedPolygons);
    setSelectedPolygon(null);
  };

  const clearAll = () => {
    setPolygons([]);
    setIsDrawing(false);
    setSelectedPolygon(null);
  };

  const handleLinkPolygonToItem = (workplaceId: string) => {
    if (selectedPolygon) {
      linkPolygonToItem(selectedPolygon, workplaceId);
    }
  };

  const handleManualSave = () => {
    if (onSave && imageInfo?.width && imageInfo?.height) {
      try {
        const saveData = {
          cameraId: camera.id,
          imageSize: {
            width: imageInfo.width,
            height: imageInfo.height,
          },
          regions: polygons.map(p => ({
            id: p.id,
            linkedWorkplace: p.linkedWorkplace,
            relativeCoordinates: p.points,
            pixelCoordinates: p.points.map(point => ({
              x: Math.round(point.x * imageInfo.width),
              y: Math.round(point.y * imageInfo.height),
            })),
            closed: p.closed,
          })),
          timestamp: new Date().toISOString(),
        };
        onSave(saveData);
      } catch (error) {
        onError?.('Ошибка при сохранении полигонов');
        if (debug) {
          console.error('Save error:', error);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loading />
      </div>
    );
  }

  return (
    <div className='flex gap-4 p-4 h-screen overflow-hidden'>
      {/* Основная область с canvas */}
      <div className='flex flex-col gap-4 flex-1'>
        <div className='bg-gray-100 p-3 rounded-lg flex justify-between items-center'>
          <div>
            <h2 className='text-lg font-bold mb-1'>{camera.name}</h2>
            <div className='text-sm text-gray-600'>
              {backgroundImage
                ? `Loaded image ${imageInfo?.width}×${imageInfo?.height}px`
                : 'Grid mode (no image)'}
              {imageInfo && (
                <span className='ml-2 text-blue-600'>
                  Scale: {(imageInfo.scale * 100).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
          <div className='flex gap-2'>
            <Button
              onClick={handleManualSave}
              variant='primary'
              disabled={polygons.length === 0}
            >
              Save now
            </Button>
            {selectedPolygon && (
              <Button
                onClick={() => deletePolygon(selectedPolygon)}
                variant='warning'
                title='Delete/Backspace'
              >
                Delete selected
              </Button>
            )}
            <Button onClick={clearAll} variant='danger'>
              Clear all
            </Button>
          </div>
        </div>

        <div className='border-2 border-gray-300 rounded-lg overflow-hidden flex-1'>
          <PolygonCanvas
            canvasDimensions={canvasDimensions}
            backgroundImage={backgroundImage}
            imageInfo={imageInfo}
            polygons={polygons}
            setPolygons={setPolygons}
            isDrawing={isDrawing}
            setIsDrawing={setIsDrawing}
            selectedPolygon={selectedPolygon}
            setSelectedPolygon={setSelectedPolygon}
            workplaces={workplaces}
            generateId={generateId}
            cameraId={camera.id}
          />
        </div>

        <div className='text-sm text-gray-600 bg-white p-2 rounded border'>
          Polygons: {polygons.filter(p => p.closed).length} | In progress:{' '}
          {isDrawing ? '1' : '0'} | Selected: {selectedPolygon ? 'Yes' : 'No'} |
          Size: {canvasDimensions.width}×{canvasDimensions.height}
          {imageInfo && (
            <span className='ml-2 text-green-600'>
              | Relative coordinates ✓
            </span>
          )}
        </div>
      </div>

      {/* Боковая панель со списком */}
      <ItemsPanel
        workplaces={workplaces}
        polygons={polygons}
        selectedPolygon={selectedPolygon}
        imageInfo={imageInfo}
        onLinkPolygonToItem={handleLinkPolygonToItem}
        onUnlinkItem={unlinkItem}
      />
    </div>
  );
};
