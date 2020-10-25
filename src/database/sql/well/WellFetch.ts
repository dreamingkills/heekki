import { DB, DBClass } from "../..";
import { ProfileInterface } from "../../../structures/interface/ProfileInterface";
import { Profile } from "../../../structures/player/Profile";

export class WellFetch extends DBClass {
  public static async getWellTotal(): Promise<number> {
    const query = (await DB.query(
      `SELECT SUM(well) AS total FROM user_profile;`
    )) as {
      total: number;
    }[];
    return query[0].total;
  }

  public static async getTopDonators(limit: number): Promise<Profile[]> {
    const query = (await DB.query(
      `SELECT * FROM user_profile ORDER BY well DESC LIMIT ?;`,
      [limit]
    )) as ProfileInterface[];
    return query.map((p) => new Profile(p));
  }

  public static async getWellRankByDiscordId(id: string): Promise<number> {
    const query = (await DB.query(
      `SELECT COUNT(*) AS rank FROM user_profile WHERE well>=(SELECT well FROM user_profile WHERE discord_id=?);`,
      [id]
    )) as { rank: number }[];
    return query[0].rank;
  }
}
