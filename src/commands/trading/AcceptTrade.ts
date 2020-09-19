import { Message } from "discord.js";
import { TradeService } from "../../database/service/TradeService";
import { StatsService } from "../../database/service/StatsService";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["accept"];
  usage: string[] = ["%c <trade id>"];
  desc: string = "Sends a trade request to another user";
  category: string = "card";

  exec = async (msg: Message) => {
    const tradeId = this.options[0];

    await TradeService.acceptTrade(tradeId, msg.author.id);

    StatsService.incrementStat("trades_complete");
    msg.channel.send(`:white_check_mark: Accepted trade **${tradeId}**!`);
  };
}
