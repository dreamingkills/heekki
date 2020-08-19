import { BaseCommand } from "../../structures/command/Command";
import { Message } from "discord.js";

export class Command extends BaseCommand {
  names: string[] = ["ping", "pong"];
  usage: string[] = ["%c"];
  desc: string = "Am I awake?";
  category: string = "debug";
  hidden: boolean = true;

  exec = async function (msg: Message) {
    msg.channel.send("Hello!");
    return;
  };
}
