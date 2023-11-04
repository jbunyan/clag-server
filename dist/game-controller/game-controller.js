"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameController = void 0;
const connection_manager_1 = require("../connection-manager/connection-manager");
const game_1 = require("../game/game");
const card_utils_1 = require("../card-utils/card-utils");
var GameState;
(function (GameState) {
    GameState[GameState["Registration"] = 0] = "Registration";
    GameState[GameState["NewGame"] = 1] = "NewGame";
    GameState[GameState["NewTrick"] = 2] = "NewTrick";
    GameState[GameState["EndGame"] = 3] = "EndGame";
})(GameState || (GameState = {}));
class GameController {
    constructor() {
        this.game = new game_1.Game();
        this.state = GameState.Registration;
        this.connectionManager = new connection_manager_1.ConnectionManager();
        this.messagePipe = this.connectionManager.getMessagePipe();
        this.currentTrick = [];
        this.leadoutPlayer = -1;
        this.trickNumber = -1;
    }
    run() {
        this.messagePipe.subscribe({
            next: (message) => {
                console.log("game-controller: message received");
                switch (message.messageType) {
                    case "register": {
                        if (this.state === GameState.Registration) {
                            this.processRegistration(message);
                        }
                        break;
                    }
                    case "newGame": {
                        this.processNewGame();
                        break;
                    }
                    case "setRounds": {
                        this.processSetRounds(message);
                        break;
                    }
                    case "prediction": {
                        this.processPrediction(message);
                        break;
                    }
                    case "card": {
                        this.processCard(message);
                        break;
                    }
                    default: {
                        console.log("error: unrecognised message type");
                    }
                }
            },
            error: (error) => { }
        });
    }
    processRegistration(message) {
        console.log("processing registration " + JSON.stringify(message));
        let id = this.game.addPlayer(message.data.name);
        this.connectionManager.setPlayerId(message.connectionId, id);
        this.connectionManager.broadcast("newPlayer", { playerId: id, name: message.data.name });
    }
    processSetRounds(message) {
        this.game.setNumberOfRounds(message.data.rounds);
    }
    processNewGame() {
        this.game.start();
        this.startNextRound();
    }
    startNextRound() {
        console.log("///");
        console.log(`/// Round: ${this.game.getRound()}, dealer: ${this.game.getDealer()}`);
        console.log("///");
        this.game.deal();
        let trumps = this.game.getTrumps();
        let hands = this.game.getHands();
        let dealer = this.game.getDealer();
        this.trickNumber = 0;
        hands.forEach((hand, index) => {
            this.connectionManager.sendMessage(index, "hand", { "hand": hand, "trumps": trumps, "dealer": dealer });
        });
        let leadoutPlayer = this.game.nextPlayer(dealer);
        this.connectionManager.sendMessage(leadoutPlayer, "predictionRequest"); // start getting predictions from leadout player
    }
    processPrediction(message) {
        this.game.addPrediction(message.data.prediction);
        if (message.playerId !== this.game.getDealer()) {
            let nextPlayer = this.game.nextPlayer(message.playerId);
            this.connectionManager.sendMessage(nextPlayer, "predictionRequest");
        }
        else {
            console.log("All predictions rec'd");
            this.connectionManager.broadcast("predictions", { "predictions": this.game.getPredictions() });
            let leadoutPlayer = this.game.nextPlayer(this.game.getDealer());
            this.leadoutPlayer = leadoutPlayer;
            this.startNewTrick();
        }
    }
    startNewTrick() {
        this.trickNumber++;
        console.log("///");
        console.log(`/// Round: ${this.game.getRound()}, trick: ${this.trickNumber}, leadout: ${this.leadoutPlayer}`);
        console.log("///");
        this.currentTrick = new Array(this.game.getNumberOfPlayers()).fill("X");
        this.connectionManager.sendMessage(this.leadoutPlayer, "playCard");
    }
    processCard(message) {
        this.connectionManager.broadcast("cardPlayed", { "playerId": message.playerId, "card": message.data.card });
        this.currentTrick[message.playerId] = message.data.card;
        let nextPlayer = this.game.nextPlayer(message.playerId);
        if (nextPlayer === this.leadoutPlayer) {
            // trick complete!
            console.log("Trick:" + JSON.stringify(this.currentTrick));
            this.scoreTrick();
            if (this.trickNumber !== this.game.getRound()) {
                this.startNewTrick();
            }
            else if (this.game.getRound() !== 3) {
                this.game.scoreRound();
                this.game.nextRound();
                this.startNextRound();
            }
            else {
                this.game.scoreRound();
            }
        }
        else {
            this.connectionManager.sendMessage(nextPlayer, "playCard");
        }
    }
    scoreTrick() {
        let trumps = this.game.getTrumps();
        let winningPlayer = this.leadoutPlayer; // until told otherwise....
        let winningCard = this.currentTrick[winningPlayer];
        let nextPlayer = this.game.nextPlayer(this.leadoutPlayer);
        for (let i = 0; i < this.game.getNumberOfPlayers() - 1; i++) {
            let challengeCard = this.currentTrick[nextPlayer];
            let comparison = card_utils_1.CardUtils.compare(winningCard, challengeCard, trumps);
            if (comparison === card_utils_1.Compare.LT) {
                winningCard = challengeCard;
                winningPlayer = nextPlayer;
            }
            nextPlayer = this.game.nextPlayer(nextPlayer);
        }
        console.log(`trick score - winning player: ${winningPlayer}, winning card: ${winningCard}`);
        this.game.awardTrick(winningPlayer);
        this.leadoutPlayer = winningPlayer;
    }
}
exports.GameController = GameController;
