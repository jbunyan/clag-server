"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameController = void 0;
const connection_manager_1 = require("../connection-manager/connection-manager");
const game_1 = require("../game/game");
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
                        this.processCard();
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
    processCard() {
        console.log("processing card");
    }
    processNewGame() {
        this.game.start();
        this.game.deal();
        // this.connectionManager.sendMessage(0,"predictionRequest")
    }
    processPrediction(message) {
        this.game.addPrediction(message.data.prediction);
    }
}
exports.GameController = GameController;
