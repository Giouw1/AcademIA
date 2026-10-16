export class Weight {
  private constructor(public readonly value: number, public readonly unit: 'kg' | 'lbs' = 'kg') {}

  public static create(value: number, unit: 'kg' | 'lbs' = 'kg'): Weight {
    if (value < 0) {
      throw new Error('Weight cannot be negative');
    }
    return new Weight(value, unit);
  }
}
