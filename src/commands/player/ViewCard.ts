import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed } from "discord.js";
import { CardService } from "../../database/Card";

export class Command extends GameCommand {
  names: string[] = ["card"];
  usage: string[] = ["%c [card reference]"];
  desc: string = "Generates an image of a card.";
  category: string = "card";

  exec = async (msg: Message) => {
    let card = await CardService.generateCardImage(this.prm[0]);
    let embed = new MessageEmbed()
      .setDescription(`Owner: <@${card.card.ownerId}>\n*"${card.card.blurb}"*`)
      .setColor("#40BD66");
    msg.channel.send({ embed: embed, files: [card.image] });
  };
}
