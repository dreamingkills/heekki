import { DBClass, DB } from "../..";

export class MarketFetch extends DBClass {
  /**
   * SQL - Fetches an array of user_card IDs that are currently for sale in the marketplace.
   * @param options An Object of search options.
   */
  public static async fetchCardIdsInMarketplace(options?: {
    page?: number;
    priceMin?: number;
    priceMax?: number;
    starsMin?: number;
    starsMax?: number;
    serialMin?: number;
    serialMax?: number;
  }): Promise<[{ id: number; card_id: number; price: number }]> {
    let query = `SELECT * FROM marketplace`;
    let queryOptions: string[] = [];
    if (options?.priceMin || options?.priceMax) query += " WHERE";
    if (options?.priceMin)
      queryOptions.push(` price>${DB.connection.escape(options?.priceMin)}`);
    if (options?.priceMax)
      queryOptions.push(` price<${DB.connection.escape(options?.priceMax)}`);

    query += queryOptions.join(" AND") + " ORDER BY id DESC LIMIT ? OFFSET ?;";

    let forSale = await DB.query(query, [9, (options?.page || 1) * 9 - 9]);
    return forSale;
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
