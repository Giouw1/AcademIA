export class Repetitions {
  private constructor(public readonly value: number) {}

  public static create(value: number): Repetitions {
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error('Repetitions must be greater than zero');
    }
    return new Repetitions(value);
  }
}
