import { StatsUpdate } from "../sql/stats/StatsUpdate";
import { StatsFetch } from "../sql/stats/StatsFetch";

export class StatsService {
  public static async incrementStat(
    stat: "trivia_correct" | "trivia_wrong" | "trades_complete" | "market_sales"
  ): Promise<boolean> {
    return await StatsUpdate.incrementStat(stat);
  }

  public static async getMiscStats(): Promise<{
    triviaCorrect: number;
    triviaWrong: number;
    tradesComplete: number;
    marketSales: number;
  }> {
    return await StatsFetch.getMiscStats();
  }
}
