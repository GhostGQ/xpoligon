import type { Polygon } from '../../entities/polygon';

/**
 * Converts polygons with absolute coordinates (pixels) to relative (0-1) coordinates.
 * If points are already relative, returns them unchanged.
 * @param polygons Array of polygons
 * @param imageWidth Width of the image
 * @param imageHeight Height of the image
 */
export function convertPolygonsToRelative(polygons: Polygon[], imageWidth: number, imageHeight: number): Polygon[] {
  if (!imageWidth || !imageHeight) return polygons;
  return polygons.map(polygon => {
    // If at least one point is out of [0,1], treat as absolute
    const isAbsolute = polygon.points.some(pt => pt.x > 1 || pt.y > 1);
    if (!isAbsolute) return polygon;
    return {
      ...polygon,
      points: polygon.points.map(pt => ({
        x: pt.x / imageWidth,
        y: pt.y / imageHeight,
      })),
    };
  });
}
