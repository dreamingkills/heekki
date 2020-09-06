import { Message, MessageEmbed } from "discord.js";
import { BaseCommand } from "../../structures/command/Command";
import { StatsFetch } from "../../database/sql/stats/StatsFetch";
import { StatsService } from "../../database/service/StatsService";

export class Command extends BaseCommand {
  names: string[] = ["stats"];
  usage: string[] = ["%c"];
  desc: string = "Posts various stats collected from the bot.";
  category: string = "misc";

  exec = async function (msg: Message) {
    let stats = await StatsFetch.getStats();
    const miscStats = await StatsService.getMiscStats();

    let embed = new MessageEmbed()
      .setAuthor(`HaSeul Statistics`)
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
        `triviaCorrect: **${miscStats.triviaCorrect}**\ntriviaWrong: **${miscStats.triviaWrong}**\nmarketSales: **${miscStats.marketSales}**\ntradesComplete: **${miscStats.tradesComplete}**`,
        true
      )
      .setColor("#40BD66");
    await msg.channel.send(embed);
    return;
  };
}
