import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { ProfileEmbed } from "../../helpers/embed/ProfileEmbed";

export class Command extends GameCommand {
  names: string[] = ["profile"];
  usage: string[] = ["%c [@mention]"];
  desc: string = "Shows a user's profile.";
  category: string = "player";

  exec = async (msg: Message) => {
    let id = this.prm[0] || msg.author.id;
    let user = await PlayerService.getProfileByDiscordId(
      id,
      this.prm[0] ? true : false
    );

    const discordUser = await msg.client.users.fetch(user.discord_id);
    const badges = await PlayerService.getBadgesByDiscordId(user.discord_id);

    const embed = new ProfileEmbed(
      user,
      badges,
      discordUser.tag,
      discordUser.displayAvatarURL()
    );
    await msg.channel.send(embed);
    return;
  };
}
