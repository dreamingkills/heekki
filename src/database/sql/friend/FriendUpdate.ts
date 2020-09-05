import { DBClass, DB } from "../..";
import { PlayerService } from "../../service/PlayerService";

export class FriendUpdate extends DBClass {
  public static async addFriendByDiscordId(user: string, friend: string) {
    let friendUser = await PlayerService.getProfileByDiscordId(friend, true);
    let query = await DB.query(
      `INSERT INTO friend (user_id, friend_id) VALUES (?, ?)`,
      [user, friendUser.discord_id]
    );
    return query;
  }
  public static async removeFriendByDiscordId(user: string, friend: string) {
    let friendUser = await PlayerService.getProfileByDiscordId(friend, true);
    let query = await DB.query(
      `DELETE FROM friend WHERE user_id=? AND friend_id=?;`,
      [user, friendUser.discord_id]
    );
    return query;
  }
}
