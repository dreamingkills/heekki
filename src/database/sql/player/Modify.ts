import { DB, DBClass } from "../../index";
import { Profile } from "../../../structures/player/Profile";
import { OkPacket } from "mysql";
import { CardFetchSQL } from "../card/Fetch";
import { UserCard } from "../../../structures/player/UserCard";

export class PlayerModifySQL extends DBClass {
  public static async createNewProfile(discord_id: string): Promise<OkPacket> {
    let user = await DB.query(
      `INSERT INTO user_profile (discord_id, coins) VALUES (?, ${
        999999 /*300*/
      });`,
      [discord_id]
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
    discord_id: string,
    amount: number
  ): Promise<OkPacket> {
    let query = await DB.query(
      `UPDATE user_profile SET hearts=hearts+? WHERE discord_id=?;`,
      [amount, discord_id]
    );
    return query;
  }
  public static async removeHearts(
    discord_id: string,
    amount: number
  ): Promise<OkPacket> {
    let query = await DB.query(
      `UPDATE user_profile SET hearts=hearts-? WHERE discord_id=?`,
      [amount, discord_id]
    );
    return query;
  }
  public static async setHeartSendTimestamp(
    discord_id: string
  ): Promise<OkPacket> {
    let now = Date.now();
    let query = await DB.query(
      `UPDATE user_profile SET hearts_last=? WHERE discord_id=?;`,
      [now, discord_id]
    );
    return query;
  }
  public static async setHeartBoxTimestamp(
    discord_id: string
  ): Promise<OkPacket> {
    let now = Date.now();
    let query = await DB.query(
      `UPDATE user_profile SET heart_box_last=? WHERE discord_id=?;`,
      [now, discord_id]
    );
    return query;
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
  public static async transferCard(
    recipient: string,
    cardId: number
  ): Promise<UserCard> {
    let query = await DB.query(`UPDATE user_card SET owner_id=? WHERE id=?;`, [
      recipient,
      cardId,
    ]);
    let card = await CardFetchSQL.getFullCardDataFromUserCard(cardId);
    return card.card;
  }
  public static async setOrphanTimestamp(
    discord_id: string
  ): Promise<OkPacket> {
    let now = Date.now();
    let query = await DB.query(
      `UPDATE user_profile SET last_orphan=? WHERE discord_id=?;`,
      [now, discord_id]
    );
    return query;
  }
}
