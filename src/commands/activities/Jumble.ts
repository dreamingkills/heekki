import { Message, MessageEmbed } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { BaseCommand } from "../../structures/command/Command";
import * as jumble from "../../assets/jumble.json";
import { Profile } from "../../structures/player/Profile";
import { ConcurrencyService } from "../../helpers/Concurrency";
import { StatsService } from "../../database/service/StatsService";

export class Command extends BaseCommand {
  names: string[] = ["jumble", "j"];
  description: string =
    `**Jumble** is a minigame where the objective is to unscramble a random word.` +
    `\nYou have 15 seconds, and are rewarded $EMOJI_CASH$ **2** for guessing correctly.`;

  async exec(msg: Message, executor: Profile) {
    const isMulti = this.options[0]?.toLowerCase() === "multi";
    if (ConcurrencyService.checkConcurrency(msg.author.id)) {
      await msg.channel.send(
        `${this.bot.config.discord.emoji.cross.full} You're already playing a minigame!`
      );
      return;
    }
    ConcurrencyService.setConcurrency(msg.author.id);

    const random =
      jumble.terms[Math.floor(Math.random() * jumble.terms.length)];
    const jumbled = this.jumble(random);

    const embed = new MessageEmbed()
      .setAuthor(
        `Jumble${isMulti ? ` Multi` : ``} | ${msg.author.tag}`,
        msg.author.displayAvatarURL()
      )
      .setDescription(
        `**Unscramble this word for a reward!**` +
          `\n:mag_right: \`${jumbled.toUpperCase()}\``
      )
      .setColor(`#FFAACC`);

    const sent = await msg.channel.send(embed);

    const filter = (m: Message) => {
      if (isMulti) {
        return !m.author.bot;
      } else return m.author === msg.author;
    };
    const collector = msg.channel.createMessageCollector(filter, {
      time: 15000,
    });

    collector.on("collect", async (m: Message) => {
      if (sent.deleted) collector.stop("deleted");
      if (
        (isMulti &&
          !ConcurrencyService.checkConcurrency(m.author.id) &&
          m.author !== msg.author) ||
        m.author === msg.author ||
        !isMulti
      ) {
        if (!collector.ended) {
          if (m.content.toLowerCase() === random.toLowerCase()) {
            let winner: Profile;
            if (isMulti) {
              winner = await PlayerService.getProfileByDiscordId(m.author.id);
            } else winner = executor;
            const newProfile = await PlayerService.addCoinsToProfile(winner, 2);
            const successEmbed = new MessageEmbed()
              .setAuthor(
                `Jumble${isMulti ? ` Multi` : ``} | ${msg.author.tag}`,
                msg.author.displayAvatarURL()
              )
              .setDescription(
                `${
                  this.bot.config.discord.emoji.check.full
                } **Correct!**\n**+ ${
                  this.bot.config.discord.emoji.cash.full
                } 2**${
                  isMulti ? ` to <@${winner.discord_id}>` : ``
                } *(${newProfile.coins.toLocaleString()} total)*`
              )
              .setColor(`#FFAACC`);

            if (this.permissions.ADD_REACTIONS)
              await m.react(this.bot.config.discord.emoji.check.id);

            await StatsService.jumbleComplete(executor, true);
            await sent.edit(successEmbed);
            collector.stop("correct");
          } else {
            if (this.permissions.ADD_REACTIONS)
              await m.react(this.bot.config.discord.emoji.cross.id);
          }
        }
      }
    });

    collector.on("end", async (_, reason) => {
      try {
        let failedEmbed: MessageEmbed | undefined;
        ConcurrencyService.unsetConcurrency(msg.author.id);

        if (reason === "time") {
          failedEmbed = new MessageEmbed()
            .setAuthor(
              `Jumble${isMulti ? ` Multi` : ``} | ${msg.author.tag}`,
              msg.author.displayAvatarURL()
            )
            .setDescription(
              `:confused: **You ran out of time.**\nThe word was: \`${random.toUpperCase()}\`.`
            )
            .setColor(`#FFAACC`);
        }
        if (failedEmbed) {
          try {
            await StatsService.jumbleComplete(executor, false);
            await sent.edit(failedEmbed);
          } catch {
            await msg.channel.send(failedEmbed);
          }
        }
      } catch {
      } finally {
        ConcurrencyService.unsetConcurrency(msg.author.id);
      }
    });
  }

  private jumble(term: string): string {
    const words = term.split(" ");
    let final = "";
    for (let word of words) {
      const split = word.split("");
      let j, x, i;
      for (i = split.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = split[i];
        split[i] = split[j];
        split[j] = x;
      }
      final += ` ${split.join("")}`;
    }

    final = final.trim();

    if (final === term.trim()) return this.jumble(term);
    else return final;
  }
}
