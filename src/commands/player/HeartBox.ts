import { Message, MessageEmbed } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import Chance from "chance";
import * as error from "../../structures/Error";

export class Command extends BaseCommand {
  names: string[] = ["heartbox", "hb"];
  async exec(msg: Message, executor: Profile): Promise<void> {
    const last = executor.lastHeartBox;

    const now = Date.now();
    if (now < last + 14400000)
      throw new error.HeartBoxCooldownError(last + 14400000, now);

    const chance = new Chance();
    let generated: number[] = [];
    for (let i = 0; i < 7; i++) {
      generated.push(chance.weighted([7, 20, 100, 1000], [130, 20, 3, 0.1]));
    }

    const total = generated.reduce((a, b) => {
      return a + b;
    });
    await Promise.all([
      PlayerService.addHeartsToProfile(executor, total),
      PlayerService.setLastHeartBox(executor, now),
    ]);

    //const xp = chance.integer({ min: 30, max: 65 });
    //PlayerService.addXp(executor, xp);
    const embed = new MessageEmbed()
      .setAuthor(
        `Heart Boxes | ${msg.author.tag}`,
        msg.author.displayAvatarURL()
      )
      .setDescription(
        `:gift_heart: You opened some heart boxes and received ${this.config.discord.emoji.hearts.full} **${total}**!` //\n+ **${xp}** XP`
      )
      .setFooter(
        `You now have ${
          executor.hearts + total
        } hearts.\nYou can open heart boxes again in 4 hours.`
      )
      .setColor(`#FFAACC`);
    await msg.channel.send(embed);
  }
}
