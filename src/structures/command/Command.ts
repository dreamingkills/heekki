import { Message } from "discord.js";
import { PlayerService } from "../../database/service/PlayerService";
import { Profile } from "../player/Profile";

export interface Command {
  names: string[];

  exec(msg: Message, executor: Profile): Promise<void>;

  hidden?: boolean;
  disabled?: boolean;
  roles?: string[];
  users?: string[];
  deletable?: boolean;
}

export abstract class BaseCommand implements Command {
  names: string[] = [];

  hidden: boolean = false;
  disabled: boolean = false;
  roles: string[] | undefined = undefined;
  users: string[] | undefined = undefined;
  deletable: boolean = false;

  options: string[] = [];

  abstract async exec(msg: Message, executor: Profile): Promise<void>;
  run: (msg: Message, executor: Profile) => Promise<void> = async (
    msg: Message,
    executor: Profile
  ) => {
    this.options = msg.content
      .split(" ")
      .slice(1)
      .filter((e) => e);
    return this.exec(msg, executor);
  };

  public parseMention: (query: string) => string = (query: string): string => {
    return query.replace(/[\\<>@#&!]/g, "");
  };
}
