import React from 'react';

interface SaveStatusProps {
  lastSaved: string | null;
  cameraId: string;
  isLoading?: boolean;
  className?: string;
}

export const SaveStatus: React.FC<SaveStatusProps> = ({
  lastSaved,
  cameraId,
  isLoading = false,
  className = ''
}) => {
  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return 'Неизвестно';
    }
  };

  if (isLoading) {
    return (
      <div className={`text-xs text-gray-500 ${className}`}>
        <span className="animate-pulse">🔄 Загрузка данных камеры...</span>
      </div>
    );
  }

  return (
    <div className={`text-xs text-gray-500 flex items-center gap-2 ${className}`}>
      <span>📹 Камера: {cameraId}</span>
      {lastSaved && (
        <span className="text-green-600">
          💾 Сохранено: {formatTime(lastSaved)}
        </span>
      )}
    </div>
  );
};
