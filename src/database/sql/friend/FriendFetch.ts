import { DBClass, DB } from "../..";
import { Friend } from "../../../structures/player/Friend";

export class FriendFetch extends DBClass {
  public static async getFriendRequestsByDiscordId(
    discord_id: string,
    type: "incoming" | "outgoing"
  ): Promise<Friend[]> {
    let requests;
    if (type === "incoming") {
      requests = (await DB.query(
        `SELECT * FROM friend WHERE friend_id=? AND confirmed=false;`,
        [discord_id]
      )) as {
        relationship_id: number;
        sender_id: string;
        friend_id: string;
        confirmed: boolean;
      }[];
    }
    requests = (await DB.query(
      `SELECT * FROM friend WHERE sender_id=? AND confirmed=false;`,
      [discord_id]
    )) as {
      relationship_id: number;
      sender_id: string;
      friend_id: string;
      confirmed: boolean;
    }[];

    return requests.map((f) => {
      return new Friend(f);
    });
  }

  public static async getFriendsByDiscordId(
    discord_id: string,
    page: number
  ): Promise<Friend[]> {
    const friends = (await DB.query(
      `SELECT * FROM friend WHERE (sender_id=? OR friend_id=?) AND confirmed=1 LIMIT 20 OFFSET ${
        page * 20 - 20
      };`,
      [discord_id, discord_id]
    )) as {
      relationship_id: number;
      sender_id: string;
      friend_id: string;
      confirmed: boolean;
    }[];

    return friends.map((f) => {
      return new Friend(f);
    });
  }

  public static async getAllFriends(discord_id: string): Promise<Friend[]> {
    const friends = (await DB.query(
      `SELECT * FROM friend WHERE (sender_id=? OR friend_id=?) AND confirmed=1;`,
      [discord_id, discord_id]
    )) as {
      relationship_id: number;
      sender_id: string;
      friend_id: string;
      confirmed: boolean;
    }[];

    return friends.map((f) => {
      return new Friend(f);
    });
  }

  public static async getNumberOfFriends(discordId: string): Promise<number> {
    const query = (await DB.query(
      `SELECT COUNT(*) FROM friend WHERE (sender_id=? OR friend_id=?) AND confirmed=true;`,
      [discordId, discordId]
    )) as { "COUNT(*)": number }[];
    return query[0]["COUNT(*)"];
  }

  public static async getIncomingFriendRequests(
    discord_id: string
  ): Promise<Friend[]> {
    const query = (await DB.query(
      `SELECT * FROM friend WHERE friend_id=? AND confirmed=false;`,
      [discord_id]
    )) as {
      relationship_id: number;
      sender_id: string;
      friend_id: string;
      confirmed: boolean;
    }[];
    return query.map((f) => {
      return new Friend(f);
    });
  }

  public static async checkRelationshipExists(
    friendOne: string,
    friendTwo: string
  ): Promise<"OK" | "ACCEPTABLE" | "ALREADY_FRIENDS" | "REQUESTED" | "ERROR"> {
    let relationship = (await DB.query(
      `SELECT * FROM friend WHERE (sender_id=? AND friend_id=?) OR (sender_id=? AND friend_id=?);`,
      [friendOne, friendTwo, friendTwo, friendOne]
    )) as {
      relationship_id: number;
      user_id: string;
      friend_id: string;
      confirmed: boolean;
    }[];
    if (!relationship[0]) return "OK";
    if (friendOne === relationship[0].friend_id && !relationship[0].confirmed)
      return "ACCEPTABLE";
    if (relationship[0].confirmed) return "ALREADY_FRIENDS";
    if (!relationship[0].confirmed) return "REQUESTED";
    return "ERROR";
  }

  public static async getTotalHeartsSent(
    senderId: string,
    friends: string[]
  ): Promise<{ sender_id: string; count: number }[]> {
    const query = (await DB.query(
      `SELECT sender_id, COUNT(*) AS count FROM friend_heart WHERE sender_id IN(?) AND friend_id=? GROUP BY sender_id;`,
      [friends, senderId]
    )) as { sender_id: string; count: number }[];
    return query;
  }
}
