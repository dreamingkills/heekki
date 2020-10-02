import { Message, MessageEmbed } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import Chance from "chance";

export class Command extends BaseCommand {
  names: string[] = ["heartbox", "hb"];
  async exec(msg: Message, executor: Profile) {
    const hb = await PlayerService.openHeartBoxes(executor);

    const chance = new Chance();
    const xp = chance.integer({ min: 30, max: 65 });
    PlayerService.addXp(executor, xp);
    const embed = new MessageEmbed()
      .setAuthor(
        `Heart Boxes | ${msg.author.tag}`,
        msg.author.displayAvatarURL()
      )
      .setDescription(
        `:gift_heart: You opened some heart boxes and received **${hb.added}** <:heekki_heart:757147742383505488>\n+ **${xp}** XP`
      )
      .setFooter(
        `You now have ${hb.total} hearts.\nYou can open heart boxes again in 4 hours.`
      )
      .setColor(`#FFAACC`);
    msg.channel.send(embed);
  }
}
