import { Message, MessageEmbed } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { BaseCommand } from "../../structures/command/Command";
import * as jumble from "../../assets/jumble.json";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["jumble", "j"];
  playing: Set<string> = new Set<string>();
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
    if (this.playing.has(msg.author.id)) {
      await msg.channel.send(
        `<:red_x:741454361007357993> You're already playing Jumble.`
      );
      return;
    }

    this.playing.add(msg.author.id);
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
    /*process.on("SIGINT", async () => {
      await sent.delete();
      return;
    });*/

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
            `:white_check_mark: **Correct!**\nYou've been given <:cash:757146832639098930> **20**!`
          )
          .setColor(`#FFAACC`);
        await m.react("✅");

        await sent.edit(successEmbed);
        collector.stop("correct");
        return;
      } else {
        await m.react("741454361007357993");
      }
    });
    collector.on("end", async (collected, reason) => {
      try {
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
      } catch (e) {
      } finally {
        this.playing.delete(msg.author.id);
        return;
      }
    });
    return;
  }
}
