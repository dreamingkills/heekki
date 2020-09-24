import {
  Message,
  MessageEmbed,
  EmbedField,
  MessageReaction,
  User,
  TextChannel,
} from "discord.js";
import { MarketService } from "../../database/service/MarketService";
import { UserCard } from "../../structures/player/UserCard";
import { StatsService } from "../../database/service/StatsService";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["market", "marketplace", "mp"];
  private async renderMarket(
    cards: { card: UserCard; price: number }[]
  ): Promise<EmbedField[]> {
    return cards.map((c) => {
      return {
        name: `${c.card.abbreviation}#${c.card.serialNumber}`,
        value: `:star: ${c.card.stars}\n<:cash:757146832639098930> ${c.price}\nSeller: <@${c.card.ownerId}>`,
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

    const totalOrphaned = await MarketService.getMarketCount({ ...options });
    const pageLimit = Math.ceil(totalOrphaned / 9);
    const pageRaw = isNaN(parseInt(options.page)) ? 1 : parseInt(options.page);
    let page = pageRaw > pageLimit ? pageLimit : pageRaw;

    const ff = await MarketService.getMarket(options);

    const embed = new MessageEmbed()
      .setAuthor(
        `The Marketplace | ${msg.author.tag} (page ${page}/${pageLimit})`,
        msg.author.displayAvatarURL()
      )
      .setDescription(
        ff.length === 0
          ? ":mag_right: There's nothing here... Try searching for something else!"
          : ""
      )
      .setFooter(
        `To buy a card, use !mpb <card reference>.\nTo change pages, click the arrow reactions.`
      )
      .setColor(`#FFAACC`);

    const sent = await msg.channel.send(
      embed.addFields(await this.renderMarket(ff))
    );
    await Promise.all([
      sent.react(`⏪`),
      sent.react(`◀️`),
      sent.react(`754832389620105276`),
      sent.react(`▶️`),
      sent.react(`⏩`),
    ]);

    const collector = sent.createReactionCollector(
      (r: MessageReaction, u: User) =>
        (r.emoji.name === "⏪" ||
          r.emoji.name === "◀️" ||
          r.emoji.name === "delete" ||
          r.emoji.name === "▶️" ||
          r.emoji.name == "⏩") &&
        msg.author.id === u.id,
      { time: 60000 }
    );
    collector.on("collect", async (r) => {
      if (r.emoji.name === "⏪" && page !== 1) {
        page = 1;
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
      } else if (r.emoji.name === "◀️" && page !== 1) {
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
      } else if (r.emoji.name === "delete") {
        return (<TextChannel>msg.channel).bulkDelete([msg, sent]);
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
      } else if (r.emoji.name === "⏩" && page !== pageLimit) {
        page = pageLimit;
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
