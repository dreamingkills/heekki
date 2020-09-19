import { Message } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["desc"];
  usage: string[] = ["%c <description>"];
  desc: string = "Sets the description on your profile.";
  category: string = "player";

  exec = async (msg: Message) => {
    let id = msg.author.id;
    let desc = this.options.join(" ");
    let user = await PlayerService.changeProfileDescriptionByDiscordId(
      id,
      desc
    );

    msg.channel.send(
      `:white_check_mark: Your description was updated to:\n\`${user.new}\``
    );
  };
}
