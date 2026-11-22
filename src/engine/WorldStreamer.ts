import { CellCoord, cellKey, parseCellKey } from './CellCoord';
import { WorldGrid } from './WorldGrid';

export class WorldStreamer {
  private readonly grid: WorldGrid;
  private readonly loadRadius: number;
  private loadedCellKeys = new Set<string>();
  private lastLoadedCount = 0;
  private lastUnloadedCount = 0;

  constructor(grid: WorldGrid, loadRadius = 3) {
    if (!Number.isInteger(loadRadius) || loadRadius < 0 || loadRadius > 100) {
      throw new Error('Streaming radius must be between 0 and 100');
    }
    this.grid = grid;
    this.loadRadius = loadRadius;
  }

  update(playerCell: CellCoord): boolean {
    const desiredList = this.grid.getNeighborCells(playerCell, this.loadRadius, true);
    const desired = new Set<string>();
    for (const cell of desiredList) {
      desired.add(cellKey(cell));
    }

    let loaded = 0;
    let unloaded = 0;
    for (const key of desired) {
      if (!this.loadedCellKeys.has(key)) {
        loaded += 1;
      }
    }
    for (const key of this.loadedCellKeys) {
      if (!desired.has(key)) {
        unloaded += 1;
      }
    }

    this.lastLoadedCount = loaded;
    this.lastUnloadedCount = unloaded;

    const changed = loaded > 0 || unloaded > 0;
    this.loadedCellKeys = desired;
    return changed;
  }

  isLoaded(cell: CellCoord): boolean {
    return this.loadedCellKeys.has(cellKey(cell));
  }

  loadedCellCount(): number {
    return this.loadedCellKeys.size;
  }

  getLastLoadedCount(): number {
    return this.lastLoadedCount;
  }

  getLastUnloadedCount(): number {
    return this.lastUnloadedCount;
  }

  getLoadRadius(): number {
    return this.loadRadius;
  }

  loadedCells(): CellCoord[] {
    return Array.from(this.loadedCellKeys).map(parseCellKey);
  }
}
