#include "miniworld/game/Game.h"

#include <algorithm>
#include <cctype>
#include <iostream>
#include <sstream>
#include <string>

int main() {
    using miniworld::Game;

    Game game;
    std::cout << "====================================\n"
              << "       Welcome to MiniWorld!\n"
              << "  A small C++ open-world engine demo\n"
              << "====================================\n";
    game.help(std::cout);
    game.render(std::cout);
    game.showStatus(std::cout);

    std::string line;
    while (true) {
        std::cout << "\nminiworld> ";
        if (!std::getline(std::cin, line)) {
            break;
        }
        std::istringstream input(line);
        std::string command;
        input >> command;
        if (command.empty()) {
            continue;
        }
        std::transform(command.begin(), command.end(), command.begin(),
                       [](unsigned char c) { return static_cast<char>(std::tolower(c)); });

        if (command == "q" || command == "quit" || command == "exit") {
            std::cout << "Thanks for exploring MiniWorld. Goodbye!\n";
            break;
        } else if (command == "w" || command == "a" || command == "s" || command == "d") {
            game.movePlayer(command.front());
            game.render(std::cout);
            game.showStatus(std::cout);
        } else if (command == "map") {
            game.render(std::cout);
        } else if (command == "status") {
            game.showStatus(std::cout);
        } else if (command == "look") {
            game.inspect(std::cout);
        } else if (command == "help" || command == "h") {
            game.help(std::cout);
        } else if (command == "save" || command == "load") {
            std::string path;
            input >> path;
            if (path.empty()) {
                path = "savegame.mw";
            }
            std::string error;
            const bool success = (command == "save") ? game.save(path, error) : game.load(path, error);
            if (success) {
                std::cout << (command == "save" ? "Game saved to " : "Game loaded from ") << path << ".\n";
                if (command == "load") {
                    game.render(std::cout);
                    game.showStatus(std::cout);
                }
            } else {
                std::cout << "Error: " << error << '\n';
            }
        } else {
            std::cout << "Unknown command. Type 'help' to see available commands.\n";
        }
    }
    return 0;
}
