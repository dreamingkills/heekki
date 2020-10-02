import { Message } from "discord.js";
import { CardService } from "../../database/service/CardService";
import { UserCardService } from "../../database/service/UserCardService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import { UserCard } from "../../structures/player/UserCard";

export class Command extends BaseCommand {
  names: string[] = ["favorite", "fav"];
  async exec(msg: Message, executor: Profile) {
    const reference = {
      identifier: this.options[0]?.split("#")[0],
      serial: parseInt(this.options[0]?.split("#")[1]),
    };
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
