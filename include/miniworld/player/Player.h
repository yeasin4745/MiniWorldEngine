#pragma once

#include "miniworld/core/Vector2.h"
#include "miniworld/world/CellCoord.h"
#include "miniworld/world/WorldGrid.h"

namespace miniworld {

class Player {
public:
    Player(const WorldGrid& grid, Vector2 startPosition, double speed = 250.0);

    // Attempts to move by a world-space delta. Returns false if movement is invalid.
    bool moveBy(const Vector2& delta);
    void setPosition(const Vector2& newPosition);

    Vector2 getPosition() const noexcept { return position_; }
    CellCoord getCurrentCell() const noexcept { return currentCell_; }
    bool hasChangedCell() const noexcept { return cellChanged_; }
    double getSpeed() const noexcept { return speed_; }
    void setSpeed(double speed);

private:
    const WorldGrid* grid_;
    Vector2 position_;
    CellCoord currentCell_;
    double speed_;
    bool cellChanged_{false};
};

} // namespace miniworld
