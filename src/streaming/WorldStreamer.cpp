#include "miniworld/streaming/WorldStreamer.h"

#include <stdexcept>

namespace miniworld {

WorldStreamer::WorldStreamer(const WorldGrid& grid, int loadRadius)
    : grid_(&grid), loadRadius_(loadRadius) {
    if (loadRadius_ < 0 || loadRadius_ > 100) {
        throw std::invalid_argument("Streaming radius must be between 0 and 100");
    }
}

bool WorldStreamer::update(const CellCoord& playerCell) {
    const auto desiredVector = grid_->getNeighborCells(playerCell, loadRadius_, true);
    std::unordered_set<CellCoord, CellCoordHash> desired;
    desired.reserve(desiredVector.size());
    for (const auto& cell : desiredVector) {
        desired.insert(cell);
    }

    lastLoadedCount_ = 0;
    lastUnloadedCount_ = 0;
    for (const auto& cell : desired) {
        if (loadedCells_.find(cell) == loadedCells_.end()) {
            ++lastLoadedCount_;
        }
    }
    for (const auto& cell : loadedCells_) {
        if (desired.find(cell) == desired.end()) {
            ++lastUnloadedCount_;
        }
    }

    const bool changed = (desired != loadedCells_);
    loadedCells_.swap(desired);
    return changed;
}

bool WorldStreamer::isLoaded(const CellCoord& cell) const noexcept {
    return loadedCells_.find(cell) != loadedCells_.end();
}

std::vector<CellCoord> WorldStreamer::loadedCells() const {
    return {loadedCells_.begin(), loadedCells_.end()};
}

} // namespace miniworld
