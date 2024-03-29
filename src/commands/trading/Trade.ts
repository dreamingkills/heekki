import { Message, MessageEmbed, MessageReaction, User } from "discord.js";
import { CardService } from "../../database/service/CardService";
import { MarketService } from "../../database/service/MarketService";
import { PlayerService } from "../../database/service/PlayerService";
import { StatsService } from "../../database/service/StatsService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import { UserCard } from "../../structures/player/UserCard";
import * as error from "../../structures/Error";

export class Command extends BaseCommand {
  names: string[] = ["trade"];
  currentlyTrading: Set<string> = new Set<string>();

  async exec(msg: Message, executor: Profile) {
    if (this.currentlyTrading.has(msg.author.id))
      throw new error.InTradeError();

    const tradeeUser = msg.mentions.members?.first();
    if (!tradeeUser) throw new error.InvalidMemberError();
    if (tradeeUser.id === msg.author.id)
      throw new error.CannotTradeWithYourselfError();
    if (this.currentlyTrading.has(tradeeUser.id))
      throw new error.UserInTradeError();

    const prefix = this.bot.getPrefix(msg.guild!.id);
    const tradee = await PlayerService.getProfileByDiscordId(tradeeUser.id);

    this.currentlyTrading.add(msg.author.id);
    this.currentlyTrading.add(tradeeUser.id);
    const spaceOnLeftSide = msg.author.username.length + 8;

    const description = [
      `\n${" ".repeat(spaceOnLeftSide)} |`,
      `\n${" ".repeat(spaceOnLeftSide)} |`,
      `\n${" ".repeat(spaceOnLeftSide)} |`,
      `\n${" ".repeat(spaceOnLeftSide)} |`,
      `\n${" ".repeat(spaceOnLeftSide)} |`,
    ];
    const tradePanel = {
      header: `\n${msg.author.username}'s cards | ${tradeeUser.user.username}'s cards`,
      divider: `\n${"-".repeat(spaceOnLeftSide - 1)}: | :${"-".repeat(
        tradeeUser.user.username.length + 7
      )}`,
    };
    const panel = new MessageEmbed()
      .setAuthor(
        `Trading | ${msg.author.tag} & ${tradeeUser.user.tag}`,
        msg.author.displayAvatarURL()
      )
      .setColor(`#FFAACC`)
      .setDescription(
        `\`\`\`` +
          tradePanel.header +
          tradePanel.divider +
          description.join("") +
          `\n\`\`\`` +
          `\nFirst, list **up to five of your cards** you want to put in the trade.` +
          `\nWhen you're done, type "OK".`
      );
    const sent = await msg.channel.send(panel);

    const firstFilter = (m: Message) =>
      m.author.id === msg.author.id || m.author.id === tradeeUser.id;

    const senderCards: UserCard[] = [];
    const tradeeCards: UserCard[] = [];
    const collector = msg.channel.createMessageCollector(firstFilter, {
      time: 300000,
    });

    let senderCollected = 0;
    let tradeeCollected = 0;
    let submitter: "sender" | "tradee" = "sender";
    collector.on("collect", async (m: Message) => {
      if (sent.deleted) {
        collector.stop("deleted");
        this.currentlyTrading.delete(msg.author.id);
        this.currentlyTrading.delete(tradeeUser.id);
        return;
      }

      if (
        ((submitter === "sender" && m.author.id === msg.author.id) ||
          (submitter === "tradee" && m.author.id === tradeeUser.id)) &&
        !m.content.startsWith(prefix)
      ) {
        if (m.content.toLowerCase() === "ok") {
          if (submitter === "sender") {
            submitter = "tradee";
            await sent.edit(
              panel.setDescription(
                `\`\`\`` +
                  tradePanel.header +
                  tradePanel.divider +
                  description.join("") +
                  `\n\`\`\`` +
                  `\nNext, ${tradeeUser.user.username} should list **up to five of their cards** they want to put in the trade in **separate messages**.` +
                  `\nWhen you're done, type "OK".`
              )
            );
          } else {
            collector.stop("ok");
          }
        } else {
          const reference = {
            identifier: m.content.split("#")[0],
            serial: parseInt(m.content.split("#")[1]),
          };
          if (reference.serial && !isNaN(reference.serial)) {
            const id = submitter === "sender" ? msg.author.id : tradeeUser.id;
            try {
              const card = await CardService.getCardDataFromReference(
                reference
              );
              const traderEden = await PlayerService.getEden(executor);
              const tradeeEden = await PlayerService.getEden(tradee);

              const forSale = await MarketService.cardIsOnMarketplace(card);

              if (card.ownerId !== id) throw new error.NotYourCardError(card);
              if (
                CardService.cardInEden(card, traderEden) ||
                CardService.cardInEden(card, tradeeEden)
              )
                throw new error.CardInEdenError(card);
              if (card.isFavorite)
                throw new error.CardFavoritedError(card, prefix);
              if (forSale.forSale)
                throw new error.CardOnMarketplaceError(card, prefix);
              if (
                senderCards
                  .map((c) => {
                    return c.userCardId;
                  })
                  .indexOf(card.userCardId) > -1
              ) {
                await m.react(`741454361007357993`);
                await m.channel.send(
                  `<:red_x:741454361007357993> That card is already in the trade.`
                );
              } else {
                if (submitter === "sender") {
                  const refLength = (
                    card.abbreviation +
                    `#` +
                    card.serialNumber
                  ).length;
                  description.splice(
                    senderCollected,
                    1,
                    `\n${" ".repeat(spaceOnLeftSide - refLength)}${
                      card.abbreviation + `#` + card.serialNumber
                    } |`
                  );
                  senderCards.push(card);
                  senderCollected++;
                } else {
                  description.splice(
                    tradeeCollected,
                    1,
                    description[tradeeCollected] +
                      ` ${card.abbreviation + `#` + card.serialNumber}`
                  );
                  tradeeCards.push(card);
                  tradeeCollected++;
                }

                if (senderCollected === 5 && submitter === "sender") {
                  submitter = "tradee";
                }

                if (submitter === "tradee") {
                  await sent.edit(
                    panel.setDescription(
                      `\`\`\`` +
                        tradePanel.header +
                        tradePanel.divider +
                        description.join("") +
                        `\n\`\`\`` +
                        `\nNext, ${tradeeUser.user.username} should list **up to five of their cards** they want to put in the trade. Please use **one card per message**.` +
                        `\nWhen you're done, type "OK".`
                    )
                  );
                } else if (submitter === "sender") {
                  await sent.edit(
                    panel.setDescription(
                      `\`\`\`` +
                        tradePanel.header +
                        tradePanel.divider +
                        description.join("") +
                        `\n\`\`\`` +
                        `\nFirst, list **up to five of your cards** you want to put in the trade. Please use **one card per message**.` +
                        `\nWhen you're done, type "OK".`
                    )
                  );
                }
                if (tradeeCollected === 5) collector.stop("ok");

                if (this.permissions.MANAGE_MESSAGES) await m.delete();
              }
            } catch (e) {
              await msg.channel.send(
                `${this.bot.config.discord.emoji.cross.full} ${e.message}`
              );
            }
          }
        }
      }
    });

    collector.on("end", async (_, reason: string) => {
      if (reason === "time") {
        await sent.edit(
          panel.setDescription(
            `${this.bot.config.discord.emoji.cross.full} This trade has expired.`
          )
        );
        this.currentlyTrading.delete(msg.author.id);
        this.currentlyTrading.delete(tradeeUser.id);
        return;
      }
      if (reason === "ok") {
        await sent.edit(
          panel.setDescription(
            `\`\`\`` +
              tradePanel.header +
              tradePanel.divider +
              description
                .filter((d) => {
                  return d.includes("#");
                })
                .join("") +
              `\n\`\`\`` +
              `\nPlease review the trade and confirm it by clicking the ${this.bot.config.discord.emoji.check.full} reaction.`
          )
        );
        await sent.react(this.bot.config.discord.emoji.check.id);

        const rxnFilter = (r: MessageReaction, u: User) =>
          r.emoji.id === this.bot.config.discord.emoji.check.id &&
          (u.id === msg.author.id || u.id === tradeeUser.id);
        const conf = sent.createReactionCollector(rxnFilter, { time: 15000 });
        let [senderConfirmed, tradeeConfirmed] = [false, false];
        conf.on("collect", async (_: MessageReaction, u: User) => {
          if (u.id === msg.author.id) senderConfirmed = true;
          if (u.id === tradeeUser.id) tradeeConfirmed = true;

          if (senderConfirmed && tradeeConfirmed) {
            if (senderCards.length > 0)
              await CardService.transferCards(tradeeUser.id, senderCards);
            if (tradeeCards.length > 0)
              await CardService.transferCards(msg.author.id, tradeeCards);

            await StatsService.tradeComplete(executor, tradee);
            await sent.edit(
              panel.setDescription(
                `${this.bot.config.discord.emoji.check.full} Trade completed!`
              )
            );
            this.currentlyTrading.delete(msg.author.id);
            this.currentlyTrading.delete(tradeeUser.id);
            return conf.stop("ok");
          }
        });
        conf.on("end", async (_, reason: string) => {
          if (reason !== "time") return;
          this.currentlyTrading.delete(msg.author.id);
          this.currentlyTrading.delete(tradeeUser.id);
          await sent.edit(
            panel.setDescription(
              `${this.bot.config.discord.emoji.cross.full} This trade has expired.`
            )
          );
          if (this.permissions.MANAGE_MESSAGES) sent.reactions.removeAll();
        });
      }
    });
  }
}
