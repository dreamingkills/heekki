import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import fish from "../../assets/fish.json";

export class Command extends GameCommand {
  names: string[] = ["fish"];
  usage: string[] = ["%c <user>"];
  desc: string = "";
  category: string = "player";

  exec = async (msg: Message) => {
    const profile = await PlayerService.getProfileByDiscordId(
      msg.author.id,
      false
    );

    const fishRaw = await PlayerService.getFishByDiscordId(profile.discord_id);
    const fishEmbed = new MessageEmbed()
      .setAuthor(`Fish | ${msg.author.tag}`)
      .setColor(`#40BD66`)
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
