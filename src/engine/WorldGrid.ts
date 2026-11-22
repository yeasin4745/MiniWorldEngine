import { CellCoord } from './CellCoord';
import { isFiniteVector2, Vector2 } from './Vector2';

export class WorldGrid {
  private readonly cellSize: number;

  constructor(cellSize: number) {
    if (!Number.isFinite(cellSize) || cellSize <= 0) {
      throw new Error('WorldGrid cell size must be a positive finite number');
    }
    this.cellSize = cellSize;
  }

  worldToCell(worldPosition: Vector2): CellCoord {
    if (!isFiniteVector2(worldPosition)) {
      throw new Error('World position must contain finite coordinates');
    }

    const cellX = Math.floor(worldPosition.x / this.cellSize);
    const cellY = Math.floor(worldPosition.y / this.cellSize);

    if (!Number.isSafeInteger(cellX) || !Number.isSafeInteger(cellY)) {
      throw new RangeError('World position is outside the supported cell-coordinate range');
    }

    return { x: cellX, y: cellY };
  }

  cellToWorldOrigin(cell: CellCoord): Vector2 {
    return {
      x: cell.x * this.cellSize,
      y: cell.y * this.cellSize,
    };
  }

  cellToWorldCenter(cell: CellCoord): Vector2 {
    const origin = this.cellToWorldOrigin(cell);
    return {
      x: origin.x + this.cellSize / 2,
      y: origin.y + this.cellSize / 2,
    };
  }

  getNeighborCells(center: CellCoord, radius: number, includeCenter = true): CellCoord[] {
    if (!Number.isInteger(radius) || radius < 0 || radius > 100) {
      throw new Error('Neighbor radius must be between 0 and 100');
    }

    const cells: CellCoord[] = [];
    for (let y = -radius; y <= radius; y += 1) {
      for (let x = -radius; x <= radius; x += 1) {
        if (!includeCenter && x === 0 && y === 0) {
          continue;
        }
        const nx = center.x + x;
        const ny = center.y + y;
        if (!Number.isSafeInteger(nx) || !Number.isSafeInteger(ny)) {
          throw new RangeError('Neighbor cell coordinate overflow');
        }
        cells.push({ x: nx, y: ny });
      }
    }
    return cells;
  }

  getCellSize(): number {
    return this.cellSize;
  }
}
