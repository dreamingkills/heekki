import { Message, MessageEmbed } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { BaseCommand } from "../../structures/command/Command";
import * as jumble from "../../assets/jumble.json";
import { Profile } from "../../structures/player/Profile";
import { ConcurrencyService } from "../../helpers/Concurrency";

export class Command extends BaseCommand {
  names: string[] = ["jumble", "j"];
  jumble(term: string): string {
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
    return final.trim();
  }

  async exec(msg: Message, executor: Profile) {
    if (ConcurrencyService.checkConcurrency(msg.author.id)) {
      await msg.channel.send(
        `${this.config.discord.emoji.cross.full} You're already playing a minigame!`
      );
      return;
    }
    ConcurrencyService.setConcurrency(msg.author.id);

    const random =
      jumble.terms[Math.floor(Math.random() * jumble.terms.length)];
    const jumbled = this.jumble(random);

    const embed = new MessageEmbed()
      .setAuthor(`Jumble | ${msg.author.tag}`, msg.author.displayAvatarURL())
      .setDescription(
        `**Unscramble this word for a reward!**` +
          `\n:mag_right: \`${jumbled.toUpperCase()}\``
      )
      .setColor(`#FFAACC`);

    const sent = await msg.channel.send(embed);

    const filter = (m: Message) => m.author == msg.author;
    const collector = msg.channel.createMessageCollector(filter, {
      time: 15000,
    });

    collector.on("collect", async (m: Message) => {
      if (m.content.toLowerCase() === random.toLowerCase()) {
        await PlayerService.addCoinsToProfile(executor, 20);
        const successEmbed = new MessageEmbed()
          .setAuthor(
            `Jumble | ${msg.author.tag}`,
            msg.author.displayAvatarURL()
          )
          .setDescription(
            `${this.config.discord.emoji.check.full} **Correct!**\nYou've been given ${this.config.discord.emoji.cash.full} **20**!`
          )
          .setColor(`#FFAACC`);
        await m.react(this.config.discord.emoji.check.id);

        await sent.edit(successEmbed);
        collector.stop("correct");
        return;
      } else {
        await m.react(this.config.discord.emoji.cross.id);
      }
    });
    collector.on("end", async (collected, reason) => {
      if (reason === "time") {
        const failedEmbed = new MessageEmbed()
          .setAuthor(
            `Jumble | ${msg.author.tag}`,
            msg.author.displayAvatarURL()
          )
          .setDescription(
            `:confused: **You ran out of time.**\nThe word was: \`${random.toUpperCase()}\`.`
          )
          .setColor(`#FFAACC`);
        await sent.edit(failedEmbed);
      }
      ConcurrencyService.unsetConcurrency(msg.author.id);
      return;
    });
    return;
  }
}
