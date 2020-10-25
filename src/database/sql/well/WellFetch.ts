import { DB, DBClass } from "../..";

export class WellFetch extends DBClass {
  public static async getWellTotal(): Promise<number> {
    const query = (await DB.query(
      `SELECT SUM(well) AS total FROM user_profile;`
    )) as {
      total: number;
    }[];
    return query[0].total;
  }
}
