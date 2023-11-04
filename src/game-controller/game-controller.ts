import { ConnectionManager, Message } from "../connection-manager/connection-manager"
import { Game } from "../game/game"
import { CardUtils, Compare } from "../card-utils/card-utils"
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
  private currentTrick: string[]
  private leadoutPlayer: number
  private trickNumber: number


  constructor() {
    this.game = new Game()
    this.state = GameState.Registration
    this.connectionManager = new ConnectionManager()
    this.messagePipe = this.connectionManager.getMessagePipe()
    this.currentTrick = []
    this.leadoutPlayer = -1
    this.trickNumber = -1
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
            this.processCard(message)
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

  processNewGame() {
    this.game.start()
    this.startNextRound()
  }

  startNextRound() {
    console.log("///")
    console.log(`/// Round: ${this.game.getRound()}, dealer: ${this.game.getDealer()}`)
    console.log("///")
    this.game.deal()
    let trumps = this.game.getTrumps()
    let hands: string[][] = this.game.getHands()
    let dealer = this.game.getDealer()
    this.trickNumber = 0
    hands.forEach( (hand: string[], index: number) => {
      this.connectionManager.sendMessage(index, "hand", {"hand": hand, "trumps": trumps, "dealer": dealer})
    })
    
    let leadoutPlayer = this.game.nextPlayer(dealer)
    this.connectionManager.sendMessage(leadoutPlayer,"predictionRequest") // start getting predictions from leadout player
  }

  processPrediction(message: Message) {
    this.game.addPrediction(message.data.prediction)
    if ( message.playerId !== this.game.getDealer()) {
      let nextPlayer = this.game.nextPlayer(message.playerId)
      this.connectionManager.sendMessage(nextPlayer,"predictionRequest")
    } else {
      console.log("All predictions rec'd")
      this.connectionManager.broadcast("predictions",{"predictions": this.game.getPredictions()})
      let leadoutPlayer = this.game.nextPlayer(this.game.getDealer())
      this.leadoutPlayer = leadoutPlayer
      this.startNewTrick()
    }
  }

  startNewTrick() {
    this.trickNumber++
    console.log("///")
    console.log(`/// Round: ${this.game.getRound()}, trick: ${this.trickNumber}, leadout: ${this.leadoutPlayer}` )
    console.log("///")
    this.currentTrick = new Array(this.game.getNumberOfPlayers()).fill("X")
    this.connectionManager.sendMessage(this.leadoutPlayer, "playCard")
  }

  processCard(message: Message) {
    this.connectionManager.broadcast("cardPlayed",{"playerId": message.playerId, "card": message.data.card})
    this.currentTrick[message.playerId] = message.data.card

    let nextPlayer = this.game.nextPlayer(message.playerId)
    if (nextPlayer === this.leadoutPlayer) {
      // trick complete!
      console.log("Trick:" + JSON.stringify(this.currentTrick))
      this.scoreTrick()

      if (this.trickNumber !== this.game.getRound()) {
        this.startNewTrick()
      } else if ( this.game.getRound() !== 3) {
        this.game.scoreRound()
        this.game.nextRound()
        this.startNextRound()
      } else {
        this.game.scoreRound()
      }

    } else {
      this.connectionManager.sendMessage(nextPlayer, "playCard")
    }
  }

  scoreTrick() {
    let trumps = this.game.getTrumps()
    let winningPlayer = this.leadoutPlayer // until told otherwise....
    let winningCard = this.currentTrick[winningPlayer]
    let nextPlayer = this.game.nextPlayer(this.leadoutPlayer)

    for (let i=0; i<this.game.getNumberOfPlayers() - 1; i++) {
      let challengeCard = this.currentTrick[nextPlayer]
      let comparison = CardUtils.compare(winningCard,challengeCard,trumps)
      if (comparison === Compare.LT) {
        winningCard = challengeCard
        winningPlayer = nextPlayer
      }
      nextPlayer = this.game.nextPlayer(nextPlayer)
    }

    console.log(`trick score - winning player: ${winningPlayer}, winning card: ${winningCard}`)
    this.game.awardTrick(winningPlayer)
    this.leadoutPlayer = winningPlayer

  }
}