import { DBClass, DB } from "../..";

export class FriendFetch extends DBClass {
  public static async getFriendsByDiscordId(
    discord_id: string
  ): Promise<string[]> {
    let friends = await DB.query(`SELECT * FROM friend WHERE user_id=?;`, [
      discord_id,
    ]);
    let ids: string[] = [];
    friends.forEach((friend: { friend_id: string }) => {
      ids.push(friend.friend_id);
    });
    return ids;
  }
  public static async checkRelationshipExists(
    friendOne: string,
    friendTwo: string
  ): Promise<boolean> {
    let relationship = await DB.query(
      `SELECT * FROM friend WHERE user_id=? AND friend_id=?;`,
      [friendOne, friendTwo]
    );
    return relationship[0] ? true : false;
  }
}
