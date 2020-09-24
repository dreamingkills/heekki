import { DBClass, DB } from "../..";
import { UserCard } from "../../../structures/player/UserCard";
import { CardFetch } from "./CardFetch";
import { Card } from "../../../structures/card/Card";
import { SerialGenerator } from "../../../helpers/Serial";

export class CardUpdate extends DBClass {
  public static async createNewUserCard(
    owner_id: string,
    card: Card,
    stars: number,
    hearts: number
  ): Promise<UserCard> {
    let newSerial = await SerialGenerator.queueSerialGen(card);
    let tries = 0;
    while (true) {
      try {
        await DB.query(
          `INSERT INTO user_card (serial_number, owner_id, stars, hearts, card_id) VALUES (?, ?, ?, ?, ?);`,
          [newSerial, owner_id, stars, hearts, card.id]
        );
        return await CardFetch.getUserCardByReference({
          identifier: card.abbreviation,
          serial: newSerial,
        });
      } catch (e) {
        if (++tries === 3) throw e;
        newSerial++;
      }
    }
  }

  public static async addHeartsToCard(
    card: UserCard,
    amount: number
  ): Promise<void> {
    await DB.query(`UPDATE user_card SET hearts=hearts+? WHERE id=?;`, [
      amount,
      card.userCardId,
    ]);
  }

  public static async forfeitCard(card: UserCard): Promise<void> {
    await DB.query(`UPDATE user_card SET owner_id=0 WHERE id=?;`, [
      card.userCardId,
    ]);
  }

  /**
   * Changes the `owner_id` of a `user_card` to the value of `receiver`.
   * @param receiver Discord ID of the user who the card is being transferred to.
   * @param id `id` of the `user_card` which is being transferred.
   */
  public static async transferCardToUser(
    receiver: string,
    card: UserCard
  ): Promise<void> {
    await DB.query(`UPDATE user_card SET owner_id=? WHERE id=?;`, [
      receiver,
      card.userCardId,
    ]);
  }

  public static async incrementCardStars(card_id: number): Promise<void> {
    await DB.query(`UPDATE user_card SET stars=stars+1 WHERE id=?;`, [card_id]);
  }

  public static async toggleCardAsFavorite(card_id: number): Promise<void> {
    await DB.query(
      `UPDATE user_card SET is_favorite=1-is_favorite WHERE id=${card_id};`
    );
  }
}
