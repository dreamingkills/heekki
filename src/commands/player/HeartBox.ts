import { Message, MessageEmbed } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["heartbox", "hb"];
  exec = async (msg: Message, executor: Profile) => {
    const hb = await PlayerService.openHeartBoxes(executor);
    const embed = new MessageEmbed()
      .setAuthor(
        `Heart Boxes | ${msg.author.tag}`,
        msg.author.displayAvatarURL()
      )
      .setDescription(
        `:gift_heart: You opened your heart boxes and received **${
          hb.added
        }** <:heekki_heart:757147742383505488>\nYou can open more heart boxes in 4 hours.\n\n${hb.individual
          .map((n) => {
            return `:package: ${n}`;
          })
          .join(", ")}`
      )
      .setFooter(`You now have ${hb.total} hearts.`)
      .setColor(`#FFAACC`);
    msg.channel.send(embed);
  };
}
