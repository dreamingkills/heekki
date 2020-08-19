import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed } from "discord.js";

export class Command extends GameCommand {
  names: string[] = ["profile"];
  usage: string[] = ["%c [@mention]"];
  desc: string = "Shows a user's profile.";
  category: string = "player";

  exec = async (msg: Message) => {
    let user;
    if (this.prm[0]) {
      let id = this.prm[0].replace(/[\\<>@#&!]/g, "");
      user = await this.entities.user.findOne({ discord_id: id });
    } else {
      user = await this.entities.user.findOne({ discord_id: msg.author.id });
      if (!user) {
        await msg.channel.send(
          `<:red_x:741454361007357993> You've not yet set up a profile - use the \`!play\` command to get started.`
        );
      }
    }
    if (!user) {
      await msg.channel.send(
        `<:red_x:741454361007357993> That mention is invalid! Either it's not a user, or they don't have a profile set up.`
      );
      return;
    }

    let discordUser = await msg.guild?.members.fetch(user.discord_id);
    let embed = new MessageEmbed()
      .setAuthor(
        (discordUser ? `${discordUser?.user.tag}` : `Unknown User`) +
          `'s profile`
      )
      .setThumbnail(discordUser ? discordUser.user.displayAvatarURL() : "")
      .setDescription(
        `"${user.desc}"\n\n<:coin:745447920072917093> ${user.coins}\n:heart: ${user.hearts}`
      )
      .setColor("#40BD66");
    await msg.channel.send(embed);
    return;
  };
}
