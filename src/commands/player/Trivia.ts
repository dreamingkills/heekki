import { GameCommand } from "../../structures/command/GameCommand";
import { Message, TextChannel } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import trivia from "../../assets/trivia.json";
import Chance from "chance";

export class Command extends GameCommand {
  names: string[] = ["trivia"];
  usage: string[] = ["%c"];
  desc: string = "Gives you a random question to answer for points.";
  category: string = "player";

  exec = async (msg: Message) => {
    const chance = new Chance();
    const triviaSelect = chance.pickone(trivia.trivia);
    const channel = msg.channel as TextChannel;

    const triviaMessage = await channel.send(
      `:information_source: **Trivia Time!**\n${triviaSelect.question}`
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
        msg.react("✅");
        triviaMessage.edit(
          `:tada: **Correct!**\nYou were rewarded <:coin:745447920072917093> **${profit}**.`
        );
        PlayerService.addCoinsToUserByDiscordId(msg.author.id, profit);

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
      channel.bulkDelete(collected);
    });

    return;
  };
}
