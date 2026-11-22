export interface CellCoord {
  readonly x: number;
  readonly y: number;
}

export function cellsEqual(a: CellCoord, b: CellCoord): boolean {
  return a.x === b.x && a.y === b.y;
}

export function cellKey(cell: CellCoord): string {
  return `${cell.x},${cell.y}`;
}

export function parseCellKey(key: string): CellCoord {
  const [xStr, yStr] = key.split(',');
  return { x: Number(xStr), y: Number(yStr) };
}
