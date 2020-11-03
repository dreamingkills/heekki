import { DB } from "../../index";
import { Profile } from "../../../structures/player/Profile";
import { UserCard } from "../../../structures/player/UserCard";
import { DBClass } from "../../index";
import { Badge } from "../../../structures/player/Badge";
import * as error from "../../../structures/Error";
import { Fish } from "../../../structures/game/Fish";
import { PlayerService } from "../../service/PlayerService";
import { ProfileInterface } from "../../../structures/interface/ProfileInterface";
import { OptionsParser } from "../OptionsParser";
import { UserCardInterface } from "../../../structures/interface/UserCardInterface";
import { FishInterface } from "../../../structures/interface/FishInterface";
import { BadgeInterface } from "../../../structures/interface/BadgeInterface";

export class PlayerFetch extends DBClass {
  public static async checkIfUserExists(discord_id: string): Promise<boolean> {
    const query = (await DB.query(
      `SELECT * FROM user_profile WHERE discord_id=?;`,
      [this.cleanMention(discord_id)]
    )) as ProfileInterface[];
    return query[0] ? true : false;
  }

  public static async getProfileFromDiscordId(
    discord_id: string,
    autoGenerate: boolean
  ): Promise<Profile> {
    const user = (await DB.query(
      `SELECT user_profile.*, COUNT(reputation.receiver_id) AS reputation FROM user_profile LEFT JOIN reputation ON reputation.receiver_id=user_profile.discord_id WHERE discord_id=?;`,
      [discord_id]
    )) as ProfileInterface[];
    if (!user[0]?.discord_id && !autoGenerate) throw new error.NoProfileError();
    if (!user[0]?.discord_id) {
      const newProfile = await PlayerService.createNewProfile(discord_id);
      return newProfile;
    }
    return new Profile(user[0]);
  }

  public static async getUserCardsByDiscordId(
    discord_id: string,
    options: {
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
                    card.serial_limit,
                    card.image_data_id,
                    user_card.id AS user_card_id,
                    user_card.serial_number,
                    user_card.owner_id,
                    user_card.stars,
                    user_card.hearts,
                    user_card.is_favorite,
                    pack.title,
                    pack.credit,
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

    const queryOptions = await OptionsParser.parseOptions("INVENTORY", options);
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

    const cards = (await DB.query(query + ";")) as UserCardInterface[];
    return cards.map((c) => {
      return new UserCard(c);
    });
  }

  public static async getBadgeByBadgeId(badge_id: number): Promise<Badge> {
    const query = (await DB.query(`SELECT * FROM badge WHERE badge.id=?;`, [
      badge_id,
    ])) as BadgeInterface[];
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
    )) as BadgeInterface[];
    return query.map((b) => {
      return new Badge(b);
    });
  }

  public static async getCardCountByDiscordId(
    discord_id: string,
    options: { [key: string]: string | number }
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

    const queryOptions = await OptionsParser.parseOptions("INVENTORY", options);
    query +=
      (queryOptions.length > 0 ? " AND" : "") + queryOptions.join(" AND");

    const count = (await DB.query(`${query};`)) as { "COUNT(*)": number }[];
    return count[0][`COUNT(*)`];
  }

  public static async getFishByDiscordId(
    discord_id: string,
    trophy: boolean
  ): Promise<Fish[]> {
    const fishRaw = (await DB.query(
      `SELECT owner_id AS owner, fish.fish_weight AS weight, fish_name AS name, emoji, weight_mod.mod_name, weight_mod.multiplier, identifier, base_price, price_multiplier
       FROM fish LEFT JOIN fish_types ON fish_types.id=fish.fish_id LEFT JOIN weight_mod ON weight_mod.id=fish.weight_mod WHERE owner_id=? AND trophy_fish=?;`,
      [discord_id, trophy]
    )) as FishInterface[];
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

  public static async getRichestUsers(limit: number): Promise<Profile[]> {
    const query = (await DB.query(
      `SELECT * FROM user_profile ORDER BY coins DESC LIMIT ?;`,
      [limit]
    )) as ProfileInterface[];

    return query.map((p) => {
      return new Profile(p);
    });
  }

  public static async getMostHearts(limit: number): Promise<Profile[]> {
    const query = (await DB.query(
      `SELECT * FROM user_profile ORDER BY hearts DESC LIMIT ?;`,
      [limit]
    )) as ProfileInterface[];
    return query.map((p) => {
      return new Profile(p);
    });
  }

  public static async getTopCollectors(
    limit: number
  ): Promise<{ profile: Profile }[]> {
    const query = (await DB.query(
      `SELECT user_profile.*, COUNT(*) AS counted FROM user_card LEFT JOIN user_profile ON user_card.owner_id=user_profile.discord_id WHERE NOT owner_id=0 GROUP BY owner_id ORDER BY counted DESC, owner_id LIMIT ?;`,
      [limit]
    )) as ProfileInterface[];
    return query.map((p) => {
      return { profile: new Profile(p) };
    });
  }

  public static async getTopXp(limit: number): Promise<Profile[]> {
    const query = (await DB.query(
      `SELECT * FROM user_profile ORDER BY xp DESC LIMIT ?;`,
      [limit]
    )) as ProfileInterface[];
    return query.map((p) => {
      return new Profile(p);
    });
  }

  public static async getTopWellDonators(limit: number): Promise<Profile[]> {
    const query = (await DB.query(
      `SELECT * FROM user_profile ORDER BY well DESC LIMIT ?;`,
      [limit]
    )) as ProfileInterface[];
    return query.map((p) => new Profile(p));
  }

  /*
      Fishing
                */
  public static async getRandomFish(): Promise<{
    id: number;
    fish_name: string;
    fish_weight: number;
    emoji: string;
  }> {
    const query = (await DB.query(
      `SELECT * FROM fish_types WHERE base_chance>0 ORDER BY -LOG(1.0-RAND())/base_chance LIMIT 1;`
    )) as {
      id: number;
      fish_name: string;
      base_chance: number;
      fish_weight: number;
      emoji: string;
    }[];
    return query[0];
  }

  public static async getFishByUniqueId(id: string): Promise<Fish> {
    const query = (await DB.query(
      `SELECT owner_id AS owner, fish.fish_weight AS weight, fish_name AS name, emoji, weight_mod.mod_name, weight_mod.multiplier, identifier, price_multiplier, base_price
    FROM fish LEFT JOIN fish_types ON fish_types.id=fish.fish_id LEFT JOIN weight_mod ON weight_mod.id=fish.weight_mod WHERE identifier=?;`,
      [id]
    )) as FishInterface[];
    if (!query[0]) throw new error.InvalidFishError();
    return new Fish(query[0]);
  }

  public static async getRandomWeightMod(): Promise<{
    id: number;
    mod_name: string;
    multiplier: number;
  }> {
    const query = (await DB.query(
      `SELECT * FROM weight_mod WHERE base_chance>0 ORDER BY -LOG(1.0-RAND())/base_chance LIMIT 1;`
    )) as {
      id: number;
      mod_name: string;
      multiplier: number;
      base_chance: number;
    }[];
    return query[0];
  }

  public static async getNumberOfFishByProfile(
    discordId: string
  ): Promise<number> {
    const query = (await DB.query(
      `SELECT COUNT(*) AS count FROM fish WHERE owner_id=? AND trophy_fish=false;`,
      [discordId]
    )) as { count: number }[];
    return query[0].count;
  }

  public static async fetchSupporters(): Promise<
    { name: string; id: string }[]
  > {
    const query = (await DB.query(`SELECT * FROM supporter;`)) as {
      id: number;
      supporter_name: string;
      discord_id: string;
    }[];
    return query.map((s) => {
      return { name: s.supporter_name, id: s.discord_id };
    });
  }

  public static async getHeartsSent(discordId: string): Promise<number> {
    const query = (await DB.query(
      `SELECT COUNT(*) AS total FROM friend_heart WHERE sender_id=?;`,
      [discordId]
    )) as { total: number }[];
    return query[0]?.total;
  }

  public static async getLastCard(discordId: string): Promise<UserCard> {
    let query = (await DB.query(`SELECT 
                    card.id AS card_id,
                    card.blurb,
                    card.member,
                    card.abbreviation,
                    card.rarity,
                    card.image_url,
                    card.pack_id,
                    card.serial_id,
                    card.serial_limit,
                    card.image_data_id,
                    user_card.id AS user_card_id,
                    user_card.serial_number,
                    user_card.owner_id,
                    user_card.stars,
                    user_card.hearts,
                    user_card.is_favorite,
                    pack.title,
                    pack.credit,
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
                  WHERE user_card.owner_id=${DB.connection.escape(
                    discordId
                  )} ORDER BY user_card.id DESC;`)) as UserCardInterface[];
    if (!query[0]) throw new error.NoCardsError();
    return new UserCard(query[0]);
  }
}
