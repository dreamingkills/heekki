import { Message, MessageEmbed } from "discord.js";
import { WellService } from "../../database/service/WellService";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["well"];
  async exec(msg: Message) {
    const requirement = 15000000;
    const current = await WellService.getWellTotal();

    const embed = new MessageEmbed()
      .setAuthor(
        `Well of Goodwill | ${msg.author.tag}`,
        msg.author.displayAvatarURL()
      )
      .setDescription(`:fountain:`)
      .setColor(`#FFAACC`);
    await msg.channel.send(embed);
  }
}
