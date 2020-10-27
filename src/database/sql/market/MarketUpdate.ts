import { DBClass, DB } from "../..";

export class MarketUpdate extends DBClass {
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
