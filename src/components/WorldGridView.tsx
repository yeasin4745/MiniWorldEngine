import React from 'react';
import { CellCoord, cellsEqual } from '../engine/CellCoord';
import { Game } from '../engine/Game';
import { WorldObject } from '../engine/WorldObject';

interface WorldGridViewProps {
  game: Game;
  selectedCell: CellCoord | null;
  onSelectCell: (cell: CellCoord) => void;
  tick: number;
}

const OBJECT_STYLES: Record<
  string,
  { bg: string; border: string; text: string; badge: string }
> = {
  T: {
    bg: 'bg-emerald-950/70',
    border: 'border-emerald-700/60',
    text: 'text-emerald-300',
    badge: 'Tree',
  },
  R: {
    bg: 'bg-stone-800/80',
    border: 'border-stone-500/60',
    text: 'text-stone-300',
    badge: 'Rock',
  },
  H: {
    bg: 'bg-amber-950/70',
    border: 'border-amber-700/60',
    text: 'text-amber-300',
    badge: 'Cabin',
  },
  W: {
    bg: 'bg-sky-950/80',
    border: 'border-sky-600/60',
    text: 'text-sky-300',
    badge: 'Water',
  },
  '*': {
    bg: 'bg-pink-950/50',
    border: 'border-pink-700/50',
    text: 'text-pink-300',
    badge: 'Flowers',
  },
  S: {
    bg: 'bg-yellow-950/60',
    border: 'border-yellow-700/50',
    text: 'text-yellow-300',
    badge: 'Sign',
  },
};

export const WorldGridView: React.FC<WorldGridViewProps> = ({
  game,
  selectedCell,
  onSelectCell,
}) => {
  const player = game.getPlayer();
  const grid = game.getGrid();
  const streamer = game.getStreamer();
  const objects = game.getObjects();

  const center = player.getCurrentCell();
  const playerPos = player.getPosition();
  const cellSize = grid.getCellSize();
  const radius = streamer.getLoadRadius();

  // Compute player's normalized offset [0..1] inside the current cell
  const origin = grid.cellToWorldOrigin(center);
  const offsetX = Math.max(0.1, Math.min(0.9, (playerPos.x - origin.x) / cellSize));
  const offsetY = Math.max(0.1, Math.min(0.9, (playerPos.y - origin.y) / cellSize));

  const offsets: number[] = [];
  for (let i = -radius; i <= radius; i += 1) {
    offsets.push(i);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span>
          Active Streaming Window ({radius * 2 + 1}×{radius * 2 + 1} cells, radius={radius})
        </span>
        <span className="font-mono text-zinc-500">Cell size: {cellSize} units</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-3">
        <div className="inline-block min-w-full">
          {/* Column headers */}
          <div className="mb-1.5 grid grid-cols-[44px_repeat(9,minmax(40px,1fr))] gap-1">
            <div className="flex items-center justify-center font-mono text-[11px] text-zinc-500">
              Y\X
            </div>
            {offsets.map((dx) => {
              const colX = center.x + dx;
              return (
                <div
                  key={`col-${dx}`}
                  className={`text-center font-mono text-[11px] ${
                    dx === 0 ? 'font-bold text-emerald-400' : 'text-zinc-500'
                  }`}
                >
                  {colX}
                </div>
              );
            })}
          </div>

          {/* Grid rows */}
          <div className="flex flex-col gap-1">
            {offsets.map((dy) => {
              const worldY = center.y + dy;
              return (
                <div
                  key={`row-${dy}`}
                  className="grid grid-cols-[44px_repeat(9,minmax(40px,1fr))] gap-1"
                >
                  <div
                    className={`flex items-center justify-end pr-2 font-mono text-[11px] ${
                      dy === 0 ? 'font-bold text-emerald-400' : 'text-zinc-500'
                    }`}
                  >
                    {worldY}
                  </div>
                  {offsets.map((dx) => {
                    const cell: CellCoord = { x: center.x + dx, y: worldY };
                    const isPlayerCell = cellsEqual(cell, center);
                    const isLoaded = streamer.isLoaded(cell);
                    const cellObjects: WorldObject[] = objects.getObjectsInCell(cell);
                    const primaryObj = cellObjects[0] ?? null;
                    const isSelected = selectedCell !== null && cellsEqual(cell, selectedCell);

                    const objStyle = primaryObj ? OBJECT_STYLES[primaryObj.symbol] : null;

                    let cellClasses =
                      'relative flex h-11 w-full cursor-pointer items-center justify-center rounded border font-mono text-sm transition-colors ';

                    if (isPlayerCell) {
                      cellClasses +=
                        'border-emerald-400 bg-emerald-950/40 ring-1 ring-emerald-500/40 ';
                    } else if (objStyle) {
                      cellClasses += `${objStyle.bg} ${objStyle.border} ${objStyle.text} hover:brightness-125 `;
                    } else if (isLoaded) {
                      cellClasses +=
                        'border-zinc-800/90 bg-zinc-900/50 text-zinc-600 hover:border-zinc-700 hover:bg-zinc-900 ';
                    } else {
                      cellClasses += 'border-zinc-900 bg-zinc-950 text-zinc-700 ';
                    }

                    if (isSelected) {
                      cellClasses += 'ring-2 ring-amber-400/80 ';
                    }

                    return (
                      <button
                        key={`cell-${cell.x}-${cell.y}`}
                        type="button"
                        onClick={() => onSelectCell(cell)}
                        title={`Cell (${cell.x}, ${cell.y})${
                          primaryObj ? ` — ${primaryObj.name}` : ''
                        }`}
                        className={cellClasses}
                      >
                        {primaryObj && !isPlayerCell && (
                          <span className="font-bold">{primaryObj.symbol}</span>
                        )}

                        {!primaryObj && !isPlayerCell && (
                          <span className="text-xs opacity-50">
                            {isLoaded ? '·' : '?'}
                          </span>
                        )}

                        {isPlayerCell && (
                          <>
                            {primaryObj && (
                              <span className="absolute right-1 top-0.5 text-[10px] opacity-75">
                                {primaryObj.symbol}
                              </span>
                            )}
                            <span
                              className="absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-emerald-400 text-xs font-bold text-zinc-950 shadow"
                              style={{
                                left: `${offsetX * 100}%`,
                                top: `${offsetY * 100}%`,
                              }}
                            >
                              @
                            </span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-md border border-zinc-800/80 bg-zinc-900/50 px-3 py-2 font-mono text-xs text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 text-[10px] font-bold text-zinc-950">
            @
          </span>
          Player
        </span>
        <span className="text-emerald-300">T Tree (blocks)</span>
        <span className="text-stone-300">R Rock (blocks)</span>
        <span className="text-amber-300">H Cabin (blocks)</span>
        <span className="text-sky-300">W Water (blocks)</span>
        <span className="text-pink-300">* Flowers</span>
        <span className="text-yellow-300">S Sign</span>
        <span className="text-zinc-500">· Empty</span>
      </div>
    </div>
  );
};
