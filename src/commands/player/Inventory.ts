import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageReaction, User, MessageEmbed } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { CardService } from "../../database/service/CardService";
import { MarketService } from "../../database/service/MarketService";
import { UserCard } from "../../structures/player/UserCard";

export class Command extends GameCommand {
  names: string[] = ["inventory", "inv"];
  usage: string[] = ["%c [page]"];
  desc: string = "Shows a user's inventory.";
  category: string = "player";

  private async renderInventory(cards: UserCard[]): Promise<string> {
    let desc = "";
    for (let c of cards) {
      const { forSale } = await MarketService.cardIsOnMarketplace(c.userCardId);
      const { level } = CardService.heartsToLevel(c.hearts);
      desc += `__**${c.abbreviation}#${c.serialNumber}**__ - ${c.member} ${
        (c.isFavorite ? ":heart:" : "") + (forSale ? ":dollar:" : "")
      }\nLevel **${level}** / ${":star:".repeat(c.stars)}\n`;
    }
    return desc;
  }

  exec = async (msg: Message) => {
    const optionsRaw = this.prm.filter((v) => v.includes("="));
    let options: { [key: string]: string } = {};
    for (let option of optionsRaw) {
      const name = option.split("=")[0];
      const value = option.split("=")[1];
      options[name.toLowerCase()] = value;
    }

    const user = msg.mentions.users.first() || msg.author;
    const profile = await PlayerService.getProfileByDiscordId(user.id, true);

    const cardCount = await PlayerService.getCardCountByDiscordId(
      profile.discord_id,
      options
    );
    const pageLimit = Math.ceil(cardCount / 10);
    const pageU = isNaN(parseInt(options.page)) ? 1 : parseInt(options.page);
    let page = pageU > pageLimit ? pageLimit : pageU;

    const desc = `**${cardCount}** card(s)${
      optionsRaw[0] ? " matching this search" : ""
    }!\n${optionsRaw[0] ? "```" : ""}${optionsRaw.join("\n")}${
      optionsRaw[0] ? "```\n" : ""
    }\n`;

    const cards = await PlayerService.getCardsByDiscordId(profile.discord_id, {
      ...options,
      limit: 10,
      page,
    });

    const embed = new MessageEmbed()
      .setAuthor(`Inventory | ${user.tag} (page ${page}/${pageLimit})`)
      .setDescription(desc + (await this.renderInventory(cards)))
      .setFooter(`To change pages, click the arrow reactions.`)
      .setColor(`#40BD66`)
      .setThumbnail(user.displayAvatarURL());
    const sent = await msg.channel.send(embed);
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
        const newCards = await PlayerService.getCardsByDiscordId(
          profile.discord_id,
          { ...options, limit: 10, page: page }
        );
        sent.edit(
          embed
            .setAuthor(`Inventory | ${user.tag} (page ${page}/${pageLimit})`)
            .setDescription(desc + (await this.renderInventory(newCards)))
        );
      } else if (r.emoji.name === "▶️" && page !== pageLimit) {
        page++;
        const newCards = await PlayerService.getCardsByDiscordId(
          profile.discord_id,
          { ...options, limit: 10, page: page }
        );
        sent.edit(
          embed
            .setAuthor(`Inventory | ${user.tag} (page ${page}/${pageLimit})`)
            .setDescription(desc + (await this.renderInventory(newCards)))
        );
      }
      r.users.remove(msg.author);
    });
    collector.on("end", async () => {
      if (!sent.deleted) sent.reactions.removeAll();
    });
  };
}
