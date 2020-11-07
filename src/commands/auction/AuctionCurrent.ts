import { Message, TextChannel } from "discord.js";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import * as error from "../../structures/Error";
import { AuctionService } from "../../helpers/Auction";

export class Command extends BaseCommand {
  names: string[] = ["auction", "auc"];
  async exec(msg: Message, executor: Profile) {
    const auction = AuctionService.getAuction();
    if (!auction) {
      await msg.channel.send(
        `${this.config.discord.emoji.cross.full} There isn't an active auction.`
      );
      return;
    }

    const currentBid = AuctionService.getTopBid();
    await msg.channel.send(
      `${
        this.config.discord.emoji.check.full
      } The current auction is: ${auction}\n${
        currentBid
          ? `The current bid is: **${currentBid.bid.toLocaleString()}** by <@${
              currentBid.profile.discord_id
            }>`
          : `Nobody has bid yet.`
      }`
    );
  }
}
