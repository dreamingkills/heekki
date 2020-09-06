import { GameCommand } from "../../structures/command/GameCommand";
import { Message } from "discord.js";
import { MarketService } from "../../database/service/MarketService";
import { TradeService } from "../../database/service/TradeService";

export class Command extends GameCommand {
  names: string[] = ["reject"];
  usage: string[] = ["%c <trade id>"];
  desc: string = "Cancels a trade request you sent, or one from another user.";
  category: string = "card";

  exec = async (msg: Message) => {
    const tradeId = this.prm[0];

    await TradeService.cancelTrade(tradeId, msg.author.id);
    await msg.channel.send(
      `:white_check_mark: Cancelled trade **${tradeId}**!`
    );
    return;
  };
}
