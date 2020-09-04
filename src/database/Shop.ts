import * as error from "../structures/Error";
import { PlayerFetchSQL as PlayerFetch } from "./sql/player/Fetch";
import { PlayerModifySQL as PlayerModify } from "./sql/player/Modify";
import { ShopFetchSQL as ShopFetch } from "./sql/shop/Fetch";
import { CardFetchSQL as CardFetch } from "./sql/card/Fetch";
import { CardModifySQL as CardModify } from "./sql/card/Modify";

import Chance from "chance";
import { UserCard } from "../structures/player/UserCard";
import { ImageData } from "../structures/card/ImageData";

export class ShopService {
  public static async rollPack(
    packName: string,
    discordId: string
  ): Promise<{ userCard: UserCard; imageData: ImageData }> {
    let user = await PlayerFetch.getProfileFromDiscordId(discordId, false);
    let shopItem = await ShopFetch.findShopItemByName(packName);

    if (shopItem.price > user.coins) throw new error.NotEnoughCoinsError();

    let cardList = await CardFetch.getCardsByPackId(shopItem.id);

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
      [70, 45, 30, 8, 3, 0.15]
    );

    let newCard = await CardModify.createNewUserCard(
      user.discord_id,
      randomCard.id,
      starCount,
      0
    );
    await PlayerModify.removeCoins(user.discord_id, shopItem.price);

    return { userCard: newCard.card, imageData: newCard.imageData };
  }
  public static async getAllShopItems(active?: boolean) {
    let items = await ShopFetch.getAllShopItems(active);
    return items;
  }
}
