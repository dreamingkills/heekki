import { Chance } from "chance";
import { CardService } from "./CardService";
import * as error from "../../structures/Error";
import { TradeUpdate } from "../sql/trade/TradeUpdate";
import { MarketService } from "./MarketService";
import { UserCard } from "../../structures/player/UserCard";
import { TradeFetch } from "../sql/trade/TradeFetch";
import { UserCardService } from "./UserCardService";
import { Card } from "../../structures/card/Card";

export class TradeService {
  private static generateUniqueTradeId(): string {
    const chance = new Chance();
    return chance.string({
      length: 5,
      casing: "lower",
      alpha: true,
      numeric: true,
    });
  }

  private static async validateCards(
    cards: UserCard[],
    sender: string,
    idShouldBe: string,
    perspective: "recipient" | "sender"
  ): Promise<boolean> {
    for (let i = 0; i < cards.length; i++) {
      if (cards[i].ownerId === "0")
        throw new error.CannotTradeForOrphanedCardError();
      if (perspective === "recipient" && cards[i].ownerId === sender)
        throw new error.CannotTradeWithYourselfError();
      if (cards[i].ownerId != idShouldBe) {
        if (perspective === "recipient")
          throw new error.InconsistentCardOwnerOnRightSideOfTradeError();
        throw new error.NotYourCardInTradeError();
      }
      const isForSale = await MarketService.cardIsOnMarketplace(cards[i]);
      if (isForSale.forSale) {
        if (perspective === "recipient")
          throw new error.RightSideCardIsOnMarketplaceError();
        throw new error.LeftSideCardIsOnMarketplaceError();
      }
      if (cards[i].isFavorite) {
        if (perspective === "recipient")
          throw new error.FavoriteCardOnRightSideOfTradeError();
        throw new error.FavoriteCardOnLeftSideOfTradeError();
      }
    }
    return true;
  }

  public static async createNewTradeRequest(
    senderCards: UserCard[],
    recipientCards: UserCard[],
    senderId: string
  ): Promise<{ recipient: string; unique: string }> {
    await this.validateCards(senderCards, senderId, senderId, "sender");
    await this.validateCards(
      recipientCards,
      senderId,
      recipientCards[0].ownerId,
      "recipient"
    );

    const uniqueId = this.generateUniqueTradeId();
    await TradeUpdate.createTrade(
      senderId,
      recipientCards[0].ownerId,
      senderCards,
      recipientCards,
      uniqueId
    );
    return {
      recipient: recipientCards[0].ownerId,
      unique: uniqueId,
    };
  }

  public static async getTradeRequests(
    sender: string
  ): Promise<
    {
      unique: string;
      sender: string;
      recipient: string;
      senderCard: number;
      recipientCard: number;
    }[]
  > {
    return await TradeFetch.getTradesByUserId(sender);
  }

  public static async getTradeByUnique(
    unique: string
  ): Promise<
    {
      unique: string;
      sender: string;
      recipient: string;
      senderCard: number;
      recipientCard: number;
    }[]
  > {
    return await TradeFetch.getTradesByUniqueId(unique);
  }
  public static async acceptTrade(
    unique: string,
    sender: string
  ): Promise<boolean> {
    const trades = await TradeFetch.getTradesByUniqueId(unique);
    if (trades.length == 0) throw new error.TradeDoesNotExistError();

    if (sender !== trades[0].recipient)
      throw new error.NotYourTradeToAcceptError();

    for (let trade of trades) {
      console.log(trade);
      if (trade.senderCard !== 0) {
        const card = await UserCardService.getUserCardById(trade.senderCard);
        await UserCardService.transferCard(trade.recipient, card);
      }
      if (trade.recipientCard !== 0) {
        const card = await UserCardService.getUserCardById(trade.recipientCard);
        await UserCardService.transferCard(trade.sender, card);
      }
    }

    await TradeUpdate.deleteTrade(unique);
    return true;
  }

  public static async cancelTrade(
    unique: string,
    sender: string
  ): Promise<boolean> {
    const trades = await TradeFetch.getTradesByUniqueId(unique);
    if (trades.length == 0) throw new error.TradeDoesNotExistError();

    if (sender !== trades[0].sender && sender !== trades[0].recipient)
      throw new error.NotYourTradeToRejectError();

    await TradeUpdate.deleteTrade(unique);
    return true;
  }
}
