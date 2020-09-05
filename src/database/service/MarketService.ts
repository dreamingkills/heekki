import { MarketFetch } from "../sql/market/MarketFetch";
import { UserCardService } from "./UserCardService";
import { UserCard } from "../../structures/player/UserCard";
import { CardService } from "../Card";
import * as error from "../../structures/Error";
import { PlayerService } from "../Player";
import { CardModify } from "../sql/card/CardModify";
import { MarketUpdate } from "../sql/market/MarketUpdate";
import { PlayerFetchSQL } from "../sql/player/Fetch";
import { PlayerModifySQL } from "../sql/player/Modify";
import { Profile } from "../../structures/player/Profile";

export class MarketService {
  /**
   * Gets a list of cards currently up-for-sale, paginated with options.
   * @options An Object of search options.
   */
  public static async getMarket(options?: {
    page?: number;
    priceMin?: number;
    priceMax?: number;
    starsMin?: number;
    starsMax?: number;
    serialMin?: number;
    serialMax?: number;
  }): Promise<{ card: UserCard; price: number }[]> {
    let cardIds = await MarketFetch.fetchCardIdsInMarketplace(options);

    let cards = await Promise.all(
      cardIds.map(async (id) => {
        let card = await UserCardService.getCardByUserCardId(id.card_id);
        return { card: card.card, price: id.price };
      })
    );

    return cards;
  }

  /**
   * Validates whether or not a card is for sale.
   * @param id ID of the user_card.
   */
  public static async cardIsOnMarketplace(
    id: number
  ): Promise<{ forSale: boolean; price?: number }> {
    return await MarketFetch.fetchCardIsForSale(id);
  }

  /**
   * Purchases a card, setting `owner_id` to whoever bought the card and removing coins from them.
   * @param buyer The Discord ID of the user who is purchasing the card.
   * @param reference The card reference of the card being purchased.
   */
  public static async purchaseCard(
    buyer: string,
    reference: string
  ): Promise<{
    card: UserCard;
    buyer: Profile;
    seller: Profile;
    price: number;
  }> {
    const card = await CardService.parseCardDetails(reference);
    if (!card) throw new error.InvalidUserCardError();

    const validateForSale = await this.cardIsOnMarketplace(
      card.card.userCardId
    );
    if (!validateForSale.forSale) throw new error.CardNotForSaleError();

    const buyerProfile = await PlayerFetchSQL.getProfileFromDiscordId(
      buyer,
      false
    );
    if (buyerProfile.coins < validateForSale.price!)
      throw new error.NotEnoughCoinsError();

    //Remove card listing from marketplace
    await MarketUpdate.removeCardFromMarketplace(card.card.userCardId);

    const transfer = await CardModify.transferCardToUser(
      buyer,
      card.card.userCardId
    );

    /* Transfer coins from buyer to seller */
    const sellerProfile = await PlayerFetchSQL.getProfileFromDiscordId(
      card.card.ownerId,
      true
    );
    await PlayerModifySQL.removeCoins(
      buyerProfile.discord_id,
      validateForSale.price!
    );
    await PlayerModifySQL.addCoins(
      sellerProfile.discord_id,
      validateForSale.price!
    );

    return {
      card: transfer,
      buyer: buyerProfile,
      seller: sellerProfile,
      price: validateForSale.price!,
    };
  }

  /**
   * Lists a card on the marketplace.
   */
  public static async sellCard(
    seller: string,
    reference: string,
    price: number
  ): Promise<UserCard> {
    const card = await CardService.parseCardDetails(reference);
    if (!card) throw new error.InvalidUserCardError();
    if (card.card.ownerId != seller) throw new error.NotYourCardError();
    if (isNaN(price)) throw new error.NotANumberError();

    const validateForSale = await this.cardIsOnMarketplace(
      card.card.userCardId
    );
    if (validateForSale.forSale) throw new error.CardAlreadyForSaleError();

    await MarketUpdate.listCardOnMarketplace(card.card.userCardId, price);
    return card.card;
  }
}
