import { Message, MessageReaction, User } from "discord.js";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import * as error from "../../structures/Error";
import { PlayerService } from "../../database/service/PlayerService";
import { CardService } from "../../database/service/CardService";

export class Command extends BaseCommand {
  names: string[] = ["shards", "sh"];
  async exec(msg: Message, executor: Profile) {
    const subcommand = this.options[0]?.toLowerCase();
    if (subcommand === "give") {
      const amount = parseInt(this.options[1]);
      if (isNaN(amount) || amount < 1) throw new error.NotANumberError();
      if (executor.shards < amount) throw new error.NotEnoughShardsError();

      const user = msg.mentions.users.first();
      if (!user) throw new error.NoMentionedUserError();
      const receiver = await PlayerService.getProfileByDiscordId(user.id);

      const confirm = await msg.channel.send(
        `:warning: Really give ${this.config.discord.emoji.shard.full} **${amount}** to **${user.tag}`
      );
      await confirm.react(this.config.discord.emoji.check.id);

      const filter = (reaction: MessageReaction, user: User) =>
        reaction.emoji.id === this.config.discord.emoji.check.id &&
        user === msg.author;
      const collector = confirm.createReactionCollector(filter, {
        max: 1,
        time: 15000,
      });
      collector.on("collect", async () => {
        await PlayerService.removeShardsFromProfile(executor, amount);
        await PlayerService.addShardsToProfile(receiver, amount);

        await confirm.edit(
          `${this.config.discord.emoji.check.full} Sent ${this.config.discord.emoji.shard.full} **${amount}** to **${user.tag}**.`
        );
        return;
      });
      collector.on("end", async (_, reason) => {
        if (reason === "time") {
          await confirm.edit(
            `${this.config.discord.emoji.cross.full} Your transaction was cancelled.`
          );
        }
        return;
      });
      return;
    } else if (subcommand === "upgrade") {
      const reference = {
        identifier: this.options[1].split("#")[0],
        serial: parseInt(this.options[1].split("#")[1]),
      };
      if (isNaN(reference.serial)) throw new error.InvalidCardReferenceError();
      const card = await CardService.getCardDataFromReference(reference);

      if (card.ownerId !== msg.author.id)
        throw new error.NotYourCardError(reference);

      const amount = parseInt(this.options[2]);
      if (isNaN(amount) || amount < 1) throw new error.NotANumberError();
      if (executor.shards < amount) throw new error.NotEnoughShardsError();
    }
    await msg.channel.send(
      `${
        this.config.discord.emoji.shard.full
      } You have **${executor.shards.toLocaleString()} shards**.`
    );
    return;
  }
}
