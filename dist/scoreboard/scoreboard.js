"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scoreboard = void 0;
class Scoreboard {
    constructor() {
        this.scoreboard = [];
        // intentionally empty
    }
    getScoreboard() {
        return this.scoreboard;
    }
    addRound(round) {
        this.scoreboard.push(round);
        if (this.scoreboard.length !== 1) {
            let justAdded = this.scoreboard.length - 1;
            let previous = justAdded - 1;
            this.scoreboard[justAdded].forEach((entry, index) => {
                this.scoreboard[justAdded][index].score += this.scoreboard[previous][index].score;
            });
        }
    }
}
exports.Scoreboard = Scoreboard;
