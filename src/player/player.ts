export class Player {
  private name: string

  constructor(name?: string) {
    this.name = name !== undefined ? name : ""
  }

  getName(): string {
    return this.name
  }

  setName(name: string) {
    this.name = name
  }
}