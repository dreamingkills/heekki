import { Message } from "discord.js";
import { MarketService } from "../../database/service/MarketService";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["sell"];
  usage: string[] = ["%c <card reference> <price>"];
  desc: string = "Puts a card up for sale on the marketplace.";
  category: string = "market";

  exec = async (msg: Message) => {
    let listing = await MarketService.sellCard(
      msg.author.id,
      parseInt(this.options[1]),
      {
        abbreviation: this.options[0]?.split("#")[0],
        serial: parseInt(this.options[0]?.split("#")[1]),
      }
    );

    msg.channel.send(
      `:white_check_mark: You've listed **${listing.abbreviation}#${listing.serialNumber}** on the Marketplace for <:coin:745447920072917093> **${this.options[1]}**`
    );
  };
}
