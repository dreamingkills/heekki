import { Message, MessageEmbed } from "discord.js";
import { CardService } from "../../database/service/CardService";
import { BaseCommand } from "../../structures/command/Command";
import * as error from "../../structures/Error";
import { Profile } from "../../structures/player/Profile";
import { PlayerService } from "../../database/service/PlayerService";

export class Command extends BaseCommand {
  names: string[] = ["prestige"];
  async exec(msg: Message, executor: Profile) {
    const reference = {
      identifier: this.options[0]?.split("#")[0],
      serial: parseInt(this.options[0]?.split("#")[1]),
    };
    if (isNaN(reference.serial)) throw new error.InvalidCardReferenceError();
    const card = await CardService.getCardDataFromReference(reference);

    if (card.ownerId !== msg.author.id) throw new error.NotYourCardError(card);
    const eden = await PlayerService.getEden(executor);
    if (CardService.cardInEden(card, eden))
      throw new error.CardInEdenError(card);
    if (card.stars >= 6) throw new error.MaxPrestigeError(card);

    //                  1-2  2-3 3-4  4-5  5-6
    const requirement = [30, 60, 120, 240, 480][card.stars - 1];
    if (executor.shards < requirement) throw new error.NotEnoughShardsError();

    const newProfile = await PlayerService.removeShardsFromProfile(
      executor,
      requirement
    );
    const newCard = await CardService.incrementCardStars(card);

    const embed = new MessageEmbed()
      .setAuthor(`Prestige | ${msg.author.tag}`, msg.author.displayAvatarURL())
      .setColor(`#FFAACC`)
      .setDescription(
        `${
          this.config.discord.emoji.check.full
        } Prestiged **${`${newCard.abbreviation}#${newCard.serialNumber}`}** for ${
          this.config.discord.emoji.shard.full
        } **${requirement}**.` +
          `\n**+ ${`${newCard.abbreviation}#${newCard.serialNumber}`}** — ${":star:".repeat(
            newCard.stars
          )}`
      )
      .setFooter(`You now have ${newProfile.shards.toLocaleString()} shards.`);
    await msg.channel.send(embed);
    return;
  }
}
