export class Errors {
  private readonly errors: string[] = []

  add(error: string, ...errors: ReadonlyArray<string>): void {
    this.errors.push(error, ...errors)
  }

  noErrors(): boolean {
    return this.errors.length === 0
  }

  toString(): string {
    return this.errors.join('\n')
  }
}
