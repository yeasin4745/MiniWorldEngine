#include "miniworld/objects/WorldObjectManager.h"

#include <algorithm>
#include <stdexcept>

namespace miniworld {

bool WorldObjectManager::addObject(const WorldObject& object) {
    if (object.id.empty() || object.name.empty()) {
        throw std::invalid_argument("World object id and name must not be empty");
    }
    if (!object.position.isFinite()) {
        throw std::invalid_argument("World object position must be finite");
    }
    if (objects_.find(object.id) != objects_.end()) {
        return false;
    }

    const CellCoord cell = grid_->worldToCell(object.position);
    objects_.emplace(object.id, object);
    objectsByCell_[cell].push_back(object.id);
    return true;
}

bool WorldObjectManager::removeObject(const std::string& id) {
    const auto objectIt = objects_.find(id);
    if (objectIt == objects_.end()) {
        return false;
    }

    const CellCoord cell = grid_->worldToCell(objectIt->second.position);
    auto cellIt = objectsByCell_.find(cell);
    if (cellIt != objectsByCell_.end()) {
        auto& ids = cellIt->second;
        ids.erase(std::remove(ids.begin(), ids.end(), id), ids.end());
        if (ids.empty()) {
            objectsByCell_.erase(cellIt);
        }
    }
    objects_.erase(objectIt);
    return true;
}

const WorldObject* WorldObjectManager::findObject(const std::string& id) const {
    const auto it = objects_.find(id);
    return it == objects_.end() ? nullptr : &it->second;
}

std::vector<const WorldObject*> WorldObjectManager::getObjectsInCell(const CellCoord& cell) const {
    std::vector<const WorldObject*> result;
    const auto cellIt = objectsByCell_.find(cell);
    if (cellIt == objectsByCell_.end()) {
        return result;
    }
    result.reserve(cellIt->second.size());
    for (const auto& id : cellIt->second) {
        const auto objectIt = objects_.find(id);
        if (objectIt != objects_.end()) {
            result.push_back(&objectIt->second);
        }
    }
    return result;
}

const WorldObject* WorldObjectManager::getBlockingObject(const CellCoord& cell) const {
    const auto objects = getObjectsInCell(cell);
    for (const auto* object : objects) {
        if (object->blocking) {
            return object;
        }
    }
    return nullptr;
}

} // namespace miniworld
