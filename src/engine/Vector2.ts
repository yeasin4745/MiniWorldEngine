export interface Vector2 {
  readonly x: number;
  readonly y: number;
}

export function createVector2(x = 0, y = 0): Vector2 {
  return { x, y };
}

export function isFiniteVector2(v: Vector2): boolean {
  return Number.isFinite(v.x) && Number.isFinite(v.y);
}

export function addVector2(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function subtractVector2(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function scaleVector2(v: Vector2, scalar: number): Vector2 {
  return { x: v.x * scalar, y: v.y * scalar };
}
