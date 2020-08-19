import { CommandManager } from "../../helpers/Command";
import config from "../../../config.json";
import { Client, Message } from "discord.js";
import { User } from "../../entities/player/User";

export class Bot extends Client {
  public config: Object = config;
  public cmdMan: CommandManager = new CommandManager();

  public async init() {
    await this.cmdMan.init();

    this.on("ready", async () => {
      if (!this.user) return console.error("I'm null!");
      console.log(`Ready - ${await User.count()} users in database`);
    });
    this.on("message", async (msg: Message) => this.cmdMan.handle(msg));

    this.login(config.botToken);
  }
}
