import { CellCoord, cellsEqual } from './CellCoord';
import { addVector2, isFiniteVector2, Vector2 } from './Vector2';
import { WorldGrid } from './WorldGrid';

export class Player {
  private readonly grid: WorldGrid;
  private position: Vector2;
  private currentCell: CellCoord;
  private speed: number;
  private cellChanged = false;

  constructor(grid: WorldGrid, startPosition: Vector2, speed = 250.0) {
    this.grid = grid;
    this.position = startPosition;
    this.currentCell = grid.worldToCell(startPosition);
    this.speed = speed;
    this.setSpeed(speed);
  }

  moveBy(delta: Vector2): boolean {
    if (!isFiniteVector2(delta)) {
      throw new Error('Movement delta must be finite');
    }
    const proposed = addVector2(this.position, delta);
    if (!isFiniteVector2(proposed)) {
      throw new RangeError('Movement would produce a non-finite position');
    }
    this.setPosition(proposed);
    return true;
  }

  setPosition(newPosition: Vector2): void {
    const newCell = this.grid.worldToCell(newPosition);
    this.cellChanged = !cellsEqual(newCell, this.currentCell);
    this.position = newPosition;
    this.currentCell = newCell;
  }

  getPosition(): Vector2 {
    return this.position;
  }

  getCurrentCell(): CellCoord {
    return this.currentCell;
  }

  hasChangedCell(): boolean {
    return this.cellChanged;
  }

  getSpeed(): number {
    return this.speed;
  }

  setSpeed(speed: number): void {
    if (!Number.isFinite(speed) || speed <= 0) {
      throw new Error('Player speed must be a positive finite number');
    }
    this.speed = speed;
  }
}
