"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const player_1 = require("../player/player");
const scoreboard_1 = require("../scoreboard/scoreboard");
const card_deck_1 = require("../card-deck/card-deck");
class Game {
    constructor() {
        this.cardDeck = new card_deck_1.CardDeck();
        this.rounds = 7;
        this.players = [];
        this.currentRound = {
            dealer: -1,
            roundNumber: -1,
            predictions: [],
            tricks: []
        };
        this.scoreboard = new scoreboard_1.Scoreboard();
        this.dealer = 0;
        this.hands = [];
    }
    addPlayer(player) {
        let id = this.players.push(new player_1.Player(player));
        return (id - 1);
    }
    setNumberOfRounds(n) {
        this.rounds = n;
    }
    start() {
        let dealer = Math.floor(Math.random() * this.players.length);
        this.currentRound = {
            dealer: dealer,
            roundNumber: 1,
            predictions: [],
            tricks: new Array(this.players.length).fill(0)
        };
    }
    deal() {
        this.cardDeck.shuffle();
        this.hands = [];
        for (let p = 0; p < this.players.length; p++) {
            this.hands.push([])
            for (let r = 0; r < this.currentRound.roundNumber; r++) {
                this.hands[p].push(this.cardDeck.getNext());
            }
        }
        console.log(`New hands: ${JSON.stringify}`);
    }
    addPrediction(p) {
        var _a;
        (_a = this.currentRound.predictions) === null || _a === void 0 ? void 0 : _a.push(p);
        console.log(JSON.stringify(this.currentRound));
    }
    scoreTrick(winner) {
        this.currentRound.tricks[winner]++;
    }
    scoreRound() {
        let scores = Array(this.players.length).fill({
            prediction: 0,
            made: false,
            score: 0
        });
        this.currentRound.predictions.forEach((prediction, index) => {
            scores[index].prediction = this.currentRound.predictions[index];
            let made = this.currentRound.predictions[index] === this.currentRound.tricks[index];
            scores[index].made = made;
            if (made) {
                scores[index].score = 10 + (2 * scores[index].prediction);
            }
        });
        this.scoreboard.addRound(scores);
    }
}
exports.Game = Game;
