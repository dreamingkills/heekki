import { Message } from "discord.js";
import { CardService } from "../../database/service/CardService";
import { MarketService } from "../../database/service/MarketService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["sell"];
  async exec(msg: Message, executor: Profile) {
    const reference = {
      identifier: this.options[0]?.split("#")[0],
      serial: parseInt(this.options[0]?.split("#")[1]),
    };
    let price = parseFloat(this.options[1]);
    if (this.options[1].toLowerCase().endsWith("k")) price = price * 1000;
    price = Math.round(price);
    if (!reference.serial) {
      msg.channel.send(
        `<:red_x:741454361007357993> Please specify a valid card reference.`
      );
      return;
    }
    const card = await CardService.getCardDataFromReference(reference);
    if (card.ownerId !== executor.discord_id) {
      msg.channel.send(
        "<:red_x:741454361007357993> That card doesn't belong to you."
      );
      return;
    }
    if (card.isFavorite) {
      msg.channel.send(
        "<:red_x:741454361007357993> That card is currently favorited."
      );
      return;
    }
    const isForSale = await MarketService.cardIsOnMarketplace(card);
    if (isForSale.forSale) {
      msg.channel.send(
        `<:red_x:741454361007357993> That card is already on the marketplace.`
      );
      return;
    }
    if (isNaN(price)) {
      msg.channel.send("<:red_x:741454361007357993> Please specify a price.");
      return;
    }

    await MarketService.sellCard(price, card);

    msg.channel.send(
      `:white_check_mark: You've listed **${card.abbreviation}#${card.serialNumber}** on the Marketplace for <:cash:757146832639098930> **${price}**.`
    );
  }
}
