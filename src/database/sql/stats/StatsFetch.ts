import { DBClass, DB } from "../..";
import { Stats } from "../../../structures/game/Stats";

export class StatsFetch extends DBClass {
  public static async getNumberOfCards(stars?: number): Promise<number> {
    let query;
    if (stars) {
      query = `SELECT COUNT(1) FROM user_card WHERE stars=?`;
    } else {
      query = `SELECT COUNT(1) FROM user_card;`;
    }
    const count = await DB.query(query, [stars]);
    return count[0][`COUNT(1)`];
  }

  public static async getNumberOfProfiles(): Promise<number> {
    const query = await DB.query(`SELECT COUNT(1) FROM user_profile;`);
    return query[0][`COUNT(1)`];
  }

  public static async findRichestUser(): Promise<{
    id: string;
    coins: number;
  }> {
    const query = await DB.query(
      `SELECT * FROM user_profile ORDER BY coins DESC LIMIT 1;`
    );
    return { id: query[0].discord_id, coins: query[0].coins };
  }

  public static async getNumberOfRelationships(): Promise<number> {
    const query = await DB.query(`SELECT COUNT(1) FROM friend;`);
    return query[0][`COUNT(1)`];
  }

  public static async getTopCollector(): Promise<{
    id: string;
    cards: number;
  }> {
    const query = await DB.query(`
      SELECT
        owner_id, COUNT(*) AS counted
      FROM user_card
      WHERE NOT owner_id=0
      GROUP BY owner_id
      ORDER BY counted DESC, owner_id
      LIMIT 1;
      `);
    return { id: query[0].owner_id, cards: query[0].counted };
  }

  public static async getNumberOfOrphanedCards(): Promise<number> {
    const query = await DB.query(
      `SELECT COUNT(1) FROM user_card WHERE owner_id=0;`
    );
    return query[0][`COUNT(1)`];
  }

  public static async getTotalCoins(): Promise<number> {
    return (await DB.query(`SELECT SUM(coins) FROM user_profile;`))[0][
      `SUM(coins)`
    ];
  }

  public static async getStats(): Promise<Stats> {
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
  }

  public static async getMiscStats(): Promise<{
    triviaCorrect: number;
    triviaWrong: number;
    tradesComplete: number;
    marketSales: number;
    missionsComplete: number;
  }> {
    const query = await DB.query(`SELECT * FROM stats;`);
    return {
      triviaCorrect: query[0].statistic_count,
      triviaWrong: query[1].statistic_count,
      tradesComplete: query[2].statistic_count,
      marketSales: query[3].statistic_count,
      missionsComplete: query[4].statistic_count,
    };
  }
}
