import { DBClass, DB } from "../..";
import { UserCard } from "../../../structures/player/UserCard";
import * as error from "../../../structures/Error";
import { CardFetchSQL as Fetch, CardFetchSQL } from "./Fetch";
import { ImageData } from "../../../structures/card/ImageData";
import { OkPacket } from "mysql";

export class CardModifySQL extends DBClass {
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
    let newUserCard = await Fetch.getFullCardDataFromUserCard(
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
    console.log(card.userCardId);
    let query = await DB.query(
      `UPDATE user_card SET hearts=hearts+? WHERE id=?;`,
      [amount, card.userCardId]
    );
    return query;
  }
}
