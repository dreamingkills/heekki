import { Message } from "discord.js";
import { BaseCommand } from "../../structures/command/Command";
import { AuctionService } from "../../helpers/Auction";

export class Command extends BaseCommand {
  names: string[] = ["$aucclear"];
  users: string[] = ["197186779843919877"];
  async exec(msg: Message) {
    AuctionService.clearAuction();
    await msg.channel.send(
      `${this.config.discord.emoji.check.full} Cleared AuctionService.`
    );
  }
}
