#include "miniworld/objects/WorldObjectManager.h"
#include "miniworld/player/Player.h"
#include "miniworld/streaming/WorldStreamer.h"
#include "miniworld/world/WorldGrid.h"

#include <cmath>
#include <exception>
#include <functional>
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

using namespace miniworld;

namespace {
int failures = 0;
int passed = 0;

void check(bool condition, const std::string& message) {
    if (condition) {
        ++passed;
        std::cout << "[PASS] " << message << '\n';
    } else {
        ++failures;
        std::cerr << "[FAIL] " << message << '\n';
    }
}

template <typename Exception, typename Function>
void checkThrows(Function function, const std::string& message) {
    try {
        function();
        check(false, message);
    } catch (const Exception&) {
        check(true, message);
    } catch (...) {
        check(false, message + " (unexpected exception type)");
    }
}
}

int main() {
    std::cout << "MiniWorld Engine automated tests\n";

    // WorldGrid tests
    WorldGrid grid(500.0);
    check(grid.worldToCell({1200.0, 800.0}) == CellCoord{2, 1}, "World position maps to expected cell");
    check(grid.worldToCell({-1.0, -501.0}) == CellCoord{-1, -2}, "Negative coordinates use floor correctly");
    check(grid.worldToCell({500.0, 0.0}) == CellCoord{1, 0}, "Cell boundary maps to next cell");
    check(grid.cellToWorldOrigin({2, -1}).x == 1000.0, "Cell origin X converts correctly");
    check(grid.getNeighborCells({0, 0}, 1).size() == 9U, "Radius-one neighborhood contains nine cells");
    check(grid.getNeighborCells({0, 0}, 1, false).size() == 8U, "Neighborhood can exclude center cell");
    checkThrows<std::invalid_argument>([] { WorldGrid invalid(0.0); }, "Zero cell size is rejected");
    checkThrows<std::invalid_argument>([&grid] { grid.worldToCell({NAN, 0.0}); }, "Non-finite position is rejected");

    // Player tests
    Player player(grid, {100.0, 100.0});
    check(player.getCurrentCell() == CellCoord{0, 0}, "Player starts in expected cell");
    player.moveBy({100.0, 0.0});
    check(player.getPosition().x == 200.0 && !player.hasChangedCell(), "Movement inside same cell is tracked");
    player.setPosition({600.0, 100.0});
    check(player.getCurrentCell() == CellCoord{1, 0} && player.hasChangedCell(), "Player detects cell transition");
    checkThrows<std::invalid_argument>([&player] { player.setSpeed(0.0); }, "Non-positive player speed is rejected");

    // Object manager tests
    WorldObjectManager objects(grid);
    const WorldObject tree{"tree", "Tree", "A tree", {750.0, 250.0}, 'T', true};
    check(objects.addObject(tree), "World object can be added");
    check(!objects.addObject(tree), "Duplicate object ID is rejected");
    check(objects.getObjectsInCell({1, 0}).size() == 1U, "Object is indexed in its cell");
    check(objects.getBlockingObject({1, 0}) != nullptr, "Blocking object is found");
    check(objects.removeObject("tree"), "Object can be removed");
    check(objects.getObjectsInCell({1, 0}).empty(), "Removed object disappears from cell index");

    // World streaming tests
    WorldStreamer streamer(grid, 1);
    check(streamer.update({0, 0}) && streamer.loadedCellCount() == 9U, "Streamer loads radius-one region");
    check(streamer.isLoaded({1, 1}), "Streamer reports a loaded cell");
    check(streamer.update({1, 0}) && streamer.loadedCellCount() == 9U, "Streamer moves its active window");
    check(streamer.lastLoadedCount() == 3U && streamer.lastUnloadedCount() == 3U,
          "Streamer reports cells loaded and unloaded during movement");

    std::cout << "\nTests passed: " << passed << " | Failed: " << failures << '\n';
    return failures == 0 ? 0 : 1;
}
