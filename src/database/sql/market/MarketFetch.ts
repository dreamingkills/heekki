import { DBClass, DB } from "../..";
import { UserCard } from "../../../structures/player/UserCard";

export class MarketFetch extends DBClass {
  /**
   * SQL - Fetches an array of user_card IDs that are currently for sale in the marketplace.
   * @param options An Object of search options.
   */
  public static async fetchCardIdsInMarketplace(options?: {
    [key: string]: string | number;
  }): Promise<{ card: UserCard; price: number }[]> {
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
                  pack.image_data_id,
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
    let queryOptions: string[] = [];
    if (options?.minprice)
      queryOptions.push(
        ` marketplace.price>${DB.connection.escape(options?.minprice)}`
      );
    if (options?.maxprice)
      queryOptions.push(
        ` marketplace.price<${DB.connection.escape(options?.maxprice)}`
      );
    if (options?.pack)
      queryOptions.push(
        ` shop.title LIKE ${DB.connection.escape(`%` + options.pack + `%`)}`
      );
    if (options?.minstars)
      queryOptions.push(
        ` user_card.stars>=${DB.connection.escape(<number>options?.minstars)}`
      );
    if (options?.member)
      queryOptions.push(
        ` card.member LIKE ${DB.connection.escape(`%` + options.member + `%`)}`
      );

    query +=
      (queryOptions.length > 0 ? " WHERE" : "") +
      queryOptions.join(" AND") +
      ` ORDER BY marketplace.id DESC LIMIT 9 OFFSET ${
        (<number>options?.page || 1) * 9 - 9
      };`;

    let forSale = await DB.query(query);
    let cardList = forSale.map(
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
        price: number;
      }) => {
        return { card: new UserCard(c), price: c.price };
      }
    );
    return cardList;
  }

  /**
   * SQL - Fetches from marketplace where user_card ID == id.
   * @param id An ID of a user_card.
   */
  public static async fetchCardIsForSale(
    id: number
  ): Promise<{ forSale: boolean; price?: number }> {
    let query = await DB.query(`SELECT * FROM marketplace WHERE card_id=?`, [
      id,
    ]);
    return {
      forSale: query[0] ? true : false,
      price: query[0] ? query[0].price : undefined,
    };
  }
}
