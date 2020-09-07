import { DB } from "../../index";
import { DBClass } from "../../index";
import * as error from "../../../structures/Error";
import { ShopItem } from "../../../structures/shop/Pack";
import { Card } from "../../../structures/card/Card";
import { stringify } from "querystring";
import { CardService } from "../../service/CardService";

export class ShopFetch extends DBClass {
  public static async findShopItemById(id: number): Promise<ShopItem> {
    let query = await DB.query(`SELECT * FROM shop WHERE id=?;`, [id]);
    if (!query[0]) throw new error.InvalidPackError();
    return new ShopItem(query[0]);
  }
  public static async findShopItemByName(name: string): Promise<ShopItem> {
    let query = await DB.query(`SELECT * FROM shop WHERE title=?;`, [name]);
    if (!query[0]) throw new error.InvalidPackError();
    return new ShopItem(query[0]);
  }
  public static async getAllShopItems(active?: boolean): Promise<ShopItem[]> {
    let query = await DB.query(`SELECT * FROM shop WHERE active=?`, [active]);
    return query.map(
      (i: {
        id: number;
        title: string;
        price: number;
        active: boolean;
        pack_id: number;
      }) => {
        return new ShopItem(i);
      }
    );
  }

  public static async getFullPackData(
    id: number
  ): Promise<{
    cover: string;
    name: string;
    credit: string;
    flavor: string;
    cards: Card[];
  }> {
    const cards = await CardService.getCardsByPackId(id);
    const pack = await DB.query(`SELECT * FROM pack WHERE id=?;`, [id]);
    return {
      cover: pack[0].cover_url,
      name: pack[0].title,
      credit: pack[0].credit,
      flavor: pack[0].flavor_text,
      cards,
    };
  }
}
