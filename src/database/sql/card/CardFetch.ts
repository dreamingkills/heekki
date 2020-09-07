import { DBClass, DB } from "../..";
import { UserCard } from "../../../structures/player/UserCard";
import { ImageData } from "../../../structures/card/ImageData";
import * as error from "../../../structures/Error";
import { Card } from "../../../structures/card/Card";

export class CardFetch extends DBClass {
  public static async getCardByUserCardId(
    id: number
  ): Promise<{ userCard: UserCard; imageData: ImageData }> {
    let card = await this.getFullCardDataFromUserCard(id);
    return card;
  }
  public static async getCardsByPackId(id: number): Promise<Card[]> {
    let query = await DB.query(`SELECT * FROM card WHERE pack_id=?;`, [id]);
    let cardIdList: Card[] = [];
    query.forEach(
      (c: {
        id: number;
        blurb: string;
        member: string;
        abbreviation: string;
        rarity: number;
        image_url: string;
        pack_id: number;
        serial_id: number;
      }) => cardIdList.push(new Card(c))
    );
    return cardIdList;
  }

  public static async getFullCardDataFromUserCard(
    id: number
  ): Promise<{ userCard: UserCard; imageData: ImageData }> {
    let query = await DB.query(
      `SELECT
        card.id,
        card.blurb,
        card.member,
        card.abbreviation,
        card.rarity,
        card.image_url,
        user_card.serial_number,
        user_card.owner_id,
        user_card.stars,
        user_card.hearts,
        user_card.is_favorite,
        pack.title,
        pack.credit,
        pack.image_data_id
      FROM
        card
      LEFT JOIN
        user_card ON
            card.id=user_card.card_id
      LEFT JOIN
        pack ON
            card.pack_id=pack.id
      WHERE
        user_card.id=?`,
      [id]
    );
    if (!query[0]) throw new error.InvalidUserCardError();
    let imageData = await this.getImageDataFromCardId(query[0].image_data_id);
    return { userCard: new UserCard(query[0]), imageData };
  }

  public static async getFullCardDataFromReference(reference: {
    abbreviation: string;
    serial: number;
  }): Promise<{ userCard: UserCard; imageData: ImageData }> {
    let query = await DB.query(
      `SELECT
        card.id,
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
        pack.image_data_id
      FROM
        card
      LEFT JOIN
        user_card ON
          card.id=user_card.card_id
      LEFT JOIN
        pack ON
          card.pack_id=pack.id
      WHERE
        card.abbreviation=?
      AND
        user_card.serial_number=?`,
      [reference.abbreviation, reference.serial]
    );
    if (!query[0]) throw new error.InvalidUserCardError();

    let imageData = await this.getImageDataFromCardId(query[0].image_data_id);
    return { userCard: new UserCard(query[0]), imageData };
  }

  public static async getImageDataFromCardId(id: number): Promise<ImageData> {
    let imageDataQuery = await DB.query(
      `SELECT * FROM image_data WHERE id=${id};`
    );
    if (!imageDataQuery[0]) throw new error.InvalidImageDataError();
    let packText = await DB.query(`SELECT * FROM pack_text WHERE id=?;`, [
      imageDataQuery[0].pack_text_id,
    ]);
    let memberText = await DB.query(`SELECT * FROM member_text WHERE id=?;`, [
      imageDataQuery[0].member_text_id,
    ]);
    let serialText = await DB.query(`SELECT * FROM serial_text WHERE id=?;`, [
      imageDataQuery[0].serial_text_id,
    ]);
    let levelText = await DB.query(`SELECT * FROM level_text WHERE id=?;`, [
      imageDataQuery[0].level_text_id,
    ]);
    let levelNum = await DB.query(`SELECT * FROM level_num WHERE id=?;`, [
      imageDataQuery[0].level_num_id,
    ]);
    let heartText = await DB.query(`SELECT * FROM heart_text WHERE id=?`, [
      imageDataQuery[0].heart_text_id,
    ]);
    let imageData = new ImageData(
      imageDataQuery[0],
      packText[0],
      memberText[0],
      serialText[0],
      levelText[0],
      levelNum[0],
      heartText[0]
    );
    return imageData;
  }
}
