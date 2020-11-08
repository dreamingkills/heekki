import { StatsUpdate } from "../sql/stats/StatsUpdate";
import { StatsFetch } from "../sql/stats/StatsFetch";
import { Profile } from "../../structures/player/Profile";

export class StatsService {
  public static async getNumberOfOrphanedCards(): Promise<number> {
    return await StatsFetch.getNumberOfOrphanedCards();
  }

  public static async getNumberOfCardsInMarketplace(): Promise<number> {
    return await StatsFetch.getNumberOfCardsInMarketplace();
  }

  public static async triviaComplete(
    profile: Profile,
    correct: boolean
  ): Promise<void> {
    StatsUpdate.triviaComplete(profile.discord_id, correct);
  }

  public static async missionComplete(
    profile: Profile,
    correct: boolean
  ): Promise<void> {
    StatsUpdate.missionComplete(profile.discord_id, correct);
  }

  public static async saleComplete(
    buyer: Profile,
    seller: string,
    card: string,
    price: number
  ): Promise<void> {
    StatsUpdate.saleComplete(buyer.discord_id, seller, card, price);
  }

  public static async tradeComplete(
    sender: Profile,
    receiver: Profile
  ): Promise<void> {
    StatsUpdate.tradeComplete(sender.discord_id, receiver.discord_id);
  }

  public static async getUserStats(
    profile: Profile
  ): Promise<{
    triviaCorrect: number;
    triviaIncorrect: number;
    marketPurchases: number;
    marketSales: number;
    tradesComplete: number;
    missionsSuccessful: number;
    missionsFailed: number;
  }> {
    return await StatsFetch.getUserStats(profile.discord_id);
  }

  /*
      General Stats
                     */
  public static async getNumberOfCards(stars?: number): Promise<number> {
    return await StatsFetch.getNumberOfCards(stars);
  }
  public static async getNumberOfProfiles(): Promise<number> {
    return await StatsFetch.getNumberOfProfiles();
  }
  public static async getNumberOfRelationships(): Promise<number> {
    return await StatsFetch.getNumberOfRelationships();
  }
  public static async getNumberOfCoins(): Promise<number> {
    return await StatsFetch.getTotalCoins();
  }
  public static async getNumberOfHearts(): Promise<number> {
    return await StatsFetch.getTotalHearts();
  }
  public static async getNumberOfXp(): Promise<number> {
    return await StatsFetch.getTotalXp();
  }
}
