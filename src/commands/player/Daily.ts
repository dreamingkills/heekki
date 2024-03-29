import { Message, MessageEmbed } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import * as error from "../../structures/Error";

export class Command extends BaseCommand {
  names: string[] = ["daily", "d"];
  async exec(msg: Message, executor: Profile) {
    const interval = 10;
    const last = executor.lastDaily;
    const now = Date.now();

    if (now < last + (86400000 - 1800000))
      throw new error.DailyCooldownError(last + (86400000 - 1800000), now);

    let broken: boolean = false;
    if (executor.dailyStreak > 0 && now > last + 172800000) broken = true;

    await PlayerService.setLastDaily(executor, now);

    if (broken) await PlayerService.resetDailyStreak(executor);
    await PlayerService.incrementDailyStreak(executor);

    let shards = 3;
    let milestone = false;
    const nextMilestone =
      Math.ceil((executor.dailyStreak + 1 + 0.1) / interval) * interval;
    if (!broken && (executor.dailyStreak + 1) % interval === 0) {
      const additional = Math.ceil(Math.pow(1.04, executor.dailyStreak + 1));
      shards += additional > 17 ? 17 : additional;
      milestone = true;
    }

    await PlayerService.addCoinsToProfile(executor, 100);
    const newProfile = await PlayerService.addShardsToProfile(executor, shards);

    let desc =
      `${broken ? `:confused: **Your daily streak has been reset.**` : ``}` +
      `${!broken ? `:gift: You claimed your daily reward!` : ``}` +
      `\n**+ ${
        this.bot.config.discord.emoji.shard.full
      } ${shards.toLocaleString()}** *(${
        milestone ? `${shards - 3} bonus, ` : ``
      }${newProfile.shards.toLocaleString()} total)*` +
      `\n**+ ${
        this.bot.config.discord.emoji.cash.full
      } 100** *(${newProfile.coins.toLocaleString()} total)*`;
    const embed = new MessageEmbed()
      .setAuthor(
        `Daily Reward | ${msg.author.tag}`,
        msg.author.displayAvatarURL()
      )
      .setDescription(desc)
      .setFooter(
        `Streak: ${(newProfile.dailyStreak || 1).toLocaleString()}/${(
          nextMilestone || 10
        ).toLocaleString()}\nYou can claim your daily reward again in 24 hours.`
      )
      .setColor(`#FFAACC`);
    await msg.channel.send(embed);
  }
}
