import { Message, MessageReaction, User } from "discord.js";
import { CardService } from "../../database/service/CardService";
import { UserCard } from "../../structures/player/UserCard";
import { MarketService } from "../../database/service/MarketService";
import { UserCardService } from "../../database/service/UserCardService";
import { PlayerService } from "../../database/service/PlayerService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["gift"];
  async exec(msg: Message, executor: Profile) {
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
      msg.channel.send(
        "<:red_x:741454361007357993> You haven't specified any cards!"
      );
      return;
    }

    const mention = msg.mentions.users.first();
    if (!mention) {
      msg.channel.send(`<:red_x:741454361007357993> Please mention a user.`);
      return;
    }
    if (mention.id === msg.author.id) {
      msg.channel.send(
        `<:red_x:741454361007357993> You can't gift cards to yourself!`
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
      validCards.push(c!);
    }

    if (invalidMessage)
      await msg.channel.send(
        `<:red_x:741454361007357993> ${
          validCards.length === 0 ? "All" : "Some"
        } of the cards you specified were invalid:` + invalidMessage
      );
    if (validCards.length === 0) return;
    const confirmation = await msg.channel.send(
      `:warning: Really gift **${validCards.length}** card(s) to **${
        mention.tag
      }**?\nThis action is **irreversible**! React with :white_check_mark: to confirm.\n${validCards
        .map((v) => {
          return `- ${v.abbreviation}#${v.serialNumber}`;
        })
        .join("\n")}`
    );

    confirmation.react("✅");
    const filter = (reaction: MessageReaction, user: User) => {
      return reaction.emoji.name === "✅" && user.id == msg.author.id;
    };
    const reactions = confirmation.createReactionCollector(filter, {
      max: 1,
      time: 15000,
    });

    reactions.on("collect", async () => {
      await UserCardService.transferCards(profile.discord_id, validCards);
      confirmation.edit(
        `:white_check_mark: Gifted **${validCards.length}** cards to **${mention.tag}**!`
      );
      reactions.stop("ok");
      return;
    });
    reactions.on("end", async (reason: string) => {
      if (reason !== "ok") {
        confirmation.edit(
          `<:red_x:741454361007357993> You didn't react in time!`
        );
        if (this.permissions.MANAGE_MESSAGES)
          confirmation.reactions.removeAll();
      }
    });
  }
}
