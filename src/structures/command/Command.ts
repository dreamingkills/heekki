import { RoleResolvable, Snowflake, Role, Message } from "discord.js";
import { Bot } from "../client/Bot";

export interface Command {
  names: string[];
  desc: string;
  usage: string[];
  category: string | undefined;

  exec(msg: Message, prm: string[]): Promise<void>;

  hidden?: boolean;
  disabled?: boolean;
  role?: string;
}

export abstract class BaseCommand implements Command {
  names: string[] = [];
  usage: string[] = [];
  desc: string = "No description was provided.";
  category: string = "Uncategorized";

  hidden: boolean = false;
  disabled: boolean = false;
  role: string | undefined = undefined;

  prm: string[] = [];

  abstract async exec(msg: Message): Promise<void>;

  async run(msg: Message): Promise<void> {
    await msg.channel.startTyping();
    this.prm = msg.content.split(" ").slice(1);
    await this.exec(msg);
    return msg.channel.stopTyping();
  }
}
