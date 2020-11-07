export class ConcurrencyService {
  static users: Set<string> = new Set<string>();
  public static checkConcurrency(userId: string): boolean {
    return this.users.has(userId);
  }
  public static setConcurrency(userId: string): void {
    this.users.add(userId);
    return;
  }
  public static unsetConcurrency(userId: string): void {
    this.users.delete(userId);
  }
  public static flushConcurrency(): void {
    this.users.clear();
    return;
  }
}
