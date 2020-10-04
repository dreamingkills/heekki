import {
  EmbedField,
  Message,
  MessageEmbed,
  MessageReaction,
  TextChannel,
  User,
} from "discord.js";
import { CardService } from "../../database/service/CardService";
import { MarketService } from "../../database/service/MarketService";
import { PlayerService } from "../../database/service/PlayerService";
import { StatsService } from "../../database/service/StatsService";
import { UserCardService } from "../../database/service/UserCardService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import { UserCard } from "../../structures/player/UserCard";
import { Chance } from "chance";
import * as error from "../../structures/Error";
import { TradeService } from "../../database/service/TradeService";

export class Command extends BaseCommand {
  names: string[] = ["trade"];

  async exec(msg: Message, executor: Profile) {
    /*const subcommand = this.options[0];

    const tradeeUser = msg.mentions.members?.first();
    if (!tradeeUser) throw new error.InvalidMemberError();

    const tradee = PlayerService.getProfileByDiscordId(tradeeUser.id);

    const spaceOnLeftSide = msg.author.username.length + 8;
    const panel = new MessageEmbed()
      .setAuthor(
        `Trading | ${msg.author.tag} & ${tradeeUser.user.tag}`,
        msg.author.displayAvatarURL()
      )
      .setColor(`#FFAACC`)
      .setDescription(
        `\`\`\`` +
          `\n${msg.author.username}'s cards | ${tradeeUser.user.username}'s cards` +
          `\n${" ".repeat(spaceOnLeftSide)} | ` +
          `\n${" ".repeat(spaceOnLeftSide)} | ` +
          `\n${" ".repeat(spaceOnLeftSide)} | ` +
          `\n${" ".repeat(spaceOnLeftSide)} | ` +
          `\n${" ".repeat(spaceOnLeftSide)} | ` +
          `\n\`\`\`` +
          `\nFirst, list **up to five of your cards** you want to put in the trade.` +
          `\nWhen you're done, type "OK".`
      );
    msg.channel.send(panel);

    const firstFilter = (m: Message) => m.author.id === msg.author.id;

    const senderRefs = msg.channel.createMessageCollector(firstFilter, {
      time: 120000,
    });

    let senderCollected = 0;
    senderRefs.on("collect", async (m: Message) => {
      if (m.content.toLowerCase() === "ok") senderRefs.stop("ok");
      const reference = {
        identifier: m.content.split("#")[0],
        serial: parseInt(m.content.split("#")[1]),
      };
      if (!reference.serial || isNaN(reference.serial))
        throw new error.InvalidCardReferenceError();

      const card = await CardService.getCardDataFromReference(reference);
      msg.channel.send(card.member);
    });
    senderRefs.on("end", (collected, reason: string) => {});
    */
  }
}
