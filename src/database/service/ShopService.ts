import * as error from "../../structures/Error";
import { ShopFetch } from "../sql/shop/ShopFetch";
import Chance from "chance";
import { UserCard } from "../../structures/player/UserCard";
import { ImageData } from "../../structures/card/ImageData";
import { PlayerService } from "./PlayerService";
import { CardService } from "./CardService";
import { UserCardService } from "./UserCardService";

export class ShopService {
  public static async rollPack(
    packName: string,
    discordId: string
  ): Promise<{ userCard: UserCard; imageData: ImageData }> {
    let user = await PlayerService.getProfileByDiscordId(discordId, false);
    let shopItem = await ShopFetch.findShopItemByName(packName);

    if (shopItem.price > user.coins) throw new error.NotEnoughCoinsError();

    let cardList = await CardService.getCardsByPackId(shopItem.id);

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
      [50, 30, 20, 11.5, 3.8, 1.11]
    );

    let newCard = await UserCardService.createNewUserCard(
      user.discord_id,
      randomCard.id,
      starCount,
      0
    );
    await PlayerService.removeCoinsFromUserByDiscordId(
      user.discord_id,
      shopItem.price
    );

    return { userCard: newCard.userCard, imageData: newCard.imageData };
  }
  public static async getAllShopItems(active?: boolean) {
    let items = await ShopFetch.getAllShopItems(active);
    return items;
  }
}
