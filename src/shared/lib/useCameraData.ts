import { useState, useEffect } from 'react';
import type { Camera, Workplace, Polygon } from '@entities/index';
import { cameraApi } from '../../shared/api';

interface UseCameraDataProps {
  cameraId?: string;
}

export const useCameraData = ({ cameraId }: UseCameraDataProps) => {
  const [camera, setCamera] = useState<Camera | null>(null);
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCameraData = async (camId: string) => {
    setLoading(true);
    setError(null);

    try {
      const [cameraData, workplacesData, polygonsData] = await Promise.all([
        cameraApi.getCameraById(camId),
        cameraApi.getWorkplacesByCamera(camId),
        cameraApi.getPolygonsByCamera(camId),
      ]);

      setCamera(cameraData);
      setWorkplaces(workplacesData);
      setPolygons(polygonsData);
    } catch (err) {
      setError('Ошибка загрузки данных камеры');
      console.error('Error loading camera data:', err);
    } finally {
      setLoading(false);
    }
  };

  const savePolygons = async (polygonsToSave: Polygon[], imageWidth?: number, imageHeight?: number) => {
    if (!cameraId) {
      throw new Error('Camera ID is required');
    }

    try {
      const result = await cameraApi.savePolygonsForCamera(cameraId, polygonsToSave, imageWidth, imageHeight);
      if (result.success) {
        setPolygons(polygonsToSave);
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError('Ошибка сохранения полигонов');
      throw err;
    }
  };

  const deletePolygons = async (polygonsToDelete: Polygon[], imageWidth?: number, imageHeight?: number) => {
    if (!cameraId) return;

    try {
      await cameraApi.savePolygonsForCamera(cameraId, polygonsToDelete, imageWidth, imageHeight);
      setPolygons(polygonsToDelete);
    } catch (err) {
      console.error('Error deleting polygons:', err);
    }
  };

  useEffect(() => {
    if (cameraId) {
      loadCameraData(cameraId);
    }
  }, [cameraId]);

  return {
    camera,
    workplaces,
    polygons,
    loading,
    error,
    savePolygons,
    deletePolygons,
    refetch: () => cameraId && loadCameraData(cameraId),
  };
};
