#include "miniworld/game/Game.h"

#include <fstream>
#include <iomanip>
#include <iostream>
#include <limits>
#include <sstream>

namespace miniworld {

Game::Game()
    : grid_(500.0),
      player_(grid_, {250.0, 250.0}, 250.0),
      objects_(grid_),
      streamer_(grid_, 4),
      stepSize_(250.0) {
    populateWorld();
    streamer_.update(player_.getCurrentCell());
}

void Game::populateWorld() {
    objects_.addObject({"oak_1", "Oak tree", "A large tree. It blocks movement.", {1250.0, 250.0}, 'T', true});
    objects_.addObject({"rock_1", "Rock", "A heavy rock. It blocks movement.", {250.0, 1250.0}, 'R', true});
    objects_.addObject({"cabin_1", "Small cabin", "A wooden cabin. It blocks movement.", {-750.0, -250.0}, 'H', true});
    objects_.addObject({"pond_1", "Pond", "A quiet pond. You cannot walk through water.", {1250.0, 1250.0}, 'W', true});
    objects_.addObject({"flower_1", "Wild flowers", "A patch of colourful wild flowers.", {-250.0, 250.0}, '*', false});
    objects_.addObject({"sign_1", "Wooden sign", "The sign reads: Welcome to MiniWorld!", {250.0, -750.0}, 'S', false});
}

bool Game::movePlayer(char direction) {
    Vector2 delta{};
    switch (direction) {
        case 'w': case 'W': delta = {0.0, -stepSize_}; break;
        case 's': case 'S': delta = {0.0, stepSize_}; break;
        case 'a': case 'A': delta = {-stepSize_, 0.0}; break;
        case 'd': case 'D': delta = {stepSize_, 0.0}; break;
        default: return false;
    }

    const Vector2 proposed = player_.getPosition() + delta;
    const CellCoord targetCell = grid_.worldToCell(proposed);
    if (const WorldObject* obstacle = objects_.getBlockingObject(targetCell)) {
        std::cout << "Blocked by " << obstacle->name << ". Try another direction.\n";
        return false;
    }

    const CellCoord previousCell = player_.getCurrentCell();
    player_.moveBy(delta);
    if (player_.hasChangedCell()) {
        streamer_.update(player_.getCurrentCell());
        std::cout << "Entered cell (" << player_.getCurrentCell().x << ", "
                  << player_.getCurrentCell().y << "). Streaming window updated: +"
                  << streamer_.lastLoadedCount() << " loaded, -"
                  << streamer_.lastUnloadedCount() << " unloaded.\n";
    }
    (void)previousCell;
    return true;
}

void Game::render(std::ostream& output) const {
    const CellCoord center = player_.getCurrentCell();
    const int radius = streamer_.getLoadRadius();

    output << "\n                 MINIWORLD MAP\n";
    output << "       X ->  ";
    for (int x = -radius; x <= radius; ++x) {
        output << std::setw(3) << (center.x + x);
    }
    output << "\n";

    for (int y = -radius; y <= radius; ++y) {
        const auto worldY = center.y + y;
        output << "Y=" << std::setw(4) << worldY << "  ";
        for (int x = -radius; x <= radius; ++x) {
            const CellCoord cell{center.x + x, worldY};
            char symbol = '.';
            if (!streamer_.isLoaded(cell)) {
                symbol = '?';
            }
            if (cell == center) {
                symbol = '@';
            } else {
                const auto cellObjects = objects_.getObjectsInCell(cell);
                if (!cellObjects.empty()) {
                    symbol = cellObjects.front()->symbol;
                }
            }
            output << std::setw(3) << symbol;
        }
        output << '\n';
    }
    output << "\nLegend: @ Player | T Tree | R Rock | H Cabin | W Water | * Flowers | S Sign | . Empty\n";
}

void Game::showStatus(std::ostream& output) const {
    const auto position = player_.getPosition();
    const auto cell = player_.getCurrentCell();
    output << "Position: (" << position.x << ", " << position.y << ")"
           << " | Cell: (" << cell.x << ", " << cell.y << ")"
           << " | Loaded cells: " << streamer_.loadedCellCount()
           << " | World objects: " << objects_.objectCount() << '\n';
}

void Game::inspect(std::ostream& output) const {
    const auto cell = player_.getCurrentCell();
    const auto found = objects_.getObjectsInCell(cell);
    output << "You are in cell (" << cell.x << ", " << cell.y << ").\n";
    if (found.empty()) {
        output << "There is nothing notable here.\n";
        return;
    }
    for (const auto* object : found) {
        output << object->name << ": " << object->description << '\n';
    }
}

void Game::help(std::ostream& output) const {
    output << "\nCommands:\n"
           << "  W / A / S / D  Move north / west / south / east\n"
           << "  map            Display the nearby world grid\n"
           << "  status         Display player and streaming status\n"
           << "  look           Inspect objects in your current cell\n"
           << "  save [file]    Save your player position (default: savegame.mw)\n"
           << "  load [file]    Load a saved player position\n"
           << "  help           Show this help\n"
           << "  q              Quit the game\n\n"
           << "Each movement command advances 250 world units. A grid cell is 500 units wide.\n";
}

bool Game::save(const std::string& filePath, std::string& error) const {
    std::ofstream file(filePath, std::ios::trunc);
    if (!file) {
        error = "Could not open save file for writing: " + filePath;
        return false;
    }
    const auto pos = player_.getPosition();
    file << "MINIWORLD_SAVE_V1\n" << std::setprecision(17) << pos.x << ' ' << pos.y << '\n';
    if (!file.good()) {
        error = "An error occurred while writing the save file";
        return false;
    }
    return true;
}

bool Game::load(const std::string& filePath, std::string& error) {
    std::ifstream file(filePath);
    if (!file) {
        error = "Could not open save file: " + filePath;
        return false;
    }

    std::string magic;
    Vector2 position;
    if (!(file >> magic) || magic != "MINIWORLD_SAVE_V1" || !(file >> position.x >> position.y)) {
        error = "Invalid save file format";
        return false;
    }
    if (!position.isFinite()) {
        error = "Save file contains an invalid position";
        return false;
    }

    try {
        const CellCoord targetCell = grid_.worldToCell(position);
        if (objects_.getBlockingObject(targetCell) != nullptr) {
            error = "Saved position is inside a blocking world cell";
            return false;
        }
        player_.setPosition(position);
        streamer_.update(player_.getCurrentCell());
    } catch (const std::exception& ex) {
        error = ex.what();
        return false;
    }
    return true;
}

} // namespace miniworld
