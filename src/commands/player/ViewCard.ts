import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed } from "discord.js";
import { CardService } from "../../database/service/CardService";

export class Command extends GameCommand {
  names: string[] = ["card", "show"];
  usage: string[] = ["%c [card reference]"];
  desc: string = "Generates an image of a card.";
  category: string = "card";

  exec = async (msg: Message) => {
    let card = await CardService.generateCardImageFromReference({
      abbreviation: this.prm[0].split("#")[0],
      serial: parseInt(this.prm[0].split("#")[1]),
    });

    let embed = new MessageEmbed()
      .setDescription(
        `Owner: ${
          card.userCard.ownerId == "0"
            ? "No-one!"
            : `<@${card.userCard.ownerId}>`
        }\n*"${card.userCard.blurb}"*`
      )
      .setColor("#40BD66")
      .setFooter(`Card designed by ${card.userCard.credit}`);
    msg.channel.send({ embed: embed, files: [card.image] });
  };
}
