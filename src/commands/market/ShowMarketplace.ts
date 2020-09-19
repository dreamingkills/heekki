import {
  Message,
  MessageEmbed,
  EmbedField,
  MessageReaction,
  User,
} from "discord.js";
import { MarketService } from "../../database/service/MarketService";
import { UserCard } from "../../structures/player/UserCard";
import { StatsService } from "../../database/service/StatsService";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["market", "marketplace", "mp"];
  usage: string[] = ["%c [page]"];
  desc: string = "Shows a list of cards currently up for sale.";
  category: string = "market";

  private async renderMarket(
    cards: { card: UserCard; price: number }[]
  ): Promise<EmbedField[]> {
    return cards.map((c) => {
      return {
        name: `${c.card.abbreviation}#${c.card.serialNumber}`,
        value: `**${c.card.title}**\n${c.card.member}\n:star: ${c.card.stars}\n<:coin:745447920072917093> ${c.price}`,
        inline: true,
      };
    });
  }

  exec = async (msg: Message) => {
    const optionsRaw = this.options.filter((v) => v.includes("="));
    let options: { [key: string]: string } = {};
    for (let option of optionsRaw) {
      const name = option.split("=")[0];
      const value = option.split("=")[1];
      options[name.toLowerCase()] = value;
    }

    const totalOrphaned = await StatsService.getNumberOfCardsInMarketplace();
    const pageLimit = Math.ceil(totalOrphaned / 9);
    const pageRaw = isNaN(parseInt(options.page)) ? 1 : parseInt(options.page);
    let page = pageRaw > pageLimit ? pageLimit : pageRaw;

    const ff = await MarketService.getMarket(options);

    const embed = new MessageEmbed()
      .setAuthor(
        `The Marketplace | ${msg.author.tag} (page ${page}/${pageLimit})`
      )
      .setDescription(
        ff.length === 0
          ? ":mag_right: There's nothing here... Try searching for something else!"
          : ""
      )
      .setFooter(
        `To buy a card, use !mpb <card reference>.\nTo change pages, click the arrow reactions.`
      )
      .setColor(`#40BD66`);

    const sent = await msg.channel.send(
      embed.addFields(await this.renderMarket(ff))
    );
    await Promise.all([sent.react(`◀️`), sent.react(`▶️`)]);

    const collector = sent.createReactionCollector(
      (r: MessageReaction, u: User) =>
        (r.emoji.name === "◀️" || r.emoji.name === "▶️") &&
        msg.author.id === u.id,
      { time: 60000 }
    );
    collector.on("collect", async (r) => {
      if (r.emoji.name === "◀️" && page !== 1) {
        page--;
        const newCards = await MarketService.getMarket({
          ...options,
          limit: 9,
          page,
        });
        embed.fields = await this.renderMarket(newCards);
        sent.edit(
          embed.setAuthor(
            `The Marketplace | ${msg.author.tag} (page ${page}/${pageLimit})`,
            msg.author.displayAvatarURL()
          )
        );
      } else if (r.emoji.name === "▶️" && page !== pageLimit) {
        page++;
        const newCards = await MarketService.getMarket({
          ...options,
          limit: 9,
          page,
        });
        embed.fields = await this.renderMarket(newCards);
        sent.edit(
          embed.setAuthor(
            `The Marketplace | ${msg.author.tag} (page ${page}/${pageLimit})`,
            msg.author.displayAvatarURL()
          )
        );
      }
      r.users.remove(msg.author);
    });

    collector.on("end", async () => {
      if (!sent.deleted) sent.reactions.removeAll();
    });
  };
}
