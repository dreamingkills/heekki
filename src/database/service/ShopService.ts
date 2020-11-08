import { ShopFetch } from "../sql/shop/ShopFetch";
import { ShopItem } from "../../structures/shop/ShopItem";
import { Pack } from "../../structures/card/Pack";

export class ShopService {
  public static async getNumberOfShopItems(
    active: boolean = true
  ): Promise<number> {
    return await ShopFetch.getNumberOfShopItems(active);
  }

  public static async getAvailablePacks(page: number = 1): Promise<ShopItem[]> {
    return await ShopFetch.getActiveShopItems(page);
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
