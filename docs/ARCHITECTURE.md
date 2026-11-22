# MiniWorld Architecture Notes

## Runtime flow

1. `main.cpp` creates `Game` and runs the command loop.
2. `Game` owns the `WorldGrid`, `Player`, `WorldObjectManager`, and `WorldStreamer`.
3. A movement command is translated into a world-space delta.
4. `Game` computes the target cell and asks `WorldObjectManager` whether it contains a blocking object.
5. If clear, `Player` updates its position and current cell.
6. When the cell changes, `WorldStreamer` updates its active square window around the player.
7. `Game` draws the map and displays the current state.

## Coordinate convention

- World coordinates use `double`.
- Cell indices use signed 64-bit integers.
- Cell mapping uses `floor(world / cellSize)`, so negative positions map correctly.
- Positive X points east/right; positive Y points south/down in the terminal map.
- The current default cell size is 500 world units.

## Ownership

`Game` owns the grid and all systems. `Player`, `WorldObjectManager`, and `WorldStreamer` keep non-owning pointers/references to the grid. The grid must therefore outlive those systems; this is guaranteed by the member declaration and initialization order in `Game`.

## Streaming model

`WorldStreamer` maintains a set of active cell coordinates within a square radius around the player. It reports how many cells enter and leave the active window after each update. World objects remain registered in `WorldObjectManager`; this educational version does not yet deserialize assets from a disk cache or unload graphics resources.

## Collision model

Collision is cell-based: a player movement is rejected when its destination cell contains any `WorldObject` whose `blocking` field is true. It is intentionally simpler than continuous physics or bounding-volume collision.

## Save format

```text
MINIWORLD_SAVE_V1
<world_x> <world_y>
```

Only player position is persisted. World definition and object state are currently static and recreated at startup.
