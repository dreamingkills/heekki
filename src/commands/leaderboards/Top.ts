import { Cipher } from "crypto";
import { Message, MessageAttachment, MessageEmbed } from "discord.js";
import { CardService } from "../../database/service/CardService";
import { PlayerService } from "../../database/service/PlayerService";
import { ShopService } from "../../database/service/ShopService";
import { StatsService } from "../../database/service/StatsService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["top"];
  exec = async (msg: Message, executor: Profile) => {
    let embed = new MessageEmbed();
    let description = "";
    switch (this.options[0]?.toLowerCase()) {
      case "cash":
      case "coins": {
        const richestUsers = await PlayerService.getRichestUsers();
        const totalCoins = await StatsService.getNumberOfCoins();
        for (let profile of richestUsers) {
          const user = msg.client.users.cache.get(profile.discord_id);
          description += `${richestUsers.indexOf(profile) + 1}) **${
            user?.username
          }** (${this.commafyNumber(profile.coins)} cash)\n`;
        }
        embed.setAuthor(
          `Coins Leaderboard | ${msg.author.tag}`,
          msg.author.displayAvatarURL()
        );
        embed.setFooter(
          `There are ${this.commafyNumber(totalCoins)} coins in circulation.`
        );
        break;
      }
      case "cards": {
        const topCollectors = await PlayerService.getTopCollectors();
        const totalCards = await StatsService.getNumberOfCards();
        for (let profile of topCollectors) {
          const user = msg.client.users.cache.get(profile.profile.discord_id);
          description += `${topCollectors.indexOf(profile) + 1}) **${
            user?.username
          }** (${this.commafyNumber(profile.count)} cards)\n`;
        }
        embed.setAuthor(
          `Cards Leaderboard | ${msg.author.tag}`,
          msg.author.displayAvatarURL()
        );
        embed.setFooter(
          `There are ${this.commafyNumber(totalCards)} cards in existence.`
        );
        break;
      }
      case "hearts": {
        const topHearts = await PlayerService.getTopHearts();
        const totalHearts = await StatsService.getNumberOfHearts();
        for (let profile of topHearts) {
          const user = msg.client.users.cache.get(profile.discord_id);
          description += `${topHearts.indexOf(profile) + 1}) **${
            user?.username
          }** (${this.commafyNumber(profile.hearts)} hearts)\n`;
        }
        embed.setAuthor(
          `Hearts Leaderboard | ${msg.author.tag}`,
          msg.author.displayAvatarURL()
        );
        embed.setFooter(
          `There are ${this.commafyNumber(
            totalHearts
          )} hearts in existence (excluding card hearts)`
        );
        break;
      }
      default: {
        const topXp = await PlayerService.getTopXp();
        const totalXp = await StatsService.getNumberOfXp();
        for (let profile of topXp) {
          const user = msg.client.users.cache.get(profile.discord_id);
          description += `${topXp.indexOf(profile) + 1}) **${
            user?.username || "Unknown User"
          }** (${this.commafyNumber(profile.xp)} XP)\n`;
        }
        embed.setAuthor(
          `XP Leaderboard | ${msg.author.tag}`,
          msg.author.displayAvatarURL()
        );
        embed.setFooter(
          `There are ${this.commafyNumber(totalXp)} total experience points.`
        );
      }
    }
    embed.setDescription(description);
    embed.setColor(`#FFAACC`);
    msg.channel.send(embed);
  };
}
