import { DBClass, DB } from "../..";
import { UserCard } from "../../../structures/player/UserCard";
import { ImageData } from "../../../structures/card/ImageData";
import * as error from "../../../structures/Error";
import { Pack } from "../../../structures/card/Pack";
import { ShopItem } from "../../../structures/shop/ShopItem";
import { Card } from "../../../structures/card/Card";
import { UserCardInterface } from "../../../structures/interface/UserCardInterface";
import { ImageDataInterface } from "../../../structures/interface/image/ImageDataInterface";
import { TextInterface } from "../../../structures/interface/image/TextInterface";

interface Reference {
  identifier: string;
  serial: number;
}

export class CardFetch extends DBClass {
  public static async getRandomCard(): Promise<Card> {
    const query = (await DB.query(
      `SELECT 
        id AS card_id,
        blurb,
        member,
        abbreviation,
        rarity,
        image_url,
        pack_id,
        serial_total,
        serial_limit,
        image_data_id
      FROM card WHERE rarity>0 ORDER BY -LOG(1.0-RAND())/rarity LIMIT 1;`
    )) as UserCardInterface[];
    return new Card(query[0]);
  }

  public static async getPackDataFromCard(card: UserCard): Promise<Pack> {
    const query = (await DB.query(`SELECT * FROM pack WHERE id=?;`, [
      card.packId,
    ])) as {
      id: number;
      title: string;
      image_data_id: number;
      credit: string;
      cover_url: string;
      flavor_text: string;
    }[];
    return new Pack(query[0]);
  }

  public static async getImageDataFromCard(card: UserCard): Promise<ImageData> {
    let id;
    if (typeof card === "number") {
      id = card;
    } else id = card.imageDataId;

    let imageDataQuery = (await DB.query(
      `SELECT * FROM image_data WHERE id=?;`,
      [id]
    )) as ImageDataInterface[];

    if (!imageDataQuery[0]) throw new error.InvalidImageDataError();
    let serialText = (await DB.query(`SELECT * FROM serial_text WHERE id=?;`, [
      imageDataQuery[0].serial_text_id,
    ])) as TextInterface[];
    let levelNum = (await DB.query(`SELECT * FROM level_num WHERE id=?;`, [
      imageDataQuery[0].level_num_id,
    ])) as TextInterface[];
    let heartText = (await DB.query(`SELECT * FROM heart_text WHERE id=?;`, [
      imageDataQuery[0].heart_text_id,
    ])) as TextInterface[];

    return new ImageData(
      imageDataQuery[0],
      serialText[0],
      levelNum[0],
      heartText[0]
    );
  }

  public static async getCardsByPack(pack: Pack | ShopItem): Promise<Card[]> {
    let query = (await DB.query(
      `SELECT 
        id AS card_id,
        blurb,
        member,
        abbreviation,
        rarity,
        image_url,
        pack_id,
        serial_total,
        serial_limit,
        image_data_id
      FROM card WHERE pack_id=?;`,
      [pack.id]
    )) as UserCardInterface[];
    return query.map((c) => {
      return new Card(c);
    });
  }

  /*
      UserCard
                */
  public static async getUserCardByReference(
    reference: Reference
  ): Promise<UserCard> {
    const query = (await DB.query(
      `SELECT 
        card.id AS card_id,
        card.blurb,
        card.member,
        card.abbreviation,
        card.rarity,
        card.image_url,
        card.pack_id,
        card.serial_total,
        card.serial_limit,
        card.image_data_id,
        user_card.id AS user_card_id,
        user_card.serial_number,
        user_card.owner_id,
        user_card.stars,
        user_card.hearts,
        user_card.is_favorite
      FROM card LEFT JOIN user_card ON user_card.serial_number=? WHERE card.abbreviation=? AND user_card.card_id=card.id;`,
      [reference.serial, reference.identifier]
    )) as UserCardInterface[];
    if (!query[0]) throw new error.InvalidUserCardError(reference);
    return new UserCard(query[0]);
  }

  public static async getUserCardById(id: number): Promise<UserCard> {
    const query = (await DB.query(
      `SELECT 
        card.id AS card_id,
        card.blurb,
        card.member,
        card.abbreviation,
        card.rarity,
        card.image_url,
        card.pack_id,
        card.serial_total,
        card.serial_limit,
        card.image_data_id,
        user_card.id AS user_card_id,
        user_card.serial_number,
        user_card.owner_id,
        user_card.stars,
        user_card.hearts,
        user_card.is_favorite
      FROM user_card LEFT JOIN card ON user_card.card_id=card.id WHERE user_card.id=?;`,
      [id]
    )) as UserCardInterface[];
    if (!query[0]) throw new error.InvalidUserCardError();
    return new UserCard(query[0]);
  }
}
