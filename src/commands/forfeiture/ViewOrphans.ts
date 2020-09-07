import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";

export class Command extends GameCommand {
  names: string[] = ["viewforfeited", "vff"];
  usage: string[] = ["%c [page]"];
  desc: string = "Shows a list of forfeited cards.";
  category: string = "card";

  exec = async (msg: Message) => {
    const optionsRaw = this.prm.filter((v) => v.includes("="));
    let options: { [key: string]: string } = {};
    for (let option of optionsRaw) {
      const name = option.split("=")[0];
      const value = option.split("=")[1];
      options[name.toLowerCase()] = value;
    }

    let forfeitedRaw = await PlayerService.getOrphanedCards({
      ...options,
      limit: 9,
    });

    let embed = new MessageEmbed()
      .setAuthor(
        `Cards currently up-for-grabs${
          optionsRaw.length > 0 ? ` (${optionsRaw.join(", ")})` : ""
        }`,
        msg.author.displayAvatarURL()
      )
      .setFooter(
        `Use !cf <card reference> to claim a card / !vff [page] to view another page`
      )
      .setColor("#40BD66");

    for (let f of forfeitedRaw) {
      embed.addField(
        `${f.abbreviation}#${f.serialNumber}`,
        `:star: ${f.stars}\n:heart: ${f.hearts}`,
        true
      );
    }

    msg.channel.send(embed);
  };
}
