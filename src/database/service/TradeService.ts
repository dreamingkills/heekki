import { Chance } from "chance";
import { CardService } from "./CardService";
import * as error from "../../structures/Error";
import { TradeUpdate } from "../sql/trade/TradeUpdate";
import { MarketService } from "./MarketService";
import { UserCard } from "../../structures/player/UserCard";
import { TradeFetch } from "../sql/trade/TradeFetch";
import { UserCardService } from "./UserCardService";
import { Card } from "../../structures/card/Card";
import { StatsService } from "./StatsService";
import { PlayerService } from "./PlayerService";

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

  public static async createNewTradeRequest(
    senderCards: UserCard[],
    recipientCards: UserCard[],
    senderId: string
  ): Promise<{ recipient: string; unique: string }> {
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
}
