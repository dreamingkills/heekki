import { Message, MessageEmbed, MessageReaction, User } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["fish"];
  async exec(msg: Message, executor: Profile) {
    if (this.options[0]?.toLowerCase() === "sell") {
      const fish = await PlayerService.getFishByProfile(executor);
      if (fish.length === 0) {
        msg.channel.send(
          `<:red_x:741454361007357993> You don't have any fish.`
        );
        return;
      }
      let totalPrice = 0;
      fish.map((f) => {
        totalPrice += f.price;
      });

      const conf = await msg.channel.send(
        `:warning: Are you sure you want to sell **all** of your fish?\nYou will receive <:cash:757146832639098930> **${totalPrice}**. React with :white_check_mark: to confirm.`
      );
      conf.react("✅");
      let filter = (reaction: MessageReaction, user: User) => {
        return reaction.emoji.name == "✅" && user.id == msg.author.id;
      };
      let reactions = await conf.awaitReactions(filter, {
        max: 1,
        time: 10000,
      });
      let rxn = reactions.first();

      if (rxn) {
        await PlayerService.clearFish(executor);
        await PlayerService.addCoinsToProfile(executor, totalPrice);
        conf.edit(
          `:white_check_mark: Sold **${
            fish.length
          }** fish on the market.\n+ <:cash:757146832639098930> **${this.commafyNumber(
            totalPrice
          )}**`
        );
      } else {
        conf.edit(
          `<:red_x:741454361007357993> You did not react in time, so the transaction has been cancelled.`
        );
      }
      conf.reactions.removeAll();
      return;
    }
    if (this.options[0]?.toLowerCase() === "trophies") {
      const trophyFish = await PlayerService.getFishByProfile(executor, true);

      const embed = new MessageEmbed()
        .setAuthor(
          `Trophy Fish | ${msg.author.tag}`,
          msg.author.displayAvatarURL()
        )
        .setDescription(
          `:trophy: **Trophy Fish** cannot be sold or removed.\n\n` +
            trophyFish
              .map((t) => {
                return `\`${t.identifier}\` :${t.emoji}: ${t.name} (**${t.weight}kg**)`;
              })
              .join("\n")
        )
        .setThumbnail(msg.author.displayAvatarURL())
        .setColor(`#FFAACC`);
      if (trophyFish.length === 0)
        embed.setDescription(
          `:trophy: You have no **Trophy Fish**.\nTo turn a fish into a trophy, use \`!fish trophy <fish id>\`.\nTurning a fish into a Trophy costs <:cash:757146832639098930> **10,000**.`
        );
      msg.channel.send(embed);
      return;
    }
    if (this.options[0]?.toLowerCase() === "trophy") {
      if (executor.coins < 10000) {
        msg.channel.send(
          `<:red_x:741454361007357993> You don't have enough coins to do that.`
        );
        return;
      }
      const fishId = this.options[1];
      if (!fishId) {
        msg.channel.send(
          `<:red_x:741454361007357993> Please specify a fish to trophy.`
        );
        return;
      }
      const fish = await PlayerService.getFishByUniqueId(fishId);
      if (fish.owner !== msg.author.id) {
        msg.channel.send(
          `<:red_x:741454361007357993> That fish doesn't belong to you.`
        );
        return;
      }

      const conf = await msg.channel.send(
        `:warning: Are you sure you want to turn your **${(
          fish.modName +
          " " +
          fish.name
        ).trim()}** into a Trophy?\nThis costs <:cash:757146832639098930> **10,000** and is **irreversible**. React with :white_check_mark: to confirm.`
      );
      conf.react("✅");
      let filter = (reaction: MessageReaction, user: User) => {
        return reaction.emoji.name == "✅" && user.id == msg.author.id;
      };
      let reactions = await conf.awaitReactions(filter, {
        max: 1,
        time: 10000,
      });
      let rxn = reactions.first();

      if (rxn) {
        await PlayerService.removeCoinsFromProfile(executor, 10000);
        await PlayerService.makeFishTrophy(fish.identifier);
        conf.edit(
          `:white_check_mark: Your **${(
            fish.modName +
            " " +
            fish.name
          ).trim()}** was turned into a trophy.`
        );
      } else {
        conf.edit(
          `<:red_x:741454361007357993> You did not react in time, so the purchase has been cancelled.`
        );
      }
      conf.reactions.removeAll();
      return;
    }
    const fishRaw = await PlayerService.getFishByProfile(executor);
    const fishEmbed = new MessageEmbed()
      .setAuthor(`Fish | ${msg.author.tag}`, msg.author.displayAvatarURL())
      .setColor(`#FFAACC`)
      .setThumbnail(msg.author.displayAvatarURL())
      .setDescription(
        fishRaw
          .map((fishy) => {
            return `\`${fishy.identifier}\` :${fishy.emoji}: ${
              fishy.modName !== "" ? `**${fishy.modName}**` : ``
            } ${fishy.name} (**${fishy.weight.toFixed(
              2
            )}kg**, <:cash:757146832639098930> **${fishy.price}**)`;
          })
          .join("\n") + `\n\nTo sell your fish, use \`!fish sell\`!`
      );

    if (fishRaw.length === 0)
      fishEmbed.setDescription(
        `:fish: You have no fish.\nTo begin fishing, use \`!fishing\`.`
      );

    await msg.channel.send(fishEmbed);
  }
}
