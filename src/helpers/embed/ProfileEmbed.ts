import { MessageEmbed } from "discord.js";
import { Profile } from "../../structures/player/Profile";
import { Badge } from "../../structures/player/Badge";

export class ProfileEmbed {
  embed: MessageEmbed;

  constructor(profile: Profile, badges: Badge[], tag: string, avatar: string) {
    const embed = new MessageEmbed()
      .setAuthor(`Profile | ${tag}`)
      .setThumbnail(avatar || "")
      .setDescription(
        `${
          profile.blurb || "No description set!"
        }\n\n<:coin:745447920072917093> ${profile.coins}\n:heart: ${
          profile.hearts
        }`
      )
      .setColor("#40BD66");
    if (badges.length > 0) {
      embed.addField(
        `Badges`,
        `:${badges
          .map((b) => {
            return b.emoji;
          })
          .join(": :")}:`
      );
    }

    this.embed = embed;
  }
}
