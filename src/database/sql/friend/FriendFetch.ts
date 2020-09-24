import { DBClass, DB } from "../..";

export class FriendFetch extends DBClass {
  public static async getFriendIdsByDiscordId(
    discord_id: string
  ): Promise<string[]> {
    const friends = (await DB.query(`SELECT * FROM friend WHERE user_id=?;`, [
      discord_id,
    ])) as { relationship_id: number; user_id: string; friend_id: string }[];

    return friends.map((f) => {
      return f.friend_id;
    });
  }
  public static async checkRelationshipExists(
    friendOne: string,
    friendTwo: string
  ): Promise<boolean> {
    let relationship = (await DB.query(
      `SELECT * FROM friend WHERE user_id=? AND friend_id=?;`,
      [friendOne, friendTwo]
    )) as { relationship_id: number; user_id: string; friend_id: string }[];
    return relationship[0] ? true : false;
  }
}
