import { Message } from "discord.js";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["invite"];
  usage: string[] = ["%c"];
  desc: string = "Posts a link to invite the bot to your server!";
  category: string = "misc";

  exec = async function (msg: Message) {
    const invite = await msg.client.generateInvite([
      "ATTACH_FILES",
      "EMBED_LINKS",
      "USE_EXTERNAL_EMOJIS",
    ]);
    msg.channel.send(
      `:information_source: You can invite Heekki to your server with the following link:\n<${invite}>\nYou can find the official Heekki server at https://discord.gg/KbcQjRG`
    );
  };
}
