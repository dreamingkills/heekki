import { Message, TextChannel } from "discord.js";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import * as error from "../../structures/Error";
import { AuctionService } from "../../helpers/Auction";

export class Command extends BaseCommand {
  names: string[] = ["$aucset"];
  users: string[] = ["197186779843919877"];
  async exec(msg: Message, executor: Profile) {
    const currentAuction = AuctionService.getAuction();
    if (currentAuction) {
      await msg.channel.send(
        `:warning: There's currently an auction going on. Use \`!$aucclear\` to reset it.`
      );
      return;
    }
    const auction = this.options.join(" ");
    if (!auction) throw new error.InvalidAuctionError();

    AuctionService.setAuction(auction);
    await msg.channel.send(
      `${this.config.discord.emoji.check.full} Set the current auction to: ${auction}`
    );
  }
}
