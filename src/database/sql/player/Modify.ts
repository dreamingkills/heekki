import { DB, DBClass } from "../../index";
import { Profile } from "../../../structures/player/Profile";
import { OkPacket } from "mysql";

export class PlayerModifySQL extends DBClass {
  public static async createNewProfile(discord_id: string): Promise<OkPacket> {
    let user = await DB.query(
      `INSERT INTO user_profile (discord_id) VALUES (${this.clean(
        discord_id
      )});`
    );
    return user;
  }
  public static async changeDescription(
    discord_id: string,
    description: string
  ): Promise<OkPacket> {
    let query = await DB.query(
      `UPDATE user_profile SET blurb=? WHERE discord_id=?;`,
      [description, discord_id]
    );
    return query;
  }
  public static async addCoins(
    discord_id: string,
    amount: number
  ): Promise<OkPacket> {
    let query = await DB.query(
      `UPDATE user_profile SET coins=coins+? WHERE discord_id=?;`,
      [amount, discord_id]
    );
    return query;
  }
  public static async removeCoins(
    discord_id: string,
    amount: number
  ): Promise<OkPacket> {
    let query = await DB.query(
      `UPDATE user_profile SET coins=coins-? WHERE discord_id=?`,
      [amount, discord_id]
    );
    return query;
  }
  public static async addHearts(
    discord_id: number,
    amount: number
  ): Promise<OkPacket> {
    let query = await DB.query(
      `UPDATE user_profile SET hearts=hearts+? WHERE discord_id=?;`,
      [amount, discord_id]
    );
    return query;
  }
  public static async removeHearts(
    discord_id: number,
    amount: number
  ): Promise<OkPacket> {
    let query = await DB.query(
      `UPDATE user_profile SET hearts=hearts-? WHERE discord_id=?`,
      [amount, discord_id]
    );
    return query;
  }
}
