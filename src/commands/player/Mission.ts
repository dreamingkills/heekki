import { Message, MessageEmbed } from "discord.js";
import { CardService } from "../../database/service/CardService";
import { PlayerService } from "../../database/service/PlayerService";
import { StatsService } from "../../database/service/StatsService";
import { BaseCommand } from "../../structures/command/Command";
import mission from "../../assets/missions.json";
import { Chance } from "chance";
import * as error from "../../structures/Error";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["mission"];
  exec = async (msg: Message, executor: Profile) => {
    if (!this.options[0]) {
      msg.channel.send("<:red_x:741454361007357993> Please specify a card.");
      return;
    }
    const reference = {
      identifier: this.options[0].split("#")[0],
      serial: parseInt(this.options[0].split("#")[1]),
    };
    if (!reference.identifier || isNaN(reference.serial)) {
      msg.channel.send(
        `<:red_x:741454361007357993> That serial number is invalid.`
      );
      return;
    }
    const card = await CardService.getCardDataFromReference(reference);

    if (card.ownerId !== msg.author.id) throw new error.NotYourCardError();

    const last = await PlayerService.getLastMission(executor);
    const now = Date.now();
    if (now < last + 2700000)
      throw new error.MissionCooldownError(last + 2700000, now);

    const chance = new Chance();
    const randomMission = chance.pickone(mission.missions);
    const baseReward = randomMission.baseReward;
    const level = CardService.heartsToLevel(card.hearts);
    const profit = Math.floor(
      chance.integer({
        min: baseReward - baseReward / 10,
        max: baseReward + baseReward / 10,
      }) *
        (1 + level.level / 100)
    );

    StatsService.missionComplete(executor, profit === 0 ? false : true);
    PlayerService.addCoinsToProfile(executor, profit);
    PlayerService.setLastMission(executor, now);

    const xp = chance.integer({ min: 30, max: 72 });
    PlayerService.addXp(executor, xp);

    const embed = new MessageEmbed()
      .setAuthor(`Mission | ${msg.author.tag}`, msg.author.displayAvatarURL())
      .setDescription(
        `${
          profit === 0 ? "<:red_x:741454361007357993>" : ":white_check_mark:"
        } ${randomMission.text.replace(
          `%M`,
          `**${card.member.replace(/ *\([^)]*\) * /g, "")}**`
        )}\n${
          profit === 0
            ? ``
            : `+ <:cash:757146832639098930> **${profit}**\n+ **${xp}** XP`
        }`
      )
      .setFooter(`You can do another mission in 45 minutes.`)
      .setColor(`FFAACC`);
    msg.channel.send(embed);
  };
}
