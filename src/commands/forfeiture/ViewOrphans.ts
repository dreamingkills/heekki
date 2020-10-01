import {
  Message,
  MessageEmbed,
  MessageReaction,
  User,
  EmbedField,
  TextChannel,
} from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { StatsService } from "../../database/service/StatsService";
import { UserCard } from "../../structures/player/UserCard";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["viewforfeited", "vff"];
  private async render(cards: UserCard[]): Promise<EmbedField[]> {
    const temp = new MessageEmbed();
    for (let c of cards) {
      temp.addField(
        `${c.abbreviation}#${c.serialNumber}`,
        `:star: ${c.stars}\n:heart: ${c.hearts}`,
        true
      );
    }
    return temp.fields;
  }
  exec = async (msg: Message) => {
    const optionsRaw = this.options.filter((v) => v.includes("="));
    let options: { [key: string]: string } = {};
    for (let option of optionsRaw) {
      options[option.split("=")[0].toLowerCase()] = option.split("=")[1];
    }

    const totalOrphaned = await PlayerService.getOrphanedCardCount({
      ...options,
    });

    const pageLimit = Math.ceil(totalOrphaned / 15);
    const pageRaw = isNaN(parseInt(options.page)) ? 1 : parseInt(options.page);
    let page = pageRaw > pageLimit ? pageLimit : pageRaw;

    const embed = new MessageEmbed()
      .setAuthor(
        `Forfeited Cards | ${msg.author.tag} (page ${page}/${pageLimit})`,
        msg.author.displayAvatarURL()
      )
      .setFooter(
        `Use !cf <card reference> to claim a card\nTo change pages, click the arrow reactions.`
      )
      .setColor("#FFAACC");

    let forfeited = await PlayerService.getOrphanedCards({
      ...options,
      limit: 15,
      page,
    });

    embed.fields = await this.render(forfeited);
    const sent = await msg.channel.send(embed);
    if (pageLimit > 2) await sent.react(`⏪`);
    if (pageLimit > 1) await sent.react(`◀️`);
    sent.react(`754832389620105276`);
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

    const collector = sent.createReactionCollector(filter, { time: 60000 });
    collector.on("collect", async (r) => {
      if (r.emoji.name === "⏪" && page !== 1) {
        page = 1;
        const newCards = await PlayerService.getOrphanedCards({
          ...options,
          limit: 15,
          page,
        });
        embed.fields = await this.render(newCards);
        sent.edit(
          embed.setAuthor(
            `Forfeited Cards | ${msg.author.tag} (page ${page}/${pageLimit})`,
            msg.author.displayAvatarURL()
          )
        );
      } else if (r.emoji.name === "◀️" && page !== 1) {
        page--;
        const newCards = await PlayerService.getOrphanedCards({
          ...options,
          limit: 15,
          page,
        });
        embed.fields = await this.render(newCards);
        sent.edit(
          embed.setAuthor(
            `Forfeited Cards | ${msg.author.tag} (page ${page}/${pageLimit})`,
            msg.author.displayAvatarURL()
          )
        );
      } else if (r.emoji.name === "delete") {
        await (<TextChannel>msg.channel).bulkDelete([msg, sent]);
        return;
      } else if (r.emoji.name === "▶️" && page !== pageLimit) {
        page++;
        const newCards = await PlayerService.getOrphanedCards({
          ...options,
          limit: 15,
          page,
        });
        embed.fields = await this.render(newCards);
        sent.edit(
          embed.setAuthor(
            `Forfeited Cards | ${msg.author.tag} (page ${page}/${pageLimit})`,
            msg.author.displayAvatarURL()
          )
        );
      } else if (r.emoji.name === "⏩") {
        page = pageLimit;
        const newCards = await PlayerService.getOrphanedCards({
          ...options,
          limit: 15,
          page,
        });
        embed.fields = await this.render(newCards);
        sent.edit(
          embed.setAuthor(
            `Forfeited Cards | ${msg.author.tag} (page ${page}/${pageLimit})`,
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
