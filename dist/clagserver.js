"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game_controller_1 = require("./game-controller/game-controller");
//
// Clag game server
//
let gc = new game_controller_1.GameController();
gc.run();
