import React from 'react';
import type { TableItem } from '../../entities/table';

export interface TableSidebarProps {
  tableItems: TableItem[];
  selectedPolygon: string | null;
  onLinkPolygon: (itemId: string) => void;
  onUnlinkItem: (itemId: string) => void;
}

const TableSidebar: React.FC<TableSidebarProps> = ({
  tableItems,
  selectedPolygon,
  onLinkPolygon,
  onUnlinkItem,
}) => {
  return (
    <div className='w-80 bg-gray-50 p-4 rounded-lg flex flex-col'>
      <h3 className='text-lg font-bold mb-4'>Элементы для привязки</h3>

      {selectedPolygon && (
        <div className='mb-4 p-3 bg-orange-100 rounded border-l-4 border-orange-500'>
          <div className='text-sm font-medium text-orange-800'>
            Полигон выбран
          </div>
          <div className='text-xs text-orange-600'>
            Кликните по элементу для привязки, Delete для удаления или ПКМ вне
            полигона для отмены выделения
          </div>
        </div>
      )}

      <div className='space-y-2 flex-1 overflow-y-auto'>
        {tableItems.map(item => (
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
                onLinkPolygon(item.id);
              }
            }}
          >
            <div className='flex justify-between items-center'>
              <div>
                <div className='font-medium'>{item.name}</div>
                {item.linkedPolygon && (
                  <div className='text-sm text-green-600 flex items-center gap-2'>
                    <span>✓ Привязан к полигону</span>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onUnlinkItem(item.id);
                      }}
                      className='text-red-500 hover:text-red-700'
                      title='Отвязать'
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {item.linkedPolygon && (
                <div className='w-4 h-4 bg-green-500 rounded-full'></div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className='mt-4 pt-4 border-t text-xs text-gray-500'>
        <div className='space-y-1'>
          <div>🟠 Оранжевый - выбранный полигон</div>
          <div>🟢 Зеленый - привязанный полигон</div>
          <div>🔵 Синий - обычный полигон</div>
        </div>
        <div className='mt-2 pt-2 border-t'>
          <div>
            <strong>Управление:</strong>
          </div>
          <div>• ЛКМ - создать/выбрать/редактировать</div>
          <div>• ПКМ по точке - удалить точку</div>
          <div>• ПКМ вне полигона - снять выделение</div>
          <div>• Delete/Backspace - удалить полигон</div>
        </div>
      </div>
    </div>
  );
};

export default TableSidebar;
