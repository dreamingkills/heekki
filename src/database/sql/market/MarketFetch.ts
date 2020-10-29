import { DBClass, DB } from "../..";
import { UserCardInterface } from "../../../structures/interface/UserCardInterface";
import { UserCard } from "../../../structures/player/UserCard";
import { OptionsParser } from "../OptionsParser";

export class MarketFetch extends DBClass {
  public static async fetchCardIdsInMarketplace(options: {
    [key: string]: string | number;
  }): Promise<{ card: UserCard; price: number }[]> {
    let query = `SELECT 
                  card.id AS card_id,
                  card.blurb,
                  card.member,
                  card.abbreviation,
                  card.rarity,
                  card.image_url,
                  card.serial_id,
                  card.pack_id,
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
                  marketplace
                LEFT JOIN
                  user_card ON marketplace.card_id=user_card.id
                LEFT JOIN 
                  card ON user_card.card_id=card.id
                LEFT JOIN
                  pack ON pack.id=card.pack_id
                LEFT JOIN
                  shop ON shop.pack_id=pack.id`;
    const queryOptions = await OptionsParser.parseOptions(
      "MARKETPLACE",
      options
    );

    query +=
      (queryOptions.length > 0 ? " WHERE" : "") +
      queryOptions.join(" AND") +
      ` ORDER BY marketplace.id DESC LIMIT 9 OFFSET ${
        (<number>options?.page || 1) * 9 - 9
      };`;

    let forSale = (await DB.query(query)) as UserCardInterface[];
    return forSale.map((c) => {
      return { card: new UserCard(c), price: c.price! };
    });
  }

  public static async fetchMarketplaceCardCount(options: {
    [key: string]: string | number;
  }): Promise<number> {
    let query = `SELECT 
                  COUNT(*)
                FROM
                  marketplace
                LEFT JOIN
                  user_card ON marketplace.card_id=user_card.id
                LEFT JOIN
                  card ON user_card.card_id=card.id
                LEFT JOIN
                  pack ON card.pack_id=pack.id
                LEFT JOIN
                  shop ON shop.pack_id=pack.id`;
    const queryOptions = await OptionsParser.parseOptions(
      "MARKETPLACE",
      options
    );

    query +=
      (queryOptions.length > 0 ? " WHERE" : "") +
      queryOptions.join(" AND") +
      `;`;

    let forSale = (await DB.query(query)) as {
      "COUNT(*)": number;
    }[];
    return forSale[0]["COUNT(*)"];
  }

  public static async fetchCardIsForSale(
    id: number
  ): Promise<{ forSale: boolean; price: number }> {
    let query = (await DB.query(`SELECT * FROM marketplace WHERE card_id=?`, [
      id,
    ])) as { id: number; card_id: number; price: number }[];
    return {
      forSale: query[0] ? true : false,
      price: query[0] ? query[0].price : -1,
    };
  }
}
