import {
  Message,
  MessageEmbed,
  MessageReaction,
  User,
  EmbedField,
} from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { UserCard } from "../../structures/player/UserCard";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["viewforfeited", "vff"];
  disabled: boolean = true;
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
  async exec(msg: Message) {
    const optionsRaw = this.options.filter((v) => v.includes("="));
    let options: { [key: string]: string } = {};
    for (let option of optionsRaw) {
      options[option.split("=")[0].toLowerCase()] = option.split("=")[1];
    }

    const totalOrphaned = await PlayerService.getForfeitedCardCount({
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
    await sent.react(this.config.discord.emoji.delete.id);
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
      if (r.emoji.name === "⏪" && page !== 1) page = 1;
      if (r.emoji.name === "◀️" && page !== 1) page--;
      if (r.emoji.name === "delete") return await sent.delete();
      if (r.emoji.name === "▶️" && page !== pageLimit) page++;
      if (r.emoji.name === "⏩") page = pageLimit;

      const newCards = await PlayerService.getOrphanedCards({
        ...options,
        limit: 15,
        page,
      });
      embed.fields = await this.render(newCards);
      await sent.edit(
        embed.setAuthor(
          `Forfeited Cards | ${msg.author.tag} (page ${page}/${pageLimit})`,
          msg.author.displayAvatarURL()
        )
      );

      if (msg.guild?.member(msg.client.user!)?.hasPermission("MANAGE_MESSAGES"))
        await r.users.remove(msg.author);
    });

    collector.on("end", async () => {
      if (!sent.deleted) await sent.reactions.removeAll();
    });
  }
}
