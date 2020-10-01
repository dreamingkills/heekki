import { Message, MessageEmbed } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import fish from "../../assets/fish.json";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["fish"];
  users: string[] = ["197186779843919877"];
  exec = async (msg: Message, executor: Profile) => {
    if (this.options[0].toLowerCase() === "sell") {
      // sell the damn fish
      return;
    }
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
