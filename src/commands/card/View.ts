import { Message, MessageEmbed, User, MessageReaction } from "discord.js";
import { CardService } from "../../database/service/CardService";
import { ShopService } from "../../database/service/ShopService";
import { UserCardService } from "../../database/service/UserCardService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import * as error from "../../structures/Error";

export class Command extends BaseCommand {
  names: string[] = ["card", "show", "view"];
  async exec(msg: Message, executor: Profile) {
    let card;
    if (this.options[0]?.toLowerCase() === "last") {
      card = await UserCardService.getLastCard(executor);
    } else {
      const reference = {
        identifier: this.options[0]?.split("#")[0],
        serial: parseInt(this.options[0]?.split("#")[1]),
      };
      if (isNaN(reference.serial)) throw new error.InvalidCardReferenceError();
      card = await CardService.getCardDataFromReference(reference);
      if (card.ownerId !== msg.author.id)
        throw new error.NotYourCardError(reference);
    }

    const pack = await ShopService.getPackById(card.packId);
    const image = await CardService.checkCacheForCard(card);

    let embed = new MessageEmbed()
      .setAuthor(
        `Card View | ${card.abbreviation}#${card.serialNumber}`,
        msg.author.displayAvatarURL()
      )
      .setDescription(
        `${card.blurb != "" ? `*"${card.blurb}"*` : ``}\n${
          this.config.discord.emoji.hearts.full
        } **${card.hearts}**\n⭐ **${card.stars}**`
      )
      .setColor("#FFAACC")
      .setFooter(
        `Designed by ${pack.credit} - ${Date.now() - msg.createdTimestamp}ms`
      );
    const sent = await msg.channel.send({ embed: embed, files: [image] });

    if (this.permissions.MANAGE_MESSAGES) {
      await sent.react(`753019858932727868`);
      const collector = sent.createReactionCollector(
        (reaction: MessageReaction, user: User) =>
          reaction.emoji.id === "753019858932727868" &&
          user.id === msg.author.id
      );
      collector.on("collect", async () => await sent.delete());
    }
  }
}
