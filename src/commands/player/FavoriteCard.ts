import { GameCommand } from "../../structures/command/GameCommand";
import { Message } from "discord.js";
import { UserCardService } from "../../database/service/UserCardService";

export class Command extends GameCommand {
  names: string[] = ["favorite"];
  usage: string[] = ["%c <card reference>"];
  desc: string =
    "Marks a card as 'favorite', preventing it from being traded, sold, or forfeited.";
  category: string = "card";

  exec = async (msg: Message) => {
    const reference = {
      abbreviation: this.prm[0].split("#")[0],
      serial: parseInt(this.prm[0].split("#")[1]),
    };
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
