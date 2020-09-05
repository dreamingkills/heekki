import { GameCommand } from "../../structures/command/GameCommand";
import { Message } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { ProfileEmbed } from "../../helpers/embed/ProfileEmbed";

export class Command extends GameCommand {
  names: string[] = ["play"];
  usage: string[] = ["%c"];
  desc: string = "Creates a new profile.";
  category: string = "player";

  exec = async (msg: Message) => {
    const newUser = await PlayerService.createNewUser(msg.author.id);

    const embed = new ProfileEmbed(
      newUser,
      [],
      msg.author.tag,
      msg.author.displayAvatarURL()
    );
    msg.channel.send(
      `:white_check_mark: Successfully set up your profile!`,
      embed
    );
  };
}
