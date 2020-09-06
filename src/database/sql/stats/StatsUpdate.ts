import { DBClass, DB } from "../..";

export class StatsUpdate extends DBClass {
  public static async incrementStat(
    stat: "trivia_correct" | "trivia_wrong" | "trades_complete" | "market_sales"
  ): Promise<boolean> {
    const query = await DB.query(
      `UPDATE stats SET statistic_count=statistic_count+1 WHERE statistic_name=?;`,
      [stat]
    );
    return true;
  }
}
