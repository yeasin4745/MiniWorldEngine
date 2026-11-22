#include "miniworld/player/Player.h"

#include <cmath>
#include <stdexcept>

namespace miniworld {

Player::Player(const WorldGrid& grid, Vector2 startPosition, double speed)
    : grid_(&grid), position_(startPosition), currentCell_(grid.worldToCell(startPosition)), speed_(speed) {
    setSpeed(speed);
}

bool Player::moveBy(const Vector2& delta) {
    if (!delta.isFinite()) {
        throw std::invalid_argument("Movement delta must be finite");
    }
    const Vector2 proposed = position_ + delta;
    if (!proposed.isFinite()) {
        throw std::out_of_range("Movement would produce a non-finite position");
    }
    setPosition(proposed);
    return true;
}

void Player::setPosition(const Vector2& newPosition) {
    const CellCoord newCell = grid_->worldToCell(newPosition);
    cellChanged_ = (newCell != currentCell_);
    position_ = newPosition;
    currentCell_ = newCell;
}

void Player::setSpeed(double speed) {
    if (!std::isfinite(speed) || speed <= 0.0) {
        throw std::invalid_argument("Player speed must be a positive finite number");
    }
    speed_ = speed;
}

} // namespace miniworld
