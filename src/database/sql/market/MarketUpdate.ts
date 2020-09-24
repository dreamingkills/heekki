import { DBClass, DB } from "../..";

export class MarketUpdate extends DBClass {
  /**
   * SQL - Adds a card to the marketplace..
   * @param id The ID of the `user_card` being sold.
   * @param price The price of the `user_card` being sold.
   */
  public static async listCardOnMarketplace(
    id: number,
    price: number
  ): Promise<void> {
    await DB.query(`INSERT INTO marketplace (card_id, price) VALUES (?, ?);`, [
      id,
      price,
    ]);
  }

  public static async removeCardFromMarketplace(id: number): Promise<void> {
    await DB.query(`DELETE FROM marketplace WHERE card_id=?;`, [id]);
  }
}
