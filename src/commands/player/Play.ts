import { Message } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { ProfileEmbed } from "../../helpers/embed/ProfileEmbed";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["play"];
  usage: string[] = ["%c"];
  desc: string = "Creates a new profile.";
  category: string = "player";

  exec = async (msg: Message) => {
    const newUser = await PlayerService.createNewProfile(msg.author.id);

    const embed = new ProfileEmbed(
      newUser,
      [],
      msg.author.tag,
      msg.author.displayAvatarURL()
    );
    msg.channel.send(
      `:white_check_mark: Successfully set up your profile!\nPlease read the **documentation** at <https://olivia-hye.github.io/heekki-docs/help/getting-started/> for information on how to play!`,
      embed
    );
  };
}
