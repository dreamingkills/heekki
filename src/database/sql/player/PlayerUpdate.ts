import { DB, DBClass } from "../../index";
import { OkPacket } from "mysql";

export class PlayerUpdate extends DBClass {
  public static async createNewProfile(discord_id: string): Promise<void> {
    await DB.query(
      `INSERT INTO user_profile (discord_id, coins) VALUES (?, ${300});`,
      [discord_id]
    );
  }
  public static async changeDescription(
    discord_id: string,
    description: string
  ): Promise<void> {
    await DB.query(`UPDATE user_profile SET blurb=? WHERE discord_id=?;`, [
      description,
      discord_id,
    ]);
  }
  public static async addCoins(
    discord_id: string,
    amount: number
  ): Promise<void> {
    await DB.query(
      `UPDATE user_profile SET coins=coins+? WHERE discord_id=?;`,
      [amount, discord_id]
    );
  }
  public static async removeCoins(
    discord_id: string,
    amount: number
  ): Promise<void> {
    await DB.query(`UPDATE user_profile SET coins=coins-? WHERE discord_id=?`, [
      amount,
      discord_id,
    ]);
  }
  public static async addHearts(
    discord_id: string,
    amount: number
  ): Promise<void> {
    await DB.query(
      `UPDATE user_profile SET hearts=hearts+? WHERE discord_id=?;`,
      [amount, discord_id]
    );
  }
  public static async removeHearts(
    discord_id: string,
    amount: number
  ): Promise<void> {
    await DB.query(
      `UPDATE user_profile SET hearts=hearts-? WHERE discord_id=?`,
      [amount, discord_id]
    );
  }
  public static async setHeartSendTimestamp(
    discord_id: string,
    time: number
  ): Promise<void> {
    await DB.query(
      `UPDATE user_profile SET hearts_last=? WHERE discord_id=?;`,
      [time, discord_id]
    );
  }
  public static async setHeartBoxTimestamp(
    discord_id: string,
    time: number
  ): Promise<void> {
    await DB.query(
      `UPDATE user_profile SET heart_box_last=? WHERE discord_id=?;`,
      [time, discord_id]
    );
  }
  public static async giveBadge(
    discord_id: string,
    badge_id: number
  ): Promise<OkPacket> {
    let query = await DB.query(
      `INSERT INTO user_badge (discord_id, badge_id) VALUES (?, ?);`,
      [discord_id, badge_id]
    );
    return query;
  }

  public static async setOrphanTimestamp(
    discord_id: string,
    time: number
  ): Promise<OkPacket> {
    let query = await DB.query(
      `UPDATE user_profile SET last_orphan=? WHERE discord_id=?;`,
      [time, discord_id]
    );
    return query;
  }
  public static async setMissionTimestamp(
    discord_id: string,
    time: number
  ): Promise<OkPacket> {
    let query = await DB.query(
      `UPDATE user_profile SET mission_last=? WHERE discord_id=?;`,
      [time, discord_id]
    );
    return query;
  }
  public static async setDailyTimestamp(
    discord_id: string,
    time: number
  ): Promise<OkPacket> {
    return await DB.query(
      `UPDATE user_profile SET daily_last=? WHERE discord_id=?;`,
      [time, discord_id]
    );
  }
}
