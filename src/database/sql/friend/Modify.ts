import { DBClass, DB } from "../..";
import { PlayerFetchSQL } from "../player/Fetch";

export class FriendModifySQL extends DBClass {
  public static async addFriendByDiscordId(user: string, friend: string) {
    let friendUser = await PlayerFetchSQL.getProfileFromDiscordId(friend);
    let query = await DB.query(
      `INSERT INTO friend (user_id, friend_id) VALUES (?, ?)`,
      [user, friendUser.discord_id]
    );
    return query;
  }
  public static async removeFriendByDiscordId(user: string, friend: string) {
    let friendUser = await PlayerFetchSQL.getProfileFromDiscordId(friend);
    let query = await DB.query(
      `DELETE FROM friend WHERE user_id=? AND friend_id=?;`,
      [user, friendUser.discord_id]
    );
    return query;
  }
}
