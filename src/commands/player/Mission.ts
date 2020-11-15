import { Message, MessageEmbed } from "discord.js";
import { CardService } from "../../database/service/CardService";
import { PlayerService } from "../../database/service/PlayerService";
// import { StatsService } from "../../database/service/StatsService";
import { BaseCommand } from "../../structures/command/Command";
import mission from "../../assets/missions.json";
import { Chance } from "chance";
import * as error from "../../structures/Error";
import { Profile } from "../../structures/player/Profile";
import moment from "moment";

export class Command extends BaseCommand {
  names: string[] = ["mission", "m"];
  async exec(msg: Message, executor: Profile) {
    const reference = {
      identifier: this.options[0]?.split("#")[0],
      serial: parseInt(this.options[0]?.split("#")[1]),
    };
    let card;
    if (!reference.identifier && executor.cardPriority !== 0) {
      card = await CardService.getUserCardById(executor.cardPriority);
    } else {
      if (isNaN(reference.serial) && executor.cardPriority === 0)
        throw new error.InvalidCardReferenceError();
      card = await CardService.getCardDataFromReference(reference);
    }

    if (card.ownerId !== msg.author.id)
      throw new error.NotYourCardError(reference);

    if (Date.now() < executor.missionNext)
      throw new error.MissionCooldownError(executor.missionNext, Date.now());

    const eden = await PlayerService.getEden(executor);
    if (CardService.cardInEden(card, eden)) {
      throw new error.CardInEdenError(card);
    }

    const base = 0.34768125;
    const cardLevel = CardService.calculateLevel(card);
    const luckCoefficient = 1.23 * card.stars + 0.0125 * cardLevel;
    const chance = new Chance();
    const success = chance.weighted([false, true], [base, luckCoefficient]);

    let text;
    if (success) {
      text = chance.pickone(mission.success);
    } else text = chance.pickone(mission.failure);
    text = text.replace("%M", `**${card.member}**`);

    let embed = new MessageEmbed()
      .setAuthor(`Mission | ${msg.author.tag}`, msg.author.displayAvatarURL())
      .setColor(`#FFAACC`);
    if (success) {
      const reward = chance.weighted(
        ["card", "shards", "cash"],
        [10, 20, 1000]
      );
      embed.setDescription(`${this.config.discord.emoji.check.full} ${text}`);

      if (reward === "card") {
        const cardType = await CardService.getRandomCard();
        const stars = chance.weighted(
          [1, 2, 3, 4],
          [1000 / 2.5, 500 / 1.75, 200 * 2, 66.66666667 * 2]
        );
        const newCard = await CardService.createNewUserCard(
          executor,
          cardType,
          stars,
          0,
          true,
          0,
          true
        );

        embed.description += `\n**+ ${this.config.discord.emoji.cards.full} ${
          newCard.abbreviation + `#` + newCard.serialNumber
        }** — ${`:star:`.repeat(newCard.stars)}`;
      } else if (reward === "shards") {
        const profit = Math.floor(chance.integer({ min: 1, max: 4 }));
        const newProfile = await PlayerService.addShardsToProfile(
          executor,
          profit
        );

        embed.description += `\n**+ ${
          this.config.discord.emoji.shard.full
        }${profit}** *(${newProfile.shards.toLocaleString()} total)*`;
      } else if (reward === "cash") {
        const profit = Math.floor(chance.integer({ min: 15, max: 25 }));
        const newProfile = await PlayerService.addCoinsToProfile(
          executor,
          profit
        );

        embed.description += `\n**+ ${
          this.config.discord.emoji.cash.full
        } ${profit}** *(${newProfile.coins.toLocaleString()} total)*`;
      }
    } else {
      embed.setDescription(`${this.config.discord.emoji.cross.full} ${text}`);
    }

    const now = Date.now();
    const timeout = (45 - ((card.stars * cardLevel) / 600) * 15) * 60 * 1000;
    const nextMoment = moment(now + timeout);
    const nextMinutes = nextMoment.diff(now, "minutes");
    const nextSeconds = nextMoment.diff(now, "seconds") - nextMinutes * 60;

    await PlayerService.setLastMission(executor, now + timeout);
    embed.setFooter(
      `You can do another mission in ${nextMinutes}m ${nextSeconds}s.`
    );
    await msg.channel.send(embed);
  }
}
