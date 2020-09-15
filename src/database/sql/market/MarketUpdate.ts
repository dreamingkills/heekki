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
  ): Promise<{ id: number; card_id: number; price: number }> {
    let query = await DB.query(
      `INSERT INTO marketplace (card_id, price) VALUES (?, ?);`,
      [id, price]
    );
    return { id, card_id: query.insertId, price };
  }

  public static async removeCardFromMarketplace(id: number): Promise<boolean> {
    let query = await DB.query(`DELETE FROM marketplace WHERE card_id=?;`, [
      id,
    ]);
    return true;
  }

  public static async completeTransaction(
    buyer_id: string,
    seller_id: string
  ): Promise<void> {
    await DB.query(
      `INSERT INTO transaction (buyer_id, seller_id) VALUES (?, ?);`,
      [buyer_id, seller_id]
    );
  }
}
