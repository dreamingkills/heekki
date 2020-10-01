import { DBClass, DB } from "../..";
import { UserCard } from "../../../structures/player/UserCard";
import { ImageData } from "../../../structures/card/ImageData";
import * as error from "../../../structures/Error";
import { Card } from "../../../structures/card/Card";
import { Pack } from "../../../structures/card/Pack";
import { ShopItem } from "../../../structures/shop/ShopItem";

interface Reference {
  identifier: string;
  serial: number;
}

export class CardFetch extends DBClass {
  public static async getRandomCard(): Promise<Card> {
    const query = (await DB.query(
      `SELECT card.* FROM card ORDER BY RAND() LIMIT 1;`
    )) as {
      id: number;
      blurb: string;
      member: string;
      abbreviation: string;
      rarity: number;
      image_url: string;
      pack_id: number;
      serial_id: number;
      serial_limit: number;
    }[];
    return new Card(query[0]);
  }

  public static async getCardDataByCardId(card_id: number): Promise<Card> {
    const query = (await DB.query(`SELECT * FROM card WHERE card_id=?;`, [
      card_id,
    ])) as Card;
    return query;
  }

  public static async getPackDataFromCard(card: Card): Promise<Pack> {
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

  public static async getImageDataFromPack(
    pack: Pack | ShopItem | number
  ): Promise<ImageData> {
    let id;
    if (typeof pack === "number") {
      id = pack;
    } else id = pack.imageDataId;

    let imageDataQuery = (await DB.query(
      `SELECT * FROM image_data WHERE id=?;`,
      [id]
    )) as {
      id: number;
      star_image_url: string;
      star_starting_x: number;
      star_starting_y: number;
      star_height: number;
      star_length: number;
      star_x_inc: number;
      star_y_inc: number;
      serial_text_id: number;
      level_num_id: number;
      heart_text_id: number;
    }[];

    if (!imageDataQuery[0]) throw new error.InvalidImageDataError();
    let serialText = (await DB.query(`SELECT * FROM serial_text WHERE id=?;`, [
      imageDataQuery[0].serial_text_id,
    ])) as {
      id: number;
      font: string;
      size: number;
      color: string;
      align: "left" | "right" | "center";
      x: number;
      y: number;
    }[];
    let levelNum = (await DB.query(`SELECT * FROM level_num WHERE id=?;`, [
      imageDataQuery[0].level_num_id,
    ])) as {
      id: number;
      font: string;
      size: number;
      color: string;
      align: "left" | "right" | "center";
      x: number;
      y: number;
    }[];
    let heartText = (await DB.query(`SELECT * FROM heart_text WHERE id=?;`, [
      imageDataQuery[0].heart_text_id,
    ])) as {
      id: number;
      font: string;
      size: number;
      color: string;
      align: "left" | "right" | "center";
      x: number;
      y: number;
    }[];

    return new ImageData(
      imageDataQuery[0],
      serialText[0],
      levelNum[0],
      heartText[0]
    );
  }

  public static async getCardsByPack(pack: Pack | ShopItem): Promise<Card[]> {
    let query = (await DB.query(`SELECT * FROM card WHERE pack_id=?;`, [
      pack.id,
    ])) as {
      id: number;
      blurb: string;
      member: string;
      abbreviation: string;
      rarity: number;
      image_url: string;
      pack_id: number;
      serial_id: number;
      serial_limit: number;
    }[];
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
        card.serial_id,
        card.serial_limit,
        user_card.id AS user_card_id,
        user_card.serial_number,
        user_card.owner_id,
        user_card.stars,
        user_card.hearts,
        user_card.is_favorite
      FROM card LEFT JOIN user_card ON user_card.serial_number=? WHERE card.abbreviation=? AND user_card.card_id=card.id;`,
      [reference.serial, reference.identifier]
    )) as {
      card_id: number;
      blurb: string;
      member: string;
      abbreviation: string;
      rarity: number;
      image_url: string;
      pack_id: number;
      serial_id: number;
      serial_limit: number;
      user_card_id: number;
      serial_number: number;
      owner_id: string;
      stars: number;
      hearts: number;
      is_favorite: boolean;
    }[];
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
        card.serial_id,
        card.serial_limit,
        user_card.id AS user_card_id,
        user_card.serial_number,
        user_card.owner_id,
        user_card.stars,
        user_card.hearts,
        user_card.is_favorite
      FROM user_card LEFT JOIN card ON user_card.card_id=card.id WHERE user_card.id=?;`,
      [id]
    )) as {
      card_id: number;
      blurb: string;
      member: string;
      abbreviation: string;
      rarity: number;
      image_url: string;
      pack_id: number;
      serial_id: number;
      serial_limit: number;
      user_card_id: number;
      serial_number: number;
      owner_id: string;
      stars: number;
      hearts: number;
      is_favorite: boolean;
    }[];
    if (!query[0])
      throw new error.InvalidUserCardError({
        identifier: "ERROR",
        serial: 0,
      });
    return new UserCard(query[0]);
  }
}
