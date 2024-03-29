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
    await DB.query(
      `INSERT INTO trivia (discord_id, correct, time) VALUES (?, ?, ?);`,
      [discord_id, correct, Date.now()]
    );
  }

  public static async missionComplete(
    discord_id: string,
    correct: boolean
  ): Promise<void> {
    await DB.query(
      `INSERT INTO mission (discord_id, success, time) VALUES (?, ?, ?);`,
      [discord_id, correct, Date.now()]
    );
  }

  public static async saleComplete(
    buyer_id: string,
    seller_id: string,
    card: string,
    price: number
  ): Promise<void> {
    await DB.query(
      `INSERT INTO sale (buyer_id, seller_id, card, price, time) VALUES (?, ?, ?, ?, ?);`,
      [buyer_id, seller_id, card, price, Date.now()]
    );
  }

  public static async tradeComplete(
    sender_id: string,
    receiver_id: string
  ): Promise<void> {
    await DB.query(
      `INSERT INTO trade (sender_id, receiver_id, time) VALUES (?, ?, ?);`,
      [sender_id, receiver_id, Date.now()]
    );
  }

  public static async jumbleComplete(
    discordId: string,
    correct: boolean
  ): Promise<void> {
    await DB.query(
      `INSERT INTO jumble (discord_id, time, correct) VALUES (?, ?, ?);`,
      [discordId, Date.now(), correct]
    );
    return;
  }
  public static async memoryComplete(
    discordId: string,
    correct: boolean
  ): Promise<void> {
    await DB.query(
      `INSERT INTO memory (discord_id, time, correct) VALUES (?, ?, ?);`,
      [discordId, Date.now(), correct]
    );
    return;
  }
}
