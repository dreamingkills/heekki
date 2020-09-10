import * as error from "../../structures/Error";
import { ShopFetch } from "../sql/shop/ShopFetch";
import Chance from "chance";
import { UserCard } from "../../structures/player/UserCard";
import { ImageData } from "../../structures/card/ImageData";
import { PlayerService } from "./PlayerService";
import { CardService } from "./CardService";
import { UserCardService } from "./UserCardService";
import { ShopItem } from "../../structures/shop/Pack";
import { Card } from "../../structures/card/Card";

export class ShopService {
  public static async rollPack(
    packName: string,
    discordId: string
  ): Promise<{ userCard: UserCard; imageData: ImageData }> {
    let user = await PlayerService.getProfileByDiscordId(discordId, false);
    let shopItem = await ShopFetch.findShopItemByName(packName);

    if (shopItem.price > user.coins) throw new error.NotEnoughCoinsError();
    if (!shopItem.active) throw new error.ExpiredPackError();

    let cardList = await CardService.getCardsByPackId(shopItem.packId);

    let chance = new Chance();
    let chances = [];
    for (let card of cardList) {
      let adjustedRarity =
        card.rarity > 3 ? card.rarity * 3.36 : card.rarity * 0.16;
      chances.push(adjustedRarity);
    }

    let randomCard = chance.weighted(cardList, chances);
    let starCount = chance.weighted(
      [1, 2, 3, 4, 5, 6],
      [52.3, 31.7, 22.7, 11.9, 3.4, 0.72]
    );

    let newCard = await UserCardService.createNewUserCard(
      user.discord_id,
      randomCard,
      starCount,
      0
    );
    await PlayerService.removeCoinsFromUserByDiscordId(
      user.discord_id,
      shopItem.price
    );

    return { userCard: newCard.userCard, imageData: newCard.imageData };
  }

  public static async getAllShopItems(active?: boolean): Promise<ShopItem[]> {
    let items = await ShopFetch.getAllShopItems(active);
    return items;
  }

  public static async getFullPackData(
    name: string
  ): Promise<{
    cover: string;
    name: string;
    credit: string;
    flavor: string;
    cards: Card[];
  }> {
    const shopItem = await ShopFetch.findShopItemByName(name);

    return await ShopFetch.getFullPackData(shopItem.packId);
  }
}
