import { DB } from "../../index";
import { Profile } from "../../../structures/player/Profile";
import { UserCard } from "../../../structures/player/UserCard";
import { DBClass } from "../../index";
import { Badge } from "../../../structures/player/Badge";
import * as error from "../../../structures/Error";

export class PlayerFetchSQL extends DBClass {
  public static async checkIfUserExists(discord_id: string): Promise<boolean> {
    let query = await DB.query(
      `SELECT * FROM user_profile WHERE discord_id=${this.clean(discord_id)}`
    );
    return query[0] ? true : false;
  }

  public static async getProfileFromDiscordId(
    discord_id: string,
    p: boolean
  ): Promise<Profile> {
    let user = await DB.query(
      `SELECT * FROM user_profile WHERE discord_id=${this.clean(discord_id)}`
    );
    if (!user[0]) {
      if (!p) throw new error.NoProfileOtherError();
      throw new error.NoProfileError();
    }
    let badges = await this.getBadgesByDiscordId(discord_id);
    return new Profile(user[0], badges);
  }

  public static async getUserCardsByDiscordId(
    discord_id: string,
    stars?: number
  ): Promise<UserCard[]> {
    let cards = await DB.query(
      `SELECT 
        card.blurb,
        card.member,
        card.credit,
        card.abbreviation,
        card.rarity,
        card.image_url,
        user_card.id,
        user_card.serial_number,
        user_card.owner_id,
        user_card.stars,
        user_card.hearts,
        pack.title,
        pack.image_data_id
      FROM
        card 
      LEFT JOIN
        user_card ON
          card.id=user_card.card_id
      LEFT JOIN
        pack ON
          card.pack_id=pack.id
      WHERE user_card.owner_id=?
      AND user_card.stars<?
      ORDER BY user_card.stars DESC;`,
      [discord_id, stars || 7]
    );
    let cardList: UserCard[] = [];
    let cardIterator = cards.forEach(
      (c: {
        id: number;
        blurb: string;
        member: string;
        credit: string;
        abbreviation: string;
        rarity: number;
        image_url: string;
        serial_number: number;
        owner_id: string;
        stars: number;
        hearts: number;
        title: string;
        image_data_id: number;
      }) => {
        cardList.push(new UserCard(c));
      }
    );
    return cardList;
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
}
