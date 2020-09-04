import { DB } from "../../index";
import { UserCard } from "../../../structures/player/UserCard";
import { DBClass } from "../../index";
import * as error from "../../../structures/Error";
import { ShopItem } from "../../../structures/shop/Pack";

export class ShopFetchSQL extends DBClass {
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
}
