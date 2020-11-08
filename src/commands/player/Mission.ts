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
      [0.125, (level.level / 100) * 0.25 + card.stars * 0.6]
    );
    let selected;
    if (!success) {
      selected = chance.pickone(mission.success);
    } else selected = chance.pickone(mission.failure);

    const multiplier = 1 + (level.level / 100) * 0.3 + card.stars * 0.2;
    const profit = Math.floor(
      chance.integer({
        min: 350,
        max: 430,
      }) * (multiplier > 2.2 ? 2.2 : multiplier)
    );

    await StatsService.missionComplete(executor, profit === 0 ? false : true);
    await PlayerService.addCoinsToProfile(executor, profit);
    await PlayerService.setLastMission(executor, now);

    //const xp = chance.integer({ min: 30, max: 72 });
    //if (profit !== 0) PlayerService.addXp(executor, xp);

    const embed = new MessageEmbed()
      .setAuthor(`Mission | ${msg.author.tag}`, msg.author.displayAvatarURL())
      .setDescription(
        `${
          profit === 0
            ? `${this.config.discord.emoji.cross.full}`
            : this.config.discord.emoji.check.full
        } ${selected.replace(
          `%M`,
          `**${card.member.replace(/ *\([^)]*\) * /g, "")}**`
        )}\n${
          profit === 0
            ? ``
            : `+ ${this.config.discord.emoji.cash.full} **${profit}**` //\n+ **${xp}** XP`
        }`
      )
      .setFooter(
        `You now have ${
          executor.coins + profit
        } cash.\nYou can do another mission in 45 minutes.`
      )
      .setColor(`FFAACC`);
    await msg.channel.send(embed);
  }
}
