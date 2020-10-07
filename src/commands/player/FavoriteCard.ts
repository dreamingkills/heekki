import { Message } from "discord.js";
import { CardService } from "../../database/service/CardService";
import { UserCardService } from "../../database/service/UserCardService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import { UserCard } from "../../structures/player/UserCard";
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
      throw new error.NotYourCardError(reference);

    await UserCardService.toggleCardAsFavorite(card);

    const pre = !card.isFavorite ? "Favorited" : "Unfavorited";
    const post = !card.isFavorite
      ? "You are no longer able to trade, sell, or forfeit that card."
      : "You are now able to trade, sell, and forfeit that card.";
    msg.channel.send(
      `:white_check_mark: ${pre} **${card.abbreviation}#${card.serialNumber}**!\n${post}`
    );
  }
}
