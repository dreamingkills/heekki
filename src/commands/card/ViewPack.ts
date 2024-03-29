import { Message, MessageEmbed } from "discord.js";
import { CardService } from "../../database/service/CardService";
import { PlayerService } from "../../database/service/PlayerService";
import { ShopService } from "../../database/service/ShopService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["pack", "viewpack", "vp"];
  async exec(msg: Message, executor: Profile) {
    if (!this.options[0]) {
      await msg.channel.send(
        `${this.bot.config.discord.emoji.cross.full} Please specify a pack to view.`
      );
      return;
    }
    const prefix = this.bot.getPrefix(msg.guild!.id);
    const packName = this.options.join(" ");
    const pack = await ShopService.getPackByFuzzySearch(packName, prefix);
    const packCards = await CardService.getCardsByPack(pack);
    const ownedByUser = await PlayerService.getCardsByProfile(executor, [
      {
        pack: pack.title,
      },
    ]);

    const length = packCards.length;
    let size,
      i = 0,
      out = [],
      n = 3;

    if (length % 3 === 0) {
      size = Math.floor(length / 3);
      while (i < length) {
        out.push(packCards.slice(i, (i += size)));
      }
    } else {
      while (i < length) {
        size = Math.ceil((length - i) / n--);
        out.push(packCards.slice(i, (i += size)));
      }
    }

    const embed = new MessageEmbed().setAuthor(
      `Pack Viewer | ${msg.author.tag}`,
      msg.author.displayAvatarURL()
    );
    if (out[0])
      embed.addField(
        `\u200b`,
        out[0].map((c) => {
          const owned = ownedByUser.filter((card) => card.cardId === c.cardId)
            .length;
          return `${
            owned > 0
              ? this.bot.config.discord.emoji.cards.full
              : this.bot.config.discord.emoji.cardsDark.full
          } **${c.member}** (${c.abbreviation})\nOwned: **${owned}**`;
        }),
        true
      );
    if (out[1])
      embed.addField(
        `\u200b`,
        out[1].map((c) => {
          const owned = ownedByUser.filter((card) => card.cardId === c.cardId)
            .length;
          return `${
            owned > 0
              ? this.bot.config.discord.emoji.cards.full
              : this.bot.config.discord.emoji.cardsDark.full
          } **${c.member}** (${c.abbreviation})\nOwned: **${owned}**`;
        }),
        true
      );
    if (out[2])
      embed.addField(
        `\u200b`,
        out[2].map((c) => {
          const owned = ownedByUser.filter((card) => card.cardId === c.cardId)
            .length;
          return `${
            owned > 0
              ? this.bot.config.discord.emoji.cards.full
              : this.bot.config.discord.emoji.cardsDark.full
          } **${c.member}** (${c.abbreviation})\nOwned: **${owned}**`;
        }),
        true
      );

    embed.setDescription(
      `${pack.flavorText ? `*"${pack.flavorText}"*` : ``}\n${
        this.bot.config.discord.emoji.cards.full
      } There ${packCards.length > 1 ? "are" : "is"} **${
        packCards.length
      }** card${packCards.length > 1 ? "s" : ""} in the **${
        pack.title
      }** pack.\nYou own **${ownedByUser.length}** card${
        ownedByUser.length > 1 ? "s" : ""
      } from this pack.`
    );
    embed
      .setColor(`#FFAACC`)
      .setFooter(`Pack designed by ${pack.credit}`)
      .setThumbnail(`attachment://cover.png`);

    await msg.channel.send({
      embed,
      files: pack.cover ? [{ attachment: pack.cover, name: "cover.png" }] : [],
    });
    return;
  }
}
