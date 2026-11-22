#pragma once

#include "miniworld/objects/WorldObject.h"
#include "miniworld/world/WorldGrid.h"

#include <optional>
#include <string>
#include <unordered_map>
#include <vector>

namespace miniworld {

class WorldObjectManager {
public:
    explicit WorldObjectManager(const WorldGrid& grid) : grid_(&grid) {}

    bool addObject(const WorldObject& object);
    bool removeObject(const std::string& id);
    const WorldObject* findObject(const std::string& id) const;
    std::vector<const WorldObject*> getObjectsInCell(const CellCoord& cell) const;
    const WorldObject* getBlockingObject(const CellCoord& cell) const;
    std::size_t objectCount() const noexcept { return objects_.size(); }

private:
    const WorldGrid* grid_;
    std::unordered_map<std::string, WorldObject> objects_;
    std::unordered_map<CellCoord, std::vector<std::string>, CellCoordHash> objectsByCell_;
};

} // namespace miniworld
