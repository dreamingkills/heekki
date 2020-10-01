import { Message, MessageEmbed } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { BaseCommand } from "../../structures/command/Command";
import Chance from "chance";
import { Profile } from "../../structures/player/Profile";
import * as error from "../../structures/Error";
import { CardService } from "../../database/service/CardService";
import { UserCardService } from "../../database/service/UserCardService";

export class Command extends BaseCommand {
  names: string[] = ["daily"];
  exec = async (msg: Message, executor: Profile) => {
    const last = await PlayerService.getLastDaily(executor);
    const now = Date.now();
    if (now < last + 86400000)
      throw new error.DailyCooldownError(last + 86400000, now);

    const chance = new Chance();
    const type = chance.weighted(["card", "coins"], [0.1, 1]);
    let reward = `:white_check_mark: You claimed your daily reward.\n`;
    if (type === "card") {
      const randomCard = await CardService.getRandomCard();
      const starCount = chance.weighted(
        [1, 2, 3, 4, 5, 6],
        [52.3, 31.7, 24.7, 13.1, 3.4, 0.54]
      );
      const newCard = await UserCardService.createNewUserCard(
        executor,
        randomCard,
        starCount,
        0,
        true
      );
      reward += `+ **${newCard.abbreviation}#${newCard.serialNumber}**`;
    } else if (type === "coins") {
      await PlayerService.addCoinsToProfile(executor, 1000);
      reward += `+ <:cash:757146832639098930> **1000**`;
    }

    PlayerService.setLastDaily(executor, now);
    const xp = chance.integer({ min: 180, max: 242 });
    PlayerService.addXp(executor, xp);

    const embed = new MessageEmbed()
      .setAuthor(
        `Daily Reward | ${msg.author.tag}`,
        msg.author.displayAvatarURL()
      )
      .setDescription(reward + `\n+ **${xp}** XP`)
      .setFooter(`You can claim your daily reward again in 24 hours.`)
      .setColor(`#FFAACC`);
    msg.channel.send(embed);
  };
}
