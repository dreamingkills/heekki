import { Message } from "discord.js";
import { Profile } from "../player/Profile";
import { Bot } from "../client/Bot";

export interface Command {
  names: string[];
  description: string;
  subcommands: string[];

  exec(msg: Message, executor: Profile): Promise<void>;

  disabled?: boolean;
  roles?: string[];
  users?: string[];
}

export abstract class BaseCommand implements Command {
  names: string[] = [];
  description: string = "No information provided.";
  subcommands: string[] = [];

  disabled: boolean = false;
  roles?: string[];
  users?: string[];

  options: string[] = [];
  permissions!: {
    SEND_MESSAGES: boolean;
    MANAGE_MESSAGES: boolean;
    ADD_REACTIONS: boolean;
    USE_EXTERNAL_EMOJI: boolean;
  };
  flags: { [key: string]: string } = {};
  bot!: Bot;

  abstract exec(msg: Message, executor: Profile): Promise<void>;

  public async run(msg: Message, executor: Profile, bot: Bot): Promise<void> {
    this.bot = bot;

    this.options = msg.content
      .split(" ")
      .slice(1)
      .filter((e) => e);
    this.permissions = {
      SEND_MESSAGES: msg.guild
        ?.member(msg.client.user!)
        ?.hasPermission("SEND_MESSAGES")!,
      MANAGE_MESSAGES: msg.guild
        ?.member(msg.client.user!)
        ?.hasPermission("MANAGE_MESSAGES")!,
      ADD_REACTIONS: msg.guild
        ?.member(msg.client.user!)
        ?.hasPermission("ADD_REACTIONS")!,
      USE_EXTERNAL_EMOJI: msg.guild
        ?.member(msg.client.user!)
        ?.hasPermission("USE_EXTERNAL_EMOJIS")!,
    };

    return await this.exec(msg, executor);
  }

  public parseMention(query: string): string {
    return query.replace(/[\\<>@#&!]/g, "");
  }

  public emojis: { [key: string]: string } = {
    HeeJin: ":rabbit:",
    HyunJin: ":cat:",
    HaSeul: ":dove:",
    YeoJin: ":frog:",
    Vivi: ":deer:",
    "Kim Lip": ":owl:",
    JinSoul: ":fish:",
    Choerry: ":bat:",
    Yves: ":swan:",
    Chuu: ":penguin:",
    "Go Won": ":butterfly:",
    "Olivia Hye": ":wolf:",
  };
}
