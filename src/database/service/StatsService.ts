import { StatsUpdate } from "../sql/stats/StatsUpdate";
import { StatsFetch } from "../sql/stats/StatsFetch";
import { Stats } from "../../structures/game/Stats";

export class StatsService {
  public static async getGlobalStats(): Promise<Stats> {
    return await StatsFetch.getStats();
  }
  public static async incrementStat(
    stat:
      | "trivia_correct"
      | "trivia_wrong"
      | "trades_complete"
      | "market_sales"
      | "missions_complete"
  ): Promise<boolean> {
    return await StatsUpdate.incrementStat(stat);
  }

  public static async getMiscStats(): Promise<{
    triviaCorrect: number;
    triviaWrong: number;
    tradesComplete: number;
    marketSales: number;
    missionsComplete: number;
  }> {
    return await StatsFetch.getMiscStats();
  }

  public static async getNumberOfOrphanedCards(): Promise<number> {
    return await StatsFetch.getNumberOfOrphanedCards();
  }

  public static async getNumberOfCardsInMarketplace(): Promise<number> {
    return await StatsFetch.getNumberOfCardsInMarketplace();
  }

  public static async triviaComplete(
    discord_id: string,
    correct: boolean
  ): Promise<void> {
    StatsUpdate.triviaComplete(discord_id, correct);
  }
}
