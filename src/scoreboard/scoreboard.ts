export interface ScoreboardEntry {
  prediction: number;
  made: boolean;
  score: number;
}

export class Scoreboard {

  private scoreboard: ScoreboardEntry[][] = []

  constructor() {
    // intentionally empty
  }
  
  getScoreboard(): ScoreboardEntry[][] {
    return this.scoreboard
  }

  addRound(round: ScoreboardEntry[]) {

    this.scoreboard.push(round)
    if (this.scoreboard.length !== 1) {
      let justAdded = this.scoreboard.length - 1
      let previous = justAdded - 1
      this.scoreboard[justAdded].forEach((entry: ScoreboardEntry, index: number) => {
        this.scoreboard[justAdded][index].score += this.scoreboard[previous][index].score
      })
    }
  }
}