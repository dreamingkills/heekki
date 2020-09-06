import { Chance } from "chance";
import { CardService } from "./CardService";
import * as error from "../../structures/Error";
import { TradeUpdate } from "../sql/trade/TradeUpdate";
import { MarketService } from "./MarketService";
import { UserCard } from "../../structures/player/UserCard";
import { TradeFetch } from "../sql/trade/TradeFetch";
import { UserCardService } from "./UserCardService";

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
      if (perspective === "recipient" && cards[i].ownerId === sender)
        throw new error.CannotTradeWithYourselfError();
      if (cards[i].ownerId != idShouldBe) {
        if (perspective === "recipient")
          throw new error.InconsistentCardOwnerOnRightSideOfTradeError();
        throw new error.NotYourCardInTradeError();
      }
      const isForSale = await MarketService.cardIsOnMarketplace(
        cards[i].userCardId
      );
      if (isForSale.forSale) {
        if (perspective === "recipient")
          throw new error.RightSideCardIsOnMarketplaceError();
        throw new error.LeftSideCardIsOnMarketplaceError();
      }
    }
    return true;
  }

  public static async createNewTradeRequest(
    senderCards: string[],
    recipientCards: string[],
    senderId: string
  ): Promise<{ recipient: string; unique: string }> {
    const senderUserCards = await Promise.all(
      senderCards.map(async (c) => {
        return (
          await CardService.getCardDataFromReference({
            abbreviation: c.split("#")[0],
            serial: parseInt(c.split("#")[1]),
          })
        ).userCard;
      })
    );
    await this.validateCards(senderUserCards, senderId, senderId, "sender");

    const recipientUserCards = await Promise.all(
      recipientCards.map(async (c) => {
        return (
          await CardService.getCardDataFromReference({
            abbreviation: c.split("#")[0],
            serial: parseInt(c.split("#")[1]),
          })
        ).userCard;
      })
    );
    await this.validateCards(
      recipientUserCards,
      senderId,
      recipientUserCards[0].ownerId,
      "recipient"
    );

    const uniqueId = this.generateUniqueTradeId();
    await TradeUpdate.createTrade(
      senderId,
      recipientUserCards[0].ownerId,
      senderUserCards,
      recipientUserCards,
      uniqueId
    );
    return {
      recipient: recipientUserCards[0].ownerId,
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

    if (sender !== trades[0].recipient) throw new error.NotYourTradeError();

    for (let trade of trades) {
      if (trade.senderCard !== 0) {
        await UserCardService.transferCardToUserByDiscordId(
          trade.recipient,
          trade.senderCard
        );
      }
      if (trade.recipientCard !== 0) {
        await UserCardService.transferCardToUserByDiscordId(
          trade.sender,
          trade.recipientCard
        );
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
      throw new error.NotYourTradeError();

    await TradeUpdate.deleteTrade(unique);
    return true;
  }
}
