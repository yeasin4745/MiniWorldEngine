#include "miniworld/world/WorldGrid.h"

#include <cmath>
#include <limits>
#include <stdexcept>

namespace miniworld {

WorldGrid::WorldGrid(double cellSize) : cellSize_(cellSize) {
    if (!std::isfinite(cellSize_) || cellSize_ <= 0.0) {
        throw std::invalid_argument("WorldGrid cell size must be a positive finite number");
    }
}

CellCoord WorldGrid::worldToCell(const Vector2& worldPosition) const {
    if (!worldPosition.isFinite()) {
        throw std::invalid_argument("World position must contain finite coordinates");
    }

    const double cellX = std::floor(worldPosition.x / cellSize_);
    const double cellY = std::floor(worldPosition.y / cellSize_);
    const double minValue = static_cast<double>(std::numeric_limits<std::int64_t>::min());
    const double maxExclusive = -minValue; // 2^63; exclusive upper bound for int64_t.

    if (cellX < minValue || cellX >= maxExclusive ||
        cellY < minValue || cellY >= maxExclusive) {
        throw std::out_of_range("World position is outside the supported cell-coordinate range");
    }

    return {static_cast<std::int64_t>(cellX), static_cast<std::int64_t>(cellY)};
}

Vector2 WorldGrid::cellToWorldOrigin(const CellCoord& cell) const {
    return {static_cast<double>(cell.x) * cellSize_,
            static_cast<double>(cell.y) * cellSize_};
}

Vector2 WorldGrid::cellToWorldCenter(const CellCoord& cell) const {
    const Vector2 origin = cellToWorldOrigin(cell);
    return {origin.x + cellSize_ / 2.0, origin.y + cellSize_ / 2.0};
}

std::vector<CellCoord> WorldGrid::getNeighborCells(const CellCoord& center, int radius,
                                                    bool includeCenter) const {
    if (radius < 0 || radius > 100) {
        throw std::invalid_argument("Neighbor radius must be between 0 and 100");
    }

    std::vector<CellCoord> cells;
    const auto r = static_cast<std::int64_t>(radius);
    for (std::int64_t y = -r; y <= r; ++y) {
        for (std::int64_t x = -r; x <= r; ++x) {
            if (!includeCenter && x == 0 && y == 0) {
                continue;
            }
            if ((x > 0 && center.x > std::numeric_limits<std::int64_t>::max() - x) ||
                (x < 0 && center.x < std::numeric_limits<std::int64_t>::min() - x) ||
                (y > 0 && center.y > std::numeric_limits<std::int64_t>::max() - y) ||
                (y < 0 && center.y < std::numeric_limits<std::int64_t>::min() - y)) {
                throw std::out_of_range("Neighbor cell coordinate overflow");
            }
            cells.push_back({center.x + x, center.y + y});
        }
    }
    return cells;
}

} // namespace miniworld
