import { Message, MessageEmbed } from "discord.js";
import { CardService } from "../../database/service/CardService";
import { PlayerService } from "../../database/service/PlayerService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import * as error from "../../structures/Error";

export class Command extends BaseCommand {
  names: string[] = ["upgrade", "up"];
  async exec(msg: Message, executor: Profile) {
    const reference = {
      identifier: this.options[0]?.split("#")[0],
      serial: parseInt(this.options[0]?.split("#")[1]),
    };
    if (isNaN(reference.serial)) throw new error.InvalidCardReferenceError();
    const card = await CardService.getCardDataFromReference(reference);

    if (card.ownerId !== msg.author.id)
      throw new error.NotYourCardError(reference);

    const amount = parseInt(this.options[1]);
    if (isNaN(amount) || amount < 1) throw new error.NotANumberError();
    if (amount > executor.hearts) throw new error.NotEnoughHeartsError();

    const levelCap = CardService.getLevelCap(card);
    const cardLevel = CardService.calculateLevel(card);
    if (cardLevel >= levelCap) throw new error.MaximumLevelError();

    const adjustedAmount =
      card.hearts + amount > levelCap * CardService.heartsPerLevel
        ? levelCap * CardService.heartsPerLevel - card.hearts
        : amount;
    const newCard = await CardService.addHeartsToCard(card, adjustedAmount);
    const newProfile = await PlayerService.removeHeartsFromProfile(
      executor,
      adjustedAmount
    );
    await CardService.updateCardCache(newCard);

    let newLevel = CardService.calculateLevel(newCard);

    let embed = new MessageEmbed()
      .setAuthor(`Upgrade | ${msg.author.tag}`, msg.author.displayAvatarURL())
      .setDescription(
        `${
          newLevel > cardLevel
            ? `${this.config.discord.emoji.chart.full} **LEVEL UP!** ${cardLevel} ~~-->~~ ${newLevel}\n`
            : ``
        } Upgraded **${newCard.abbreviation}#${newCard.serialNumber}** with ${
          this.config.discord.emoji.hearts.full
        } **${adjustedAmount.toLocaleString()}** *(${newCard.hearts.toLocaleString()} total)*`
      )
      .setFooter(`You now have ${newProfile.hearts.toLocaleString()} hearts.`)
      .setColor("#FFAACC");
    await msg.channel.send(embed);
    return;
  }
}
