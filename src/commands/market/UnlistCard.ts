import { GameCommand } from "../../structures/command/GameCommand";
import { Message } from "discord.js";
import { MarketService } from "../../database/service/MarketService";

export class Command extends GameCommand {
  names: string[] = ["unlist"];
  usage: string[] = ["%c <card reference>"];
  desc: string = "Removes a card listing from the Marketplace.";
  category: string = "market";

  exec = async (msg: Message) => {
    let listing = await MarketService.removeListing(this.prm[0], msg.author.id);

    await msg.channel.send(
      `:white_check_mark: You've removed the listing for **${listing.abbreviation}#${listing.serialNumber}** from the Marketplace.`
    );
  };
}
