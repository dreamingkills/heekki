import { Message } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { ProfileEmbed } from "../../helpers/embed/ProfileEmbed";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["profile"];
  usage: string[] = ["%c [@mention]"];
  desc: string = "Shows a user's profile.";
  category: string = "player";

  exec = async (msg: Message) => {
    let userQuery;
    if (this.options[0]) {
      if (isNaN(parseInt(this.options[0])) && !this.options[0].includes("<@")) {
        const member = await msg.guild?.members.fetch({
          query: this.options.join(" "),
        });
        userQuery = member?.firstKey();
        if (!userQuery) {
          await msg.channel.send(
            "<:red_x:741454361007357993> Sorry, but I couldn't find that user."
          );
          return;
        }
      } else {
        userQuery = this.parseMention(this.options[0]);
      }
    } else {
      userQuery = msg.author.id;
    }
    let user = await PlayerService.getProfileByDiscordId(
      userQuery,
      userQuery ? true : false
    );

    const discordUser = await msg.client.users.fetch(user.discord_id);
    const badges = await PlayerService.getBadgesByDiscordId(user.discord_id);

    const embed = new ProfileEmbed(
      user,
      badges,
      discordUser.tag,
      discordUser.displayAvatarURL()
    );
    msg.channel.send(embed);
  };
}
