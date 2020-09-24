import { ShopFetch } from "../sql/shop/ShopFetch";
import { ShopItem } from "../../structures/shop/ShopItem";
import { Pack } from "../../structures/card/Pack";

export class ShopService {
  public static async getAllShopItems(active?: boolean): Promise<ShopItem[]> {
    let items = await ShopFetch.getAllShopItems(active);
    return items;
  }

  public static async getPackByName(name: string): Promise<ShopItem> {
    return await ShopFetch.getPackByName(name);
  }

  public static async getPackById(id: number): Promise<Pack> {
    return await ShopFetch.getPackById(id);
  }

  public static async getPackByFuzzySearch(
    searchterm: string
  ): Promise<ShopItem> {
    return await ShopFetch.getPackByFuzzySearch(searchterm);
  }
}
