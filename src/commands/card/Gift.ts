import { Message, MessageReaction, User } from "discord.js";
import { CardService } from "../../database/service/CardService";
import { UserCard } from "../../structures/player/UserCard";
import { MarketService } from "../../database/service/MarketService";
import { PlayerService } from "../../database/service/PlayerService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["gift"];
  async exec(msg: Message, executor: Profile) {
    const eden = await PlayerService.getEden(executor);
    const references = this.options.filter((p) => p.includes("#"));
    const cardList = await Promise.all(
      references.map(async (p) => {
        return await CardService.getCardDataFromReference({
          identifier: p?.split("#")[0],
          serial: parseInt(p?.split("#")[1]),
        });
      })
    );
    if (cardList.length < 1) {
      await msg.channel.send(
        `${this.config.discord.emoji.cross.full} You haven't specified any cards!`
      );
      return;
    }

    const mention = msg.mentions.users.first();
    if (!mention) {
      await msg.channel.send(
        `${this.config.discord.emoji.cross.full} Please mention a user.`
      );
      return;
    }
    if (mention.id === msg.author.id) {
      await msg.channel.send(
        `${this.config.discord.emoji.cross.full} You can't gift cards to yourself!`
      );
      return;
    }
    const profile = await PlayerService.getProfileByDiscordId(mention.id);

    //Validations
    let validCards: UserCard[] = [];
    let invalidMessage = "";
    for (let c of cardList) {
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
      if (CardService.cardInEden(c, eden)) {
        invalidMessage += `\nYour card **${CardService.cardToReference(
          c
        )}** is currently in Eden.`;
        continue;
      }
      validCards.push(c!);
    }

    if (invalidMessage)
      await msg.channel.send(
        `${this.config.discord.emoji.cross.full} ${
          validCards.length === 0 ? "All" : "Some"
        } of the cards you specified were invalid:` + invalidMessage
      );
    if (validCards.length === 0) return;
    const confirmation = await msg.channel.send(
      `:warning: Really gift **${validCards.length}** card(s) to **${
        mention.tag
      }**?\nThis action is **irreversible**! React with ${
        this.config.discord.emoji.check.full
      } to confirm.\n${validCards
        .map((v) => {
          return `- ${v.abbreviation}#${v.serialNumber}`;
        })
        .join("\n")}`
    );

    await confirmation.react(this.config.discord.emoji.check.id);
    const filter = (reaction: MessageReaction, user: User) => {
      return (
        reaction.emoji.id === this.config.discord.emoji.check.id &&
        user.id == msg.author.id
      );
    };
    const reactions = confirmation.createReactionCollector(filter, {
      max: 1,
      time: 15000,
    });

    reactions.on("collect", async () => {
      await CardService.transferCards(profile.discord_id, validCards);
      await confirmation.edit(
        `${this.config.discord.emoji.check.full} Gifted **${validCards.length}** cards to **${mention.tag}**!`
      );
    });
    reactions.on("end", async (_, reason: string) => {
      if (reason !== "limit") {
        await confirmation.edit(
          `${this.config.discord.emoji.cross.full} You didn't react in time!`
        );
        if (this.permissions.MANAGE_MESSAGES)
          confirmation.reactions.removeAll();
      }
      return;
    });
  }
}
