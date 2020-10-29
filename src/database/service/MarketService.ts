import { MarketFetch } from "../sql/market/MarketFetch";
import { UserCard } from "../../structures/player/UserCard";
import { MarketUpdate } from "../sql/market/MarketUpdate";
import { Profile } from "../../structures/player/Profile";

export class MarketService {
  public static async getMarket(
    options: {
      [key: string]: string | number;
    } = {}
  ): Promise<{ card: UserCard; price: number }[]> {
    return await MarketFetch.fetchCardIdsInMarketplace(options);
  }

  public static async getMarketCount(
    options: {
      [key: string]: string | number;
    } = {}
  ): Promise<number> {
    return await MarketFetch.fetchMarketplaceCardCount(options);
  }

  public static async cardIsOnMarketplace(
    card: UserCard
  ): Promise<{ forSale: boolean; price: number }> {
    return await MarketFetch.fetchCardIsForSale(card.userCardId);
  }

  public static async sellCard(price: number, card: UserCard): Promise<void> {
    await MarketUpdate.listCardOnMarketplace(card.userCardId, price);
  }

  public static async removeListing(card: UserCard): Promise<void> {
    await MarketUpdate.removeCardFromMarketplace(card.userCardId);
  }
}
