import { Message } from "discord.js";
import { AdminService } from "../../database/service/AdminService";
import { PlayerService } from "../../database/service/PlayerService";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["givebadge"];
  users: string[] = ["197186779843919877"];
  async exec(msg: Message) {
    const badge_id = parseInt(this.options[1]);
    if (isNaN(badge_id) || !badge_id) {
      msg.channel.send("That isn't a valid ID.");
      return;
    }
    const badge = await PlayerService.getBadgeByBadgeId(badge_id);
    const user = await msg.client.users.fetch(this.options[0]);
    if (!user) {
      msg.channel.send("Couldn't find that user.");
      return;
    }

    await AdminService.giveBadgeToUser(user.id, badge_id);
    msg.channel.send(
      `:white_check_mark: Gave badge :${badge.emoji}: **${badge.title}** to **${user.tag}**.`
    );
  }
}
