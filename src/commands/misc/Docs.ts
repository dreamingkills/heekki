import { Message } from "discord.js";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["docs"];
  usage: string[] = ["%c"];
  desc: string = "Posts a link to the documentation!";
  category: string = "misc";

  exec = async function (msg: Message) {
    msg.channel.send(
      "**HaSeul Documentation**\nhttps://olivia-hye.github.io/haseul-docs/"
    );
    return;
  };
}
