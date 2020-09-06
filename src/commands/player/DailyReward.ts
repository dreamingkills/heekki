import { GameCommand } from "../../structures/command/GameCommand";
import { Message } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";

export class Command extends GameCommand {
  names: string[] = ["daily"];
  usage: string[] = ["%c"];
  desc: string = "Claims your daily reward.";
  category: string = "player";

  exec = async (msg: Message) => {
    const daily = await PlayerService.claimDaily(msg.author.id);

    await msg.channel.send(
      `:white_check_mark: You claimed your daily reward today and received <:coin:745447920072917093> **${daily.added}**!\nYour current balance is <:coin:745447920072917093> **${daily.total}**.`
    );
    return;
  };
}
