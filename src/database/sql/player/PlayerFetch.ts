import { DB } from "../../index";
import { Profile } from "../../../structures/player/Profile";
import { UserCard } from "../../../structures/player/UserCard";
import { DBClass } from "../../index";
import { Badge } from "../../../structures/player/Badge";
import * as error from "../../../structures/Error";
import { Fish } from "../../../structures/game/Fish";
import { PlayerService } from "../../service/PlayerService";

export class PlayerFetch extends DBClass {
  public static async checkIfUserExists(discord_id: string): Promise<boolean> {
    let clean = this.cleanMention(discord_id);
    let query = (await DB.query(
      `SELECT * FROM user_profile WHERE discord_id=?;`,
      [clean]
    )) as { discord_id: string }[];
    return query[0] ? true : false;
  }

  public static async getProfileFromDiscordId(
    discord_id: string
  ): Promise<Profile> {
    const user = (await DB.query(
      `SELECT * FROM user_profile WHERE discord_id=?;`,
      [discord_id]
    )) as {
      discord_id: string;
      blurb: string;
      coins: number;
      hearts: number;
      daily_streak: number;
      daily_last: number;
    }[];
    if (!user[0]) {
      const newProfile = await PlayerService.createNewProfile(discord_id);
      return newProfile;
    }
    return new Profile(user[0]);
  }

  public static async getOrphanedCardCount(options?: {
    [key: string]: string | number;
  }): Promise<number> {
    let query = `SELECT COUNT(*) FROM card LEFT JOIN user_card ON user_card.card_id=card.id WHERE user_card.owner_id=0`;
    let queryOptions = [];

    if (options?.pack)
      queryOptions.push(
        ` pack.title LIKE ${DB.connection.escape(`%` + options.pack + `%`)}`
      );
    if (options?.member)
      queryOptions.push(
        ` REPLACE(card.member, ' ', '') LIKE REPLACE(${DB.connection.escape(
          `%` + options.member + `%`
        )}, ' ', '')`
      );
    if (options?.minstars)
      queryOptions.push(
        ` user_card.stars>=${DB.connection.escape(options.minstars)}`
      );
    if (options?.maxstarsnoninclusive)
      queryOptions.push(
        ` user_card.stars<${DB.connection.escape(options.maxstarsnoninclusive)}`
      );
    if (options?.serial)
      queryOptions.push(
        ` user_card.serial_number=${DB.connection.escape(options.serial)}`
      );
    if (options?.stars)
      queryOptions.push(
        ` user_card.stars=${DB.connection.escape(options.stars)}`
      );
    if (options?.forsale === "true")
      queryOptions.push(` marketplace.price IS NOT NULL`);

    query +=
      (queryOptions.length > 0 ? " AND" : "") +
      queryOptions.join(" AND") +
      " ORDER BY user_card.is_favorite DESC, user_card.stars DESC, user_card.hearts DESC, user_card.id DESC" +
      (options?.limit ? ` LIMIT ${DB.connection.escape(options.limit)}` : ``) +
      (options?.page && options.limit
        ? ` OFFSET ${DB.connection.escape(
            (isNaN(<number>options.page) ? 1 : <number>options.page) *
              <number>options.limit -
              <number>options.limit
          )}`
        : ``);

    const cards = (await DB.query(query + ";")) as {
      "COUNT(*)": number;
    }[];

    return cards[0]["COUNT(*)"];
  }
  public static async getUserCardsByDiscordId(
    discord_id: string,
    options?: {
      [key: string]: string | number;
    }
  ): Promise<UserCard[]> {
    let query = `SELECT 
                    card.id AS card_id,
                    card.blurb,
                    card.member,
                    card.abbreviation,
                    card.rarity,
                    card.image_url,
                    card.pack_id,
                    card.serial_id,
                    user_card.id AS user_card_id,
                    user_card.serial_number,
                    user_card.owner_id,
                    user_card.stars,
                    user_card.hearts,
                    user_card.is_favorite,
                    pack.title,
                    pack.credit,
                    pack.image_data_id,
                    marketplace.price
                  FROM
                    card 
                  LEFT JOIN
                    user_card ON
                      card.id=user_card.card_id
                  LEFT JOIN
                    pack ON
                      card.pack_id=pack.id
                  LEFT JOIN
                    shop ON
                      shop.pack_id=pack.id
                  LEFT JOIN
                    marketplace ON
                      marketplace.card_id=user_card.id

                  WHERE user_card.owner_id=${DB.connection.escape(discord_id)}`;
    let queryOptions = [];

    if (options?.pack)
      queryOptions.push(
        ` pack.title LIKE ${DB.connection.escape(`%` + options.pack + `%`)}`
      );
    if (options?.member)
      queryOptions.push(
        ` REPLACE(card.member, ' ', '') LIKE REPLACE(${DB.connection.escape(
          `%` + options.member + `%`
        )}, ' ', '')`
      );
    if (options?.minstars)
      queryOptions.push(
        ` user_card.stars>=${DB.connection.escape(options.minstars)}`
      );
    if (options?.maxstarsnoninclusive)
      queryOptions.push(
        ` user_card.stars<${DB.connection.escape(options.maxstarsnoninclusive)}`
      );
    if (options?.serial)
      queryOptions.push(
        ` user_card.serial_number=${DB.connection.escape(options.serial)}`
      );
    if (options?.stars)
      queryOptions.push(
        ` user_card.stars=${DB.connection.escape(options.stars)}`
      );
    if (options?.forsale === "true")
      queryOptions.push(` marketplace.price IS NOT NULL`);

    query +=
      (queryOptions.length > 0 ? " AND" : "") +
      queryOptions.join(" AND") +
      " ORDER BY user_card.is_favorite DESC, user_card.stars DESC, user_card.hearts DESC, user_card.id DESC" +
      (options?.limit ? ` LIMIT ${DB.connection.escape(options.limit)}` : ``) +
      (options?.page && options.limit
        ? ` OFFSET ${DB.connection.escape(
            (isNaN(<number>options.page) ? 1 : <number>options.page) *
              <number>options.limit -
              <number>options.limit
          )}`
        : ``);

    const cards = (await DB.query(query + ";")) as {
      card_id: number;
      user_card_id: number;
      pack_id: number;
      blurb: string;
      member: string;
      abbreviation: string;
      rarity: number;
      image_url: string;
      id: number;
      serial_number: number;
      owner_id: string;
      stars: number;
      hearts: number;
      is_favorite: boolean;
      title: string;
      credit: string;
      serial_id: number;
      image_data_id: number;
    }[];

    return cards.map((c) => {
      return new UserCard(c);
    });
  }

  public static async getLastDailyByDiscordId(
    discord_id: string
  ): Promise<number> {
    let query = (await DB.query(
      `SELECT daily_last FROM user_profile WHERE discord_id=?;`,
      [discord_id]
    )) as { daily_last: number }[];
    return query[0].daily_last;
  }

  public static async getLastHeartSendByDiscordId(
    discord_id: string
  ): Promise<number> {
    let query = (await DB.query(
      `SELECT hearts_last FROM user_profile WHERE discord_id=?;`,
      [discord_id]
    )) as { hearts_last: number }[];
    return query[0].hearts_last;
  }
  public static async getLastHeartBoxByDiscordId(
    discord_id: string
  ): Promise<number> {
    let query = (await DB.query(
      `SELECT heart_box_last FROM user_profile WHERE discord_id=?;`,
      [discord_id]
    )) as { heart_box_last: number }[];
    return query[0].heart_box_last;
  }
  public static async getLastOrphanClaimByDiscordId(
    discord_id: string
  ): Promise<number> {
    let query = (await DB.query(
      `SELECT last_orphan FROM user_profile WHERE discord_id=?;`,
      [discord_id]
    )) as { last_orphan: number }[];
    return query[0].last_orphan;
  }

  public static async getBadgeByBadgeId(badge_id: number): Promise<Badge> {
    const query = (await DB.query(`SELECT * FROM badge WHERE badge.id=?;`, [
      badge_id,
    ])) as { id: number; title: string; blurb: string; emoji: string }[];
    return new Badge(query[0]);
  }

  public static async getBadgesByDiscordId(
    discord_id: string
  ): Promise<Badge[]> {
    let query = (await DB.query(
      `SELECT 
        badge.id,
        badge.title,
        badge.blurb,
        badge.emoji
      FROM
        badge
      LEFT JOIN
        user_badge
      ON 
        badge.id=user_badge.badge_id
      WHERE
        user_badge.discord_id=?;`,
      [discord_id]
    )) as { id: number; title: string; blurb: string; emoji: string }[];
    return query.map((b) => {
      return new Badge(b);
    });
  }
  public static async getLastMissionByDiscordId(
    discord_id: string
  ): Promise<number> {
    let query = (await DB.query(
      `SELECT mission_last FROM user_profile WHERE discord_id=?;`,
      [discord_id]
    )) as { mission_last: number }[];
    return query[0].mission_last;
  }

  public static async getCardCountByDiscordId(
    discord_id: string,
    options?: { [key: string]: string | number }
  ): Promise<number> {
    let query = `SELECT 
                  COUNT(*)
                FROM
                  card 
                LEFT JOIN
                  user_card ON
                    card.id=user_card.card_id
                LEFT JOIN
                  pack ON
                    card.pack_id=pack.id
                LEFT JOIN
                  shop ON
                    shop.pack_id=pack.id
                LEFT JOIN
                  marketplace ON
                    marketplace.card_id=user_card.id
                WHERE user_card.owner_id=${DB.connection.escape(discord_id)}`;

    let queryOptions = [];

    if (options?.pack)
      queryOptions.push(
        ` pack.title LIKE ${DB.connection.escape(`%` + options.pack + `%`)}`
      );
    if (options?.member)
      queryOptions.push(
        ` REPLACE(card.member, ' ', '') LIKE REPLACE(${DB.connection.escape(
          `%` + options.member + `%`
        )}, ' ', '')`
      );
    if (options?.minstars)
      queryOptions.push(
        ` user_card.stars>=${DB.connection.escape(options.minstars)}`
      );
    if (options?.serial)
      queryOptions.push(
        ` user_card.serial_number=${DB.connection.escape(options.serial)}`
      );
    if (options?.stars)
      queryOptions.push(
        ` user_card.stars=${DB.connection.escape(options.stars)}`
      );
    if (options?.forsale === "true")
      queryOptions.push(` marketplace.price IS NOT NULL`);

    query +=
      (queryOptions.length > 0 ? " AND" : "") + queryOptions.join(" AND");

    const count = (await DB.query(`${query};`)) as { "COUNT(*)": number }[];
    return count[0][`COUNT(*)`];
  }

  public static async getFishByDiscordId(discord_id: string): Promise<Fish[]> {
    const fishRaw = (await DB.query(`SELECT * FROM fish WHERE discord_id=?;`, [
      discord_id,
    ])) as {
      id: number;
      discord_id: string;
      fish_name: string;
      fish_weight: number;
      gender: "male" | "female" | "???";
    }[];
    return fishRaw.map((fishy) => {
      return new Fish(fishy);
    });
  }

  public static async checkReputation(
    sender_id: string,
    receiver_id: string
  ): Promise<boolean> {
    const query = (await DB.query(
      `SELECT * FROM reputation WHERE sender_id=? AND receiver_id=?;`,
      [sender_id, receiver_id]
    )) as { id: number; sender_id: number; receiver_id: number }[];
    return query[0] ? true : false;
  }

  public static async getReputation(discord_id: string): Promise<number> {
    const query = (await DB.query(
      `SELECT COUNT(*) FROM reputation WHERE receiver_id=?;`,
      [discord_id]
    )) as { "COUNT(*)": number }[];
    return query[0]["COUNT(*)"];
  }
}
