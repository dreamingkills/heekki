import { DB } from "../../index";
import { Profile } from "../../../structures/player/Profile";
import { UserCard } from "../../../structures/player/UserCard";
import { DBClass } from "../../index";

export class PlayerFetchSQL extends DBClass {
  public static async checkIfUserExists(discord_id: string): Promise<boolean> {
    let query = await DB.query(
      `SELECT * FROM user_profile WHERE discord_id=${this.clean(discord_id)}`
    );
    return query[0] ? true : false;
  }

  public static async getProfileFromDiscordId(
    discord_id: string
  ): Promise<Profile> {
    let user = await DB.query(
      `SELECT * FROM user_profile WHERE discord_id=${this.clean(discord_id)}`
    );
    return new Profile(user[0]);
  }

  public static async getUserCardsByDiscordId(
    discord_id: string
  ): Promise<UserCard[]> {
    let cards = await DB.query(
      `SELECT 
        card.blurb,
        card.member,
        card.credit,
        card.abbreviation,
        card.rarity,
        card.image_url,
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
      WHERE user_card.owner_id=${discord_id}`
    );
    let cardList: UserCard[] = [];
    let cardIterator = cards.forEach(
      (c: {
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
    console.log(cardList);
    return cardList;
  }
}
