import { BaseCommand } from "../../structures/command/Command";
import { Message } from "discord.js";

export class Command extends BaseCommand {
  names: string[] = ["ping", "pong"];
  exec = async function (msg: Message) {
    msg.channel.send("Hello!");
  };
}
