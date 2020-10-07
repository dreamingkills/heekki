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
      msg.channel.send(
        `<:red_x:741454361007357993> Please enter an amount of hearts to upgrade your card with.`
      );
      return;
    }
    if (isNaN(reference.serial)) throw new error.InvalidCardReferenceError();
    const card = await CardService.getCardDataFromReference(reference);

    if (card.ownerId !== msg.author.id)
      throw new error.NotYourCardError(reference);
    if (amount > executor.hearts)
      throw new error.NotEnoughHeartsError(executor.hearts, amount);
    await CardService.upgradeCard(amount, card);
    await PlayerService.removeHeartsFromProfile(executor, amount);

    let beforeLevel = CardService.heartsToLevel(card.hearts).level;
    let afterLevel = CardService.heartsToLevel(card.hearts + amount).level;

    let embed = new MessageEmbed()
      .setAuthor(`Upgrade | ${msg.author.tag}`, msg.author.displayAvatarURL())
      .setDescription(
        `${
          afterLevel > beforeLevel
            ? `:tada: **LEVEL UP!** ${beforeLevel} ~~-->~~ ${afterLevel}\n`
            : ``
        } Successfully added <:heekki_heart:757147742383505488> **${
          this.options[1]
        }** to **${card.abbreviation}#${
          card.serialNumber
        }**.\nYour card now has <:heekki_heart:757147742383505488> **${
          card.hearts + amount
        }**.`
      )
      .setFooter(`You now have ${executor.hearts - amount} hearts.`)
      .setColor("#FFAACC");
    msg.channel.send(embed);
  }
}
