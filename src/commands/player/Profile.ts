import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed } from "discord.js";
import { PlayerService } from "../../database/player/Player";

export class Command extends GameCommand {
  names: string[] = ["profile"];
  usage: string[] = ["%c [@mention]"];
  desc: string = "Shows a user's profile.";
  category: string = "player";

  exec = async (msg: Message) => {
    let id = this.prm[0] || msg.author.id;
    let user = await PlayerService.getProfileFromUser(
      id,
      this.prm[0] ? true : false
    );

    let discordUser = await msg.guild?.members.fetch(user!.discord_id);
    let embed = new MessageEmbed()
      .setAuthor(
        (discordUser ? `${discordUser!.user.tag}` : `Unknown User`) +
          `'s profile`
      )
      .setThumbnail(discordUser ? discordUser.user.displayAvatarURL() : "")
      .setDescription(
        `${user!.desc}\n\n<:coin:745447920072917093> ${user!.coins}\n:heart: ${
          user!.hearts
        }`
      )
      .setColor("#40BD66");
    await msg.channel.send(embed);
    return;
  };
}
