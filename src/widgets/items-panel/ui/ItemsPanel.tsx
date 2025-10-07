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
  children?: React.ReactNode;
}

export const ItemsPanel: React.FC<ItemsPanelProps> = ({
  workplaces,
  polygons,
  selectedPolygon,
  onLinkPolygonToItem,
  onUnlinkItem,
  children,
}) => {
  // Функция для проверки, привязано ли рабочее место к полигону
  const isWorkplaceLinked = (workplaceId: string) => {
    return polygons.some(polygon => polygon.linkedWorkplace === workplaceId);
  };

  return (
    <div className='flex flex-col p-4 rounded-lg w-80 bg-gray-50'>
      <h3 className='mb-4 text-lg font-bold'>Workplaces</h3>

      {selectedPolygon && (
        <div className='p-3 mb-4 bg-orange-100 border-l-4 border-orange-500 rounded'>
          <div className='text-sm font-medium text-orange-800'>
            Polygon selected
          </div>
          <div className='text-xs text-orange-600'>
            Click on a workplace to link, Delete to remove, or right-click
            outside the polygon to cancel selection
          </div>
        </div>
      )}

      <div className='flex-1 space-y-2 overflow-y-auto'>
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
              <div className='flex items-center justify-between'>
                <div className='space-y-1 flex flex-col items-start'>
                  <div className='font-medium'>{workplace.name}</div>
                  <div className='flex flex-wrap gap-1'>
                    {workplace.employees &&
                      workplace.employees.length > 0 &&
                      workplace.employees?.map(emp => (
                        <div className='text-sm text-gray-600 bg-gray-50 px-2 mt-1 rounded-lg'>
                          {emp.name}
                        </div>
                      ))}
                  </div>
                  {isLinked && (
                    <div className='text-sm text-green-600 flex items-center gap-2'>
                      <span>✓ Привязан к полигону</span>
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

      {/* Helper buttons */}
      <div>{children}</div>

      <div className='pt-4 mt-4 text-xs text-gray-500 border-t'>
        <div className='space-y-1'>
          <div>🟠 Orange - selected polygon</div>
          <div>🟢 Green - linked polygon</div>
          <div>🔵 Blue - regular polygon</div>
        </div>
        <div className='pt-2 mt-2 border-t'>
          <div>
            <strong>Controls:</strong>
          </div>
          <div>• Left-click - create/select/edit</div>
          <div>• Right-click on a point - remove point</div>
          <div>• Right-click outside the polygon - cancel selection</div>
          <div>• Delete - remove polygon</div>
        </div>
      </div>
    </div>
  );
};
