import { DBClass, DB } from "../..";
import { UserCard } from "../../../structures/player/UserCard";
import { CardFetch } from "./CardFetch";
import { Card } from "../../../structures/card/Card";
import { SerialGenerator } from "../../../helpers/Serial";
import { Profile } from "../../../structures/player/Profile";
import { PlayerService } from "../../service/PlayerService";

export class CardUpdate extends DBClass {
  public static async createNewUserCard(
    owner: Profile,
    card: Card,
    stars: number,
    hearts: number,
    force: boolean,
    price: number
  ): Promise<UserCard> {
    let newSerial = await SerialGenerator.queueSerialGen(card, force);
    let tries = 0;
    while (true) {
      try {
        await DB.query(
          `INSERT INTO user_card (serial_number, owner_id, stars, hearts, card_id) VALUES (?, ?, ?, ?, ?);`,
          [newSerial, owner.discord_id, stars, hearts, card.id]
        );
        await PlayerService.removeCoinsFromProfile(owner, price);

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
    return;
  }

  public static async removeHeartsFromCard(
    card: UserCard,
    amount: number
  ): Promise<void> {
    await DB.query(`UPDATE user_card SET hearts=hearts-? WHERE id=?;`, [
      amount,
      card.userCardId,
    ]);
    return;
  }

  public static async forfeitCard(card: UserCard): Promise<void> {
    await DB.query(`UPDATE user_card SET owner_id=0 WHERE id=?;`, [
      card.userCardId,
    ]);
    return;
  }

  /**
   * Changes the `owner_id` of a `user_card` to the value of `receiver`.
   * @param receiver Discord ID of the user who the card is being transferred to.
   * @param id `id` of the `user_card` which is being transferred.
   */
  public static async transferCardsToUser(
    receiver: string,
    cards: UserCard[]
  ): Promise<void> {
    await DB.query(`UPDATE user_card SET owner_id=? WHERE id IN (?);`, [
      receiver,
      cards.map((c) => {
        return c.userCardId;
      }),
    ]);
    return;
  }

  public static async incrementCardStars(card: UserCard): Promise<void> {
    await DB.query(`UPDATE user_card SET stars=stars+1 WHERE id=?;`, [
      card.userCardId,
    ]);
    return;
  }

  public static async toggleCardAsFavorite(card_id: number): Promise<void> {
    await DB.query(
      `UPDATE user_card SET is_favorite=1-is_favorite WHERE id=${card_id};`
    );
    return;
  }
}
