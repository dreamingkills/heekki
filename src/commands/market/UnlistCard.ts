import { Message } from "discord.js";
import { CardService } from "../../database/service/CardService";
import { MarketService } from "../../database/service/MarketService";
import { BaseCommand } from "../../structures/command/Command";
import * as error from "../../structures/Error";

export class Command extends BaseCommand {
  names: string[] = ["unlist"];
  async exec(msg: Message) {
    const reference = {
      identifier: this.options[0]?.split("#")[0],
      serial: parseInt(this.options[0]?.split("#")[1]),
    };
    if (isNaN(reference.serial)) {
      msg.channel.send(
        "<:red_x:741454361007357993> Please enter a valid card reference."
      );
      return;
    }

    const card = await CardService.getCardDataFromReference(reference);
    if (card.ownerId !== msg.author.id) throw new error.NotYourCardError();

    const isOnMarketplace = await MarketService.cardIsOnMarketplace(card);
    if (!isOnMarketplace.forSale) throw new error.CardNotForSaleError();

    await MarketService.removeListing(card);
    msg.channel.send(
      `:white_check_mark: You've removed the listing for **${card.abbreviation}#${card.serialNumber}** from the Marketplace.`
    );
  }
}
