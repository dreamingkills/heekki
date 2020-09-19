import { BaseCommand } from "../../structures/command/Command";
import { Message } from "discord.js";

export class Command extends BaseCommand {
  names: string[] = ["pay"];
  usage: string[] = ["%c"];
  desc: string = "rest in piece";
  category: string = "hidden";
  hidden: boolean = true;

  exec = async (msg: Message) => {
    if (this.options[0] === "respects") msg.react("🇫");
  };
}
