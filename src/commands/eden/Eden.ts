import { BaseCommand } from "../../structures/command/Command";
import { Message, MessageEmbed } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { Profile } from "../../structures/player/Profile";
import moment from "moment";
import * as error from "../../structures/Error";
import { CardService } from "../../database/service/CardService";
import { UserCard } from "../../structures/player/UserCard";

export class Command extends BaseCommand {
  names: string[] = ["eden"];
  private memberNames: string[] = [
    "HeeJin",
    "HyunJin",
    "HaSeul",
    "YeoJin",
    "ViVi",
    "Kim Lip",
    "JinSoul",
    "Choerry",
    "Yves",
    "Chuu",
    "Go Won",
    "Olivia Hye",
  ];

  private calculateHourlyRate(members: (UserCard | null)[]): number {
    let total = 0;
    const cards = members.filter((m) => m) as UserCard[];
    for (let card of cards) {
      console.log(card);
      const level = CardService.calculateLevel(card);
      total += Math.round(0.333 * level + 1.4 * card.stars);
    }
    return total;
  }

  async exec(msg: Message, executor: Profile): Promise<void> {
    const eden = await PlayerService.getEden(executor);
    await eden.convert();
    const members = [
      eden.heejin,
      eden.hyunjin,
      eden.haseul,
      eden.yeojin,
      eden.vivi,
      eden.kimlip,
      eden.jinsoul,
      eden.choerry,
      eden.yves,
      eden.chuu,
      eden.gowon,
      eden.oliviahye,
    ] as (UserCard | null)[];

    const subcommand = this.options[0]?.toLowerCase();
    if (subcommand === "add") {
      const reference = {
        identifier: this.options[1]?.split("#")[0],
        serial: parseInt(this.options[1]?.split("#")[1]),
      };
      if (isNaN(reference.serial)) throw new error.InvalidCardReferenceError();
      const card = await CardService.getCardDataFromReference(reference);
      if (this.memberNames.indexOf(card.member) < 0)
        throw new error.NotAMemberError();

      const member = card.member.replace(" ", "").toLowerCase();
      const edenMember = eden[member as keyof typeof eden];
      if (edenMember) {
        const cardInEden = <UserCard>edenMember;
        if (cardInEden.userCardId === card.userCardId)
          throw new error.CardAlreadyInEdenError(cardInEden);

        throw new error.DifferentCardInEdenError(cardInEden);
      }

      await PlayerService.addCardToEden(executor, member, card);
      members[this.memberNames.indexOf(card.member)] = card;

      const newEden = await PlayerService.setHourlyRate(
        executor,
        this.calculateHourlyRate(members)
      );
      await msg.channel.send(
        `${this.config.discord.emoji.check.full} Sent ${
          this.emojis[card.member]
        } **${`${card.abbreviation}#${card.serialNumber}`}** to Eden.\nYour new hourly rate is **${
          newEden.hourlyRate
        }**.`
      );
      return;
    } else if (subcommand === "remove") {
      const reference = {
        identifier: this.options[1]?.split("#")[0],
        serial: parseInt(this.options[1]?.split("#")[1]),
      };
      if (isNaN(reference.serial)) throw new error.InvalidCardReferenceError();
      const card = await CardService.getCardDataFromReference(reference);
      if (this.memberNames.indexOf(card.member) < 0)
        throw new error.NotAMemberError();

      const member = card.member.replace(" ", "").toLowerCase();
      let edenMember = eden[member as keyof typeof eden];
      if (!edenMember) throw new error.NoMemberInEdenError(card.member);
      edenMember = <UserCard>edenMember;

      if (edenMember.userCardId !== card.userCardId)
        throw new error.CardNotInEdenError(card);

      await PlayerService.removeCardFromEden(executor, member);
      members[this.memberNames.indexOf(card.member)] = null;

      const newEden = await PlayerService.setHourlyRate(
        executor,
        this.calculateHourlyRate(members)
      );

      await msg.channel.send(
        `${this.config.discord.emoji.check.full} ${
          this.emojis[card.member]
        } **${`${card.abbreviation}#${card.serialNumber}`}** returned from Eden.\nYour new hourly rate is **${
          newEden.hourlyRate
        }**.`
      );
      return;
    } else if (subcommand === "members") {
      const desc = members.map((m, i) => {
        if (m instanceof UserCard) {
          return `${this.emojis[m.member]} Level ${CardService.calculateLevel(
            m
          )} **${CardService.cardToReference(m)} — ${":star:".repeat(
            m.stars
          )}**`;
        } else return `${this.emojis[this.memberNames[i]]} **None!**`;
      });

      const embed = new MessageEmbed()
        .setAuthor(`Eden | ${msg.author.tag}`, msg.author.displayAvatarURL())
        .setDescription(desc)
        .setColor(`#FFAACC`);
      await msg.channel.send(embed);
      return;
    }

    const numberOfMembers = members.filter((m) => m).length;
    let desc =
      `:woman_astronaut: **Members**: \`${numberOfMembers}/12\`` +
      `\n${this.config.discord.emoji.cash.full} **Collected**: \`${eden.cash}/${eden.cap}\` (${eden.hourlyRate}/h)`;

    if (eden.multiplierEnds > Date.now()) {
      const now = moment(Date.now());
      const ending = moment(eden.multiplierEnds);
      const diffH = ending.diff(now, "hours");
      const diffM = ending.diff(now, "minutes") - diffH * 60;
      const diffS =
        ending.diff(now, "seconds") - ending.diff(now, "minutes") * 60;
      desc +=
        `\n\n:sparkles: **Bonus**: \`${eden.multiplier}x\`` +
        `\n— *time remaining:* \`${diffH}h ${diffM}m ${diffS}s\``;
    }
    const embed = new MessageEmbed()
      .setAuthor(`Eden | ${msg.author.tag}`, msg.author.displayAvatarURL())
      .setDescription(desc)
      .setColor(`#FFAACC`)
      .setFooter(
        `\nCollect your cash — ${this.bot.getPrefix(msg.guild!.id)}eden collect`
      )
      .setThumbnail(
        `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/national-park_1f3de.png`
      );

    await msg.channel.send(embed);
    return;
  }
}
