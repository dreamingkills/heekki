import { Message } from "discord.js";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
export class Command extends BaseCommand {
  names: string[] = ["drops"];
  async exec(msg: Message, _: Profile) {
    if (!msg.member?.hasPermission("MANAGE_CHANNELS")) return;
  }
}
