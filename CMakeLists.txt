cmake_minimum_required(VERSION 3.16)
project(MiniWorldEngine VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

option(MINIWORLD_BUILD_TESTS "Build MiniWorld automated tests" ON)

add_library(miniworld_engine
    src/world/WorldGrid.cpp
    src/player/Player.cpp
    src/objects/WorldObjectManager.cpp
    src/streaming/WorldStreamer.cpp
    src/game/Game.cpp
)

target_include_directories(miniworld_engine PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include)

if(MSVC)
    target_compile_options(miniworld_engine PRIVATE /W4 /permissive-)
else()
    target_compile_options(miniworld_engine PRIVATE -Wall -Wextra -Wpedantic)
endif()

add_executable(miniworld src/main.cpp)
target_link_libraries(miniworld PRIVATE miniworld_engine)

if(MINIWORLD_BUILD_TESTS)
    enable_testing()
    add_executable(miniworld_tests tests/test_main.cpp)
    target_link_libraries(miniworld_tests PRIVATE miniworld_engine)
    add_test(NAME miniworld_tests COMMAND miniworld_tests)
endif()
