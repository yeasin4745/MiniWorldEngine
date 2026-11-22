#pragma once

#include "miniworld/objects/WorldObjectManager.h"
#include "miniworld/player/Player.h"
#include "miniworld/streaming/WorldStreamer.h"

#include <iosfwd>
#include <string>

namespace miniworld {

class Game {
public:
    Game();

    bool movePlayer(char direction);
    void render(std::ostream& output) const;
    void showStatus(std::ostream& output) const;
    void inspect(std::ostream& output) const;
    void help(std::ostream& output) const;

    bool save(const std::string& filePath, std::string& error) const;
    bool load(const std::string& filePath, std::string& error);

    const Player& getPlayer() const noexcept { return player_; }
    const WorldGrid& getGrid() const noexcept { return grid_; }
    const WorldObjectManager& getObjects() const noexcept { return objects_; }
    const WorldStreamer& getStreamer() const noexcept { return streamer_; }

private:
    WorldGrid grid_;
    Player player_;
    WorldObjectManager objects_;
    WorldStreamer streamer_;
    double stepSize_;

    void populateWorld();
};

} // namespace miniworld
