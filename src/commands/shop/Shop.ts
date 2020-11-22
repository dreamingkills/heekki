import { Message, MessageEmbed, MessageReaction, User } from "discord.js";
import { ShopService } from "../../database/service/ShopService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import { ShopItem } from "../../structures/shop/ShopItem";

export class Command extends BaseCommand {
  names: string[] = ["packs"];
  private renderShop(packs: ShopItem[], prefix: string): MessageEmbed {
    const rendered = [];
    for (let pack of packs) {
      rendered.push({
        name: `${this.bot.config.discord.emoji.cards.full} ${pack.title}`,
        value: `${this.bot.config.discord.emoji.cash.full} **${pack.price}**\n\`${prefix}bp ${pack.keyword}\``,
        inline: true,
      });
    }
    const embed = new MessageEmbed()
      .addFields(rendered)
      .setColor(`#FFAACC`)
      .setThumbnail(`https://cdn.discordapp.com/emojis/774406508691324948.png`);
    return embed;
  }

  async exec(msg: Message, executor: Profile) {
    const prefix = this.bot.getPrefix(msg.guild!.id);
    const optionsRaw = this.options.filter((v) => v.includes("="));
    let options: { [key: string]: string } = {};
    for (let option of optionsRaw) {
      const name = option.split("=")[0];
      const value = option.split("=")[1];
      options[name.toLowerCase()] = value;
    }

    const count = await ShopService.getNumberOfShopItems(true);
    const pageLimit = Math.ceil(count / 6);
    const pageNotNaN = isNaN(parseInt(options.page))
      ? 1
      : parseInt(options.page);
    const pageNotNegative = pageNotNaN < 1 ? 1 : pageNotNaN;
    let page = pageNotNegative > pageLimit ? pageLimit : pageNotNegative;

    let packs = await ShopService.getAvailablePacks(page);

    let embed = this.renderShop(packs, prefix)
      .setAuthor(
        `Packs | ${msg.author.tag} (page ${page}/${pageLimit})`,
        msg.author.displayAvatarURL()
      )
      .setDescription(
        `You have ${this.bot.config.discord.emoji.cash.full} **${executor.coins}**.`
      );
    const sent = await msg.channel.send(embed);

    if (pageLimit > 2) await sent.react(`⏪`);
    if (pageLimit > 1) await sent.react(`◀️`);
    await sent.react(this.bot.config.discord.emoji.delete.id);
    if (pageLimit > 1) await sent.react(`▶️`);
    if (pageLimit > 2) await sent.react(`⏩`);

    let filter;
    if (pageLimit > 1) {
      filter = (r: MessageReaction, u: User) =>
        (r.emoji.name === "⏪" ||
          r.emoji.name === "◀️" ||
          r.emoji.name === "delete" ||
          r.emoji.name === "▶️" ||
          r.emoji.name === "⏩") &&
        msg.author.id === u.id;
    } else
      filter = (r: MessageReaction, u: User) =>
        r.emoji.name === "delete" && msg.author.id === u.id;

    const collector = sent.createReactionCollector(filter, { time: 300000 });
    collector.on("collect", async (r) => {
      if (r.emoji.name === "⏪" && page !== 1) page = 1;
      if (r.emoji.name === "◀️" && page !== 1) page--;
      if (r.emoji.name === "delete") return await sent.delete();
      if (r.emoji.name === "▶️" && page !== pageLimit) page++;
      if (r.emoji.name === "⏩" && page !== pageLimit) page = pageLimit;

      const newShop = await ShopService.getAvailablePacks(page);
      const newDesc = this.renderShop(newShop, prefix);
      await sent.edit(
        newDesc
          .setAuthor(
            `Packs | ${msg.author.tag} (page ${page}/${pageLimit})`,
            msg.author.displayAvatarURL()
          )
          .setDescription(
            `You have ${this.bot.config.discord.emoji.cash.full} **${executor.coins}**.`
          )
      );
      await r.users.remove(msg.author);
    });
    collector.on("end", async () => {
      if (!sent.deleted && this.permissions.MANAGE_MESSAGES)
        await sent.reactions.removeAll();
    });
  }
}
