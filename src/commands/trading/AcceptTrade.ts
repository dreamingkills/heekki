import { Message } from "discord.js";
import { TradeService } from "../../database/service/TradeService";
import { StatsService } from "../../database/service/StatsService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["accept"];
  async exec(msg: Message, executor: Profile) {
    const tradeId = this.options[0];

    await TradeService.acceptTrade(tradeId, msg.author.id);

    msg.channel.send(`:white_check_mark: Accepted trade **${tradeId}**!`);
  }
}
