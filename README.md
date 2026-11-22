# MiniWorld Engine

A portable C++17 terminal-based open-world engine prototype built with CMake and no third-party C++ dependencies.

## Features

- Infinite-style 2D world grid with floor-based coordinate mapping, including negative coordinates.
- Player position tracking and directional movement.
- World-object registry indexed by grid cell.
- Blocking objects for basic cell-level collision.
- Active-cell streaming window around the player, with loaded/unloaded counts.
- Terminal game loop and commands: `W/A/S/D`, `map`, `status`, `look`, `save`, `load`, `help`, `q`.
- Automated tests for grid conversion, player movement, object management, and streaming.

> This is a playable 2D console prototype, not a graphical 3D game. The streaming component simulates an active in-memory cell window; it does not yet load 3D meshes or textures from disk.

## Quick start (Linux)

Requirements: a C++17 compiler, CMake 3.16+, and a build tool.

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --parallel 2
ctest --test-dir build --output-on-failure
./build/miniworld
```

## Android (Termux)

```bash
pkg update
pkg upgrade -y
pkg install clang cmake make unzip -y
termux-setup-storage
cd ~/storage/downloads
unzip MiniWorldEngine.zip
cd MiniWorldEngine
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --parallel 2
ctest --test-dir build --output-on-failure
./build/miniworld
```

See [README_BN.md](README_BN.md) for detailed Android, Debian/Ubuntu, and Windows instructions in Bengali.

## Controls

| Command | Action |
|---|---|
| `w`, `a`, `s`, `d` | Move |
| `map` | Draw nearby grid |
| `status` | Player and streaming status |
| `look` | Inspect current cell |
| `save [file]` | Save position; default `savegame.mw` |
| `load [file]` | Load position; default `savegame.mw` |
| `help` | Show commands |
| `q` | Quit |

Each movement command advances 250 world units. Each grid cell is 500 units wide.

## Build and test

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --parallel 2
ctest --test-dir build --output-on-failure
```

## Structure

- `include/miniworld/core`: fundamental math types.
- `include/miniworld/world`: cell coordinates and grid mapping.
- `include/miniworld/player`: player state and movement.
- `include/miniworld/objects`: world object data and indexing.
- `include/miniworld/streaming`: active-cell streaming simulation.
- `include/miniworld/game`: game orchestration, terminal rendering, save/load.
- `tests`: dependency-free test executable.

## Scope

This project is an educational engine foundation. It does not yet include a 3D renderer, graphical window, full physics, audio, networking, procedural terrain, disk-based mesh/texture streaming, or NPC AI.
