import { MarketFetch } from "../sql/market/MarketFetch";
import { UserCardService } from "./UserCardService";
import { UserCard } from "../../structures/player/UserCard";
import { CardService } from "./CardService";
import * as error from "../../structures/Error";
import { MarketUpdate } from "../sql/market/MarketUpdate";
import { Profile } from "../../structures/player/Profile";
import { PlayerService } from "./PlayerService";

export class MarketService {
  /**
   * Gets a list of cards currently up-for-sale, paginated with options.
   * @options An Object of search options.
   */
  public static async getMarket(options?: {
    [key: string]: string | number;
  }): Promise<{ card: UserCard; price: number }[]> {
    let cardIds = await MarketFetch.fetchCardIdsInMarketplace(options);

    let cards = await Promise.all(
      cardIds.map(async (id) => {
        let card = await UserCardService.getCardByUserCardId(
          id.card.userCardId
        );
        return { card: card.userCard, price: id.price };
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
    reference: { abbreviation: string; serial: number }
  ): Promise<{
    card: UserCard;
    buyer: Profile;
    seller: Profile | undefined;
    price: number;
  }> {
    const card = (await CardService.getCardDataFromReference(reference))
      .userCard;
    if (!card) throw new error.InvalidUserCardError(reference);

    const validateForSale = await this.cardIsOnMarketplace(card.userCardId);
    if (!validateForSale.forSale) throw new error.CardNotForSaleError();

    const buyerProfile = await PlayerService.getProfileByDiscordId(
      buyer,
      false
    );
    if (buyerProfile.coins < validateForSale.price!)
      throw new error.NotEnoughCoinsError();

    //Remove card listing from marketplace
    await MarketUpdate.removeCardFromMarketplace(card.userCardId);

    const transfer = await UserCardService.transferCardToUserByDiscordId(
      buyer,
      card.userCardId
    );

    /* Transfer coins from buyer to seller */
    if (card.ownerId == "0") {
      await PlayerService.removeCoinsFromUserByDiscordId(
        buyerProfile.discord_id,
        validateForSale.price!
      );
      return {
        card: transfer,
        buyer: buyerProfile,
        seller: undefined,
        price: validateForSale.price!,
      };
    }
    const sellerProfile = await PlayerService.getProfileByDiscordId(
      card.ownerId,
      true
    );
    await PlayerService.removeCoinsFromUserByDiscordId(
      buyerProfile.discord_id,
      validateForSale.price!
    );
    await PlayerService.addCoinsToUserByDiscordId(
      sellerProfile.discord_id,
      validateForSale.price!
    );

    MarketUpdate.completeTransaction(
      buyerProfile.discord_id,
      sellerProfile.discord_id
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
    price: number,
    reference: { abbreviation: string; serial: number }
  ): Promise<UserCard> {
    if (isNaN(price) || price < 1 || price > 2147483647)
      throw new error.InvalidPriceError();
    const card = (await CardService.getCardDataFromReference(reference))
      .userCard;
    if (!card) throw new error.InvalidUserCardError(reference);
    if (card.ownerId != seller) throw new error.NotYourCardError();
    if (card.isFavorite) throw new error.FavoriteCardError();

    const validateForSale = await this.cardIsOnMarketplace(card.userCardId);
    if (validateForSale.forSale) throw new error.CardAlreadyForSaleError();

    await MarketUpdate.listCardOnMarketplace(card.userCardId, price);
    return card;
  }

  public static async removeListing(
    perpetrator: string,
    reference: { abbreviation: string; serial: number }
  ): Promise<UserCard> {
    const card = (await CardService.getCardDataFromReference(reference))
      .userCard;
    if (!card) throw new error.InvalidUserCardError(reference);
    if (card.ownerId != perpetrator) throw new error.NotYourCardError();

    const validateForSale = await this.cardIsOnMarketplace(card.userCardId);
    if (!validateForSale.forSale) throw new error.CardNotForSaleError();

    await MarketUpdate.removeCardFromMarketplace(card.userCardId);
    return card;
  }
}
