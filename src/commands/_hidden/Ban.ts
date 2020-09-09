import { BaseCommand } from "../../structures/command/Command";
import { Message } from "discord.js";

export class Command extends BaseCommand {
  names: string[] = ["ban"];
  usage: string[] = ["%c"];
  desc: string = "i r teh pwnz0r!!1";
  category: string = "hidden";
  hidden: boolean = true;

  exec = async (msg: Message) => {
    if (!msg.mentions.users.first()) return;
    msg.channel.send(
      `:white_check_mark: Permanently banned **${
        msg.mentions.users.first()!.tag
      }** from Heekki.\nAll user data has been erased.`
    );
  };
}
