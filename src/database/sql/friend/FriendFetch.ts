import { DBClass, DB } from "../..";

export class FriendFetch extends DBClass {
  public static async getFriendsByDiscordId(
    discord_id: string
  ): Promise<number[]> {
    let friends = await DB.query(`SELECT * FROM friend WHERE user_id=?;`, [
      discord_id,
    ]);
    let ids: number[] = [];
    friends.forEach((friend: { friend_id: number }) => {
      ids.push(friend.friend_id);
    });
    return ids;
  }
  public static async checkRelationshipExists(user: string, friend: string) {
    let relationship = await DB.query(
      `SELECT * FROM friend WHERE user_id=? AND friend_id=?;`,
      [user, friend]
    );
    return relationship[0];
  }
}
