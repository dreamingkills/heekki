import { DBClass, DB } from "../..";
import { PlayerService } from "../../service/PlayerService";

export class FriendUpdate extends DBClass {
  public static async addFriendByDiscordId(
    discord_id: string,
    friend_id: string
  ): Promise<void> {
    await DB.query(`INSERT INTO friend (user_id, friend_id) VALUES (?, ?)`, [
      discord_id,
      friend_id,
    ]);
  }
  public static async removeFriendByDiscordId(
    discord_id: string,
    friend_id: string
  ): Promise<void> {
    await DB.query(`DELETE FROM friend WHERE user_id=? AND friend_id=?;`, [
      discord_id,
      friend_id,
    ]);
  }
}
