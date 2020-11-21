import { Message, MessageEmbed } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { StatsService } from "../../database/service/StatsService";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["top"];
  async exec(msg: Message) {
    let embed = new MessageEmbed();
    let description = "";
    switch (this.options[0]?.toLowerCase()) {
      case "trivia": {
        const topTrivias = await PlayerService.getTopTrivias();
        for (let trivia of topTrivias) {
          let user;
          try {
            user = (await msg.client.users.fetch(trivia.discord_id)).username;
          } catch (e) {
            user = "Unknown User";
          }
          const count = (await StatsService.getUserTrivias(trivia)).filter(
            (j) => j.correct
          );
          description += `${
            topTrivias.indexOf(trivia) + 1
          }) **${user}** (${count.length.toLocaleString()} trivia)\n`;
          embed.setAuthor(
            `Trivia Leaderboard | ${msg.author.tag}`,
            msg.author.displayAvatarURL()
          );
        }
        break;
      }
      case "jumble": {
        const topJumblers = await PlayerService.getTopJumblers();
        for (let jumbler of topJumblers) {
          let user;
          try {
            user = (await msg.client.users.fetch(jumbler.discord_id)).username;
          } catch (e) {
            user = "Unknown User";
          }
          const count = (await StatsService.getUserJumbles(jumbler)).filter(
            (j) => j.correct
          );
          description += `${
            topJumblers.indexOf(jumbler) + 1
          }) **${user}** (${count.length.toLocaleString()} jumbles)\n`;
          embed.setAuthor(
            `Jumble Leaderboard | ${msg.author.tag}`,
            msg.author.displayAvatarURL()
          );
        }
        break;
      }
      case "memory": {
        const topMemories = await PlayerService.getTopMemories();
        for (let memory of topMemories) {
          let user;
          try {
            user = (await msg.client.users.fetch(memory.discord_id)).username;
          } catch (e) {
            user = "Unknown User";
          }
          const count = (await StatsService.getUserMemories(memory)).filter(
            (m) => m.correct
          );
          description += `${
            topMemories.indexOf(memory) + 1
          }) **${user}** (${count.length.toLocaleString()} memory)\n`;
          embed.setAuthor(
            `Memory Leaderboard | ${msg.author.tag}`,
            msg.author.displayAvatarURL()
          );
        }
        break;
      }
      case "cards": {
        const topCollectors = await PlayerService.getTopCollectors();
        const totalCards = await StatsService.getNumberOfCards();
        for (let profile of topCollectors) {
          let user;
          try {
            user = (await msg.client.users.fetch(profile.profile.discord_id))
              .username;
          } catch (e) {
            user = "Unknown User";
          }
          const count = await PlayerService.getCardCountByProfile(
            profile.profile
          );
          description += `${
            topCollectors.indexOf(profile) + 1
          }) **${user}** (${count.toLocaleString()} cards)\n`;
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
          let user;
          try {
            user = (await msg.client.users.fetch(profile.discord_id)).username;
          } catch (e) {
            user = "Unknown User";
          }
          description += `${
            topHearts.indexOf(profile) + 1
          }) **${user}** (${profile.hearts.toLocaleString()} hearts)\n`;
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
      case "cash": {
        const richestUsers = await PlayerService.getRichestUsers();
        const totalCoins = await StatsService.getNumberOfCoins();
        for (let profile of richestUsers) {
          let user;
          try {
            user = (await msg.client.users.fetch(profile.discord_id)).username;
          } catch (e) {
            user = "Unknown User";
          }
          description += `${
            richestUsers.indexOf(profile) + 1
          }) **${user}** (${profile.coins.toLocaleString()} cash)\n`;
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
      default: {
        const prefix = this.bot.getPrefix(msg.guild!.id);
        embed.setAuthor(
          `Leaderboards | ${msg.author.tag}`,
          msg.author.displayAvatarURL()
        );
        description =
          `${this.config.discord.emoji.cross.full} Please specify a leaderboard to look at.\n` +
          `\n**Available Leaderboards**` +
          `\n\`\`\`` +
          `\n${prefix}top trivia` +
          `\n${prefix}top jumble` +
          `\n${prefix}top memory` +
          `\n${prefix}top cash` +
          `\n${prefix}top hearts` +
          `\n${prefix}top cards` +
          `\n\`\`\``;
        break;
      }
    }
    embed.setDescription(description);
    embed.setColor(`#FFAACC`);
    await msg.channel.send(embed);
  }
}
