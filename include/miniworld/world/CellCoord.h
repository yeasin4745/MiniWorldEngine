#pragma once

#include <cstddef>
#include <cstdint>
#include <functional>

namespace miniworld {

struct CellCoord {
    std::int64_t x{0};
    std::int64_t y{0};

    friend bool operator==(const CellCoord& a, const CellCoord& b) noexcept {
        return a.x == b.x && a.y == b.y;
    }

    friend bool operator!=(const CellCoord& a, const CellCoord& b) noexcept {
        return !(a == b);
    }
};

struct CellCoordHash {
    std::size_t operator()(const CellCoord& cell) const noexcept {
        const auto hx = std::hash<std::int64_t>{}(cell.x);
        const auto hy = std::hash<std::int64_t>{}(cell.y);
        return hx ^ (hy + static_cast<std::size_t>(0x9e3779b9U) + (hx << 6U) + (hx >> 2U));
    }
};

} // namespace miniworld
