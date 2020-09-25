import { Message, TextChannel } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import trivia from "../../assets/trivia.json";
import Chance from "chance";
import { StatsService } from "../../database/service/StatsService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["trivia"];
  exec = async (msg: Message, executor: Profile) => {
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
        const xp = chance.integer({ min: 2, max: 6 });
        PlayerService.addXp(executor, xp);
        triviaMessage.edit(
          `:tada: **Correct!**\n+ **${xp}** XP` //\nYou were awarded <:coin:745447920072917093> **${profit}**.`
        );
        msg.react("✅");

        //await PlayerService.addCoinsToProfile(executor, profit);
        return collect.stop("correct");
      } else m.react("741454361007357993");
    });
    collect.on("end", async (collected, reason) => {
      if (reason != "correct") {
        msg.react("741454361007357993");

        triviaMessage.edit(
          `<:red_x:741454361007357993> You didn't get the answer in time. :confused:`
        );
      }
      try {
        if (
          msg.guild?.member(msg.client.user!)?.hasPermission("MANAGE_MESSAGES")
        )
          await channel.bulkDelete(collected);
      } catch (e) {
        // Ignore 'Unknown Message' - doesn't matter
      }
      StatsService.triviaComplete(
        executor,
        reason === "correct" ? true : false
      );
    });
  };
}
