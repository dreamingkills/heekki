import { DB } from "../../index";
import { DBClass } from "../../index";
import * as error from "../../../structures/Error";
import { ShopItem } from "../../../structures/shop/ShopItem";
import { Pack } from "../../../structures/card/Pack";
import { ShopItemInterface } from "../../../structures/interface/ShopItemInterface";

export class ShopFetch extends DBClass {
  public static async getPackByFuzzySearch(name: string): Promise<ShopItem> {
    const query = (await DB.query(
      `SELECT shop.title AS keyword, price, active, pack.title, pack.credit, pack.id, pack.cover_url, pack.flavor_text FROM shop LEFT JOIN pack ON pack.id=shop.pack_id WHERE (pack.title LIKE ? OR shop.title LIKE ?);`,
      [`%${name}%`, `%${name}%`]
    )) as {
      id: number;
      keyword: string;
      price: number;
      active: boolean;
      title: string;
      credit: string;
      cover_url: string;
      flavor_text: string;
    }[];
    if (!query[0]) throw new error.InvalidPackError();
    return new ShopItem(query[0]);
  }

  public static async getPackByName(name: string): Promise<ShopItem> {
    const query = (await DB.query(
      `SELECT shop.title AS keyword, price, active, pack.title, pack.credit, pack.id, pack.cover_url, pack.flavor_text FROM shop LEFT JOIN pack ON pack.id=shop.pack_id WHERE shop.title=?;`,
      [name]
    )) as {
      id: number;
      keyword: string;
      price: number;
      active: boolean;
      title: string;
      credit: string;
      cover_url: string;
      flavor_text: string;
    }[];
    if (!query[0]) throw new error.InvalidPackError();
    return new ShopItem(query[0]);
  }

  public static async getPackById(id: number): Promise<Pack> {
    const query = (await DB.query(`SELECT * FROM pack WHERE id=?;`, [id])) as {
      id: number;
      title: string;
      credit: string;
      cover_url: string;
      flavor_text: string;
    }[];
    return new Pack(query[0]);
  }

  public static async getNumberOfShopItems(active: boolean): Promise<number> {
    const query = (await DB.query(
      `SELECT COUNT(*) as count FROM shop WHERE active=?;`,
      [active]
    )) as { count: number }[];
    return query[0].count;
  }

  public static async getActiveShopItems(page: number): Promise<ShopItem[]> {
    const query = (await DB.query(
      `SELECT 
        shop.title AS keyword,
        price,
        active,
        pack.title,
        pack.credit,
        pack.id,
        pack.cover_url,
        pack.flavor_text
      FROM shop
      LEFT JOIN pack
      ON pack.id=shop.pack_id
      WHERE active=1
      ORDER BY shop.id DESC
      LIMIT 6
      OFFSET ?;`,
      [6 * page - 6]
    )) as ShopItemInterface[];
    return query.map((item) => new ShopItem(item));
  }

  public static async getAllShopItems(active?: boolean): Promise<ShopItem[]> {
    const query = (await DB.query(
      `SELECT shop.title AS keyword, price, active, pack.title, pack.credit, pack.id, pack.cover_url, pack.flavor_text FROM shop LEFT JOIN pack ON pack.id=shop.pack_id WHERE active=? ORDER BY shop.id DESC`,
      [active]
    )) as {
      id: number;
      keyword: string;
      price: number;
      active: boolean;
      title: string;
      credit: string;
      cover_url: string;
      flavor_text: string;
    }[];
    return query.map((i) => {
      return new ShopItem(i);
    });
  }
}
