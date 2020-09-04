import { GameCommand } from "../../structures/command/GameCommand";
import { Message } from "discord.js";
import { PlayerService } from "../../database/Player";

export class Command extends GameCommand {
  names: string[] = ["claimforfeit", "cf"];
  usage: string[] = ["%c <card reference>>"];
  desc: string = "Claims a forfeited card - usable once every 3 hours.";
  category: string = "card";

  exec = async (msg: Message) => {
    let ff = await PlayerService.claimOrphanedCard(msg.author.id, this.prm[0]);

    await msg.channel.send(
      `:white_check_mark: You claimed **${ff.abbreviation}#${ff.serialNumber}**!\nYou will not be able to claim another card for **3 hours**.`
    );
    return;
  };
}
