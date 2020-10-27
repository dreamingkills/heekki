import { Message, MessageEmbed, MessageReaction, User } from "discord.js";
import { StatsService } from "../../database/service/StatsService";
import { WellService } from "../../database/service/WellService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import * as error from "../../structures/Error";
import { profile } from "console";
import { UserCardService } from "../../database/service/UserCardService";
import { PlayerService } from "../../database/service/PlayerService";

export class Command extends BaseCommand {
  names: string[] = ["well"];
  async exec(msg: Message, executor: Profile) {
    const subcommand = this.options[0];
    switch (subcommand) {
      case "give": {
        const amount = parseInt(this.options[1]);
        if (isNaN(amount) || amount <= 0) throw new error.NotANumberError();
        if (amount > executor.coins)
          throw new error.NotEnoughCoinsError(executor.coins, amount);

        const confirmation = await msg.channel.send(
          `:warning: Really throw **${amount}** <:cash:757146832639098930> in the well?\nThis action is **irreversible**! React with :white_check_mark: to confirm.`
        );

        confirmation.react("✅");
        const filter = (reaction: MessageReaction, user: User) => {
          return reaction.emoji.name === "✅" && user.id == msg.author.id;
        };
        const reactions = confirmation.createReactionCollector(filter, {
          max: 1,
          time: 15000,
        });

        reactions.on("collect", async () => {
          await PlayerService.addToWell(executor, amount);
          await PlayerService.removeCoinsFromProfile(executor, amount);
          confirmation.edit(
            `:white_check_mark: Threw **${amount}** <:cash:757146832639098930> in the well.`
          );
        });
        reactions.on(
          "end",
          async (reaction: MessageReaction, reason: string) => {
            if (reason !== "limit") {
              console.log(reason);
              confirmation.edit(
                `<:red_x:741454361007357993> You didn't react in time.`
              );
              if (this.permissions.MANAGE_MESSAGES)
                confirmation.reactions.removeAll();
            }
          }
        );
        break;
      }
      case "top": {
        const topDonators = await WellService.getTopDonators();
        const total = await StatsService.getNumberOfProfiles();
        const userRank = await WellService.getWellRank(executor);
        const embed = new MessageEmbed()
          .setAuthor(
            `Well of Goodwill - Top | ${msg.author.tag}`,
            msg.author.displayAvatarURL()
          )
          .setDescription(
            topDonators.map((t) => {
              const user = msg.client.users.cache.get(t.discord_id);
              return `**${topDonators.indexOf(t) + 1})** ${
                user?.username || "Unknown User"
              } - **${t.well.toLocaleString()}**`;
            })
          )
          .setFooter(`You're ranked #${userRank}/${total}.`)
          .setColor(`#FFAACC`);
        await msg.channel.send(embed);
        break;
      }
      default: {
        const requirement = 15000000;
        const current = await WellService.getWellTotal();
        const percentage = (current / requirement) * 100;
        const steps = Math.floor((current / requirement) * 100) / 10;

        const pinkMids = steps < 10 ? (steps - 1 < 0 ? 0 : steps - 1) : 8;
        const greyMids = 8 - pinkMids;

        const progressBar = `${
          steps >= 1 ? "<:p1f:770016617228140554>" : "<:p1e:770016617262219295>"
        }${"<:p2f:770016616754184223>".repeat(
          pinkMids
        )}${"<:p2e:770016617224077342>".repeat(greyMids)}${
          steps >= 10
            ? "<:p3f:770016617190391808>"
            : "<:p3e:770016617199042560>"
        } [ **${percentage.toFixed(2)}%** ]`;
        const embed = new MessageEmbed()
          .setAuthor(
            `Well of Goodwill | ${msg.author.tag}`,
            msg.author.displayAvatarURL()
          )
          .setDescription(
            `:fountain: The **Well of Goodwill** is a crowdsourced charity project.\n` +
              `\n${progressBar}` +
              `\n**${current.toLocaleString()}** / **${requirement.toLocaleString()}**` +
              `\nNext reward: **Card pack**\n` +
              `\n\`\`\`` +
              `\n!well give <amount> - throw money in the well` +
              `\n!well top - see top donators` +
              `\n\`\`\``
          )
          .setColor(`#FFAACC`)
          .setFooter(
            `You've thrown ${executor.well.toLocaleString()} cash into the well.`
          );
        await msg.channel.send(embed);
        break;
      }
    }
    return;
  }
}
