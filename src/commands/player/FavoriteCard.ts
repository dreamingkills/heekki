import { Message } from "discord.js";
import { UserCardService } from "../../database/service/UserCardService";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["favorite", "fav"];
  usage: string[] = ["%c <card reference>"];
  desc: string =
    "Marks a card as 'favorite', preventing it from being traded, sold, or forfeited.";
  category: string = "card";

  exec = async (msg: Message) => {
    const reference = {
      abbreviation: this.options[0]?.split("#")[0],
      serial: parseInt(this.options[0]?.split("#")[1]),
    };
    if (!reference.abbreviation) {
      msg.channel.send(
        `<:red_x:741454361007357993> Please enter a card to favorite.`
      );
      return;
    }
    const newCard = await UserCardService.toggleCardAsFavorite(
      reference,
      msg.author.id
    );

    const pre = newCard.isFavorite ? "Favorited" : "Unfavorited";
    const post = newCard.isFavorite
      ? "You are no longer able to trade, sell, or forfeit that card."
      : "You are now able to trade, sell, and forfeit that card.";
    msg.channel.send(
      `:white_check_mark: ${pre} **${reference.abbreviation}#${reference.serial}**!\n${post}`
    );
  };
}
