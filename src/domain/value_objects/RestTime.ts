export class RestTime {
  private constructor(public readonly seconds: number) {}

  public static create(seconds: number): RestTime {
    return new RestTime(Math.max(0, Math.floor(seconds)));
  }

  public static fromTimestamps(previousSetEnd: Date, nextSetStart: Date): RestTime {
    const diffMs = nextSetStart.getTime() - previousSetEnd.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    return RestTime.create(diffSeconds);
  }
}
