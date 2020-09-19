import { Message, MessageEmbed } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["heartbox", "hb"];
  usage: string[] = ["%c"];
  desc: string =
    "Opens ten heart boxes, giving you 7 to 500 hearts each! Usable once every 4 hours.";
  category: string = "player";

  exec = async (msg: Message) => {
    const hb = await PlayerService.openHeartBoxes(msg.author.id);
    const embed = new MessageEmbed()
      .setDescription(
        `:gift_heart: You opened your heart boxes and received **${
          hb.added
        }** hearts!\nYou can open more heart boxes in 4 hours.\n\n${hb.individual
          .map((n) => {
            return `:package: ${n}`;
          })
          .join(", ")}`
      )
      .setFooter(`New total: ${hb.total}`)
      .setColor(`#40BD66`);
    msg.channel.send(embed);
  };
}
