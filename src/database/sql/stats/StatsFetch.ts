import { DBClass, DB } from "../..";

export class StatsFetch extends DBClass {
  public static async getNumberOfCards(stars?: number): Promise<number> {
    let query = `SELECT COUNT(*) FROM user_card`;
    if (stars) query += ` WHERE stars=?`;
    const count = (await DB.query(`${query};`, [stars])) as {
      "COUNT(*)": number;
    }[];
    return count[0]["COUNT(*)"];
  }

  public static async getNumberOfProfiles(): Promise<number> {
    const query = (await DB.query(`SELECT COUNT(*) FROM user_profile;`)) as {
      "COUNT(*)": number;
    }[];
    return query[0]["COUNT(*)"];
  }

  public static async getNumberOfRelationships(): Promise<number> {
    const query = (await DB.query(`SELECT COUNT(*) FROM friend;`)) as {
      "COUNT(*)": number;
    }[];
    return query[0]["COUNT(*)"];
  }

  public static async getNumberOfOrphanedCards(): Promise<number> {
    const query = (await DB.query(
      `SELECT COUNT(*) FROM user_card WHERE owner_id=0;`
    )) as { "COUNT(*)": number }[];
    return query[0]["COUNT(*)"];
  }

  public static async getNumberOfCardsInMarketplace(): Promise<number> {
    const query = (await DB.query(`SELECT COUNT(*) FROM marketplace;`)) as {
      "COUNT(*)": number;
    }[];
    return query[0][`COUNT(*)`];
  }

  public static async getUserStats(
    discord_id: string
  ): Promise<{
    triviaCorrect: number;
    triviaIncorrect: number;
    marketPurchases: number;
    marketSales: number;
    tradesComplete: number;
    missionsSuccessful: number;
    missionsFailed: number;
  }> {
    const triviaCorrect = (await DB.query(
      `SELECT COUNT(*) FROM trivia WHERE discord_id=? AND correct=1;`,
      [discord_id]
    )) as { "COUNT(*)": number }[];
    const triviaIncorrect = (await DB.query(
      `SELECT COUNT(*) FROM trivia WHERE discord_id=? AND correct=0;`,
      [discord_id]
    )) as { "COUNT(*)": number }[];
    const marketPurchases = (await DB.query(
      `SELECT COUNT(*) FROM sale WHERE buyer_id=?;`,
      [discord_id]
    )) as { "COUNT(*)": number }[];
    const marketSales = (await DB.query(
      `SELECT COUNT(*) FROM sale WHERE seller_id=?;`,
      [discord_id]
    )) as { "COUNT(*)": number }[];
    const tradesComplete = (await DB.query(
      `SELECT COUNT(*) FROM trade WHERE (sender_id=? OR receiver_id=?);`,
      [discord_id, discord_id]
    )) as { "COUNT(*)": number }[];
    const missionsSuccessful = (await DB.query(
      `SELECT COUNT(*) FROM mission WHERE discord_id=? AND success=1;`,
      [discord_id]
    )) as { "COUNT(*)": number }[];
    const missionsFailed = (await DB.query(
      `SELECT COUNT(*) FROM mission WHERE discord_id=? AND success=0;`,
      [discord_id]
    )) as { "COUNT(*)": number }[];

    return {
      triviaCorrect: triviaCorrect[0][`COUNT(*)`],
      triviaIncorrect: triviaIncorrect[0][`COUNT(*)`],
      marketPurchases: marketPurchases[0][`COUNT(*)`],
      marketSales: marketSales[0][`COUNT(*)`],
      tradesComplete: tradesComplete[0][`COUNT(*)`],
      missionsSuccessful: missionsSuccessful[0][`COUNT(*)`],
      missionsFailed: missionsFailed[0][`COUNT(*)`],
    };
  }

  public static async getTotalCoins(): Promise<number> {
    const query = (await DB.query(`SELECT SUM(coins) FROM user_profile;`)) as {
      "SUM(coins)": number;
    }[];
    return query[0][`SUM(coins)`];
  }

  public static async getTotalHearts(): Promise<number> {
    const query = (await DB.query(`SELECT SUM(hearts) FROM user_profile;`)) as {
      "SUM(hearts)": number;
    }[];
    return query[0][`SUM(hearts)`];
  }
  public static async getTotalXp(): Promise<number> {
    const query = (await DB.query(`SELECT SUM(xp) FROM user_profile;`)) as {
      "SUM(xp)": number;
    }[];
    return query[0][`SUM(xp)`];
  }
}
