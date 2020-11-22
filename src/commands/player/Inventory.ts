import { Message, MessageReaction, User, MessageEmbed } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { CardService } from "../../database/service/CardService";
import { MarketService } from "../../database/service/MarketService";
import { UserCard } from "../../structures/player/UserCard";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import { Eden } from "../../structures/game/Eden";

export class Command extends BaseCommand {
  names: string[] = ["inventory", "inv"];
  private async renderInventory(
    cards: UserCard[],
    eden: Eden
  ): Promise<string> {
    let desc = "";
    for (let c of cards) {
      const { forSale } = await MarketService.cardIsOnMarketplace(c);
      const level = CardService.calculateLevel(c);
      desc += `__**${c.abbreviation}#${c.serialNumber}**__ - ${c.member} ${
        (c.isFavorite ? `${this.bot.config.discord.emoji.hearts.full}` : "") +
        (forSale ? `${this.bot.config.discord.emoji.cash.full}` : "") +
        (CardService.cardInEden(c, eden) ? ":park:" : "")
      }\nLevel **${level}** / ${":star:".repeat(c.stars)}\n`;
    }
    return desc;
  }

  async exec(msg: Message, executor: Profile) {
    const eden = await PlayerService.getEden(executor);
    const optionsRaw = this.options.filter((v) => v.includes("="));
    const options = optionsRaw.map((o) => {
      const value: { [key: string]: string | number } = {};
      value[o.split("=")[0]] = o.split("=")[1];
      return value;
    });

    console.log(options);
    let profile: Profile;
    let user: User;
    if (msg.mentions.users.first()) {
      profile = await PlayerService.getProfileByDiscordId(
        msg.mentions.users.first()!.id
      );
      user = msg.mentions.users.first()!;
    } else {
      profile = executor;
      user = msg.author;
    }

    let cardCount: number;
    if (options.filter((o) => o.legacy)[0]?.legacy) {
      cardCount = await PlayerService.getLegacyCardCountByProfile(
        profile,
        options
      );
    } else
      cardCount = await PlayerService.getCardCountByProfile(profile, options);

    const pageRaw = <string>options.filter((o) => o.page)[0]?.page;
    const pageLimit =
      Math.ceil(cardCount / 10) < 1 ? 1 : Math.ceil(cardCount / 10);
    const pageNotNaN = isNaN(parseInt(pageRaw)) ? 1 : parseInt(pageRaw);
    const pageNotNegative = pageNotNaN < 1 ? 1 : pageNotNaN;
    let page = pageNotNegative > pageLimit ? pageLimit : pageNotNegative;

    const desc = `${
      this.bot.config.discord.emoji.cards.full
    } I found **${cardCount}** card${cardCount == 1 ? "" : "s"}${
      optionsRaw[0] ? " matching this search" : ""
    }!\n${optionsRaw[0] ? "```" : ""}${optionsRaw.join("\n")}${
      optionsRaw[0] ? "```\n" : "\n"
    }`;

    let cards: UserCard[];
    if (options.filter((o) => o.legacy)[0]?.legacy) {
      cards = await PlayerService.getLegacyCardsByProfile(profile, [
        ...options,
        { limit: 10 },
        { page },
      ]);
    } else
      cards = await PlayerService.getCardsByProfile(profile, [
        ...options,
        { limit: 10 },
        { page },
      ]);

    const embed = new MessageEmbed()
      .setAuthor(
        `Inventory | ${user.tag} (page ${page}/${pageLimit})`,
        msg.author.displayAvatarURL()
      )
      .setDescription(desc + (await this.renderInventory(cards, eden)))
      .setFooter(`To change pages, click the arrow reactions.`)
      .setColor(`#FFAACC`)
      .setThumbnail(user.displayAvatarURL());
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

      let newCards: UserCard[];
      newCards = await PlayerService.getCardsByProfile(profile, [
        ...options,
        { limit: 10 },
        { page },
      ]);

      await sent.edit(
        embed
          .setAuthor(
            `Inventory | ${user.tag} (page ${page}/${pageLimit})`,
            msg.author.displayAvatarURL()
          )
          .setDescription(desc + (await this.renderInventory(newCards, eden)))
      );
      await r.users.remove(msg.author);
    });
    collector.on("end", async () => {
      if (!sent.deleted && this.permissions.MANAGE_MESSAGES)
        await sent.reactions.removeAll();
    });
  }
}
