import { Message } from "discord.js";

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
  run: (msg: Message) => Promise<void> = async (msg: Message) => {
    this.prm = msg.content
      .split(" ")
      .slice(1)
      .filter((e) => e);
    return this.exec(msg);
  };
}
