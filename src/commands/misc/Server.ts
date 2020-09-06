import { Message } from "discord.js";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["server"];
  usage: string[] = ["%c"];
  desc: string = "Posts a link to HaSeul's official server!";
  category: string = "misc";

  exec = async function (msg: Message) {
    msg.channel.send(
      `:information_source: You can join the official HaSeul server with the following link:\nhttps://discord.gg/KbcQjRG`
    );
    return;
  };
}
