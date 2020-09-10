import { DB } from "../../index";
import { Profile } from "../../../structures/player/Profile";
import { UserCard } from "../../../structures/player/UserCard";
import { DBClass } from "../../index";
import { Badge } from "../../../structures/player/Badge";
import * as error from "../../../structures/Error";

export class PlayerFetch extends DBClass {
  public static async checkIfUserExists(discord_id: string): Promise<boolean> {
    let clean = this.cleanMention(discord_id);
    let query = await DB.query(
      `SELECT * FROM user_profile WHERE discord_id=?;`,
      [clean]
    );
    return query[0] ? true : false;
  }

  /**
   * Retrieves a user's data by their Discord ID.
   * @param discord_id Discord ID of a user.
   * @param p Perspective - `true` indicates 1P. `false` indicates 3P.
   */
  public static async getProfileFromDiscordId(
    discord_id: string
  ): Promise<Profile | undefined> {
    let clean = this.cleanMention(discord_id);
    let user = await DB.query(
      `SELECT * FROM user_profile WHERE discord_id=?;`,
      [clean]
    );
    return user[0] ? new Profile(user[0]) : undefined;
  }

  public static async getUserCardsByDiscordId(
    discord_id: string,
    options?: {
      [key: string]: string | number;
    }
  ): Promise<UserCard[]> {
    let query = `SELECT 
                    card.blurb,
                    card.member,
                    card.abbreviation,
                    card.rarity,
                    card.image_url,
                    user_card.id,
                    user_card.serial_number,
                    user_card.owner_id,
                    user_card.stars,
                    user_card.hearts,
                    user_card.is_favorite,
                    pack.title,
                    pack.credit,
                    pack.image_data_id
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
                  WHERE user_card.owner_id=${DB.connection.escape(discord_id)}`;
    let queryOptions = [];

    if (options?.pack)
      queryOptions.push(
        ` shop.title LIKE ${DB.connection.escape(`%` + options.pack + `%`)}`
      );
    if (options?.member)
      queryOptions.push(
        ` card.member LIKE ${DB.connection.escape(`%` + options.member + `%`)}`
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

    const cards = await DB.query(query + ";");
    let cardList = cards.map(
      (c: {
        id: number;
        blurb: string;
        member: string;
        credit: string;
        abbreviation: string;
        rarity: number;
        is_favorite: boolean;
        image_url: string;
        serial_number: number;
        owner_id: string;
        stars: number;
        hearts: number;
        title: string;
        image_data_id: number;
      }) => {
        return new UserCard(c);
      }
    );

    return cardList;
  }

  public static async getLastDailyByDiscordId(
    discord_id: string
  ): Promise<number> {
    let query = await DB.query(
      `SELECT daily_last FROM user_profile WHERE discord_id=?;`,
      [discord_id]
    );
    return query[0].daily_last;
  }

  public static async getLastHeartSendByDiscordId(
    discord_id: string
  ): Promise<number> {
    let query = await DB.query(
      `SELECT hearts_last FROM user_profile WHERE discord_id=?;`,
      [discord_id]
    );
    return query[0].hearts_last;
  }
  public static async getLastHeartBoxByDiscordId(
    discord_id: string
  ): Promise<number> {
    let query = await DB.query(
      `SELECT heart_box_last FROM user_profile WHERE discord_id=?;`,
      [discord_id]
    );
    return query[0].heart_box_last;
  }
  public static async getLastOrphanClaimByDiscordId(
    discord_id: string
  ): Promise<number> {
    let query = await DB.query(
      `SELECT last_orphan FROM user_profile WHERE discord_id=?;`,
      [discord_id]
    );
    return query[0].last_orphan;
  }
  public static async getBadgesByDiscordId(
    discord_id: string
  ): Promise<Badge[]> {
    let query = await DB.query(
      `SELECT 
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
    );
    let bruh = query.map(
      (b: { title: string; blurb: string; emoji: string }) => {
        return new Badge({ title: b.title, blurb: b.blurb, emoji: b.emoji });
      }
    );
    return query.map((b: { title: string; blurb: string; emoji: string }) => {
      return new Badge(b);
    });
  }
  public static async getLastMissionByDiscordId(
    discord_id: string
  ): Promise<number> {
    let query = await DB.query(
      `SELECT mission_last FROM user_profile WHERE discord_id=?;`,
      [discord_id]
    );
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
                WHERE user_card.owner_id=${DB.connection.escape(discord_id)}`;

    let queryOptions = [];

    if (options?.pack)
      queryOptions.push(
        ` shop.title LIKE ${DB.connection.escape(`%` + options.pack + `%`)}`
      );
    if (options?.member)
      queryOptions.push(
        ` card.member LIKE ${DB.connection.escape(`%` + options.member + `%`)}`
      );
    if (options?.minstars)
      queryOptions.push(
        ` user_card.stars>=${DB.connection.escape(options.minstars)}`
      );
    if (options?.serial)
      queryOptions.push(
        ` user_card.serial_number=${DB.connection.escape(options.serial)}`
      );

    query +=
      (queryOptions.length > 0 ? " AND" : "") + queryOptions.join(" AND");

    const count = await DB.query(`${query};`);
    return count[0][`COUNT(*)`];
  }
}
