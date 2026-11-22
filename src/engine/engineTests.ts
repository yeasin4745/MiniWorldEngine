import { cellsEqual } from './CellCoord';
import { Player } from './Player';
import { WorldGrid } from './WorldGrid';
import { WorldObject } from './WorldObject';
import { WorldObjectManager } from './WorldObjectManager';
import { WorldStreamer } from './WorldStreamer';

export interface TestCaseResult {
  name: string;
  passed: boolean;
  suite: 'WorldGrid' | 'Player' | 'WorldObjectManager' | 'WorldStreamer';
}

export interface TestSuiteSummary {
  results: TestCaseResult[];
  passedCount: number;
  failedCount: number;
}

export function runEngineTests(): TestSuiteSummary {
  const results: TestCaseResult[] = [];

  const check = (
    suite: TestCaseResult['suite'],
    condition: boolean,
    name: string
  ) => {
    results.push({ suite, passed: condition, name });
  };

  const checkThrows = (
    suite: TestCaseResult['suite'],
    fn: () => void,
    name: string
  ) => {
    try {
      fn();
      check(suite, false, name);
    } catch {
      check(suite, true, name);
    }
  };

  // WorldGrid tests
  const grid = new WorldGrid(500.0);
  check(
    'WorldGrid',
    cellsEqual(grid.worldToCell({ x: 1200.0, y: 800.0 }), { x: 2, y: 1 }),
    'World position maps to expected cell'
  );
  check(
    'WorldGrid',
    cellsEqual(grid.worldToCell({ x: -1.0, y: -501.0 }), { x: -1, y: -2 }),
    'Negative coordinates use floor correctly'
  );
  check(
    'WorldGrid',
    cellsEqual(grid.worldToCell({ x: 500.0, y: 0.0 }), { x: 1, y: 0 }),
    'Cell boundary maps to next cell'
  );
  check(
    'WorldGrid',
    grid.cellToWorldOrigin({ x: 2, y: -1 }).x === 1000.0,
    'Cell origin X converts correctly'
  );
  check(
    'WorldGrid',
    grid.getNeighborCells({ x: 0, y: 0 }, 1).length === 9,
    'Radius-one neighborhood contains nine cells'
  );
  check(
    'WorldGrid',
    grid.getNeighborCells({ x: 0, y: 0 }, 1, false).length === 8,
    'Neighborhood can exclude center cell'
  );
  checkThrows(
    'WorldGrid',
    () => new WorldGrid(0.0),
    'Zero cell size is rejected'
  );
  checkThrows(
    'WorldGrid',
    () => grid.worldToCell({ x: Number.NaN, y: 0.0 }),
    'Non-finite position is rejected'
  );

  // Player tests
  const player = new Player(grid, { x: 100.0, y: 100.0 });
  check(
    'Player',
    cellsEqual(player.getCurrentCell(), { x: 0, y: 0 }),
    'Player starts in expected cell'
  );
  player.moveBy({ x: 100.0, y: 0.0 });
  check(
    'Player',
    player.getPosition().x === 200.0 && !player.hasChangedCell(),
    'Movement inside same cell is tracked'
  );
  player.setPosition({ x: 600.0, y: 100.0 });
  check(
    'Player',
    cellsEqual(player.getCurrentCell(), { x: 1, y: 0 }) && player.hasChangedCell(),
    'Player detects cell transition'
  );
  checkThrows(
    'Player',
    () => player.setSpeed(0.0),
    'Non-positive player speed is rejected'
  );

  // Object manager tests
  const objects = new WorldObjectManager(grid);
  const tree: WorldObject = {
    id: 'tree',
    name: 'Tree',
    description: 'A tree',
    position: { x: 750.0, y: 250.0 },
    symbol: 'T',
    blocking: true,
  };
  check('WorldObjectManager', objects.addObject(tree), 'World object can be added');
  check(
    'WorldObjectManager',
    !objects.addObject(tree),
    'Duplicate object ID is rejected'
  );
  check(
    'WorldObjectManager',
    objects.getObjectsInCell({ x: 1, y: 0 }).length === 1,
    'Object is indexed in its cell'
  );
  check(
    'WorldObjectManager',
    objects.getBlockingObject({ x: 1, y: 0 }) !== null,
    'Blocking object is found'
  );
  check(
    'WorldObjectManager',
    objects.removeObject('tree'),
    'Object can be removed'
  );
  check(
    'WorldObjectManager',
    objects.getObjectsInCell({ x: 1, y: 0 }).length === 0,
    'Removed object disappears from cell index'
  );

  // World streaming tests
  const streamer = new WorldStreamer(grid, 1);
  check(
    'WorldStreamer',
    streamer.update({ x: 0, y: 0 }) && streamer.loadedCellCount() === 9,
    'Streamer loads radius-one region'
  );
  check(
    'WorldStreamer',
    streamer.isLoaded({ x: 1, y: 1 }),
    'Streamer reports a loaded cell'
  );
  check(
    'WorldStreamer',
    streamer.update({ x: 1, y: 0 }) && streamer.loadedCellCount() === 9,
    'Streamer moves its active window'
  );
  check(
    'WorldStreamer',
    streamer.getLastLoadedCount() === 3 && streamer.getLastUnloadedCount() === 3,
    'Streamer reports cells loaded and unloaded during movement'
  );

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;

  return { results, passedCount, failedCount };
}
