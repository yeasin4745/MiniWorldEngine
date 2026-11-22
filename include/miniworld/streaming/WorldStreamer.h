#pragma once

#include "miniworld/world/CellCoord.h"
#include "miniworld/world/WorldGrid.h"

#include <cstddef>
#include <unordered_set>
#include <vector>

namespace miniworld {

class WorldStreamer {
public:
    explicit WorldStreamer(const WorldGrid& grid, int loadRadius = 3);

    // Rebuilds the active cell window around the player and returns whether it changed.
    bool update(const CellCoord& playerCell);
    bool isLoaded(const CellCoord& cell) const noexcept;
    std::size_t loadedCellCount() const noexcept { return loadedCells_.size(); }
    std::size_t lastLoadedCount() const noexcept { return lastLoadedCount_; }
    std::size_t lastUnloadedCount() const noexcept { return lastUnloadedCount_; }
    int getLoadRadius() const noexcept { return loadRadius_; }
    std::vector<CellCoord> loadedCells() const;

private:
    const WorldGrid* grid_;
    int loadRadius_;
    std::unordered_set<CellCoord, CellCoordHash> loadedCells_;
    std::size_t lastLoadedCount_{0};
    std::size_t lastUnloadedCount_{0};
};

} // namespace miniworld
