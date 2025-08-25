import { useState, useEffect } from 'react';
import type { ImageInfo, CanvasDimensions } from '../../shared/types';

interface UseImageProcessingProps {
  cameraImage?: string;
  canvasDimensions: CanvasDimensions;
}

export const useImageProcessing = ({ cameraImage, canvasDimensions }: UseImageProcessingProps) => {
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);

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

  return { backgroundImage, imageInfo };
};
