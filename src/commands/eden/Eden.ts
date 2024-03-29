import { BaseCommand } from "../../structures/command/Command";
import { Message, MessageEmbed } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { Profile } from "../../structures/player/Profile";
import moment from "moment";
import * as error from "../../structures/Error";
import { CardService } from "../../database/service/CardService";
import { UserCard } from "../../structures/player/UserCard";
import { MarketService } from "../../database/service/MarketService";

export class Command extends BaseCommand {
  names: string[] = ["eden", "e"];
  private memberNames: string[] = [
    "HeeJin",
    "HyunJin",
    "HaSeul",
    "YeoJin",
    "Vivi",
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
      const level = CardService.calculateLevel(card);
      total += Math.round(0.25 * level + 1.4 * card.stars);
    }
    return total;
  }

  async exec(msg: Message, executor: Profile): Promise<void> {
    const prefix = this.bot.getPrefix(msg.guild!.id);
    const eden = await PlayerService.getEden(executor);
    await eden.convert();
    const members = [
      eden.HeeJin,
      eden.HyunJin,
      eden.HaSeul,
      eden.YeoJin,
      eden.Vivi,
      eden["Kim Lip"],
      eden.JinSoul,
      eden.Choerry,
      eden.Yves,
      eden.Chuu,
      eden["Go Won"],
      eden["Olivia Hye"],
    ] as (UserCard | null)[];

    const subcommand = this.options[0]?.toLowerCase().trim();
    if (subcommand === "collect") {
      if (eden.cash === 0) throw new error.NoCashInEdenError();
      await PlayerService.clearEdenCash(executor);
      const newProfile = await PlayerService.addCoinsToProfile(
        executor,
        eden.cash
      );

      const embed = new MessageEmbed()
        .setAuthor(`Eden | ${msg.author.tag}`, msg.author.displayAvatarURL())
        .setDescription(
          `${this.bot.config.discord.emoji.check.full} Collected ${
            this.bot.config.discord.emoji.cash.full
          } **${eden.cash.toLocaleString()}** from Eden.`
        )
        .setFooter(`You now have ${newProfile.coins.toLocaleString()} cash.`)
        .setColor(`#FFAACC`);
      await msg.channel.send(embed);
      return;
    } else if (subcommand === "add") {
      const reference = {
        identifier: this.options[1]?.split("#")[0],
        serial: parseInt(this.options[1]?.split("#")[1]),
      };
      if (isNaN(reference.serial)) throw new error.InvalidCardReferenceError();
      const card = await CardService.getCardDataFromReference(reference);
      if (card.ownerId !== msg.author.id)
        throw new error.NotYourCardError(card);
      if ((await MarketService.cardIsOnMarketplace(card)).forSale)
        throw new error.CardOnMarketplaceError(card, prefix);

      if (this.memberNames.indexOf(card.member) < 0)
        throw new error.NotAMemberError();

      const edenMember = eden[card.member as keyof typeof eden];
      if (edenMember) {
        const cardInEden = <UserCard>edenMember;
        if (cardInEden.userCardId === card.userCardId)
          throw new error.CardAlreadyInEdenError(cardInEden);

        throw new error.DifferentCardInEdenError(cardInEden);
      }

      await PlayerService.addCardToEden(
        executor,
        card.member.replace(" ", "").toLowerCase(),
        card
      );
      members[this.memberNames.indexOf(card.member)] = card;

      const newEden = await PlayerService.setHourlyRate(
        executor,
        this.calculateHourlyRate(members)
      );

      const embed = new MessageEmbed()
        .setAuthor(`Eden | ${msg.author.tag}`, msg.author.displayAvatarURL())
        .setDescription(
          `${this.bot.config.discord.emoji.check.full} Sent ${
            this.emojis[card.member]
          } **${`${card.abbreviation}#${card.serialNumber}`}** to Eden.`
        )
        .setFooter(`Eden now makes ${newEden.hourlyRate} cash per hour.`)
        .setColor(`#FFAACC`);
      await msg.channel.send(embed);
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

      let edenMember = eden[card.member as keyof typeof eden];
      if (!edenMember) throw new error.NoMemberInEdenError(card.member);
      edenMember = <UserCard>edenMember;

      if (edenMember.userCardId !== card.userCardId)
        throw new error.CardNotInEdenError(card);

      await PlayerService.removeCardFromEden(
        executor,
        card.member.replace(" ", "").toLowerCase()
      );
      members[this.memberNames.indexOf(card.member)] = null;

      const newEden = await PlayerService.setHourlyRate(
        executor,
        this.calculateHourlyRate(members)
      );

      const embed = new MessageEmbed()
        .setAuthor(`Eden | ${msg.author.tag}`, msg.author.displayAvatarURL())
        .setDescription(
          `${
            this.emojis[card.member]
          } **${`${card.abbreviation}#${card.serialNumber}`}** returned from Eden.`
        )
        .setFooter(`Eden now makes ${newEden.hourlyRate} cash per hour.`)
        .setColor(`#FFAACC`);
      await msg.channel.send(embed);
      return;
    } else if (subcommand === "members") {
      const desc = members.map((m, i) => {
        if (m instanceof UserCard) {
          return `${this.emojis[m.member]} Level ${CardService.calculateLevel(
            m
          )} **${CardService.cardToReference(m)}** — ${":star:".repeat(
            m.stars
          )}`;
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
      `\n${this.bot.config.discord.emoji.cash.full} **Collected**: \`${eden.cash}/${eden.cap}\` (${eden.hourlyRate}/h)`;

    if (eden.multiplierEnds > Date.now()) {
      const now = moment(Date.now());
      const ending = moment(eden.multiplierEnds);
      const diffD = ending.diff(now, "days");
      const diffH = ending.diff(now, "hours") - diffD * 24;
      const diffM =
        ending.diff(now, "minutes") - ending.diff(now, "hours") * 60;
      const diffS =
        ending.diff(now, "seconds") - ending.diff(now, "minutes") * 60;

      const diffMessage = `${diffD > 0 ? `${diffD}d ` : ``}${
        diffH > 0 ? `${diffH}h ` : ``
      }${diffM > 0 ? `${diffM}m ` : ``}${diffS > 0 ? `${diffS}s` : ``}`;
      desc +=
        `\n\n:sparkles: **Bonus**: \`${eden.multiplier}x\` (${Math.round(
          eden.hourlyRate * eden.multiplier
        )}/h)` + `\n— *bonus expires in:* \`${diffMessage}\``;
    }

    desc +=
      `\n\n**Subcommands**` +
      `\n\`\`\`` +
      `\n${prefix}eden collect` +
      `\n${prefix}eden members` +
      `\n${prefix}eden add/remove <card>` +
      `\n\`\`\``;
    const embed = new MessageEmbed()
      .setAuthor(`Eden | ${msg.author.tag}`, msg.author.displayAvatarURL())
      .setDescription(desc)
      .setColor(`#FFAACC`)
      .setThumbnail(
        `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/national-park_1f3de.png`
      );

    await msg.channel.send(embed);
    return;
  }
}
