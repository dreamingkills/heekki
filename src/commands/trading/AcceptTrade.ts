import { GameCommand } from "../../structures/command/GameCommand";
import { Message } from "discord.js";
import { MarketService } from "../../database/service/MarketService";
import { TradeService } from "../../database/service/TradeService";

export class Command extends GameCommand {
  names: string[] = ["accept"];
  usage: string[] = ["%c <trade id>"];
  desc: string = "Sends a trade request to another user";
  category: string = "card";

  exec = async (msg: Message) => {
    const tradeId = this.prm[0];

    await TradeService.acceptTrade(tradeId, msg.author.id);
    await msg.channel.send(`:white_check_mark: Accepted trade **${tradeId}**!`);
    return;
  };
}