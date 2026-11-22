# MiniWorld Engine (C++17)

MiniWorld হলো একটি ছোট, playable, terminal-based open-world engine prototype। এটি শেখার উদ্দেশ্যে তৈরি এবং কোনো external game engine বা third-party C++ library লাগে না।

> **গুরুত্বপূর্ণ:** এটি এখন 2D grid-ভিত্তিক terminal game/demo। এটি এখনো 3D graphics game নয়। এখানে World Grid, Player Movement, Object Management, Collision Blocking, Active-Cell Streaming, Save/Load এবং automated tests implement করা হয়েছে। Streaming বর্তমানে in-memory cell-window simulation; disk থেকে 3D model/texture load করার ব্যবস্থা নয়।

## কী কী সম্পন্ন হয়েছে

1. **World Grid:** World Position থেকে Cell Coordinate, negative coordinate support, cell origin/center এবং neighbor lookup।
2. **Player Navigation:** Player Position, directional movement, current cell tracking এবং cell transition detection।
3. **World Object Management:** Object add/remove, ID-based lookup, cell-wise indexing এবং blocking object lookup।
4. **Collision Blocking:** Tree, rock, cabin ও pond-এর মতো blocking object-যুক্ত cell-এ Player ঢুকতে পারে না।
5. **World Streaming:** Player-কে কেন্দ্র করে configurable radius-এর cell active রাখা এবং cell load/unload count দেখানো।
6. **Playable Terminal Interface:** WASD movement, map, status, look, help, save, load এবং quit command।
7. **Automated Tests:** Grid, Player, Object Manager এবং World Streamer-এর tests।

## Project Structure

```text
MiniWorldEngine/
├── CMakeLists.txt
├── README.md
├── README_BN.md
├── include/miniworld/
│   ├── core/Vector2.h
│   ├── world/CellCoord.h
│   ├── world/WorldGrid.h
│   ├── player/Player.h
│   ├── objects/WorldObject.h
│   ├── objects/WorldObjectManager.h
│   ├── streaming/WorldStreamer.h
│   └── game/Game.h
├── src/
│   ├── main.cpp
│   ├── world/WorldGrid.cpp
│   ├── player/Player.cpp
│   ├── objects/WorldObjectManager.cpp
│   ├── streaming/WorldStreamer.cpp
│   └── game/Game.cpp
├── tests/test_main.cpp
└── scripts/
    ├── build_linux.sh
    ├── run_linux.sh
    └── build_windows.bat
```

## Android-এ চালানোর নিয়ম (Termux)

এটি Android phone-এ চালানোর সহজ উপায়, যদি আপনার Termux থাকে। কোনো root permission দরকার নেই।

### ধাপ 1 — ZIP ফাইলটি Termux-এ আনুন

ZIP ফাইলটি Android-এর `Download` folder-এ রাখুন। Termux খুলে storage permission দিন:

```bash
termux-setup-storage
```

Permission চাইলে Allow দিন।

### ধাপ 2 — Compiler এবং tools install করুন

```bash
pkg update
pkg upgrade -y
pkg install clang cmake make unzip -y
```

### ধাপ 3 — ZIP extract করুন

```bash
cd ~/storage/downloads
unzip MiniWorldEngine.zip
cd MiniWorldEngine
```

ZIP অন্য folder-এ থাকলে `cd` path পরিবর্তন করুন।

### ধাপ 4 — Project configure করুন

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
```

### ধাপ 5 — Compile করুন

```bash
cmake --build build --parallel 2
```

Compile শেষ হলে `build` folder-এ executable তৈরি হবে।

### ধাপ 6 — Automated tests চালান

```bash
ctest --test-dir build --output-on-failure
```

সব test ঠিক থাকলে ফলাফল হবে `100% tests passed`।

### ধাপ 7 — Game চালান

```bash
./build/miniworld
```

Game বন্ধ করতে `q` লিখে Enter চাপুন।

## Debian / Ubuntu / Kali / Linux-এ চালানোর নিয়ম

### ধাপ 1 — প্রয়োজনীয় package install করুন

Debian/Ubuntu/Kali-তে:

```bash
sudo apt update
sudo apt install build-essential cmake unzip -y
```

আপনি যদি root shell ব্যবহার করেন, `sudo` বাদ দিন।

### ধাপ 2 — ZIP extract করুন

```bash
unzip MiniWorldEngine.zip
cd MiniWorldEngine
```

### ধাপ 3 — Build এবং Test

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --parallel 2
ctest --test-dir build --output-on-failure
```

### ধাপ 4 — Run

```bash
./build/miniworld
```

অথবা project root থেকে:

```bash
./scripts/build_linux.sh
./scripts/run_linux.sh
```

## Windows-এ চালানোর নিয়ম

1. একটি C++17 compiler toolchain (যেমন Visual Studio-এর C++ workload) এবং CMake install করুন।
2. ZIP extract করুন।
3. Project folder-এ Command Prompt বা PowerShell খুলুন।
4. চালান:

```bat
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release
ctest --test-dir build -C Release --output-on-failure
```

5. সাধারণ single-configuration MinGW build হলে executable সাধারণত `build\miniworld.exe`-এ থাকবে। Visual Studio multi-configuration generator হলে `build\Release\miniworld.exe` হতে পারে।

## Game Controls

সব command লিখে Enter চাপতে হবে।

| Command | কাজ |
|---|---|
| `w` | উত্তর দিকে Move (Y কমে) |
| `s` | দক্ষিণ দিকে Move (Y বাড়ে) |
| `a` | পশ্চিম দিকে Move (X কমে) |
| `d` | পূর্ব দিকে Move (X বাড়ে) |
| `map` | কাছের Grid Map দেখায় |
| `status` | Player Position, Cell এবং Streaming status দেখায় |
| `look` | বর্তমান Cell-এর Object সম্পর্কে জানায় |
| `help` | Command list দেখায় |
| `save` | `savegame.mw` নামে Save করে |
| `save myworld.mw` | নির্দিষ্ট নামে Save করে |
| `load` | `savegame.mw` Load করে |
| `load myworld.mw` | নির্দিষ্ট Save Load করে |
| `q` | Game বন্ধ করে |

প্রতিটি movement command Player-কে 250 world unit সরায়। একটি Grid Cell-এর দৈর্ঘ্য 500 world unit, তাই এক Cell পার হতে সাধারণত দুইটি movement command লাগে।

## Map Legend

- `@` = Player
- `T` = Tree (blocking)
- `R` = Rock (blocking)
- `H` = Cabin (blocking)
- `W` = Water/Pond (blocking)
- `*` = Wild flowers (non-blocking)
- `S` = Sign (non-blocking)
- `.` = Empty cell

## Save File

Save file হলো plain-text `savegame.mw`। এটি game চালানোর current working directory-তে তৈরি হয়। এতে save version এবং Player-এর world X/Y position থাকে। Save file delete করলে saved progress মুছে যাবে।

## Build সমস্যা হলে

- `cmake: command not found`: CMake install হয়নি। Termux-এ `pkg install cmake`; Debian/Ubuntu-তে `apt install cmake`।
- `CMAKE_CXX_COMPILER not found`: Termux-এ `pkg install clang`; Debian/Ubuntu-তে `apt install build-essential`।
- `Permission denied`: Linux shell script-এর বদলে সরাসরি `cmake` commands চালান, অথবা `chmod +x scripts/*.sh` দিন।
- পুরোনো/ভাঙা build cache: `rm -rf build` করে configure ও build আবার চালান।
- Android-এ parallel build memory issue হলে `cmake --build build --parallel 1` ব্যবহার করুন।

## প্রযুক্তিগত সীমাবদ্ধতা ও পরবর্তী উন্নয়ন

এটি একটি foundation project, commercial-ready game নয়। এখনো 3D renderer, graphics window, keyboard event system, physics simulation, audio, networking, terrain generator, asset file loader বা NPC AI নেই। পরবর্তী ধাপে SDL2/SFML-এর মতো window/input layer, renderer, asset pipeline এবং entity/component architecture যোগ করা যেতে পারে।
