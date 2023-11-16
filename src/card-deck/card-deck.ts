export class CardDeck {

  private packOfCards: string[] = [
    "AH","2H","3H","4H","5H","6H","7H","8H","9H","10H","JH","QH","KH",
    "AC","2C","3C","4C","5C","6C","7C","8C","9C","10C","JC","QC","KC",
    "AD","2D","3D","4D","5D","6D","7D","8D","9D","10D","JD","QD","KD",
    "AS","2S","3S","4S","5S","6S","7S","8S","9S","10S","JS","QS","KS"
  ]

  private cards: string[] = []

  private pointer: number = 0;


  constructor() {
    this.shuffle()
  }

  shuffle() {

    this.cards = [...this.packOfCards]
    
    let currentIndex = this.cards.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex > 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [this.cards[currentIndex], this.cards[randomIndex]] = [
        this.cards[randomIndex], this.cards[currentIndex]];
    }
    
    this.pointer = 0;
  }

  getNext(): string {
    return this.cards[this.pointer++]
  }
}