import { Message } from "discord.js";
import { AdminService } from "../../database/service/AdminService";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["givebadge"];
  usage: string[] = ["%c <user id> <badge id>"];
  category: string = "admin";

  exec = async (msg: Message) => {
    if (msg.author.id != "197186779843919877") return;

    let badgeId = this.options[1];
    let userId = this.options[0];

    await AdminService.giveBadgeToUser(userId, parseInt(badgeId));
    await msg.channel.send(
      `:white_check_mark: Gave badge \`${badgeId}\` to \`${userId}\`.`
    );
  };
}
