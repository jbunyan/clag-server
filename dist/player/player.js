"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
class Player {
    constructor(name) {
        this.name = name !== undefined ? name : "";
    }
    getName() {
        return this.name;
    }
    setName(name) {
        this.name = name;
    }
}
exports.Player = Player;
