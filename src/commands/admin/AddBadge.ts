import { GameCommand } from "../../structures/command/GameCommand";
import { Message } from "discord.js";
import { AdminService } from "../../database/service/AdminService";

export class Command extends GameCommand {
  names: string[] = ["givebadge"];
  usage: string[] = ["%c <user id> <badge id>"];
  category: string = "admin";

  exec = async (msg: Message) => {
    if (msg.author.id != "197186779843919877") return;

    let badgeId = this.prm[1];
    let userId = this.prm[0];

    await AdminService.giveBadgeToUser(userId, parseInt(badgeId));
    await msg.channel.send(
      `:white_check_mark: Gave badge \`${badgeId}\` to \`${userId}\`.`
    );
  };
}
