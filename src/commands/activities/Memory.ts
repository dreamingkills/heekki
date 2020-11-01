import { Message, MessageEmbed } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { BaseCommand } from "../../structures/command/Command";
import * as jumble from "../../assets/jumble.json";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["memory"];
  playing: Set<string> = new Set<string>();

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
    if (this.playing.has(msg.author.id)) {
      await msg.channel.send(
        `<:red_x:741454361007357993> You're already playing Memory.`
      );
      return;
    }
    this.playing.add(msg.author.id);
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
        if (parseInt(m.content) === sequence.indexOf(objective) + 1)
          collector.stop("success");
      });

      collector.on("end", async (c, reason) => {
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
            await PlayerService.addCoinsToProfile(executor, 40);
            await sent.edit(
              embed.setDescription(
                `:white_check_mark: **Correct!**\nYou've been given <:cash:757146832639098930> **40**!`
              )
            );
          }
        } catch (e) {
        } finally {
          this.playing.delete(msg.author.id);
          return;
        }
      });
    }, 5000);
  }
}
