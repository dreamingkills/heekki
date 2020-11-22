import { Message } from "discord.js";
import { CardService } from "../../database/service/CardService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import * as error from "../../structures/Error";

export class Command extends BaseCommand {
  names: string[] = ["favorite", "fav"];
  async exec(msg: Message, executor: Profile) {
    const reference = {
      identifier: this.options[0]?.split("#")[0],
      serial: parseInt(this.options[0]?.split("#")[1]),
    };
    if (isNaN(reference.serial)) throw new error.InvalidCardReferenceError();

    const card = await CardService.getCardDataFromReference(reference);
    if (card.ownerId !== executor.discord_id)
      throw new error.NotYourCardError(card);

    await CardService.toggleCardAsFavorite(card);

    const pre = !card.isFavorite ? "Favorited" : "Unfavorited";
    const post = !card.isFavorite
      ? "You are no longer able to trade or sell that card."
      : "You are now able to trade and sell that card.";
    await msg.channel.send(
      `${this.bot.config.discord.emoji.check.full} ${pre} **${card.abbreviation}#${card.serialNumber}**!\n${post}`
    );
  }
}
