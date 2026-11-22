import { CellCoord, cellKey } from './CellCoord';
import { isFiniteVector2 } from './Vector2';
import { WorldGrid } from './WorldGrid';
import { WorldObject } from './WorldObject';

export class WorldObjectManager {
  private readonly grid: WorldGrid;
  private readonly objects = new Map<string, WorldObject>();
  private readonly objectsByCell = new Map<string, string[]>();

  constructor(grid: WorldGrid) {
    this.grid = grid;
  }

  addObject(object: WorldObject): boolean {
    if (!object.id || !object.name) {
      throw new Error('World object id and name must not be empty');
    }
    if (!isFiniteVector2(object.position)) {
      throw new Error('World object position must be finite');
    }
    if (this.objects.has(object.id)) {
      return false;
    }

    const cell = this.grid.worldToCell(object.position);
    const key = cellKey(cell);
    this.objects.set(object.id, object);
    const list = this.objectsByCell.get(key) ?? [];
    list.push(object.id);
    this.objectsByCell.set(key, list);
    return true;
  }

  removeObject(id: string): boolean {
    const object = this.objects.get(id);
    if (!object) {
      return false;
    }

    const key = cellKey(this.grid.worldToCell(object.position));
    const list = this.objectsByCell.get(key);
    if (list) {
      const next = list.filter((item) => item !== id);
      if (next.length === 0) {
        this.objectsByCell.delete(key);
      } else {
        this.objectsByCell.set(key, next);
      }
    }
    this.objects.delete(id);
    return true;
  }

  findObject(id: string): WorldObject | null {
    return this.objects.get(id) ?? null;
  }

  getObjectsInCell(cell: CellCoord): WorldObject[] {
    const list = this.objectsByCell.get(cellKey(cell));
    if (!list) {
      return [];
    }
    const result: WorldObject[] = [];
    for (const id of list) {
      const obj = this.objects.get(id);
      if (obj) {
        result.push(obj);
      }
    }
    return result;
  }

  getBlockingObject(cell: CellCoord): WorldObject | null {
    const objects = this.getObjectsInCell(cell);
    for (const obj of objects) {
      if (obj.blocking) {
        return obj;
      }
    }
    return null;
  }

  objectCount(): number {
    return this.objects.size;
  }

  getAllObjects(): WorldObject[] {
    return Array.from(this.objects.values());
  }
}
