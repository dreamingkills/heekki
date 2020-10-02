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
      const stats = await StatsService.getUserStats(executor);
      const embed = new MessageEmbed()
        .setAuthor(
          `User Stats | ${msg.author.tag}`,
          msg.author.displayAvatarURL()
        )
        .setDescription(`Trades: **${stats.tradesComplete}**`)
        .setColor(`#FFAACC`);
      embed.addField(
        `Trivia`,
        `Correct: **${stats.triviaCorrect}**\nIncorrect: **${
          stats.triviaIncorrect
        }**\nTotal: **${stats.triviaIncorrect + stats.triviaCorrect}**`,
        true
      );
      embed.addField(
        `Marketplace`,
        `Purchases: **${stats.marketPurchases}**\nSales: **${
          stats.marketSales
        }**\nTotal: **${stats.marketPurchases + stats.marketSales}**`,
        true
      );
      embed.addField(
        `Missions`,
        `Successful: **${stats.missionsSuccessful}**\nFailed: **${
          stats.missionsFailed
        }**\nTotal: **${stats.missionsFailed + stats.missionsSuccessful}**`,
        true
      );
      msg.channel.send(embed);
      return;
    }
    const now = Date.now();
    const diff = moment(now).diff(moment("20200906"), "days");

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
      .setDescription(`Heekki is **${diff}** days old!`)
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
    msg.channel.send(embed);
  }
}
