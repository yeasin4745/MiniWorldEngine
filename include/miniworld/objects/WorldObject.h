#pragma once

#include "miniworld/core/Vector2.h"
#include "miniworld/world/CellCoord.h"

#include <string>

namespace miniworld {

struct WorldObject {
    std::string id;
    std::string name;
    std::string description;
    Vector2 position;
    char symbol{'?'};
    bool blocking{false};

};

} // namespace miniworld
