import { GameCommand } from "../../structures/command/GameCommand";
import { Message } from "discord.js";
import { AdminService } from "../../database/Admin";

export class Command extends GameCommand {
  names: string[] = ["createcard"];
  usage: string[] = ["%c <property> <value>"];
  category: string = "admin";

  exec = async (msg: Message) => {
    if (msg.author.id != "197186779843919877") return;
    return;
  };
}
