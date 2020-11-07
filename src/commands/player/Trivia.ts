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
        `${this.config.discord.emoji.cross.full} Finish your current trivia before starting another!`
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

    /*const profit = chance.integer({
      min: triviaSelect.reward.min,
      max: triviaSelect.reward.max,
    });*/

    const collect = channel.createMessageCollector(
      (m: Message) => m.author == msg.author,
      {
        time: 15000,
      }
    );
    collect.on("collect", async (m: Message) => {
      if (triviaSelect.answer.indexOf(m.content.toLowerCase()) >= 0) {
        //const xp = chance.integer({ min: 2, max: 6 });
        //PlayerService.addXp(executor, xp);
        await triviaMessage.edit(
          `:tada: **Correct!**` //\n+ **${xp}** XP` //\nYou were awarded <:coin:745447920072917093> **${profit}**.`
        );

        //await PlayerService.addCoinsToProfile(executor, profit);
        collect.stop("correct");
        if (this.permissions.ADD_REACTIONS)
          await msg.react(this.config.discord.emoji.check.id);
      } else await m.react(this.config.discord.emoji.cross.id);
    });
    collect.on("end", async (collected, reason) => {
      ConcurrencyService.unsetConcurrency(msg.author.id);

      if (reason != "correct") {
        await msg.react(this.config.discord.emoji.cross.id);
        await triviaMessage.edit(
          `${this.config.discord.emoji.cross.full} You didn't get the answer in time. :confused:`
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
