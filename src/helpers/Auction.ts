import { Profile } from "../structures/player/Profile";

export class AuctionService {
  static auctioningFor: string | undefined;
  static bid: { profile: Profile; bid: number } | undefined;

  public static setAuction(name: string): void {
    this.auctioningFor = name;
    return;
  }
  public static getAuction(): string | undefined {
    return this.auctioningFor;
  }
  public static clearAuction(): void {
    this.auctioningFor = undefined;
    this.bid = undefined;
  }

  public static setBid(profile: Profile, bid: number): void {
    this.bid = { profile, bid };
    return;
  }
  public static getTopBid(): { profile: Profile; bid: number } | undefined {
    return this.bid;
  }
}
