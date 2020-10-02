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
  flags: { [key: string]: string } = {};

  abstract async exec(msg: Message, executor: Profile): Promise<void>;
  run = async (msg: Message, executor: Profile): Promise<void> => {
    this.options = msg.content
      .split(" ")
      .slice(1)
      .filter((e) => e);
    return this.exec(msg, executor);
  };

  public parseMention: (query: string) => string = (query: string): string => {
    return query.replace(/[\\<>@#&!]/g, "");
  };
  public commafyNumber(num: number) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}
