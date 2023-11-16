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
            tricks: [],
            trumps: "X"
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
        //
        // New game
        //
        // start off with a random dealer
        let dealer = Math.floor(Math.random() * this.players.length);
        // initialise first round
        this.currentRound = {
            dealer: dealer,
            roundNumber: 1,
            predictions: [],
            tricks: new Array(this.players.length).fill(0),
            trumps: "X"
        };
    }
    nextRound() {
        let previousRound = JSON.parse(JSON.stringify(this.currentRound));
        this.currentRound = {
            dealer: this.nextPlayer(previousRound.dealer),
            roundNumber: previousRound.roundNumber + 1,
            predictions: new Array(this.players.length).fill(-1),
            tricks: new Array(this.players.length).fill(0),
            trumps: "X"
        };
    }
    deal() {
        this.cardDeck.shuffle();
        this.hands = [];
        for (let p = 0; p < this.players.length; p++) {
            this.hands.push([]);
            for (let r = 0; r < this.currentRound.roundNumber; r++) {
                this.hands[p].push(this.cardDeck.getNext());
            }
        }
        this.currentRound.trumps = this.setTrumps();
        console.log(`New hands: ${JSON.stringify(this.hands)}`);
    }
    nextPlayer(previous) {
        let next = previous + 1;
        if (next === this.getNumberOfPlayers())
            next = 0;
        // console.log(`Previous: ${previous}, next: ${next}`)
        return next;
    }
    getRound() {
        return this.currentRound.roundNumber;
    }
    getTotalRounds() {
        return this.rounds;
    }
    getDealer() {
        return this.currentRound.dealer;
    }
    getNumberOfPlayers() {
        return this.players.length;
    }
    setTrumps() {
        let trumpCard = this.cardDeck.getNext();
        let suit = trumpCard.substring(trumpCard.length - 1);
        return suit;
    }
    getTrumps() {
        return this.currentRound.trumps;
    }
    getNumberOfTricks() {
        return this.currentRound.roundNumber;
    }
    getPredictions() {
        return this.currentRound.predictions;
    }
    getHands() {
        return this.hands;
    }
    addPrediction(player, p) {
        this.currentRound.predictions[player] = p;
        console.log(JSON.stringify(this.currentRound));
    }
    awardTrick(winner) {
        this.currentRound.tricks[winner]++;
    }
    scoreRound() {
        let scores = [];
        for (let i = 0; i < this.players.length; i++) {
            let s = {
                prediction: 0,
                made: false,
                score: 0
            };
            scores.push(s);
        }
        this.currentRound.predictions.forEach((prediction, index) => {
            scores[index].prediction = this.currentRound.predictions[index];
            let made = this.currentRound.predictions[index] === this.currentRound.tricks[index] ? true : false;
            scores[index].made = made;
            if (made) {
                scores[index].score = 10 + (2 * scores[index].prediction);
            }
        });
        this.scoreboard.addRound(scores);
        console.log(`currentRound: ${JSON.stringify(this.currentRound)}`);
        console.log(`Scoreboard: ${JSON.stringify(this.scoreboard.getScoreboard())}`);
    }
    getScoreboard() {
        return this.scoreboard;
    }
    getPlayers() {
        return this.players.map(p => p.getName());
    }
}
exports.Game = Game;
