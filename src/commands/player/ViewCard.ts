import {
  Message,
  MessageEmbed,
  User,
  MessageReaction,
  TextChannel,
} from "discord.js";
import { CardService } from "../../database/service/CardService";
import { ShopService } from "../../database/service/ShopService";
import { UserCardService } from "../../database/service/UserCardService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["card", "show", "view"];
  async exec(msg: Message, executor: Profile) {
    let card;
    if (this.options[0].toLowerCase() === "last") {
      card = await UserCardService.getLastCard(executor);
    } else {
      const reference = {
        identifier: this.options[0]?.split("#")[0],
        serial: parseInt(this.options[0]?.split("#")[1]),
      };
      if (isNaN(reference.serial)) {
        await msg.channel.send(
          `<:red_x:741454361007357993> That isn't a valid card reference.`
        );
        return;
      }
      card = await CardService.getCardDataFromReference(reference);
      if (card.ownerId !== msg.author.id) {
        await msg.channel.send(
          `<:red_x:741454361007357993> That card doesn't belong to you.`
        );
        return;
      }
    }

    const pack = await ShopService.getPackById(card.packId);
    const imageData = await CardService.getImageDataFromCard(card);
    const image = await CardService.generateCardImageFromUserCard(
      card,
      imageData
    );

    let embed = new MessageEmbed()
      .setAuthor(
        `Card View | ${card.abbreviation}#${card.serialNumber}`,
        msg.author.displayAvatarURL()
      )
      .setDescription(
        `${card.blurb != "" ? `*"${card.blurb}"*` : ``}\n**Owner**: ${
          card.ownerId == "0" ? "no-one!" : `<@${card.ownerId}>`
        }\n<:heekki_heart:757147742383505488> **${card.hearts}**\n⭐ **${
          card.stars
        }**`
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
      collector.on("collect", async (r) => {
        await (<TextChannel>msg.channel).bulkDelete([sent, msg]);
      });
    }
  }
}
