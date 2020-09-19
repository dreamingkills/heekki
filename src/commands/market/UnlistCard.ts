import { Message } from "discord.js";
import { MarketService } from "../../database/service/MarketService";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["unlist"];
  usage: string[] = ["%c <card reference>"];
  desc: string = "Removes a card listing from the Marketplace.";
  category: string = "market";

  exec = async (msg: Message) => {
    let listing = await MarketService.removeListing(msg.author.id, {
      abbreviation: this.options[0].split("#")[0],
      serial: parseInt(this.options[0].split("#")[1]),
    });

    msg.channel.send(
      `:white_check_mark: You've removed the listing for **${listing.abbreviation}#${listing.serialNumber}** from the Marketplace.`
    );
  };
}
