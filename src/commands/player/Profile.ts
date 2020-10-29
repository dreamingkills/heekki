import { Message } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { ProfileEmbed } from "../../helpers/embed/ProfileEmbed";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["profile", "p"];
  async exec(msg: Message, executor: Profile) {
    let userQuery: Profile;
    if (this.options[0]) {
      if (msg.mentions.users.first()) {
        userQuery = await PlayerService.getProfileByDiscordId(
          msg.mentions.users.first()!.id
        );
      } else {
        const member = await msg.guild?.members.fetch({
          query: this.options.join(" "),
        });
        if (!member?.firstKey()) {
          msg.channel.send(
            `<:red_x:741454361007357993> Sorry, but I couldn't find that user.`
          );
          return;
        }
        userQuery = await PlayerService.getProfileByDiscordId(
          member.firstKey()!
        );
      }
    } else userQuery = executor;

    const discordUser = msg.client.users.resolve(userQuery.discord_id);
    if (!discordUser) {
      msg.channel.send(
        `<:red_x:741454361007357993> Sorry, but I couldn't find that user.`
      );
      return;
    }
    const badges = await PlayerService.getBadgesByProfile(userQuery);
    const cardCount = await PlayerService.getCardCountByProfile(userQuery);
    const embed = new ProfileEmbed(
      userQuery,
      badges,
      discordUser,
      discordUser.displayAvatarURL(),
      executor.reputation,
      cardCount
    );
    msg.channel.send(embed);
  }
}
