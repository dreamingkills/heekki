import { Message } from "discord.js";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["invite"];
  async exec(msg: Message) {
    const invite = await msg.client.generateInvite([
      "ATTACH_FILES",
      "EMBED_LINKS",
      "USE_EXTERNAL_EMOJIS",
    ]);
    msg.channel.send(
      `<:heekki_heart:757147742383505488> You can invite Heekki to your server with the following link:\n<${invite}>\nYou can find the official Heekki server at https://discord.gg/KbcQjRG`
    );
  }
}
