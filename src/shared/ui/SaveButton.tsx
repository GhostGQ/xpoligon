import React from 'react';

interface SaveButtonProps {
  onSave: () => void;
  polygonsCount: number;
  linkedCount: number;
  disabled?: boolean;
  className?: string;
}

export const SaveButton: React.FC<SaveButtonProps> = ({
  onSave,
  polygonsCount,
  linkedCount,
  disabled = false,
  className = ''
}) => {
  if (polygonsCount === 0) {
    return null; // Не показываем кнопку если нет полигонов
  }

  return (
    <button
      onClick={onSave}
      disabled={disabled}
      className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
        disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors
        flex items-center gap-2 ${className}`}
      title={`Сохранить ${polygonsCount} полигон(ов), из них ${linkedCount} привязаны`}
    >
      <span>💾</span>
      <span>Сохранить</span>
      <span className="text-xs bg-blue-500 px-2 py-1 rounded">
        {polygonsCount}
      </span>
    </button>
  );
};
