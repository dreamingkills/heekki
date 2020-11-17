import { Message, MessageEmbed } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import { ConcurrencyService } from "../../helpers/Concurrency";

export class Command extends BaseCommand {
  names: string[] = ["memory", "mem"];

  makeup: string[] = [
    ":rabbit:",
    ":cat:",
    ":dove:",
    ":deer:",
    ":frog:",
    ":owl:",
    ":fish:",
    ":bat:",
    ":swan:",
    ":penguin:",
    ":butterfly:",
    ":wolf:",
  ];

  async exec(msg: Message, executor: Profile) {
    if (ConcurrencyService.checkConcurrency(msg.author.id)) {
      await msg.channel.send(
        `${this.config.discord.emoji.cross.full} You're already playing a minigame!`
      );
      return;
    }
    ConcurrencyService.setConcurrency(msg.author.id);

    const sequence: string[] = [];
    let iterations = 0;
    while (sequence.length < 5) {
      if (iterations === 25) {
        await msg.channel.send("An error occurred.");
        return;
      }
      iterations++;
      const random = this.makeup[
        Math.floor(Math.random() * this.makeup.length)
      ];
      if (sequence.indexOf(random) > -1) {
        continue;
      } else {
        sequence.push(random);
      }
    }

    const objective = sequence[Math.floor(Math.random() * sequence.length)];
    const embed = new MessageEmbed()
      .setAuthor(`Memory | ${msg.author.tag}`, msg.author.displayAvatarURL())
      .setDescription(
        `**Remember this sequence!**\nYou have 5 seconds!\n` +
          `\n${sequence.join(" - ")}` +
          `\n:one: - :two: - :three: - :four: - :five:`
      )
      .setColor(`#FFAACC`)
      .setFooter(`Iterations: ${iterations}`);

    const sent = await msg.channel.send(embed);
    setTimeout(async () => {
      await sent.edit(embed.setDescription(`Which number was ${objective}?`));

      const filter = (m: Message) => {
        return m.author === msg.author;
      };
      const collector = msg.channel.createMessageCollector(filter, {
        time: 60000,
        max: 1,
      });
      collector.on("collect", async (m: Message) => {
        if (sent.deleted) collector.stop("deleted");
        if (parseInt(m.content) === sequence.indexOf(objective) + 1)
          collector.stop("success");
      });

      collector.on("end", async (_, reason) => {
        try {
          if (reason === "time") {
            await sent.edit(
              embed.setDescription(
                `:confused: **You ran out of time.**\nThe answer was: **${
                  sequence.indexOf(objective) + 1
                }**`
              )
            );
          } else if (reason === "limit") {
            await sent.edit(
              embed.setDescription(
                `:confused: **Incorrect!**\nThe answer was: **${
                  sequence.indexOf(objective) + 1
                }**`
              )
            );
          } else if (reason === "success") {
            await PlayerService.addCoinsToProfile(executor, 4);
            await sent.edit(
              embed.setDescription(
                `${this.config.discord.emoji.check.full} **Correct!**\nYou've been given ${this.config.discord.emoji.cash.full} **4**!`
              )
            );
          }
        } catch (e) {
        } finally {
          ConcurrencyService.unsetConcurrency(msg.author.id);
          return;
        }
      });
    }, 5000);
  }
}
