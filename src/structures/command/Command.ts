import { Message } from "discord.js";

export interface Command {
  names: string[];

  exec(msg: Message, prm: string[]): Promise<void>;

  hidden?: boolean;
  disabled?: boolean;
  role?: string;
  deletable?: boolean;
}

export abstract class BaseCommand implements Command {
  names: string[] = [];

  hidden: boolean = false;
  disabled: boolean = false;
  role: string | undefined = undefined;
  deletable: boolean = false;

  options: string[] = [];

  abstract async exec(msg: Message): Promise<void>;
  run: (msg: Message) => Promise<void> = async (msg: Message) => {
    this.options = msg.content
      .split(" ")
      .slice(1)
      .filter((e) => e);
    return this.exec(msg);
  };

  public parseMention: (query: string) => string = (query: string): string => {
    return query.replace(/[\\<>@#&!]/g, "");
  };
}
