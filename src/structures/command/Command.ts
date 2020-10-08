import { Message } from "discord.js";
import { Profile } from "../player/Profile";

export interface Command {
  names: string[];

  exec(msg: Message, executor: Profile): Promise<void>;

  disabled?: boolean;
  roles?: string[];
  users?: string[];
}

export abstract class BaseCommand implements Command {
  names: string[] = [];

  disabled: boolean = false;
  roles?: string[];
  users?: string[];

  options: string[] = [];
  flags: { [key: string]: string } = {};

  abstract async exec(msg: Message, executor: Profile): Promise<void>;

  public async run(msg: Message, executor: Profile): Promise<void> {
    this.options = msg.content
      .split(" ")
      .slice(1)
      .filter((e) => e);
    return await this.exec(msg, executor);
  }

  public parseMention(query: string): string {
    return query.replace(/[\\<>@#&!]/g, "");
  }
}
