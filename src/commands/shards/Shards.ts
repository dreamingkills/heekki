import { Message } from "discord.js";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["shards"];
  async exec(msg: Message, executor: Profile) {
    await msg.channel.send(
      `${
        this.config.discord.emoji.shard.full
      } You have **${executor.shards.toLocaleString()} shards**.`
    );
    return;
  }
}
