import { DBClass, DB } from "../..";
import { Stats } from "../../../structures/game/Stats";
import { Profile } from "../../../structures/player/Profile";

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

  public static async findRichestUser(): Promise<Profile> {
    const query = (await DB.query(
      `SELECT * FROM user_profile ORDER BY coins DESC LIMIT 1;`
    )) as {
      discord_id: string;
      blurb: string;
      coins: number;
      hearts: number;
      daily_streak: number;
      daily_last: number;
    }[];
    return new Profile(query[0]);
  }

  public static async getNumberOfRelationships(): Promise<number> {
    const query = (await DB.query(`SELECT COUNT(1) FROM friend;`)) as {
      "COUNT(*)": number;
    }[];
    return query[0]["COUNT(*)"];
  }

  public static async getTopCollector(): Promise<{
    id: string;
    cards: number;
  }> {
    const query = (await DB.query(`
      SELECT
        owner_id, COUNT(*) AS counted
      FROM user_card
      WHERE NOT owner_id=0
      GROUP BY owner_id
      ORDER BY counted DESC, owner_id
      LIMIT 1;
      `)) as { owner_id: string; counted: number }[];
    return { id: query[0].owner_id, cards: query[0].counted };
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
  public static async getTotalCoins(): Promise<number> {
    const query = (await DB.query(`SELECT SUM(coins) FROM user_profile;`)) as {
      "SUM(coins)": number;
    }[];
    return query[0][`SUM(coins)`];
  }

  /*public static async getStats(): Promise<Stats> {
    const totalAll = await this.getNumberOfCards();
    const total6 = await this.getNumberOfCards(6);
    const total5 = await this.getNumberOfCards(5);
    const total4 = await this.getNumberOfCards(4);
    const total3 = await this.getNumberOfCards(3);
    const total2 = await this.getNumberOfCards(2);
    const total1 = await this.getNumberOfCards(1);
    const misc = await this.getMiscStats();

    let totalCards = {
      total: totalAll,
      sixStars: total6,
      fiveStars: total5,
      fourStars: total4,
      threeStars: total3,
      twoStars: total2,
      oneStar: total1,
    };
    let totalProfiles = await this.getNumberOfProfiles();
    let richestUser = await this.findRichestUser();
    let totalRelationships = await this.getNumberOfRelationships();
    let topCollector = await this.getTopCollector();
    let totalOrphaned = await this.getNumberOfOrphanedCards();
    const totalCoins = await this.getTotalCoins();
    return new Stats(
      totalCards,
      totalProfiles,
      richestUser,
      totalRelationships,
      topCollector,
      totalOrphaned,
      totalCoins,
      misc.triviaCorrect,
      misc.triviaWrong,
      misc.tradesComplete,
      misc.marketSales,
      misc.missionsComplete
    );
  }*/

  /*public static async getUserStats(
    discord_id: string
  ): Promise<{
    triviaCorrect: number;
    triviaIncorrect: number;
    marketPurchases: number;
    marketSales: number;
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

    return {
      triviaCorrect: triviaCorrect[0][`COUNT(*)`],
      triviaIncorrect: triviaIncorrect[0][`COUNT(*)`],
      marketPurchases: marketPurchases[0][`COUNT(*)`],
      marketSales: marketSales[0][`COUNT(*)`],
    };
  }*/
}
