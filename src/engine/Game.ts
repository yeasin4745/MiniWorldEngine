import { CellCoord, cellsEqual } from './CellCoord';
import { Player } from './Player';
import { addVector2, isFiniteVector2, Vector2 } from './Vector2';
import { WorldGrid } from './WorldGrid';
import { WorldObjectManager } from './WorldObjectManager';
import { WorldStreamer } from './WorldStreamer';

export interface MoveResult {
  moved: boolean;
  message: string | null;
  blockedBy: string | null;
  cellChanged: boolean;
  loadedCount: number;
  unloadedCount: number;
}

export interface SaveLoadResult {
  success: boolean;
  error?: string;
  serialized?: string;
}

const SAVE_STORAGE_PREFIX = 'miniworld_save_';

export class Game {
  private readonly grid: WorldGrid;
  private readonly player: Player;
  private readonly objects: WorldObjectManager;
  private readonly streamer: WorldStreamer;
  private readonly stepSize = 250.0;

  constructor() {
    this.grid = new WorldGrid(500.0);
    this.player = new Player(this.grid, { x: 250.0, y: 250.0 }, 250.0);
    this.objects = new WorldObjectManager(this.grid);
    this.streamer = new WorldStreamer(this.grid, 4);
    this.populateWorld();
    this.streamer.update(this.player.getCurrentCell());
  }

  private populateWorld(): void {
    this.objects.addObject({
      id: 'oak_1',
      name: 'Oak tree',
      description: 'A large tree. It blocks movement.',
      position: { x: 1250.0, y: 250.0 },
      symbol: 'T',
      blocking: true,
    });
    this.objects.addObject({
      id: 'rock_1',
      name: 'Rock',
      description: 'A heavy rock. It blocks movement.',
      position: { x: 250.0, y: 1250.0 },
      symbol: 'R',
      blocking: true,
    });
    this.objects.addObject({
      id: 'cabin_1',
      name: 'Small cabin',
      description: 'A wooden cabin. It blocks movement.',
      position: { x: -750.0, y: -250.0 },
      symbol: 'H',
      blocking: true,
    });
    this.objects.addObject({
      id: 'pond_1',
      name: 'Pond',
      description: 'A quiet pond. You cannot walk through water.',
      position: { x: 1250.0, y: 1250.0 },
      symbol: 'W',
      blocking: true,
    });
    this.objects.addObject({
      id: 'flower_1',
      name: 'Wild flowers',
      description: 'A patch of colourful wild flowers.',
      position: { x: -250.0, y: 250.0 },
      symbol: '*',
      blocking: false,
    });
    this.objects.addObject({
      id: 'sign_1',
      name: 'Wooden sign',
      description: 'The sign reads: Welcome to MiniWorld!',
      position: { x: 250.0, y: -750.0 },
      symbol: 'S',
      blocking: false,
    });
  }

  movePlayer(direction: string): MoveResult {
    let delta: Vector2;
    switch (direction.toLowerCase()) {
      case 'w':
        delta = { x: 0.0, y: -this.stepSize };
        break;
      case 's':
        delta = { x: 0.0, y: this.stepSize };
        break;
      case 'a':
        delta = { x: -this.stepSize, y: 0.0 };
        break;
      case 'd':
        delta = { x: this.stepSize, y: 0.0 };
        break;
      default:
        return {
          moved: false,
          message: null,
          blockedBy: null,
          cellChanged: false,
          loadedCount: 0,
          unloadedCount: 0,
        };
    }

    const proposed = addVector2(this.player.getPosition(), delta);
    const targetCell = this.grid.worldToCell(proposed);
    const obstacle = this.objects.getBlockingObject(targetCell);
    if (obstacle) {
      return {
        moved: false,
        message: `Blocked by ${obstacle.name}. Try another direction.`,
        blockedBy: obstacle.name,
        cellChanged: false,
        loadedCount: 0,
        unloadedCount: 0,
      };
    }

    this.player.moveBy(delta);
    const cellChanged = this.player.hasChangedCell();
    let message: string | null = null;
    if (cellChanged) {
      this.streamer.update(this.player.getCurrentCell());
      const cell = this.player.getCurrentCell();
      message = `Entered cell (${cell.x}, ${cell.y}). Streaming window updated: +${this.streamer.getLastLoadedCount()} loaded, -${this.streamer.getLastUnloadedCount()} unloaded.`;
    }

    return {
      moved: true,
      message,
      blockedBy: null,
      cellChanged,
      loadedCount: this.streamer.getLastLoadedCount(),
      unloadedCount: this.streamer.getLastUnloadedCount(),
    };
  }

  renderText(): string {
    const center = this.player.getCurrentCell();
    const radius = this.streamer.getLoadRadius();
    const lines: string[] = [];

    lines.push('');
    lines.push('                 MINIWORLD MAP');
    let header = '       X ->  ';
    for (let x = -radius; x <= radius; x += 1) {
      header += String(center.x + x).padStart(3, ' ');
    }
    lines.push(header);

    for (let y = -radius; y <= radius; y += 1) {
      const worldY = center.y + y;
      let row = `Y=${String(worldY).padStart(4, ' ')}  `;
      for (let x = -radius; x <= radius; x += 1) {
        const cell: CellCoord = { x: center.x + x, y: worldY };
        let symbol = '.';
        if (!this.streamer.isLoaded(cell)) {
          symbol = '?';
        }
        if (cellsEqual(cell, center)) {
          symbol = '@';
        } else {
          const cellObjects = this.objects.getObjectsInCell(cell);
          if (cellObjects.length > 0) {
            symbol = cellObjects[0].symbol;
          }
        }
        row += symbol.padStart(3, ' ');
      }
      lines.push(row);
    }

    lines.push('');
    lines.push(
      'Legend: @ Player | T Tree | R Rock | H Cabin | W Water | * Flowers | S Sign | . Empty'
    );
    return lines.join('\n');
  }

  statusText(): string {
    const pos = this.player.getPosition();
    const cell = this.player.getCurrentCell();
    return (
      `Position: (${pos.x}, ${pos.y})` +
      ` | Cell: (${cell.x}, ${cell.y})` +
      ` | Loaded cells: ${this.streamer.loadedCellCount()}` +
      ` | World objects: ${this.objects.objectCount()}`
    );
  }

  inspectText(targetCell?: CellCoord): string {
    const cell = targetCell ?? this.player.getCurrentCell();
    const found = this.objects.getObjectsInCell(cell);
    const lines = [`You are in cell (${cell.x}, ${cell.y}).`];
    if (found.length === 0) {
      lines.push('There is nothing notable here.');
    } else {
      for (const obj of found) {
        lines.push(`${obj.name}: ${obj.description}`);
      }
    }
    return lines.join('\n');
  }

  helpText(): string {
    return [
      '',
      'Commands:',
      '  W / A / S / D  Move north / west / south / east',
      '  map            Display the nearby world grid',
      '  status         Display player and streaming status',
      '  look           Inspect objects in your current cell',
      '  save [file]    Save your player position (default: savegame.mw)',
      '  load [file]    Load a saved player position',
      '  help           Show this help',
      '  q              Quit the game',
      '',
      'Each movement command advances 250 world units. A grid cell is 500 units wide.',
    ].join('\n');
  }

  serializeSave(): string {
    const pos = this.player.getPosition();
    return `MINIWORLD_SAVE_V1\n${pos.x} ${pos.y}\n`;
  }

  deserializeSave(content: string): SaveLoadResult {
    const tokens = content.trim().split(/\s+/);
    if (tokens.length < 3 || tokens[0] !== 'MINIWORLD_SAVE_V1') {
      return { success: false, error: 'Invalid save file format' };
    }
    const x = Number(tokens[1]);
    const y = Number(tokens[2]);
    const position: Vector2 = { x, y };
    if (!isFiniteVector2(position)) {
      return { success: false, error: 'Save file contains an invalid position' };
    }

    try {
      const targetCell = this.grid.worldToCell(position);
      if (this.objects.getBlockingObject(targetCell) !== null) {
        return {
          success: false,
          error: 'Saved position is inside a blocking world cell',
        };
      }
      this.player.setPosition(position);
      this.streamer.update(this.player.getCurrentCell());
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown load error',
      };
    }
  }

  save(filePath = 'savegame.mw'): SaveLoadResult {
    try {
      const data = this.serializeSave();
      localStorage.setItem(`${SAVE_STORAGE_PREFIX}${filePath}`, data);
      return { success: true, serialized: data };
    } catch {
      return {
        success: false,
        error: `Could not open save file for writing: ${filePath}`,
      };
    }
  }

  load(filePath = 'savegame.mw'): SaveLoadResult {
    try {
      const data = localStorage.getItem(`${SAVE_STORAGE_PREFIX}${filePath}`);
      if (data === null) {
        return {
          success: false,
          error: `Could not open save file: ${filePath}`,
        };
      }
      return this.deserializeSave(data);
    } catch {
      return {
        success: false,
        error: `Could not open save file: ${filePath}`,
      };
    }
  }

  listSavedFiles(): string[] {
    const files: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith(SAVE_STORAGE_PREFIX)) {
        files.push(key.slice(SAVE_STORAGE_PREFIX.length));
      }
    }
    return files.sort();
  }

  getPlayer(): Player {
    return this.player;
  }

  getGrid(): WorldGrid {
    return this.grid;
  }

  getObjects(): WorldObjectManager {
    return this.objects;
  }

  getStreamer(): WorldStreamer {
    return this.streamer;
  }

  getStepSize(): number {
    return this.stepSize;
  }
}
