import { Message } from "discord.js";
import { AdminService } from "../../database/service/AdminService";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["createcard"];
  usage: string[] = ["%c <property> <value>"];
  category: string = "admin";

  exec = async (msg: Message) => {
    if (msg.author.id != "197186779843919877") return;
    return;
  };
}
