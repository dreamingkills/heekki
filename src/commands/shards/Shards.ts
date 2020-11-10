import { Message } from "discord.js";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";

export class Command extends BaseCommand {
  names: string[] = ["shards"];
  async exec(_msg: Message, _executor: Profile) {}
}
