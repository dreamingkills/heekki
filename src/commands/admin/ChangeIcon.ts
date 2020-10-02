import { Message } from "discord.js";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["avatar"];
  users: string[] = ["197186779843919877"];
  async exec(msg: Message) {
    const attachment = msg.attachments.first();
    if (!attachment) {
      msg.channel.send(`Please attach an image.`);
      return;
    }
    await msg.client.user!.setAvatar(attachment.url);
    msg.channel.send(`Updated avatar to <${attachment.url}>`);
  }
}
