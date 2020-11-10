import { Message, MessageEmbed } from "discord.js";
import { CardService } from "../../database/service/CardService";
import { PlayerService } from "../../database/service/PlayerService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import * as error from "../../structures/Error";

export class Command extends BaseCommand {
  names: string[] = ["upgrade"];
  async exec(msg: Message, executor: Profile) {
    const reference = {
      identifier: this.options[0]?.split("#")[0],
      serial: parseInt(this.options[0]?.split("#")[1]),
    };
    const amount = parseInt(this.options[1]);
    if (isNaN(amount)) {
      await msg.channel.send(
        `${this.config.discord.emoji.cross.full} Please enter an amount of hearts to upgrade your card with.`
      );
      return;
    }
    if (isNaN(reference.serial)) throw new error.InvalidCardReferenceError();
    const card = await CardService.getCardDataFromReference(reference);

    if (card.ownerId !== msg.author.id)
      throw new error.NotYourCardError(reference);
    if (amount > executor.hearts) throw new error.NotEnoughHeartsError();

    const upgraded = await CardService.upgradeCard(amount, card);
    await PlayerService.removeHeartsFromProfile(executor, amount);

    let beforeLevel = CardService.heartsToLevel(card.hearts).level;
    let afterLevel = CardService.heartsToLevel(upgraded.hearts).level;

    let embed = new MessageEmbed()
      .setAuthor(`Upgrade | ${msg.author.tag}`, msg.author.displayAvatarURL())
      .setDescription(
        `${
          afterLevel > beforeLevel
            ? `:tada: **LEVEL UP!** ${beforeLevel} ~~-->~~ ${afterLevel}\n`
            : ``
        } Successfully added ${this.config.discord.emoji.hearts.full} **${
          this.options[1]
        }** to **${upgraded.abbreviation}#${
          upgraded.serialNumber
        }**.\nYour card now has ${this.config.discord.emoji.hearts.full} **${
          upgraded.hearts
        }**.`
      )
      .setFooter(`You now have ${executor.hearts - amount} hearts.`)
      .setColor("#FFAACC");
    await msg.channel.send(embed);
    await CardService.updateCardCache(upgraded);
    return;
  }
}