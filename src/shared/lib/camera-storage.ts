import type { CameraData, LocalStorageData, Polygon, TableItem } from '../types';

const STORAGE_KEY = 'polygon_editor_cameras';
const STORAGE_VERSION = 1;

export class CameraStorageService {
  private static getStorageData(): LocalStorageData {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return {};
      return JSON.parse(data);
    } catch (error) {
      console.error('Ошибка при чтении данных из localStorage:', error);
      return {};
    }
  }

  private static saveStorageData(data: LocalStorageData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Ошибка при сохранении данных в localStorage:', error);
    }
  }

  static saveCameraData(
    cameraId: string,
    polygons: Polygon[],
    tableItems: TableItem[]
  ): void {
    const allData = this.getStorageData();

    allData[cameraId] = {
      cameraId,
      polygons: polygons.filter(p => p.closed), // Сохраняем только завершенные полигоны
      tableItems,
      lastSaved: new Date().toISOString(),
      version: STORAGE_VERSION,
    };

    this.saveStorageData(allData);
    console.log(`🔄 Данные камеры ${cameraId} автоматически сохранены в localStorage`);
  }

  static loadCameraData(cameraId: string): CameraData | null {
    const allData = this.getStorageData();
    const cameraData = allData[cameraId];

    if (!cameraData) {
      console.log(`📥 Данные для камеры ${cameraId} не найдены в localStorage`);
      return null;
    }

    console.log(`📥 Загружены данные камеры ${cameraId} из localStorage:`, {
      polygons: cameraData.polygons.length,
      linkedPolygons: cameraData.polygons.filter(p => p.linkedItem).length,
      lastSaved: cameraData.lastSaved
    });

    return cameraData;
  }

  static clearCameraData(cameraId: string): void {
    const allData = this.getStorageData();
    delete allData[cameraId];
    this.saveStorageData(allData);
    console.log(`🗑️ Данные камеры ${cameraId} удалены из localStorage`);
  }

  static deleteCameraPoligon(cameraId: string, polygonId: string): void {
    const allData = this.getStorageData();
    const cameraData = allData[cameraId];
    if (!cameraData) return;

    cameraData.polygons = cameraData.polygons.filter(p => p.id !== polygonId);
    cameraData.tableItems = cameraData.tableItems.map(item =>
      item.linkedPolygon === polygonId ? { ...item, linkedPolygon: null } : item
    );

    this.saveStorageData(allData);
    console.log(`🗑️ Полигон ${polygonId} удален из данных камеры ${cameraId}`);
  }

  static getAllCameraIds(): string[] {
    const allData = this.getStorageData();
    return Object.keys(allData);
  }

  static getCameraDataSize(cameraId: string): number {
    const cameraData = this.loadCameraData(cameraId);
    if (!cameraData) return 0;

    try {
      return new Blob([JSON.stringify(cameraData)]).size;
    } catch {
      return 0;
    }
  }
}
