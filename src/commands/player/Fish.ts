import { Message, MessageEmbed } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import fish from "../../assets/fish.json";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["fish"];
  exec = async (msg: Message, executor: Profile) => {
    const fishRaw = await PlayerService.getFishByProfile(executor);
    const fishEmbed = new MessageEmbed()
      .setAuthor(`Fish | ${msg.author.tag}`, msg.author.displayAvatarURL())
      .setColor(`#FFAACC`)
      .setThumbnail(msg.author.displayAvatarURL())
      .setDescription(
        fishRaw.map((fishy) => {
          return `${fish.genderEmoji[fishy.gender]} ${fishy.name} (**${
            fishy.weight
          }g**)`;
        })
      );

    await msg.channel.send(fishEmbed);
  };
}
