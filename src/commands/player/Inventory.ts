import {
  Message,
  MessageReaction,
  User,
  MessageEmbed,
  TextChannel,
} from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { CardService } from "../../database/service/CardService";
import { MarketService } from "../../database/service/MarketService";
import { UserCard } from "../../structures/player/UserCard";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["inventory", "inv"];
  private async renderInventory(cards: UserCard[]): Promise<string> {
    let desc = "";
    for (let c of cards) {
      const { forSale } = await MarketService.cardIsOnMarketplace(c);
      const { level } = CardService.heartsToLevel(c.hearts);
      desc += `__**${c.abbreviation}#${c.serialNumber}**__ - ${c.member} ${
        (c.isFavorite ? `${this.config.discord.emoji.hearts.full}` : "") +
        (forSale ? `${this.config.discord.emoji.cash.full}` : "")
      }\nLevel **${level}** / ${":star:".repeat(c.stars)}\n`;
    }
    return desc;
  }

  async exec(msg: Message, executor: Profile) {
    const optionsRaw = this.options.filter((v) => v.includes("="));
    let options: { [key: string]: string } = {};
    for (let option of optionsRaw) {
      const name = option.split("=")[0];
      const value = option.split("=")[1];
      options[name.toLowerCase()] = value;
    }

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

    const cardCount = await PlayerService.getCardCountByProfile(
      profile,
      options
    );

    const pageLimit = Math.ceil(cardCount / 10);
    const pageNotNaN = isNaN(parseInt(options.page))
      ? 1
      : parseInt(options.page);
    const pageNotNegative = pageNotNaN < 1 ? 1 : pageNotNaN;
    let page = pageNotNegative > pageLimit ? pageLimit : pageNotNegative;

    const desc = `${
      this.config.discord.emoji.cards.full
    } I found **${cardCount}** card${cardCount == 1 ? "" : "s"}${
      optionsRaw[0] ? " matching this search" : ""
    }!\n${optionsRaw[0] ? "```" : ""}${optionsRaw.join("\n")}${
      optionsRaw[0] ? "```\n" : "\n"
    }`;

    const cards = await PlayerService.getCardsByProfile(profile, {
      ...options,
      limit: 10,
      page,
    });

    const embed = new MessageEmbed()
      .setAuthor(
        `Inventory | ${user.tag} (page ${page}/${pageLimit})`,
        msg.author.displayAvatarURL()
      )
      .setDescription(desc + (await this.renderInventory(cards)))
      .setFooter(`To change pages, click the arrow reactions.`)
      .setColor(`#FFAACC`)
      .setThumbnail(user.displayAvatarURL());
    const sent = await msg.channel.send(embed);
    if (pageLimit > 2) await sent.react(`⏪`);
    if (pageLimit > 1) await sent.react(`◀️`);
    if (this.permissions.MANAGE_MESSAGES)
      await sent.react(`754832389620105276`);
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
      if (r.emoji.name === "⏪" && page !== 1) {
        page = 1;
        const newCards = await PlayerService.getCardsByProfile(profile, {
          ...options,
          limit: 10,
          page: page,
        });
        await sent.edit(
          embed
            .setAuthor(
              `Inventory | ${user.tag} (page ${page}/${pageLimit})`,
              msg.author.displayAvatarURL()
            )
            .setDescription(desc + (await this.renderInventory(newCards)))
        );
      } else if (r.emoji.name === "◀️" && page !== 1) {
        page--;
        const newCards = await PlayerService.getCardsByProfile(profile, {
          ...options,
          limit: 10,
          page: page,
        });
        await sent.edit(
          embed
            .setAuthor(
              `Inventory | ${user.tag} (page ${page}/${pageLimit})`,
              msg.author.displayAvatarURL()
            )
            .setDescription(desc + (await this.renderInventory(newCards)))
        );
      } else if (
        r.emoji.name === "delete" &&
        this.permissions.MANAGE_MESSAGES
      ) {
        return await (<TextChannel>msg.channel).bulkDelete([msg, sent]);
      } else if (r.emoji.name === "▶️" && page !== pageLimit) {
        page++;
        const newCards = await PlayerService.getCardsByProfile(profile, {
          ...options,
          limit: 10,
          page: page,
        });
        sent.edit(
          embed
            .setAuthor(
              `Inventory | ${user.tag} (page ${page}/${pageLimit})`,
              msg.author.displayAvatarURL()
            )
            .setDescription(desc + (await this.renderInventory(newCards)))
        );
      } else if (r.emoji.name === "⏩" && page !== pageLimit) {
        page = pageLimit;
        const newCards = await PlayerService.getCardsByProfile(profile, {
          ...options,
          limit: 10,
          page: page,
        });
        await sent.edit(
          embed
            .setAuthor(
              `Inventory | ${user.tag} (page ${page}/${pageLimit})`,
              msg.author.displayAvatarURL()
            )
            .setDescription(desc + (await this.renderInventory(newCards)))
        );
      }
      await r.users.remove(msg.author);
    });
    collector.on("end", async () => {
      if (!sent.deleted && this.permissions.MANAGE_MESSAGES)
        await sent.reactions.removeAll();
    });
  }
}
