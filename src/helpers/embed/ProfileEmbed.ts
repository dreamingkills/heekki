import { MessageEmbed, User } from "discord.js";
import { Profile } from "../../structures/player/Profile";
import { Badge } from "../../structures/player/Badge";

export class ProfileEmbed {
  embed: MessageEmbed;

  constructor(
    profile: Profile,
    badges: Badge[],
    user: User,
    avatar: string,
    reputation: number,
    cards: number
  ) {
    const embed = new MessageEmbed()
      .setAuthor(`Profile | ${user.tag}`, avatar)
      .setThumbnail(avatar || "")
      .setDescription(
        `${
          profile.blurb || "No description set!"
        }\n\n<:cash:757146832639098930> **Cash**: ${
          profile.coins
        }\n<:heekki_heart:757147742383505488> **Hearts**: ${
          profile.hearts
        }\n<:reputation:757148669291266159> **Reputation**: ${reputation}\n<:cards:757151797235286089> ${
          user.username
        } has **${cards}** cards.`
      )
      .setColor("#FFAACC");
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
