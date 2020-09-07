import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed } from "discord.js";
import { CardService } from "../../database/service/CardService";

export class Command extends GameCommand {
  names: string[] = ["preview"];
  usage: string[] = ["%c <up to 9 card references...>"];
  desc: string = "Preview up to 9 cards.";
  category: string = "player";

  exec = async (msg: Message) => {
    const references = this.prm.filter((p) => p.includes("#"));
    const cardList = await Promise.all(
      references.map(async (p) => {
        return (
          await CardService.getCardDataFromReference({
            abbreviation: p.split("#")[0],
            serial: parseInt(p.split("#")[1]),
          })
        ).userCard;
      })
    );

    const embed = new MessageEmbed()
      .setAuthor(
        `Card previews | ${msg.author.tag}`,
        msg.author.displayAvatarURL()
      )
      .setDescription(`**${cardList.length}** cards requested...`)
      .setColor(`#40BD66`);
    for (let card of cardList.slice(0, 9)) {
      embed.addField(
        `${card.abbreviation}#${card.serialNumber}`,
        `**${card.title}**\n${card.member}\n:star: **${card.stars}**\n:heart: **${card.hearts}**\nOwner: <@${card.ownerId}>`,
        true
      );
    }

    msg.channel.send(embed);
  };
}
