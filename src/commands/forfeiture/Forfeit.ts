import { Message, MessageReaction, User } from "discord.js";
import { CardService } from "../../database/service/CardService";
import { BaseCommand } from "../../structures/command/Command";
import { MarketService } from "../../database/service/MarketService";
import { UserCard } from "../../structures/player/UserCard";

export class Command extends BaseCommand {
  names: string[] = ["forfeit", "ff"];
  disabled: boolean = true;
  async exec(msg: Message) {
    const referencesRaw = this.options
      .filter((p) => p.includes("#"))
      .slice(0, 9);
    const cards = [];
    for (let ref of referencesRaw) {
      const reference = {
        identifier: ref.split("#")[0],
        serial: parseInt(ref.split("#")[1]),
      };
      if (!reference.identifier || isNaN(reference.serial)) continue;
      const card = await CardService.getCardDataFromReference(reference);
      cards.push(card);
    }

    if (cards.length === 0) {
      await msg.channel.send(
        `${this.bot.config.discord.emoji.cross.full} You didn't enter any valid cards.`
      );
      return;
    }

    let validCards: UserCard[] = [];
    let invalidMessage = "";
    for (let c of cards) {
      if (c.ownerId != msg.author.id) {
        invalidMessage += `\nYou are not the owner of **${c.abbreviation}#${c.serialNumber}**!`;
        continue;
      }
      if (c.isFavorite) {
        invalidMessage += `\nYour card **${c.abbreviation}#${c.serialNumber}** is currently favorited.`;
        continue;
      }
      if ((await MarketService.cardIsOnMarketplace(c)).forSale) {
        invalidMessage += `\nYour card **${c.abbreviation}#${c.serialNumber}** is currently on the marketplace.`;
        continue;
      }
      validCards.push(c!);
    }

    if (invalidMessage)
      await msg.channel.send(
        `${this.bot.config.discord.emoji.cross.full} ${
          validCards.length === 0 ? "All" : "Some"
        } of the cards you specified were invalid:` + invalidMessage
      );
    if (validCards.length === 0) return;
    let conf = await msg.channel.send(
      `:warning: Really forfeit **${validCards.length}** cards?\nThis action is **irreversible**. React to this message with ${this.bot.config.discord.emoji.check.full} to confirm.`
    );
    await conf.react(this.bot.config.discord.emoji.check.id);
    let filter = (reaction: MessageReaction, user: User) => {
      return (
        reaction.emoji.id == this.bot.config.discord.emoji.check.id &&
        user.id == msg.author.id
      );
    };
    let collector = conf.createReactionCollector(filter, {
      max: 1,
      time: 10000,
    });

    collector.on("collect", async () => {
      await CardService.transferCards("0", validCards);

      await conf.edit(
        `${this.bot.config.discord.emoji.check.full} You forfeited **${validCards.length}** cards.`
      );
      collector.stop();
    });
    collector.on("end", async (_, reason) => {
      if (reason === "time") {
        await conf.edit(
          `${this.bot.config.discord.emoji.cross.full} You did not react in time, so the forfeiture has been cancelled.`
        );
      }
      if (this.permissions.MANAGE_MESSAGES) await conf.reactions.removeAll();
    });
  }
}
