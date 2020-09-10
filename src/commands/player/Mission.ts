import { GameCommand } from "../../structures/command/GameCommand";
import { Message } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { StatsService } from "../../database/service/StatsService";

export class Command extends GameCommand {
  names: string[] = ["mission"];
  usage: string[] = ["%c <card reference>"];
  desc: string = "Sets a card on a mission, giving you some coins in return.";
  category: string = "player";

  exec = async (msg: Message) => {
    if (!this.prm[0]) {
      msg.channel.send("<:red_x:741454361007357993> Please specify a card.");
      return;
    }
    const mission = await PlayerService.doMission(msg.author.id, {
      abbreviation: this.prm[0].split("#")[0],
      serial: parseInt(this.prm[0].split("#")[1]),
    });

    StatsService.incrementStat("missions_complete");
    msg.channel.send(
      (mission.lucky ? `:star: Your card has gained a star!\n` : ``) +
        mission.result
          .replace(
            "%M",
            `**${mission.card.member.replace(/ *\([^)]*\) */g, "")}**`
          )
          .replace(`%C`, `<:coin:745447920072917093> **${mission.profit}**`)
    );
  };
}
