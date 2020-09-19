import { Message } from "discord.js";
import { TradeService } from "../../database/service/TradeService";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["reject"];
  usage: string[] = ["%c <trade id>"];
  desc: string = "Cancels a trade request you sent, or one from another user.";
  category: string = "card";

  async exec(msg: Message) {
    const tradeId = this.options[0];

    await TradeService.cancelTrade(tradeId, msg.author.id);
    msg.channel.send(`:white_check_mark: Cancelled trade **${tradeId}**!`);
  }
}
