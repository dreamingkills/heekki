import { Message } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["claimforfeit", "cf"];
  usage: string[] = ["%c <card reference>>"];
  desc: string = "Claims a forfeited card - usable once every 3 hours.";
  category: string = "card";

  exec = async (msg: Message) => {
    let ff = await PlayerService.claimOrphanedCard(msg.author.id, {
      abbreviation: this.options[0].split("#")[0],
      serial: parseInt(this.options[0].split("#")[1]),
    });

    msg.channel.send(
      `:white_check_mark: You claimed **${ff.abbreviation}#${ff.serialNumber}**!\nYou will not be able to claim another card for **3 hours**.`
    );
  };
}
