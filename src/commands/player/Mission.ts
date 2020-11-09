import { Message, MessageEmbed } from "discord.js";
import { CardService } from "../../database/service/CardService";
import { PlayerService } from "../../database/service/PlayerService";
import { StatsService } from "../../database/service/StatsService";
import { BaseCommand } from "../../structures/command/Command";
import mission from "../../assets/missions.json";
import { Chance } from "chance";
import * as error from "../../structures/Error";
import { Profile } from "../../structures/player/Profile";
import { UserCardService } from "../../database/service/UserCardService";

export class Command extends BaseCommand {
  names: string[] = ["mission", "m"];
  async exec(msg: Message, executor: Profile) {
    const reference = {
      identifier: this.options[0]?.split("#")[0],
      serial: parseInt(this.options[0]?.split("#")[1]),
    };
    let card;
    if (!reference.identifier && executor.cardPriority !== 0) {
      card = await UserCardService.getUserCardById(executor.cardPriority);
    } else {
      if (isNaN(reference.serial) && executor.cardPriority === 0)
        throw new error.InvalidCardReferenceError();
      card = await CardService.getCardDataFromReference(reference);
    }

    if (card.ownerId !== msg.author.id)
      throw new error.NotYourCardError(reference);

    const last = executor.lastMission;
    const now = Date.now();
    if (now < last + 2700000)
      throw new error.MissionCooldownError(last + 2700000, now);

    const chance = new Chance();
    const level = CardService.heartsToLevel(card.hearts);
    const success = chance.weighted(
      [false, true],
      [0.6, 0.4 + (level.level / 100) * 0.12 + card.stars * 0.35]
    );
    let selected;
    if (success) {
      selected = chance.pickone(mission.success);
    } else selected = chance.pickone(mission.failure);

    //const xp = chance.integer({ min: 30, max: 72 });
    //if (profit !== 0) PlayerService.addXp(executor, xp);
    let embed: MessageEmbed;

    if (success) {
      const multiplier = 0.8 + (level.level / 100) * 0.06 + card.stars * 0.11;
      const profit = Math.floor(
        chance.integer({
          min: 350,
          max: 430,
        }) * (multiplier > 1.5 ? 1.5 : multiplier)
      );

      await PlayerService.addCoinsToProfile(executor, profit);
      embed = new MessageEmbed()
        .setAuthor(`Mission | ${msg.author.tag}`, msg.author.displayAvatarURL())
        .setDescription(
          `${this.config.discord.emoji.check.full} ${selected.replace(
            `%M`,
            `**${card.member.replace(/ *\([^)]*\) * /g, "")}**`
          )}\n${
            `+ ${this.config.discord.emoji.cash.full} **${profit}**` //\n+ **${xp}** XP`
          }`
        )
        .setFooter(
          `You now have ${
            executor.coins + profit
          } cash.\nYou can do another mission in 45 minutes.`
        )
        .setColor(`FFAACC`);
    } else {
      embed = new MessageEmbed()
        .setAuthor(`Mission | ${msg.author.tag}`, msg.author.displayAvatarURL())
        .setDescription(
          `${`${this.config.discord.emoji.cross.full}`} ${selected.replace(
            `%M`,
            `**${card.member.replace(/ *\([^)]*\) * /g, "")}**`
          )}`
        )
        .setFooter(
          `You can do another mission in 45 minutes.\nUpgrade your card to fail less!`
        )
        .setColor(`FFAACC`);
    }
    await msg.channel.send(embed);
    await StatsService.missionComplete(executor, success);
    await PlayerService.setLastMission(executor, now);
  }
}
