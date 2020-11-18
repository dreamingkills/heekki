import { Message, MessageEmbed } from "discord.js";
import { BaseCommand } from "../../structures/command/Command";
import { StatsService } from "../../database/service/StatsService";
import version from "../../version.json";
import { Profile } from "../../structures/player/Profile";
import moment from "moment";

export class Command extends BaseCommand {
  names: string[] = ["stats"];
  async exec(msg: Message, executor: Profile) {
    if (this.options[0] === "me") {
      const [purchases, sales] = [
        await StatsService.getUserPurchases(executor),
        await StatsService.getUserSales(executor),
      ];
      const trades = await StatsService.getUserTrades(executor);
      const missions = await StatsService.getUserMissions(executor);

      const trivias = await StatsService.getUserTrivias(executor);
      const jumbles = await StatsService.getUserJumbles(executor);
      const memories = await StatsService.getUserMemories(executor);

      const embed = new MessageEmbed()
        .setAuthor(
          `User Stats | ${msg.author.tag}`,
          msg.author.displayAvatarURL()
        )
        .setDescription(
          `Statistics are accurate as of **2020-11-17** (version **3.0.1**).` +
            `\nYour User ID is **${msg.author.id}**.`
        )
        .setColor(`#FFAACC`);
      embed.addField(
        `:money_with_wings: Economy`,
        `\n**Marketplace**` +
          `\n— Purchases: **${purchases}**` +
          `\n— Sales: **${sales}**` +
          `\n**Missions** (${missions.length})` +
          `\n— Success: **${missions.filter((m) => m.success).length}**` +
          `\n— Failed: **${missions.filter((m) => !m.success).length}**` +
          `\n**Trades**: **${trades}**`,
        true
      );
      embed.addField(
        `:mag_right: Minigames`,
        `**Jumble** (${jumbles.length})` +
          `\n— Correct: **${jumbles.filter((j) => j.correct).length}**` +
          `\n— Incorrect: **${jumbles.filter((j) => !j.correct).length}**` +
          `\n**Memory** (${memories.length})` +
          `\n— Correct: **${memories.filter((m) => m.correct).length}**` +
          `\n— Incorrect: **${memories.filter((m) => !m.correct).length}**` +
          `\n**Trivia** (${trivias.length})` +
          `\n— Correct: **${trivias.filter((t) => t.correct).length}**` +
          `\n— Incorrect: **${trivias.filter((t) => !t.correct).length}**`,
        true
      );
      await msg.channel.send(embed);
      return;
    }
    const now = Date.now();
    const diff = moment(now).diff(new Date(1599368400000), "days");

    const totalCards = {
      total: await StatsService.getNumberOfCards(),
      six: await StatsService.getNumberOfCards(6),
      five: await StatsService.getNumberOfCards(5),
    };
    const totalProfiles = await StatsService.getNumberOfProfiles();
    const totalRelationships = await StatsService.getNumberOfRelationships();

    const embed = new MessageEmbed()
      .setAuthor(
        `Heekki Stats | ${msg.author.tag}`,
        msg.author.displayAvatarURL()
      )
      .setDescription(
        `Heekki is **${diff}** days old!\n*since 2020-09-06 @ 1AM EST*`
      )
      .setFooter(`loonacards v${version.version}`)
      .setColor(`#FFAACC`);
    embed.addField(
      `Bot Stats`,
      `Guilds cached: **${msg.client.guilds.cache.size}**\nUsers cached: **${msg.client.users.cache.size}**`,
      true
    );
    embed.addField(
      `Card Stats`,
      `Total cards: **${totalCards.total}**\n:star: 6: **${totalCards.six}**\n:star: 5: **${totalCards.five}**`,
      true
    );
    embed.addField(
      `User Stats`,
      `Registered users: **${totalProfiles}**\nRelationships: **${totalRelationships}**`,
      true
    );
    await msg.channel.send(embed);
  }
}
