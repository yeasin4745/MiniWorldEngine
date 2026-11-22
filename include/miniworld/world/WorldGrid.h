#pragma once

#include "miniworld/core/Vector2.h"
#include "miniworld/world/CellCoord.h"

#include <vector>

namespace miniworld {

class WorldGrid {
public:
    explicit WorldGrid(double cellSize);

    CellCoord worldToCell(const Vector2& worldPosition) const;
    Vector2 cellToWorldOrigin(const CellCoord& cell) const;
    Vector2 cellToWorldCenter(const CellCoord& cell) const;
    std::vector<CellCoord> getNeighborCells(const CellCoord& center, int radius,
                                            bool includeCenter = true) const;

    double getCellSize() const noexcept { return cellSize_; }

private:
    double cellSize_;
};

} // namespace miniworld
