import { Message, TextChannel } from "discord.js";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import * as error from "../../structures/Error";
import { AuctionService } from "../../helpers/Auction";

export class Command extends BaseCommand {
  names: string[] = ["bid"];
  async exec(msg: Message, executor: Profile) {
    if ((<TextChannel>msg.channel).name !== "auction-house") return;

    const currentAuction = AuctionService.getAuction();
    if (!currentAuction) throw new error.NoAuctionError();

    let baseBid = parseFloat(this.options[0]);
    if (isNaN(baseBid) || baseBid < 1) throw new error.NotANumberError();

    let bid;
    if (this.options[0]?.toLowerCase().endsWith("k")) {
      bid = Math.floor(baseBid * 1000);
    } else if (this.options[0]?.toLowerCase().endsWith("m")) {
      bid = Math.floor(baseBid * 1000000);
    } else {
      bid = baseBid;
    }
    if (bid > executor.coins) throw new error.NotEnoughCoinsError();

    const currentBid = AuctionService.getTopBid();
    if (currentBid && currentBid.bid + 100 > bid)
      throw new error.OutbidError(currentBid.bid);

    AuctionService.setBid(executor, bid);
    await msg.channel.send(
      `${this.bot.config.discord.emoji.check.full} Bid ${
        this.bot.config.discord.emoji.cash.full
      } **${bid.toLocaleString()}** on ${currentAuction}!`
    );
  }
}
