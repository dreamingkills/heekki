import { Message, TextChannel } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import trivia from "../../assets/trivia.json";
import Chance from "chance";
import { StatsService } from "../../database/service/StatsService";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["trivia"];
  usage: string[] = ["%c"];
  desc: string = "Gives you a random question to answer for points.";
  category: string = "player";

  exec = async (msg: Message) => {
    const chance = new Chance();
    const triviaSelect = chance.pickone(trivia.trivia);
    const channel = msg.channel as TextChannel;

    const triviaMessage = await channel.send(
      `:information_source: **Trivia Time!** ${msg.author}\n${triviaSelect.question}`
    );

    const profit = chance.integer({
      min: triviaSelect.reward.min,
      max: triviaSelect.reward.max,
    });

    const collect = channel.createMessageCollector(
      (m: Message) => m.author == msg.author,
      {
        time: 15000,
      }
    );
    collect.on("collect", async (m: Message) => {
      if (triviaSelect.answer.indexOf(m.content.toLowerCase()) >= 0) {
        triviaMessage.edit(
          `:tada: **Correct!**\nYou were awarded <:coin:745447920072917093> **${profit}**.`
        );
        msg.react("✅");

        await PlayerService.addCoinsToUserByDiscordId(msg.author.id, profit);
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
      const msgs = collected.filter((m) => !m.deleted);
      try {
        if (
          msg.guild?.member(msg.client.user!)?.hasPermission("MANAGE_MESSAGES")
        )
          (<TextChannel>msg.channel).bulkDelete(msgs);
      } catch (e) {
        // Ignore 'Unknown Message' - doesn't matter
      }
      StatsService.triviaComplete(
        msg.author.id,
        reason === "correct" ? true : false
      );
    });
  };
}
