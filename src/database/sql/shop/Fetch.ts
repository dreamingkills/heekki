import { DB } from "../../index";
import { UserCard } from "../../../structures/player/UserCard";
import { DBClass } from "../../index";
import * as error from "../../../structures/Error";
import { ShopItem } from "../../../structures/shop/Pack";

export class ShopFetchSQL extends DBClass {
  public static async findShopItemById(id: number) {
    let query = await DB.query(`SELECT * FROM shop WHERE id=?;`, [id]);
    if (!query[0]) throw new error.InvalidShopItemError();
    return new ShopItem(query[0]);
  }
  public static async findShopItemByName(name: string) {
    let query = await DB.query(`SELECT * FROM shop WHERE title=?;`, [name]);
    if (!query[0]) throw new error.InvalidShopItemError();
    return new ShopItem(query[0]);
  }
}
