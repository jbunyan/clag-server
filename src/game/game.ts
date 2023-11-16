import { Player } from "../player/player"
import { Scoreboard, ScoreboardEntry } from "../scoreboard/scoreboard"
import { CardDeck } from "../card-deck/card-deck"

interface Round {
  dealer: number,
  roundNumber: number,
  predictions: number[],
  tricks: number[],
  trumps: string
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
      tricks: [],
      trumps: "X"      
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

    //
    // New game
    //

    // start off with a random dealer
    let dealer = Math.floor(Math.random() * this.players.length)

    // initialise first round
    this.currentRound = {
      dealer: dealer,
      roundNumber: 1,
      predictions: [],
      tricks: new Array(this.players.length).fill(0),
      trumps: "X"
    }
  }

  nextRound() {
    let previousRound = JSON.parse(JSON.stringify(this.currentRound))
    this.currentRound = {
      dealer: this.nextPlayer(previousRound.dealer),
      roundNumber: previousRound.roundNumber + 1,
      predictions: new Array(this.players.length).fill(-1),
      tricks: new Array(this.players.length).fill(0),
      trumps: "X"
    }
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
    this.currentRound.trumps = this.setTrumps()
    console.log(`New hands: ${JSON.stringify(this.hands)}`);
  }

  nextPlayer(previous: number): number {
    let next = previous + 1
    if ( next === this.getNumberOfPlayers()) next = 0
    // console.log(`Previous: ${previous}, next: ${next}`)
    return next
  }

  getRound(): number {
    return this.currentRound.roundNumber
  }

  getTotalRounds(): number {
    return this.rounds
  }

  getDealer(): number {
    return this.currentRound.dealer
  }

  getNumberOfPlayers(): number {
    return this.players.length
  }

  setTrumps(): string {
    let trumpCard = this.cardDeck.getNext()
    let suit = trumpCard.substring(trumpCard.length - 1)
    return suit
  }

  getTrumps(): string {
    return this.currentRound.trumps
  }

  getNumberOfTricks() {
    return this.currentRound.roundNumber
  }

  getPredictions(): number[] {
    return this.currentRound.predictions
  }

  getHands(): string[][] {
    return this.hands
  }
  
  addPrediction(player: number, p: number) {
    this.currentRound.predictions[player] = p
    console.log(JSON.stringify(this.currentRound))
  }

  awardTrick(winner: number) {
    this.currentRound.tricks[winner]++
  }

  scoreRound() {
    let scores: ScoreboardEntry[] = []
    
    for (let i=0; i<this.players.length; i++) {
      let s = {
        prediction: 0,
        made: false,
        score: 0
      }
      scores.push(s)
    }
 
    this.currentRound.predictions.forEach( (prediction: number, index: number) => {
      scores[index].prediction = this.currentRound.predictions[index]
      let made = this.currentRound.predictions[index] === this.currentRound.tricks[index] ? true : false
      scores[index].made = made
      if (made) {
        scores[index].score = 10 + (2 * scores[index].prediction)
      }
    })
    
    this.scoreboard.addRound(scores)

    console.log(`currentRound: ${JSON.stringify(this.currentRound)}`)

    console.log(`Scoreboard: ${JSON.stringify(this.scoreboard.getScoreboard())}`)
  }

  getScoreboard() {
    return this.scoreboard
  }

  getPlayers(): string[] {
    return this.players.map(p => p.getName())
  }

}