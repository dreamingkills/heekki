import { Message, MessageEmbed } from "discord.js";
import { BaseCommand } from "../../structures/command/Command";
import { StatsService } from "../../database/service/StatsService";
import version from "../../version.json";

export class Command extends BaseCommand {
  names: string[] = ["stats"];
  exec = async (msg: Message) => {
    if (this.options[0] === "me") {
      const stats = await StatsService.getUserStats(msg.author.id);
      return console.log(stats);
    }
    let stats = await StatsService.getGlobalStats();

    const uptime = msg.client.uptime! / 1000 / 60;
    let embed = new MessageEmbed()
      .setAuthor(`Global Statistics`)
      .addField(
        `Card stats`,
        `Total cards: **${stats.totalCards.total}**\nForfeited cards: **${stats.totalOrphaned}**\n6 :star:: **${stats.totalCards.sixStars}**\n5 :star:: **${stats.totalCards.fiveStars}**\n4 :star:: **${stats.totalCards.fourStars}**\n3 :star:: **${stats.totalCards.threeStars}**\n2 :star:: **${stats.totalCards.twoStars}**\n1 :star:: **${stats.totalCards.oneStar}**`,
        true
      )
      .addField(
        `Profile stats`,
        `Total profiles: **${stats.totalProfiles}**\nRelationship count: **${stats.totalRelationships}**\nRichest user: <@${stats.richestUser.id}> (**${stats.richestUser.coins}** coins)\nTop collector: <@${stats.topCollector.id}> (**${stats.topCollector.cards}** cards)`,
        true
      )
      .addField(
        `Miscellaneous stats`,
        `triviaCorrect: **${stats.triviaCorrect}**\ntriviaWrong: **${stats.triviaWrong}**\nmarketSales: **${stats.marketSales}**\ntradesComplete: **${stats.tradesComplete}**\nmissionsComplete: **${stats.missionsComplete}**\ntotalCoins: **${stats.totalCoins}**`,
        true
      )
      .addField(
        `Bot stats`,
        `Guilds cached: **${msg.client.guilds.cache.size}**\nUsers cached: **${
          msg.client.users.cache.size
        }**\nUptime in minutes: **${uptime.toFixed(2)}**`,
        true
      )
      .setColor("#40BD66")
      .setFooter(`loonacards v${version.version}`);
    msg.channel.send(embed);
  };
}
