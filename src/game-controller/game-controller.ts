import { ConnectionManager, Message } from "../connection-manager/connection-manager"
import { Game } from "../game/game"
import { BehaviorSubject } from "rxjs"

enum GameState {
  Registration,
  NewGame,
  NewTrick,
  EndGame
}

export class GameController {

  private state: GameState
  private game: Game
  private connectionManager: ConnectionManager
  private messagePipe: BehaviorSubject<Message>

  constructor() {
    this.game = new Game()
    this.state = GameState.Registration
    this.connectionManager = new ConnectionManager()
    this.messagePipe = this.connectionManager.getMessagePipe()
  }

  run() {

    this.messagePipe.subscribe({
      next: (message: Message) => {
        console.log("game-controller: message received")
        switch (message.messageType) {
          case "register": {
            if (this.state === GameState.Registration) {
              this.processRegistration(message)
            }
            break
          }
          case "newGame": {
            this.processNewGame()
            break
          }
          case "setRounds": {
            this.processSetRounds(message)
            break
          }
          case "prediction": {
            this.processPrediction(message)
            break
          }
          case "card": {
            this.processCard()
            break
          }
          default: {
            console.log("error: unrecognised message type")
          }
        }
      },
      error: (error: any) => {}
    })
  }

  processRegistration(message: Message) {
    console.log("processing registration " + JSON.stringify(message))
    let id = this.game.addPlayer(message.data.name)
    this.connectionManager.setPlayerId(message.connectionId, id)
    this.connectionManager.broadcast("newPlayer",{playerId: id, name: message.data.name})
  }

  processSetRounds(message: Message) {
    this.game.setNumberOfRounds(message.data.rounds)
  }

  processCard() {
    console.log("processing card")
  }

  processNewGame() {
    this.game.start()
    this.game.deal()
    // this.connectionManager.sendMessage(0,"predictionRequest")
  }

  processPrediction(message: Message) {
    this.game.addPrediction(message.data.prediction)
  }
}