#pragma once

#include <cmath>
#include <stdexcept>

namespace miniworld {

struct Vector2 {
    double x{0.0};
    double y{0.0};

    Vector2() = default;
    Vector2(double xValue, double yValue) : x(xValue), y(yValue) {}

    bool isFinite() const noexcept {
        return std::isfinite(x) && std::isfinite(y);
    }

    Vector2 operator+(const Vector2& other) const noexcept {
        return {x + other.x, y + other.y};
    }

    Vector2 operator-(const Vector2& other) const noexcept {
        return {x - other.x, y - other.y};
    }

    Vector2 operator*(double scalar) const noexcept {
        return {x * scalar, y * scalar};
    }
};

} // namespace miniworld
