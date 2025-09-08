import type {Workplace} from '../../../entities/workplace';
import type {Polygon} from '../../../entities/polygon';
import type {ImageInfo} from '../../../shared/types';

interface ItemsPanelProps {
  workplaces: Workplace[];
  polygons: Polygon[];
  selectedPolygon: string | null;
  imageInfo: ImageInfo | null;
  onLinkPolygonToItem: (workplaceId: string) => void;
  onUnlinkItem: (workplaceId: string) => void;
}

export const ItemsPanel: React.FC<ItemsPanelProps> = ({
  workplaces,
  polygons,
  selectedPolygon,
  onLinkPolygonToItem,
  onUnlinkItem,
}) => {
  // Функция для проверки, привязано ли рабочее место к полигону
  const isWorkplaceLinked = (workplaceId: string) => {
    return polygons.some(polygon => polygon.linkedWorkplace === workplaceId);
  };

  return (
    <div className='w-80 bg-gray-50 p-4 rounded-lg flex flex-col'>
      <h3 className='text-lg font-bold mb-4'>Workplaces</h3>

      {selectedPolygon && (
        <div className='mb-4 p-3 bg-orange-100 rounded border-l-4 border-orange-500'>
          <div className='text-sm font-medium text-orange-800'>
            Polygon selected
          </div>
          <div className='text-xs text-orange-600'>
            Click on a workplace to link, Delete to remove, or right-click
            outside the polygon to cancel selection
          </div>
        </div>
      )}

      <div className='space-y-2 flex-1 overflow-y-auto'>
        {workplaces.map(workplace => {
          const isLinked = isWorkplaceLinked(workplace.id);

          return (
            <div
              key={workplace.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                isLinked
                  ? 'bg-green-100 border-green-300 hover:bg-green-200'
                  : selectedPolygon
                  ? 'bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-400'
                  : 'bg-white border-gray-200'
              }`}
              onClick={() => {
                if (selectedPolygon && !isLinked) {
                  onLinkPolygonToItem(workplace.id);
                }
              }}
            >
              <div className='flex justify-between items-center'>
                <div>
                  <div className='font-medium'>{workplace.name}</div>
                  {workplace.description && (
                    <div className='text-sm text-gray-500'>
                      {workplace.description}
                    </div>
                  )}
                  {isLinked && (
                    <div className='text-sm text-green-600 flex items-center gap-2'>
                      <span>✓ Linked to polygon</span>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onUnlinkItem(workplace.id);
                        }}
                        className='text-red-500 hover:text-red-700'
                        title='Отвязать'
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {isLinked && (
                  <div className='w-4 h-4 bg-green-500 rounded-full'></div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className='mt-4 pt-4 border-t text-xs text-gray-500'>
        <div className='space-y-1'>
          <div>🟠 Orange - selected polygon</div>
          <div>🟢 Green - linked polygon</div>
          <div>🔵 Blue - regular polygon</div>
        </div>
        <div className='mt-2 pt-2 border-t'>
          <div>
            <strong>Controls:</strong>
          </div>
          <div>• Left-click - create/select/edit</div>
          <div>• Right-click on a point - remove point</div>
          <div>• Right-click outside the polygon - cancel selection</div>
          <div>• Delete/Backspace - remove polygon</div>
        </div>
      </div>
    </div>
  );
};
