import { Message, MessageEmbed } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { StatsService } from "../../database/service/StatsService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["top"];
  async exec(msg: Message, executor: Profile) {
    let embed = new MessageEmbed();
    let description = "";
    switch (this.options[0]?.toLowerCase()) {
      case "cards": {
        const topCollectors = await PlayerService.getTopCollectors();
        const totalCards = await StatsService.getNumberOfCards();
        for (let profile of topCollectors) {
          const user = msg.client.users.cache.get(profile.profile.discord_id);
          const count = await PlayerService.getCardCountByProfile(
            profile.profile
          );
          description += `${topCollectors.indexOf(profile) + 1}) **${
            user?.username || "Unknown User"
          }** (${count.toLocaleString()} cards)\n`;
        }
        embed.setAuthor(
          `Cards Leaderboard | ${msg.author.tag}`,
          msg.author.displayAvatarURL()
        );
        embed.setFooter(
          `There are ${totalCards.toLocaleString()} cards in existence.`
        );
        break;
      }
      case "hearts": {
        const topHearts = await PlayerService.getTopHearts();
        const totalHearts = await StatsService.getNumberOfHearts();
        for (let profile of topHearts) {
          const user = msg.client.users.cache.get(profile.discord_id);
          description += `${topHearts.indexOf(profile) + 1}) **${
            user?.username || "Unknown User"
          }** (${profile.hearts.toLocaleString()} hearts)\n`;
        }
        embed.setAuthor(
          `Hearts Leaderboard | ${msg.author.tag}`,
          msg.author.displayAvatarURL()
        );
        embed.setFooter(
          `There are ${totalHearts.toLocaleString()} hearts in existence (excluding card hearts)`
        );
        break;
      }
      default: {
        const richestUsers = await PlayerService.getRichestUsers();
        const totalCoins = await StatsService.getNumberOfCoins();
        for (let profile of richestUsers) {
          const user = msg.client.users.cache.get(profile.discord_id);
          description += `${richestUsers.indexOf(profile) + 1}) **${
            user?.username || "Unknown User"
          }** (${profile.coins.toLocaleString()} cash)\n`;
        }
        embed.setAuthor(
          `Cash Leaderboard | ${msg.author.tag}`,
          msg.author.displayAvatarURL()
        );
        embed.setFooter(
          `There is ${totalCoins.toLocaleString()} cash in circulation.`
        );
        break;
      }
      /*default: {
        const topXp = await PlayerService.getTopXp();
        const totalXp = await StatsService.getNumberOfXp();
        for (let profile of topXp) {
          const user = msg.client.users.cache.get(profile.discord_id);
          description += `${topXp.indexOf(profile) + 1}) **${
            user?.username || "Unknown User"
          }** (${profile.xp.toLocaleString()} XP)\n`;
        }
        embed.setAuthor(
          `XP Leaderboard | ${msg.author.tag}`,
          msg.author.displayAvatarURL()
        );
        embed.setFooter(
          `There are ${totalXp.toLocaleString()} total experience points.`
        );
      }*/
    }
    embed.setDescription(description);
    embed.setColor(`#FFAACC`);
    msg.channel.send(embed);
  }
}
