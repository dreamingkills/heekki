import { DBClass, DB } from "../..";

export class Stats extends DBClass {
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

  public static async findRichestUser(): Promise<string> {
    const query = await DB.query(
      `SELECT * FROM user_profile ORDER BY coins DESC LIMIT 1;`
    );
    return query[0].discord_id;
  }

  public static async getNumberOfRelationships(): Promise<number> {
    const query = await DB.query(`SELECT COUNT(1) FROM friend;`);
    return query[0][`COUNT(1)`];
  }

  public static async getTopCollector(): Promise<{
    id: string;
    count: number;
  }> {
    const query = await DB.query(`
      SELECT
        owner_id, COUNT(*) AS counted
      FROM user_card
      GROUP BY owner_id
      ORDER BY counted DESC, owner_id
      LIMIT 1;
      `);
    return { id: query[0].owner_id, count: query[0].counted };
  }
}
