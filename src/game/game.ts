import { Player } from "../player/player"
import { Scoreboard, ScoreboardEntry } from "../scoreboard/scoreboard"
import { CardDeck } from "../card-deck/card-deck"

interface Round {
  dealer: number,
  roundNumber: number,
  predictions: number[]
  tricks: number[]
}

export class Game {

  private rounds: number
  private players: Player[]
  private currentRound: Round
  private scoreboard: Scoreboard
  private dealer: number
  private hands: string[][]
  private cardDeck: CardDeck

  constructor() {
    this.cardDeck = new CardDeck()
    this.rounds = 7
    this.players = []
    this.currentRound = {
      dealer: -1,
      roundNumber: -1,
      predictions: [],
      tricks: []      
    }
    this.scoreboard = new Scoreboard()
    this.dealer = 0
    this.hands = []
  }

  addPlayer(player: string) {
    let id = this.players.push(new Player(player))
    return (id - 1)
  }

  setNumberOfRounds(n: number) {
    this.rounds = n
  }

  start() {
    let dealer = Math.floor(Math.random() * this.players.length)
    this.currentRound = {
      dealer: dealer,
      roundNumber: 1,
      predictions: [],
      tricks: new Array(this.players.length).fill(0)
    }
  }

  deal() {
    this.cardDeck.shuffle()
    this.hands = []
    this.hands = new Array(this.currentRound.roundNumber).fill(new Array(this.players.length).fill("X"))
    for (let r=0; r<this.currentRound.roundNumber; r++) {
      for (let p=0; p<this.players.length; p++) {
        this.hands[p][r] = this.cardDeck.getNext()
      }
    }
    console.log(`New hands: ${JSON.stringify}`)
  }
  
  addPrediction(p: number) {
    this.currentRound.predictions?.push(p)
    console.log(JSON.stringify(this.currentRound))
  }

  scoreTrick(winner: number) {
    this.currentRound.tricks[winner]++
  }

  scoreRound() {
    let scores: ScoreboardEntry[] = Array(this.players.length).fill({
      prediction: 0,
      made: false,
      score: 0
    })
    
    this.currentRound.predictions.forEach( (prediction: number, index: number) => {
      scores[index].prediction = this.currentRound.predictions[index]
      let made = this.currentRound.predictions[index] === this.currentRound.tricks[index]
      scores[index].made = made
      if (made) {
        scores[index].score = 10 + (2 * scores[index].prediction)
      }
    })
    
    this.scoreboard.addRound(scores)
  }



}