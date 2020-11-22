import { Message } from "discord.js";
import { BaseCommand } from "../../structures/command/Command";
import { AuctionService } from "../../helpers/Auction";
import { PlayerService } from "../../database/service/PlayerService";

export class Command extends BaseCommand {
  names: string[] = ["$aucend"];
  users: string[] = ["197186779843919877"];
  async exec(msg: Message) {
    const currentAuction = AuctionService.getAuction();
    if (!currentAuction) {
      await msg.channel.send(
        `${this.bot.config.discord.emoji.cross.full} There isn't an auction going on.`
      );
      return;
    }

    const topBid = AuctionService.getTopBid();
    if (!topBid) {
      await msg.channel.send(
        `${this.bot.config.discord.emoji.cross.full} No-one bid, so no-one wins.`
      );
    } else {
      await PlayerService.removeCoinsFromProfile(topBid.profile, topBid.bid);
      await msg.channel.send(
        `${this.bot.config.discord.emoji.check.full} <@${
          topBid.profile.discord_id
        }> has won the auction for ${currentAuction} at ${
          this.bot.config.discord.emoji.cash.full
        } **${topBid.bid.toLocaleString()}**!`
      );
    }

    AuctionService.clearAuction();
    return;
  }
}
