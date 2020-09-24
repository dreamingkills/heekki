import { DBClass, DB } from "../..";

export class StatsUpdate extends DBClass {
  public static async incrementStat(
    stat:
      | "trivia_correct"
      | "trivia_wrong"
      | "trades_complete"
      | "market_sales"
      | "missions_complete"
  ): Promise<void> {
    await DB.query(
      `UPDATE stats SET statistic_count=statistic_count+1 WHERE statistic_name=?;`,
      [stat]
    );
  }

  public static async triviaComplete(
    discord_id: string,
    correct: boolean
  ): Promise<void> {
    await DB.query(`INSERT INTO trivia (discord_id, correct) VALUES (?, ?);`, [
      discord_id,
      correct,
    ]);
  }

  public static async missionComplete(
    discord_id: string,
    correct: boolean
  ): Promise<void> {
    await DB.query(`INSERT INTO mission (discord_id, success) VALUES (?, ?);`, [
      discord_id,
      correct,
    ]);
  }

  public static async saleComplete(
    buyer_id: string,
    seller_id: string,
    card: string
  ): Promise<void> {
    await DB.query(
      `INSERT INTO sale (buyer_id, seller_id, card) VALUES (?, ?, ?);`,
      [buyer_id, seller_id, card]
    );
  }
}
