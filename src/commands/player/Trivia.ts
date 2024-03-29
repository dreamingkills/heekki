import { Message, TextChannel } from "discord.js";
import trivia from "../../assets/trivia.json";
import Chance from "chance";
import { StatsService } from "../../database/service/StatsService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import { ConcurrencyService } from "../../helpers/Concurrency";

export class Command extends BaseCommand {
  names: string[] = ["trivia", "tr"];
  currentlyPlaying: Set<string> = new Set<string>();

  async exec(msg: Message, executor: Profile) {
    if (ConcurrencyService.checkConcurrency(msg.author.id)) {
      await msg.channel.send(
        `${this.bot.config.discord.emoji.cross.full} You're already playing a minigame!`
      );
      return;
    }
    ConcurrencyService.setConcurrency(msg.author.id);

    const chance = new Chance();
    const triviaSelect = chance.pickone(trivia.trivia);
    const channel = msg.channel as TextChannel;

    const triviaMessage = await channel.send(
      `:information_source: **Trivia Time!** ${msg.author}\n${triviaSelect.question}`
    );

    const collect = channel.createMessageCollector(
      (m: Message) => m.author == msg.author,
      {
        time: 15000,
      }
    );
    collect.on("collect", async (m: Message) => {
      if (!collect.ended) {
        if (triviaSelect.answer.indexOf(m.content.toLowerCase()) >= 0) {
          await triviaMessage.edit(`:tada: **Correct!**`);

          collect.stop("correct");
          if (this.permissions.ADD_REACTIONS)
            await msg.react(this.bot.config.discord.emoji.check.id);
        } else await m.react(this.bot.config.discord.emoji.cross.id);
      }
    });
    collect.on("end", async (collected, reason) => {
      ConcurrencyService.unsetConcurrency(msg.author.id);

      if (reason != "correct") {
        await msg.react(this.bot.config.discord.emoji.cross.id);
        await triviaMessage.edit(
          `${this.bot.config.discord.emoji.cross.full} You didn't get the answer in time. :confused:`
        );
      }
      if (this.permissions.MANAGE_MESSAGES) await channel.bulkDelete(collected);
      await StatsService.triviaComplete(
        executor,
        reason === "correct" ? true : false
      );
    });
  }
}
