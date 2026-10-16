export class Warmup {
  private constructor(public readonly isWarmup: boolean) {}

  public static create(isWarmup: boolean): Warmup {
    return new Warmup(Boolean(isWarmup));
  }
}
