import { DBClass, DB } from "../..";
import { UserCard } from "../../../structures/player/UserCard";
import * as error from "../../../structures/Error";
import { CardFetch } from "./CardFetch";
import { ImageData } from "../../../structures/card/ImageData";
import { OkPacket } from "mysql";

export class CardUpdate extends DBClass {
  public static async createNewUserCard(
    owner_id: string,
    card_id: number,
    stars: number,
    hearts: number
  ): Promise<{ card: UserCard; imageData: ImageData }> {
    let serialNumber = await DB.query(
      `SELECT * FROM serial_number WHERE id=?;`,
      [card_id]
    );
    if (!serialNumber[0]) throw new error.InvalidCardError();
    let insertQuery = await DB.query(
      `INSERT INTO user_card (serial_number, owner_id, stars, hearts, card_id) VALUES (?, ?, ?, ?, ?);`,
      [serialNumber[0].serial_number + 1, owner_id, stars, hearts, card_id]
    );
    let newUserCard = await CardFetch.getFullCardDataFromUserCard(
      insertQuery.insertId
    );
    await DB.query(
      `UPDATE serial_number SET serial_number=serial_number+1 WHERE id=?`,
      [serialNumber[0].id]
    );
    return newUserCard;
  }
  public static async addHeartsToCard(
    card: UserCard,
    amount: number
  ): Promise<OkPacket> {
    let query = await DB.query(
      `UPDATE user_card SET hearts=hearts+? WHERE id=?;`,
      [amount, card.userCardId]
    );
    return query;
  }

  public static async forfeitCard(card: UserCard): Promise<OkPacket> {
    let query = await DB.query(`UPDATE user_card SET owner_id=0 WHERE id=?;`, [
      card.userCardId,
    ]);
    return query;
  }

  /**
   * Changes the `owner_id` of a `user_card` to the value of `receiver`.
   * @param receiver Discord ID of the user who the card is being transferred to.
   * @param id `id` of the `user_card` which is being transferred.
   */
  public static async transferCardToUser(
    receiver: string,
    id: number
  ): Promise<UserCard> {
    let query = await DB.query(`UPDATE user_card SET owner_id=? WHERE id=?;`, [
      receiver,
      id,
    ]);
    let newCard = await CardFetch.getCardByUserCardId(id);
    return newCard.card;
  }
}
