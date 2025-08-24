import type { Point } from '../types';

export const getDistance = (p1: Point, p2: Point): number => {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};
