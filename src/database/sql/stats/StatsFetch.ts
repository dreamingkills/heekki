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

  /*
      Economy
               */
  public static async getUserSales(discordId: string): Promise<number> {
    const query = (await DB.query(
      `SELECT COUNT(*) AS count FROM sale WHERE seller_id=?;`,
      [discordId]
    )) as { count: number }[];
    return query[0].count;
  }
  public static async getUserPurchases(discordId: string): Promise<number> {
    const query = (await DB.query(
      `SELECT COUNT(*) AS count FROM sale WHERE buyer_id=?;`,
      [discordId]
    )) as { count: number }[];
    return query[0].count;
  }
  public static async getUserTrades(discordId: string): Promise<number> {
    const query = (await DB.query(
      `SELECT COUNT(*) AS count FROM trade WHERE (sender_id=? OR receiver_id=?);`,
      [discordId, discordId]
    )) as { count: number }[];
    return query[0].count;
  }
  public static async getUserMissions(
    discordId: string
  ): Promise<{ success: boolean; time: number }[]> {
    const query = (await DB.query(`SELECT * FROM mission WHERE discord_id=?;`, [
      discordId,
    ])) as { discord_id: number; success: boolean; time: number }[];
    return query;
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

  public static async getUserTrivias(
    discordId: string
  ): Promise<{ time: number; correct: boolean }[]> {
    const query = (await DB.query(`SELECT * FROM trivia WHERE discord_id=?;`, [
      discordId,
    ])) as { discord_id: string; time: number; correct: boolean }[];
    return query;
  }
  public static async getUserJumbles(
    discordId: string
  ): Promise<{ time: number; correct: boolean }[]> {
    const query = (await DB.query(`SELECT * FROM jumble WHERE discord_id=?;`, [
      discordId,
    ])) as { discord_id: string; time: number; correct: boolean }[];
    return query;
  }
  public static async getUserMemories(
    discordId: string
  ): Promise<{ time: number; correct: boolean }[]> {
    const query = (await DB.query(`SELECT * FROM memory WHERE discord_id=?;`, [
      discordId,
    ])) as { discord_id: string; time: number; correct: boolean }[];
    return query;
  }

  public static async getTotalJumbles(): Promise<number> {
    const query = (await DB.query(`SELECT COUNT(*) AS count FROM jumble;`)) as {
      count: number;
    }[];
    return query[0].count;
  }
  public static async getTotalMemories(): Promise<number> {
    const query = (await DB.query(`SELECT COUNT(*) AS count FROM memory;`)) as {
      count: number;
    }[];
    return query[0].count;
  }
}
